"use client";

import { useState } from "react";
import Link from "next/link";

export default function InterviewsPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState("");

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
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Live Interview</h1>
          <p className="text-white/50">Conduct AI-assisted interviews with real-time analysis.</p>
        </div>
        <Link
          href="/dashboard/interviews/lobby"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          New Interview
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Interview Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Area */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-gray-900 to-black relative">
              {!isRecording ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-white/50 text-lg">Ready to start interview</p>
                  <p className="text-white/30 text-sm mt-2">Select a candidate and click Start Recording</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 mx-auto animate-pulse">
                      <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                      </svg>
                    </div>
                    <p className="text-white font-medium text-lg">Recording in progress...</p>
                    <p className="text-white/50 text-sm mt-1">AI is analyzing in real-time</p>
                  </div>
                </div>
              )}

              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-full bg-red-500/20 border border-red-500/30">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 text-sm font-medium">REC</span>
                </div>
              )}

              {/* Time */}
              {isRecording && (
                <div className="absolute top-4 right-4 px-3 py-2 rounded-full bg-black/50 text-white/70 text-sm font-mono">
                  05:23
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-6 border-t border-white/5">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <select
                  value={selectedCandidate}
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  disabled={isRecording}
                >
                  <option value="">Select Candidate</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.position}
                    </option>
                  ))}
                </select>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    disabled={!selectedCandidate && !isRecording}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isRecording
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25"
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        Start Recording
                      </>
                    )}
                  </button>

                  {isRecording && (
                    <button className="px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Panel */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Live AI Analysis
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-white/50 text-xs mb-1">Confidence</p>
                <p className="text-2xl font-bold text-green-400">87%</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-white/50 text-xs mb-1">Engagement</p>
                <p className="text-2xl font-bold text-blue-400">92%</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-white/50 text-xs mb-1">Clarity</p>
                <p className="text-2xl font-bold text-purple-400">89%</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-white/50 text-xs mb-1">Sentiment</p>
                <p className="text-2xl font-bold text-yellow-400">Positive</p>
              </div>
            </div>

            {/* Waveform Visualization */}
            <div className="h-16 rounded-xl bg-white/5 flex items-center justify-center gap-1 overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full transition-all duration-100 ${
                    isRecording ? "animate-pulse" : ""
                  }`}
                  style={{
                    height: `${Math.random() * 100}%`,
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Real-time Insights */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-semibold">Real-time Insights</h3>
            </div>
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {realtimeInsights.map((insight, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-sm ${
                    insight.type === "positive"
                      ? "bg-green-500/10 border border-green-500/20"
                      : insight.type === "suggestion"
                      ? "bg-blue-500/10 border border-blue-500/20"
                      : "bg-white/5 border border-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`${
                      insight.type === "positive"
                        ? "text-green-400"
                        : insight.type === "suggestion"
                        ? "text-blue-400"
                        : "text-white/70"
                    }`}>
                      {insight.text}
                    </p>
                    <span className="text-white/30 text-xs whitespace-nowrap">{insight.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Questions */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-semibold">AI-Suggested Questions</h3>
            </div>
            <div className="p-4 space-y-3">
              {[
                "Can you describe a challenging project you led?",
                "How do you handle conflicts in a team?",
                "What's your approach to learning new technologies?",
              ].map((question, i) => (
                <button
                  key={i}
                  className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 text-left text-sm text-white/70 hover:text-white transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Notes */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-semibold">Quick Notes</h3>
            </div>
            <div className="p-4">
              <textarea
                placeholder="Add notes during the interview..."
                className="w-full h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors resize-none text-sm"
              />
              <button className="mt-3 w-full py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors">
                Save Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
