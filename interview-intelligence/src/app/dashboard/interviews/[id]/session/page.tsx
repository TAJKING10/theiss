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
  Info,
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
import { EmotionPanel } from "@/components/interview/EmotionPanel";
import { BodyLanguagePanel } from "@/components/interview/BodyLanguagePanel";
import { useSpeechEmotionDetection } from "@/hooks/useSpeechEmotionDetection";
import { useBodyLanguageDetection } from "@/hooks/useBodyLanguageDetection";
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
  const [answers, setAnswers] = useState<{
    question: string;
    answer: string;
    score: number;
    competencies?: Array<{
      competency: string;
      score: number;
      level: string;
      evidence: string[];
      reasoning: string;
    }>;
    confidence?: number;
  }[]>([]);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [notes, setNotes] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [aiSpeechEnabled, setAiSpeechEnabled] = useState(true);
  const [currentEmotion, setCurrentEmotion] = useState("focused");

  // Real speech emotion detection
  const {
    currentEmotion: speechEmotion,
    emotionHistory,
    dominantEmotion,
    isAnalyzing: isAnalyzingEmotion,
    apiAvailable: emotionApiAvailable,
  } = useSpeechEmotionDetection({
    enabled: stage === "interview",
    sampleInterval: 5000,
  });

  // Body language detection (visual — uses webcam frames)
  // videoRef is declared below; hook accesses it reactively
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    current: bodyLanguage,
    dominant: dominantBodyLanguage,
    averageScore: blAvgScore,
    eyeContactPct,
    goodPosturePct,
    isAnalyzing: isAnalyzingBL,
    apiAvailable: blApiAvailable,
  } = useBodyLanguageDetection({
    videoRef,
    enabled: stage === "interview",
    intervalMs: 3000,
  });

  const [liveTranscript, setLiveTranscript] = useState("");
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const [lastProcessedCommand, setLastProcessedCommand] = useState("");
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState<number | null>(null);

  // Metrics
  const [metrics, setMetrics] = useState({
    confidence: 0,
    engagement: 0,
    clarity: 0,
  });

  // Results
  const [finalScore, setFinalScore] = useState(0);
  const [recommendation, setRecommendation] = useState<"approved" | "rejected" | "review">("review");
  const [feedback, setFeedback] = useState<{
    strengths: string[];
    improvements: string[];
    summary: string;
  } | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<{
    answerScore: number;
    bodyLangScore: number;
    speechEmotionScore: number;
    bodyLangApiUsed: boolean;
    speechApiUsed: boolean;
    dominantBodyLang: string | null;
    dominantEmotion: string | null;
    eyeContactPct: number;
    goodPosturePct: number;
  } | null>(null);

  // Human Override State
  const [humanOverride, setHumanOverride] = useState<{
    enabled: boolean;
    decision: "approved" | "rejected" | "review" | null;
    notes: string;
    overriddenBy: string;
    overriddenAt: Date | null;
  }>({
    enabled: false,
    decision: null,
    notes: "",
    overriddenBy: "",
    overriddenAt: null,
  });
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const emotionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const commandCooldownRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // Safe helper — sets srcObject only if changed, plays only when metadata is ready
  const connectVideoStream = useCallback((element: HTMLVideoElement, stream: MediaStream) => {
    if (element.srcObject === stream) return; // already connected, nothing to do
    element.srcObject = stream;
    element.onloadedmetadata = () => {
      element.play().catch(err => {
        if (err.name !== "AbortError") console.error("Video play error:", err);
      });
    };
  }, []);

  // Callback ref to connect stream when video element mounts
  const setVideoRef = useCallback((element: HTMLVideoElement | null) => {
    (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = element;
    if (element && streamRef.current) {
      connectVideoStream(element, streamRef.current);
    }
  }, [connectVideoStream]);

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

  // Ref to avoid stale closure in speakText - avoids cascade recreations when isListening changes
  const listeningRef = useRef(false);
  useEffect(() => {
    listeningRef.current = isListening;
  }, [isListening]);

  // Memoize the full transcript to prevent unnecessary re-renders
  const fullTranscript = useMemo(() => {
    return (transcript + " " + interimTranscript).trim();
  }, [transcript, interimTranscript]);

  // Helper function - addInsight (defined early to be used by other callbacks)
  const addInsight = useCallback((message: string) => {
    setAiInsights(prev => [message, ...prev].slice(0, 8));
  }, []);

  // Helper function - logAuditEvent (for compliance logging)
  const logAuditEvent = useCallback(async (
    action: string,
    data: Record<string, unknown>
  ) => {
    try {
      await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          interviewId,
          candidateId: interview?.candidate?.id,
          data,
        }),
      });
    } catch (error) {
      console.error("Audit log error:", error);
    }
  }, [interviewId, interview?.candidate?.id]);

  // Helper function - save human override to database
  const saveHumanOverride = useCallback(async (decision: string, notes: string) => {
    try {
      await updateInterview(interviewId, {
        ai_insights: {
          ...(interview?.ai_insights as Record<string, unknown> | null),
          humanOverride: {
            enabled: true,
            decision,
            notes,
            overriddenBy: "Current User",
            overriddenAt: new Date().toISOString(),
          },
        } as import("@/lib/supabase/types").Json,
      });
    } catch (error) {
      console.error("Failed to save human override:", error);
    }
  }, [interviewId, interview?.ai_insights]);

  // Helper function - speakText
  // Uses listeningRef instead of isListening state to avoid stale closures
  // and prevent cascade recreations of all dependent callbacks on every isListening change
  const speakText = useCallback((text: string, onDone?: () => void) => {
    if (aiSpeechEnabled && ttsSupported) {
      // Stop listening while AI speaks - use ref to read current value without dep
      if (listeningRef.current) {
        stopListening();
      }

      speak(text, {
        onEnd: onDone
      });
    } else if (onDone) {
      // If speech disabled, call callback immediately
      setTimeout(onDone, 1000);
    }
  }, [aiSpeechEnabled, ttsSupported, speak, stopListening]);

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

  // Ref-based approach to avoid circular dependencies and TDZ issues with useCallback ordering
  const autoSubmitRef = useRef<() => void>(() => {});
  const commandHandlersRef = useRef({
    repeat: () => {},
    skip: () => {},
    goBack: () => {},
    clarify: () => {},
  });

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

  // SMART VOICE COMMAND DETECTION - uses commandHandlersRef to avoid TDZ issues
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

      // Execute via ref to avoid TDZ issues with callback declaration order
      switch (command) {
        case "repeat": commandHandlersRef.current.repeat(); break;
        case "skip": commandHandlersRef.current.skip(); break;
        case "goBack": commandHandlersRef.current.goBack(); break;
        case "clarify": commandHandlersRef.current.clarify(); break;
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

  // Sync real emotion to legacy currentEmotion state (used in badge overlay)
  useEffect(() => {
    if (emotionApiAvailable && speechEmotion.emotion) {
      setCurrentEmotion(speechEmotion.label);
    }
  }, [speechEmotion, emotionApiAvailable]);

  // Update Live Analysis metrics from real API data
  // confidence  = body language score (how confident the person looks — from port 8001)
  // engagement  = eye contact % running average (are they looking at camera — from port 8001)
  // clarity     = speech emotion model confidence (vocal clarity — from port 8000)
  useEffect(() => {
    if (stage !== "interview") return;
    setMetrics({
      confidence: blApiAvailable && bodyLanguage.body_language_score > 0
        ? bodyLanguage.body_language_score
        : 0,
      engagement: blApiAvailable
        ? eyeContactPct
        : 0,
      clarity: emotionApiAvailable && speechEmotion.confidence > 0
        ? Math.round(speechEmotion.confidence)
        : 0,
    });
  }, [stage, blApiAvailable, bodyLanguage.body_language_score, eyeContactPct, emotionApiAvailable, speechEmotion.confidence]);

  // Reconnect video stream when entering interview stage
  useEffect(() => {
    if (stage === "interview" && streamRef.current && videoRef.current) {
      connectVideoStream(videoRef.current, streamRef.current);
    }
  }, [stage, connectVideoStream]);

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
        connectVideoStream(videoRef.current, stream);
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

  // Evaluate answer function using competency-based rubric
  // Returns rubric evaluation with competency breakdown
  const evaluateAnswer = useCallback(async (question: string, answer: string, questionIdx: number): Promise<{
    score: number;
    competencies?: Array<{
      competency: string;
      score: number;
      level: string;
      evidence: string[];
      reasoning: string;
    }>;
    confidence?: number;
    limitations?: string[];
  }> => {
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluateAnswerWithRubric",
          question,
          answer,
          position: interview?.candidate?.position || "",
          questionIndex: questionIdx,
          totalQuestions: questions.length,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          score: data.overallScore || 70,
          competencies: data.competencies,
          confidence: data.confidence,
          limitations: data.limitations,
        };
      }
    } catch (error) {
      console.error("Evaluation error:", error);
    }
    return { score: 0 }; // OpenAI unavailable — mark as unscored rather than fake score
  }, [interview?.candidate?.position, questions.length]);

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

    const closingMessage = `That concludes all the questions! Thank you so much ${interview?.candidate?.name || ""} for your time today. You did a wonderful job. I'm now preparing your results.`;

    // Always finish after 6 seconds max — don't rely solely on TTS callback
    const fallbackTimer = setTimeout(() => finishInterviewRef.current(), 6000);

    speakText(closingMessage, () => {
      clearTimeout(fallbackTimer);
      finishInterviewRef.current();
    });
  }, [interview?.candidate?.name, stopListening, speakText, isRecording, stopRecording]);

  // Process and evaluate answer using competency-based rubric
  const processAnswer = useCallback(async (questionIndex: number, answer: string) => {
    const evaluation = await evaluateAnswer(questions[questionIndex]?.question || "", answer, questionIndex);

    setAnswers(prev => [...prev, {
      question: questions[questionIndex]?.question || "",
      answer: answer,
      score: evaluation.score,
      competencies: evaluation.competencies,
      confidence: evaluation.confidence,
    }]);

    if (questions[questionIndex]) {
      await answerQuestion(questions[questionIndex].id, answer, {
        score: evaluation.score,
        competencies: evaluation.competencies,
        confidence: evaluation.confidence,
      }, evaluation.score);
    }

    // Log AI evaluation for audit
    logAuditEvent("ai_evaluation", {
      questionIndex,
      question: questions[questionIndex]?.question || "",
      answerLength: answer.length,
      overallScore: evaluation.score,
      competencies: evaluation.competencies?.map(c => ({
        competency: c.competency,
        score: c.score,
        level: c.level,
      })) || [],
      confidence: evaluation.confidence || 0,
      scoringMethodology: "competency-based rubric",
    });

    setIsEvaluating(false);
    addInsight(`Answer scored: ${evaluation.score}%`);

    const feedbackText = evaluation.score >= 80
      ? "Excellent answer! That was really well thought out."
      : evaluation.score >= 60
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
      connectVideoStream(videoRef.current, streamRef.current);
    }

    setStage("interview");
    await updateInterview(interviewId, { status: "in_progress" });

    // Greeting - Using female voice "Sarah"
    const greeting = `Hello ${interview?.candidate?.name || ""}! Welcome to your interview for the ${interview?.candidate?.position || "position"} role. I'm Sarah, your AI interviewer. I'll be asking you ${questions.length} questions today. Take your time with each answer. Your answer will be automatically submitted after a few seconds of silence. You can also say "repeat the question" anytime. Ready? Let's begin!`;

    addInsight("Interview started");

    // Log audit event for interview start
    logAuditEvent("interview_started", {
      candidateName: interview?.candidate?.name || "",
      position: interview?.candidate?.position || "",
      totalQuestions: questions.length,
    });

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

  // Keep commandHandlersRef in sync with the latest callback implementations
  useEffect(() => {
    commandHandlersRef.current = {
      repeat: handleRepeatQuestion,
      skip: handleSkipQuestion,
      goBack: handleGoBack,
      clarify: handleClarifyQuestion,
    };
  });

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
    const evaluation = await evaluateAnswer(
      questions[questionIndex].question,
      currentAnswer,
      questionIndex
    );

    // Save answer with competency data
    const newAnswer = {
      question: questions[questionIndex].question,
      answer: currentAnswer,
      score: evaluation.score,
      competencies: evaluation.competencies,
      confidence: evaluation.confidence,
    };
    setAnswers(prev => [...prev, newAnswer]);

    // Save to database
    await answerQuestion(
      questions[questionIndex].id,
      currentAnswer,
      {
        score: evaluation.score,
        competencies: evaluation.competencies,
        confidence: evaluation.confidence,
      },
      evaluation.score
    );

    setIsEvaluating(false);

    // Generate feedback based on competency score
    const feedbackText = evaluation.score >= 80
      ? "Excellent answer! That was really well thought out."
      : evaluation.score >= 60
        ? "Good answer, thank you for sharing that."
        : "Thank you for your response.";

    addInsight(`Answer scored: ${evaluation.score}%`);

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

  const finishingRef = useRef(false);

  // finishInterview implementation - updates the ref for handleEndInterview
  const finishInterview = useCallback(async () => {
    if (finishingRef.current) return; // prevent double-call
    finishingRef.current = true;

    stopListening();
    stopSpeaking();
    stopCamera();

    // ── Component 1: Answer Quality (60%) ────────────────────────────────────
    const answeredQuestions = answers.filter(a => a.score > 0);
    const answerScore = answeredQuestions.length > 0
      ? Math.round(answeredQuestions.reduce((sum, a) => sum + a.score, 0) / answeredQuestions.length)
      : 70;

    // ── Component 2: Body Language (25%) ─────────────────────────────────────
    // Combine body language class score + eye contact + good posture
    let bodyLangScore = 0;
    if (blApiAvailable && blAvgScore > 0) {
      const eyeBonus    = eyeContactPct  * 0.3;   // up to 30 pts for eye contact
      const postureBonus= goodPosturePct * 0.3;   // up to 30 pts for good posture
      const classBase   = blAvgScore     * 0.4;   // up to 40 pts for body language class
      bodyLangScore = Math.min(100, Math.round(classBase + eyeBonus + postureBonus));
    } else {
      bodyLangScore = answerScore; // fallback: mirror answer score if API offline
    }

    // ── Component 3: Speech Emotion (15%) ─────────────────────────────────────
    // Map dominant emotion to a score
    const emotionScoreMap: Record<string, number> = {
      relaxed: 90, happy: 85, neutral: 70, surprised: 65,
      nervous: 45, stressed: 35, sad: 30, angry: 20,
    };
    let speechEmotionScore = 0;
    if (emotionApiAvailable && dominantEmotion) {
      speechEmotionScore = emotionScoreMap[dominantEmotion.toLowerCase()] ?? 60;
    } else {
      speechEmotionScore = answerScore; // fallback
    }

    // ── Combined Final Score ──────────────────────────────────────────────────
    const final = Math.round(
      answerScore      * 0.60 +
      bodyLangScore    * 0.25 +
      speechEmotionScore * 0.15
    );

    const scoreBreakdown = {
      answerScore,
      bodyLangScore,
      speechEmotionScore,
      bodyLangApiUsed:   blApiAvailable,
      speechApiUsed:     emotionApiAvailable,
      dominantBodyLang:  dominantBodyLanguage,
      dominantEmotion:   dominantEmotion,
      eyeContactPct,
      goodPosturePct,
    };

    const researchTelemetry = {
      confidence: Math.round(metrics.confidence),
      engagement: Math.round(metrics.engagement),
      clarity:    Math.round(metrics.clarity),
    };

    setFinalScore(final);
    setScoreBreakdown(scoreBreakdown);

    // Determine recommendation
    if (final >= 80) {
      setRecommendation("approved");
    } else if (final >= 60) {
      setRecommendation("review");
    } else {
      setRecommendation("rejected");
    }

    // Generate AI feedback — capture in local var so we can persist it
    let feedbackResult = {
      strengths: ["Good communication skills", "Showed enthusiasm"],
      improvements: ["Could provide more specific examples"],
      summary: `Overall score: ${final}% (Answers: ${answerScore}% | Body Language: ${bodyLangScore}% | Speech: ${speechEmotionScore}%). ${final >= 80 ? "Strong candidate." : final >= 60 ? "Promising candidate." : "Needs development."}`,
    };

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
        feedbackResult = {
          strengths: data.strengths || feedbackResult.strengths,
          improvements: data.improvements || feedbackResult.improvements,
          summary: data.summary || feedbackResult.summary,
        };
      }
    } catch (error) {
      // Use default feedbackResult already set above
    }

    setFeedback(feedbackResult);

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

    // Save to database — includes full score breakdown
    await completeInterview(interviewId, final, notes, {
      duration,
      questionsAnswered: answers.length,
      answers: answers,
      feedback: feedbackResult,
      recommendation: final >= 80 ? "approved" : final >= 60 ? "review" : "rejected",
      scoreBreakdown,
      researchTelemetry: {
        ...researchTelemetry,
        speechEmotionAnalysis: {
          dominant: dominantEmotion,
          score: speechEmotionScore,
          history: emotionHistory.slice(0, 10).map(e => ({
            emotion: e.emotion,
            label: e.label,
            confidence: e.confidence,
            timestamp: e.timestamp,
          })),
          apiUsed: emotionApiAvailable,
        },
        bodyLanguageAnalysis: {
          dominant: dominantBodyLanguage,
          score: bodyLangScore,
          averageScore: blAvgScore,
          eyeContactPct,
          goodPosturePct,
          apiUsed: blApiAvailable,
        },
      },
      scoringMethodology: {
        version: "2.0",
        method: "multimodal — answers 60% + body language 25% + speech emotion 15%",
        weights: { answers: 0.60, bodyLanguage: 0.25, speechEmotion: 0.15 },
      }
    });

    // Log interview completion for audit
    logAuditEvent("interview_completed", {
      duration,
      questionsAnswered: answers.length,
      totalQuestions: questions.length,
      aiScore: final,
      aiRecommendation: final >= 80 ? "approved" : final >= 60 ? "review" : "rejected",
    });

    setStage("completed");
  }, [stopListening, stopSpeaking, answers, metrics, interview?.candidate?.name, interview?.candidate?.position, duration, notes, interviewId, questions.length, logAuditEvent]);

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
                  ref={setVideoRef}
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
                      ref={setVideoRef}
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
                      <span className="px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-100 text-xs capitalize flex items-center gap-1">
                        {emotionApiAvailable ? (
                          <>{speechEmotion.emoji} {speechEmotion.label}</>
                        ) : (
                          currentEmotion
                        )}
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

              {/* Speech Emotion Detection */}
              <EmotionPanel
                currentEmotion={speechEmotion}
                emotionHistory={emotionHistory}
                dominantEmotion={dominantEmotion}
                isAnalyzing={isAnalyzingEmotion}
                apiAvailable={emotionApiAvailable}
              />

              {/* Body Language Detection */}
              <BodyLanguagePanel
                current={bodyLanguage}
                dominant={dominantBodyLanguage}
                averageScore={blAvgScore}
                eyeContactPct={eyeContactPct}
                goodPosturePct={goodPosturePct}
                isAnalyzing={isAnalyzingBL}
                apiAvailable={blApiAvailable}
              />

              {/* Live Metrics */}
              <GlassCard className="p-4">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" /> Live Analysis
                </h3>
                {([
                  { key: "confidence", label: "Body Confidence", value: metrics.confidence, source: blApiAvailable ? "body language AI" : "API offline" },
                  { key: "engagement", label: "Eye Contact", value: metrics.engagement, source: blApiAvailable ? "camera analysis" : "API offline" },
                  { key: "clarity", label: "Speech Clarity", value: metrics.clarity, source: emotionApiAvailable ? "speech emotion AI" : "API offline" },
                ] as const).map(({ key, label, value, source }) => (
                  <div key={key} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">{label}</span>
                      {value === 0
                        ? <span className="text-white/25 italic">{source}</span>
                        : <span>{value}%</span>
                      }
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          value === 0 ? "bg-white/10" :
                          value >= 80 ? "bg-green-500" : value >= 60 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.5 }}
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

          {/* Score Breakdown — all three analysis streams */}
          {scoreBreakdown && (
            <div className="mb-6 space-y-3">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest text-center mb-4">
                Score Breakdown
              </h3>

              {/* Answer Quality */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    <div>
                      <p className="font-semibold text-sm">Answer Quality</p>
                      <p className="text-xs text-white/40">AI rubric evaluation of responses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-400">{scoreBreakdown.answerScore}%</span>
                    <p className="text-xs text-white/30">weight: 60%</p>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${scoreBreakdown.answerScore}%` }} />
                </div>
              </div>

              {/* Body Language */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🧍</span>
                    <div>
                      <p className="font-semibold text-sm">Body Language</p>
                      <p className="text-xs text-white/40">
                        {scoreBreakdown.bodyLangApiUsed
                          ? `${scoreBreakdown.dominantBodyLang ?? "Detected"} · Eye contact ${scoreBreakdown.eyeContactPct}% · Good posture ${scoreBreakdown.goodPosturePct}%`
                          : "API offline — used answer score as fallback"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${scoreBreakdown.bodyLangScore >= 70 ? "text-green-400" : scoreBreakdown.bodyLangScore >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                      {scoreBreakdown.bodyLangScore}%
                    </span>
                    <p className="text-xs text-white/30">weight: 25%</p>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${scoreBreakdown.bodyLangScore >= 70 ? "bg-green-500" : scoreBreakdown.bodyLangScore >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${scoreBreakdown.bodyLangScore}%` }}
                  />
                </div>
              </div>

              {/* Speech Emotion */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎙️</span>
                    <div>
                      <p className="font-semibold text-sm">Speech Emotion</p>
                      <p className="text-xs text-white/40">
                        {scoreBreakdown.speechApiUsed
                          ? `Dominant: ${scoreBreakdown.dominantEmotion ?? "Neutral"}`
                          : "API offline — used answer score as fallback"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${scoreBreakdown.speechEmotionScore >= 70 ? "text-green-400" : scoreBreakdown.speechEmotionScore >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                      {scoreBreakdown.speechEmotionScore}%
                    </span>
                    <p className="text-xs text-white/30">weight: 15%</p>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${scoreBreakdown.speechEmotionScore >= 70 ? "bg-green-500" : scoreBreakdown.speechEmotionScore >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${scoreBreakdown.speechEmotionScore}%` }}
                  />
                </div>
              </div>

              {/* Formula */}
              <p className="text-center text-white/30 text-xs pt-1">
                Final = Answers×60% + Body Language×25% + Speech Emotion×15%
              </p>
            </div>
          )}

          {/* Competency Breakdown - The main scoring */}
          {answers.some(a => a.competencies && a.competencies.length > 0) && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Competency Breakdown
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {(() => {
                  // Aggregate competency scores across all answers
                  const competencyAggregates: Record<string, { scores: number[]; level: string }> = {};
                  answers.forEach(a => {
                    if (a.competencies) {
                      a.competencies.forEach(c => {
                        if (!competencyAggregates[c.competency]) {
                          competencyAggregates[c.competency] = { scores: [], level: "" };
                        }
                        competencyAggregates[c.competency].scores.push(c.score);
                      });
                    }
                  });

                  return Object.entries(competencyAggregates).map(([name, data]) => {
                    const avgScore = data.scores.length > 0
                      ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
                      : 0;
                    const level = avgScore >= 85 ? "Expert" : avgScore >= 70 ? "Proficient" : avgScore >= 50 ? "Developing" : "Novice";
                    const color = avgScore >= 85 ? "text-green-400" : avgScore >= 70 ? "text-blue-400" : avgScore >= 50 ? "text-yellow-400" : "text-red-400";
                    const bgColor = avgScore >= 85 ? "bg-green-500/20" : avgScore >= 70 ? "bg-blue-500/20" : avgScore >= 50 ? "bg-yellow-500/20" : "bg-red-500/20";

                    return (
                      <div key={name} className="p-4 rounded-xl bg-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{name}</span>
                          <span className={cn("px-2 py-0.5 rounded text-xs", bgColor, color)}>
                            {level}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full", bgColor)}
                              style={{ width: `${avgScore}%` }}
                            />
                          </div>
                          <span className={cn("text-sm font-bold", color)}>{avgScore}%</span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
              <p className="text-center text-white/30 text-xs mt-3">
                Based on transcript evidence across {answers.length} responses
              </p>
            </div>
          )}


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

        {/* Answers Review with Competency Evidence */}
        {answers.length > 0 && (
          <GlassCard className="p-6 mb-6">
            <h3 className="font-bold mb-4">Question & Answer Review with Evidence</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
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
                  <p className="text-white/70 text-sm mb-3">{a.answer}</p>

                  {/* Competency scores for this answer */}
                  {a.competencies && a.competencies.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="text-xs text-white/40 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Competency Analysis
                        {a.confidence && (
                          <span className="ml-auto text-white/30">
                            AI Confidence: {a.confidence}%
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {a.competencies.map((c, ci) => (
                          <div key={ci} className="text-xs p-2 rounded bg-white/5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white/60">{c.competency}</span>
                              <span className={cn(
                                "font-medium",
                                c.score >= 80 ? "text-green-400" :
                                  c.score >= 60 ? "text-blue-400" :
                                    c.score >= 40 ? "text-yellow-400" :
                                      "text-red-400"
                              )}>
                                {c.score}%
                              </span>
                            </div>
                            {/* Evidence quotes */}
                            {c.evidence && c.evidence.length > 0 && (
                              <div className="mt-1">
                                {c.evidence.slice(0, 1).map((e, ei) => (
                                  <p key={ei} className="text-white/30 italic text-[10px] truncate">
                                    "{e}"
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

        {/* Human Override Section */}
        <GlassCard className="p-6 mb-6 border-2 border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <Hand className="w-5 h-5 text-purple-400" />
              Human Oversight Decision
            </h3>
            <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Required
            </span>
          </div>

          {humanOverride.enabled ? (
            // Show override decision
            <div className="space-y-4">
              <div className={cn(
                "p-4 rounded-xl",
                humanOverride.decision === "approved" ? "bg-green-500/10 border border-green-500/30" :
                  humanOverride.decision === "rejected" ? "bg-red-500/10 border border-red-500/30" :
                    "bg-yellow-500/10 border border-yellow-500/30"
              )}>
                <div className="flex items-center gap-3 mb-2">
                  {humanOverride.decision === "approved" ? (
                    <ThumbsUp className="w-6 h-6 text-green-400" />
                  ) : humanOverride.decision === "rejected" ? (
                    <ThumbsDown className="w-6 h-6 text-red-400" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                  )}
                  <div>
                    <div className="font-semibold">
                      {humanOverride.decision === "approved" ? "Approved by Human Reviewer" :
                        humanOverride.decision === "rejected" ? "Rejected by Human Reviewer" :
                          "Marked for Further Review"}
                    </div>
                    <div className="text-xs text-white/50">
                      {humanOverride.overriddenAt?.toLocaleString()}
                    </div>
                  </div>
                </div>
                {humanOverride.notes && (
                  <p className="text-sm text-white/70 mt-2 p-3 bg-white/5 rounded-lg">
                    "{humanOverride.notes}"
                  </p>
                )}
              </div>

              <Button
                variant="secondary"
                onClick={() => setShowOverrideModal(true)}
                className="w-full"
              >
                Modify Decision
              </Button>
            </div>
          ) : (
            // Prompt for human decision
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-white/70 mb-3">
                  AI has provided a preliminary assessment. As required by organizational policy and EU AI Act guidelines,
                  a human reviewer must make the final hiring decision.
                </p>
                <div className="flex items-center gap-2 text-xs text-purple-300">
                  <Info className="w-4 h-4" />
                  AI recommendations are advisory only. Your decision will be logged for audit purposes.
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    setHumanOverride({
                      enabled: true,
                      decision: "approved",
                      notes: "",
                      overriddenBy: "Current User",
                      overriddenAt: new Date(),
                    });
                    // Save to database
                    saveHumanOverride("approved", "Quick approval");
                    // Log decision for audit
                    logAuditEvent("human_override", {
                      aiRecommendation: recommendation,
                      aiScore: finalScore,
                      humanDecision: "approved",
                      reasoning: "Quick approval",
                      overriddenBy: "Current User",
                    });
                  }}
                  className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors"
                >
                  <ThumbsUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-green-400">Approve</div>
                </button>
                <button
                  onClick={() => setShowOverrideModal(true)}
                  className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors"
                >
                  <AlertCircle className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-yellow-400">Review</div>
                </button>
                <button
                  onClick={() => {
                    setHumanOverride({
                      enabled: true,
                      decision: "rejected",
                      notes: "",
                      overriddenBy: "Current User",
                      overriddenAt: new Date(),
                    });
                    // Save to database
                    saveHumanOverride("rejected", "Quick rejection");
                    // Log decision for audit
                    logAuditEvent("human_override", {
                      aiRecommendation: recommendation,
                      aiScore: finalScore,
                      humanDecision: "rejected",
                      reasoning: "Quick rejection",
                      overriddenBy: "Current User",
                    });
                  }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                >
                  <ThumbsDown className="w-6 h-6 text-red-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-red-400">Reject</div>
                </button>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Override Modal */}
        <AnimatePresence>
          {showOverrideModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowOverrideModal(false)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-md"
              >
                <GlassCard className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Hand className="w-5 h-5 text-purple-400" />
                    Human Override Decision
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-white/50 mb-2 block">Your Decision</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["approved", "review", "rejected"] as const).map((decision) => (
                          <button
                            key={decision}
                            onClick={() => setHumanOverride(prev => ({ ...prev, decision }))}
                            className={cn(
                              "p-3 rounded-lg border transition-colors",
                              humanOverride.decision === decision
                                ? decision === "approved" ? "bg-green-500/20 border-green-500" :
                                  decision === "rejected" ? "bg-red-500/20 border-red-500" :
                                    "bg-yellow-500/20 border-yellow-500"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                            )}
                          >
                            <div className={cn(
                              "text-sm font-medium capitalize",
                              humanOverride.decision === decision
                                ? decision === "approved" ? "text-green-400" :
                                  decision === "rejected" ? "text-red-400" :
                                    "text-yellow-400"
                                : "text-white/70"
                            )}>
                              {decision === "review" ? "Needs Review" : decision}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-white/50 mb-2 block">
                        Reasoning / Notes (Required for audit)
                      </label>
                      <textarea
                        value={humanOverride.notes}
                        onChange={(e) => setHumanOverride(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Explain your decision..."
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white resize-none h-24"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => setShowOverrideModal(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          setHumanOverride(prev => ({
                            ...prev,
                            enabled: true,
                            overriddenBy: "Current User",
                            overriddenAt: new Date(),
                          }));

                          // Save to database
                          saveHumanOverride(humanOverride.decision || "review", humanOverride.notes);

                          // Log human override for audit compliance
                          logAuditEvent("human_override", {
                            aiRecommendation: recommendation,
                            aiScore: finalScore,
                            humanDecision: humanOverride.decision,
                            reasoning: humanOverride.notes,
                            overriddenBy: "Current User",
                          });

                          setShowOverrideModal(false);
                        }}
                        disabled={!humanOverride.decision}
                        className="flex-1"
                      >
                        Confirm Decision
                      </Button>
                    </div>

                    <p className="text-xs text-white/30 text-center">
                      This decision will be logged for compliance and audit purposes.
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Actions - Only shown after human decision is made */}
        {humanOverride.enabled ? (
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard/interviews">
              <Button variant="secondary" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Interviews
              </Button>
            </Link>
            <Link href="/dashboard/reports">
              <Button className="gap-2">
                View Reports
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <AlertCircle className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-yellow-300 text-sm font-medium">
              Human oversight decision required before proceeding
            </p>
            <p className="text-white/50 text-xs mt-1">
              Please make a decision above to complete the evaluation process
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
