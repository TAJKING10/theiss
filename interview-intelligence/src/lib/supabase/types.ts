export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      candidates: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          position: string
          resume_url: string | null
          score: number | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          position: string
          resume_url?: string | null
          score?: number | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string
          resume_url?: string | null
          score?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      feedback: {
        Row: {
          comments: string | null
          created_at: string | null
          id: string
          improvements: string[] | null
          interview_id: string
          rating: number
          recommendation: string
          strengths: string[] | null
          user_id: string
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          id?: string
          improvements?: string[] | null
          interview_id: string
          rating: number
          recommendation: string
          strengths?: string[] | null
          user_id: string
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          id?: string
          improvements?: string[] | null
          interview_id?: string
          rating?: number
          recommendation?: string
          strengths?: string[] | null
          user_id?: string
        }
      }
      interview_questions: {
        Row: {
          ai_evaluation: Json | null
          answer: string | null
          answered_at: string | null
          asked_at: string | null
          created_at: string | null
          id: string
          interview_id: string
          question: string
          score: number | null
        }
        Insert: {
          ai_evaluation?: Json | null
          answer?: string | null
          answered_at?: string | null
          asked_at?: string | null
          created_at?: string | null
          id?: string
          interview_id: string
          question: string
          score?: number | null
        }
        Update: {
          ai_evaluation?: Json | null
          answer?: string | null
          answered_at?: string | null
          asked_at?: string | null
          created_at?: string | null
          id?: string
          interview_id?: string
          question?: string
          score?: number | null
        }
      }
      interviews: {
        Row: {
          ai_insights: Json | null
          candidate_id: string
          created_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          recording_url: string | null
          scheduled_at: string
          score: number | null
          status: string
          title: string
          transcript: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_insights?: Json | null
          candidate_id: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          recording_url?: string | null
          scheduled_at: string
          score?: number | null
          status?: string
          title: string
          transcript?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_insights?: Json | null
          candidate_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          recording_url?: string | null
          scheduled_at?: string
          score?: number | null
          status?: string
          title?: string
          transcript?: string | null
          updated_at?: string | null
          user_id?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]

// Convenience types
export type Candidate = Tables<"candidates">
export type Interview = Tables<"interviews">
export type Feedback = Tables<"feedback">
export type InterviewQuestion = Tables<"interview_questions">
export type Profile = Tables<"profiles">

// Interview with candidate info
export type InterviewWithCandidate = Interview & {
  candidate: Candidate
}
