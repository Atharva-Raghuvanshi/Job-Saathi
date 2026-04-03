import React, { useRef, useState } from 'react';
import { cn } from '@/src/lib/utils';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ResumeAnalysis } from '@/src/services/geminiService';
import { CheckCircle2, AlertCircle, Briefcase, TrendingUp, Sparkles, Download, FileText, Share2, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface AnalysisDashboardProps {
  data: ResumeAnalysis;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data }) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const chartData = [
    ...(data?.strengths || []).map(s => ({ subject: s.name, value: s.score, fullMark: 100 })),
    ...(data?.weaknesses || []).map(w => ({ subject: w.name, value: w.score, fullMark: 100 })),
  ].slice(0, 6);

  const strengthsData = (data?.strengths || []).map(s => ({ name: s.name, score: s.score }));
  const weaknessesData = (data?.weaknesses || []).map(w => ({ name: w.name, score: w.score }));

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
      pdf.save(`Job-saathi-Analysis-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20 px-4 sm:px-6" ref={dashboardRef}>
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Analysis Report</h2>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
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
          <button className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("p-8 rounded-[2rem] border shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden tech-card", getScoreBg(data.atsScore))}
        >
          <div className="scanline" />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 relative z-10">ATS Compatibility</p>
          
          <div className="relative w-40 h-40 mb-6 z-10">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="72"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-slate-100"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="72"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={452.4}
                initial={{ strokeDashoffset: 452.4 }}
                animate={{ strokeDashoffset: 452.4 - (452.4 * data.atsScore) / 100 }}
                transition={{ duration: 2, ease: "circOut" }}
                className={getScoreColor(data.atsScore)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-4xl font-black font-mono tracking-tighter", getScoreColor(data.atsScore))}>
                {data.atsScore}
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</span>
            </div>
          </div>

          <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border", getScoreColor(data.atsScore).replace('text-', 'bg-').replace('500', '100'), getScoreColor(data.atsScore).replace('text-', 'border-').replace('500', '200'), getScoreColor(data.atsScore))}>
            {data.atsScore >= 80 ? "High Match" : data.atsScore >= 60 ? "Moderate Match" : "Low Match"}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-[2rem] border border-slate-200 bg-white shadow-sm md:col-span-2 relative overflow-hidden tech-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Sparkles size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Executive Summary</h3>
          </div>
          <p className="text-slate-600 leading-relaxed font-medium">
            {data.summary}
          </p>
          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Content</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Analyzed</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm tech-card"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <TrendingUp size={18} />
              </div>
              Skill Matrix
            </h3>
            <span className="text-[10px] font-mono text-slate-400">RADAR_VIZ_01</span>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.15}
                  strokeWidth={3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm tech-card"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Briefcase size={18} />
              </div>
              Career Pathways
            </h3>
            <span className="text-[10px] font-mono text-slate-400">ROLE_PRED_02</span>
          </div>
          <div className="space-y-3">
            {(data?.jobRoles || []).map((role, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm font-mono font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                  0{idx + 1}
                </div>
                <span className="font-bold text-slate-700 tracking-tight">{role}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Strengths & Weaknesses Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm tech-card"
        >
          <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={18} />
            </div>
            Strengths Breakdown
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strengthsData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="score" fill="#10b981" radius={[0, 8, 8, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm tech-card"
        >
          <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
              <AlertCircle size={18} />
            </div>
            Gap Analysis
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weaknessesData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="score" fill="#f43f5e" radius={[0, 8, 8, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Improvement Roadmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm tech-card"
      >
        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
            <TrendingUp size={20} />
          </div>
          Optimization Roadmap
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(data?.improvements || []).map((imp, i) => (
            <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-4 hover:border-amber-200 transition-colors">
              <div className="mt-1 w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm text-amber-500 font-mono text-xs font-bold">
                {i + 1}
              </div>
              <span className="text-sm font-bold text-slate-700 leading-relaxed">{imp}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Skills Found */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-slate-900 p-10 rounded-[2.5rem] text-white overflow-hidden relative"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black tracking-tight">Technical Stack Identified</h3>
            <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-mono uppercase tracking-widest">v1.0.4_stable</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {(data?.skillsFound || []).map((skill, i) => (
              <span
                key={i}
                className="px-5 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -ml-32 -mb-32" />
      </motion.div>
    </div>
  );
};
