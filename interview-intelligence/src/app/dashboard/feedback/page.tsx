"use client";

import { useState } from "react";

const feedbackData = [
  {
    id: 1,
    candidate: "Sarah Johnson",
    position: "Senior Developer",
    date: "2024-01-15",
    overallScore: 92,
    status: "completed",
    scores: {
      technical: 95,
      communication: 90,
      problemSolving: 88,
      cultureFit: 94,
    },
    strengths: [
      "Strong technical background in React and Node.js",
      "Excellent problem-solving approach",
      "Clear and articulate communication",
    ],
    improvements: [
      "Could provide more specific examples",
      "Consider elaborating on leadership experience",
    ],
    aiInsights: "Candidate demonstrated exceptional technical skills and strong alignment with company values. Recommended for next round.",
  },
  {
    id: 2,
    candidate: "Michael Chen",
    position: "Product Manager",
    date: "2024-01-14",
    overallScore: 88,
    status: "completed",
    scores: {
      technical: 82,
      communication: 94,
      problemSolving: 90,
      cultureFit: 86,
    },
    strengths: [
      "Excellent stakeholder management skills",
      "Strong analytical thinking",
      "Great presentation abilities",
    ],
    improvements: [
      "Technical depth could be improved",
      "More experience with agile methodologies needed",
    ],
    aiInsights: "Strong communicator with good strategic thinking. Would benefit from technical mentorship.",
  },
  {
    id: 3,
    candidate: "Emily Davis",
    position: "UX Designer",
    date: "2024-01-14",
    overallScore: 95,
    status: "completed",
    scores: {
      technical: 92,
      communication: 96,
      problemSolving: 94,
      cultureFit: 98,
    },
    strengths: [
      "Outstanding portfolio with diverse projects",
      "User-centric design thinking",
      "Excellent collaboration skills",
    ],
    improvements: [
      "Could explore more data-driven design approaches",
    ],
    aiInsights: "Exceptional candidate with strong design skills and excellent cultural fit. Highly recommended.",
  },
];

export default function FeedbackPage() {
  const [selectedFeedback, setSelectedFeedback] = useState(feedbackData[0]);
  const [activeTab, setActiveTab] = useState<"overview" | "detailed" | "ai">("overview");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Interview Feedback</h1>
        <p className="text-white/50">Review AI-generated feedback and insights for each interview.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feedback List */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-semibold">Recent Interviews</h3>
            </div>
            <div className="divide-y divide-white/5">
              {feedbackData.map((feedback) => (
                <button
                  key={feedback.id}
                  onClick={() => setSelectedFeedback(feedback)}
                  className={`w-full p-4 text-left hover:bg-white/[0.02] transition-colors ${
                    selectedFeedback.id === feedback.id ? "bg-white/[0.04] border-l-2 border-blue-500" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-medium">
                      {feedback.candidate.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{feedback.candidate}</p>
                      <p className="text-sm text-white/50 truncate">{feedback.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/30">{feedback.date}</span>
                    <span className={`text-sm font-medium ${
                      feedback.overallScore >= 90 ? "text-green-400" : "text-blue-400"
                    }`}>
                      {feedback.overallScore}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Header */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                  {selectedFeedback.candidate.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedFeedback.candidate}</h2>
                  <p className="text-white/50">{selectedFeedback.position}</p>
                  <p className="text-sm text-white/30 mt-1">Interviewed on {selectedFeedback.date}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold gradient-text">{selectedFeedback.overallScore}%</div>
                <p className="text-sm text-white/50">Overall Score</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/5 -mx-6 px-6">
              {(["overview", "detailed", "ai"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab ? "text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  {tab === "overview" && "Overview"}
                  {tab === "detailed" && "Detailed Scores"}
                  {tab === "ai" && "AI Insights"}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score Breakdown */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                <h3 className="font-semibold mb-4">Score Breakdown</h3>
                <div className="space-y-4">
                  {Object.entries(selectedFeedback.scores).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/70 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                        <span className={`font-medium ${
                          value >= 90 ? "text-green-400" : value >= 80 ? "text-blue-400" : "text-yellow-400"
                        }`}>
                          {value}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            value >= 90 ? "bg-green-500" : value >= 80 ? "bg-blue-500" : "bg-yellow-500"
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Radar Chart Placeholder */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                <h3 className="font-semibold mb-4">Skills Radar</h3>
                <div className="aspect-square flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {/* Simple radar visualization */}
                    <div className="absolute inset-0 border-2 border-white/10 rounded-full" />
                    <div className="absolute inset-4 border-2 border-white/10 rounded-full" />
                    <div className="absolute inset-8 border-2 border-white/10 rounded-full" />
                    <div className="absolute inset-12 border-2 border-white/10 rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    {/* Skill points */}
                    {Object.entries(selectedFeedback.scores).map(([key, value], i) => {
                      const angle = (i * 90 - 90) * (Math.PI / 180);
                      const radius = (value / 100) * 80;
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;
                      return (
                        <div
                          key={key}
                          className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                          style={{
                            left: `calc(50% + ${x}px - 6px)`,
                            top: `calc(50% + ${y}px - 6px)`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm">+</span>
                  Strengths
                </h3>
                <ul className="space-y-3">
                  {selectedFeedback.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-sm">!</span>
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {selectedFeedback.improvements.map((improvement, i) => (
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
          )}

          {activeTab === "detailed" && (
            <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
              <h3 className="font-semibold mb-6">Detailed Score Analysis</h3>
              <div className="space-y-8">
                {Object.entries(selectedFeedback.scores).map(([key, value]) => (
                  <div key={key} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</h4>
                      <span className={`text-2xl font-bold ${
                        value >= 90 ? "text-green-400" : value >= 80 ? "text-blue-400" : "text-yellow-400"
                      }`}>
                        {value}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-4">
                      <div
                        className={`h-full rounded-full ${
                          value >= 90 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                          value >= 80 ? "bg-gradient-to-r from-blue-500 to-cyan-400" :
                          "bg-gradient-to-r from-yellow-500 to-orange-400"
                        }`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <p className="text-sm text-white/50">
                      {value >= 90 && "Exceptional performance in this area. Candidate exceeded expectations."}
                      {value >= 80 && value < 90 && "Strong performance. Meets requirements with room for growth."}
                      {value < 80 && "Adequate performance. May need additional development."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">AI Recommendation</h3>
                    <p className="text-white/70 leading-relaxed">{selectedFeedback.aiInsights}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                <h3 className="font-semibold mb-4">Multimodal Analysis</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] text-center">
                    <div className="text-2xl mb-2">🎙</div>
                    <p className="text-sm text-white/50 mb-1">Voice Analysis</p>
                    <p className="text-lg font-semibold text-blue-400">Confident</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] text-center">
                    <div className="text-2xl mb-2">📝</div>
                    <p className="text-sm text-white/50 mb-1">Language</p>
                    <p className="text-lg font-semibold text-green-400">Clear</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] text-center">
                    <div className="text-2xl mb-2">😊</div>
                    <p className="text-sm text-white/50 mb-1">Sentiment</p>
                    <p className="text-lg font-semibold text-yellow-400">Positive</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                  Generate Full Report
                </button>
                <button className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors">
                  Share
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
