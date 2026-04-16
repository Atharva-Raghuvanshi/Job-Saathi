import React, { useRef, useState } from 'react';
import { ResumeComparison } from '@/src/services/analysisService';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Trophy, ArrowRight, CheckCircle2, AlertCircle, Scale, FileText, Share2, Heart, Star, Compass } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

/**
 * ComparisonDashboard: A thoughtful side-by-side look at two career paths.
 * 
 * We use local analysis to focus on unique strengths and shared potential.
 */

interface ComparisonDashboardProps {
  data: ResumeComparison;
}

export const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({ data }) => {
  const dashboardRef = useRef<HTMLDivElement>(null);

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

  // Combine skills for radar chart to see the overlap
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
    <div className="w-full max-w-7xl mx-auto space-y-16 pb-24 px-4 sm:px-6" ref={dashboardRef}>
      {/* Friendly Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-clay rounded-2xl text-white shadow-sm">
            <Scale size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">Side-by-Side Insights</h2>
            <p className="text-sm font-medium text-gray-400 italic">Discovering the unique essence of each journey.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
        </div>
      </div>

      {/* Comparison Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
        {/* Resume 1 Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "p-8 sm:p-10 organic-card text-center relative overflow-hidden",
            getScoreBg(data.resume1.atsScore),
            data.winner === 1 && "ring-2 ring-clay/30"
          )}
        >
          {data.winner === 1 && (
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-clay">
              <Star className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" />
            </div>
          )}
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">First Perspective</p>
          <div className={cn("text-5xl sm:text-6xl font-serif font-black mb-2 tracking-tighter", getScoreColor(data.resume1.atsScore))}>
            {data.resume1.atsScore}
          </div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Match Score</p>
        </motion.div>

        {/* Comparison Badge */}
        <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 py-4 sm:py-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] sm:rounded-[2.5rem] bg-[#1a1c1e] flex items-center justify-center text-white shadow-xl relative">
            <Scale className="w-8 h-8 sm:w-10 sm:h-10" />
            <div className="absolute -top-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 bg-clay rounded-full border-4 border-[#fdfcfb] flex items-center justify-center text-[9px] sm:text-[10px] font-bold">VS</div>
          </div>
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 tracking-tight">The Comparison</h3>
            <p className="text-xs sm:text-sm font-medium text-gray-400 italic mt-1">Finding the perfect fit.</p>
          </div>
        </div>

        {/* Resume 2 Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "p-8 sm:p-10 organic-card text-center relative overflow-hidden",
            getScoreBg(data.resume2.atsScore),
            data.winner === 2 && "ring-2 ring-clay/30"
          )}
        >
          {data.winner === 2 && (
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-clay">
              <Star className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" />
            </div>
          )}
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">Second Perspective</p>
          <div className={cn("text-5xl sm:text-6xl font-serif font-black mb-2 tracking-tighter", getScoreColor(data.resume2.atsScore))}>
            {data.resume2.atsScore}
          </div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Match Score</p>
        </motion.div>
      </div>

      {/* Comparison Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-12 organic-card"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-clay/10 flex items-center justify-center text-clay">
            <Scale size={24} fill="currentColor" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">Our Observations</h3>
        </div>
        <p className="text-xl text-gray-600 leading-relaxed mb-12 font-medium italic">
          "{data.comparisonSummary}"
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {data.keyDifferences.length > 0 && (
            <div className="space-y-8">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-[#d4a373]/10 flex items-center justify-center text-[#d4a373]">
                  <ArrowRight size={16} />
                </div>
                What sets them apart
              </h4>
              <ul className="space-y-5">
                {(data?.keyDifferences || []).map((diff, i) => (
                  <li key={i} className="flex items-start gap-5 p-5 bg-gray-50/50 rounded-[2rem] border border-gray-100 text-gray-700 text-base font-medium leading-relaxed">
                    <div className="mt-2 w-2 h-2 rounded-full bg-clay shrink-0" />
                    {diff}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.similarities.length > 0 && (
            <div className="space-y-8">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-moss/10 flex items-center justify-center text-moss">
                  <CheckCircle2 size={16} />
                </div>
                What they share
              </h4>
              <ul className="space-y-5">
                {(data?.similarities || []).map((sim, i) => (
                  <li key={i} className="flex items-start gap-5 p-5 bg-gray-50/50 rounded-[2rem] border border-gray-100 text-gray-700 text-base font-medium leading-relaxed">
                    <div className="mt-2 w-2 h-2 rounded-full bg-moss shrink-0" />
                    {sim}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>

      {/* Skill Profile Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="organic-card p-12"
        >
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-xl font-serif font-bold text-gray-900 tracking-tight">Overlap of Talents</h3>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Resume 1"
                  dataKey="A"
                  stroke="#d4a373"
                  fill="#d4a373"
                  fillOpacity={0.05}
                  strokeWidth={2}
                />
                <Radar
                  name="Resume 2"
                  dataKey="B"
                  stroke="#606c38"
                  fill="#606c38"
                  fillOpacity={0.05}
                  strokeWidth={2}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xl">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{payload[0].payload.subject}</p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-xs font-bold text-clay">Resume 1</span>
                              <span className="text-sm font-black text-clay">{payload[0].value}%</span>
                            </div>
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-xs font-bold text-moss">Resume 2</span>
                              <span className="text-sm font-black text-moss">{payload[1].value}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-10 mt-10">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-clay shadow-sm" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">First Resume</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-moss shadow-sm" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Second Resume</span>
            </div>
          </div>
        </motion.div>

        <div className="space-y-10">
          {/* Resume 1 Strengths */}
          <div className="organic-card p-10">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-serif font-bold text-gray-900 text-lg flex items-center gap-4">
                <div className="w-2 h-8 bg-clay rounded-full" />
                First Toolkit
              </h4>
            </div>
            <div className="flex flex-wrap gap-3">
              {(data?.resume1?.skillsFound || []).slice(0, 12).map((skill, i) => (
                <span key={i} className="px-5 py-2.5 bg-clay/5 text-clay rounded-2xl text-sm font-medium border border-clay/10">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Resume 2 Strengths */}
          <div className="organic-card p-10">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-serif font-bold text-gray-900 text-lg flex items-center gap-4">
                <div className="w-2 h-8 bg-moss rounded-full" />
                Second Toolkit
              </h4>
            </div>
            <div className="flex flex-wrap gap-3">
              {(data?.resume2?.skillsFound || []).slice(0, 12).map((skill, i) => (
                <span key={i} className="px-5 py-2.5 bg-moss/5 text-moss rounded-2xl text-sm font-medium border border-moss/10">
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
