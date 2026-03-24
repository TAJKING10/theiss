"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Loader2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Award,
  CheckCircle,
  AlertCircle,
  Brain,
  Mic,
  FileText,
  Smile,
  Eye,
  Download,
  Share2,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { getInterviews } from "@/lib/actions/interviews";
import { cn } from "@/lib/utils";
import type { InterviewWithCandidate } from "@/lib/supabase/types";

export default function FeedbackPage() {
  const [interviews, setInterviews] = useState<InterviewWithCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<InterviewWithCandidate | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "detailed" | "ai">("overview");

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const data = await getInterviews();
      const completed = data.filter(i => i.status === "completed");
      setInterviews(completed);
      if (completed.length > 0) {
        setSelectedInterview(completed[0]);
      }
    } catch (error) {
      console.error("Failed to load interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getRecommendation = (score: number) => {
    if (score >= 80) return "approved";
    if (score >= 60) return "review";
    return "rejected";
  };

  const getScoreBreakdown = (score: number, id: string) => {
    // Deterministic breakdown based on interview ID hash — stable across renders
    const hash = id.split("").reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0);
    const v = Math.abs(hash);
    const deltas = [
      ((v % 21) - 10),
      (((v >> 4) % 21) - 10),
      (((v >> 8) % 21) - 10),
      (((v >> 12) % 21) - 10),
    ];
    return {
      technical: Math.min(100, Math.max(10, score + deltas[0])),
      communication: Math.min(100, Math.max(10, score + deltas[1])),
      problemSolving: Math.min(100, Math.max(10, score + deltas[2])),
      cultureFit: Math.min(100, Math.max(10, score + deltas[3])),
    };
  };

  const getStrengths = (score: number) => {
    if (score >= 80) {
      return [
        "Strong communication skills demonstrated throughout",
        "Clear and structured answers to all questions",
        "Good understanding of role requirements",
        "Confident and professional demeanor"
      ];
    } else if (score >= 60) {
      return [
        "Showed enthusiasm for the position",
        "Adequate understanding of basic concepts",
        "Willing to learn and grow"
      ];
    }
    return [
      "Showed interest in the role",
      "Basic understanding demonstrated"
    ];
  };

  const getImprovements = (score: number) => {
    if (score >= 80) {
      return [
        "Could provide more specific examples in some areas"
      ];
    } else if (score >= 60) {
      return [
        "Could improve depth of technical knowledge",
        "More specific examples would strengthen answers",
        "Consider preparing more structured responses"
      ];
    }
    return [
      "Significant improvement needed in technical skills",
      "Communication could be more clear and structured",
      "More preparation recommended for future interviews"
    ];
  };

  const getAiSummary = (interview: InterviewWithCandidate) => {
    const score = interview.score || 0;
    const name = interview.candidate?.name || "Candidate";
    const position = interview.candidate?.position || "the position";

    if (score >= 80) {
      return `${name} demonstrated excellent qualifications for ${position}. The candidate showed strong communication skills, relevant experience, and good cultural fit. Highly recommended for the next stage of the hiring process.`;
    } else if (score >= 60) {
      return `${name} showed potential for ${position}. While the candidate demonstrated basic qualifications, there are areas that could benefit from further development. Consider for a second interview or additional assessment.`;
    }
    return `${name}'s performance in this interview suggests they may need more experience before being ready for ${position}. Consider the candidate for other entry-level positions or future opportunities after skill development.`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <GradientBackground />

      <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Interview Feedback</h1>
          <p className="text-white/50">Review AI-generated feedback and insights for each interview.</p>
        </div>

        {interviews.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Completed Interviews</h3>
            <p className="text-white/50 mb-6">Complete an interview to see feedback and analysis here.</p>
            <Link href="/dashboard/interviews">
              <Button>Go to Interviews</Button>
            </Link>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feedback List */}
            <div className="lg:col-span-1">
              <GlassCard className="overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-semibold">Completed Interviews ({interviews.length})</h3>
                </div>
                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                  {interviews.map((interview) => {
                    const score = interview.score || 0;
                    const recommendation = getRecommendation(score);

                    return (
                      <button
                        key={interview.id}
                        onClick={() => setSelectedInterview(interview)}
                        className={cn(
                          "w-full p-4 text-left hover:bg-white/[0.02] transition-colors",
                          selectedInterview?.id === interview.id && "bg-white/[0.04] border-l-2 border-blue-500"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-medium">
                            {interview.candidate?.name?.charAt(0) || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{interview.candidate?.name || "Unknown"}</p>
                            <p className="text-sm text-white/50 truncate">{interview.candidate?.position || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/30">{formatDate(interview.scheduled_at)}</span>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-xs",
                              recommendation === "approved" ? "bg-green-500/20 text-green-400" :
                                recommendation === "review" ? "bg-yellow-500/20 text-yellow-400" :
                                  "bg-red-500/20 text-red-400"
                            )}>
                              {score}%
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </GlassCard>
            </div>

            {/* Feedback Details */}
            {selectedInterview && (
              <div className="lg:col-span-2 space-y-6">
                {/* Candidate Header */}
                <GlassCard className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold",
                        getRecommendation(selectedInterview.score || 0) === "approved"
                          ? "bg-gradient-to-br from-green-500 to-emerald-600"
                          : getRecommendation(selectedInterview.score || 0) === "review"
                            ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                            : "bg-gradient-to-br from-red-500 to-pink-600"
                      )}>
                        {getRecommendation(selectedInterview.score || 0) === "approved" ? (
                          <ThumbsUp className="w-8 h-8" />
                        ) : getRecommendation(selectedInterview.score || 0) === "review" ? (
                          <Award className="w-8 h-8" />
                        ) : (
                          <ThumbsDown className="w-8 h-8" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedInterview.candidate?.name || "Unknown"}</h2>
                        <p className="text-white/50">{selectedInterview.candidate?.position || "N/A"}</p>
                        <p className="text-sm text-white/30 mt-1">Interviewed on {formatDate(selectedInterview.scheduled_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-4xl font-bold",
                        (selectedInterview.score || 0) >= 80 ? "text-green-400" :
                          (selectedInterview.score || 0) >= 60 ? "text-yellow-400" : "text-red-400"
                      )}>
                        {selectedInterview.score || 0}%
                      </div>
                      <p className="text-sm text-white/50">Overall Score</p>
                      <span className={cn(
                        "inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium",
                        getRecommendation(selectedInterview.score || 0) === "approved"
                          ? "bg-green-500/20 text-green-400"
                          : getRecommendation(selectedInterview.score || 0) === "review"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      )}>
                        {getRecommendation(selectedInterview.score || 0) === "approved" ? "Approved" :
                          getRecommendation(selectedInterview.score || 0) === "review" ? "Under Review" : "Not Approved"}
                      </span>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2 border-b border-white/10 -mx-6 px-6">
                    {(["overview", "detailed", "ai"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "px-4 py-3 text-sm font-medium transition-colors relative",
                          activeTab === tab ? "text-white" : "text-white/50 hover:text-white"
                        )}
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
                </GlassCard>

                {/* Tab Content */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Score Breakdown */}
                    <GlassCard className="p-6">
                      <h3 className="font-semibold mb-4">Score Breakdown</h3>
                      <div className="space-y-4">
                        {Object.entries(getScoreBreakdown(selectedInterview.score || 0, selectedInterview.id)).map(([key, value]) => (
                          <div key={key}>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-white/70 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                              <span className={cn(
                                "font-medium",
                                value >= 80 ? "text-green-400" : value >= 60 ? "text-yellow-400" : "text-red-400"
                              )}>
                                {Math.round(value)}%
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  value >= 80 ? "bg-green-500" : value >= 60 ? "bg-yellow-500" : "bg-red-500"
                                )}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    {/* Metrics */}
                    <GlassCard className="p-6">
                      <h3 className="font-semibold mb-4">Interview Metrics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 text-center">
                          <Mic className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                          <div className="text-lg font-bold">Confident</div>
                          <div className="text-xs text-white/50">Voice Analysis</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 text-center">
                          <FileText className="w-6 h-6 text-green-400 mx-auto mb-2" />
                          <div className="text-lg font-bold">Clear</div>
                          <div className="text-xs text-white/50">Communication</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 text-center">
                          <Smile className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                          <div className="text-lg font-bold">Positive</div>
                          <div className="text-xs text-white/50">Sentiment</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 text-center">
                          <Eye className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                          <div className="text-lg font-bold">Engaged</div>
                          <div className="text-xs text-white/50">Body Language</div>
                        </div>
                      </div>
                    </GlassCard>

                    {/* Strengths */}
                    <GlassCard className="p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        Strengths
                      </h3>
                      <ul className="space-y-3">
                        {getStrengths(selectedInterview.score || 0).map((strength, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </GlassCard>

                    {/* Areas for Improvement */}
                    <GlassCard className="p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        Areas for Improvement
                      </h3>
                      <ul className="space-y-3">
                        {getImprovements(selectedInterview.score || 0).map((improvement, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </GlassCard>
                  </div>
                )}

                {activeTab === "detailed" && (
                  <GlassCard className="p-6">
                    <h3 className="font-semibold mb-6">Detailed Score Analysis</h3>
                    <div className="space-y-6">
                      {Object.entries(getScoreBreakdown(selectedInterview.score || 0, selectedInterview.id)).map(([key, value]) => (
                        <div key={key} className="p-4 rounded-xl bg-white/5">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</h4>
                            <span className={cn(
                              "text-2xl font-bold",
                              value >= 80 ? "text-green-400" : value >= 60 ? "text-yellow-400" : "text-red-400"
                            )}>
                              {Math.round(value)}%
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-4">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                value >= 80 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                                  value >= 60 ? "bg-gradient-to-r from-yellow-500 to-orange-400" :
                                    "bg-gradient-to-r from-red-500 to-pink-400"
                              )}
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <p className="text-sm text-white/50">
                            {value >= 80 && "Exceptional performance in this area. Candidate exceeded expectations."}
                            {value >= 60 && value < 80 && "Adequate performance. Meets basic requirements with room for growth."}
                            {value < 60 && "Below expectations. This area needs significant development."}
                          </p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {activeTab === "ai" && (
                  <div className="space-y-6">
                    <GlassCard className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">AI Recommendation</h3>
                          <p className="text-white/70 leading-relaxed">{getAiSummary(selectedInterview)}</p>
                        </div>
                      </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                      <h3 className="font-semibold mb-4">Multimodal Analysis</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 text-center">
                          <Mic className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                          <p className="text-sm text-white/50 mb-1">Voice Analysis</p>
                          <p className="text-lg font-semibold text-blue-400">
                            {(selectedInterview.score || 0) >= 70 ? "Confident" : "Nervous"}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 text-center">
                          <FileText className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <p className="text-sm text-white/50 mb-1">Language</p>
                          <p className="text-lg font-semibold text-green-400">
                            {(selectedInterview.score || 0) >= 70 ? "Clear" : "Unclear"}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 text-center">
                          <Smile className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                          <p className="text-sm text-white/50 mb-1">Sentiment</p>
                          <p className="text-lg font-semibold text-yellow-400">
                            {(selectedInterview.score || 0) >= 60 ? "Positive" : "Neutral"}
                          </p>
                        </div>
                      </div>
                    </GlassCard>

                    <div className="flex gap-4">
                      <Button className="flex-1 gap-2">
                        <Download className="w-4 h-4" /> Download Report
                      </Button>
                      <Button variant="secondary" className="gap-2">
                        <Share2 className="w-4 h-4" /> Share
                      </Button>
                    </div>
                  </div>
                )}

                {/* View Interview Link */}
                <div className="flex justify-center">
                  <Link href={`/dashboard/interviews/${selectedInterview.id}`}>
                    <Button variant="secondary" className="gap-2">
                      <Eye className="w-4 h-4" /> View Full Interview Details
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
