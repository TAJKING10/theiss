"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, 
  Mic, 
  Settings, 
  Plus, 
  Circle, 
  Square, 
  Pause, 
  MessageSquare, 
  Sparkles, 
  Activity, 
  ArrowLeft,
  Search,
  CheckCircle2,
  Info,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { cn } from "@/lib/utils";

export default function InterviewsPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const candidates = [
    { id: "1", name: "Alex Thompson", position: "Frontend Developer" },
    { id: "2", name: "Maria Garcia", position: "Backend Developer" },
    { id: "3", name: "David Kim", position: "Full Stack Developer" },
  ];

  const realtimeInsights = [
    { type: "positive", text: "Candidate demonstrates strong technical knowledge", time: "2:34" },
    { type: "neutral", text: "Discussing previous project experience", time: "3:12" },
    { type: "positive", text: "Clear communication and articulation", time: "4:45" },
    { type: "suggestion", text: "Consider asking about team collaboration", time: "5:20" },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative">
      <GradientBackground />

      <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full bg-white/5 h-10 w-10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">Live Interview</h1>
              <p className="text-white/50 text-sm">Conduct AI-assisted interviews with real-time analysis.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Link href="/dashboard/interviews/lobby">
              <Button variant="secondary" className="gap-2">
                <Settings className="w-4 h-4" /> Setup
              </Button>
            </Link>
            <Button className="gap-2 shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4" /> Schedule New
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-8">
            {/* Video Viewport */}
            <GlassCard className="p-0 border-none relative overflow-hidden aspect-video bg-black shadow-2xl">
              {!isRecording ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6"
                  >
                    <Video className="w-10 h-10 text-white/20" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">Ready to Start</h3>
                  <p className="text-white/40 mb-8 max-w-sm text-center">Select a candidate and connect your camera to begin the AI-powered session.</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Mock Video Placeholder with scanning effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                    <motion.div 
                      animate={{ y: ["0%", "100%", "0%"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute top-0 left-0 right-0 h-1 bg-blue-500/30 blur-sm z-10" 
                    />
                    {/* Pulsing AI points */}
                    <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,1)] animate-ping" />
                    <div className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_15px_rgba(139,92,246,1)] animate-ping" style={{ animationDelay: "1s" }} />
                  </div>
                  
                  <div className="relative z-10 text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/40 flex items-center justify-center mb-6 mx-auto backdrop-blur-md shadow-2xl"
                    >
                      <Mic className="w-12 h-12 text-blue-400" />
                    </motion.div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold tracking-tight">AI Active Analysis</p>
                      <p className="text-white/50">Processing multimodal signals...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Overlays */}
              <AnimatePresence>
                {isRecording && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-6 left-6 flex items-center gap-3 px-4 py-2 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/40 z-20"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]" />
                    <span className="text-red-100 text-sm font-bold tracking-widest">LIVE</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
                <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white font-mono text-sm shadow-xl">
                  {formatTime(duration)}
                </div>
              </div>

              {/* Bottom Controls Overlay */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-8 z-20">
                <GlassCard className="bg-black/80 backdrop-blur-2xl border-white/10 p-4 shadow-2xl flex flex-col md:flex-row items-center gap-4">
                  <select
                    value={selectedCandidate}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    className="w-full md:w-64 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                    disabled={isRecording}
                  >
                    <option value="" className="bg-black">Select Candidate</option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id} className="bg-black">
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button 
                      onClick={() => setIsRecording(!isRecording)}
                      disabled={!selectedCandidate && !isRecording}
                      variant={isRecording ? "secondary" : "primary"}
                      className={cn(
                        "flex-1 md:flex-none h-12 px-8 text-base font-bold",
                        isRecording ? "bg-red-500/20 border-red-500/40 text-red-100 hover:bg-red-500/30" : "bg-gradient-to-r from-blue-600 to-purple-600"
                      )}
                    >
                      {isRecording ? (
                        <><Square className="w-4 h-4 mr-2 fill-current" /> Stop</>
                      ) : (
                        <><Circle className="w-4 h-4 mr-2 fill-current" /> Start Session</>
                      )}
                    </Button>
                    
                    {isRecording && (
                      <Button variant="secondary" size="icon" className="h-12 w-12 rounded-xl">
                        <Pause className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </GlassCard>
              </div>
            </GlassCard>

            {/* AI Diagnostics Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <GlassCard variant="elevated" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" /> Multimodal Signals
                  </h3>
                  <span className="text-xs text-white/30 uppercase tracking-widest font-bold">Latency: 42ms</span>
                </div>
                
                <div className="space-y-5">
                  {[
                    { label: "Vocal Confidence", value: 87, color: "bg-green-500" },
                    { label: "Visual Engagement", value: 92, color: "bg-blue-500" },
                    { label: "Semantic Relevance", value: 89, color: "bg-purple-500" },
                  ].map((signal) => (
                    <div key={signal.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60 font-medium">{signal.label}</span>
                        <span className="text-white font-bold">{signal.value}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: isRecording ? `${signal.value}%` : "0%" }}
                          className={cn("h-full rounded-full", signal.color)} 
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Animated Waveform */}
                <div className="h-12 flex items-center gap-1 overflow-hidden px-4">
                  {[...Array(40)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        height: isRecording ? [10, Math.random() * 40 + 10, 10] : 10 
                      }}
                      transition={{ 
                        duration: 0.5, 
                        repeat: Infinity, 
                        delay: i * 0.05 
                      }}
                      className="flex-1 min-w-[3px] bg-gradient-to-t from-blue-500 to-purple-500 rounded-full opacity-60"
                    />
                  ))}
                </div>
              </GlassCard>

              <GlassCard variant="accent" className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold">AI Suggested Questions</h3>
                </div>
                
                <div className="space-y-3">
                  {[
                    "Based on the CV, ask about the 2022 project architecture.",
                    "Candidate mentioned 'scalability', follow up on load balancing.",
                    "Explore their experience with team conflict resolution."
                  ].map((q, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ x: 5 }}
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/5 text-left text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center justify-between group"
                    >
                      <span className="line-clamp-2">{q}</span>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-blue-400 shrink-0 ml-4" />
                    </motion.button>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full border-blue-500/20 text-blue-400 hover:bg-blue-500/10">
                  Generate More Questions
                </Button>
              </GlassCard>
            </div>
          </div>

          {/* Right Sidebar - Analytics & Notes */}
          <div className="space-y-8">
            <GlassCard className="p-0 border-white/5">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-widest text-white/50 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Live Insights
                </h3>
              </div>
              <div className="p-2 space-y-1 max-h-[500px] overflow-y-auto custom-scrollbar">
                {realtimeInsights.map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "p-4 rounded-xl mb-2 group cursor-default transition-all",
                      insight.type === "positive" ? "hover:bg-green-500/5" : "hover:bg-blue-500/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className={cn(
                          "text-sm font-medium leading-relaxed",
                          insight.type === "positive" ? "text-green-400" : insight.type === "suggestion" ? "text-blue-400" : "text-white/80"
                        )}>
                          {insight.text}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-white/20 whitespace-nowrap mt-1">{insight.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/50">Quick Notes</h3>
              <textarea 
                placeholder="Type your observations..."
                className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors resize-none placeholder:text-white/20"
              />
              <Button className="w-full h-12">Save Assessment</Button>
            </GlassCard>
            
            <GlassCard variant="elevated" className="flex items-center gap-4 p-4 border-white/10 group cursor-pointer hover:bg-white/5">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Fairness Metrics</h4>
                <p className="text-xs text-white/40">Real-time bias detection active</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
