import React from 'react';
import { ResumeComparison } from '@/src/services/geminiService';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Trophy, ArrowRight, CheckCircle2, AlertCircle, Sparkles, Scale } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface ComparisonDashboardProps {
  data: ResumeComparison;
}

export const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({ data }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-blue-50 border-blue-200';
    if (score >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
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
    <div className="w-full max-w-7xl mx-auto space-y-12 pb-20">
      {/* Comparison Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Resume 1 Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "p-8 rounded-3xl border shadow-sm text-center relative overflow-hidden",
            getScoreBg(data.resume1.atsScore),
            data.winner === 1 && "ring-4 ring-blue-500 ring-offset-4"
          )}
        >
          {data.winner === 1 && (
            <div className="absolute top-4 right-4 text-blue-600">
              <Trophy size={24} />
            </div>
          )}
          <p className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Resume 1</p>
          <div className={cn("text-5xl font-black mb-2", getScoreColor(data.resume1.atsScore))}>
            {data.resume1.atsScore}%
          </div>
          <p className="text-xs font-bold text-gray-400">ATS SCORE</p>
        </motion.div>

        {/* Comparison Badge */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-xl">
            <Scale size={32} />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black text-slate-900">Side-by-Side</h3>
            <p className="text-sm text-slate-500">AI Comparison Analysis</p>
          </div>
        </div>

        {/* Resume 2 Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "p-8 rounded-3xl border shadow-sm text-center relative overflow-hidden",
            getScoreBg(data.resume2.atsScore),
            data.winner === 2 && "ring-4 ring-blue-500 ring-offset-4"
          )}
        >
          {data.winner === 2 && (
            <div className="absolute top-4 right-4 text-blue-600">
              <Trophy size={24} />
            </div>
          )}
          <p className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Resume 2</p>
          <div className={cn("text-5xl font-black mb-2", getScoreColor(data.resume2.atsScore))}>
            {data.resume2.atsScore}%
          </div>
          <p className="text-xs font-bold text-gray-400">ATS SCORE</p>
        </motion.div>
      </div>

      {/* Comparison Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="text-blue-600" size={24} />
          <h3 className="text-2xl font-black text-slate-900">Comparison Verdict</h3>
        </div>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          {data.comparisonSummary}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <ArrowRight className="text-blue-600" size={18} />
              Key Differences
            </h4>
            <ul className="space-y-3">
              {(data?.keyDifferences || []).map((diff, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  {diff}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="text-green-500" size={18} />
              Similarities
            </h4>
            <ul className="space-y-3">
              {(data?.similarities || []).map((sim, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            Skill Profile Overlay
          </h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Resume 1"
                  dataKey="A"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Resume 2"
                  dataKey="B"
                  stroke="#ef4444"
                  fill="#f87171"
                  fillOpacity={0.4}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs font-bold text-slate-500 uppercase">Resume 1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs font-bold text-slate-500 uppercase">Resume 2</span>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Resume 1 Strengths */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-6 bg-blue-600 rounded-full" />
              Resume 1 Top Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {(data?.resume1?.skillsFound || []).slice(0, 8).map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Resume 2 Strengths */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-6 bg-red-600 rounded-full" />
              Resume 2 Top Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {(data?.resume2?.skillsFound || []).slice(0, 8).map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold">
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
