"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables, InsertTables, UpdateTables } from "@/lib/supabase/types";

type Interview = Tables<"interviews">;
type InterviewInsert = InsertTables<"interviews">;
type InterviewUpdate = UpdateTables<"interviews">;

interface InterviewWithCandidate extends Interview {
  candidates?: {
    name: string;
    email: string;
    position: string;
  };
}

export function useInterviews() {
  const [interviews, setInterviews] = useState<InterviewWithCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchInterviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Get current user first for security
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setIsLoading(false);
      return;
    }

    // Filter by user_id for security
    const { data, error: fetchError } = await supabase
      .from("interviews")
      .select(`
        *,
        candidates (
          name,
          email,
          position
        )
      `)
      .eq("user_id", user.id)
      .order("scheduled_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setInterviews(data || []);
    }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const scheduleInterview = async (interview: Omit<InterviewInsert, "user_id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("interviews")
      .insert({ ...interview, user_id: user.id })
      .select(`
        *,
        candidates (
          name,
          email,
          position
        )
      `)
      .single();

    if (error) throw new Error(error.message);
    setInterviews((prev) => [data, ...prev]);
    return data;
  };

  const updateInterview = async (id: string, updates: InterviewUpdate) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Ensure user owns this interview
    const { data, error } = await supabase
      .from("interviews")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select(`
        *,
        candidates (
          name,
          email,
          position
        )
      `)
      .single();

    if (error) throw new Error(error.message);
    setInterviews((prev) =>
      prev.map((i) => (i.id === id ? data : i))
    );
    return data;
  };

  const deleteInterview = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Ensure user owns this interview
    const { error } = await supabase
      .from("interviews")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    setInterviews((prev) => prev.filter((i) => i.id !== id));
  };

  const getUpcomingInterviews = () => {
    const now = new Date();
    return interviews.filter(
      (i) => new Date(i.scheduled_at) > now && i.status === "scheduled"
    );
  };

  const getRecentInterviews = () => {
    return interviews.filter((i) => i.status === "completed").slice(0, 5);
  };

  return {
    interviews,
    isLoading,
    error,
    refetch: fetchInterviews,
    scheduleInterview,
    updateInterview,
    deleteInterview,
    getUpcomingInterviews,
    getRecentInterviews,
  };
}

export function useInterview(id: string) {
  const [interview, setInterview] = useState<InterviewWithCandidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchInterview = async () => {
      setIsLoading(true);

      // Get current user first for security
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        setIsLoading(false);
        return;
      }

      // Filter by user_id for security
      const { data, error: fetchError } = await supabase
        .from("interviews")
        .select(`
          *,
          candidates (
            name,
            email,
            position
          )
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setInterview(data);
      }
      setIsLoading(false);
    };

    if (id) fetchInterview();
  }, [id, supabase]);

  return { interview, isLoading, error };
}
