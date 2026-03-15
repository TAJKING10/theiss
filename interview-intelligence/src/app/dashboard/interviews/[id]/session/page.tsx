"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  MessageSquare,
  Sparkles,
  Activity,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  Hand,
  User,
  Loader2,
  Copy,
  Check,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Award,
  Volume2,
  VolumeX,
  RotateCcw,
  SkipForward,
  HelpCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { getInterview, updateInterview, completeInterview, saveInterviewTranscript } from "@/lib/actions/interviews";
import { getInterviewQuestions, initializeInterviewQuestions, answerQuestion } from "@/lib/actions/questions";
import { useSpeechRecognition, useTextToSpeech } from "@/hooks/useSpeechRecognition";
import { AIAvatar, AIAvatarCompact, type AIState } from "@/components/interview/AIAvatar";
import { MediaControls, ProgressIndicator } from "@/components/interview/ConversationControls";
import { ParticipantPanel } from "@/components/interview/ParticipantPanel";
import { cn } from "@/lib/utils";
import type { InterviewWithCandidate, InterviewQuestion } from "@/lib/supabase/types";

type Stage = "setup" | "interview" | "completed";
type InterviewPhase = "speaking" | "listening" | "confirming" | "evaluating";

// Voice command patterns - check these against what user says
const COMMAND_PATTERNS = {
  repeat: [
    /repeat/i,
    /say.*again/i,
    /what was the question/i,
    /can you repeat/i,
    /didn't hear/i,
    /didn't catch/i,
    /one more time/i,
    /pardon/i,
    /sorry.*what/i,
  ],
  skip: [
    /skip/i,
    /next question/i,
    /move on/i,
    /pass/i,
    /don't know/i,
  ],
  goBack: [
    /go back/i,
    /previous question/i,
    /last question/i,
  ],
  clarify: [
    /don't understand/i,
    /what do you mean/i,
    /clarify/i,
    /explain/i,
    /confused/i,
  ],
};

function detectVoiceCommand(text: string): "repeat" | "skip" | "goBack" | "clarify" | null {
  const cleanText = text.toLowerCase().trim();

  // Check each command type
  for (const [command, patterns] of Object.entries(COMMAND_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(cleanText)) {
        return command as "repeat" | "skip" | "goBack" | "clarify";
      }
    }
  }

  return null;
}

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  // Stage management
  const [stage, setStage] = useState<Stage>("setup");
  const [interviewPhase, setInterviewPhase] = useState<InterviewPhase>("speaking");
  const [aiState, setAiState] = useState<AIState>("idle");

  // Data
  const [interview, setInterview] = useState<InterviewWithCandidate | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Setup stage
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Interview stage
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answers, setAnswers] = useState<{ question: string; answer: string; score: number }[]>([]);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [notes, setNotes] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [aiSpeechEnabled, setAiSpeechEnabled] = useState(true);
  const [currentEmotion, setCurrentEmotion] = useState("focused");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const [lastProcessedCommand, setLastProcessedCommand] = useState("");
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState<number | null>(null);

  // Metrics
  const [metrics, setMetrics] = useState({
    confidence: 75,
    engagement: 80,
    clarity: 78,
  });

  // Results
  const [finalScore, setFinalScore] = useState(0);
  const [recommendation, setRecommendation] = useState<"approved" | "rejected" | "review">("review");
  const [feedback, setFeedback] = useState<{
    strengths: string[];
    improvements: string[];
    summary: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const emotionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const commandCooldownRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

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

  // Memoize the full transcript to prevent unnecessary re-renders
  const fullTranscript = useMemo(() => {
    return (transcript + " " + interimTranscript).trim();
  }, [transcript, interimTranscript]);

  // Helper function - addInsight (defined early to be used by other callbacks)
  const addInsight = useCallback((message: string) => {
    setAiInsights(prev => [message, ...prev].slice(0, 8));
  }, []);

  // Helper function - speakText
  const speakText = useCallback((text: string, onDone?: () => void) => {
    if (aiSpeechEnabled && ttsSupported) {
      // Stop listening while AI speaks
      if (isListening) {
        stopListening();
      }

      speak(text, {
        onEnd: onDone
      });
    } else if (onDone) {
      // If speech disabled, call callback immediately
      setTimeout(onDone, 1000);
    }
  }, [aiSpeechEnabled, ttsSupported, speak, isListening, stopListening]);

  // Update AI state - simplified to prevent loops
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

      // Reset countdown when new speech detected
      setAutoSubmitCountdown(null);
    }
  }, [fullTranscript]);

  // Ref-based approach to avoid circular dependencies
  const autoSubmitRef = useRef<() => void>(() => {});

  // Auto-submit countdown timer (separate effect for cleaner logic)
  useEffect(() => {
    if (interviewPhase !== "listening" || !currentAnswer || currentAnswer.trim().length < 20) {
      setAutoSubmitCountdown(null);
      return;
    }

    // Check if it's a command - don't auto-submit commands
    const command = detectVoiceCommand(currentAnswer);
    if (command) {
      setAutoSubmitCountdown(null);
      return;
    }

    // Start 3-second countdown
    let countdown = 3;
    setAutoSubmitCountdown(countdown);

    const countdownInterval = setInterval(() => {
      countdown -= 1;
      setAutoSubmitCountdown(countdown);

      if (countdown <= 0) {
        clearInterval(countdownInterval);
        // Check transcript hasn't changed during countdown
        if (lastTranscriptRef.current === currentAnswer) {
          console.log("Auto-submitting after countdown");
          autoSubmitRef.current();
        }
      }
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
      setAutoSubmitCountdown(null);
    };
  }, [currentAnswer, interviewPhase]);

  // SMART VOICE COMMAND DETECTION - Check for commands in real-time
  useEffect(() => {
    if (!fullTranscript || isProcessingCommand || commandCooldownRef.current || interviewPhase !== "listening") {
      return;
    }

    const command = detectVoiceCommand(fullTranscript);

    if (command && fullTranscript !== lastProcessedCommand) {
      // Prevent duplicate processing
      commandCooldownRef.current = true;
      setIsProcessingCommand(true);
      setLastProcessedCommand(fullTranscript);

      console.log("Voice command detected:", command, "from:", fullTranscript);

      // Execute the command
      switch (command) {
        case "repeat":
          handleRepeatQuestion();
          break;
        case "skip":
          handleSkipQuestion();
          break;
        case "goBack":
          handleGoBack();
          break;
        case "clarify":
          handleClarifyQuestion();
          break;
      }

      // Reset cooldown after 3 seconds
      setTimeout(() => {
        commandCooldownRef.current = false;
        setIsProcessingCommand(false);
      }, 3000);
    }
  }, [fullTranscript, isProcessingCommand, interviewPhase, lastProcessedCommand]);

  // Load interview data
  useEffect(() => {
    loadData();
    return () => {
      stopCamera();
      if (emotionIntervalRef.current) clearInterval(emotionIntervalRef.current);
    };
  }, [interviewId]);

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

  // Emotion detection simulation
  useEffect(() => {
    if (stage === "interview" && cameraReady) {
      emotionIntervalRef.current = setInterval(() => {
        const emotions = ["focused", "confident", "thoughtful", "engaged", "neutral"];
        setCurrentEmotion(emotions[Math.floor(Math.random() * emotions.length)]);

        setMetrics(prev => ({
          confidence: Math.min(100, Math.max(50, prev.confidence + (Math.random() - 0.5) * 4)),
          engagement: Math.min(100, Math.max(50, prev.engagement + (Math.random() - 0.5) * 4)),
          clarity: Math.min(100, Math.max(50, prev.clarity + (Math.random() - 0.5) * 4)),
        }));
      }, 3000);
    }
    return () => {
      if (emotionIntervalRef.current) clearInterval(emotionIntervalRef.current);
    };
  }, [stage, cameraReady]);

  const loadData = async () => {
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
  };

  const startCamera = async () => {
    try {
      setSetupError(null);
      console.log("Requesting camera access...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: true
      });

      console.log("Camera stream obtained:", stream);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("Video play error:", e));
        };
      }

      setCameraReady(true);
      setMicReady(true);
      return true;
    } catch (error: any) {
      console.error("Camera error:", error);
      if (error.name === "NotAllowedError") {
        setSetupError("Please allow camera and microphone access to continue.");
      } else if (error.name === "NotFoundError") {
        setSetupError("No camera or microphone found.");
      } else {
        setSetupError("Could not access camera: " + error.message);
      }
      return false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    try {
      recordedChunksRef.current = [];

      // Find supported mime type (cross-browser)
      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4',
      ];
      const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: supportedMimeType
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });

        // Upload to Supabase Storage
        try {
          const formData = new FormData();
          formData.append('recording', blob, `interview-${interviewId}.webm`);

          const response = await fetch(`/api/interviews/${interviewId}/recording`, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            addInsight("Recording uploaded to cloud");
            console.log("Recording uploaded:", data.url);
          } else {
            // Fallback: download locally if upload fails
            console.error("Upload failed, downloading locally");
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `interview-${interviewId}-${new Date().toISOString().split('T')[0]}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addInsight("Recording saved locally");
          }
        } catch (error) {
          console.error("Recording upload error:", error);
          // Fallback: download locally
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `interview-${interviewId}-${new Date().toISOString().split('T')[0]}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          addInsight("Recording saved locally (upload failed)");
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      addInsight("Recording started");
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  }, [interviewId, addInsight]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
      addInsight("Recording saved");
    }
  }, [addInsight]);

  // Evaluate answer function
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

  // Ask question by explicit index - defined early to avoid circular deps
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

  // Ref to store finishInterview function
  const finishInterviewRef = useRef<() => Promise<void>>(() => Promise.resolve());

  // Handle end interview
  const handleEndInterview = useCallback(() => {
    stopListening();
    if (isRecording) {
      stopRecording();
    }

    const closingMessage = `That concludes all the questions! Thank you so much ${interview?.candidate?.name || ""} for your time today. You did a wonderful job. I'm now analyzing your responses and will prepare a detailed report.`;

    speakText(closingMessage, () => {
      setTimeout(() => finishInterviewRef.current(), 2000);
    });
  }, [interview?.candidate?.name, stopListening, speakText, isRecording, stopRecording]);

  // Process and evaluate answer
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
        handleEndInterview();
      }
    });
  }, [questions, evaluateAnswer, speakText, resetTranscript, addInsight, askQuestion, handleEndInterview]);

  // Update auto-submit ref when processAnswer changes
  useEffect(() => {
    autoSubmitRef.current = () => {
      if (interviewPhase !== "listening" || !currentAnswer || currentAnswer.trim().length < 15) {
        return;
      }

      const command = detectVoiceCommand(currentAnswer);
      if (command) return;

      stopListening();
      setInterviewPhase("evaluating");
      setIsEvaluating(true);
      setAutoSubmitCountdown(null);

      processAnswer(currentQuestionIndex, currentAnswer);
    };
  }, [interviewPhase, currentAnswer, currentQuestionIndex, stopListening, processAnswer]);

  const startInterview = async () => {
    setIsStarting(true);

    if (!cameraReady) {
      const started = await startCamera();
      if (!started) {
        setIsStarting(false);
        return;
      }
    }

    // Make sure video is connected
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      await videoRef.current.play().catch(e => console.error("Play error:", e));
    }

    setStage("interview");
    await updateInterview(interviewId, { status: "in_progress" });

    // Greeting - Using female voice "Sarah"
    const greeting = `Hello ${interview?.candidate?.name || ""}! Welcome to your interview for the ${interview?.candidate?.position || "position"} role. I'm Sarah, your AI interviewer. I'll be asking you ${questions.length} questions today. Take your time with each answer. Your answer will be automatically submitted after a few seconds of silence. You can also say "repeat the question" anytime. Ready? Let's begin!`;

    addInsight("Interview started");

    speakText(greeting, () => {
      // After greeting, ask first question (index 0)
      setTimeout(() => askQuestion(0), 1000);
    });

    setIsStarting(false);
  };

  // Wrapper that uses current state index
  const askCurrentQuestion = useCallback(() => {
    askQuestion(currentQuestionIndex);
  }, [currentQuestionIndex, askQuestion]);

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

    // Save as skipped
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
        handleEndInterview();
      }
    });
  }, [currentQuestionIndex, questions, stopListening, resetTranscript, speakText, addInsight, askQuestion, handleEndInterview]);

  const handleGoBack = useCallback(() => {
    if (currentQuestionIndex === 0) {
      speakText("This is the first question, I can't go back further. Let me repeat it for you.");
      handleRepeatQuestion();
      return;
    }

    stopListening();
    resetTranscript();

    // Remove last answer
    setAnswers(prev => prev.slice(0, -1));

    const prevIndex = currentQuestionIndex - 1;
    addInsight("Going back to previous question");

    const goBackMessage = "Sure! Let's go back to the previous question.";

    speakText(goBackMessage, () => {
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

  const handleDoneAnswering = () => {
    // Check if it's actually a command, not a real answer
    const command = detectVoiceCommand(currentAnswer);
    if (command) {
      // It's a command, not an answer
      return;
    }

    stopListening();
    setInterviewPhase("confirming");

    const confirmText = "Thank you for your answer. Would you like to add anything, or shall I move on? Click Confirm when ready.";
    speakText(confirmText);
  };

  const handleEditAnswer = () => {
    setInterviewPhase("listening");
    resetTranscript();
    setLastProcessedCommand("");
    speakText("Please continue with your answer.", () => {
      startListening();
    });
  };

  const handleConfirmAnswer = async () => {
    // Check if answer is actually a command
    const command = detectVoiceCommand(currentAnswer);
    if (command) {
      switch (command) {
        case "repeat": handleRepeatQuestion(); return;
        case "skip": handleSkipQuestion(); return;
        case "goBack": handleGoBack(); return;
        case "clarify": handleClarifyQuestion(); return;
      }
    }

    if (!currentAnswer.trim() || currentAnswer.trim().length < 10) {
      speakText("I didn't catch a complete answer. Could you please respond to the question? You can also say 'repeat' if you'd like to hear it again.", () => {
        setInterviewPhase("listening");
        resetTranscript();
        setLastProcessedCommand("");
        startListening();
      });
      return;
    }

    setInterviewPhase("evaluating");
    setIsEvaluating(true);

    const questionIndex = currentQuestionIndex;
    const score = await evaluateAnswer(
      questions[questionIndex].question,
      currentAnswer
    );

    // Save answer
    const newAnswer = {
      question: questions[questionIndex].question,
      answer: currentAnswer,
      score,
    };
    setAnswers(prev => [...prev, newAnswer]);

    // Save to database
    await answerQuestion(
      questions[questionIndex].id,
      currentAnswer,
      { score },
      score
    );

    setIsEvaluating(false);

    // Generate feedback
    const feedbackText = score >= 80
      ? "Excellent answer! That was really well thought out."
      : score >= 60
        ? "Good answer, thank you for sharing that."
        : "Thank you for your response.";

    addInsight(`Answer scored: ${score}%`);

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
        handleEndInterview();
      }
    });
  };

  // finishInterview implementation - updates the ref for handleEndInterview
  const finishInterview = useCallback(async () => {
    stopListening();
    stopSpeaking();
    stopCamera();

    // Calculate final score
    const answeredQuestions = answers.filter(a => a.score > 0);
    const avgScore = answeredQuestions.length > 0
      ? Math.round(answeredQuestions.reduce((sum, a) => sum + a.score, 0) / answeredQuestions.length)
      : 70;

    const metricsAvg = Math.round((metrics.confidence + metrics.engagement + metrics.clarity) / 3);
    const final = Math.round((avgScore * 0.7) + (metricsAvg * 0.3));

    setFinalScore(final);

    // Determine recommendation
    if (final >= 80) {
      setRecommendation("approved");
    } else if (final >= 60) {
      setRecommendation("review");
    } else {
      setRecommendation("rejected");
    }

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
          detectionMetrics: metrics,
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
    } catch (error) {
      setFeedback({
        strengths: ["Good communication skills", "Showed enthusiasm"],
        improvements: ["Could provide more specific examples"],
        summary: `Overall score: ${final}%. ${final >= 80 ? "Strong candidate." : final >= 60 ? "Promising candidate." : "Needs development."}`,
      });
    }

    // Generate transcript from answers
    const transcript = answers.map((a, i) =>
      `Q${i + 1}: ${a.question}\nA: ${a.answer}\nScore: ${a.score}%`
    ).join("\n\n---\n\n");

    // Save transcript to database
    try {
      await saveInterviewTranscript(interviewId, transcript);
    } catch (error) {
      console.error("Failed to save transcript:", error);
    }

    // Save to database
    await completeInterview(interviewId, final, notes, {
      duration,
      questionsAnswered: answers.length,
      avgConfidence: Math.round(metrics.confidence),
      avgEngagement: Math.round(metrics.engagement),
      avgClarity: Math.round(metrics.clarity),
      answers: answers,
    });

    setStage("completed");
  }, [stopListening, stopSpeaking, answers, metrics, interview?.candidate?.name, interview?.candidate?.position, duration, notes, interviewId]);

  // Update the ref when finishInterview changes
  useEffect(() => {
    finishInterviewRef.current = finishInterview;
  }, [finishInterview]);

  const toggleVideo = () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setVideoEnabled(track.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const track = streamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setAudioEnabled(track.enabled);
      }
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/interview/${interviewId}/join`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <GlassCard className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-4">Interview Not Found</h2>
          <Link href="/dashboard/interviews">
            <Button>Back to Interviews</Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  // SETUP STAGE
  if (stage === "setup") {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8">
        <GradientBackground />

        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href={`/dashboard/interviews/${interviewId}`}>
              <Button variant="ghost" size="icon" className="rounded-full bg-white/5">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{interview.title}</h1>
              <p className="text-white/50">
                {interview.candidate?.name} - {interview.candidate?.position}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Camera Preview */}
            <GlassCard className="p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-400" />
                Camera Setup
              </h2>

              <div className="aspect-video bg-black rounded-xl overflow-hidden relative mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!cameraReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                    <Video className="w-12 h-12 text-white/20 mb-4" />
                    <p className="text-white/50 text-sm mb-4">Camera preview will appear here</p>
                    <Button onClick={startCamera}>
                      Enable Camera & Mic
                    </Button>
                  </div>
                )}
              </div>

              {setupError && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 mb-4">
                  <p className="text-red-200 text-sm">{setupError}</p>
                </div>
              )}

              {cameraReady && (
                <div className="flex justify-center gap-4">
                  <Button
                    variant="secondary"
                    size="icon"
                    className={cn("rounded-full", !videoEnabled && "bg-red-500/20")}
                    onClick={toggleVideo}
                  >
                    {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className={cn("rounded-full", !audioEnabled && "bg-red-500/20")}
                    onClick={toggleAudio}
                  >
                    {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>
                </div>
              )}

              <div className="mt-4 p-3 rounded-lg bg-white/5 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Camera</span>
                  <span className={cameraReady ? "text-green-400" : "text-yellow-400"}>
                    {cameraReady ? "Ready" : "Not enabled"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Microphone</span>
                  <span className={micReady ? "text-green-400" : "text-yellow-400"}>
                    {micReady ? "Ready" : "Not enabled"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Speech Recognition</span>
                  <span className={speechSupported ? "text-green-400" : "text-red-400"}>
                    {speechSupported ? "Supported" : "Not supported"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">AI Voice</span>
                  <span className={ttsSupported ? "text-green-400" : "text-yellow-400"}>
                    {ttsSupported ? "Ready" : "Not available"}
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Interview Info & Actions */}
            <div className="space-y-6">
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold mb-4">Interview Details</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-400" />
                    <span>{interview.candidate?.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    <span>{questions.length} Questions prepared</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-400" />
                    <span>{interview.duration_minutes || 60} minutes</span>
                  </div>
                </div>
              </GlassCard>

              {/* Voice Commands Info */}
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Mic className="w-5 h-5 text-green-400" />
                  Voice Commands
                </h2>
                <div className="space-y-2 text-sm text-white/70">
                  <p>During the interview, you can say:</p>
                  <ul className="space-y-1 ml-4">
                    <li>"<span className="text-green-400">Repeat the question</span>" - hear it again</li>
                    <li>"<span className="text-blue-400">Skip</span>" or "<span className="text-blue-400">Next question</span>" - move on</li>
                    <li>"<span className="text-yellow-400">Go back</span>" - previous question</li>
                    <li>"<span className="text-purple-400">I don't understand</span>" - get clarification</li>
                  </ul>
                </div>
              </GlassCard>

              {/* AI Settings */}
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  AI Settings
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-white/70">AI Voice (Read Questions)</span>
                    <button
                      onClick={() => setAiSpeechEnabled(!aiSpeechEnabled)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors",
                        aiSpeechEnabled ? "bg-blue-500" : "bg-white/20"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full bg-white transition-transform",
                        aiSpeechEnabled ? "translate-x-6" : "translate-x-0.5"
                      )} />
                    </button>
                  </label>
                </div>
              </GlassCard>

              {/* Share Link */}
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-400" />
                  Send to Candidate
                </h2>
                <p className="text-white/50 text-sm mb-4">
                  Copy this link for the candidate to complete the interview independently.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/interview/${interviewId}/join`}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm truncate"
                  />
                  <Button onClick={copyLink} variant="secondary">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </GlassCard>

              {/* Start Button */}
              <Button
                className="w-full h-14 text-lg gap-3"
                onClick={startInterview}
                disabled={isStarting}
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" /> Starting...
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" /> Start Interview Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // INTERVIEW STAGE
  if (stage === "interview") {
    return (
      <div className="min-h-screen bg-black text-white">
        <GradientBackground />

        <div className="p-4 md:p-6 max-w-[1800px] mx-auto">
          {/* Header - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg sm:text-xl font-bold truncate max-w-[200px] sm:max-w-none">{interview.title}</h1>
                <p className="text-white/50 text-sm">{interview.candidate?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <ProgressIndicator
                current={currentQuestionIndex}
                total={questions.length}
                scores={answers.map(a => a.score)}
              />
              <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-500/20 border border-red-500/40">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-100 text-xs sm:text-sm font-bold">LIVE</span>
              </div>
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 font-mono text-sm">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                {formatTime(duration)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column - AI Avatar & Controls (hidden on mobile, shown in video area) */}
            <div className="hidden lg:block lg:col-span-3 space-y-4">
              <GlassCard className="p-6 flex flex-col items-center">
                <AIAvatar state={aiState} name="Sarah" size="lg" />
              </GlassCard>

              {/* Quick Action Buttons */}
              <GlassCard className="p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={handleRepeatQuestion}
                    disabled={interviewPhase === "speaking" || interviewPhase === "evaluating"}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Repeat Question
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={handleGoBack}
                    disabled={currentQuestionIndex === 0 || interviewPhase === "speaking" || interviewPhase === "evaluating"}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous Question
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={handleSkipQuestion}
                    disabled={interviewPhase === "speaking" || interviewPhase === "evaluating"}
                  >
                    <SkipForward className="w-4 h-4" />
                    Skip Question
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={handleClarifyQuestion}
                    disabled={interviewPhase === "speaking" || interviewPhase === "evaluating"}
                  >
                    <HelpCircle className="w-4 h-4" />
                    Clarify Question
                  </Button>
                </div>
              </GlassCard>

              {/* Participant Panel */}
              <ParticipantPanel
                interviewId={interviewId}
                candidateName={interview.candidate?.name || "Candidate"}
              />
            </div>

            {/* Center Column - Video & Question */}
            <div className="lg:col-span-6 space-y-4 order-first lg:order-none">
              {/* Mobile Quick Actions */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="shrink-0 gap-2"
                  onClick={handleRepeatQuestion}
                  disabled={interviewPhase === "speaking" || interviewPhase === "evaluating"}
                >
                  <RotateCcw className="w-4 h-4" />
                  Repeat
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="shrink-0 gap-2"
                  onClick={handleGoBack}
                  disabled={currentQuestionIndex === 0 || interviewPhase === "speaking" || interviewPhase === "evaluating"}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="shrink-0 gap-2"
                  onClick={handleSkipQuestion}
                  disabled={interviewPhase === "speaking" || interviewPhase === "evaluating"}
                >
                  <SkipForward className="w-4 h-4" />
                  Skip
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="shrink-0 gap-2"
                  onClick={handleClarifyQuestion}
                  disabled={interviewPhase === "speaking" || interviewPhase === "evaluating"}
                >
                  <HelpCircle className="w-4 h-4" />
                  Clarify
                </Button>
              </div>

              {/* Dual Video Feed - Both Participants */}
              <GlassCard className="p-0 overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 bg-gray-900">
                  {/* AI Interviewer Panel */}
                  <div className="relative aspect-video bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                    <div className="text-center">
                      <AIAvatar state={aiState} name="Sarah" size="md" />
                    </div>
                    {/* AI Name Badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-3 py-1.5 rounded-full bg-purple-500/30 border border-purple-500/50 text-purple-100 text-sm flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Sarah (AI Interviewer)
                      </span>
                    </div>
                    {/* Speaking indicator */}
                    {isSpeaking && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 rounded-full bg-purple-500/40 text-purple-100 text-xs flex items-center gap-1">
                          <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Candidate Video Panel */}
                  <div className="relative aspect-video bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Recording indicator */}
                    {isRecording && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 rounded-full bg-red-500/40 border border-red-500 text-red-100 text-xs flex items-center gap-1 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-red-500" /> REC
                        </span>
                      </div>
                    )}
                    {/* Detection badges */}
                    <div className="absolute top-3 right-3 flex gap-1">
                      <span className="px-2 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-100 text-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                      </span>
                      <span className="px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-100 text-xs capitalize">
                        {currentEmotion}
                      </span>
                    </div>
                    {/* Candidate Name Badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-3 py-1.5 rounded-full bg-blue-500/30 border border-blue-500/50 text-blue-100 text-sm flex items-center gap-2">
                        <User className="w-3 h-3" />
                        {interview?.candidate?.name || "Candidate"}
                      </span>
                    </div>
                    {/* Listening indicator */}
                    {isListening && (
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-1 rounded-full bg-green-500/40 text-green-100 text-xs flex items-center gap-1">
                          <Mic className="w-3 h-3 animate-pulse" /> Listening
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Bar */}
                <div className="px-4 py-2 bg-black/50 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isListening && (
                        <span className="text-green-400 text-sm flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          Listening... say "repeat" or "skip" anytime
                        </span>
                      )}
                      {isSpeaking && (
                        <span className="text-purple-400 text-sm flex items-center gap-1">
                          <Volume2 className="w-4 h-4 animate-pulse" />
                          Sarah is speaking...
                        </span>
                      )}
                      {isProcessingCommand && (
                        <span className="text-yellow-400 text-sm flex items-center gap-1">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </span>
                      )}
                      {interviewPhase === "evaluating" && (
                        <span className="text-blue-400 text-sm flex items-center gap-1">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Evaluating your answer...
                        </span>
                      )}
                    </div>
                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("rounded-full h-8 w-8", !videoEnabled && "bg-red-500/20")}
                        onClick={toggleVideo}
                      >
                        {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("rounded-full h-8 w-8", !audioEnabled && "bg-red-500/20")}
                        onClick={toggleAudio}
                      >
                        {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("rounded-full h-8 w-8", !aiSpeechEnabled && "bg-yellow-500/20")}
                        onClick={() => setAiSpeechEnabled(!aiSpeechEnabled)}
                      >
                        {aiSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </Button>
                      <div className="w-px h-6 bg-white/20" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("rounded-full h-8 w-8", isRecording && "bg-red-500/30 text-red-400")}
                        onClick={isRecording ? stopRecording : startRecording}
                        title={isRecording ? "Stop Recording" : "Start Recording"}
                      >
                        {isRecording ? <Square className="w-4 h-4" /> : <span className="w-3 h-3 rounded-full bg-red-500" />}
                      </Button>
                      <div className="w-px h-6 bg-white/20" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-8 w-8"
                        onClick={() => setIsPaused(!isPaused)}
                      >
                        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        onClick={handleEndInterview}
                      >
                        <Square className="w-4 h-4 mr-1" /> End
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Question Panel */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </h3>
                  <span className="text-sm text-white/50">
                    {answers.length} answered
                  </span>
                </div>

                {/* Question text */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-lg text-blue-100">{questions[currentQuestionIndex]?.question}</p>
                  </div>
                </div>

                {/* Live Transcription */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-white/50 flex items-center gap-2">
                      Live Transcription
                      {isListening && (
                        <span className="flex items-center gap-1 text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          Recording
                        </span>
                      )}
                    </label>
                    {/* Auto-submit countdown */}
                    {autoSubmitCountdown !== null && autoSubmitCountdown > 0 && (
                      <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-sm flex items-center gap-2"
                      >
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Auto-submitting in {autoSubmitCountdown}s...
                        <button
                          onClick={() => {
                            setAutoSubmitCountdown(null);
                            startListening();
                          }}
                          className="ml-1 px-2 py-0.5 rounded bg-yellow-500/30 hover:bg-yellow-500/50 text-xs"
                        >
                          Cancel
                        </button>
                      </motion.span>
                    )}
                  </div>
                  <div className={cn(
                    "min-h-[120px] p-4 rounded-xl border transition-colors",
                    autoSubmitCountdown !== null && autoSubmitCountdown > 0
                      ? "bg-yellow-500/5 border-yellow-500/30"
                      : "bg-white/5 border-white/10"
                  )}>
                    {liveTranscript ? (
                      <p className="text-white/80">{liveTranscript}</p>
                    ) : (
                      <p className="text-white/30 italic">
                        {isListening ? "Speak now... Say 'repeat' to hear the question again" : "Waiting..."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons based on phase */}
                <div className="flex gap-3 justify-end">
                  {interviewPhase === "listening" && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          if (isListening) {
                            stopListening();
                          } else {
                            startListening();
                          }
                        }}
                      >
                        {isListening ? (
                          <><MicOff className="w-4 h-4 mr-2" /> Pause</>
                        ) : (
                          <><Mic className="w-4 h-4 mr-2" /> Resume</>
                        )}
                      </Button>
                      <Button onClick={handleDoneAnswering} disabled={!currentAnswer.trim() || currentAnswer.trim().length < 10}>
                        Done Answering <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </>
                  )}

                  {interviewPhase === "confirming" && (
                    <>
                      <Button variant="secondary" onClick={handleEditAnswer}>
                        <RotateCcw className="w-4 h-4 mr-2" /> Edit
                      </Button>
                      <Button onClick={handleConfirmAnswer}>
                        <CheckCircle className="w-4 h-4 mr-2" /> Confirm
                      </Button>
                    </>
                  )}

                  {interviewPhase === "evaluating" && (
                    <Button disabled>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Evaluating...
                    </Button>
                  )}

                  {interviewPhase === "speaking" && (
                    <Button disabled variant="secondary">
                      <Volume2 className="w-4 h-4 mr-2 animate-pulse" /> AI Speaking...
                    </Button>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Right Column - Metrics & Insights (hidden on mobile) */}
            <div className="hidden lg:block lg:col-span-3 space-y-4">
              {/* AI Insights */}
              <GlassCard className="p-4">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" /> AI Insights
                </h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {aiInsights.map((insight, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-2 rounded-lg bg-white/5 text-xs text-white/70"
                    >
                      {insight}
                    </motion.div>
                  ))}
                  {aiInsights.length === 0 && (
                    <p className="text-white/30 text-xs">Insights will appear here</p>
                  )}
                </div>
              </GlassCard>

              {/* Live Metrics */}
              <GlassCard className="p-4">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" /> Live Analysis
                </h3>
                {Object.entries(metrics).map(([key, value]) => (
                  <div key={key} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50 capitalize">{key}</span>
                      <span>{Math.round(value)}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          value >= 80 ? "bg-green-500" : value >= 60 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        animate={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </GlassCard>

              {/* Progress */}
              <GlassCard className="p-4">
                <h3 className="font-bold text-sm mb-3">Answers</h3>
                <div className="space-y-2 max-h-[150px] overflow-y-auto">
                  {answers.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-white/5">
                      <span className="text-white/50">Q{i + 1}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        a.score >= 80 ? "bg-green-500/20 text-green-400" :
                          a.score >= 60 ? "bg-yellow-500/20 text-yellow-400" :
                            a.score === 0 ? "bg-gray-500/20 text-gray-400" :
                              "bg-red-500/20 text-red-400"
                      )}>
                        {a.score === 0 ? "Skipped" : `${a.score}%`}
                      </span>
                    </div>
                  ))}
                  {answers.length === 0 && (
                    <p className="text-white/30 text-xs text-center py-2">No answers yet</p>
                  )}
                </div>
              </GlassCard>

              {/* Notes */}
              <GlassCard className="p-4">
                <h3 className="font-bold text-sm mb-3">Notes</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Your observations..."
                  className="w-full h-24 p-2 rounded-lg bg-white/5 border border-white/10 text-sm resize-none focus:outline-none"
                />
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // COMPLETED STAGE
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <GradientBackground />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              "w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center",
              recommendation === "approved" ? "bg-green-500/20 border-2 border-green-500" :
                recommendation === "rejected" ? "bg-red-500/20 border-2 border-red-500" :
                  "bg-yellow-500/20 border-2 border-yellow-500"
            )}
          >
            {recommendation === "approved" ? (
              <ThumbsUp className="w-10 h-10 text-green-400" />
            ) : recommendation === "rejected" ? (
              <ThumbsDown className="w-10 h-10 text-red-400" />
            ) : (
              <Award className="w-10 h-10 text-yellow-400" />
            )}
          </motion.div>

          <h1 className="text-3xl font-bold mb-2">Interview Complete</h1>
          <p className="text-white/50">{interview.candidate?.name} - {interview.candidate?.position}</p>
        </div>

        {/* Score Card */}
        <GlassCard className="p-8 mb-6">
          <div className="text-center mb-8">
            <div className="text-6xl font-bold mb-2">{finalScore}%</div>
            <div className={cn(
              "inline-block px-4 py-2 rounded-full text-lg font-semibold",
              recommendation === "approved" ? "bg-green-500/20 text-green-400" :
                recommendation === "rejected" ? "bg-red-500/20 text-red-400" :
                  "bg-yellow-500/20 text-yellow-400"
            )}>
              {recommendation === "approved" ? "APPROVED" :
                recommendation === "rejected" ? "NOT APPROVED" :
                  "NEEDS REVIEW"}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{Math.round(metrics.confidence)}%</div>
              <div className="text-white/50 text-sm">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{Math.round(metrics.engagement)}%</div>
              <div className="text-white/50 text-sm">Engagement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{Math.round(metrics.clarity)}%</div>
              <div className="text-white/50 text-sm">Clarity</div>
            </div>
          </div>

          {/* Summary */}
          {feedback && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5">
                <h3 className="font-bold text-green-400 mb-2">Strengths</h3>
                <ul className="space-y-1">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle className="w-4 h-4 text-green-400" /> {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white/5">
                <h3 className="font-bold text-yellow-400 mb-2">Areas for Improvement</h3>
                <ul className="space-y-1">
                  {feedback.improvements.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                      <AlertCircle className="w-4 h-4 text-yellow-400" /> {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <h3 className="font-bold text-blue-400 mb-2">AI Summary</h3>
                <p className="text-white/70">{feedback.summary}</p>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Answers Review */}
        {answers.length > 0 && (
          <GlassCard className="p-6 mb-6">
            <h3 className="font-bold mb-4">Question & Answer Review</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {answers.map((a, i) => (
                <div key={i} className="p-4 rounded-lg bg-white/5">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm text-blue-400 font-medium">Q{i + 1}: {a.question}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs shrink-0 ml-2",
                      a.score >= 80 ? "bg-green-500/20 text-green-400" :
                        a.score >= 60 ? "bg-yellow-500/20 text-yellow-400" :
                          a.score === 0 ? "bg-gray-500/20 text-gray-400" :
                            "bg-red-500/20 text-red-400"
                    )}>
                      {a.score === 0 ? "Skipped" : `${a.score}%`}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm">{a.answer}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Interview Stats */}
        <GlassCard className="p-6 mb-6">
          <h3 className="font-bold mb-4">Interview Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold">{formatTime(duration)}</div>
              <div className="text-white/50 text-sm">Duration</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold">{answers.length}</div>
              <div className="text-white/50 text-sm">Answered</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold">
                {answers.filter(a => a.score > 0).length > 0
                  ? Math.round(answers.filter(a => a.score > 0).reduce((s, a) => s + a.score, 0) / answers.filter(a => a.score > 0).length)
                  : 0}%
              </div>
              <div className="text-white/50 text-sm">Avg Score</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold">{questions.length}</div>
              <div className="text-white/50 text-sm">Total Questions</div>
            </div>
          </div>
        </GlassCard>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard/interviews">
            <Button variant="secondary" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <Link href="/dashboard/reports">
            <Button className="gap-2">
              View Reports
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
