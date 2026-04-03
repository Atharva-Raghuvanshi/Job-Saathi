import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ComparisonDashboard } from './components/ComparisonDashboard';
import { analyzeResume, compareResumes, ResumeAnalysis, ResumeComparison } from './services/geminiService';
import { Sparkles, History, RefreshCw, Github, Scale, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Sparkles size={24} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">Job-saathi</span>
          </div>
          
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => { setMode('analyze'); reset(); }}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                mode === 'analyze' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Analyze
            </button>
            <button
              onClick={() => { setMode('compare'); reset(); }}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                mode === 'compare' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Compare
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              <History size={18} />
              History
            </button>
            <a 
              href="#" 
              className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {!analysis && !comparison ? (
            <motion.div
              key="upload-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto text-center space-y-12"
            >
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
                  {mode === 'analyze' ? (
                    <>Your AI Career <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Companion.</span></>
                  ) : (
                    <>Compare Your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-600">Resumes.</span></>
                  )}
                </h1>
                <p className="text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
                  {mode === 'analyze' 
                    ? "Upload your resume and let our AI analyze your strengths and calculate your ATS score."
                    : "Upload two resumes to compare their ATS scores, skill profiles, and overall quality side-by-side."}
                </p>
              </div>

              {mode === 'analyze' ? (
                <FileUpload key={`single-upload-${resetKey}`} onTextExtracted={handleSingleAnalysis} isAnalyzing={isAnalyzing} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest">Resume 1</h3>
                    <FileUpload key={`compare-upload-1-${resetKey}`} onTextExtracted={(text) => setResume1(text)} isAnalyzing={isAnalyzing} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest">Resume 2</h3>
                    <FileUpload key={`compare-upload-2-${resetKey}`} onTextExtracted={(text) => setResume2(text)} isAnalyzing={isAnalyzing} />
                  </div>
                  {resume1 && resume2 && (
                    <div className="md:col-span-2 pt-8">
                      <button
                        onClick={handleCompare}
                        disabled={isAnalyzing}
                        className="w-full max-w-md mx-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <RefreshCw className="animate-spin" size={24} />
                        ) : (
                          <Scale size={24} />
                        )}
                        {isAnalyzing ? "Analyzing Comparison..." : "Compare Now"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-medium">
                  {error}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">
                    {analysis ? "Analysis Results" : "Comparison Results"}
                  </h2>
                  <p className="text-slate-500">
                    {analysis ? "Comprehensive breakdown of your professional profile" : "Side-by-side evaluation of your uploaded resumes"}
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                  <RefreshCw size={18} />
                  {analysis ? "Analyze New" : "Compare New"}
                </button>
              </div>

              {analysis && <AnalysisDashboard data={analysis} />}
              {comparison && <ComparisonDashboard data={comparison} />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 grayscale opacity-50">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white text-[10px] font-bold">JS</div>
            <span className="font-bold text-slate-900">Job-saathi</span>
          </div>
          <p className="text-sm text-slate-400">
            &copy; 2026 Job-saathi AI. Empowering careers through intelligent analysis.
          </p>
        </div>
      </footer>
    </div>
  );
}
