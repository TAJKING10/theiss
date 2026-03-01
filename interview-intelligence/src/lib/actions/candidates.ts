"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { InsertTables, UpdateTables, Candidate } from "@/lib/supabase/types";

export async function getCandidates(): Promise<Candidate[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getCandidate(id: string): Promise<Candidate | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return data;
}

export async function createCandidate(
  candidate: Omit<InsertTables<"candidates">, "user_id" | "id" | "created_at" | "updated_at">
): Promise<Candidate> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("candidates")
    .insert({
      ...candidate,
      user_id: user.id,
      avatar_url: candidate.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/candidates");
  return data;
}

export async function updateCandidate(
  id: string,
  updates: UpdateTables<"candidates">
): Promise<Candidate> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("candidates")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/candidates");
  revalidatePath(`/dashboard/candidates/${id}`);
  return data;
}

export async function deleteCandidate(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("candidates")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/candidates");
}

export async function getCandidateStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("candidates")
    .select("status")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  const stats = {
    total: data?.length || 0,
    pending: data?.filter(c => c.status === "pending").length || 0,
    interviewed: data?.filter(c => c.status === "interviewed").length || 0,
    review: data?.filter(c => c.status === "review").length || 0,
    hired: data?.filter(c => c.status === "hired").length || 0,
    rejected: data?.filter(c => c.status === "rejected").length || 0,
  };

  return stats;
}
