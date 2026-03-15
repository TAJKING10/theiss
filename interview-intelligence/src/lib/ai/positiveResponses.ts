/**
 * Positive Response Templates for AI Interview System
 * Provides encouraging, supportive feedback based on context and score
 */

import type { PositionLevel } from "./conversationEngine";

// Score-based response categories
export type ScoreCategory = "excellent" | "good" | "adequate" | "needs_improvement";

/**
 * Get score category from numeric score
 */
export function getScoreCategory(score: number): ScoreCategory {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 55) return "adequate";
  return "needs_improvement";
}

// Positive acknowledgment phrases (used before any feedback)
export const positiveAcknowledgments = {
  excellent: [
    "That's an outstanding answer!",
    "Wow, that was really impressive!",
    "Excellent response!",
    "That's exactly what I was hoping to hear!",
    "Brilliant! You really nailed that one.",
    "What a thorough and thoughtful answer!",
    "That was exceptionally well articulated!",
    "I can tell you've really thought this through!",
  ],
  good: [
    "That's a great point!",
    "Very good answer!",
    "Nice work on that one!",
    "I appreciate that thoughtful response.",
    "Good example there!",
    "That's solid reasoning.",
    "Well explained!",
    "I can see your experience coming through.",
  ],
  adequate: [
    "Thank you for that response.",
    "I appreciate you sharing that.",
    "Good effort on that one.",
    "Thanks for your answer.",
    "I see what you mean.",
    "Interesting perspective.",
    "Thank you for that.",
  ],
  needs_improvement: [
    "Thank you for giving that a try.",
    "I appreciate your honest answer.",
    "Thanks for sharing your thoughts.",
    "I understand - these can be challenging questions.",
    "Thank you for your response.",
  ],
};

// Transition phrases to next question
export const transitionPhrases = {
  excellent: [
    "Let's keep this great momentum going.",
    "I'm excited to hear more from you.",
    "Let's continue with another question.",
    "Moving on to our next topic.",
    "Let's explore another area.",
  ],
  good: [
    "Let's move on to the next question.",
    "Moving forward...",
    "Let's continue.",
    "Here's our next topic.",
    "Let's keep going.",
  ],
  adequate: [
    "Let's try another question.",
    "Moving on...",
    "Here's the next one.",
    "Let's continue.",
  ],
  needs_improvement: [
    "Let's move to a different topic.",
    "Here's another question for you.",
    "Let's try this one.",
    "Moving on to the next area.",
  ],
};

// Encouragement based on progress
export const progressEncouragement = {
  start: [
    "Great start! Let's keep going.",
    "Nice beginning! More questions ahead.",
    "Good first answer! Let's continue.",
  ],
  middle: [
    "You're doing well! Keep it up.",
    "Good progress so far!",
    "We're making great headway.",
    "You're hitting your stride!",
  ],
  almostDone: [
    "Almost there! Just a few more.",
    "Great job! Nearly finished.",
    "You're doing fantastic - almost done!",
    "Final stretch - you've got this!",
  ],
  lastQuestion: [
    "This is our final question!",
    "Last one - let's finish strong!",
    "One more and we're done!",
  ],
  complete: [
    "That's all our questions! Excellent work.",
    "We're all done! You did a great job.",
    "Interview complete! Thank you so much.",
    "That's a wrap! Really enjoyed talking with you.",
  ],
};

// Level-specific encouragement styles
export const levelSpecificPhrases: Record<PositionLevel, {
  greeting: string[];
  encouragement: string[];
  closing: string[];
}> = {
  intern: {
    greeting: [
      "Welcome! I'm so glad you're here today.",
      "Hi there! Thanks for joining us - no need to be nervous!",
      "Hello! Excited to chat with you today.",
    ],
    encouragement: [
      "You're doing great - keep going!",
      "Don't worry if you're unsure, just share your thoughts.",
      "There's no wrong answer here - I want to hear your perspective.",
      "Take your time, there's no rush.",
    ],
    closing: [
      "You did wonderfully! Best of luck with everything.",
      "Great job today! We really appreciate you taking the time.",
      "Thank you so much! You should be proud of how you did.",
    ],
  },
  entry: {
    greeting: [
      "Welcome! Thanks for being here today.",
      "Hi! Great to meet you - let's have a good conversation.",
      "Hello! Looking forward to learning about your experiences.",
    ],
    encouragement: [
      "Good job! You're doing well.",
      "Nice example - that's exactly the kind of thing I'm looking for.",
      "Keep sharing those specific examples!",
    ],
    closing: [
      "Great interview! Thanks for your time.",
      "Really enjoyed our conversation. Best of luck!",
      "Thank you for the great responses today!",
    ],
  },
  mid: {
    greeting: [
      "Welcome! Let's dive into your experience.",
      "Hi! Looking forward to our discussion.",
      "Hello! Thanks for taking the time today.",
    ],
    encouragement: [
      "Good insight there.",
      "That's a solid approach.",
      "Nice technical depth.",
    ],
    closing: [
      "Thanks for a great conversation.",
      "Appreciate your detailed responses.",
      "Good interview - thanks for your time.",
    ],
  },
  senior: {
    greeting: [
      "Welcome! Looking forward to a technical deep-dive.",
      "Hi! Let's explore your expertise.",
      "Hello! Excited to discuss your senior-level experience.",
    ],
    encouragement: [
      "Good technical depth.",
      "I see your experience there.",
      "Solid reasoning.",
    ],
    closing: [
      "Great technical discussion. Thanks!",
      "Appreciate the depth of your responses.",
      "Thanks for the insightful conversation.",
    ],
  },
  manager: {
    greeting: [
      "Welcome! Let's discuss your leadership approach.",
      "Hi! Looking forward to exploring your management philosophy.",
      "Hello! Excited to hear about your strategic experience.",
    ],
    encouragement: [
      "Good strategic thinking.",
      "I appreciate that leadership perspective.",
      "Strong people management approach.",
    ],
    closing: [
      "Excellent leadership discussion. Thank you.",
      "Appreciate your strategic insights.",
      "Thanks for sharing your management experience.",
    ],
  },
  hr: {
    greeting: [
      "Welcome! Let's have a great conversation about culture and teamwork.",
      "Hi! I'd love to learn about how you work with others.",
      "Hello! Excited to discuss your people skills and values.",
    ],
    encouragement: [
      "That shows great self-awareness!",
      "I love that collaborative mindset.",
      "Great example of teamwork there.",
    ],
    closing: [
      "Wonderful conversation! You'd be a great culture fit.",
      "Really enjoyed learning about your approach to teamwork.",
      "Thanks for sharing - you have great interpersonal skills!",
    ],
  },
};

/**
 * Get a random item from an array
 */
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate positive feedback response based on score and context
 */
export function generatePositiveFeedback(
  score: number,
  level: PositionLevel,
  questionsAnswered: number,
  totalQuestions: number
): string {
  const category = getScoreCategory(score);
  const acknowledgment = randomItem(positiveAcknowledgments[category]);

  // Determine progress stage
  const progress = questionsAnswered / totalQuestions;
  let progressPhrase = "";

  if (questionsAnswered === totalQuestions) {
    progressPhrase = randomItem(progressEncouragement.complete);
  } else if (questionsAnswered === totalQuestions - 1) {
    progressPhrase = randomItem(progressEncouragement.lastQuestion);
  } else if (progress > 0.75) {
    progressPhrase = randomItem(progressEncouragement.almostDone);
  } else if (progress > 0.25) {
    progressPhrase = randomItem(progressEncouragement.middle);
  } else {
    progressPhrase = randomItem(progressEncouragement.start);
  }

  // Add level-specific encouragement occasionally
  const levelEncouragement =
    Math.random() > 0.7 ? ` ${randomItem(levelSpecificPhrases[level].encouragement)}` : "";

  return `${acknowledgment}${levelEncouragement} ${progressPhrase}`;
}

/**
 * Generate greeting based on position level
 */
export function generateGreeting(
  candidateName: string,
  position: string,
  level: PositionLevel,
  totalQuestions: number
): string {
  const greeting = randomItem(levelSpecificPhrases[level].greeting);

  return `${greeting} I'm Alex, your AI interviewer for today. We'll be discussing the ${position} position, and I have ${totalQuestions} questions prepared. Just relax and be yourself - I'm here to learn about your experiences and skills. Ready to begin?`;
}

/**
 * Generate closing message based on performance
 */
export function generateClosing(
  candidateName: string,
  level: PositionLevel,
  averageScore: number
): string {
  const closing = randomItem(levelSpecificPhrases[level].closing);
  const category = getScoreCategory(averageScore);

  const additionalNote =
    category === "excellent"
      ? "You gave some truly impressive answers today."
      : category === "good"
        ? "You shared some great experiences."
        : "I appreciated your thoughtful responses.";

  return `${closing} ${additionalNote} ${candidateName}, thank you for taking the time to interview with us. We'll be in touch soon with next steps!`;
}

/**
 * Generate constructive feedback that stays positive
 */
export function generateConstructiveFeedback(
  score: number,
  strengths: string[],
  improvements: string[]
): string {
  const category = getScoreCategory(score);

  // Always lead with strengths
  const strengthIntro =
    strengths.length > 0
      ? `Some things that really stood out: ${strengths.slice(0, 2).join(" and ")}. `
      : "";

  // Frame improvements positively
  const improvementIntro =
    category !== "excellent" && improvements.length > 0
      ? `For future interviews, you might consider ${improvements[0].toLowerCase()}.`
      : "";

  return `${strengthIntro}${improvementIntro}`;
}

/**
 * Generate a response when candidate seems stuck or nervous
 */
export function generateEncouragementForStuck(level: PositionLevel): string {
  const responses = {
    intern: [
      "Take your time - there's no pressure here. Even a brief example from school or a project would be great.",
      "Don't worry! Just think of any situation where you faced something similar, even in everyday life.",
      "It's okay to think for a moment. Any experience, big or small, is worth sharing.",
    ],
    entry: [
      "Take your time to think. Any relevant experience, even from non-work settings, counts.",
      "No pressure - consider any situation where you demonstrated this skill.",
      "It's fine to pause and reflect. Share whatever comes to mind.",
    ],
    mid: [
      "Take a moment if you need. Any professional experience that relates would work.",
      "Feel free to think about this. Even a partial answer gives me insight.",
    ],
    senior: [
      "Take your time to consider the best example.",
      "Feel free to think through your experiences.",
    ],
    manager: [
      "Take a moment to reflect on your leadership experiences.",
      "Consider any strategic situation that applies.",
    ],
    hr: [
      "Take your time - I'd love to hear about any team experience that comes to mind.",
      "No rush! Think about situations where you worked closely with others.",
    ],
  };

  return randomItem(responses[level]);
}
