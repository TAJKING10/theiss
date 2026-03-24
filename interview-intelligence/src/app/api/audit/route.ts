import { NextRequest, NextResponse } from "next/server";
import {
  logInterviewStarted,
  logInterviewCompleted,
  logAIEvaluation,
  logHumanOverride,
  logDecisionFinalized,
  getAuditLogs,
  generateComplianceReport,
  getAuditLogSummary,
} from "@/lib/audit/auditLog";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, interviewId, candidateId, data } = body;

    let entry;

    switch (action) {
      case "interview_started":
        entry = logInterviewStarted(
          interviewId,
          user.id,
          candidateId,
          data.candidateName,
          data.position
        );
        break;

      case "interview_completed":
        entry = logInterviewCompleted(interviewId, user.id, candidateId, {
          duration: data.duration,
          questionsAnswered: data.questionsAnswered,
          totalQuestions: data.totalQuestions,
          aiScore: data.aiScore,
          aiRecommendation: data.aiRecommendation,
        });
        break;

      case "ai_evaluation":
        entry = logAIEvaluation(interviewId, user.id, candidateId, {
          questionIndex: data.questionIndex,
          question: data.question,
          answerLength: data.answerLength,
          overallScore: data.overallScore,
          competencies: data.competencies,
          confidence: data.confidence,
          scoringMethodology: data.scoringMethodology || "competency-based rubric",
        });
        break;

      case "human_override":
        entry = logHumanOverride(interviewId, user.id, candidateId, {
          aiRecommendation: data.aiRecommendation,
          aiScore: data.aiScore,
          humanDecision: data.humanDecision,
          reasoning: data.reasoning,
          overriddenBy: user.email || "Unknown",
        });
        break;

      case "decision_finalized":
        entry = logDecisionFinalized(interviewId, user.id, candidateId, {
          finalDecision: data.finalDecision,
          madeBy: data.madeBy,
          aiScore: data.aiScore,
          humanOverride: data.humanOverride,
          reasoning: data.reasoning,
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Persist audit entry to Supabase (append to ai_insights.auditLog)
    if (entry && interviewId) {
      try {
        const { data: interviewRow } = await supabase
          .from("interviews")
          .select("ai_insights")
          .eq("id", interviewId)
          .eq("user_id", user.id)
          .single();

        const current = (interviewRow?.ai_insights as Record<string, unknown>) || {};
        const log = (current.auditLog as unknown[]) || [];
        const updatedInsights = { ...current, auditLog: [...log, entry] };

        await supabase
          .from("interviews")
          .update({ ai_insights: updatedInsights as import("@/lib/supabase/types").Json })
          .eq("id", interviewId)
          .eq("user_id", user.id);
      } catch (persistErr) {
        // Non-fatal: in-memory entry still created
        console.warn("Audit log persistence failed:", persistErr);
      }
    }

    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    console.error("Audit API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get("interviewId");
    const format = searchParams.get("format") || "logs";

    if (!interviewId) {
      return NextResponse.json({ error: "interviewId required" }, { status: 400 });
    }

    // Try to fetch persisted logs from Supabase first
    const { data: interviewRow } = await supabase
      .from("interviews")
      .select("ai_insights")
      .eq("id", interviewId)
      .eq("user_id", user.id)
      .single();

    const persistedLogs = ((interviewRow?.ai_insights as Record<string, unknown>)?.auditLog as unknown[]) || [];

    // Merge with in-memory logs (deduplicate by id)
    const inMemoryLogs = getAuditLogs(interviewId);
    const persistedIds = new Set(persistedLogs.map((l: any) => l.id));
    const merged = [...persistedLogs, ...inMemoryLogs.filter((l: any) => !persistedIds.has(l.id))];

    switch (format) {
      case "compliance":
        const report = generateComplianceReport(interviewId);
        report.events = merged as any;
        return NextResponse.json(report);

      case "summary":
        const summary = getAuditLogSummary(interviewId);
        summary.totalEvents = merged.length;
        summary.evaluations = merged.filter((l: any) => l.eventType === "ai_evaluation").length;
        summary.humanDecisions = merged.filter((l: any) => l.eventType === "human_override" || l.eventType === "decision_finalized").length;
        return NextResponse.json(summary);

      case "logs":
      default:
        return NextResponse.json({ logs: merged });
    }
  } catch (error: any) {
    console.error("Audit API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
