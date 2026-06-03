import React, { useRef } from 'react';
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
  LineChart,
  Line,
} from 'recharts';
import { ResumeAnalysis } from '@/src/services/analysisService';
import { 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  TrendingUp, 
  FileText, 
  Share2, 
  Compass, 
  Star, 
  ShieldCheck, 
  Award, 
  Workflow, 
  Sparkles,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';

interface AnalysisDashboardProps {
  data: ResumeAnalysis;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data }) => {
  const dashboardRef = useRef<HTMLDivElement>(null);

  // We prepare the radar chart data, focusing on the top 6 attributes
  const chartData = [
    ...(data?.strengths || []).map(s => ({ subject: s.name, value: s.score, fullMark: 100 })),
    ...(data?.weaknesses || []).map(w => ({ subject: w.name, value: w.score, fullMark: 100 })),
  ].slice(0, 6);

  const strengthsData = (data?.strengths || []).map(s => ({ name: s.name, score: s.score }));
  const weaknessesData = (data?.weaknesses || []).map(w => ({ name: w.name, score: w.score }));

  // Retrieve analysis history from localStorage to track progress over time
  const analyzeHistory = React.useMemo(() => {
    const saved = localStorage.getItem('job-saathi-history');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved) as any[];
      if (!Array.isArray(parsed)) return [];
      
      const filtered = parsed.filter(item => 
        item.mode === 'analyze' && 
        item.data && 
        typeof item.data.atsScore === 'number'
      );
      
      // Sort chronologically ascending
      filtered.sort((a, b) => a.timestamp - b.timestamp);
      
      return filtered.map((item, index) => {
        const dateObj = new Date(item.timestamp);
        const formattedDate = dateObj.toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric' 
        });
        const formattedTime = dateObj.toLocaleTimeString(undefined, { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        });
        return {
          sessionNumber: index + 1,
          sessionName: `RUN_SESSION_${index + 1}`,
          date: `${formattedDate} ${formattedTime}`,
          score: item.data.atsScore,
          timestamp: item.timestamp,
        };
      });
    } catch (e) {
      console.error("Failed to parse history inside AnalysisDashboard", e);
      return [];
    }
  }, [data]);

  const getScoreColorHex = (score: number) => {
    if (score >= 80) return '#10f49c'; // Neon emerald
    if (score >= 60) return '#00f3ff'; // Neon cyan
    if (score >= 40) return '#a855f7'; // Neon violet
    return '#ff007f'; // Neon pink
  };

  const getScoreBgClass = (score: number) => {
    if (score >= 80) return 'border-neon-emerald/30 bg-neon-emerald/5 text-neon-emerald shadow-[0_0_20px_rgba(16,244,156,0.05)]';
    if (score >= 60) return 'border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan shadow-[0_0_20px_rgba(0,243,255,0.05)]';
    if (score >= 40) return 'border-neon-violet/30 bg-neon-violet/5 text-neon-violet shadow-[0_0_20px_rgba(168,85,247,0.05)]';
    return 'border-neon-pink/30 bg-neon-pink/5 text-neon-pink shadow-[0_0_20px_rgba(255,0,127,0.05)]';
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-20 px-4 sm:px-6 font-sans" ref={dashboardRef}>
      
      {/* Upper LinkedIn-Style Breadcrumb & User-Friendly Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 organic-card bg-tech-card/90 border border-tech-border/80">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neon-cyan/10 border border-neon-cyan/30 rounded-xl text-neon-cyan animate-pulse">
            <Compass size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white font-serif">RESUME FEEDBACK REPORT</h2>
              <span className="text-[10px] bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                Active View
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Comprehensive compatibility feedback compiled from your upload</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto text-xs">
          <span className="text-slate-450 font-medium">Analysis status:</span>
          <span className="text-neon-emerald bg-neon-emerald/5 border border-neon-emerald/20 px-2.5 py-1 rounded font-bold">COMPLETED</span>
        </div>
      </div>

      {/* 3-Column LinkedIn-Inspired Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (Span 3): Profile Match and Roles summary reminiscent of LinkedIn sidebar */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Profile Card (Sidebar Overall score widget) */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn("p-6 organic-card flex flex-col items-center justify-center text-center border relative overflow-hidden", getScoreBgClass(data.atsScore))}
          >
            {/* Glossy radial underlay */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 blur-3xl rounded-full" />
            
            <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 mb-6 font-bold">OVERALL POTENTIAL</p>
            
            <div className="relative w-36 h-36 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  stroke="#1e293b"
                  strokeWidth="8"
                  fill="transparent"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  stroke={getScoreColorHex(data.atsScore)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray="264%"
                  initial={{ strokeDashoffset: "264%" }}
                  animate={{ strokeDashoffset: `${264 - (264 * data.atsScore) / 100}%` }}
                  transition={{ duration: 2, ease: "circOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-serif font-black tracking-tighter" style={{ color: getScoreColorHex(data.atsScore), textShadow: `0 0 15px ${getScoreColorHex(data.atsScore)}40` }}>
                  {data.atsScore}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ATS SCORE</span>
              </div>
            </div>

            <div className="w-full pt-4 border-t border-slate-800/80 font-mono text-[10px] text-left text-slate-400 space-y-2">
              <div className="flex justify-between">
                <span>STATUS:</span>
                <span className="text-neon-emerald font-bold">ANALYZED</span>
              </div>
              <div className="flex justify-between">
                <span>VERDICT:</span>
                <span className="text-white font-bold">{data.atsScore >= 80 ? 'EXCELLENT' : (data.atsScore >= 60 ? 'STRONG' : 'AVERAGE')}</span>
              </div>
            </div>
          </motion.div>

          {/* Possible Paths Widget (Sidebar Recommended Roles Card) */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="organic-card p-6 border border-tech-border"
          >
            <h3 className="text-sm font-mono tracking-wider font-semibold text-slate-200 mb-5 flex items-center gap-2">
              <Zap className="text-neon-cyan w-4 h-4 animate-pulse" />
              RECOMMENDED PATHS
            </h3>
            <div className="space-y-3">
              {(data?.jobRoles || []).map((role, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-tech-border hover:border-neon-cyan/40 hover:bg-slate-900 transition-all duration-300 group cursor-default"
                >
                  <div className="w-6 h-6 rounded-lg bg-slate-800/80 flex items-center justify-center font-mono font-bold text-slate-400 text-xs group-hover:text-neon-cyan group-hover:border-neon-cyan/20 border border-transparent">
                    {idx + 1}
                  </div>
                  <span className="font-semibold text-slate-300 text-sm tracking-tight truncate flex-1">{role}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* MIDDLE COLUMN (Span 6): Active Feed/Analytical updates and charts */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Main Portfolio Feed Accomplishment (Big Picture Card resembling active LinkedIn feed block) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="organic-card p-6 sm:p-8 border border-tech-border relative"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan shadow-[0_0_12px_rgba(0,243,255,0.2)]">
                  <Award size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-black text-white tracking-wide uppercase">EXECUTIVE SUMMARY</h4>
                  <p className="text-[10px] text-slate-400">Key career compatibility insights</p>
                </div>
              </div>
              <Sparkles className="text-neon-violet w-4 h-4" />
            </div>

            <p className="text-slate-300 leading-relaxed font-sans text-base">
              "{data.summary}"
            </p>

            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap gap-4 text-[10px]">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-ping" />
                High Authenticity Match
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-neon-violet/10 text-neon-violet border border-neon-violet/20 rounded-full font-medium">
                Verified Career Alignments
              </div>
            </div>
          </motion.div>

          {/* Line Chart Progress over Time */}
          {analyzeHistory.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="organic-card p-6 border border-tech-border"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-base font-serif font-black text-white uppercase flex items-center gap-2">
                    <TrendingUp className="text-neon-cyan animate-pulse" size={18} />
                    SYSTEM SCORE PROGRESSION
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">Comparative chronological matrix values</p>
                </div>
                <span className="self-start sm:self-auto px-2.5 py-1 bg-[#121829] border border-tech-border text-neon-cyan rounded text-[10px] font-mono">
                  HISTORIC_RECORDS: {analyzeHistory.length}
                </span>
              </div>
              
              <div className="h-[210px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyzeHistory} margin={{ top: 12, right: 12, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#64748b', fontSize: 9, fontWeight: 500, fontFamily: 'monospace' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ stroke: '#00f3ff', strokeWidth: 1, strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-[#0c1220] p-4 rounded-xl border border-tech-border shadow-2xl font-mono text-xs text-slate-100">
                              <p className="text-neon-cyan font-bold mb-1">[{item.sessionName}]</p>
                              <p className="text-slate-400 text-[10px] mb-2">{item.date}</p>
                              <p className="text-base font-black text-white font-serif">{item.score}% ATS_INDEX</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#00f3ff"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, stroke: '#070a13', fill: '#00f3ff' }}
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#ff007f' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Strengths & Weaknesses visual bar charts */}
          <div className="space-y-6">
            {strengthsData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="organic-card p-6 border border-tech-border"
              >
                <h3 className="text-sm font-mono tracking-wider font-semibold text-slate-200 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="text-neon-emerald w-4 h-4" />
                  KEY PERFORMANCE ADVANTAGES (STRENGTHS)
                </h3>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={strengthsData} layout="vertical" margin={{ left: -15, right: 15, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0, 243, 255, 0.04)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-[#0c1220] p-3 rounded-lg border border-tech-border shadow-xl font-mono text-[11px]">
                                <p className="text-neon-emerald font-bold">{payload[0].payload.name}</p>
                                <p className="text-white mt-1 font-bold">POWER INDEX: {payload[0].value}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="score" 
                        fill="#10f49c" 
                        radius={[0, 4, 4, 0]} 
                        barSize={10}
                        activeBar={{ fill: '#0dfc90', stroke: '#10f49c', strokeWidth: 1 }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {weaknessesData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="organic-card p-6 border border-tech-border"
              >
                <h3 className="text-sm font-semibold text-slate-200 mb-6 flex items-center gap-2">
                  <TrendingUp className="text-neon-pink w-4 h-4" />
                  HIGH-VALUE TECHNOLOGY ACQUISITIONS
                </h3>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weaknessesData} layout="vertical" margin={{ left: -15, right: 15, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255, 0, 127, 0.04)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-[#0c1220] p-3 rounded-lg border border-tech-border shadow-xl text-[11px]">
                                <p className="text-neon-pink font-bold">{payload[0].payload.name}</p>
                                <p className="text-white mt-1 font-bold">CAREER BOOST FACTOR: {payload[0].value}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="score" 
                        fill="#ff007f" 
                        radius={[0, 4, 4, 0]} 
                        barSize={10}
                        activeBar={{ fill: '#ff1a8c', stroke: '#ff007f', strokeWidth: 1 }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </div>
          
        </div>

        {/* RIGHT COLUMN (Span 3): Toolkit summary and growth actions */}
        <div className="lg:col-span-3 space-y-6">

          {/* Endorsed Skills found toolkit (LinkedIn profile styling) */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="organic-card p-6 border border-tech-border"
          >
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
              <h3 className="text-sm tracking-wider font-semibold text-slate-200 flex items-center gap-2">
                <Workflow className="text-neon-violet w-4 h-4 animate-pulse" />
                SKILLS DETECTED
              </h3>
              <span className="text-[10px] bg-slate-900 border border-tech-border px-2.5 py-0.5 rounded text-slate-400 font-bold text-right">
                FOUND: {data.skillsFound?.length || 0}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(data?.skillsFound || []).map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-slate-900/90 text-xs font-mono font-semibold text-slate-300 border border-tech-border hover:border-neon-cyan/40 hover:text-white rounded-lg transition-transform hover:scale-105 cursor-default duration-300"
                >
                  #{skill}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Growth Nudges */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="organic-card p-6 border border-tech-border"
          >
            <h3 className="text-sm tracking-wider font-semibold text-slate-200 mb-5 flex items-center gap-2">
              <Sparkles className="text-neon-cyan w-4 h-4" />
              RECOMMENDED GROWTH ACTIONS
            </h3>
            <div className="space-y-4">
              {(data?.improvements || []).map((imp, i) => (
                <div key={i} className="p-4 bg-slate-900/60 border border-tech-border rounded-xl flex items-start gap-3 hover:border-neon-cyan/30 transition-all duration-300">
                  <div className="w-5 h-5 rounded bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan font-sans font-bold text-xs shrink-0 mt-0.5 shadow-[0_0_8px_rgba(0,243,255,0.1)]">
                    {i + 1}
                  </div>
                  <span className="text-xs font-medium text-slate-300 leading-relaxed font-sans">{imp}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* High Tech Talent Landscape Radar Chart Block */}
          {chartData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="organic-card p-4 border border-tech-border"
            >
              <h3 className="text-[10px] tracking-wider font-bold text-slate-400 mb-3 text-center uppercase">
                SKILL BALANCE PROFILE
              </h3>
              <div className="h-[180px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#808ea3', fontSize: 7, fontFamily: 'monospace' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Confidence Factor"
                      dataKey="value"
                      stroke="#00f3ff"
                      fill="#00f3ff"
                      fillOpacity={0.12}
                      strokeWidth={1.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

        </div>

      </div>

    </div>
  );
};
