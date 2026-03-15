"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables, InsertTables, UpdateTables } from "@/lib/supabase/types";

type Candidate = Tables<"candidates">;
type CandidateInsert = InsertTables<"candidates">;
type CandidateUpdate = UpdateTables<"candidates">;

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchCandidates = useCallback(async () => {
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
      .from("candidates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setCandidates(data || []);
    }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const addCandidate = async (candidate: Omit<CandidateInsert, "user_id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("candidates")
      .insert({ ...candidate, user_id: user.id })
      .select()
      .single();

    if (error) throw new Error(error.message);
    setCandidates((prev) => [data, ...prev]);
    return data;
  };

  const updateCandidate = async (id: string, updates: CandidateUpdate) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Ensure user owns this candidate
    const { data, error } = await supabase
      .from("candidates")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? data : c))
    );
    return data;
  };

  const deleteCandidate = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Ensure user owns this candidate
    const { error } = await supabase
      .from("candidates")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    candidates,
    isLoading,
    error,
    refetch: fetchCandidates,
    addCandidate,
    updateCandidate,
    deleteCandidate,
  };
}

export function useCandidate(id: string) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchCandidate = async () => {
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
        .from("candidates")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setCandidate(data);
      }
      setIsLoading(false);
    };

    if (id) fetchCandidate();
  }, [id, supabase]);

  return { candidate, isLoading, error };
}
