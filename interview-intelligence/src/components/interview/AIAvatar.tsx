"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Mic, Brain } from "lucide-react";

export type AIState = "idle" | "speaking" | "listening" | "thinking";

interface AIAvatarProps {
  state: AIState;
  name?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const stateColors = {
  idle: {
    primary: "from-blue-500 to-cyan-500",
    glow: "shadow-blue-500/30",
    ring: "ring-blue-500/30",
    bg: "bg-blue-500/10",
  },
  speaking: {
    primary: "from-purple-500 to-pink-500",
    glow: "shadow-purple-500/50",
    ring: "ring-purple-500/50",
    bg: "bg-purple-500/10",
  },
  listening: {
    primary: "from-green-500 to-emerald-500",
    glow: "shadow-green-500/40",
    ring: "ring-green-500/40",
    bg: "bg-green-500/10",
  },
  thinking: {
    primary: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/40",
    ring: "ring-amber-500/40",
    bg: "bg-amber-500/10",
  },
};

const stateLabels = {
  idle: "Ready",
  speaking: "Speaking",
  listening: "Listening",
  thinking: "Thinking",
};

const stateIcons = {
  idle: null,
  speaking: Volume2,
  listening: Mic,
  thinking: Brain,
};

const sizes = {
  sm: {
    container: "w-16 h-16",
    orb: "w-12 h-12",
    icon: "w-4 h-4",
    text: "text-xs",
    waves: 3,
  },
  md: {
    container: "w-24 h-24",
    orb: "w-18 h-18",
    icon: "w-5 h-5",
    text: "text-sm",
    waves: 4,
  },
  lg: {
    container: "w-32 h-32",
    orb: "w-24 h-24",
    icon: "w-6 h-6",
    text: "text-base",
    waves: 5,
  },
};

export function AIAvatar({
  state,
  name = "Alex",
  showLabel = true,
  size = "lg",
  className = "",
}: AIAvatarProps) {
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const colors = stateColors[state];
  const sizeConfig = sizes[size];
  const StateIcon = stateIcons[state];

  // Simulate audio visualization
  useEffect(() => {
    if (state === "speaking" || state === "listening") {
      const interval = setInterval(() => {
        setPulseIntensity(Math.random());
      }, 100);
      return () => clearInterval(interval);
    } else {
      setPulseIntensity(0);
    }
  }, [state]);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Main Avatar Container */}
      <div className={`relative ${sizeConfig.container} flex items-center justify-center`}>
        {/* Outer Glow Ring */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${colors.primary} opacity-20 blur-xl`}
          animate={{
            scale: state === "speaking" ? [1, 1.2, 1] : state === "listening" ? [1, 1.1, 1] : 1,
            opacity: state === "idle" ? 0.1 : 0.3,
          }}
          transition={{
            duration: state === "speaking" ? 0.5 : 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Sound Waves (for speaking/listening) */}
        <AnimatePresence>
          {(state === "speaking" || state === "listening") && (
            <>
              {Array.from({ length: sizeConfig.waves }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute rounded-full border-2 ${
                    state === "speaking" ? "border-purple-500/30" : "border-green-500/30"
                  }`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{
                    scale: [1, 1.5 + i * 0.2, 2 + i * 0.3],
                    opacity: [0.5, 0.3, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeOut",
                  }}
                  style={{
                    width: `${60 + i * 15}%`,
                    height: `${60 + i * 15}%`,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Main Orb */}
        <motion.div
          className={`relative ${sizeConfig.orb} rounded-full bg-gradient-to-br ${colors.primary}
            shadow-lg ${colors.glow} ring-4 ${colors.ring} backdrop-blur-sm
            flex items-center justify-center overflow-hidden`}
          animate={{
            scale: state === "speaking" ? [1, 1.05 + pulseIntensity * 0.1, 1] : 1,
            rotate: state === "thinking" ? [0, 360] : 0,
          }}
          transition={{
            scale: { duration: 0.15, repeat: state === "speaking" ? Infinity : 0 },
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
          }}
        >
          {/* Inner Glass Effect */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/30 to-transparent" />

          {/* Core Glow */}
          <motion.div
            className="absolute inset-2 rounded-full bg-white/20 blur-sm"
            animate={{
              opacity: state === "idle" ? 0.3 : [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* State Icon */}
          <AnimatePresence mode="wait">
            {StateIcon && (
              <motion.div
                key={state}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                <StateIcon
                  className={`${sizeConfig.icon} text-white drop-shadow-lg ${
                    state === "speaking" ? "animate-pulse" : ""
                  }`}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Audio Visualization Bars (for speaking) */}
          {state === "speaking" && (
            <div className="absolute bottom-2 flex gap-0.5 items-end">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-white/60 rounded-full"
                  animate={{
                    height: [4, 8 + Math.random() * 8, 4],
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
          )}

          {/* Listening Indicator */}
          {state === "listening" && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-green-400/50"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            />
          )}

          {/* Thinking Dots */}
          {state === "thinking" && (
            <div className="absolute bottom-2 flex gap-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-white/80 rounded-full"
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Status Indicator Dot */}
        <motion.div
          className={`absolute bottom-0 right-0 w-4 h-4 rounded-full bg-gradient-to-br ${colors.primary}
            ring-2 ring-black/50 shadow-lg`}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: state === "speaking" ? 0.5 : 2,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <div className="text-center">
          <motion.p
            className={`font-semibold text-white ${sizeConfig.text}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {name}
          </motion.p>
          <motion.p
            key={state}
            className={`${sizeConfig.text} ${
              state === "speaking"
                ? "text-purple-400"
                : state === "listening"
                  ? "text-green-400"
                  : state === "thinking"
                    ? "text-amber-400"
                    : "text-blue-400"
            }`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {stateLabels[state]}
          </motion.p>
        </div>
      )}
    </div>
  );
}

// Compact version for smaller spaces
export function AIAvatarCompact({
  state,
  className = "",
}: {
  state: AIState;
  className?: string;
}) {
  const colors = stateColors[state];
  const StateIcon = stateIcons[state];

  return (
    <motion.div
      className={`flex items-center gap-2 px-3 py-2 rounded-full ${colors.bg} backdrop-blur-sm
        border border-white/10 ${className}`}
      animate={{
        scale: state === "speaking" ? [1, 1.02, 1] : 1,
      }}
      transition={{
        duration: 0.3,
        repeat: state === "speaking" ? Infinity : 0,
      }}
    >
      <motion.div
        className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors.primary}
          flex items-center justify-center shadow-lg ${colors.glow}`}
        animate={{
          scale: state === "speaking" ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 0.3,
          repeat: state === "speaking" ? Infinity : 0,
        }}
      >
        {StateIcon ? (
          <StateIcon className="w-4 h-4 text-white" />
        ) : (
          <div className="w-2 h-2 bg-white rounded-full" />
        )}
      </motion.div>
      <span className="text-sm font-medium text-white/90">Alex</span>
      <span
        className={`text-xs ${
          state === "speaking"
            ? "text-purple-400"
            : state === "listening"
              ? "text-green-400"
              : state === "thinking"
                ? "text-amber-400"
                : "text-blue-400"
        }`}
      >
        {stateLabels[state]}
      </span>
    </motion.div>
  );
}

export default AIAvatar;
