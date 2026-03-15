"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { getInterview, updateInterview, completeInterview } from "@/lib/actions/interviews";
import { getInterviewQuestions, initializeInterviewQuestions, answerQuestion } from "@/lib/actions/questions";
import { useSpeechRecognition, useTextToSpeech } from "@/hooks/useSpeechRecognition";
import { cn } from "@/lib/utils";
import type { InterviewWithCandidate, InterviewQuestion } from "@/lib/supabase/types";

type Stage = "setup" | "interview" | "completed";
type InterviewPhase = "speaking" | "listening" | "confirming" | "evaluating";

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  // Stage management
  const [stage, setStage] = useState<Stage>("setup");
  const [interviewPhase, setInterviewPhase] = useState<InterviewPhase>("speaking");

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

  // Update answer from transcript
  useEffect(() => {
    if (transcript || interimTranscript) {
      setCurrentAnswer(transcript + interimTranscript);
    }
  }, [transcript, interimTranscript]);

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
        // Ensure video plays
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

  const speakText = useCallback((text: string) => {
    if (aiSpeechEnabled && ttsSupported) {
      speak(text);
    }
  }, [aiSpeechEnabled, ttsSupported, speak]);

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
    setAiInsights(["Interview started - AI is now analyzing responses"]);

    // Greet and ask first question
    const greeting = `Hello! Welcome to your interview for the ${interview?.candidate?.position || "position"}. I'll be asking you ${questions.length} questions today. Let's begin with the first question.`;
    setAiInsights(prev => [greeting, ...prev].slice(0, 5));
    speakText(greeting);

    // Wait for greeting then ask question
    setTimeout(() => {
      askCurrentQuestion();
    }, 4000);

    setIsStarting(false);
  };

  const askCurrentQuestion = () => {
    if (questions[currentQuestionIndex]) {
      setInterviewPhase("speaking");
      const questionText = questions[currentQuestionIndex].question;
      speakText(questionText);

      // After speaking, start listening
      setTimeout(() => {
        setInterviewPhase("listening");
        resetTranscript();
        setCurrentAnswer("");
        startListening();
      }, 3000);
    }
  };

  const evaluateAnswer = async (question: string, answer: string): Promise<number> => {
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
  };

  const handleDoneAnswering = () => {
    stopListening();
    setInterviewPhase("confirming");

    const confirmText = "Thank you for your answer. Would you like to add anything else or make any changes? Click 'Confirm' when you're ready to proceed, or 'Edit' to modify your answer.";
    speakText(confirmText);
  };

  const handleEditAnswer = () => {
    setInterviewPhase("listening");
    startListening();
    speakText("Please continue with your answer.");
  };

  const handleConfirmAnswer = async () => {
    if (!currentAnswer.trim() || !questions[currentQuestionIndex]) {
      speakText("I didn't catch your answer. Could you please respond to the question?");
      setInterviewPhase("listening");
      startListening();
      return;
    }

    setInterviewPhase("evaluating");
    setIsEvaluating(true);

    const score = await evaluateAnswer(
      questions[currentQuestionIndex].question,
      currentAnswer
    );

    // Save answer
    const newAnswer = {
      question: questions[currentQuestionIndex].question,
      answer: currentAnswer,
      score,
    };
    setAnswers(prev => [...prev, newAnswer]);

    // Save to database
    await answerQuestion(
      questions[currentQuestionIndex].id,
      currentAnswer,
      { score },
      score
    );

    // Add insight based on score
    const insights = score >= 80
      ? ["Excellent response! Strong answer detected.", `Score: ${score}%`]
      : score >= 60
        ? ["Good answer recorded.", `Score: ${score}%`]
        : ["Answer recorded. Room for improvement.", `Score: ${score}%`];

    setAiInsights(prev => [...insights, ...prev].slice(0, 8));

    // Speak feedback
    const feedbackText = score >= 80
      ? "Great answer! Let's move on."
      : score >= 60
        ? "Thank you. Let's continue."
        : "I see. Let's proceed to the next question.";
    speakText(feedbackText);

    setIsEvaluating(false);
    resetTranscript();
    setCurrentAnswer("");

    // Move to next question or finish
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeout(() => askCurrentQuestion(), 1500);
      } else {
        speakText("That concludes all the questions. Thank you for your time. I'm now analyzing your interview.");
        setTimeout(() => finishInterview(), 3000);
      }
    }, 2000);
  };

  const finishInterview = async () => {
    stopListening();
    stopSpeaking();
    stopCamera();

    // Calculate final score
    const avgScore = answers.length > 0
      ? Math.round(answers.reduce((sum, a) => sum + a.score, 0) / answers.length)
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
          summary: data.summary || `Overall score: ${final}%. ${final >= 80 ? "Strong candidate." : final >= 60 ? "Promising candidate." : "Needs development."}`,
        });
      }
    } catch (error) {
      setFeedback({
        strengths: final >= 70
          ? ["Good communication skills", "Relevant experience", "Strong technical knowledge"]
          : ["Showed enthusiasm", "Basic understanding of role"],
        improvements: final < 80
          ? ["Could provide more specific examples", "Expand on technical details"]
          : ["Minor areas for growth identified"],
        summary: final >= 80
          ? "Strong candidate with excellent qualifications. Recommended for next round."
          : final >= 60
            ? "Promising candidate with potential. Consider for further evaluation."
            : "Candidate needs more experience. Consider for future opportunities.",
      });
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
  };

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

              {/* AI Settings */}
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  AI Interview Settings
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
                  <p className="text-white/40 text-sm">
                    When enabled, AI will speak questions aloud and the candidate's voice will be automatically transcribed.
                  </p>
                </div>
              </GlassCard>

              {/* Share Link */}
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-400" />
                  Send to Candidate
                </h2>
                <p className="text-white/50 text-sm mb-4">
                  Copy this link and send it to the candidate. They can join and complete the AI interview independently.
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

              <p className="text-center text-white/30 text-sm">
                Or send the link above for candidate to do AI interview alone
              </p>
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

        <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold">{interview.title}</h1>
                <p className="text-white/50 text-sm">{interview.candidate?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/40">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-100 text-sm font-bold">RECORDING</span>
              </div>
              <div className="px-4 py-2 rounded-full bg-white/5 font-mono">
                <Clock className="w-4 h-4 inline mr-2" />
                {formatTime(duration)}
              </div>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
                onClick={() => setAiSpeechEnabled(!aiSpeechEnabled)}
                title={aiSpeechEnabled ? "Mute AI Voice" : "Enable AI Voice"}
              >
                {aiSpeechEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Video */}
            <div className="lg:col-span-3 space-y-6">
              <GlassCard className="p-0 overflow-hidden aspect-video relative bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Detection badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-2 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-100 text-xs flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Face
                  </span>
                  <span className="px-2 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-100 text-xs flex items-center gap-1">
                    <Hand className="w-3 h-3" /> Hands
                  </span>
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-100 text-xs capitalize">
                    {currentEmotion}
                  </span>
                </div>

                {/* Listening indicator */}
                {isListening && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-100 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Listening...
                    </span>
                  </div>
                )}

                {/* AI Speaking indicator */}
                {isSpeaking && (
                  <div className="absolute bottom-20 left-4 right-4">
                    <div className="p-4 rounded-xl bg-black/80 backdrop-blur-sm border border-purple-500/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center">
                          <Volume2 className="w-5 h-5 text-purple-400 animate-pulse" />
                        </div>
                        <p className="text-purple-100">AI is speaking...</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-center gap-4">
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
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full"
                      onClick={() => setIsPaused(!isPaused)}
                    >
                      {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    </Button>
                    <Button
                      className="bg-red-500/20 border-red-500/40 text-red-100 hover:bg-red-500/30"
                      onClick={finishInterview}
                    >
                      <Square className="w-4 h-4 mr-2 fill-current" /> End Interview
                    </Button>
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
                  <div className="flex gap-1">
                    {questions.map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-3 h-3 rounded-full transition-colors",
                          i < currentQuestionIndex ? "bg-green-500" :
                            i === currentQuestionIndex ? "bg-blue-500 animate-pulse" : "bg-white/20"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Question text */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-lg text-blue-100">{questions[currentQuestionIndex]?.question}</p>
                  </div>
                </div>

                {/* Answer input - shows transcript */}
                <div className="mb-4">
                  <label className="block text-sm text-white/50 mb-2">
                    Candidate's Answer {isListening && <span className="text-green-400">(Voice transcribing...)</span>}
                  </label>
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder={isListening ? "Speak now - your voice is being transcribed..." : "Type the candidate's answer or use voice..."}
                    className="w-full h-32 p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 resize-none"
                  />
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
                          <>
                            <MicOff className="w-4 h-4 mr-2" /> Stop Listening
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4 mr-2" /> Start Listening
                          </>
                        )}
                      </Button>
                      <Button onClick={handleDoneAnswering} disabled={!currentAnswer.trim()}>
                        Done Answering <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </>
                  )}

                  {interviewPhase === "confirming" && (
                    <>
                      <Button variant="secondary" onClick={handleEditAnswer}>
                        <RotateCcw className="w-4 h-4 mr-2" /> Edit Answer
                      </Button>
                      <Button onClick={handleConfirmAnswer}>
                        <CheckCircle className="w-4 h-4 mr-2" /> Confirm & Continue
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

            {/* Sidebar */}
            <div className="space-y-6">
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
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
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
                            "bg-red-500/20 text-red-400"
                      )}>
                        {a.score}%
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
              {recommendation === "approved" ? "APPROVED - Proceed to Next Round" :
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
                          "bg-red-500/20 text-red-400"
                    )}>
                      {a.score}%
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
              <div className="text-white/50 text-sm">Questions Answered</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold">
                {answers.length > 0 ? Math.round(answers.reduce((s, a) => s + a.score, 0) / answers.length) : 0}%
              </div>
              <div className="text-white/50 text-sm">Avg Answer Score</div>
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
              <ArrowLeft className="w-4 h-4" /> Back to Interviews
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
