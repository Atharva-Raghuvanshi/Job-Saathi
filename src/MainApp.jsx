import { useState, useEffect } from "react";
import { FileUpload } from "./ui/FileUpload";
import { AnalysisDashboard } from "./ui/AnalysisDashboard";
import { ComparisonDashboard } from "./ui/ComparisonDashboard";
import { analyzeResume, compareResumes } from "./core/analysisService";
import {
  History,
  RefreshCw,
  Scale,
  Layout,
  FileSearch,
  BarChart3,
  ShieldCheck,
  AlertCircle,
  X,
  Compass,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { ErrorBoundary } from "./ui/ErrorBoundary";

export default function App() {
  const [mode, setMode] = useState("analyze");
  const [analysis, setAnalysis] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("job-saathi-history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history to localStorage
  const addToHistory = (mode, data) => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      mode,
      data,
    };
    const updatedHistory = [newItem, ...history].slice(0, 10); // Keep last 10
    setHistory(updatedHistory);
    localStorage.setItem("job-saathi-history", JSON.stringify(updatedHistory));
  };

  const [resume1, setResume1] = useState(null);
  const [resume2, setResume2] = useState(null);
  const [extractedText, setExtractedText] = useState(null);

  const handleSingleAnalysis = async () => {
    if (!extractedText) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeResume(extractedText);
      setAnalysis(result);
      addToHistory("analyze", result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while reading your resume.",
      );
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
      addToHistory("compare", result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We ran into a bit of trouble comparing those resumes.",
      );
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
    setResetKey((prev) => prev + 1);
    setShowHistory(false);
  };

  const loadFromHistory = (item) => {
    reset();
    if (item.mode === "analyze") {
      setAnalysis(item.data);
      setMode("analyze");
    } else {
      setComparison(item.data);
      setMode("compare");
    }
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-200">
      {/* High-Tech Sticky Taskbar Header */}
      <header className="sticky top-0 z-50 bg-tech-card/90 backdrop-blur-md border-b border-tech-border text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 group cursor-pointer"
            onClick={reset}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-neon-cyan to-neon-violet rounded-xl flex items-center justify-center text-[#070a13] shadow-[0_0_15px_rgba(0,243,255,0.3)] group-hover:scale-105 transition-transform duration-300">
              <Compass size={22} className="animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider leading-none text-white font-serif">
                JOB-SAATHI
              </h1>
            </div>
          </div>

          {/* Core Navigation Bar formatted like a high-density LinkedIn widget */}
          <nav className="hidden md:flex items-center bg-[#070a13]/80 p-1 rounded-xl border border-tech-border">
            <button
              onClick={() => {
                setMode("analyze");
                reset();
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-mono tracking-wider transition-all duration-300 pointer cursor-pointer ${
                mode === "analyze"
                  ? "bg-gradient-to-r from-neon-cyan/15 to-neon-cyan/5 text-neon-cyan border border-neon-cyan/45 shadow-[0_0_15px_rgba(0,243,255,0.1)]"
                  : "text-slate-400 hover:text-neon-cyan border border-transparent"
              }`}
            >
              <FileSearch size={14} />
              RESUME ANALYZER
            </button>
            <button
              onClick={() => {
                setMode("compare");
                reset();
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-mono tracking-wider transition-all duration-300 pointer cursor-pointer ${
                mode === "compare"
                  ? "bg-gradient-to-r from-neon-cyan/15 to-neon-cyan/5 text-neon-cyan border border-neon-cyan/45 shadow-[0_0_15px_rgba(0,243,255,0.1)]"
                  : "text-slate-400 hover:text-neon-cyan border border-transparent"
              }`}
            >
              <BarChart3 size={14} />
              RESUME COMPARE
            </button>
          </nav>

          {/* Action Hub */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "p-2.5 transition-all rounded-xl border flex items-center justify-center cursor-pointer",
                showHistory
                  ? "bg-neon-cyan/10 border-neon-cyan/40 text-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.15)]"
                  : "border-tech-border text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/30 bg-slate-900/60",
              )}
              aria-label="View History"
            >
              <History size={18} />
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
              className="absolute top-full right-4 mt-2 w-80 bg-tech-card border border-tech-border shadow-2xl rounded-2xl overflow-hidden z-50"
            >
              <div className="p-5 font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                    PAST ANALYSES
                  </span>
                  <span className="text-[9px] bg-slate-900 border border-tech-border text-neon-emerald px-1.5 py-0.5 rounded uppercase">
                    History Active
                  </span>
                </div>
                {history.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">
                    No previous analyses found.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => loadFromHistory(item)}
                        className="w-full text-left p-3 rounded-lg bg-slate-950/80 border border-tech-border hover:border-neon-cyan/40 hover:bg-slate-900 transition-colors group flex items-center gap-3 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded bg-slate-900 border border-tech-border flex items-center justify-center text-slate-500 group-hover:text-neon-cyan group-hover:border-neon-cyan/30 transition-colors">
                          {item.mode === "analyze" ? (
                            <FileSearch size={14} />
                          ) : (
                            <Scale size={14} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                            {item.mode === "analyze"
                              ? "RESUME ANALYSIS"
                              : "RESUME COMPARISON"}
                          </p>
                          <p className="text-[9px] text-slate-500 mt-0.5">
                            {new Date(item.timestamp).toLocaleDateString()} //{" "}
                            {new Date(item.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
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

      {/* Main Context container */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!analysis && !comparison ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto w-full"
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0d1324] border border-tech-border rounded-full text-[10px] tracking-widest text-[#00f3ff] mb-6 shadow-[0_0_15px_rgba(0,243,255,0.08)] font-bold uppercase">
                  <Zap size={10} className="text-neon-cyan animate-pulse" />
                  AI-POWERED INSIGHTS ACTIVE
                </div>

                <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black text-white tracking-tight mb-4 leading-tight">
                  Let's find your <br />
                  <span className="bg-gradient-to-r from-neon-cyan via-[#0dfc90] to-[#b400ff] bg-clip-text text-transparent font-black filter drop-shadow-[0_0_10px_rgba(0,243,255,0.15)] animate-pulse">
                    next big venture.
                  </span>
                </h2>

                <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto tracking-wide leading-relaxed px-4">
                  Upload your resume to evaluate compatibility, map key skill
                  strengths and gaps, and receive instant recommendations to
                  accelerate your professional path.
                </p>
              </div>

              {/* Error messages wrapper with futuristic red banner */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 p-5 bg-neon-pink/10 border border-neon-pink/20 rounded-2xl flex items-start gap-4 text-neon-pink shadow-lg"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-neon-pink/30 flex items-center justify-center text-neon-pink shadow-inner shrink-0">
                    <AlertCircle size={20} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-mono font-black text-xs uppercase tracking-widest mb-1">
                      ANALYSIS ERROR
                    </h4>
                    <p className="text-sm font-medium text-slate-200">
                      {error}
                    </p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="p-1.5 hover:bg-neon-pink/20 rounded-xl transition-all text-neon-pink cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </motion.div>
              )}

              {/* Form trigger panels */}
              <div className="relative">
                {mode === "analyze" ? (
                  <div className="space-y-6">
                    <FileUpload
                      key={`single-upload-${resetKey}`}
                      onTextExtracted={(text) => setExtractedText(text)}
                      isAnalyzing={isAnalyzing}
                    />
                    {extractedText && !analysis && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center"
                      >
                        <button
                          onClick={handleSingleAnalysis}
                          disabled={isAnalyzing}
                          className="group relative px-10 py-4 bg-gradient-to-r from-neon-cyan to-neon-violet hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] text-[#070a13] font-serif font-black rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 overflow-hidden cursor-pointer text-base uppercase"
                        >
                          <span className="relative flex items-center gap-2.5">
                            {isAnalyzing ? (
                              <RefreshCw className="animate-spin" />
                            ) : (
                              <FileSearch size={18} />
                            )}
                            {isAnalyzing
                              ? "COMPILING_DATA..."
                              : "RUN_ANALYZER_PROBE"}
                          </span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-3">
                        <h3 className="text-[10px] font-mono font-extrabold uppercase text-slate-500 tracking-[0.2em]">
                          [ SOURCE_ALPHA ]
                        </h3>
                        {resume1 && (
                          <span className="text-[9px] font-mono font-bold text-neon-emerald bg-neon-emerald/10 border border-neon-emerald/30 px-2 py-0.5 rounded tracking-widest uppercase">
                            READY_FLOW
                          </span>
                        )}
                      </div>
                      <FileUpload
                        key={`compare-upload-1-${resetKey}`}
                        onTextExtracted={(text) => setResume1(text)}
                        isAnalyzing={isAnalyzing}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-3">
                        <h3 className="text-[10px] font-mono font-extrabold uppercase text-slate-500 tracking-[0.2em]">
                          [ SOURCE_BETA ]
                        </h3>
                        {resume2 && (
                          <span className="text-[9px] font-mono font-bold text-neon-emerald bg-neon-emerald/10 border border-neon-emerald/30 px-2 py-0.5 rounded tracking-widest uppercase">
                            READY_FLOW
                          </span>
                        )}
                      </div>
                      <FileUpload
                        key={`compare-upload-2-${resetKey}`}
                        onTextExtracted={(text) => setResume2(text)}
                        isAnalyzing={isAnalyzing}
                      />
                    </div>
                    {resume1 && resume2 && (
                      <div className="md:col-span-2 pt-6 flex justify-center">
                        <button
                          onClick={handleCompare}
                          disabled={isAnalyzing}
                          className="group relative px-10 py-4 bg-gradient-to-r from-neon-cyan to-neon-violet hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] text-[#070a13] font-serif font-black rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 overflow-hidden cursor-pointer text-base uppercase"
                        >
                          <span className="relative flex items-center gap-2.5">
                            {isAnalyzing ? (
                              <RefreshCw className="animate-spin" />
                            ) : (
                              <Scale size={18} />
                            )}
                            {isAnalyzing
                              ? "DEVIATION_SCANNING..."
                              : "COMPARE_RESUMES_PROBE"}
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
              className="space-y-6"
            >
              <div className="flex items-center justify-between font-mono text-xs">
                <button
                  onClick={reset}
                  className="flex items-center gap-3 px-4 py-2 bg-slate-900 border border-tech-border rounded-xl text-slate-300 hover:text-neon-cyan hover:border-neon-cyan/45 hover:shadow-[0_0_15px_rgba(0,243,255,0.1)] transition-all cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-neon-cyan transition-colors">
                    <Layout size={14} />
                  </div>
                  DISCONNECT_SIMULATION
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-emerald/15 text-neon-emerald rounded-lg text-[9px] font-bold uppercase tracking-widest border border-neon-emerald/30 shadow-inner">
                    <ShieldCheck size={12} />
                    LOCAL_INTEGRITY_INDEX_OK
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

      {/* Sleek, simple custom footer styled in beautiful cursive signature */}
      <footer className="py-12 text-center border-t border-tech-border/30">
        <p className="font-cursive text-2xl text-slate-400 hover:text-neon-cyan transition-colors duration-500 cursor-default select-none">
          Created by Atharva Raghuvanshi
        </p>
      </footer>
    </div>
  );
}
