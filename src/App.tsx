import { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ComparisonDashboard } from './components/ComparisonDashboard';
import { analyzeResume, compareResumes, ResumeAnalysis, ResumeComparison } from './services/analysisService';
import { History, RefreshCw, Github, Scale, FileText, Layout, FileSearch, BarChart3, Heart, Coffee, ShieldCheck, AlertCircle, X, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * Job-saathi: A human-centric resume companion.
 */

type Mode = 'analyze' | 'compare';

interface HistoryItem {
  id: string;
  timestamp: number;
  mode: Mode;
  data: ResumeAnalysis | ResumeComparison;
}

export default function App() {
  const [mode, setMode] = useState<Mode>('analyze');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [comparison, setComparison] = useState<ResumeComparison | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('job-saathi-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history to localStorage
  const addToHistory = (mode: Mode, data: ResumeAnalysis | ResumeComparison) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      mode,
      data
    };
    const updatedHistory = [newItem, ...history].slice(0, 10); // Keep last 10
    setHistory(updatedHistory);
    localStorage.setItem('job-saathi-history', JSON.stringify(updatedHistory));
  };

  const [resume1, setResume1] = useState<string | null>(null);
  const [resume2, setResume2] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const handleSingleAnalysis = async () => {
    if (!extractedText) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeResume(extractedText);
      setAnalysis(result);
      addToHistory('analyze', result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while reading your resume.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCompare = async () => {
    if (!resume1 || !resume2) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await compareResumes(resume1, resume2);
      setComparison(result);
      addToHistory('compare', result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We ran into a bit of trouble comparing those resumes.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setComparison(null);
    setResume1(null);
    setResume2(null);
    setExtractedText(null);
    setError(null);
    setResetKey(prev => prev + 1);
    setShowHistory(false);
  };

  const loadFromHistory = (item: HistoryItem) => {
    reset();
    if (item.mode === 'analyze') {
      setAnalysis(item.data as ResumeAnalysis);
      setMode('analyze');
    } else {
      setComparison(item.data as ResumeComparison);
      setMode('compare');
    }
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Friendly Header */}
      <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={reset}>
            <div className="w-10 h-10 bg-[#d4a373] rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:rotate-6 transition-transform">
              <Compass size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">Job-saathi</h1>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">Your Career Companion</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center bg-gray-50 p-1 rounded-2xl border border-gray-100">
            <button
              onClick={() => { setMode('analyze'); reset(); }}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                mode === 'analyze' 
                ? 'bg-white text-[#d4a373] shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FileSearch size={16} />
              Insights
            </button>
            <button
              onClick={() => { setMode('compare'); reset(); }}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                mode === 'compare' 
                ? 'bg-white text-[#d4a373] shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <BarChart3 size={16} />
              Comparison
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "p-2.5 transition-colors rounded-xl",
                showHistory ? "bg-[#d4a373]/10 text-[#d4a373]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              )}
              aria-label="View History"
            >
              <History size={20} />
            </button>
          </div>
        </div>

        {/* History Dropdown */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-4 mt-2 w-80 bg-white border border-gray-100 shadow-2xl rounded-3xl overflow-hidden z-50"
            >
              <div className="p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Recent Analyses</h3>
                {history.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No history yet. Start analyzing!</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => loadFromHistory(item)}
                        className="w-full text-left p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#d4a373] transition-colors">
                            {item.mode === 'analyze' ? <FileSearch size={14} /> : <Scale size={14} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {item.mode === 'analyze' ? 'Resume Insight' : 'Comparison'}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">
                              {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <AnimatePresence mode="wait">
          {!analysis && !comparison ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-black text-gray-900 tracking-tight mb-6 leading-[1.1]">
                  Let's find your <br /><span className="text-[#d4a373] italic">next big thing.</span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed px-4">
                  We'll help you understand how your resume looks to others and give you gentle nudges in the right direction.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-start gap-4 text-rose-800 shadow-sm relative group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                    <AlertCircle size={20} />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-sm uppercase tracking-widest mb-1">A small hiccup</h4>
                    <p className="text-sm font-medium opacity-80">{error}</p>
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="p-2 hover:bg-rose-100 rounded-xl transition-colors text-rose-400"
                  >
                    <X size={20} />
                  </button>
                </motion.div>
              )}

              <div className="relative">
                {mode === 'analyze' ? (
                  <div className="space-y-8">
                    <FileUpload key={`single-upload-${resetKey}`} onTextExtracted={(text) => setExtractedText(text)} isAnalyzing={isAnalyzing} />
                    {extractedText && !analysis && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center"
                      >
                        <button
                          onClick={handleSingleAnalysis}
                          disabled={isAnalyzing}
                          className="group relative px-12 py-5 bg-[#1a1c1e] text-white rounded-[2rem] font-bold text-lg hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 overflow-hidden"
                        >
                          <span className="relative flex items-center gap-3">
                            {isAnalyzing ? <RefreshCw className="animate-spin" /> : <FileSearch />}
                            {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
                          </span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-[0.2em]">First Resume</h3>
                        {resume1 && <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Ready to go</span>}
                      </div>
                      <FileUpload key={`compare-upload-1-${resetKey}`} onTextExtracted={(text) => setResume1(text)} isAnalyzing={isAnalyzing} />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-[0.2em]">Second Resume</h3>
                        {resume2 && <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Ready to go</span>}
                      </div>
                      <FileUpload key={`compare-upload-2-${resetKey}`} onTextExtracted={(text) => setResume2(text)} isAnalyzing={isAnalyzing} />
                    </div>
                    {resume1 && resume2 && (
                      <div className="md:col-span-2 pt-8 flex justify-center">
                        <button
                          onClick={handleCompare}
                          disabled={isAnalyzing}
                          className="group relative px-12 py-5 bg-[#1a1c1e] text-white rounded-[2rem] font-bold text-lg hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 overflow-hidden"
                        >
                          <span className="relative flex items-center gap-3">
                            {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Scale />}
                            {isAnalyzing ? 'Analyzing...' : 'Compare them now'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={reset}
                  className="flex items-center gap-3 px-5 py-2.5 text-gray-500 hover:text-gray-900 font-bold transition-all group bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md active:scale-95"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-[#d4a373]/10 group-hover:text-[#d4a373] transition-colors">
                    <Layout size={16} />
                  </div>
                  Start over
                </button>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-emerald-100 shadow-sm">
                    <ShieldCheck size={14} />
                    Hand-checked
                  </div>
                </div>
              </div>

              <ErrorBoundary>
                {analysis && <AnalysisDashboard data={analysis} />}
                {comparison && <ComparisonDashboard data={comparison} />}
              </ErrorBoundary>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-gray-100 bg-white/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1a1c1e] rounded-lg flex items-center justify-center text-white">
                <Compass size={16} />
              </div>
              <span className="text-sm font-bold text-gray-900 tracking-tight">Job-saathi</span>
            </div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              Created by Atharva Raghuvanshi
            </p>
            <div className="flex items-center gap-6">
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
