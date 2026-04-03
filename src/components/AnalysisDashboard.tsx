import React from 'react';
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
  Cell,
} from 'recharts';
import { ResumeAnalysis } from '@/src/services/geminiService';
import { CheckCircle2, AlertCircle, Briefcase, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalysisDashboardProps {
  data: ResumeAnalysis;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data }) => {
  const chartData = [
    ...(data?.strengths || []).map(s => ({ subject: s.name, value: s.score, fullMark: 100 })),
    ...(data?.weaknesses || []).map(w => ({ subject: w.name, value: w.score, fullMark: 100 })),
  ].slice(0, 6);

  const strengthsData = (data?.strengths || []).map(s => ({ name: s.name, score: s.score }));
  const weaknessesData = (data?.weaknesses || []).map(w => ({ name: w.name, score: w.score }));

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

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("p-8 rounded-3xl border shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden", getScoreBg(data.atsScore))}
        >
          <p className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 relative z-10">ATS Score</p>
          
          <div className="relative w-32 h-32 mb-4 z-10">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={364.4}
                initial={{ strokeDashoffset: 364.4 }}
                animate={{ strokeDashoffset: 364.4 - (364.4 * data.atsScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={getScoreColor(data.atsScore)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn("text-3xl font-black", getScoreColor(data.atsScore))}>
                {data.atsScore}%
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 font-medium relative z-10">
            {data.atsScore >= 80 ? "Excellent Match!" : data.atsScore >= 60 ? "Good Potential" : "Needs Improvement"}
          </p>
          
          {/* Decorative background element */}
          <div className={cn("absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10", getScoreColor(data.atsScore).replace('text-', 'bg-'))} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-3xl border border-gray-200 bg-white shadow-sm md:col-span-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-blue-600" size={20} />
            <h3 className="text-lg font-bold text-gray-900">Executive Summary</h3>
          </div>
          <p className="text-gray-600 leading-relaxed">
            {data.summary}
          </p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Skill Analysis
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Briefcase size={20} className="text-blue-600" />
            Recommended Roles
          </h3>
          <div className="space-y-4">
            {(data?.jobRoles || []).map((role, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:text-blue-600">
                  {idx + 1}
                </div>
                <span className="font-semibold text-gray-800">{role}</span>
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
          className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-green-500" />
            Strengths Breakdown
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strengthsData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-500" />
            Weaknesses Breakdown
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weaknessesData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Strengths & Weaknesses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 px-2">
            <CheckCircle2 className="text-green-500" size={20} />
            Key Strengths
          </h3>
          <div className="grid gap-3">
            {(data?.strengths || []).map((s, i) => (
              <div key={i} className="p-4 bg-green-50/50 border border-green-100 rounded-2xl flex items-center justify-between">
                <span className="font-medium text-green-900">{s.name}</span>
                <span className="text-sm font-bold text-green-600">{s.score}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 px-2">
            <AlertCircle className="text-amber-500" size={20} />
            Areas for Improvement
          </h3>
          <div className="grid gap-3">
            {(data?.improvements || []).map((imp, i) => (
              <div key={i} className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-sm font-medium text-amber-900">{imp}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Skills Found */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-900 p-8 rounded-3xl text-white overflow-hidden relative"
      >
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-6">Skills Identified</h3>
          <div className="flex flex-wrap gap-2">
            {(data?.skillsFound || []).map((skill, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full -mr-32 -mt-32" />
      </motion.div>
    </div>
  );
};
