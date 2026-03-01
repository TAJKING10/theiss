"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Play,
  Edit,
  Trash2,
  FileText,
  Video,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { getInterview, deleteInterview, updateInterview } from "@/lib/actions/interviews";
import { getInterviewQuestions } from "@/lib/actions/questions";
import { getFeedback, createFeedback } from "@/lib/actions/feedback";
import type { InterviewWithCandidate, InterviewQuestion, Feedback } from "@/lib/supabase/types";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  in_progress: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function InterviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<InterviewWithCandidate | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    recommendation: "hire" as const,
    strengths: "",
    improvements: "",
    comments: "",
  });

  useEffect(() => {
    loadData();
  }, [interviewId]);

  const loadData = async () => {
    try {
      const [interviewData, questionsData, feedbackData] = await Promise.all([
        getInterview(interviewId),
        getInterviewQuestions(interviewId),
        getFeedback(interviewId),
      ]);
      setInterview(interviewData);
      setQuestions(questionsData);
      setFeedback(feedbackData);
    } catch (error) {
      console.error("Failed to load interview:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this interview?")) return;
    try {
      await deleteInterview(interviewId);
      router.push("/dashboard/interviews");
    } catch (error) {
      console.error("Failed to delete interview:", error);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFeedback({
        interview_id: interviewId,
        rating: feedbackData.rating,
        recommendation: feedbackData.recommendation,
        strengths: feedbackData.strengths ? feedbackData.strengths.split(",").map(s => s.trim()) : null,
        improvements: feedbackData.improvements ? feedbackData.improvements.split(",").map(s => s.trim()) : null,
        comments: feedbackData.comments || null,
      });
      setShowFeedbackForm(false);
      loadData();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <GlassCard className="p-12 text-center max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Interview Not Found</h2>
          <p className="text-white/50 mb-6">The interview you're looking for doesn't exist.</p>
          <Link href="/dashboard/interviews">
            <Button>Back to Interviews</Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <GradientBackground />

      <div className="p-4 md:p-8 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/interviews">
            <Button variant="ghost" size="icon" className="rounded-full bg-white/5 h-10 w-10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{interview.title}</h1>
            <p className="text-white/50">
              {interview.candidate?.name} &middot; {interview.candidate?.position}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize border ${statusColors[interview.status]}`}>
            {interview.status.replace("_", " ")}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interview Details */}
            <GlassCard className="p-6">
              <h2 className="text-lg font-bold mb-4">Interview Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50">Date</p>
                    <p className="font-medium">{formatDate(interview.scheduled_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50">Time</p>
                    <p className="font-medium">{formatTime(interview.scheduled_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Video className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50">Duration</p>
                    <p className="font-medium">{interview.duration_minutes || 60} minutes</p>
                  </div>
                </div>
                {interview.score && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10">
                      <Star className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50">Score</p>
                      <p className="font-medium">{interview.score}%</p>
                    </div>
                  </div>
                )}
              </div>

              {interview.notes && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-sm font-medium text-white/50 mb-2">Notes</h3>
                  <p className="text-white/80">{interview.notes}</p>
                </div>
              )}
            </GlassCard>

            {/* Questions & Answers */}
            {questions.length > 0 && (
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Questions & Answers
                </h2>
                <div className="space-y-4">
                  {questions.map((q, index) => (
                    <div key={q.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="font-medium mb-2">
                        <span className="text-blue-400 mr-2">Q{index + 1}:</span>
                        {q.question}
                      </p>
                      {q.answer ? (
                        <p className="text-white/70 text-sm pl-6">{q.answer}</p>
                      ) : (
                        <p className="text-white/30 text-sm pl-6 italic">No answer recorded</p>
                      )}
                      {q.score && (
                        <div className="mt-2 pl-6 flex items-center gap-2">
                          <span className="text-xs text-white/50">Score:</span>
                          <span className={`text-xs font-medium ${q.score >= 80 ? "text-green-400" : q.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                            {q.score}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Feedback */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Feedback
                </h2>
                {interview.status === "completed" && !showFeedbackForm && (
                  <Button size="sm" onClick={() => setShowFeedbackForm(true)}>
                    Add Feedback
                  </Button>
                )}
              </div>

              {showFeedbackForm ? (
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setFeedbackData(prev => ({ ...prev, rating: r }))}
                          className={`w-10 h-10 rounded-lg border transition-colors ${
                            feedbackData.rating >= r
                              ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                              : "bg-white/5 border-white/10 text-white/30"
                          }`}
                        >
                          <Star className="w-5 h-5 mx-auto" fill={feedbackData.rating >= r ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Recommendation</label>
                    <select
                      value={feedbackData.recommendation}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, recommendation: e.target.value as any }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="strong_hire" className="bg-gray-900">Strong Hire</option>
                      <option value="hire" className="bg-gray-900">Hire</option>
                      <option value="no_hire" className="bg-gray-900">No Hire</option>
                      <option value="strong_no_hire" className="bg-gray-900">Strong No Hire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Strengths (comma-separated)</label>
                    <input
                      type="text"
                      value={feedbackData.strengths}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, strengths: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                      placeholder="e.g., Technical skills, Communication"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Areas for Improvement (comma-separated)</label>
                    <input
                      type="text"
                      value={feedbackData.improvements}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, improvements: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                      placeholder="e.g., System design, Leadership"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Comments</label>
                    <textarea
                      value={feedbackData.comments}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, comments: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 resize-none"
                      placeholder="Additional comments..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="secondary" onClick={() => setShowFeedbackForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Submit Feedback</Button>
                  </div>
                </form>
              ) : feedback.length > 0 ? (
                <div className="space-y-4">
                  {feedback.map((f) => (
                    <div key={f.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((r) => (
                            <Star
                              key={r}
                              className={`w-4 h-4 ${r <= f.rating ? "text-yellow-400" : "text-white/20"}`}
                              fill={r <= f.rating ? "currentColor" : "none"}
                            />
                          ))}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          f.recommendation.includes("hire") && !f.recommendation.includes("no")
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {f.recommendation.replace(/_/g, " ")}
                        </span>
                      </div>

                      {f.strengths && f.strengths.length > 0 && (
                        <div className="mb-2">
                          <span className="text-xs text-white/50">Strengths: </span>
                          <span className="text-sm text-green-400">{f.strengths.join(", ")}</span>
                        </div>
                      )}

                      {f.improvements && f.improvements.length > 0 && (
                        <div className="mb-2">
                          <span className="text-xs text-white/50">To improve: </span>
                          <span className="text-sm text-yellow-400">{f.improvements.join(", ")}</span>
                        </div>
                      )}

                      {f.comments && (
                        <p className="text-sm text-white/70 mt-2">{f.comments}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/50 text-center py-8">No feedback submitted yet.</p>
              )}
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Candidate Card */}
            <GlassCard className="p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" /> Candidate
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                  {interview.candidate?.name ? getInitials(interview.candidate.name) : "?"}
                </div>
                <div>
                  <p className="font-semibold">{interview.candidate?.name || "Unknown"}</p>
                  <p className="text-sm text-white/50">{interview.candidate?.position || "N/A"}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-white/50">
                  Email: <span className="text-white">{interview.candidate?.email}</span>
                </p>
                {interview.candidate?.phone && (
                  <p className="text-white/50">
                    Phone: <span className="text-white">{interview.candidate.phone}</span>
                  </p>
                )}
              </div>
              <Link href={`/dashboard/candidates/${interview.candidate_id}`}>
                <Button variant="secondary" className="w-full mt-4">View Profile</Button>
              </Link>
            </GlassCard>

            {/* Actions */}
            <GlassCard className="p-6">
              <h2 className="text-lg font-bold mb-4">Actions</h2>
              <div className="space-y-3">
                {interview.status === "scheduled" && isUpcoming(interview.scheduled_at) && (
                  <Link href={`/dashboard/interviews/${interview.id}/session`}>
                    <Button className="w-full gap-2">
                      <Play className="w-4 h-4" /> Start Interview
                    </Button>
                  </Link>
                )}
                <Button
                  variant="secondary"
                  className="w-full gap-2 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4" /> Delete Interview
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
