export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          position: string;
          status: "pending" | "interviewed" | "review" | "hired" | "rejected";
          score: number | null;
          notes: string | null;
          resume_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          position: string;
          status?: "pending" | "interviewed" | "review" | "hired" | "rejected";
          score?: number | null;
          notes?: string | null;
          resume_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          position?: string;
          status?: "pending" | "interviewed" | "review" | "hired" | "rejected";
          score?: number | null;
          notes?: string | null;
          resume_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      interviews: {
        Row: {
          id: string;
          user_id: string;
          candidate_id: string;
          scheduled_at: string;
          duration_minutes: number | null;
          status: "scheduled" | "in_progress" | "completed" | "cancelled";
          score: number | null;
          notes: string | null;
          ai_insights: Json | null;
          recording_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          candidate_id: string;
          scheduled_at: string;
          duration_minutes?: number | null;
          status?: "scheduled" | "in_progress" | "completed" | "cancelled";
          score?: number | null;
          notes?: string | null;
          ai_insights?: Json | null;
          recording_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          candidate_id?: string;
          scheduled_at?: string;
          duration_minutes?: number | null;
          status?: "scheduled" | "in_progress" | "completed" | "cancelled";
          score?: number | null;
          notes?: string | null;
          ai_insights?: Json | null;
          recording_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          interview_id: string;
          user_id: string;
          rating: number;
          strengths: string[] | null;
          improvements: string[] | null;
          recommendation: "strong_hire" | "hire" | "no_hire" | "strong_no_hire";
          comments: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          user_id: string;
          rating: number;
          strengths?: string[] | null;
          improvements?: string[] | null;
          recommendation: "strong_hire" | "hire" | "no_hire" | "strong_no_hire";
          comments?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          user_id?: string;
          rating?: number;
          strengths?: string[] | null;
          improvements?: string[] | null;
          recommendation?: "strong_hire" | "hire" | "no_hire" | "strong_no_hire";
          comments?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      candidate_status: "pending" | "interviewed" | "review" | "hired" | "rejected";
      interview_status: "scheduled" | "in_progress" | "completed" | "cancelled";
      recommendation_type: "strong_hire" | "hire" | "no_hire" | "strong_no_hire";
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
