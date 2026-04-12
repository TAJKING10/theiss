import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  parseUserIntent,
  getPositionLevel,
  generateSystemPrompt,
  generateCommandResponse,
  createConversationState,
  type ConversationState,
  type UserIntent,
} from "@/lib/ai/conversationEngine";
import {
  generatePositiveFeedback,
  generateGreeting,
  generateClosing,
  generateEncouragementForStuck,
} from "@/lib/ai/positiveResponses";
import {
  CORE_COMPETENCIES,
  generateRubricPrompt,
  parseRubricResponse,
  getLevel,
  calculateOverallScore,
  getRecommendation,
  type CompetencyScore,
  type RubricEvaluation,
} from "@/lib/ai/competencyRubric";

// Initialize OpenAI client lazily — only when a request arrives with a valid key
function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OpenAI API key not configured. Add OPENAI_API_KEY to .env.local");
  return new OpenAI({ apiKey: key });
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Add OPENAI_API_KEY to .env.local", missing: "OPENAI_API_KEY" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case "generateQuestions":
        return await generateInterviewQuestions(params);
      case "evaluateAnswer":
        return await evaluateAnswer(params);
      case "evaluateAnswerWithRubric":
        return await evaluateAnswerWithRubric(params);
      case "generateInsight":
        return await generateInsight(params);
      case "chat":
        return await chat(params);
      case "generateFeedback":
        return await generateFeedback(params);
      case "generateFeedbackWithRubric":
        return await generateFeedbackWithRubric(params);
      case "conductInterview":
        return await conductInterview(params);
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

  const completion = await getOpenAI().chat.completions.create({
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

  const completion = await getOpenAI().chat.completions.create({
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

  const completion = await getOpenAI().chat.completions.create({
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

  const completion = await getOpenAI().chat.completions.create({
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

  const completion = await getOpenAI().chat.completions.create({
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

// Smart conversational interview conductor
async function conductInterview(params: {
  type: "start" | "respond" | "command" | "end";
  candidateName: string;
  position: string;
  currentQuestion?: string;
  currentQuestionIndex?: number;
  totalQuestions?: number;
  candidateResponse?: string;
  conversationHistory?: { role: "ai" | "candidate"; content: string }[];
  questionsAnswered?: number;
  averageScore?: number;
  previousQuestion?: string;
  lastScore?: number;
}) {
  const {
    type,
    candidateName,
    position,
    currentQuestion = "",
    currentQuestionIndex = 0,
    totalQuestions = 10,
    candidateResponse = "",
    conversationHistory = [],
    questionsAnswered = 0,
    averageScore = 0,
    previousQuestion = "",
    lastScore,
  } = params;

  const positionLevel = getPositionLevel(position);

  // Handle different interaction types
  switch (type) {
    case "start": {
      // Generate welcome greeting
      const greeting = generateGreeting(candidateName, position, positionLevel, totalQuestions);
      return NextResponse.json({
        response: greeting,
        intent: "greeting",
        shouldProceed: true,
        nextAction: "ask_question",
      });
    }

    case "command": {
      // Parse user intent for commands
      const intent = parseUserIntent(candidateResponse);

      if (intent === "answer" || intent === "unknown") {
        // Not a command, treat as answer
        return NextResponse.json({
          response: null,
          intent: "answer",
          shouldProceed: true,
          nextAction: "evaluate_answer",
        });
      }

      // Handle command
      const commandResponse = generateCommandResponse(
        intent,
        currentQuestion,
        previousQuestion,
        candidateName
      );

      return NextResponse.json({
        response: commandResponse,
        intent,
        shouldProceed: intent === "skip",
        nextAction: intent === "skip" ? "next_question" : intent === "go_back" ? "previous_question" : "repeat_question",
      });
    }

    case "respond": {
      // Generate contextual AI response after evaluating answer
      const state = createConversationState(candidateName, position, totalQuestions);
      state.currentQuestionIndex = currentQuestionIndex;
      state.questionsAnswered = questionsAnswered;
      state.averageScore = averageScore;

      // Add conversation history to state
      conversationHistory.forEach((msg) => {
        state.messages.push({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(),
        });
      });

      const systemPrompt = generateSystemPrompt(state);

      // Check if candidate seems stuck (very short or unclear response)
      if (candidateResponse.trim().length < 15) {
        const encouragement = generateEncouragementForStuck(positionLevel);
        return NextResponse.json({
          response: encouragement,
          intent: "stuck",
          shouldProceed: false,
          nextAction: "wait_for_answer",
        });
      }

      // Generate positive feedback based on score
      if (lastScore !== undefined) {
        const feedback = generatePositiveFeedback(
          lastScore,
          positionLevel,
          questionsAnswered,
          totalQuestions
        );

        return NextResponse.json({
          response: feedback,
          intent: "feedback",
          shouldProceed: true,
          nextAction: questionsAnswered >= totalQuestions ? "end_interview" : "next_question",
        });
      }

      // Generate contextual response using AI
      const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...conversationHistory.map((msg) => ({
            role: msg.role === "ai" ? ("assistant" as const) : ("user" as const),
            content: msg.content,
          })),
          {
            role: "user",
            content: `The candidate just said: "${candidateResponse}"\n\nRespond naturally and appropriately. If they answered the question, provide brief positive feedback. If they seem confused or are asking for clarification, help them. Keep your response to 1-3 sentences.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const aiResponse = completion.choices[0].message.content || "";

      return NextResponse.json({
        response: aiResponse,
        intent: "contextual_response",
        shouldProceed: true,
        nextAction: "evaluate_or_continue",
      });
    }

    case "end": {
      // Generate closing message
      const closing = generateClosing(candidateName, positionLevel, averageScore);
      return NextResponse.json({
        response: closing,
        intent: "closing",
        shouldProceed: false,
        nextAction: "show_results",
      });
    }

    default:
      return NextResponse.json({
        response: "I'm not sure how to respond to that. Let's continue with the interview.",
        intent: "unknown",
        shouldProceed: true,
        nextAction: "continue",
      });
  }
}

// Generate follow-up question based on answer quality
async function generateFollowUp(params: {
  question: string;
  answer: string;
  score: number;
  position: string;
}) {
  const { question, answer, score, position } = params;
  const positionLevel = getPositionLevel(position);

  // Only generate follow-ups for mid-range scores where more clarity might help
  if (score >= 85 || score < 40) {
    return NextResponse.json({ followUp: null });
  }

  const completion = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a ${positionLevel === "senior" || positionLevel === "manager" ? "technical" : "friendly"} interviewer helping candidates elaborate on their answers. Generate a brief, encouraging follow-up question that helps them provide more detail.`,
      },
      {
        role: "user",
        content: `Original question: "${question}"
Candidate's answer: "${answer}"

Generate a short follow-up question (1 sentence) that encourages them to elaborate on a specific aspect of their answer. Be warm and encouraging.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 100,
  });

  return NextResponse.json({
    followUp: completion.choices[0].message.content,
  });
}

// Evaluate answer using competency-based rubric
// EU AI Act Compliance: This evaluation is based solely on transcript content
async function evaluateAnswerWithRubric(params: {
  question: string;
  answer: string;
  position: string;
  questionIndex: number;
  totalQuestions: number;
}) {
  const { question, answer, position, questionIndex, totalQuestions } = params;

  if (!answer || answer.trim().length < 10) {
    return NextResponse.json({
      overallScore: 0,
      competencies: CORE_COMPETENCIES.map(c => ({
        competency: c.name,
        score: 0,
        level: "novice" as const,
        evidence: [],
        reasoning: "Answer too short to evaluate",
      })),
      strengths: [],
      areasForGrowth: ["Provide a more detailed response"],
      recommendation: "no" as const,
      confidence: 0,
      limitations: ["Insufficient content for meaningful evaluation"],
      feedback: "Please provide a more detailed answer.",
    });
  }

  const rubricPrompt = generateRubricPrompt(question, answer, position);

  const completion = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert interviewer evaluating responses using a structured competency rubric.

IMPORTANT GUIDELINES:
- Evaluate ONLY based on the transcript content provided
- Do NOT make assumptions about qualities not demonstrated
- Cite specific quotes from the answer as evidence
- Be honest about limitations in your evaluation
- Acknowledge uncertainty when appropriate
- Consider the position level when setting expectations

Your evaluation must be fair, unbiased, and evidence-based.`,
      },
      {
        role: "user",
        content: rubricPrompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = completion.choices[0].message.content;
  const evaluation = parseRubricResponse(content || "{}");

  if (!evaluation) {
    // Fallback evaluation
    return NextResponse.json({
      overallScore: 50,
      competencies: CORE_COMPETENCIES.map(c => ({
        competency: c.name,
        score: 50,
        level: "developing" as const,
        evidence: [],
        reasoning: "Unable to parse detailed evaluation",
      })),
      strengths: ["Provided a response"],
      areasForGrowth: ["Could not complete detailed analysis"],
      recommendation: "maybe" as const,
      confidence: 30,
      limitations: ["Evaluation parsing failed"],
      feedback: "Thank you for your response.",
    });
  }

  // Generate encouraging feedback
  const positionLevel = getPositionLevel(position);
  const feedback = generatePositiveFeedback(
    evaluation.overallScore,
    positionLevel,
    questionIndex + 1,
    totalQuestions
  );

  return NextResponse.json({
    ...evaluation,
    feedback,
    questionIndex,
    scoringMethodology: {
      version: "1.0",
      method: "competency-based rubric",
      competenciesEvaluated: CORE_COMPETENCIES.map(c => c.name),
      faceMetricsUsed: false,
    },
  });
}

// Generate comprehensive feedback with rubric-based analysis
async function generateFeedbackWithRubric(params: {
  candidateName: string;
  position: string;
  answers: {
    question: string;
    answer: string;
    competencies?: CompetencyScore[];
    overallScore?: number;
  }[];
  duration?: number;
}) {
  const { candidateName, position, answers, duration } = params;

  // Aggregate competency scores across all answers
  const aggregatedCompetencies: Record<string, { scores: number[]; evidence: string[] }> = {};
  CORE_COMPETENCIES.forEach(c => {
    aggregatedCompetencies[c.name] = { scores: [], evidence: [] };
  });

  answers.forEach(a => {
    if (a.competencies) {
      a.competencies.forEach(c => {
        if (aggregatedCompetencies[c.competency]) {
          aggregatedCompetencies[c.competency].scores.push(c.score);
          aggregatedCompetencies[c.competency].evidence.push(...c.evidence);
        }
      });
    }
  });

  // Calculate final competency scores
  const finalCompetencies: CompetencyScore[] = Object.entries(aggregatedCompetencies).map(
    ([name, data]) => {
      const avgScore = data.scores.length > 0
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : 50;
      return {
        competency: name,
        score: avgScore,
        level: getLevel(avgScore),
        evidence: data.evidence.slice(0, 3), // Top 3 evidence pieces
        reasoning: `Based on ${data.scores.length} evaluated responses`,
      };
    }
  );

  const overallScore = calculateOverallScore(finalCompetencies);
  const recommendation = getRecommendation(overallScore, finalCompetencies);

  // Generate detailed summary using AI
  const completion = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert HR analyst generating comprehensive interview feedback.

IMPORTANT:
- Base all assessments ONLY on the provided transcript evidence
- Be fair, objective, and evidence-based
- Acknowledge limitations and uncertainty
- Do not make assumptions beyond what is demonstrated
- Provide actionable, specific feedback`,
      },
      {
        role: "user",
        content: `Generate a summary for this interview:

Candidate: ${candidateName}
Position: ${position}
Duration: ${duration ? Math.round(duration / 60) + " minutes" : "N/A"}

Competency Scores:
${finalCompetencies.map(c => `- ${c.competency}: ${c.score}% (${c.level})`).join("\n")}

Overall Score: ${overallScore}%
Recommendation: ${recommendation}

Questions & Answers:
${answers.map((a, i) => `Q${i + 1}: ${a.question}\nA: ${a.answer}`).join("\n\n")}

Provide a JSON response with:
- summary: 3-4 sentence assessment
- strengths: top 3-5 demonstrated strengths with evidence
- areasForGrowth: 2-3 areas for improvement with suggestions
- keyInsights: 2-3 notable observations
- limitations: acknowledgment of evaluation limitations`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = completion.choices[0].message.content;
  const aiSummary = JSON.parse(content || "{}");

  return NextResponse.json({
    candidateName,
    position,
    overallScore,
    recommendation,
    competencies: finalCompetencies,
    summary: aiSummary.summary || `Interview completed with overall score of ${overallScore}%.`,
    strengths: aiSummary.strengths || [],
    areasForGrowth: aiSummary.areasForGrowth || [],
    keyInsights: aiSummary.keyInsights || [],
    limitations: aiSummary.limitations || [
      "Evaluation based solely on interview responses",
      "May not capture all candidate capabilities",
      "Human review recommended for final decision",
    ],
    scoringMethodology: {
      version: "1.0",
      method: "competency-based rubric aggregation",
      competenciesEvaluated: CORE_COMPETENCIES.map(c => c.name),
      faceMetricsUsed: false,
      humanOversightRequired: true,
    },
    timestamp: new Date().toISOString(),
  });
}
