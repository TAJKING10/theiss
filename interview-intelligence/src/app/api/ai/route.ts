import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Add OPENAI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case "generateQuestions":
        return await generateInterviewQuestions(params);
      case "evaluateAnswer":
        return await evaluateAnswer(params);
      case "generateInsight":
        return await generateInsight(params);
      case "chat":
        return await chat(params);
      case "generateFeedback":
        return await generateFeedback(params);
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Generate interview questions based on position and context
async function generateInterviewQuestions(params: {
  position: string;
  company?: string;
  experienceLevel?: string;
  skills?: string[];
  questionCount?: number;
  questionTypes?: string[];
}) {
  const {
    position,
    company = "the company",
    experienceLevel = "mid-level",
    skills = [],
    questionCount = 10,
    questionTypes = ["behavioral", "technical", "situational"],
  } = params;

  const skillsText = skills.length > 0 ? `Key skills to assess: ${skills.join(", ")}` : "";
  const typesText = questionTypes.join(", ");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert HR interviewer and talent acquisition specialist. Generate high-quality interview questions that assess candidates fairly and thoroughly. Focus on evidence-based behavioral interviewing techniques.`,
      },
      {
        role: "user",
        content: `Generate ${questionCount} interview questions for a ${experienceLevel} ${position} position at ${company}.

Question types to include: ${typesText}
${skillsText}

For each question, provide:
1. The question text
2. The category (behavioral/technical/situational/leadership/cultural)
3. What skill or trait it assesses
4. 2-3 follow-up questions
5. Key things to look for in a good answer

Format the response as a JSON array with objects containing: question, category, assesses, followUps (array), lookFor (array).`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = completion.choices[0].message.content;
  const questions = JSON.parse(content || "{}");

  return NextResponse.json({ questions: questions.questions || questions });
}

// Evaluate candidate answer
async function evaluateAnswer(params: {
  question: string;
  answer: string;
  position: string;
  context?: string;
}) {
  const { question, answer, position, context = "" } = params;

  if (!answer || answer.trim().length < 10) {
    return NextResponse.json({
      score: 0,
      feedback: "Answer too short to evaluate",
      strengths: [],
      improvements: [],
      keywords: [],
    });
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert interviewer evaluating candidate responses. Provide fair, constructive, and unbiased feedback. Score based on relevance, clarity, depth, and examples provided.`,
      },
      {
        role: "user",
        content: `Evaluate this interview answer for a ${position} position.

Question: "${question}"

Candidate's Answer: "${answer}"

${context ? `Additional context: ${context}` : ""}

Provide evaluation as JSON with:
- score: 0-100 (be fair but discerning)
- feedback: 2-3 sentences of constructive feedback
- strengths: array of 2-3 things done well
- improvements: array of 1-2 areas to improve
- keywords: array of relevant keywords/skills demonstrated
- confidence: your confidence in this evaluation (0-100)`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = completion.choices[0].message.content;
  const evaluation = JSON.parse(content || "{}");

  return NextResponse.json(evaluation);
}

// Generate real-time insight during interview
async function generateInsight(params: {
  detectionData: {
    confidence: number;
    engagement: number;
    clarity: number;
    facialExpression?: string;
    bodyPosture?: string;
    gesturingLevel?: string;
  };
  currentQuestion?: string;
  interviewContext?: string;
}) {
  const { detectionData, currentQuestion, interviewContext } = params;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an AI interview assistant providing real-time insights to interviewers. Keep insights brief, actionable, and helpful. Focus on observable behaviors and constructive suggestions.`,
      },
      {
        role: "user",
        content: `Based on the current interview state, provide a brief insight (1 sentence max).

Current metrics:
- Confidence: ${detectionData.confidence}%
- Engagement: ${detectionData.engagement}%
- Clarity: ${detectionData.clarity}%
${detectionData.facialExpression ? `- Expression: ${detectionData.facialExpression}` : ""}
${detectionData.bodyPosture ? `- Posture: ${detectionData.bodyPosture}` : ""}
${detectionData.gesturingLevel ? `- Gesturing: ${detectionData.gesturingLevel}` : ""}

${currentQuestion ? `Current question: "${currentQuestion}"` : ""}
${interviewContext ? `Context: ${interviewContext}` : ""}

Provide a JSON response with: insight (string, 1 sentence), type (positive/neutral/suggestion), priority (low/medium/high)`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = completion.choices[0].message.content;
  const insight = JSON.parse(content || "{}");

  return NextResponse.json(insight);
}

// General chat for interview assistance
async function chat(params: {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  context?: string;
}) {
  const { messages, context } = params;

  const systemMessage = {
    role: "system" as const,
    content: `You are an AI interview assistant helping interviewers conduct fair, effective interviews. You can:
- Suggest follow-up questions
- Provide insights on candidate responses
- Help evaluate answers
- Offer guidance on interview best practices
- Ensure fair and unbiased evaluation

${context ? `Current interview context: ${context}` : ""}

Keep responses concise and actionable.`,
  };

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [systemMessage, ...messages],
    temperature: 0.7,
    max_tokens: 500,
  });

  return NextResponse.json({
    message: completion.choices[0].message.content,
    usage: completion.usage,
  });
}

// Generate comprehensive interview feedback
async function generateFeedback(params: {
  candidateName: string;
  position: string;
  questions: { question: string; answer: string; score?: number }[];
  detectionMetrics?: {
    avgConfidence: number;
    avgEngagement: number;
    avgClarity: number;
  };
  interviewerNotes?: string;
  duration?: number;
}) {
  const {
    candidateName,
    position,
    questions,
    detectionMetrics,
    interviewerNotes,
    duration,
  } = params;

  const questionsText = questions
    .map((q, i) => `Q${i + 1}: ${q.question}\nA: ${q.answer}\n${q.score ? `Score: ${q.score}` : ""}`)
    .join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert HR analyst generating comprehensive interview feedback. Be fair, objective, and provide actionable insights. Avoid bias based on protected characteristics.`,
      },
      {
        role: "user",
        content: `Generate comprehensive interview feedback for:

Candidate: ${candidateName}
Position: ${position}
${duration ? `Duration: ${Math.round(duration / 60)} minutes` : ""}

Questions and Answers:
${questionsText}

${detectionMetrics ? `
Behavioral Metrics (AI-detected averages):
- Confidence: ${detectionMetrics.avgConfidence}%
- Engagement: ${detectionMetrics.avgEngagement}%
- Clarity: ${detectionMetrics.avgClarity}%
` : ""}

${interviewerNotes ? `Interviewer Notes: ${interviewerNotes}` : ""}

Provide feedback as JSON with:
- overallScore: 0-100
- recommendation: "strong_hire" | "hire" | "no_hire" | "strong_no_hire"
- summary: 3-4 sentence overall assessment
- strengths: array of 3-5 key strengths
- improvements: array of 2-4 areas for improvement
- technicalAssessment: { score: 0-100, notes: string }
- communicationAssessment: { score: 0-100, notes: string }
- cultureFitAssessment: { score: 0-100, notes: string }
- suggestedFollowUp: array of 2-3 follow-up questions or next steps
- biasCheck: confirmation that evaluation was fair and objective`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = completion.choices[0].message.content;
  const feedback = JSON.parse(content || "{}");

  return NextResponse.json(feedback);
}
