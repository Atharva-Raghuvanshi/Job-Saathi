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
import { ResumeAnalysis } from '@/src/services/analysisService';
import { CheckCircle2, AlertCircle, Briefcase, TrendingUp, FileText, Share2, Heart, Star, Compass } from 'lucide-react';
import { motion } from 'motion/react';

/**
 * AnalysisDashboard: A thoughtful breakdown of a resume.
 * 
 * We use a local data-driven engine to present insights in a way that 
 * feels encouraging and insightful.
 */

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

  if (chartData.length === 0) return null;

  const strengthsData = (data?.strengths || []).map(s => ({ name: s.name, score: s.score }));
  const weaknessesData = (data?.weaknesses || []).map(w => ({ name: w.name, score: w.score }));

  // Helper to get warm, meaningful colors based on performance
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-moss';
    if (score >= 60) return 'text-clay';
    if (score >= 40) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-moss/5 border-moss/10';
    if (score >= 60) return 'bg-clay/5 border-clay/10';
    if (score >= 40) return 'bg-amber-50 border-amber-100';
    return 'bg-rose-50 border-rose-100';
  };

  /**
   * Generates a PDF report of the dashboard.
   * We use modern-screenshot for high-fidelity rendering.
   */
  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 pb-24 px-4 sm:px-6" ref={dashboardRef}>
      {/* Friendly Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#d4a373] rounded-2xl text-white shadow-sm">
            <Heart size={24} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">Your Career Story</h2>
            <p className="text-sm font-medium text-gray-400 italic">A thoughtful look at where you are today.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-[#1a1c1e] text-white rounded-2xl hover:bg-gray-800 transition-all shadow-sm active:scale-95">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Main Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("p-8 sm:p-10 organic-card flex flex-col items-center justify-center text-center relative overflow-hidden", getScoreBg(data.atsScore))}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-8">Overall Potential</p>
          
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="40%"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-100"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="40%"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray="251.2%"
                initial={{ strokeDashoffset: "251.2%" }}
                animate={{ strokeDashoffset: `${251.2 - (251.2 * data.atsScore) / 100}%` }}
                transition={{ duration: 2.5, ease: "circOut" }}
                className={getScoreColor(data.atsScore)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-4xl sm:text-5xl font-serif font-black tracking-tighter", getScoreColor(data.atsScore))}>
                {data.atsScore}
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Match Score</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 sm:p-10 organic-card md:col-span-2"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#d4a373]/10 flex items-center justify-center text-[#d4a373]">
              <Star size={24} fill="currentColor" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">The Big Picture</h3>
          </div>
          <p className="text-gray-600 leading-relaxed font-medium text-lg italic">
            "{data.summary}"
          </p>
          <div className="mt-10 pt-10 border-t border-gray-100 flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-moss" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Authentic Content</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-clay" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Data-Driven Insights</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Visual Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="organic-card p-10"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Compass size={22} />
              </div>
              Skill Landscape
            </h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Presence"
                  dataKey="value"
                  stroke="#d4a373"
                  fill="#d4a373"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="organic-card p-10"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-moss/10 flex items-center justify-center text-moss">
                <Briefcase size={22} />
              </div>
              Possible Paths
            </h3>
          </div>
          <div className="space-y-4">
            {(data?.jobRoles || []).map((role, idx) => (
              <div
                key={idx}
                className="flex items-center gap-5 p-5 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-[#d4a373]/30 hover:bg-white transition-all group cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm font-serif font-bold text-gray-300 group-hover:text-[#d4a373] transition-colors">
                  {idx + 1}
                </div>
                <span className="font-bold text-gray-700 tracking-tight text-lg">{role}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {strengthsData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="organic-card p-8 sm:p-10"
            >
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-moss/10 flex items-center justify-center text-moss">
                  <CheckCircle2 size={22} />
                </div>
                Where you shine
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strengthsData} layout="vertical" margin={{ left: 0, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xl">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{payload[0].payload.name}</p>
                              <p className="text-xl font-serif font-black text-moss">{payload[0].value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="score" 
                      fill="#606c38" 
                      radius={[0, 10, 10, 0]} 
                      barSize={14}
                      activeBar={{ fill: '#4a542b', stroke: '#606c38', strokeWidth: 1 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {weaknessesData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="organic-card p-8 sm:p-10"
            >
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                  <AlertCircle size={22} />
                </div>
                Areas to nurture
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weaknessesData} layout="vertical" margin={{ left: 0, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xl">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{payload[0].payload.name}</p>
                              <p className="text-xl font-serif font-black text-rose-500">{payload[0].value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="score" 
                      fill="#f43f5e" 
                      radius={[0, 10, 10, 0]} 
                      barSize={14}
                      activeBar={{ fill: '#e11d48', stroke: '#f43f5e', strokeWidth: 1 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>

      {/* Gentle Nudges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="organic-card p-10"
      >
        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <TrendingUp size={24} />
          </div>
          Gentle Nudges for Growth
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(data?.improvements || []).map((imp, i) => (
            <div key={i} className="p-6 bg-gray-50/50 border border-gray-100 rounded-[2rem] flex items-start gap-5 hover:border-[#d4a373]/20 transition-colors">
              <div className="mt-1 w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-[#d4a373] font-serif font-bold text-sm">
                {i + 1}
              </div>
              <span className="text-base font-medium text-gray-700 leading-relaxed">{imp}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Skills Found */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-[#1a1c1e] p-12 rounded-[3rem] text-white overflow-hidden relative"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-3xl font-serif font-bold tracking-tight">Your Toolkit</h3>
            <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">Everything we found</span>
          </div>
          <div className="flex flex-wrap gap-4">
            {(data?.skillsFound || []).map((skill, i) => (
              <span
                key={i}
                className="px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4a373]/10 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-moss/10 blur-[100px] rounded-full -ml-32 -mb-32" />
      </motion.div>
    </div>
  );
};
