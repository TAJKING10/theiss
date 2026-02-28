"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Mock candidate data
const candidateData = {
  id: "1",
  name: "Sarah Johnson",
  email: "sarah.j@email.com",
  phone: "+1 (555) 123-4567",
  position: "Senior Frontend Developer",
  location: "San Francisco, CA",
  experience: "8 years",
  education: "M.S. Computer Science, Stanford University",
  appliedDate: "2024-01-10",
  status: "final_review",
  overallScore: 92,
  avatar: "SJ",
  resume: "sarah_johnson_resume.pdf",
  linkedin: "linkedin.com/in/sarahjohnson",
  scores: {
    technical: 95,
    communication: 90,
    problemSolving: 88,
    cultureFit: 94,
    leadership: 91,
  },
  interviews: [
    { id: 1, type: "Technical Screen", date: "2024-01-12", interviewer: "Mike Chen", score: 90 },
    { id: 2, type: "System Design", date: "2024-01-14", interviewer: "Emily Davis", score: 94 },
    { id: 3, type: "Behavioral", date: "2024-01-15", interviewer: "John Smith", score: 92 },
  ],
  aiInsights: {
    strengths: [
      "Exceptional React and TypeScript expertise demonstrated through detailed technical discussions",
      "Strong system design thinking with scalability considerations",
      "Excellent communication skills - articulates complex concepts clearly",
      "Shows genuine passion for frontend architecture and user experience",
    ],
    improvements: [
      "Could expand knowledge of backend technologies for full-stack roles",
      "Limited experience with large-scale team leadership",
    ],
    biasFlags: [],
    recommendation: "STRONGLY_RECOMMEND",
    confidenceScore: 94,
    summary: "Sarah is an exceptional candidate with deep frontend expertise and strong communication skills. Her technical abilities, combined with her collaborative approach, make her an ideal fit for the Senior Frontend Developer role. Highly recommended for offer.",
  },
  timeline: [
    { date: "2024-01-10", event: "Application Received", type: "milestone" },
    { date: "2024-01-11", event: "Resume Screened by AI", type: "ai" },
    { date: "2024-01-12", event: "Technical Screen Completed", type: "interview" },
    { date: "2024-01-14", event: "System Design Interview", type: "interview" },
    { date: "2024-01-15", event: "Behavioral Interview", type: "interview" },
    { date: "2024-01-15", event: "AI Report Generated", type: "ai" },
  ],
};

export default function CandidateDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<"overview" | "interviews" | "ai" | "timeline">("overview");

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
        <Link href="/dashboard/candidates" className="hover:text-white transition-colors">
          Candidates
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-white">{candidateData.name}</span>
      </div>

      {/* Header Card */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
              {candidateData.avatar}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{candidateData.name}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 capitalize">
                  {candidateData.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-white/70 mb-1">{candidateData.position}</p>
              <p className="text-white/50 text-sm">{candidateData.location} • {candidateData.experience} experience</p>
              <div className="flex items-center gap-4 mt-3">
                <a href={`mailto:${candidateData.email}`} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  {candidateData.email}
                </a>
                <span className="text-white/20">•</span>
                <span className="text-sm text-white/50">{candidateData.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="text-right">
              <div className="text-sm text-white/50 mb-1">Overall AI Score</div>
              <div className="text-5xl font-bold gradient-text">{candidateData.overallScore}%</div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-xl bg-white/5 text-white text-sm hover:bg-white/10 transition-colors">
                Download Report
              </button>
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                Schedule Interview
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 border-t border-white/5 pt-6 -mx-6 px-6">
          {[
            { id: "overview", label: "Overview", icon: "📋" },
            { id: "interviews", label: "Interviews", icon: "🎙" },
            { id: "ai", label: "AI Analysis", icon: "🧠" },
            { id: "timeline", label: "Timeline", icon: "📅" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score Breakdown */}
          <div className="lg:col-span-2 rounded-2xl bg-white/[0.02] border border-white/5 p-6">
            <h3 className="font-semibold text-lg mb-6">Score Breakdown</h3>
            <div className="space-y-6">
              {Object.entries(candidateData.scores).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                    <span className={`font-medium ${
                      value >= 90 ? "text-green-400" : value >= 80 ? "text-blue-400" : "text-yellow-400"
                    }`}>
                      {value}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        value >= 90 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                        value >= 80 ? "bg-gradient-to-r from-blue-500 to-cyan-400" :
                        "bg-gradient-to-r from-yellow-500 to-orange-400"
                      }`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
              <h3 className="font-semibold mb-4">Candidate Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Education</span>
                  <span className="text-white/90 text-right">{candidateData.education}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Applied</span>
                  <span className="text-white/90">{candidateData.appliedDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Interviews</span>
                  <span className="text-white/90">{candidateData.interviews.length} completed</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                <button className="flex-1 py-2 rounded-lg bg-white/5 text-white/70 text-sm hover:bg-white/10 transition-colors">
                  Resume
                </button>
                <button className="flex-1 py-2 rounded-lg bg-white/5 text-white/70 text-sm hover:bg-white/10 transition-colors">
                  LinkedIn
                </button>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className={`rounded-2xl p-6 ${
              candidateData.aiInsights.recommendation === "STRONGLY_RECOMMEND"
                ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
                : "bg-white/[0.02] border border-white/5"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">✅</span>
                <span className="font-semibold text-green-400">Strongly Recommend</span>
              </div>
              <p className="text-sm text-white/60">
                AI confidence: {candidateData.aiInsights.confidenceScore}%
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "interviews" && (
        <div className="space-y-6">
          {candidateData.interviews.map((interview) => (
            <div key={interview.id} className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{interview.type}</h3>
                  <p className="text-white/50 text-sm">{interview.date} • Interviewed by {interview.interviewer}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-400">{interview.score}%</div>
                  <div className="text-sm text-white/50">Score</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-xl bg-white/5 text-white text-sm hover:bg-white/10 transition-colors">
                  View Recording
                </button>
                <button className="px-4 py-2 rounded-xl bg-white/5 text-white text-sm hover:bg-white/10 transition-colors">
                  Read Notes
                </button>
                <button className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-sm hover:bg-blue-500/20 transition-colors">
                  AI Analysis
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "ai" && (
        <div className="space-y-8">
          {/* AI Summary */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">AI Summary</h3>
                <p className="text-white/70 leading-relaxed">{candidateData.aiInsights.summary}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm">+</span>
                Key Strengths
              </h3>
              <ul className="space-y-3">
                {candidateData.aiInsights.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-sm">!</span>
                Areas for Growth
              </h3>
              <ul className="space-y-3">
                {candidateData.aiInsights.improvements.map((improvement, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                    <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Multimodal Analysis */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
            <h3 className="font-semibold mb-6">Multimodal Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] text-center">
                <div className="text-3xl mb-2">🎙</div>
                <p className="text-sm text-white/50 mb-1">Voice Analysis</p>
                <p className="text-xl font-semibold text-blue-400">Confident</p>
                <p className="text-xs text-white/30 mt-1">94% clarity</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] text-center">
                <div className="text-3xl mb-2">📝</div>
                <p className="text-sm text-white/50 mb-1">Language</p>
                <p className="text-xl font-semibold text-green-400">Excellent</p>
                <p className="text-xs text-white/30 mt-1">Technical depth</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] text-center">
                <div className="text-3xl mb-2">😊</div>
                <p className="text-sm text-white/50 mb-1">Sentiment</p>
                <p className="text-xl font-semibold text-yellow-400">Positive</p>
                <p className="text-xs text-white/30 mt-1">High engagement</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] text-center">
                <div className="text-3xl mb-2">👁</div>
                <p className="text-sm text-white/50 mb-1">Body Language</p>
                <p className="text-xl font-semibold text-purple-400">Open</p>
                <p className="text-xs text-white/30 mt-1">Collaborative</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
          <h3 className="font-semibold text-lg mb-6">Candidate Timeline</h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />
            <div className="space-y-6">
              {candidateData.timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                    event.type === "milestone" ? "bg-green-500/20 text-green-400" :
                    event.type === "ai" ? "bg-purple-500/20 text-purple-400" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>
                    {event.type === "milestone" ? "✓" : event.type === "ai" ? "🧠" : "🎙"}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-medium">{event.event}</p>
                    <p className="text-sm text-white/50">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="fixed bottom-0 left-64 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors">
              Reject
            </button>
            <button className="px-4 py-2 rounded-xl bg-white/5 text-white text-sm hover:bg-white/10 transition-colors">
              Put on Hold
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 rounded-xl bg-white/5 text-white text-sm hover:bg-white/10 transition-colors">
              Schedule Next Round
            </button>
            <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all">
              Make Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
