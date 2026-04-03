import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ComparisonDashboard } from './components/ComparisonDashboard';
import { analyzeResume, compareResumes, ResumeAnalysis, ResumeComparison } from './services/geminiService';
import { Sparkles, History, RefreshCw, Github, Scale, FileText, Layout, FileSearch, BarChart3, Terminal, Cpu, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { ErrorBoundary } from './components/ErrorBoundary';

type Mode = 'analyze' | 'compare';

export default function App() {
  const [mode, setMode] = useState<Mode>('analyze');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [comparison, setComparison] = useState<ResumeComparison | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  // Comparison state
  const [resume1, setResume1] = useState<string | null>(null);
  const [resume2, setResume2] = useState<string | null>(null);

  const handleSingleAnalysis = async (text: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeResume(text);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setComparison(null);
    setResume1(null);
    setResume2(null);
    setError(null);
    setResetKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Technical Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={reset}>
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform">
              <Cpu size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">Job-saathi</h1>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-1">AI_RESUME_ENGINE_v2.4</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => { setMode('analyze'); reset(); }}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                mode === 'analyze' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileSearch size={16} />
              Analyze
            </button>
            <button
              onClick={() => { setMode('compare'); reset(); }}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                mode === 'compare' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BarChart3 size={16} />
              Compare
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors">
              <History size={20} />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center gap-2">
              <ShieldCheck size={16} />
              Pro Access
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <AnimatePresence mode="wait">
          {!analysis && !comparison ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-16">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-blue-100"
                >
                  <Terminal size={14} />
                  Next-Gen Intelligence
                </motion.div>
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6 leading-[1.1]">
                  Precision <span className="text-blue-600">Resume</span> <br />
                  Intelligence.
                </h2>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                  Leverage advanced neural analysis to decode ATS compatibility, skill matrices, and career trajectories in seconds.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-start gap-4 text-rose-800 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-widest mb-1">System Error</h4>
                    <p className="text-sm font-medium opacity-80">{error}</p>
                  </div>
                </motion.div>
              )}

              <div className="relative">
                <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full -z-10" />
                
                {mode === 'analyze' ? (
                  <FileUpload key={`single-upload-${resetKey}`} onTextExtracted={handleSingleAnalysis} isAnalyzing={isAnalyzing} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Source_Node_01</h3>
                        {resume1 && <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-widest">Ready</span>}
                      </div>
                      <FileUpload key={`compare-upload-1-${resetKey}`} onTextExtracted={(text) => setResume1(text)} isAnalyzing={isAnalyzing} />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Source_Node_02</h3>
                        {resume2 && <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-widest">Ready</span>}
                      </div>
                      <FileUpload key={`compare-upload-2-${resetKey}`} onTextExtracted={(text) => setResume2(text)} isAnalyzing={isAnalyzing} />
                    </div>
                    {resume1 && resume2 && (
                      <div className="md:col-span-2 pt-8 flex justify-center">
                        <button
                          onClick={handleCompare}
                          disabled={isAnalyzing}
                          className="group relative px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-slate-800 transition-all shadow-2xl active:scale-95 disabled:opacity-50 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="relative flex items-center gap-3">
                            {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                            {isAnalyzing ? 'Processing Matrix...' : 'Initialize Comparison'}
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
              <div className="flex items-center justify-between no-print">
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-900 font-bold transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                    <Layout size={16} />
                  </div>
                  New Analysis
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                  <ShieldCheck size={14} />
                  Verified Report
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

      <footer className="border-t border-slate-200 bg-white py-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                <Cpu size={16} />
              </div>
              <span className="text-sm font-black text-slate-900 tracking-tighter">Job-saathi</span>
            </div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              © 2026 Neural_Core_Systems. All Rights Reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">Privacy_Protocol</a>
              <a href="#" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">Terms_of_Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
