import React, { useRef, useState } from 'react';
import { ResumeComparison } from '@/src/services/geminiService';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Trophy, ArrowRight, CheckCircle2, AlertCircle, Sparkles, Scale, Download, FileText, Share2, Loader2 } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ComparisonDashboardProps {
  data: ResumeComparison;
}

export const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({ data }) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50/50 border-emerald-100';
    if (score >= 60) return 'bg-blue-50/50 border-blue-100';
    if (score >= 40) return 'bg-amber-50/50 border-amber-100';
    return 'bg-rose-50/50 border-rose-100';
  };

  const handleDownload = async () => {
    if (!dashboardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Job-saathi-Comparison-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Combine skills for radar chart
  const allSkills = Array.from(new Set([
    ...(data?.resume1?.strengths || []).map(s => s.name),
    ...(data?.resume2?.strengths || []).map(s => s.name)
  ])).slice(0, 6);

  const radarData = allSkills.map(skill => {
    const s1 = (data?.resume1?.strengths || []).find(s => s.name === skill)?.score || 
               (data?.resume1?.weaknesses || []).find(w => w.name === skill)?.score || 0;
    const s2 = (data?.resume2?.strengths || []).find(s => s.name === skill)?.score || 
               (data?.resume2?.weaknesses || []).find(w => w.name === skill)?.score || 0;
    return {
      subject: skill,
      A: s1,
      B: s2,
      fullMark: 100,
    };
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 pb-20 px-4 sm:px-6" ref={dashboardRef}>
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-200">
            <Scale size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Comparison Report</h2>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">MODE: DIFF_ENGINE_v2</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isDownloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Comparison Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Resume 1 Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "p-8 rounded-[2.5rem] border shadow-sm text-center relative overflow-hidden tech-card",
            getScoreBg(data.resume1.atsScore),
            data.winner === 1 && "ring-4 ring-blue-500 ring-offset-4"
          )}
        >
          <div className="scanline" />
          {data.winner === 1 && (
            <div className="absolute top-6 right-6 text-blue-600">
              <Trophy size={28} />
            </div>
          )}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Candidate Alpha</p>
          <div className={cn("text-6xl font-black mb-2 tracking-tighter font-mono", getScoreColor(data.resume1.atsScore))}>
            {data.resume1.atsScore}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ATS Compatibility</p>
        </motion.div>

        {/* Comparison Badge */}
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white shadow-2xl relative">
            <Scale size={36} />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-4 border-slate-50 flex items-center justify-center text-[10px] font-black">VS</div>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Differential Analysis</h3>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mt-1">Cross-Reference Active</p>
          </div>
        </div>

        {/* Resume 2 Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "p-8 rounded-[2.5rem] border shadow-sm text-center relative overflow-hidden tech-card",
            getScoreBg(data.resume2.atsScore),
            data.winner === 2 && "ring-4 ring-blue-500 ring-offset-4"
          )}
        >
          <div className="scanline" />
          {data.winner === 2 && (
            <div className="absolute top-6 right-6 text-blue-600">
              <Trophy size={28} />
            </div>
          )}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Candidate Beta</p>
          <div className={cn("text-6xl font-black mb-2 tracking-tighter font-mono", getScoreColor(data.resume2.atsScore))}>
            {data.resume2.atsScore}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ATS Compatibility</p>
        </motion.div>
      </div>

      {/* Comparison Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-xl relative overflow-hidden tech-card"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Sparkles size={24} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Comparative Verdict</h3>
        </div>
        <p className="text-xl text-slate-600 leading-relaxed mb-12 font-medium">
          {data.comparisonSummary}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <ArrowRight size={14} />
              </div>
              Key Differentials
            </h4>
            <ul className="space-y-4">
              {(data?.keyDifferences || []).map((diff, i) => (
                <li key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 text-sm font-bold leading-relaxed">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  {diff}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={14} />
              </div>
              Common Attributes
            </h4>
            <ul className="space-y-4">
              {(data?.similarities || []).map((sim, i) => (
                <li key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 text-sm font-bold leading-relaxed">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {sim}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Skill Profile Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm tech-card"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Skill Profile Overlay</h3>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Matrix_Compare_v4</span>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Resume 1"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  strokeWidth={3}
                />
                <Radar
                  name="Resume 2"
                  dataKey="B"
                  stroke="#f43f5e"
                  fill="#f43f5e"
                  fillOpacity={0.1}
                  strokeWidth={3}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-lg bg-blue-500 shadow-lg shadow-blue-200" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alpha Node</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-lg bg-rose-500 shadow-lg shadow-rose-200" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beta Node</span>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Resume 1 Strengths */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm tech-card">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-black text-slate-900 flex items-center gap-3">
                <div className="w-2 h-6 bg-blue-600 rounded-full" />
                Alpha Core Stack
              </h4>
              <span className="text-[10px] font-mono text-slate-400">01_PRIMARY</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(data?.resume1?.skillsFound || []).slice(0, 12).map((skill, i) => (
                <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-black border border-blue-100 uppercase tracking-tight">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Resume 2 Strengths */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm tech-card">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-black text-slate-900 flex items-center gap-3">
                <div className="w-2 h-6 bg-rose-600 rounded-full" />
                Beta Core Stack
              </h4>
              <span className="text-[10px] font-mono text-slate-400">02_PRIMARY</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(data?.resume2?.skillsFound || []).slice(0, 12).map((skill, i) => (
                <span key={i} className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-black border border-rose-100 uppercase tracking-tight">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
