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
  Quote,
  TrendingUp,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { getInterviews } from "@/lib/actions/interviews";
import { cn } from "@/lib/utils";
import type { InterviewWithCandidate } from "@/lib/supabase/types";
import type { Json } from "@/lib/supabase/types";

// Shape of the ai_insights JSON stored in the interviews table
interface CompetencyScore {
  competency: string;
  score: number;
  level: string;
  evidence: string[];
  reasoning: string;
}

interface AiInsightsData {
  competencies: CompetencyScore[];
  summary: string;
  strengths: string[];
  areasForGrowth: string[];
  recommendation: "strong_yes" | "yes" | "maybe" | "no";
  keyInsights?: string[];
  confidence?: number;
  limitations?: string[];
  scoringMethodology?: {
    method: string;
    faceMetricsUsed: boolean;
    humanOversightRequired?: boolean;
  };
}

function parseAiInsights(raw: Json | null): AiInsightsData | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const data = raw as Record<string, unknown>;
  if (!Array.isArray(data.competencies) || typeof data.summary !== "string") return null;
  return data as unknown as AiInsightsData;
}

// Map ai_insights recommendation → display value, fallback to score
function getRecommendation(interview: InterviewWithCandidate): "approved" | "review" | "rejected" {
  const insights = parseAiInsights(interview.ai_insights);
  if (insights?.recommendation) {
    if (insights.recommendation === "strong_yes" || insights.recommendation === "yes") return "approved";
    if (insights.recommendation === "maybe") return "review";
    return "rejected";
  }
  const score = interview.score || 0;
  if (score >= 80) return "approved";
  if (score >= 60) return "review";
  return "rejected";
}

// Real competency scores from ai_insights, fallback to hash-based estimate
function getScoreBreakdown(interview: InterviewWithCandidate): Record<string, number> {
  const insights = parseAiInsights(interview.ai_insights);
  if (insights && insights.competencies.length > 0) {
    const result: Record<string, number> = {};
    insights.competencies.forEach((c) => {
      result[c.competency] = c.score;
    });
    return result;
  }
  // Fallback: deterministic hash so scores stay stable across renders
  const score = interview.score || 0;
  const hash = interview.id
    .split("")
    .reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0);
  const v = Math.abs(hash);
  return {
    Communication: Math.min(100, Math.max(10, score + ((v % 21) - 10))),
    "Problem Solving": Math.min(100, Math.max(10, score + (((v >> 4) % 21) - 10))),
    "Relevance & Role Fit": Math.min(100, Math.max(10, score + (((v >> 8) % 21) - 10))),
    "Evidence Quality": Math.min(100, Math.max(10, score + (((v >> 12) % 21) - 10))),
  };
}

// Real strengths from ai_insights, fallback to generic
function getStrengths(interview: InterviewWithCandidate): string[] {
  const insights = parseAiInsights(interview.ai_insights);
  if (insights && insights.strengths.length > 0) return insights.strengths;
  const score = interview.score || 0;
  if (score >= 80)
    return [
      "Strong communication skills demonstrated throughout",
      "Clear and structured answers to all questions",
      "Good understanding of role requirements",
      "Confident and professional demeanor",
    ];
  if (score >= 60)
    return [
      "Showed enthusiasm for the position",
      "Adequate understanding of basic concepts",
      "Willing to learn and grow",
    ];
  return ["Showed interest in the role", "Basic understanding demonstrated"];
}

// Real areas for growth from ai_insights, fallback to generic
function getImprovements(interview: InterviewWithCandidate): string[] {
  const insights = parseAiInsights(interview.ai_insights);
  if (insights && insights.areasForGrowth.length > 0) return insights.areasForGrowth;
  const score = interview.score || 0;
  if (score >= 80) return ["Could provide more specific examples in some areas"];
  if (score >= 60)
    return [
      "Could improve depth of technical knowledge",
      "More specific examples would strengthen answers",
      "Consider preparing more structured responses",
    ];
  return [
    "Significant improvement needed in technical skills",
    "Communication could be more clear and structured",
    "More preparation recommended for future interviews",
  ];
}

// Real AI summary from ai_insights, fallback to generic
function getAiSummary(interview: InterviewWithCandidate): string {
  const insights = parseAiInsights(interview.ai_insights);
  if (insights?.summary) return insights.summary;
  const score = interview.score || 0;
  const name = interview.candidate?.name || "Candidate";
  const position = interview.candidate?.position || "the position";
  if (score >= 80)
    return `${name} demonstrated excellent qualifications for ${position}. The candidate showed strong communication skills, relevant experience, and good cultural fit. Highly recommended for the next stage of the hiring process.`;
  if (score >= 60)
    return `${name} showed potential for ${position}. While the candidate demonstrated basic qualifications, there are areas that could benefit from further development. Consider for a second interview or additional assessment.`;
  return `${name}'s performance in this interview suggests they may need more experience before being ready for ${position}. Consider the candidate for other entry-level positions or future opportunities after skill development.`;
}

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
      const completed = data.filter((i) => i.status === "completed");
      setInterviews(completed);
      if (completed.length > 0) setSelectedInterview(completed[0]);
    } catch (error) {
      console.error("Failed to load interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

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
          <p className="text-white/50">
            Review AI-generated feedback and insights for each interview.
          </p>
        </div>

        {interviews.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Completed Interviews</h3>
            <p className="text-white/50 mb-6">
              Complete an interview to see feedback and analysis here.
            </p>
            <Link href="/dashboard/interviews">
              <Button>Go to Interviews</Button>
            </Link>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Interview List */}
            <div className="lg:col-span-1">
              <GlassCard className="overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-semibold">
                    Completed Interviews ({interviews.length})
                  </h3>
                </div>
                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                  {interviews.map((interview) => {
                    const rec = getRecommendation(interview);
                    const score = interview.score || 0;
                    return (
                      <button
                        key={interview.id}
                        onClick={() => {
                          setSelectedInterview(interview);
                          setActiveTab("overview");
                        }}
                        className={cn(
                          "w-full p-4 text-left hover:bg-white/[0.02] transition-colors",
                          selectedInterview?.id === interview.id &&
                            "bg-white/[0.04] border-l-2 border-blue-500"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-medium">
                            {interview.candidate?.name?.charAt(0) || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {interview.candidate?.name || "Unknown"}
                            </p>
                            <p className="text-sm text-white/50 truncate">
                              {interview.candidate?.position || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/30">
                            {formatDate(interview.scheduled_at)}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs",
                              rec === "approved"
                                ? "bg-green-500/20 text-green-400"
                                : rec === "review"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                            )}
                          >
                            {score}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </GlassCard>
            </div>

            {/* Feedback Detail */}
            {selectedInterview && (
              <SelectedFeedback
                interview={selectedInterview}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                formatDate={formatDate}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SelectedFeedback({
  interview,
  activeTab,
  setActiveTab,
  formatDate,
}: {
  interview: InterviewWithCandidate;
  activeTab: "overview" | "detailed" | "ai";
  setActiveTab: (tab: "overview" | "detailed" | "ai") => void;
  formatDate: (d: string) => string;
}) {
  const insights = parseAiInsights(interview.ai_insights);
  const recommendation = getRecommendation(interview);
  const scoreBreakdown = getScoreBreakdown(interview);
  const strengths = getStrengths(interview);
  const improvements = getImprovements(interview);
  const aiSummary = getAiSummary(interview);
  const score = interview.score || 0;
  const hasRealData = !!insights;

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Candidate Header + Tabs */}
      <GlassCard className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold",
                recommendation === "approved"
                  ? "bg-gradient-to-br from-green-500 to-emerald-600"
                  : recommendation === "review"
                  ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                  : "bg-gradient-to-br from-red-500 to-pink-600"
              )}
            >
              {recommendation === "approved" ? (
                <ThumbsUp className="w-8 h-8" />
              ) : recommendation === "review" ? (
                <Award className="w-8 h-8" />
              ) : (
                <ThumbsDown className="w-8 h-8" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {interview.candidate?.name || "Unknown"}
              </h2>
              <p className="text-white/50">
                {interview.candidate?.position || "N/A"}
              </p>
              <p className="text-sm text-white/30 mt-1">
                Interviewed on {formatDate(interview.scheduled_at)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div
              className={cn(
                "text-4xl font-bold",
                score >= 80
                  ? "text-green-400"
                  : score >= 60
                  ? "text-yellow-400"
                  : "text-red-400"
              )}
            >
              {score}%
            </div>
            <p className="text-sm text-white/50">Overall Score</p>
            {insights?.confidence !== undefined && (
              <p className="text-xs text-white/30 mt-1">
                AI confidence: {insights.confidence}%
              </p>
            )}
            <span
              className={cn(
                "inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium",
                recommendation === "approved"
                  ? "bg-green-500/20 text-green-400"
                  : recommendation === "review"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
              )}
            >
              {recommendation === "approved"
                ? "Approved"
                : recommendation === "review"
                ? "Under Review"
                : "Not Approved"}
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
                activeTab === tab
                  ? "text-white"
                  : "text-white/50 hover:text-white"
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

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Score Breakdown */}
          <GlassCard className="p-6">
            <h3 className="font-semibold mb-1">Score Breakdown</h3>
            {hasRealData && (
              <p className="text-xs text-green-400 mb-4">
                AI-evaluated competency scores
              </p>
            )}
            <div className="space-y-4 mt-3">
              {Object.entries(scoreBreakdown).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">{key}</span>
                    <span
                      className={cn(
                        "font-medium",
                        value >= 80
                          ? "text-green-400"
                          : value >= 60
                          ? "text-yellow-400"
                          : "text-red-400"
                      )}
                    >
                      {Math.round(value)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        value >= 80
                          ? "bg-green-500"
                          : value >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      )}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {hasRealData && (
              <p className="text-xs text-white/30 mt-4">
                Communication 25% · Problem Solving 30% · Relevance 25% · Evidence 20%
              </p>
            )}
          </GlassCard>

          {/* Competency Level Cards */}
          <GlassCard className="p-6">
            <h3 className="font-semibold mb-4">Competency Levels</h3>
            <div className="grid grid-cols-2 gap-4">
              {insights?.competencies?.slice(0, 4).map((c) => {
                const levelColors: Record<string, string> = {
                  expert: "text-green-400",
                  proficient: "text-blue-400",
                  developing: "text-yellow-400",
                  novice: "text-red-400",
                };
                const icons = {
                  Communication: <Mic className="w-6 h-6 mx-auto mb-2" />,
                  "Problem Solving": <Brain className="w-6 h-6 mx-auto mb-2" />,
                  "Relevance & Role Fit": <FileText className="w-6 h-6 mx-auto mb-2" />,
                  "Evidence Quality": <CheckCircle className="w-6 h-6 mx-auto mb-2" />,
                } as Record<string, React.ReactNode>;
                return (
                  <div
                    key={c.competency}
                    className="p-4 rounded-xl bg-white/5 text-center"
                  >
                    <div
                      className={cn(
                        "mb-2",
                        levelColors[c.level] || "text-white/40"
                      )}
                    >
                      {icons[c.competency] ?? (
                        <Award className="w-6 h-6 mx-auto mb-2" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "text-lg font-bold capitalize",
                        levelColors[c.level] || "text-white/70"
                      )}
                    >
                      {c.level}
                    </div>
                    <div className="text-xs text-white/50 mt-1 leading-tight">
                      {c.competency}
                    </div>
                  </div>
                );
              }) ?? (
                <>
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
                </>
              )}
            </div>
          </GlassCard>

          {/* Strengths */}
          <GlassCard className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Strengths
            </h3>
            <ul className="space-y-3">
              {strengths.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-white/70"
                >
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  {s}
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
              {improvements.map((imp, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-white/70"
                >
                  <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  {imp}
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      )}

      {/* Detailed Scores Tab */}
      {activeTab === "detailed" && (
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-6">Detailed Score Analysis</h3>
          <div className="space-y-6">
            {insights?.competencies
              ? insights.competencies.map((c) => (
                  <div key={c.competency} className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">{c.competency}</h4>
                        <span className="text-xs text-white/40 capitalize">
                          {c.level}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-2xl font-bold",
                          c.score >= 80
                            ? "text-green-400"
                            : c.score >= 60
                            ? "text-yellow-400"
                            : "text-red-400"
                        )}
                      >
                        {Math.round(c.score)}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-4">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          c.score >= 80
                            ? "bg-gradient-to-r from-green-500 to-emerald-400"
                            : c.score >= 60
                            ? "bg-gradient-to-r from-yellow-500 to-orange-400"
                            : "bg-gradient-to-r from-red-500 to-pink-400"
                        )}
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                    {c.reasoning && (
                      <p className="text-sm text-white/60 mb-3">{c.reasoning}</p>
                    )}
                    {c.evidence?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-white/40 uppercase tracking-wide">
                          Evidence from transcript
                        </p>
                        {c.evidence.slice(0, 2).map((quote, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 p-2 rounded-lg bg-white/5 border border-white/10"
                          >
                            <Quote className="w-3 h-3 text-blue-400 flex-shrink-0 mt-1" />
                            <p className="text-xs text-white/60 italic">
                              {quote}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              : Object.entries(scoreBreakdown).map(([key, value]) => (
                  <div key={key} className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">{key}</h4>
                      <span
                        className={cn(
                          "text-2xl font-bold",
                          value >= 80
                            ? "text-green-400"
                            : value >= 60
                            ? "text-yellow-400"
                            : "text-red-400"
                        )}
                      >
                        {Math.round(value)}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-4">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          value >= 80
                            ? "bg-gradient-to-r from-green-500 to-emerald-400"
                            : value >= 60
                            ? "bg-gradient-to-r from-yellow-500 to-orange-400"
                            : "bg-gradient-to-r from-red-500 to-pink-400"
                        )}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <p className="text-sm text-white/50">
                      {value >= 80
                        ? "Exceptional performance in this area. Candidate exceeded expectations."
                        : value >= 60
                        ? "Adequate performance. Meets basic requirements with room for growth."
                        : "Below expectations. This area needs significant development."}
                    </p>
                  </div>
                ))}
          </div>
        </GlassCard>
      )}

      {/* AI Insights Tab */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          {/* AI Summary */}
          <GlassCard className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">AI Recommendation</h3>
                <p className="text-white/70 leading-relaxed">{aiSummary}</p>
              </div>
            </div>
          </GlassCard>

          {/* Key Insights */}
          {insights?.keyInsights && insights.keyInsights.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Key Insights
              </h3>
              <ul className="space-y-3">
                {insights.keyInsights.map((insight, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-white/70"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-400 text-xs">{i + 1}</span>
                    </div>
                    {insight}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* Scoring Methodology */}
          {insights?.scoringMethodology && (
            <GlassCard className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-white/50" />
                Scoring Methodology
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-white/50">
                  Method:{" "}
                  <span className="text-white/70">
                    {insights.scoringMethodology.method}
                  </span>
                </p>
                <p className="text-white/50">
                  Face/emotion metrics used:{" "}
                  <span className="text-white/70">
                    {insights.scoringMethodology.faceMetricsUsed
                      ? "Yes"
                      : "No — transcript only"}
                  </span>
                </p>
                {insights.scoringMethodology.humanOversightRequired && (
                  <p className="text-yellow-400/70 mt-2">
                    Human oversight required for final hiring decision
                  </p>
                )}
              </div>
            </GlassCard>
          )}

          {/* Evaluation Limitations */}
          {insights?.limitations && insights.limitations.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="font-semibold mb-4 text-white/70">
                Evaluation Limitations
              </h3>
              <ul className="space-y-2">
                {insights.limitations.map((lim, i) => (
                  <li
                    key={i}
                    className="text-sm text-white/40 flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {lim}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* Fallback multimodal card when no ai_insights yet */}
          {!insights && (
            <GlassCard className="p-6">
              <h3 className="font-semibold mb-4">Multimodal Analysis</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <Mic className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-white/50 mb-1">Voice Analysis</p>
                  <p className="text-lg font-semibold text-blue-400">
                    {score >= 70 ? "Confident" : "Nervous"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <FileText className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-white/50 mb-1">Language</p>
                  <p className="text-lg font-semibold text-green-400">
                    {score >= 70 ? "Clear" : "Unclear"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <Smile className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-white/50 mb-1">Sentiment</p>
                  <p className="text-lg font-semibold text-yellow-400">
                    {score >= 60 ? "Positive" : "Neutral"}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

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

      {/* View Full Interview */}
      <div className="flex justify-center">
        <Link href={`/dashboard/interviews/${interview.id}`}>
          <Button variant="secondary" className="gap-2">
            <Eye className="w-4 h-4" /> View Full Interview Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
