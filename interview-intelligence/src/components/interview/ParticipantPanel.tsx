"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Copy,
  Check,
  Eye,
  EyeOff,
  X,
  Mail,
  Link2,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { useInterviewObservers, type Observer } from "@/hooks/useInterviewObservers";

interface ParticipantPanelProps {
  interviewId: string;
  candidateName: string;
  isHost?: boolean;
  className?: string;
}

const roleLabels = {
  hr: "HR",
  hiring_manager: "Hiring Manager",
  team_member: "Team Member",
};

const roleColors = {
  hr: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  hiring_manager: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  team_member: "bg-green-500/20 text-green-400 border-green-500/30",
};

export function ParticipantPanel({
  interviewId,
  candidateName,
  isHost = true,
  className = "",
}: ParticipantPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use real-time observers hook
  const { observers, isConnected, onlineCount } = useInterviewObservers({
    interviewId,
    enabled: true,
  });

  const copyObserverLink = () => {
    const link = `${window.location.origin}/interview/${interviewId}/observe`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <GlassCard className={cn("overflow-hidden", className)}>
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="font-semibold">Participants</span>
            {onlineCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                {onlineCount} watching
              </span>
            )}
            {isConnected ? (
              <Wifi className="w-3 h-3 text-green-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-red-400" />
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-white/50" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white/50" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-4 pb-4 space-y-4">
                {/* Candidate */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="font-bold text-sm">
                        {candidateName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{candidateName}</p>
                      <p className="text-xs text-white/50">Candidate</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-green-400">Live</span>
                    </div>
                  </div>
                </div>

                {/* Observers List */}
                {observers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-white/50 uppercase tracking-wider">Observers</p>
                    {observers.map((observer) => (
                      <div
                        key={observer.id}
                        className="p-3 rounded-xl bg-white/5 flex items-center gap-3"
                      >
                        <div className="relative">
                          {observer.avatar ? (
                            <img
                              src={observer.avatar}
                              alt={observer.name}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {observer.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                              </span>
                            </div>
                          )}
                          {observer.isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{observer.name}</p>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full border", roleColors[observer.role])}>
                            {roleLabels[observer.role]}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {observer.isOnline ? (
                            <Eye className="w-4 h-4 text-green-400" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-white/30" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Invite Section */}
                {isHost && (
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <p className="text-xs text-white/50 uppercase tracking-wider">Invite Observers</p>

                    {/* Quick Link Copy */}
                    <div className="flex gap-2">
                      <div className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/50 truncate">
                        {`${typeof window !== "undefined" ? window.location.origin : ""}/interview/${interviewId}/observe`}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={copyObserverLink}
                        className="shrink-0"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>

                    {/* Invite Button */}
                    <Button
                      variant="secondary"
                      className="w-full gap-2"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <UserPlus className="w-4 h-4" />
                      Invite HR or Team Member
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        interviewId={interviewId}
      />
    </>
  );
}

// Observer notification badge (shows when observer joins)
export function ObserverBadge({
  observers,
  className = "",
}: {
  observers: Observer[];
  className?: string;
}) {
  const onlineCount = observers.filter((o) => o.isOnline).length;

  if (onlineCount === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-purple-500/20 border border-purple-500/30 backdrop-blur-sm",
        className
      )}
    >
      <Eye className="w-4 h-4 text-purple-400" />
      <span className="text-sm text-purple-300">
        {onlineCount} observer{onlineCount > 1 ? "s" : ""} watching
      </span>
    </motion.div>
  );
}

// Invite Modal Component
function InviteModal({
  isOpen,
  onClose,
  interviewId,
}: {
  isOpen: boolean;
  onClose: () => void;
  interviewId: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    const link = `${window.location.origin}/interview/${interviewId}/observe`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md"
      >
        <GlassCard className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-400" />
              Invite Observer
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Copy Link Section */}
          <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-300 mb-3 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Quick Share Link
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/interview/${interviewId}/observe`}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm truncate"
              />
              <Button onClick={copyLink} variant="secondary">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-medium mb-2">How it works:</h3>
              <ul className="text-sm text-white/70 space-y-2">
                <li className="flex gap-2">
                  <span className="text-blue-400">1.</span>
                  Share the link with your HR team or hiring managers
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">2.</span>
                  They open the link and enter their name
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">3.</span>
                  They can watch live and take private notes
                </li>
              </ul>
            </div>

            <Button onClick={onClose} variant="secondary" className="w-full">
              Done
            </Button>
          </div>

          {/* Note */}
          <p className="mt-4 text-xs text-white/30 text-center">
            Observers can watch the interview in real-time and take private notes.
            They cannot interfere with the interview.
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default ParticipantPanel;
