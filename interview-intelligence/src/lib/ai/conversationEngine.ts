/**
 * Conversation Engine for AI Interview System
 * Manages conversation state, intent parsing, and contextual responses
 */

export type PositionLevel = "intern" | "entry" | "mid" | "senior" | "manager" | "hr";
export type UserIntent = "answer" | "repeat" | "go_back" | "skip" | "clarify" | "example" | "greeting" | "unknown";
export type AIState = "idle" | "speaking" | "listening" | "thinking";

export interface ConversationMessage {
  role: "ai" | "candidate";
  content: string;
  timestamp: Date;
  questionIndex?: number;
  score?: number;
}

export interface ConversationState {
  messages: ConversationMessage[];
  currentQuestionIndex: number;
  totalQuestions: number;
  position: string;
  positionLevel: PositionLevel;
  candidateName: string;
  aiState: AIState;
  lastIntent: UserIntent;
  questionsAnswered: number;
  averageScore: number;
}

// Intent patterns for parsing user commands
const intentPatterns: { intent: UserIntent; patterns: RegExp[] }[] = [
  {
    intent: "repeat",
    patterns: [
      /repeat/i,
      /say that again/i,
      /what was the question/i,
      /can you repeat/i,
      /pardon/i,
      /sorry.*didn't (hear|catch)/i,
      /one more time/i,
    ],
  },
  {
    intent: "go_back",
    patterns: [
      /go back/i,
      /previous question/i,
      /last question/i,
      /back to/i,
      /return to/i,
    ],
  },
  {
    intent: "skip",
    patterns: [
      /skip/i,
      /next question/i,
      /move on/i,
      /pass/i,
      /don't know/i,
      /no answer/i,
    ],
  },
  {
    intent: "clarify",
    patterns: [
      /don't understand/i,
      /what do you mean/i,
      /can you clarify/i,
      /not sure what/i,
      /rephrase/i,
      /explain the question/i,
      /confused/i,
    ],
  },
  {
    intent: "example",
    patterns: [
      /give.*example/i,
      /can you give an example/i,
      /for instance/i,
      /what kind of answer/i,
      /how should i answer/i,
      /example answer/i,
    ],
  },
  {
    intent: "greeting",
    patterns: [
      /^hello/i,
      /^hi\b/i,
      /^hey/i,
      /good (morning|afternoon|evening)/i,
    ],
  },
];

/**
 * Parse user intent from their response
 */
export function parseUserIntent(text: string): UserIntent {
  const cleanText = text.trim().toLowerCase();

  // Check if it's a short command-like response
  if (cleanText.length < 50) {
    for (const { intent, patterns } of intentPatterns) {
      for (const pattern of patterns) {
        if (pattern.test(cleanText)) {
          return intent;
        }
      }
    }
  }

  // Default to treating it as an answer if it's substantial
  return cleanText.length > 20 ? "answer" : "unknown";
}

/**
 * Determine position level from job title
 */
export function getPositionLevel(position: string): PositionLevel {
  const lower = position.toLowerCase();

  if (lower.includes("intern") || lower.includes("trainee")) {
    return "intern";
  }
  if (lower.includes("junior") || lower.includes("entry") || lower.includes("associate")) {
    return "entry";
  }
  if (lower.includes("senior") || lower.includes("lead") || lower.includes("principal") || lower.includes("staff")) {
    return "senior";
  }
  if (lower.includes("manager") || lower.includes("director") || lower.includes("head") || lower.includes("vp") || lower.includes("chief")) {
    return "manager";
  }
  if (lower.includes("hr") || lower.includes("recruiter") || lower.includes("talent") || lower.includes("people")) {
    return "hr";
  }

  return "mid";
}

/**
 * Get AI personality configuration based on position level
 */
export function getPersonalityConfig(level: PositionLevel) {
  const configs = {
    intern: {
      tone: "warm and encouraging",
      style: "relaxed and supportive",
      depth: "introductory with guidance",
      pacing: "slower with more explanation",
      encouragement: "high",
      technicalDepth: "basic",
      feedbackStyle: "very gentle with lots of positive reinforcement",
    },
    entry: {
      tone: "friendly and supportive",
      style: "approachable but professional",
      depth: "foundational with some depth",
      pacing: "moderate with explanations",
      encouragement: "high",
      technicalDepth: "fundamental",
      feedbackStyle: "encouraging with constructive guidance",
    },
    mid: {
      tone: "balanced and professional",
      style: "friendly but focused",
      depth: "moderate technical depth",
      pacing: "standard professional pace",
      encouragement: "moderate",
      technicalDepth: "intermediate",
      feedbackStyle: "balanced with specific feedback",
    },
    senior: {
      tone: "direct and peer-like",
      style: "professional and technical",
      depth: "deep technical discussions",
      pacing: "efficient and focused",
      encouragement: "measured",
      technicalDepth: "advanced",
      feedbackStyle: "direct with technical insights",
    },
    manager: {
      tone: "strategic and respectful",
      style: "professional leadership focus",
      depth: "strategic and scenario-based",
      pacing: "thoughtful with space for reflection",
      encouragement: "professional acknowledgment",
      technicalDepth: "strategic overview",
      feedbackStyle: "insightful with leadership perspective",
    },
    hr: {
      tone: "warm and culture-focused",
      style: "conversational and empathetic",
      depth: "soft skills and culture emphasis",
      pacing: "relaxed and conversational",
      encouragement: "high with culture focus",
      technicalDepth: "minimal, soft-skill focused",
      feedbackStyle: "warm with people-focused insights",
    },
  };

  return configs[level];
}

/**
 * Generate AI system prompt based on position and context
 */
export function generateSystemPrompt(state: ConversationState): string {
  const personality = getPersonalityConfig(state.positionLevel);
  const questionsRemaining = state.totalQuestions - state.currentQuestionIndex - 1;

  return `You are "Alex", an adaptive AI interviewer conducting a professional interview.

CANDIDATE CONTEXT:
- Name: ${state.candidateName}
- Position: ${state.position}
- Position Level: ${state.positionLevel}
- Questions Answered: ${state.questionsAnswered}/${state.totalQuestions}
- Current Average Score: ${state.averageScore}%

YOUR PERSONALITY FOR THIS INTERVIEW:
- Tone: ${personality.tone}
- Communication Style: ${personality.style}
- Question Depth: ${personality.depth}
- Pacing: ${personality.pacing}
- Encouragement Level: ${personality.encouragement}
- Technical Depth: ${personality.technicalDepth}
- Feedback Style: ${personality.feedbackStyle}

CORE BEHAVIORS:
1. ALWAYS lead with something positive when giving feedback
2. Use natural, conversational language - avoid being robotic
3. Show genuine interest in the candidate's responses
4. Adapt your complexity based on their answers
5. Be encouraging without being patronizing
6. Handle requests naturally:
   - "repeat" / "say that again" → Rephrase the question slightly
   - "go back" / "previous question" → Return to last question
   - "skip" / "next" → Move forward gracefully
   - "I don't understand" → Explain the question differently
   - "can you give an example" → Provide a sample answer structure

PROGRESS ENCOURAGEMENT:
${questionsRemaining === 0
  ? "This is the final question - make it encouraging!"
  : questionsRemaining <= 2
    ? `Almost done! Only ${questionsRemaining + 1} questions left - keep the energy positive.`
    : `${questionsRemaining + 1} questions remaining.`}

RESPONSE GUIDELINES:
- Keep responses concise but warm (2-4 sentences max for transitions)
- Celebrate good answers with genuine enthusiasm
- For weak answers, acknowledge the effort first, then guide gently
- Use the candidate's name occasionally to personalize
- Maintain a natural conversational flow

Remember: Your goal is to help the candidate perform their best while getting accurate assessment data.`;
}

/**
 * Generate appropriate response for conversation commands
 */
export function generateCommandResponse(
  intent: UserIntent,
  currentQuestion: string,
  previousQuestion?: string,
  candidateName?: string
): string {
  const name = candidateName ? `, ${candidateName}` : "";

  switch (intent) {
    case "repeat":
      return `Of course${name}! Let me rephrase that for you. ${currentQuestion}`;

    case "go_back":
      if (previousQuestion) {
        return `No problem${name}, let's revisit that. ${previousQuestion}`;
      }
      return `We're on the first question${name}, so I can't go back. Let me repeat the current question: ${currentQuestion}`;

    case "skip":
      return `That's perfectly fine${name}. We can move on to the next question.`;

    case "clarify":
      return `Let me explain what I'm looking for${name}. This question is asking about your experience and how you approach situations. Think about a specific example from your past that relates to: ${currentQuestion}`;

    case "example":
      return `Great question${name}! For this type of question, a strong answer would include: 1) A specific situation you faced, 2) The actions you took, 3) The results you achieved. Now, with that structure in mind: ${currentQuestion}`;

    case "greeting":
      return `Hello${name}! Great to meet you. I'm Alex, and I'll be conducting your interview today. Are you ready to get started?`;

    default:
      return `I didn't quite catch that${name}. Could you please share your answer to: ${currentQuestion}`;
  }
}

/**
 * Generate progress encouragement message
 */
export function generateProgressMessage(
  questionsAnswered: number,
  totalQuestions: number,
  lastScore?: number
): string {
  const remaining = totalQuestions - questionsAnswered;
  const progress = Math.round((questionsAnswered / totalQuestions) * 100);

  if (remaining === 0) {
    return "That was the final question! Excellent work completing the interview.";
  }

  if (remaining === 1) {
    return "Just one more question to go! You're doing great.";
  }

  if (remaining <= 3) {
    return `Almost there! Only ${remaining} questions left. You're ${progress}% through.`;
  }

  if (questionsAnswered === 1) {
    return "Good start! Let's keep the momentum going.";
  }

  if (lastScore && lastScore >= 80) {
    return `Excellent answer! You're making great progress - ${remaining} questions remaining.`;
  }

  return `${questionsAnswered} down, ${remaining} to go. Keep it up!`;
}

/**
 * Create initial conversation state
 */
export function createConversationState(
  candidateName: string,
  position: string,
  totalQuestions: number
): ConversationState {
  return {
    messages: [],
    currentQuestionIndex: 0,
    totalQuestions,
    position,
    positionLevel: getPositionLevel(position),
    candidateName,
    aiState: "idle",
    lastIntent: "unknown",
    questionsAnswered: 0,
    averageScore: 0,
  };
}

/**
 * Add message to conversation history
 */
export function addMessage(
  state: ConversationState,
  role: "ai" | "candidate",
  content: string,
  questionIndex?: number,
  score?: number
): ConversationState {
  const newMessage: ConversationMessage = {
    role,
    content,
    timestamp: new Date(),
    questionIndex,
    score,
  };

  const newMessages = [...state.messages, newMessage];

  // Update average score if this is a scored candidate response
  let newAverageScore = state.averageScore;
  let newQuestionsAnswered = state.questionsAnswered;

  if (role === "candidate" && score !== undefined) {
    newQuestionsAnswered++;
    const totalScore = state.averageScore * state.questionsAnswered + score;
    newAverageScore = Math.round(totalScore / newQuestionsAnswered);
  }

  return {
    ...state,
    messages: newMessages,
    questionsAnswered: newQuestionsAnswered,
    averageScore: newAverageScore,
  };
}

/**
 * Get conversation history formatted for AI context
 */
export function getConversationContext(state: ConversationState, maxMessages: number = 10): string {
  const recentMessages = state.messages.slice(-maxMessages);

  if (recentMessages.length === 0) {
    return "This is the start of the interview.";
  }

  return recentMessages
    .map((msg) => `${msg.role === "ai" ? "Alex" : state.candidateName}: ${msg.content}`)
    .join("\n");
}
