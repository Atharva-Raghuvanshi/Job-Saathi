import React, { useRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { ArrowRight, CheckCircle2, Scale, Star, Sparkles } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export const ComparisonDashboard = ({ data }) => {
  const dashboardRef = useRef(null);

  const getScoreColorHex = (score) => {
    if (score >= 80) return "#10f49c";
    if (score >= 60) return "#00f3ff";
    if (score >= 40) return "#a855f7";
    return "#ff007f";
  };

  const getScoreBgClass = (score) => {
    if (score >= 80)
      return "border-neon-emerald/30 bg-neon-emerald/5 text-neon-emerald shadow-[0_0_20px_rgba(16,244,156,0.05)]";
    if (score >= 60)
      return "border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan shadow-[0_0_20px_rgba(0,243,255,0.05)]";
    if (score >= 40)
      return "border-neon-violet/30 bg-neon-violet/5 text-neon-violet shadow-[0_0_20px_rgba(168,85,247,0.05)]";
    return "border-neon-pink/30 bg-neon-pink/5 text-neon-pink shadow-[0_0_20px_rgba(255,0,127,0.05)]";
  };

  // Combine skills for radar chart to see the overlap
  const allSkills = Array.from(
    new Set([
      ...(data?.resume1?.strengths || []).map((s) => s.name),
      ...(data?.resume2?.strengths || []).map((s) => s.name),
    ]),
  ).slice(0, 6);

  const radarData = allSkills.map((skill) => {
    const s1 =
      (data?.resume1?.strengths || []).find((s) => s.name === skill)?.score ||
      (data?.resume1?.weaknesses || []).find((w) => w.name === skill)?.score ||
      0;
    const s2 =
      (data?.resume2?.strengths || []).find((s) => s.name === skill)?.score ||
      (data?.resume2?.weaknesses || []).find((w) => w.name === skill)?.score ||
      0;
    return {
      subject: skill,
      A: s1,
      B: s2,
      fullMark: 100,
    };
  });

  return (
    <div
      className="w-full max-w-7xl mx-auto space-y-10 pb-20 px-4 sm:px-6 font-sans"
      ref={dashboardRef}
    >
      {/* Upper Technical Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 organic-card bg-tech-card/90 border border-tech-border/80">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neon-violet/10 border border-neon-violet/30 rounded-xl text-neon-violet shadow-[0_0_12px_rgba(168,85,247,0.2)]">
            <Scale size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white font-serif">
                SIDE-BY-SIDE SUMMARY
              </h2>
              <span className="text-[10px] bg-neon-violet/15 text-neon-violet border border-neon-violet/30 font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                Dual Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Direct profile comparison insight metrics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto text-xs">
          <span className="text-slate-400 font-medium">Comparison state:</span>
          <span className="text-neon-cyan bg-neon-cyan/5 border border-neon-cyan/20 px-2.5 py-1 rounded font-bold">
            READY
          </span>
        </div>
      </div>

      {/* Comparison Score Boards layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Resume 1 Metric Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "p-6 sm:p-8 organic-card text-center relative overflow-hidden border",
            getScoreBgClass(data.resume1.atsScore),
            data.winner === 1 &&
              "border-neon-cyan shadow-[0_0_25px_rgba(0,243,255,0.1)]",
          )}
        >
          {data.winner === 1 && (
            <div className="absolute top-4 right-4 text-neon-cyan flex items-center gap-1.5 bg-neon-cyan/15 px-2.5 py-1 border border-neon-cyan/30 rounded text-[9px] font-bold tracking-widest uppercase">
              <Star className="w-3.5 h-3.5 animate-spin" />
              BEST MATCH
            </div>
          )}
          <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 mb-6 font-bold">
            PROFILE A
          </p>
          <div
            className="text-6xl font-serif font-black mb-3 tracking-tighter"
            style={{
              color: getScoreColorHex(data.resume1.atsScore),
              textShadow: `0 0 15px ${getScoreColorHex(data.resume1.atsScore)}30`,
            }}
          >
            {data.resume1.atsScore}
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">
            COMPETENCY COMPATIBILITY
          </p>
        </motion.div>

        {/* Central VS Telemetry controller */}
        <div className="flex flex-col items-center justify-center gap-4 py-6">
          <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-tech-border flex items-center justify-center text-neon-cyan shadow-2xl relative">
            <Scale className="w-8 h-8 filter drop-shadow-[0_0_5px_rgba(0,243,255,0.4)]" />
            <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-neon-pink border border-neon-pink/30 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg animate-pulse">
              VS
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-bold text-neon-cyan tracking-wider">
              PROFILE COMPARISON
            </h3>
            <p className="text-[10px] text-slate-450 mt-1 uppercase">
              Relative skill fit mapping
            </p>
          </div>
        </div>

        {/* Resume 2 Metric Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "p-6 sm:p-8 organic-card text-center relative overflow-hidden border",
            getScoreBgClass(data.resume2.atsScore),
            data.winner === 2 &&
              "border-neon-cyan shadow-[0_0_25px_rgba(0,243,255,0.1)]",
          )}
        >
          {data.winner === 2 && (
            <div className="absolute top-4 right-4 text-neon-cyan flex items-center gap-1.5 bg-neon-cyan/15 px-2.5 py-1 border border-neon-cyan/30 rounded text-[9px] font-bold tracking-widest uppercase">
              <Star className="w-3.5 h-3.5 animate-spin" />
              BEST MATCH
            </div>
          )}
          <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 mb-6 font-bold">
            PROFILE B
          </p>
          <div
            className="text-6xl font-serif font-black mb-3 tracking-tighter"
            style={{
              color: getScoreColorHex(data.resume2.atsScore),
              textShadow: `0 0 15px ${getScoreColorHex(data.resume2.atsScore)}30`,
            }}
          >
            {data.resume2.atsScore}
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">
            COMPETENCY COMPATIBILITY
          </p>
        </motion.div>
      </div>

      {/* Observation Suite (LinkedIn details block) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 sm:p-8 organic-card border border-tech-border"
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.2)]">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-base font-serif font-black text-white uppercase">
              COMPARATIVE FEEDBACK
            </h3>
            <p className="text-[10px] text-slate-400">
              Direct comparison of advantages & differentiators
            </p>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed font-sans text-base mb-8">
          "{data.comparisonSummary}"
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Key Differences */}
          {data.keyDifferences.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ArrowRight size={14} className="text-neon-pink" />
                KEY DIFFERENCES
              </h4>
              <ul className="space-y-3">
                {(data?.keyDifferences || []).map((diff, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-4 bg-slate-900/60 rounded-xl border border-tech-border text-slate-300 text-xs font-sans leading-relaxed hover:border-neon-pink/20 transition-all duration-300"
                  >
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-neon-pink shrink-0 animate-ping" />
                    {diff}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Similarities */}
          {data.similarities.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={14} className="text-neon-emerald" />
                SHARED STRENGTHS
              </h4>
              <ul className="space-y-3">
                {(data?.similarities || []).map((sim, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-4 bg-slate-900/60 rounded-xl border border-tech-border text-slate-300 text-xs font-sans leading-relaxed hover:border-neon-emerald/20 transition-all duration-300"
                  >
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-neon-emerald shrink-0" />
                    {sim}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>

      {/* Radar Overlap Component */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Radar Map (Span 7) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="organic-card p-6 border border-tech-border lg:col-span-7"
        >
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-200 uppercase">
              SKILL COMPARISON SUMMARY
            </h3>
            <span className="text-[10px] text-neon-cyan uppercase tracking-wider">
              OVERLAP CHART
            </span>
          </div>

          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{
                    fill: "#808ea3",
                    fontSize: 8,
                    fontFamily: "monospace",
                  }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Alpha"
                  dataKey="A"
                  stroke="#00f3ff"
                  fill="#00f3ff"
                  fillOpacity={0.06}
                  strokeWidth={2}
                />

                <Radar
                  name="Beta"
                  dataKey="B"
                  stroke="#10f49c"
                  fill="#10f49c"
                  fillOpacity={0.06}
                  strokeWidth={2}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0c1220] p-4 rounded-xl border border-tech-border shadow-2xl font-mono text-xs text-white">
                          <p className="text-slate-400 text-[10px] uppercase mb-2">
                            [{payload[0].payload.subject}]
                          </p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-neon-cyan font-bold">
                                PROFILE A
                              </span>
                              <span className="font-bold text-white">
                                {payload[0].value}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-neon-emerald font-bold">
                                PROFILE B
                              </span>
                              <span className="font-bold text-white">
                                {payload[1].value}%
                              </span>
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

          <div className="flex justify-center gap-6 mt-4 font-mono text-[10px]">
            <div className="flex items-center gap-2 px-3 py-1 bg-neon-cyan/5 border border-neon-cyan/20 rounded">
              <div className="w-2.5 h-2.5 bg-neon-cyan rounded" />
              <span className="text-neon-cyan font-bold">PROFILE A</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-neon-emerald/5 border border-neon-emerald/20 rounded">
              <div className="w-2.5 h-2.5 bg-neon-emerald rounded" />
              <span className="text-neon-emerald font-bold">PROFILE B</span>
            </div>
          </div>
        </motion.div>

        {/* Toolkits found Comparison (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Resume 1 skills */}
          <div className="organic-card p-6 border border-tech-border">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h4 className="text-xs font-black text-slate-300 uppercase flex items-center gap-2">
                <span className="w-2 h-4 bg-neon-cyan rounded" />
                PROFILE A SKILLS
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {(data?.resume1?.skillsFound || [])
                .slice(0, 10)
                .map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-slate-900 border border-tech-border text-slate-400 font-mono text-[10px] rounded hover:border-neon-cyan/30 hover:text-slate-100 transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          </div>

          {/* Resume 2 skills */}
          <div className="organic-card p-6 border border-tech-border">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h4 className="text-xs font-black text-slate-300 uppercase flex items-center gap-2">
                <span className="w-2 h-4 bg-neon-emerald rounded" />
                PROFILE B SKILLS
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {(data?.resume2?.skillsFound || [])
                .slice(0, 10)
                .map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-slate-900 border border-tech-border text-slate-400 font-mono text-[10px] rounded hover:border-neon-emerald/30 hover:text-slate-100 transition-colors cursor-default"
                  >
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
