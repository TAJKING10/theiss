"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { BodyLanguageResult } from "@/hooks/useBodyLanguageDetection";

interface BodyLanguagePanelProps {
  current: BodyLanguageResult;
  dominant: string | null;
  averageScore: number;
  eyeContactPct: number;
  goodPosturePct: number;
  isAnalyzing: boolean;
  apiAvailable: boolean;
}

const COLOR = {
  green:  { bg: "bg-green-500/10",  border: "border-green-500/30",  text: "text-green-400",  bar: "bg-green-500" },
  blue:   { bg: "bg-blue-500/10",   border: "border-blue-500/30",   text: "text-blue-400",   bar: "bg-blue-500" },
  yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", bar: "bg-yellow-500" },
  red:    { bg: "bg-red-500/10",    border: "border-red-500/30",    text: "text-red-400",    bar: "bg-red-500" },
  gray:   { bg: "bg-white/5",       border: "border-white/10",      text: "text-white/40",   bar: "bg-white/20" },
};

function ScoreBar({ label, value, color = "blue" }: { label: string; value: number; color?: string }) {
  const barColor = value >= 75 ? "bg-green-500" : value >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/50">{label}</span>
        <span className="text-white/70 font-mono">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </div>
  );
}

export function BodyLanguagePanel({
  current,
  dominant,
  averageScore,
  eyeContactPct,
  goodPosturePct,
  isAnalyzing,
  apiAvailable,
}: BodyLanguagePanelProps) {
  if (!apiAvailable) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <p className="text-xs text-white/30 text-center">Body language detection offline</p>
        <p className="text-xs text-white/20 text-center mt-1">Start: python emotion_service/body_language_api.py</p>
      </div>
    );
  }

  const c = COLOR[current.color as keyof typeof COLOR] ?? COLOR.gray;

  return (
    <div className={`rounded-2xl border ${c.bg} ${c.border} p-4 space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">
          Body Language
        </span>
        {isAnalyzing && (
          <span className="flex items-center gap-1 text-xs text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Scanning
          </span>
        )}
      </div>

      {/* Current detection */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="flex items-center gap-3"
        >
          <span className="text-3xl">{current.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className={`text-lg font-bold ${c.text} truncate`}>{current.label}</p>
            <p className="text-xs text-white/40 truncate">{current.tip}</p>
          </div>
          {current.confidence > 0 && (
            <span className={`text-sm font-mono ${c.text} shrink-0`}>
              {current.body_language_score}%
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Posture & eye contact badges */}
      {current.face_visible && (
        <div className="flex gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded-full text-xs border ${
            current.posture === "good"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
          }`}>
            {current.posture === "good" ? "✓" : "⚠"} {current.posture_tip || current.posture}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs border ${
            current.eye_contact
              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
              : "bg-white/5 border-white/10 text-white/30"
          }`}>
            {current.eye_contact ? "👁 Eye contact" : "👁 Looking away"}
          </span>
          {current.gesturing && (
            <span className="px-2 py-0.5 rounded-full text-xs border bg-purple-500/10 border-purple-500/30 text-purple-400">
              🤲 Gesturing
            </span>
          )}
        </div>
      )}

      {/* Running averages */}
      {averageScore > 0 && (
        <div className="space-y-2 pt-1 border-t border-white/10">
          <ScoreBar label="Body Language Score" value={averageScore} />
          <ScoreBar label="Eye Contact"         value={eyeContactPct} />
          <ScoreBar label="Good Posture"        value={goodPosturePct} />
        </div>
      )}

      {/* Dominant emotion summary */}
      {dominant && averageScore > 0 && (
        <p className="text-xs text-white/30 pt-1 border-t border-white/10">
          Overall impression: <span className="text-white/60 font-medium">{dominant}</span>
        </p>
      )}
    </div>
  );
}
