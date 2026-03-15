"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { InsertTables, UpdateTables, InterviewQuestion } from "@/lib/supabase/types";
import { getBalancedQuestionSet, type InterviewQuestionData } from "@/lib/data/interviewQuestions";

export async function getInterviewQuestions(interviewId: string): Promise<InterviewQuestion[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("interview_questions")
    .select("*")
    .eq("interview_id", interviewId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function createQuestion(
  question: Omit<InsertTables<"interview_questions">, "id" | "created_at">
): Promise<InterviewQuestion> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("interview_questions")
    .insert(question)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/interviews/${question.interview_id}`);
  return data;
}

export async function updateQuestion(
  id: string,
  updates: UpdateTables<"interview_questions">
): Promise<InterviewQuestion> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("interview_questions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function answerQuestion(
  id: string,
  answer: string,
  aiEvaluation?: Record<string, unknown>,
  score?: number
): Promise<InterviewQuestion> {
  return updateQuestion(id, {
    answer,
    answered_at: new Date().toISOString(),
    ai_evaluation: aiEvaluation,
    score,
  });
}

export async function deleteQuestion(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("interview_questions")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

// Generate questions using the comprehensive question database
export async function generateDefaultQuestions(position: string, count: number = 10): Promise<string[]> {
  // Get balanced questions from the database
  const questionData = getBalancedQuestionSet(position, count);
  return questionData.map((q: InterviewQuestionData) => q.question);
}

// Get questions with full metadata (for advanced features)
export async function generateQuestionsWithMetadata(position: string, count: number = 10): Promise<InterviewQuestionData[]> {
  return getBalancedQuestionSet(position, count);
}

export async function initializeInterviewQuestions(
  interviewId: string,
  position: string,
  useAI: boolean = false
): Promise<InterviewQuestion[]> {
  let questions: string[];

  // Try to use AI-generated questions if enabled and API key is available
  if (useAI) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateQuestions",
          position,
          questionCount: 10,
          questionTypes: ["behavioral", "technical", "situational", "cultural"],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.questions && Array.isArray(data.questions)) {
          questions = data.questions.map((q: any) => q.question || q);
        } else {
          throw new Error("Invalid AI response");
        }
      } else {
        throw new Error("AI API request failed");
      }
    } catch (error) {
      console.log("AI question generation unavailable, using local database");
      questions = await generateDefaultQuestions(position, 10);
    }
  } else {
    // Use local comprehensive question database
    questions = await generateDefaultQuestions(position, 10);
  }

  const createdQuestions: InterviewQuestion[] = [];

  for (const question of questions) {
    const created = await createQuestion({
      interview_id: interviewId,
      question,
    });
    createdQuestions.push(created);
  }

  return createdQuestions;
}

// Generate follow-up questions based on candidate's answer
export async function generateFollowUpQuestion(
  originalQuestion: string,
  candidateAnswer: string,
  position: string
): Promise<string | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "chat",
        messages: [
          {
            role: "user",
            content: `Based on this interview exchange for a ${position} position:

Question: "${originalQuestion}"
Answer: "${candidateAnswer}"

Generate ONE concise follow-up question to dig deeper into their response. Just provide the question, nothing else.`,
          },
        ],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.message || null;
    }
  } catch (error) {
    console.error("Failed to generate follow-up question:", error);
  }

  return null;
}
