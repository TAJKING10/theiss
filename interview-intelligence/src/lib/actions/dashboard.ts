"use server";

import { createClient } from "@/lib/supabase/server";
import type { InterviewWithCandidate } from "@/lib/supabase/types";

export interface DashboardStats {
  totalInterviews: number;
  totalCandidates: number;
  avgFairnessScore: number;
  timeSavedHours: number;
  interviewGrowth: number;
  candidateGrowth: number;
  scoreGrowth: number;
  timeGrowth: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentInterviews: InterviewWithCandidate[];
  upcomingInterviews: InterviewWithCandidate[];
}

// Helper to calculate growth percentage between two periods
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Get all interviews with candidates
  const { data: interviews, error: interviewsError } = await supabase
    .from("interviews")
    .select(`
      *,
      candidate:candidates(*)
    `)
    .eq("user_id", user.id)
    .order("scheduled_at", { ascending: false });

  if (interviewsError) {
    throw new Error(interviewsError.message);
  }

  // Get all candidates with created_at for growth calculation
  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .select("id, status, score, created_at")
    .eq("user_id", user.id);

  if (candidatesError) {
    throw new Error(candidatesError.message);
  }

  const allInterviews = interviews || [];
  const allCandidates = candidates || [];
  const completedInterviews = allInterviews.filter(i => i.status === "completed");

  // Calculate base stats
  const totalInterviews = allInterviews.length;
  const totalCandidates = allCandidates.length;

  // Average score from completed interviews
  const scoresWithValues = completedInterviews.filter(i => i.score !== null);
  const avgFairnessScore = scoresWithValues.length > 0
    ? Math.round(scoresWithValues.reduce((acc, i) => acc + (i.score || 0), 0) / scoresWithValues.length)
    : 0;

  // Estimated time saved (2 hours per AI-assisted interview)
  const timeSavedHours = completedInterviews.length * 2;

  // === REAL GROWTH CALCULATIONS ===

  // Interview Growth: Compare last 30 days vs previous 30 days
  const interviewsLast30Days = allInterviews.filter(
    i => new Date(i.created_at || "") >= thirtyDaysAgo
  ).length;
  const interviewsPrev30Days = allInterviews.filter(
    i => {
      const date = new Date(i.created_at || "");
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }
  ).length;
  const interviewGrowth = calculateGrowth(interviewsLast30Days, interviewsPrev30Days);

  // Candidate Growth: Compare last 30 days vs previous 30 days
  const candidatesLast30Days = allCandidates.filter(
    c => new Date(c.created_at || "") >= thirtyDaysAgo
  ).length;
  const candidatesPrev30Days = allCandidates.filter(
    c => {
      const date = new Date(c.created_at || "");
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }
  ).length;
  const candidateGrowth = calculateGrowth(candidatesLast30Days, candidatesPrev30Days);

  // Score Growth: Compare avg score last 30 days vs previous 30 days
  const completedLast30 = completedInterviews.filter(
    i => new Date(i.created_at || "") >= thirtyDaysAgo && i.score !== null
  );
  const completedPrev30 = completedInterviews.filter(
    i => {
      const date = new Date(i.created_at || "");
      return date >= sixtyDaysAgo && date < thirtyDaysAgo && i.score !== null;
    }
  );
  const avgScoreLast30 = completedLast30.length > 0
    ? completedLast30.reduce((acc, i) => acc + (i.score || 0), 0) / completedLast30.length
    : 0;
  const avgScorePrev30 = completedPrev30.length > 0
    ? completedPrev30.reduce((acc, i) => acc + (i.score || 0), 0) / completedPrev30.length
    : 0;
  const scoreGrowth = calculateGrowth(Math.round(avgScoreLast30), Math.round(avgScorePrev30));

  // Time Growth: Compare time saved last 30 days vs previous 30 days
  const timeSavedLast30 = completedLast30.length * 2;
  const timeSavedPrev30 = completedPrev30.length * 2;
  const timeGrowth = calculateGrowth(timeSavedLast30, timeSavedPrev30);

  // Recent interviews (completed or in review)
  const recentInterviews = allInterviews
    .filter(i => i.status === "completed" || i.status === "review")
    .slice(0, 5)
    .map(item => ({
      ...item,
      candidate: item.candidate as InterviewWithCandidate["candidate"]
    }));

  // Upcoming interviews
  const upcomingInterviews = allInterviews
    .filter(i => i.status === "scheduled" && new Date(i.scheduled_at) >= now)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 5)
    .map(item => ({
      ...item,
      candidate: item.candidate as InterviewWithCandidate["candidate"]
    }));

  return {
    stats: {
      totalInterviews,
      totalCandidates,
      avgFairnessScore,
      timeSavedHours,
      interviewGrowth,
      candidateGrowth,
      scoreGrowth,
      timeGrowth,
    },
    recentInterviews,
    upcomingInterviews,
  };
}
