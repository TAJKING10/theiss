"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { InsertTables, UpdateTables, InterviewQuestion } from "@/lib/supabase/types";

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

// Generate default questions based on position
export function generateDefaultQuestions(position: string): string[] {
  const baseQuestions = [
    "Tell me about yourself and your background.",
    "Why are you interested in this position?",
    "What are your greatest strengths?",
    "Where do you see yourself in 5 years?",
    "Do you have any questions for us?",
  ];

  const technicalQuestions: Record<string, string[]> = {
    developer: [
      "Describe a challenging technical problem you solved recently.",
      "How do you approach debugging complex issues?",
      "What's your experience with version control systems?",
      "How do you stay updated with new technologies?",
      "Describe your ideal development workflow.",
    ],
    designer: [
      "Walk me through your design process.",
      "How do you handle feedback on your designs?",
      "What tools do you use for design work?",
      "How do you balance aesthetics with usability?",
      "Describe a project where you improved user experience.",
    ],
    manager: [
      "How do you motivate your team?",
      "Describe your leadership style.",
      "How do you handle conflicts within your team?",
      "What metrics do you use to measure team success?",
      "How do you prioritize competing deadlines?",
    ],
    default: [
      "Describe a time you worked effectively under pressure.",
      "How do you handle disagreements with colleagues?",
      "What motivates you in your work?",
      "How do you prioritize your tasks?",
      "Describe a project you're most proud of.",
    ],
  };

  const positionLower = position.toLowerCase();
  let roleQuestions = technicalQuestions.default;

  if (positionLower.includes("developer") || positionLower.includes("engineer") || positionLower.includes("programmer")) {
    roleQuestions = technicalQuestions.developer;
  } else if (positionLower.includes("designer") || positionLower.includes("ux") || positionLower.includes("ui")) {
    roleQuestions = technicalQuestions.designer;
  } else if (positionLower.includes("manager") || positionLower.includes("lead") || positionLower.includes("director")) {
    roleQuestions = technicalQuestions.manager;
  }

  return [...baseQuestions.slice(0, 2), ...roleQuestions, ...baseQuestions.slice(2)];
}

export async function initializeInterviewQuestions(
  interviewId: string,
  position: string
): Promise<InterviewQuestion[]> {
  const questions = generateDefaultQuestions(position);
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
