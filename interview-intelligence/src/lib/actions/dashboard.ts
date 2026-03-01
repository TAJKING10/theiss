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

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

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

  // Get all candidates
  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .select("id, status, score")
    .eq("user_id", user.id);

  if (candidatesError) {
    throw new Error(candidatesError.message);
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const allInterviews = interviews || [];
  const completedInterviews = allInterviews.filter(i => i.status === "completed");

  // Calculate stats
  const totalInterviews = allInterviews.length;
  const totalCandidates = candidates?.length || 0;

  // Average score from completed interviews
  const scoresWithValues = completedInterviews.filter(i => i.score !== null);
  const avgFairnessScore = scoresWithValues.length > 0
    ? Math.round(scoresWithValues.reduce((acc, i) => acc + (i.score || 0), 0) / scoresWithValues.length)
    : 0;

  // Estimated time saved (assuming 2 hours saved per interview through AI assistance)
  const timeSavedHours = completedInterviews.length * 2;

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

  // Growth calculations (comparing to previous 30 days - simplified)
  const recentInterviewsCount = allInterviews.filter(
    i => new Date(i.created_at || "") >= thirtyDaysAgo
  ).length;

  const interviewGrowth = totalInterviews > 0 ? Math.round((recentInterviewsCount / totalInterviews) * 100) : 0;
  const candidateGrowth = 8; // Placeholder - would need historical data
  const scoreGrowth = 3; // Placeholder
  const timeGrowth = 15; // Placeholder

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
