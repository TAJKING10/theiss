"use client";

import { useState } from "react";

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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-white/50">Configure AI analysis, bias detection, and integrations.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-white/5 -mx-8 px-8">
        {[
          { id: "ai", label: "AI Configuration", icon: "🧠" },
          { id: "bias", label: "Bias Controls", icon: "⚖️" },
          { id: "integration", label: "Integrations", icon: "🔗" },
          { id: "team", label: "Team", icon: "👥" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id ? "text-white" : "text-white/50 hover:text-white"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600" />
            )}
          </button>
        ))}
      </div>

      {/* AI Configuration Tab */}
      {activeTab === "ai" && (
        <div className="space-y-8">
          {/* Analysis Depth */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
            <h3 className="font-semibold text-lg mb-4">Analysis Depth</h3>
            <p className="text-white/50 text-sm mb-4">Choose how thorough the AI analysis should be.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: "basic", name: "Basic", description: "Quick analysis with core metrics", time: "~30s" },
                { id: "standard", name: "Standard", description: "Balanced depth and speed", time: "~1min" },
                { id: "comprehensive", name: "Comprehensive", description: "Full multimodal analysis", time: "~2min" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setAiSettings({ ...aiSettings, analysisDepth: option.id })}
                  className={`p-4 rounded-xl text-left transition-all ${
                    aiSettings.analysisDepth === option.id
                      ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-500/30"
                      : "bg-white/[0.02] border border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="font-medium mb-1">{option.name}</div>
                  <div className="text-sm text-white/50 mb-2">{option.description}</div>
                  <div className="text-xs text-blue-400">{option.time}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Confidence Threshold */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Confidence Threshold</h3>
                <p className="text-white/50 text-sm">Minimum confidence level for AI predictions.</p>
              </div>
              <span className="text-2xl font-bold text-blue-400">{aiSettings.confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={aiSettings.confidenceThreshold}
              onChange={(e) => setAiSettings({ ...aiSettings, confidenceThreshold: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
            />
            <div className="flex justify-between text-xs text-white/30 mt-2">
              <span>More Results (50%)</span>
              <span>Higher Accuracy (95%)</span>
            </div>
          </div>

          {/* AI Features Toggles */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
            <h3 className="font-semibold text-lg mb-4">AI Features</h3>
            <div className="space-y-4">
              {[
                { key: "realtimeAnalysis", label: "Real-time Analysis", description: "Analyze interviews as they happen" },
                { key: "autoTranscription", label: "Auto Transcription", description: "Automatically transcribe speech to text" },
                { key: "sentimentAnalysis", label: "Sentiment Analysis", description: "Detect emotional tone and sentiment" },
                { key: "bodyLanguageDetection", label: "Body Language Detection", description: "Analyze posture and gestures" },
                { key: "voiceToneAnalysis", label: "Voice Tone Analysis", description: "Analyze vocal patterns and confidence" },
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02]">
                  <div>
                    <div className="font-medium">{feature.label}</div>
                    <div className="text-sm text-white/50">{feature.description}</div>
                  </div>
                  <button
                    onClick={() => setAiSettings({ ...aiSettings, [feature.key]: !aiSettings[feature.key as keyof typeof aiSettings] })}
                    className={`w-12 h-6 rounded-full transition-all relative ${
                      aiSettings[feature.key as keyof typeof aiSettings] ? "bg-blue-500" : "bg-white/20"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                        aiSettings[feature.key as keyof typeof aiSettings] ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bias Controls Tab */}
      {activeTab === "bias" && (
        <div className="space-y-8">
          {/* Bias Alert Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Bias Detection Active</h3>
                <p className="text-white/60 text-sm">
                  Our AI continuously monitors for potential biases in interview evaluations.
                  Alerts are triggered when bias indicators exceed your configured threshold.
                </p>
              </div>
            </div>
          </div>

          {/* Demographic Blinding */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
            <h3 className="font-semibold text-lg mb-4">Demographic Blinding</h3>
            <p className="text-white/50 text-sm mb-4">Hide certain candidate information from the AI analysis to reduce bias.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "nameBlinding", label: "Name Blinding", description: "Hide candidate names during analysis", icon: "👤" },
                { key: "ageBlinding", label: "Age Blinding", description: "Exclude age-related information", icon: "📅" },
                { key: "genderBlinding", label: "Gender Blinding", description: "Remove gender indicators", icon: "⚧" },
                { key: "accentNeutralization", label: "Accent Neutralization", description: "Normalize accent variations in scoring", icon: "🗣" },
              ].map((option) => (
                <div
                  key={option.key}
                  className={`p-4 rounded-xl transition-all ${
                    biasSettings[option.key as keyof typeof biasSettings]
                      ? "bg-green-500/10 border border-green-500/20"
                      : "bg-white/[0.02] border border-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{option.icon}</span>
                    <button
                      onClick={() => setBiasSettings({ ...biasSettings, [option.key]: !biasSettings[option.key as keyof typeof biasSettings] })}
                      className={`w-12 h-6 rounded-full transition-all relative ${
                        biasSettings[option.key as keyof typeof biasSettings] ? "bg-green-500" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                          biasSettings[option.key as keyof typeof biasSettings] ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-white/50">{option.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bias Alert Threshold */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Bias Alert Threshold</h3>
                <p className="text-white/50 text-sm">Trigger alerts when bias indicators exceed this level.</p>
              </div>
              <span className="text-2xl font-bold text-yellow-400">{biasSettings.biasAlertThreshold}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              value={biasSettings.biasAlertThreshold}
              onChange={(e) => setBiasSettings({ ...biasSettings, biasAlertThreshold: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-500"
            />
            <div className="flex justify-between text-xs text-white/30 mt-2">
              <span>Sensitive (20%)</span>
              <span>Lenient (80%)</span>
            </div>
          </div>

          {/* Reporting Options */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
            <h3 className="font-semibold text-lg mb-4">Reporting & Compliance</h3>
            <div className="space-y-4">
              {[
                { key: "fairnessReporting", label: "Fairness Reports", description: "Generate detailed fairness analysis reports" },
                { key: "diversityMetrics", label: "Diversity Metrics", description: "Track diversity metrics across interviews" },
              ].map((option) => (
                <div key={option.key} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02]">
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-white/50">{option.description}</div>
                  </div>
                  <button
                    onClick={() => setBiasSettings({ ...biasSettings, [option.key]: !biasSettings[option.key as keyof typeof biasSettings] })}
                    className={`w-12 h-6 rounded-full transition-all relative ${
                      biasSettings[option.key as keyof typeof biasSettings] ? "bg-green-500" : "bg-white/20"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                        biasSettings[option.key as keyof typeof biasSettings] ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === "integration" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: "Slack", icon: "💬", status: "connected", description: "Get notifications in Slack" },
              { name: "Google Calendar", icon: "📅", status: "connected", description: "Sync interview schedules" },
              { name: "Greenhouse", icon: "🌱", status: "disconnected", description: "ATS integration" },
              { name: "Lever", icon: "📊", status: "disconnected", description: "Recruiting platform" },
              { name: "Workday", icon: "💼", status: "disconnected", description: "HR management system" },
              { name: "Zoom", icon: "📹", status: "connected", description: "Video conferencing" },
            ].map((integration) => (
              <div key={integration.name} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{integration.icon}</span>
                    <div>
                      <div className="font-semibold">{integration.name}</div>
                      <div className="text-sm text-white/50">{integration.description}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    integration.status === "connected"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-white/5 text-white/50"
                  }`}>
                    {integration.status}
                  </span>
                </div>
                <button className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  integration.status === "connected"
                    ? "bg-white/5 text-white/70 hover:bg-white/10"
                    : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                }`}>
                  {integration.status === "connected" ? "Configure" : "Connect"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Team Members</h3>
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
              Invite Member
            </button>
          </div>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            {[
              { name: "John Smith", email: "john@company.com", role: "Admin", avatar: "JS" },
              { name: "Sarah Johnson", email: "sarah@company.com", role: "Recruiter", avatar: "SJ" },
              { name: "Mike Chen", email: "mike@company.com", role: "Interviewer", avatar: "MC" },
              { name: "Emily Davis", email: "emily@company.com", role: "Viewer", avatar: "ED" },
            ].map((member, i) => (
              <div key={member.email} className={`p-4 flex items-center justify-between ${i > 0 ? "border-t border-white/5" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-medium text-sm">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-white/50">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    member.role === "Admin" ? "bg-purple-500/10 text-purple-400" :
                    member.role === "Recruiter" ? "bg-blue-500/10 text-blue-400" :
                    member.role === "Interviewer" ? "bg-green-500/10 text-green-400" :
                    "bg-white/5 text-white/50"
                  }`}>
                    {member.role}
                  </span>
                  <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 flex justify-end gap-4">
        <button className="px-6 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">
          Reset to Defaults
        </button>
        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all">
          Save Changes
        </button>
      </div>
    </div>
  );
}
