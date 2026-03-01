"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { InsertTables, UpdateTables, Interview, InterviewWithCandidate } from "@/lib/supabase/types";

export async function getInterviews(): Promise<InterviewWithCandidate[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("interviews")
    .select(`
      *,
      candidate:candidates(*)
    `)
    .eq("user_id", user.id)
    .order("scheduled_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(item => ({
    ...item,
    candidate: item.candidate as InterviewWithCandidate["candidate"]
  }));
}

export async function getInterview(id: string): Promise<InterviewWithCandidate | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("interviews")
    .select(`
      *,
      candidate:candidates(*)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return {
    ...data,
    candidate: data.candidate as InterviewWithCandidate["candidate"]
  };
}

export async function getUpcomingInterviews(limit: number = 5): Promise<InterviewWithCandidate[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("interviews")
    .select(`
      *,
      candidate:candidates(*)
    `)
    .eq("user_id", user.id)
    .eq("status", "scheduled")
    .gte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(item => ({
    ...item,
    candidate: item.candidate as InterviewWithCandidate["candidate"]
  }));
}

export async function getRecentInterviews(limit: number = 5): Promise<InterviewWithCandidate[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("interviews")
    .select(`
      *,
      candidate:candidates(*)
    `)
    .eq("user_id", user.id)
    .in("status", ["completed", "review"])
    .order("scheduled_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(item => ({
    ...item,
    candidate: item.candidate as InterviewWithCandidate["candidate"]
  }));
}

export async function createInterview(
  interview: Omit<InsertTables<"interviews">, "user_id" | "id" | "created_at" | "updated_at">
): Promise<Interview> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("interviews")
    .insert({
      ...interview,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/interviews");
  return data;
}

export async function updateInterview(
  id: string,
  updates: UpdateTables<"interviews">
): Promise<Interview> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("interviews")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/interviews");
  revalidatePath(`/dashboard/interviews/${id}`);
  return data;
}

export async function startInterview(id: string): Promise<Interview> {
  return updateInterview(id, { status: "in_progress" });
}

export async function completeInterview(
  id: string,
  score?: number,
  notes?: string,
  aiInsights?: Record<string, unknown>
): Promise<Interview> {
  return updateInterview(id, {
    status: "completed",
    score,
    notes,
    ai_insights: aiInsights,
  });
}

export async function cancelInterview(id: string): Promise<Interview> {
  return updateInterview(id, { status: "cancelled" });
}

export async function deleteInterview(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("interviews")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/interviews");
}

export async function getInterviewStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("interviews")
    .select("status, score, duration_minutes")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  const completed = data?.filter(i => i.status === "completed") || [];
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((acc, i) => acc + (i.score || 0), 0) / completed.length)
    : 0;
  const totalDuration = completed.reduce((acc, i) => acc + (i.duration_minutes || 0), 0);

  return {
    total: data?.length || 0,
    scheduled: data?.filter(i => i.status === "scheduled").length || 0,
    inProgress: data?.filter(i => i.status === "in_progress").length || 0,
    completed: completed.length,
    cancelled: data?.filter(i => i.status === "cancelled").length || 0,
    avgScore,
    totalDurationHours: Math.round(totalDuration / 60),
  };
}
