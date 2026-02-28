"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Scale, 
  Link as LinkIcon, 
  Users, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Mic, 
  Eye, 
  BarChart3,
  Slack,
  Video,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  ChevronRight,
  Info,
  FileText,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"ai" | "bias" | "integration" | "team">("ai");

  // AI Settings State
  const [aiSettings, setAiSettings] = useState({
    analysisDepth: "comprehensive",
    confidenceThreshold: 75,
    realtimeAnalysis: true,
    autoTranscription: true,
    sentimentAnalysis: true,
    bodyLanguageDetection: true,
    voiceToneAnalysis: true,
  });

  // Bias Settings State
  const [biasSettings, setBiasSettings] = useState({
    demographicBlinding: true,
    nameBlinding: false,
    ageBlinding: true,
    genderBlinding: true,
    accentNeutralization: true,
    biasAlertThreshold: 60,
    fairnessReporting: true,
    diversityMetrics: true,
  });

  const tabs = [
    { id: "ai", label: "AI Configuration", icon: Brain },
    { id: "bias", label: "Bias Controls", icon: Scale },
    { id: "integration", label: "Integrations", icon: LinkIcon },
    { id: "team", label: "Team Management", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative">
      <GradientBackground />

      <div className="p-4 md:p-8 max-w-6xl mx-auto pb-32">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Settings</h1>
          <p className="text-white/50">Configure AI analysis, bias detection, and enterprise integrations.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-full transition-all whitespace-nowrap border",
                  activeTab === tab.id 
                    ? "bg-white/10 text-white border-white/20 shadow-xl" 
                    : "text-white/40 hover:text-white hover:bg-white/5 border-transparent"
                )}
              >
                <Icon className={cn("w-4 h-4", activeTab === tab.id ? "text-blue-400" : "text-white/20")} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* AI Configuration Tab */}
            {activeTab === "ai" && (
              <div className="space-y-8">
                {/* Analysis Depth */}
                <GlassCard variant="elevated" className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Analysis Depth</h3>
                      <p className="text-white/40 text-sm">Select the complexity level of our multimodal analysis engine.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: "basic", name: "Basic", description: "Quick analysis with core metrics", time: "~30s", icon: Zap },
                      { id: "standard", name: "Standard", description: "Balanced depth and speed", time: "~1min", icon: BarChart3 },
                      { id: "comprehensive", name: "Comprehensive", description: "Full multimodal analysis", time: "~2min", icon: Layers },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setAiSettings({ ...aiSettings, analysisDepth: option.id })}
                        className={cn(
                          "p-5 rounded-2xl text-left transition-all border group relative overflow-hidden",
                          aiSettings.analysisDepth === option.id
                            ? "bg-blue-500/10 border-blue-500/50 shadow-2xl"
                            : "bg-white/[0.02] border-white/5 hover:border-white/20"
                        )}
                      >
                        <option.icon className={cn("w-5 h-5 mb-4 transition-colors", aiSettings.analysisDepth === option.id ? "text-blue-400" : "text-white/20")} />
                        <div className="font-bold mb-1">{option.name}</div>
                        <div className="text-xs text-white/40 mb-3">{option.description}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500/60">{option.time}</div>
                        {aiSettings.analysisDepth === option.id && (
                          <motion.div layoutId="depth-glow" className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
                        )}
                      </button>
                    ))}
                  </div>
                </GlassCard>

                {/* Confidence Threshold */}
                <GlassCard variant="default" className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-bold">Confidence Threshold</h3>
                      <p className="text-white/40 text-sm">Minimum confidence level required for AI observations to be reported.</p>
                    </div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {aiSettings.confidenceThreshold}%
                    </div>
                  </div>
                  <div className="relative group px-2">
                    <input
                      type="range"
                      min="50"
                      max="95"
                      value={aiSettings.confidenceThreshold}
                      onChange={(e) => setAiSettings({ ...aiSettings, confidenceThreshold: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-white/20 mt-4">
                      <span>Lenient (50%)</span>
                      <span>Strict (95%)</span>
                    </div>
                  </div>
                </GlassCard>

                {/* AI Features Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: "realtimeAnalysis", label: "Real-time Analysis", description: "Analyze interviews as they happen", icon: Zap },
                    { key: "autoTranscription", label: "Auto Transcription", description: "Automatically transcribe speech to text", icon: FileText },
                    { key: "sentimentAnalysis", label: "Sentiment Analysis", description: "Detect emotional tone and sentiment", icon: HeartIcon },
                    { key: "bodyLanguageDetection", label: "Body Language Detection", description: "Analyze posture and gestures", icon: Eye },
                    { key: "voiceToneAnalysis", label: "Voice Tone Analysis", description: "Analyze vocal patterns and confidence", icon: Mic },
                  ].map((feature) => (
                    <GlassCard 
                      key={feature.key} 
                      className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-blue-500/20 group-hover:bg-blue-500/5 transition-all">
                          {feature.icon === HeartIcon ? <Brain className="w-5 h-5" /> : <feature.icon className="w-5 h-5 text-white/40 group-hover:text-blue-400" />}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{feature.label}</div>
                          <div className="text-xs text-white/40">{feature.description}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setAiSettings({ ...aiSettings, [feature.key]: !aiSettings[feature.key as keyof typeof aiSettings] })}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative border",
                          aiSettings[feature.key as keyof typeof aiSettings] ? "bg-blue-500 border-blue-400" : "bg-white/5 border-white/10"
                        )}
                      >
                        <motion.div
                          animate={{ x: aiSettings[feature.key as keyof typeof aiSettings] ? 24 : 4 }}
                          className="absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm"
                        />
                      </button>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {/* Bias Controls Tab */}
            {activeTab === "bias" && (
              <div className="space-y-8">
                {/* Bias Alert Banner */}
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-3xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-8 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <AlertTriangle size={120} className="text-yellow-500" />
                  </div>
                  <div className="relative z-10 flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-3xl flex-shrink-0 border border-yellow-500/30">
                      <Scale className="text-yellow-400 w-8 h-8" />
                    </div>
                    <div className="max-w-2xl">
                      <h3 className="text-2xl font-bold mb-2 text-yellow-100 tracking-tight">Bias Detection Active</h3>
                      <p className="text-yellow-100/60 leading-relaxed">
                        Our AI continuously monitors for potential biases in interview evaluations.
                        Alerts are triggered when bias indicators exceed your configured threshold. 
                        We recommend keeping 'Demographic Blinding' enabled for maximum fairness.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Demographic Blinding */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: "nameBlinding", label: "Name Blinding", description: "Hide candidate names during analysis", icon: Users },
                    { key: "ageBlinding", label: "Age Blinding", description: "Exclude age-related information", icon: Calendar },
                    { key: "genderBlinding", label: "Gender Blinding", description: "Remove gender indicators", icon: Users },
                    { key: "accentNeutralization", label: "Accent Neutralization", description: "Normalize accent variations in scoring", icon: Mic },
                  ].map((option) => (
                    <GlassCard
                      key={option.key}
                      className={cn(
                        "p-6 transition-all border-l-4",
                        biasSettings[option.key as keyof typeof biasSettings]
                          ? "border-l-green-500 bg-green-500/5"
                          : "border-l-transparent hover:border-l-white/10"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-white/5">
                          <option.icon className={cn("w-5 h-5", biasSettings[option.key as keyof typeof biasSettings] ? "text-green-400" : "text-white/20")} />
                        </div>
                        <button
                          onClick={() => setBiasSettings({ ...biasSettings, [option.key]: !biasSettings[option.key as keyof typeof biasSettings] })}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative border",
                            biasSettings[option.key as keyof typeof biasSettings] ? "bg-green-500 border-green-400" : "bg-white/5 border-white/10"
                          )}
                        >
                          <motion.div
                            animate={{ x: biasSettings[option.key as keyof typeof biasSettings] ? 24 : 4 }}
                            className="absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm"
                          />
                        </button>
                      </div>
                      <div className="font-bold mb-1">{option.label}</div>
                      <div className="text-xs text-white/40">{option.description}</div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === "integration" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "Slack", icon: Slack, status: "connected", description: "Real-time hiring notifications" },
                  { name: "Zoom", icon: Video, status: "connected", description: "Video interview scheduling" },
                  { name: "Calendar", icon: Calendar, status: "connected", description: "Sync recruitment schedule" },
                  { name: "Greenhouse", icon: Layers, status: "disconnected", description: "ATS Integration" },
                ].map((integration) => (
                  <GlassCard key={integration.name} className="p-6 group">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <integration.icon className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="font-bold text-lg">{integration.name}</div>
                          <div className="text-xs text-white/40">{integration.description}</div>
                        </div>
                      </div>
                      <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                        integration.status === "connected" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-white/5 text-white/20 border-white/10"
                      )}>
                        {integration.status === "connected" && <CheckCircle2 size={10} />}
                        {integration.status}
                      </div>
                    </div>
                    <Button variant={integration.status === "connected" ? "secondary" : "outline"} className="w-full">
                      {integration.status === "connected" ? "Manage Integration" : "Connect Account"}
                    </Button>
                  </GlassCard>
                ))}
              </div>
            )}

            {/* Team Tab */}
            {activeTab === "team" && (
              <GlassCard className="p-0 border-white/10">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Team Members</h3>
                    <p className="text-xs text-white/40">Manage roles and permissions for your team.</p>
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Invite
                  </Button>
                </div>
                <div className="divide-y divide-white/5">
                  {[
                    { name: "John Smith", email: "john@company.com", role: "Admin", avatar: "JS" },
                    { name: "Sarah Johnson", email: "sarah@company.com", role: "Recruiter", avatar: "SJ" },
                  ].map((member) => (
                    <div key={member.email} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xs border border-white/10">
                          {member.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{member.name}</div>
                          <div className="text-xs text-white/40">{member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-white/40 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                          {member.role}
                        </span>
                        <Button variant="ghost" size="icon" className="text-white/20 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Floating Actions */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-50">
          <GlassCard className="bg-black/80 backdrop-blur-2xl border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between p-4 px-8">
            <span className="text-sm font-medium text-white/50 hidden md:block">You have unsaved changes</span>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button variant="ghost" size="sm" className="flex-1 md:flex-none">Reset</Button>
              <Button size="md" className="flex-1 md:flex-none px-10 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                Save All Changes
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// Simple HeartIcon fallback since it's not in my thought process imports but I used it
const HeartIcon = Brain; 
