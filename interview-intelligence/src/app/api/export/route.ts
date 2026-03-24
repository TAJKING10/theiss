import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuditLogs } from "@/lib/audit/auditLog";
import { COMPETENCY_WEIGHTS, getScoringFormula } from "@/lib/ai/competencyRubric";

/**
 * Export API for Thesis Evaluation Dataset
 *
 * Exports all required fields for research analysis:
 * - Interview metadata
 * - Questions and transcripts
 * - AI competency scores
 * - Human override decisions
 * - Audit trail
 * - System versioning
 */

interface ExportedInterview {
  // Identifiers
  interview_id: string;
  candidate_id: string;
  user_id: string;

  // Role information
  role: string;
  department?: string;

  // Timing
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  duration_seconds: number;

  // Questions and Answers
  questions: {
    question_id: string;
    question_index: number;
    question_text: string;
    answer_transcript: string;
    answer_length: number;

    // AI Scores
    ai_overall_score: number;
    ai_competency_scores: {
      competency: string;
      score: number;
      weight: number;
      level: string;
      evidence: string[];
      reasoning: string;
    }[];
    ai_confidence: number;
  }[];

  // Final AI Assessment
  ai_final_score: number;
  ai_recommendation: string;
  scoring_formula: string;
  competency_weights: Record<string, number>;

  // Human Override
  human_decision: string | null;
  human_override_applied: boolean;
  human_notes: string;
  human_decision_timestamp: string | null;

  // Audit & Versioning
  rubric_version: string;
  prompt_version: string;
  system_version: string;
  audit_event_count: number;

  // Research Telemetry (NOT used in scoring)
  research_telemetry: {
    confidence?: number;
    engagement?: number;
    clarity?: number;
    note: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const interviewId = searchParams.get("interviewId");

    // Build query
    let query = supabase
      .from("interviews")
      .select(`
        *,
        candidate:candidates(*),
        questions:interview_questions(*)
      `)
      .eq("user_id", user.id)
      .eq("status", "completed");

    if (interviewId) {
      query = query.eq("id", interviewId);
    }

    const { data: interviews, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to export format
    const exportedData: ExportedInterview[] = (interviews || []).map((interview: any) => {
      const aiInsights = interview.ai_insights || {};
      const answers = aiInsights.answers || [];
      const auditLogs = getAuditLogs(interview.id);

      return {
        // Identifiers
        interview_id: interview.id,
        candidate_id: interview.candidate_id,
        user_id: interview.user_id,

        // Role information
        role: interview.candidate?.position || "",
        department: interview.candidate?.department,

        // Timing
        scheduled_at: interview.scheduled_at,
        started_at: interview.started_at,
        completed_at: interview.completed_at || interview.updated_at,
        duration_seconds: aiInsights.duration || 0,

        // Questions and Answers
        questions: answers.map((a: any, index: number) => ({
          question_id: interview.questions?.[index]?.id || `q_${index}`,
          question_index: index,
          question_text: a.question || "",
          answer_transcript: a.answer || "",
          answer_length: (a.answer || "").length,

          // AI Scores
          ai_overall_score: a.score || 0,
          ai_competency_scores: (a.competencies || []).map((c: any) => ({
            competency: c.competency,
            score: c.score,
            weight: COMPETENCY_WEIGHTS[c.competency] || 0.25,
            level: c.level,
            evidence: c.evidence || [],
            reasoning: c.reasoning || "",
          })),
          ai_confidence: a.confidence || 0,
        })),

        // Final AI Assessment
        ai_final_score: interview.score || 0,
        ai_recommendation: interview.score >= 80 ? "approved" :
          interview.score >= 60 ? "review" : "rejected",
        scoring_formula: getScoringFormula(),
        competency_weights: COMPETENCY_WEIGHTS,

        // Human Override
        human_decision: aiInsights.humanOverride?.decision || null,
        human_override_applied: !!aiInsights.humanOverride?.enabled,
        human_notes: aiInsights.humanOverride?.notes || "",
        human_decision_timestamp: aiInsights.humanOverride?.overriddenAt || null,

        // Audit & Versioning
        rubric_version: aiInsights.scoringMethodology?.version || "1.0",
        prompt_version: "2024.1",
        system_version: "1.0.0",
        audit_event_count: auditLogs.length,

        // Research Telemetry
        research_telemetry: {
          confidence: aiInsights.researchTelemetry?.confidence,
          engagement: aiInsights.researchTelemetry?.engagement,
          clarity: aiInsights.researchTelemetry?.clarity,
          note: "Research telemetry only - NOT used in scoring per EU AI Act",
        },
      };
    });

    // Return based on format
    if (format === "csv") {
      const csv = convertToCSV(exportedData);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="thesis_export_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      export_metadata: {
        exported_at: new Date().toISOString(),
        exported_by: user.id,
        total_interviews: exportedData.length,
        scoring_formula: getScoringFormula(),
        competency_weights: COMPETENCY_WEIGHTS,
        system_version: "1.0.0",
        rubric_version: "1.0",
        prompt_version: "2024.1",
      },
      interviews: exportedData,
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: error.message || "Export failed" },
      { status: 500 }
    );
  }
}

// Convert to CSV for spreadsheet analysis
function convertToCSV(data: ExportedInterview[]): string {
  const headers = [
    "interview_id",
    "role",
    "duration_seconds",
    "questions_count",
    "ai_final_score",
    "ai_recommendation",
    "human_decision",
    "human_override_applied",
    "human_notes",
    "competency_communication_score",
    "competency_problem_solving_score",
    "competency_relevance_score",
    "competency_evidence_score",
    "rubric_version",
    "prompt_version",
  ];

  const rows = data.map((interview) => {
    // Aggregate competency scores across all questions
    const competencyAverages: Record<string, number[]> = {};
    interview.questions.forEach((q) => {
      q.ai_competency_scores.forEach((c) => {
        if (!competencyAverages[c.competency]) {
          competencyAverages[c.competency] = [];
        }
        competencyAverages[c.competency].push(c.score);
      });
    });

    const getAvg = (name: string) => {
      const scores = competencyAverages[name] || [];
      return scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : "";
    };

    return [
      interview.interview_id,
      `"${interview.role}"`,
      interview.duration_seconds,
      interview.questions.length,
      interview.ai_final_score,
      interview.ai_recommendation,
      interview.human_decision || "",
      interview.human_override_applied,
      `"${interview.human_notes.replace(/"/g, '""')}"`,
      getAvg("Communication"),
      getAvg("Problem Solving"),
      getAvg("Relevance & Role Fit"),
      getAvg("Evidence Quality"),
      interview.rubric_version,
      interview.prompt_version,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
