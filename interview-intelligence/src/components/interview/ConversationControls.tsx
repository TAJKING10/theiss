"use client";

import { motion } from "framer-motion";
import {
  RotateCcw,
  SkipForward,
  ArrowLeft,
  HelpCircle,
  Lightbulb,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Pause,
  Play,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ConversationControlsProps {
  onRepeat: () => void;
  onSkip: () => void;
  onGoBack: () => void;
  onClarify?: () => void;
  onExample?: () => void;
  canGoBack?: boolean;
  canSkip?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function ConversationControls({
  onRepeat,
  onSkip,
  onGoBack,
  onClarify,
  onExample,
  canGoBack = true,
  canSkip = true,
  isDisabled = false,
  className = "",
}: ConversationControlsProps) {
  const controls = [
    {
      icon: ArrowLeft,
      label: "Previous",
      shortcut: "P",
      onClick: onGoBack,
      disabled: !canGoBack || isDisabled,
      tooltip: "Go back to the previous question",
    },
    {
      icon: RotateCcw,
      label: "Repeat",
      shortcut: "R",
      onClick: onRepeat,
      disabled: isDisabled,
      tooltip: "Repeat the current question",
    },
    {
      icon: SkipForward,
      label: "Skip",
      shortcut: "S",
      onClick: onSkip,
      disabled: !canSkip || isDisabled,
      tooltip: "Skip to the next question",
    },
  ];

  const assistControls = onClarify || onExample ? [
    ...(onClarify ? [{
      icon: HelpCircle,
      label: "Clarify",
      onClick: onClarify,
      disabled: isDisabled,
      tooltip: "Ask for clarification",
    }] : []),
    ...(onExample ? [{
      icon: Lightbulb,
      label: "Example",
      onClick: onExample,
      disabled: isDisabled,
      tooltip: "Get an example answer structure",
    }] : []),
  ] : [];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Main Controls */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
        {controls.map((control) => (
          <motion.button
            key={control.label}
            onClick={control.onClick}
            disabled={control.disabled}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              "hover:bg-white/10 active:scale-95",
              control.disabled
                ? "opacity-30 cursor-not-allowed"
                : "text-white/80 hover:text-white"
            )}
            whileHover={{ scale: control.disabled ? 1 : 1.02 }}
            whileTap={{ scale: control.disabled ? 1 : 0.98 }}
            title={control.tooltip}
          >
            <control.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{control.label}</span>
            {control.shortcut && (
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-xs rounded bg-white/10 text-white/50">
                {control.shortcut}
              </kbd>
            )}
          </motion.button>
        ))}
      </div>

      {/* Assist Controls */}
      {assistControls.length > 0 && (
        <div className="flex items-center gap-1 p-1 rounded-xl bg-blue-500/10 backdrop-blur-sm border border-blue-500/20">
          {assistControls.map((control) => (
            <motion.button
              key={control.label}
              onClick={control.onClick}
              disabled={control.disabled}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                "hover:bg-blue-500/20 active:scale-95",
                control.disabled
                  ? "opacity-30 cursor-not-allowed"
                  : "text-blue-300 hover:text-blue-200"
              )}
              whileHover={{ scale: control.disabled ? 1 : 1.02 }}
              whileTap={{ scale: control.disabled ? 1 : 0.98 }}
              title={control.tooltip}
            >
              <control.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{control.label}</span>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

interface MediaControlsProps {
  videoEnabled: boolean;
  audioEnabled: boolean;
  aiSpeechEnabled: boolean;
  isPaused: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleAiSpeech: () => void;
  onTogglePause: () => void;
  onEndInterview: () => void;
  isDisabled?: boolean;
  className?: string;
}

export function MediaControls({
  videoEnabled,
  audioEnabled,
  aiSpeechEnabled,
  isPaused,
  onToggleVideo,
  onToggleAudio,
  onToggleAiSpeech,
  onTogglePause,
  onEndInterview,
  isDisabled = false,
  className = "",
}: MediaControlsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      {/* Video Toggle */}
      <motion.button
        onClick={onToggleVideo}
        disabled={isDisabled}
        className={cn(
          "p-3 rounded-full transition-all",
          videoEnabled
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={videoEnabled ? "Turn off camera" : "Turn on camera"}
      >
        {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </motion.button>

      {/* Audio Toggle */}
      <motion.button
        onClick={onToggleAudio}
        disabled={isDisabled}
        className={cn(
          "p-3 rounded-full transition-all",
          audioEnabled
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={audioEnabled ? "Mute microphone" : "Unmute microphone"}
      >
        {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </motion.button>

      {/* AI Speech Toggle */}
      <motion.button
        onClick={onToggleAiSpeech}
        disabled={isDisabled}
        className={cn(
          "p-3 rounded-full transition-all",
          aiSpeechEnabled
            ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
            : "bg-white/10 text-white/50 hover:bg-white/20"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={aiSpeechEnabled ? "Mute AI voice" : "Enable AI voice"}
      >
        {aiSpeechEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </motion.button>

      {/* Pause Toggle */}
      <motion.button
        onClick={onTogglePause}
        disabled={isDisabled}
        className={cn(
          "p-3 rounded-full transition-all",
          isPaused
            ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
            : "bg-white/10 text-white hover:bg-white/20"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={isPaused ? "Resume interview" : "Pause interview"}
      >
        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
      </motion.button>

      {/* End Interview */}
      <motion.button
        onClick={onEndInterview}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-red-500/20 text-red-400
          hover:bg-red-500/30 border border-red-500/30 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title="End interview"
      >
        <Square className="w-4 h-4 fill-current" />
        <span className="font-medium">End</span>
      </motion.button>
    </div>
  );
}

interface ProgressIndicatorProps {
  current: number;
  total: number;
  scores?: number[];
  className?: string;
}

export function ProgressIndicator({
  current,
  total,
  scores = [],
  className = "",
}: ProgressIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {Array.from({ length: total }).map((_, i) => {
        const score = scores[i];
        const isCompleted = i < current;
        const isCurrent = i === current;

        let bgColor = "bg-white/20";
        if (isCompleted && score !== undefined) {
          bgColor = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500";
        } else if (isCurrent) {
          bgColor = "bg-blue-500";
        }

        return (
          <motion.div
            key={i}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              bgColor,
              isCurrent && "ring-2 ring-blue-400/50 animate-pulse"
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            title={
              isCompleted && score !== undefined
                ? `Q${i + 1}: ${score}%`
                : isCurrent
                  ? `Q${i + 1}: Current`
                  : `Q${i + 1}: Pending`
            }
          />
        );
      })}
    </div>
  );
}

export default ConversationControls;
