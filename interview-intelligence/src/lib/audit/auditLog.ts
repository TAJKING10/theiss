/**
 * Audit Logging System for Interview AI
 *
 * Provides comprehensive logging of all AI-assisted hiring decisions
 * for compliance, accountability, and transparency.
 *
 * EU AI Act Compliance:
 * - Logs all AI recommendations and human decisions
 * - Tracks scoring methodology versions
 * - Records prompt/rubric versions for reproducibility
 * - Maintains chain of accountability
 */

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  interviewId: string;
  userId: string;
  candidateId: string;

  // Event-specific data
  data: Record<string, unknown>;

  // Versioning for reproducibility
  systemVersion: string;
  rubricVersion: string;
  promptVersion: string;

  // Metadata
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export type AuditEventType =
  | "interview_started"
  | "interview_completed"
  | "ai_evaluation"
  | "competency_scored"
  | "human_override"
  | "recommendation_changed"
  | "decision_finalized"
  | "transcript_saved"
  | "recording_saved"
  | "observer_joined"
  | "observer_left"
  | "export_requested";

interface AuditLogConfig {
  systemVersion: string;
  rubricVersion: string;
  promptVersion: string;
}

const CURRENT_CONFIG: AuditLogConfig = {
  systemVersion: "1.0.0",
  rubricVersion: "1.0",
  promptVersion: "2024.1",
};

// In-memory audit log for demo (in production, this would be stored in database)
const auditLogs: AuditLogEntry[] = [];

function generateId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function createAuditEntry(
  eventType: AuditEventType,
  interviewId: string,
  userId: string,
  candidateId: string,
  data: Record<string, unknown>
): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    eventType,
    interviewId,
    userId,
    candidateId,
    data,
    systemVersion: CURRENT_CONFIG.systemVersion,
    rubricVersion: CURRENT_CONFIG.rubricVersion,
    promptVersion: CURRENT_CONFIG.promptVersion,
  };

  auditLogs.push(entry);
  console.log(`[AUDIT] ${eventType}:`, entry.id);

  return entry;
}

export function logInterviewStarted(
  interviewId: string,
  userId: string,
  candidateId: string,
  candidateName: string,
  position: string
): AuditLogEntry {
  return createAuditEntry("interview_started", interviewId, userId, candidateId, {
    candidateName,
    position,
    startTime: new Date().toISOString(),
  });
}

export function logInterviewCompleted(
  interviewId: string,
  userId: string,
  candidateId: string,
  data: {
    duration: number;
    questionsAnswered: number;
    totalQuestions: number;
    aiScore: number;
    aiRecommendation: string;
  }
): AuditLogEntry {
  return createAuditEntry("interview_completed", interviewId, userId, candidateId, {
    ...data,
    completedAt: new Date().toISOString(),
  });
}

export function logAIEvaluation(
  interviewId: string,
  userId: string,
  candidateId: string,
  data: {
    questionIndex: number;
    question: string;
    answerLength: number;
    overallScore: number;
    competencies: Array<{
      competency: string;
      score: number;
      level: string;
    }>;
    confidence: number;
    scoringMethodology: string;
  }
): AuditLogEntry {
  return createAuditEntry("ai_evaluation", interviewId, userId, candidateId, {
    ...data,
    faceMetricsUsedInScore: false, // Always false per EU AI Act
    evaluatedAt: new Date().toISOString(),
  });
}

export function logHumanOverride(
  interviewId: string,
  userId: string,
  candidateId: string,
  data: {
    aiRecommendation: string;
    aiScore: number;
    humanDecision: string;
    reasoning: string;
    overriddenBy: string;
  }
): AuditLogEntry {
  return createAuditEntry("human_override", interviewId, userId, candidateId, {
    ...data,
    overrideTimestamp: new Date().toISOString(),
    complianceNote: "Human oversight decision logged per EU AI Act requirements",
  });
}

export function logDecisionFinalized(
  interviewId: string,
  userId: string,
  candidateId: string,
  data: {
    finalDecision: string;
    madeBy: "ai" | "human";
    aiScore: number;
    humanOverride: boolean;
    reasoning?: string;
  }
): AuditLogEntry {
  return createAuditEntry("decision_finalized", interviewId, userId, candidateId, {
    ...data,
    finalizedAt: new Date().toISOString(),
    humanOversightApplied: data.madeBy === "human",
  });
}

export function getAuditLogs(interviewId?: string): AuditLogEntry[] {
  if (interviewId) {
    return auditLogs.filter((log) => log.interviewId === interviewId);
  }
  return [...auditLogs];
}

export function exportAuditLogs(interviewId: string): string {
  const logs = getAuditLogs(interviewId);
  return JSON.stringify(logs, null, 2);
}

// Generate compliance report for interview
export function generateComplianceReport(interviewId: string): {
  summary: string;
  events: AuditLogEntry[];
  humanOversightApplied: boolean;
  aiMethodology: string;
  faceMetricsUsedInDecision: boolean;
} {
  const logs = getAuditLogs(interviewId);
  const humanOverride = logs.find((l) => l.eventType === "human_override");
  const finalDecision = logs.find((l) => l.eventType === "decision_finalized");

  return {
    summary: `Interview ${interviewId} - ${logs.length} audit events recorded`,
    events: logs,
    humanOversightApplied: !!humanOverride || (finalDecision?.data.madeBy === "human"),
    aiMethodology: "transcript-based competency rubric scoring",
    faceMetricsUsedInDecision: false,
  };
}

// Audit log viewer component data
export function getAuditLogSummary(interviewId: string): {
  totalEvents: number;
  evaluations: number;
  humanDecisions: number;
  timeline: Array<{
    time: string;
    event: string;
    type: AuditEventType;
  }>;
} {
  const logs = getAuditLogs(interviewId);

  return {
    totalEvents: logs.length,
    evaluations: logs.filter((l) => l.eventType === "ai_evaluation").length,
    humanDecisions: logs.filter(
      (l) => l.eventType === "human_override" || l.eventType === "decision_finalized"
    ).length,
    timeline: logs.map((l) => ({
      time: new Date(l.timestamp).toLocaleTimeString(),
      event: formatEventDescription(l),
      type: l.eventType,
    })),
  };
}

function formatEventDescription(entry: AuditLogEntry): string {
  switch (entry.eventType) {
    case "interview_started":
      return `Interview started for ${entry.data.candidateName}`;
    case "interview_completed":
      return `Interview completed - AI Score: ${entry.data.aiScore}%`;
    case "ai_evaluation":
      return `Q${(entry.data.questionIndex as number) + 1} evaluated - Score: ${entry.data.overallScore}%`;
    case "human_override":
      return `Human override: ${entry.data.humanDecision}`;
    case "decision_finalized":
      return `Final decision: ${entry.data.finalDecision} (${entry.data.madeBy})`;
    default:
      return entry.eventType.replace(/_/g, " ");
  }
}
