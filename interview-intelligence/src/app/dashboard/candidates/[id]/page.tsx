"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getCandidate } from "@/lib/actions/candidates";
import { getInterviews } from "@/lib/actions/interviews";
import type { Candidate, InterviewWithCandidate } from "@/lib/supabase/types";

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [interviews, setInterviews] = useState<InterviewWithCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "interviews" | "ai" | "timeline">("overview");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getCandidate(id),
      getInterviews(),
    ]).then(([cand, allInterviews]) => {
      if (!cand) { router.push("/dashboard/candidates"); return; }
      setCandidate(cand);
      setInterviews(allInterviews.filter(i => i.candidate?.id === id));
    }).catch(console.error).finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="text-white/40">Loading candidate...</div>
    </div>
  );

  if (!candidate) return null;

  const completedInterviews = interviews.filter(i => i.status === "completed");
  const avgScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((s, i) => s + (i.score || 0), 0) / completedInterviews.length)
    : candidate.score || 0;

  const initials = candidate.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  // Parse AI insights from the most recent completed interview
  const latestInterview = completedInterviews[0];
  const aiData = latestInterview?.ai_insights as any;
  const strengths: string[] = aiData?.feedback?.strengths || aiData?.strengths || [];
  const improvements: string[] = aiData?.feedback?.improvements || aiData?.improvements || [];
  const summary: string = aiData?.feedback?.summary || aiData?.summary || "";
  const scoreBreakdown = (latestInterview as any)?.score_breakdown ?? (latestInterview as any)?.metadata?.scoreBreakdown ?? null;

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
        <Link href="/dashboard/candidates" className="hover:text-white transition-colors">Candidates</Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-white">{candidate.name}</span>
      </div>

      {/* Header Card */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{candidate.name}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 capitalize">
                  {candidate.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-white/70 mb-1">{candidate.position}</p>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <a href={`mailto:${candidate.email}`} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  {candidate.email}
                </a>
                {candidate.phone && <>
                  <span className="text-white/20">•</span>
                  <span className="text-sm text-white/50">{candidate.phone}</span>
                </>}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="text-right">
              <div className="text-sm text-white/50 mb-1">Overall Score</div>
              {avgScore > 0
                ? <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{avgScore}%</div>
                : <div className="text-2xl text-white/30">No score yet</div>
              }
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 border-t border-white/5 pt-6 -mx-6 px-6 flex-wrap">
          {[
            { id: "overview", label: "Overview", icon: "📋" },
            { id: "interviews", label: `Interviews (${completedInterviews.length})`, icon: "🎙" },
            { id: "ai", label: "AI Analysis", icon: "🧠" },
            { id: "timeline", label: "Timeline", icon: "📅" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 rounded-2xl bg-white/[0.02] border border-white/5 p-6">
            <h3 className="font-semibold text-lg mb-6">Interview Scores</h3>
            {completedInterviews.length === 0 ? (
              <p className="text-white/40 text-sm">No completed interviews yet.</p>
            ) : (
              <div className="space-y-4">
                {completedInterviews.map((interview, i) => {
                  const sc = interview.score || 0;
                  return (
                    <div key={interview.id}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/70">
                          Interview #{i + 1} — {new Date(interview.created_at || "").toLocaleDateString()}
                        </span>
                        <span className={`font-medium ${sc >= 80 ? "text-green-400" : sc >= 60 ? "text-blue-400" : "text-yellow-400"}`}>
                          {sc}%
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${sc >= 80 ? "bg-gradient-to-r from-green-500 to-emerald-400" : sc >= 60 ? "bg-gradient-to-r from-blue-500 to-cyan-400" : "bg-gradient-to-r from-yellow-500 to-orange-400"}`}
                          style={{ width: `${sc}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Score breakdown from last interview */}
                {scoreBreakdown && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-white/40 mb-3">Last interview breakdown</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Answers", value: scoreBreakdown.answerScore, icon: "📝" },
                        { label: "Body Language", value: scoreBreakdown.bodyLangScore, icon: "🧍" },
                        { label: "Speech Emotion", value: scoreBreakdown.speechEmotionScore, icon: "🎙️" },
                      ].filter(x => x.value > 0).map(({ label, value, icon }) => (
                        <div key={label} className="p-3 rounded-xl bg-white/5 text-center">
                          <div className="text-lg mb-1">{icon}</div>
                          <div className="text-lg font-bold text-white/80">{value}%</div>
                          <div className="text-xs text-white/40">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
              <h3 className="font-semibold mb-4">Candidate Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Position</span>
                  <span className="text-white/90 text-right">{candidate.position}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Added</span>
                  <span className="text-white/90">{new Date(candidate.created_at || "").toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Interviews</span>
                  <span className="text-white/90">{completedInterviews.length} completed</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Status</span>
                  <span className="text-white/90 capitalize">{candidate.status.replace(/_/g, " ")}</span>
                </div>
              </div>
              {candidate.notes && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-white/40 mb-1">Notes</p>
                  <p className="text-sm text-white/70">{candidate.notes}</p>
                </div>
              )}
            </div>

            {avgScore > 0 && (
              <div className={`rounded-2xl p-6 ${avgScore >= 80 ? "bg-green-500/10 border border-green-500/20" : avgScore >= 60 ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{avgScore >= 80 ? "✅" : avgScore >= 60 ? "⚠️" : "❌"}</span>
                  <span className={`font-semibold ${avgScore >= 80 ? "text-green-400" : avgScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                    {avgScore >= 80 ? "Recommend" : avgScore >= 60 ? "Needs Review" : "Not Recommended"}
                  </span>
                </div>
                <p className="text-sm text-white/60">Based on {completedInterviews.length} interview{completedInterviews.length !== 1 ? "s" : ""}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interviews Tab */}
      {activeTab === "interviews" && (
        <div className="space-y-4">
          {interviews.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-8 text-center">
              <p className="text-white/40">No interviews yet for this candidate.</p>
              <Link href={`/dashboard/interviews/new?candidate=${id}`} className="mt-4 inline-block px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors">
                Schedule Interview
              </Link>
            </div>
          ) : interviews.map((interview) => (
            <div key={interview.id} className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg capitalize">{interview.status} Interview</h3>
                  <p className="text-white/50 text-sm">
                    {new Date(interview.scheduled_at || interview.created_at || "").toLocaleDateString()} · {interview.duration_minutes || 0} min
                  </p>
                </div>
                <div className="text-right">
                  {interview.score ? (
                    <>
                      <div className={`text-3xl font-bold ${interview.score >= 80 ? "text-green-400" : interview.score >= 60 ? "text-blue-400" : "text-yellow-400"}`}>{interview.score}%</div>
                      <div className="text-sm text-white/50">Score</div>
                    </>
                  ) : (
                    <span className="text-white/30 text-sm capitalize">{interview.status}</span>
                  )}
                </div>
              </div>
              <Link
                href={`/dashboard/interviews/${interview.id}`}
                className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-sm hover:bg-blue-500/20 transition-colors inline-block"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* AI Analysis Tab */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          {!latestInterview ? (
            <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-8 text-center">
              <p className="text-white/40">Complete an interview to see AI analysis.</p>
            </div>
          ) : (
            <>
              {summary && (
                <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-6">
                  <h3 className="font-semibold text-lg mb-2">AI Summary</h3>
                  <p className="text-white/70 leading-relaxed">{summary}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {strengths.length > 0 && (
                  <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm">+</span>
                      Key Strengths
                    </h3>
                    <ul className="space-y-3">
                      {strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                          <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {improvements.length > 0 && (
                  <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-sm">!</span>
                      Areas for Growth
                    </h3>
                    <ul className="space-y-3">
                      {improvements.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                          <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Multimodal analysis from real score breakdown */}
              {scoreBreakdown && (
                <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                  <h3 className="font-semibold mb-6">Multimodal Analysis (Last Interview)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] text-center">
                      <div className="text-3xl mb-2">📝</div>
                      <p className="text-sm text-white/50 mb-1">Answer Quality</p>
                      <p className="text-xl font-semibold text-blue-400">{scoreBreakdown.answerScore}%</p>
                      <p className="text-xs text-white/30 mt-1">AI rubric evaluation</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] text-center">
                      <div className="text-3xl mb-2">🧍</div>
                      <p className="text-sm text-white/50 mb-1">Body Language</p>
                      <p className={`text-xl font-semibold ${scoreBreakdown.bodyLangScore >= 70 ? "text-green-400" : "text-yellow-400"}`}>{scoreBreakdown.bodyLangScore}%</p>
                      <p className="text-xs text-white/30 mt-1">{scoreBreakdown.dominantBodyLang || "MediaPipe analysis"}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] text-center">
                      <div className="text-3xl mb-2">🎙️</div>
                      <p className="text-sm text-white/50 mb-1">Speech Emotion</p>
                      <p className={`text-xl font-semibold ${scoreBreakdown.speechEmotionScore >= 70 ? "text-green-400" : "text-yellow-400"}`}>{scoreBreakdown.speechEmotionScore}%</p>
                      <p className="text-xs text-white/30 mt-1">{scoreBreakdown.dominantEmotion || "Voice analysis"}</p>
                    </div>
                  </div>
                </div>
              )}

              {!summary && !strengths.length && (
                <p className="text-white/40 text-sm text-center">AI feedback not yet generated for this interview.</p>
              )}
            </>
          )}
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === "timeline" && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
          <h3 className="font-semibold text-lg mb-6">Candidate Timeline</h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />
            <div className="space-y-6">
              <div className="flex items-start gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 z-10 text-sm">✓</div>
                <div className="flex-1 pt-1">
                  <p className="font-medium">Candidate Added</p>
                  <p className="text-sm text-white/50">{new Date(candidate.created_at || "").toLocaleDateString()}</p>
                </div>
              </div>
              {interviews.sort((a, b) => new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime()).map((interview, i) => (
                <div key={interview.id} className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 z-10 text-sm">🎙</div>
                  <div className="flex-1 pt-1">
                    <p className="font-medium">Interview #{i + 1} — {interview.status}</p>
                    <p className="text-sm text-white/50">
                      {new Date(interview.created_at || "").toLocaleDateString()}
                      {interview.score ? ` · Score: ${interview.score}%` : ""}
                    </p>
                  </div>
                </div>
              ))}
              {candidate.updated_at && candidate.updated_at !== candidate.created_at && (
                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 z-10 text-sm">🧠</div>
                  <div className="flex-1 pt-1">
                    <p className="font-medium">Last Updated</p>
                    <p className="text-sm text-white/50">{new Date(candidate.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
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
            <Link
              href={`/dashboard/interviews/new?candidate=${id}`}
              className="px-4 py-2 rounded-xl bg-white/5 text-white text-sm hover:bg-white/10 transition-colors"
            >
              Schedule Interview
            </Link>
            <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all">
              Make Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
