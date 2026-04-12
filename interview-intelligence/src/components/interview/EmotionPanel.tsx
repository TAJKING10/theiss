"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { EmotionResult } from "@/hooks/useSpeechEmotionDetection";

interface EmotionPanelProps {
  currentEmotion: EmotionResult;
  emotionHistory: EmotionResult[];
  dominantEmotion: string | null;
  isAnalyzing: boolean;
  apiAvailable: boolean;
}

const COLOR_CLASSES = {
  green:  { bg: "bg-green-500/10",  border: "border-green-500/30",  text: "text-green-400",  dot: "bg-green-400" },
  blue:   { bg: "bg-blue-500/10",   border: "border-blue-500/30",   text: "text-blue-400",   dot: "bg-blue-400" },
  red:    { bg: "bg-red-500/10",    border: "border-red-500/30",    text: "text-red-400",    dot: "bg-red-400" },
  yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", dot: "bg-yellow-400" },
  gray:   { bg: "bg-white/5",       border: "border-white/10",      text: "text-white/50",   dot: "bg-white/30" },
};

const EMOTION_HISTORY_LABELS: Record<string, { emoji: string; short: string }> = {
  relaxed:  { emoji: "😊", short: "Relaxed" },
  happy:    { emoji: "😄", short: "Happy" },
  stressed: { emoji: "😤", short: "Stressed" },
  nervous:  { emoji: "😰", short: "Nervous" },
};

export function EmotionPanel({
  currentEmotion,
  emotionHistory,
  dominantEmotion,
  isAnalyzing,
  apiAvailable,
}: EmotionPanelProps) {
  const colors = COLOR_CLASSES[currentEmotion.color] ?? COLOR_CLASSES.gray;

  if (!apiAvailable) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <p className="text-xs text-white/30 text-center">
          Emotion analysis offline
        </p>
      </div>
    );
  }

  // Build score bars
  const scoreEntries = Object.entries(currentEmotion.all_scores).sort((a, b) => b[1] - a[1]);

  return (
    <div className={`rounded-2xl border ${colors.bg} ${colors.border} p-4 space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">
          Emotion Analysis
        </span>
        {isAnalyzing && (
          <span className="flex items-center gap-1 text-xs text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Analyzing…
          </span>
        )}
      </div>

      {/* Current emotion */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentEmotion.emotion}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <span className="text-4xl">{currentEmotion.emoji}</span>
          <div>
            <p className={`text-xl font-bold ${colors.text}`}>{currentEmotion.label}</p>
            <p className="text-xs text-white/40">{currentEmotion.description}</p>
          </div>
          {currentEmotion.confidence > 0 && (
            <span className={`ml-auto text-sm font-mono ${colors.text}`}>
              {currentEmotion.confidence}%
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Score bars */}
      {scoreEntries.length > 0 && (
        <div className="space-y-1.5">
          {scoreEntries.map(([emotion, score]) => {
            const info = EMOTION_HISTORY_LABELS[emotion] ?? { emoji: "😐", short: emotion };
            return (
              <div key={emotion} className="flex items-center gap-2">
                <span className="text-xs w-4">{info.emoji}</span>
                <span className="text-xs text-white/50 w-14">{info.short}</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${
                      emotion === currentEmotion.emotion ? colors.dot : "bg-white/20"
                    }`}
                  />
                </div>
                <span className="text-xs text-white/30 w-8 text-right">{score}%</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Dominant emotion summary */}
      {dominantEmotion && emotionHistory.length >= 3 && (
        <div className="pt-2 border-t border-white/10">
          <p className="text-xs text-white/40">
            Overall:{" "}
            <span className="text-white/70 font-medium">
              {EMOTION_HISTORY_LABELS[dominantEmotion]?.emoji}{" "}
              {EMOTION_HISTORY_LABELS[dominantEmotion]?.short ?? dominantEmotion}
            </span>
            {" "}(last {emotionHistory.length} samples)
          </p>
        </div>
      )}
    </div>
  );
}
