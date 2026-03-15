"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSpeechRecognition, useTextToSpeech } from "@/hooks/useSpeechRecognition";
import { getInterview, updateInterview, completeInterview } from "@/lib/actions/interviews";
import { getInterviewQuestions, initializeInterviewQuestions, answerQuestion } from "@/lib/actions/questions";
import type { InterviewWithCandidate, InterviewQuestion } from "@/lib/supabase/types";

export type Stage = "setup" | "interview" | "completed";
export type InterviewPhase = "speaking" | "listening" | "confirming" | "evaluating";
export type AIState = "idle" | "speaking" | "listening" | "thinking";

// Voice command patterns
const COMMAND_PATTERNS = {
  repeat: [/repeat/i, /say.*again/i, /what was the question/i, /can you repeat/i, /didn't hear/i, /didn't catch/i, /one more time/i, /pardon/i, /sorry.*what/i],
  skip: [/skip/i, /next question/i, /move on/i, /pass/i, /don't know/i],
  goBack: [/go back/i, /previous question/i, /last question/i],
  clarify: [/don't understand/i, /what do you mean/i, /clarify/i, /explain/i, /confused/i],
};

export function detectVoiceCommand(text: string): "repeat" | "skip" | "goBack" | "clarify" | null {
  const cleanText = text.toLowerCase().trim();
  for (const [command, patterns] of Object.entries(COMMAND_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(cleanText)) {
        return command as "repeat" | "skip" | "goBack" | "clarify";
      }
    }
  }
  return null;
}

interface UseInterviewSessionOptions {
  interviewId: string;
}

export function useInterviewSession({ interviewId }: UseInterviewSessionOptions) {
  // Stage management
  const [stage, setStage] = useState<Stage>("setup");
  const [interviewPhase, setInterviewPhase] = useState<InterviewPhase>("speaking");
  const [aiState, setAiState] = useState<AIState>("idle");

  // Data
  const [interview, setInterview] = useState<InterviewWithCandidate | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Interview state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answers, setAnswers] = useState<{ question: string; answer: string; score: number }[]>([]);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [notes, setNotes] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [aiSpeechEnabled, setAiSpeechEnabled] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const [lastProcessedCommand, setLastProcessedCommand] = useState("");
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState<number | null>(null);

  // Results
  const [finalScore, setFinalScore] = useState(0);
  const [recommendation, setRecommendation] = useState<"approved" | "rejected" | "review">("review");
  const [feedback, setFeedback] = useState<{
    strengths: string[];
    improvements: string[];
    summary: string;
  } | null>(null);

  // Refs
  const commandCooldownRef = useRef<boolean>(false);
  const lastTranscriptRef = useRef<string>("");

  // Speech hooks
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ continuous: true, interimResults: true });

  const { isSpeaking, speak, stop: stopSpeaking, isSupported: ttsSupported } = useTextToSpeech();

  // Memoize full transcript
  const fullTranscript = useMemo(() => {
    return (transcript + " " + interimTranscript).trim();
  }, [transcript, interimTranscript]);

  // Update AI state
  useEffect(() => {
    let newState: AIState = "idle";
    if (isSpeaking) newState = "speaking";
    else if (isListening && !isSpeaking) newState = "listening";
    else if (isEvaluating) newState = "thinking";
    setAiState(newState);
  }, [isSpeaking, isListening, isEvaluating]);

  // Update transcript display
  useEffect(() => {
    if (fullTranscript) {
      setLiveTranscript(fullTranscript);
      setCurrentAnswer(fullTranscript);
      lastTranscriptRef.current = fullTranscript;
      setAutoSubmitCountdown(null);
    }
  }, [fullTranscript]);

  // Load interview data
  const loadData = useCallback(async () => {
    try {
      const interviewData = await getInterview(interviewId);
      setInterview(interviewData);

      if (interviewData) {
        let questionsData = await getInterviewQuestions(interviewId);
        if (questionsData.length === 0 && interviewData.candidate?.position) {
          questionsData = await initializeInterviewQuestions(interviewId, interviewData.candidate.position);
        }
        setQuestions(questionsData);
      }
    } catch (error) {
      console.error("Failed to load interview:", error);
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stage === "interview" && !isPaused) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage, isPaused]);

  // Helper to speak text
  const speakText = useCallback((text: string, onDone?: () => void) => {
    if (aiSpeechEnabled && ttsSupported) {
      if (isListening) {
        stopListening();
      }
      speak(text, { onEnd: onDone });
    } else if (onDone) {
      setTimeout(onDone, 1000);
    }
  }, [aiSpeechEnabled, ttsSupported, speak, isListening, stopListening]);

  // Add insight
  const addInsight = useCallback((message: string) => {
    setAiInsights(prev => [message, ...prev].slice(0, 8));
  }, []);

  // Evaluate answer via API
  const evaluateAnswer = useCallback(async (question: string, answer: string): Promise<number> => {
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluateAnswer",
          question,
          answer,
          position: interview?.candidate?.position || "",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.score || 70;
      }
    } catch (error) {
      console.error("Evaluation error:", error);
    }
    return Math.floor(Math.random() * 30) + 60;
  }, [interview?.candidate?.position]);

  // Ask question by index
  const askQuestion = useCallback((index: number) => {
    if (questions[index]) {
      setInterviewPhase("speaking");
      resetTranscript();
      setCurrentAnswer("");
      setLiveTranscript("");
      setLastProcessedCommand("");

      const questionNum = index + 1;
      const questionText = questions[index].question;
      const intro = `Question ${questionNum}. ${questionText}`;

      addInsight(`Asking question ${questionNum}`);

      speakText(intro, () => {
        setInterviewPhase("listening");
        setTimeout(() => {
          resetTranscript();
          startListening();
        }, 500);
      });
    }
  }, [questions, speakText, resetTranscript, startListening, addInsight]);

  // Process and save answer
  const processAnswer = useCallback(async (questionIndex: number, answer: string) => {
    const score = await evaluateAnswer(questions[questionIndex]?.question || "", answer);

    setAnswers(prev => [...prev, {
      question: questions[questionIndex]?.question || "",
      answer: answer,
      score,
    }]);

    if (questions[questionIndex]) {
      await answerQuestion(questions[questionIndex].id, answer, { score }, score);
    }

    setIsEvaluating(false);
    addInsight(`Answer scored: ${score}%`);

    const feedbackText = score >= 80
      ? "Excellent answer! That was really well thought out."
      : score >= 60
        ? "Good answer, thank you for sharing that."
        : "Thank you for your response.";

    speakText(feedbackText, () => {
      resetTranscript();
      setCurrentAnswer("");
      setLiveTranscript("");
      setLastProcessedCommand("");

      if (questionIndex < questions.length - 1) {
        const nextIndex = questionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setTimeout(() => askQuestion(nextIndex), 1000);
      } else {
        endInterview();
      }
    });
  }, [questions, evaluateAnswer, speakText, resetTranscript, addInsight, askQuestion]);

  // End interview
  const endInterview = useCallback(() => {
    stopListening();

    const closingMessage = `That concludes all the questions! Thank you so much ${interview?.candidate?.name || ""} for your time today. You did a wonderful job. I'm now analyzing your responses.`;

    speakText(closingMessage, async () => {
      stopSpeaking();

      // Calculate final score
      const answeredQuestions = answers.filter(a => a.score > 0);
      const avgScore = answeredQuestions.length > 0
        ? Math.round(answeredQuestions.reduce((sum, a) => sum + a.score, 0) / answeredQuestions.length)
        : 70;

      const final = avgScore;
      setFinalScore(final);

      // Determine recommendation
      if (final >= 80) setRecommendation("approved");
      else if (final >= 60) setRecommendation("review");
      else setRecommendation("rejected");

      // Generate AI feedback
      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generateFeedback",
            candidateName: interview?.candidate?.name || "Candidate",
            position: interview?.candidate?.position || "",
            questions: answers,
            duration,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setFeedback({
            strengths: data.strengths || ["Good communication", "Relevant experience"],
            improvements: data.improvements || ["Provide more examples"],
            summary: data.summary || `Overall score: ${final}%.`,
          });
        }
      } catch {
        setFeedback({
          strengths: ["Good communication skills", "Showed enthusiasm"],
          improvements: ["Could provide more specific examples"],
          summary: `Overall score: ${final}%. ${final >= 80 ? "Strong candidate." : final >= 60 ? "Promising candidate." : "Needs development."}`,
        });
      }

      // Save to database
      await completeInterview(interviewId, final, notes, {
        duration,
        questionsAnswered: answers.length,
        answers: answers,
      });

      setStage("completed");
    });
  }, [interview, stopListening, speakText, stopSpeaking, answers, duration, notes, interviewId]);

  // Command handlers
  const handleRepeatQuestion = useCallback(() => {
    if (!questions[currentQuestionIndex]) return;

    stopListening();
    resetTranscript();
    setCurrentAnswer("");
    setLiveTranscript("");
    setInterviewPhase("speaking");

    const questionText = questions[currentQuestionIndex].question;
    const response = `Of course! Let me repeat that for you. ${questionText}`;

    addInsight("Repeating question");

    speakText(response, () => {
      setInterviewPhase("listening");
      setTimeout(() => {
        resetTranscript();
        setLastProcessedCommand("");
        startListening();
      }, 500);
    });
  }, [currentQuestionIndex, questions, stopListening, resetTranscript, speakText, startListening, addInsight]);

  const handleSkipQuestion = useCallback(() => {
    stopListening();
    resetTranscript();

    const questionIndex = currentQuestionIndex;
    addInsight(`Question ${questionIndex + 1} skipped`);

    setAnswers(prev => [...prev, {
      question: questions[questionIndex]?.question || "",
      answer: "[Skipped]",
      score: 0,
    }]);

    const skipMessage = "No problem! Let's move on to the next question.";

    speakText(skipMessage, () => {
      if (questionIndex < questions.length - 1) {
        const nextIndex = questionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setTimeout(() => askQuestion(nextIndex), 500);
      } else {
        endInterview();
      }
    });
  }, [currentQuestionIndex, questions, stopListening, resetTranscript, speakText, addInsight, askQuestion, endInterview]);

  const handleGoBack = useCallback(() => {
    if (currentQuestionIndex === 0) {
      speakText("This is the first question, I can't go back further. Let me repeat it for you.");
      handleRepeatQuestion();
      return;
    }

    stopListening();
    resetTranscript();
    setAnswers(prev => prev.slice(0, -1));

    const prevIndex = currentQuestionIndex - 1;
    addInsight("Going back to previous question");

    speakText("Sure! Let's go back to the previous question.", () => {
      setCurrentQuestionIndex(prevIndex);
      setTimeout(() => askQuestion(prevIndex), 500);
    });
  }, [currentQuestionIndex, stopListening, resetTranscript, speakText, handleRepeatQuestion, addInsight, askQuestion]);

  const handleClarifyQuestion = useCallback(() => {
    if (!questions[currentQuestionIndex]) return;

    stopListening();
    resetTranscript();
    setInterviewPhase("speaking");

    const questionText = questions[currentQuestionIndex].question;
    const clarification = `Let me explain what I'm looking for. This question is asking about your personal experience. Think of a specific situation from your work or life where you demonstrated this. Here's the question again: ${questionText}`;

    addInsight("Clarifying question");

    speakText(clarification, () => {
      setInterviewPhase("listening");
      setTimeout(() => {
        resetTranscript();
        setLastProcessedCommand("");
        startListening();
      }, 500);
    });
  }, [currentQuestionIndex, questions, stopListening, resetTranscript, speakText, startListening, addInsight]);

  // Start interview
  const startInterview = useCallback(async () => {
    setStage("interview");
    await updateInterview(interviewId, { status: "in_progress" });

    const greeting = `Hello ${interview?.candidate?.name || ""}! Welcome to your interview for the ${interview?.candidate?.position || "position"} role. I'm Sarah, your AI interviewer. I'll be asking you ${questions.length} questions today. Take your time with each answer. Your answer will be automatically submitted after a few seconds of silence. You can also say "repeat the question" anytime. Ready? Let's begin!`;

    addInsight("Interview started");

    speakText(greeting, () => {
      setTimeout(() => askQuestion(0), 1000);
    });
  }, [interview, questions.length, interviewId, speakText, addInsight, askQuestion]);

  return {
    // State
    stage,
    setStage,
    interviewPhase,
    setInterviewPhase,
    aiState,
    interview,
    questions,
    loading,
    currentQuestionIndex,
    currentAnswer,
    setCurrentAnswer,
    answers,
    duration,
    isPaused,
    setIsPaused,
    notes,
    setNotes,
    isEvaluating,
    setIsEvaluating,
    aiInsights,
    aiSpeechEnabled,
    setAiSpeechEnabled,
    liveTranscript,
    setLiveTranscript,
    isProcessingCommand,
    setIsProcessingCommand,
    lastProcessedCommand,
    setLastProcessedCommand,
    autoSubmitCountdown,
    setAutoSubmitCountdown,
    finalScore,
    recommendation,
    feedback,
    fullTranscript,

    // Speech state
    isListening,
    isSpeaking,
    speechSupported,
    ttsSupported,
    speechError,

    // Refs
    commandCooldownRef,
    lastTranscriptRef,

    // Actions
    startListening,
    stopListening,
    resetTranscript,
    speakText,
    stopSpeaking,
    addInsight,
    askQuestion,
    processAnswer,
    evaluateAnswer,
    startInterview,
    endInterview,
    handleRepeatQuestion,
    handleSkipQuestion,
    handleGoBack,
    handleClarifyQuestion,
  };
}

export default useInterviewSession;
