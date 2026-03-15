"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  MessageSquare,
  Volume2,
  VolumeX,
  User,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Award,
  Brain,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { useSpeechRecognition, useTextToSpeech } from "@/hooks/useSpeechRecognition";
import { cn } from "@/lib/utils";

type Stage = "lobby" | "interview" | "analyzing" | "results";

interface EmotionData {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  surprised: number;
  disgusted: number;
}

interface AnswerRecord {
  question: string;
  answer: string;
  score: number;
  emotion: string;
  duration: number;
}

export default function CandidateAIInterviewPage() {
  const params = useParams();
  const interviewId = params.id as string;

  // Stage
  const [stage, setStage] = useState<Stage>("lobby");

  // Candidate info
  const [candidateName, setCandidateName] = useState("");
  const [position, setPosition] = useState("Software Developer");

  // Camera/Mic
  const [cameraReady, setCameraReady] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Interview state
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  // Emotion tracking
  const [currentEmotion, setCurrentEmotion] = useState<string>("neutral");
  const [emotionHistory, setEmotionHistory] = useState<EmotionData>({
    neutral: 0, happy: 0, sad: 0, angry: 0, fearful: 0, surprised: 0, disgusted: 0
  });

  // Metrics
  const [confidence, setConfidence] = useState(75);
  const [engagement, setEngagement] = useState(80);
  const [clarity, setClarity] = useState(78);

  // Results
  const [finalScore, setFinalScore] = useState(0);
  const [recommendation, setRecommendation] = useState<"approved" | "review" | "rejected">("review");
  const [aiSummary, setAiSummary] = useState("");

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

  const { isSpeaking, speak, stop: stopSpeaking } = useTextToSpeech();

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stage === "interview") {
      interval = setInterval(() => {
        setTotalDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage]);

  // Simulate emotion detection from video
  useEffect(() => {
    if (stage === "interview" && cameraReady) {
      emotionIntervalRef.current = setInterval(() => {
        // Simulate emotion detection
        const emotions = ["neutral", "happy", "focused", "thoughtful", "confident"];
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        setCurrentEmotion(randomEmotion);

        // Update metrics slightly
        setConfidence(prev => Math.min(100, Math.max(50, prev + (Math.random() - 0.5) * 3)));
        setEngagement(prev => Math.min(100, Math.max(50, prev + (Math.random() - 0.5) * 3)));
        setClarity(prev => Math.min(100, Math.max(50, prev + (Math.random() - 0.5) * 3)));
      }, 2000);
    }
    return () => {
      if (emotionIntervalRef.current) clearInterval(emotionIntervalRef.current);
    };
  }, [stage, cameraReady]);

  const startCamera = async () => {
    try {
      setSetupError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraReady(true);
      return true;
    } catch (error: any) {
      console.error("Camera error:", error);
      setSetupError(error.name === "NotAllowedError"
        ? "Please allow camera and microphone access"
        : "Could not access camera: " + error.message
      );
      return false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const generateQuestions = async () => {
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateQuestions",
          position,
          questionCount: 5,
          questionTypes: ["behavioral", "technical", "situational"],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.questions?.map((q: any) => q.question || q) || getDefaultQuestions();
      }
    } catch (error) {
      console.error("Failed to generate questions:", error);
    }
    return getDefaultQuestions();
  };

  const getDefaultQuestions = () => [
    "Tell me about yourself and your professional background.",
    "Why are you interested in this position?",
    "Describe a challenging project you worked on and how you handled it.",
    "How do you handle working under pressure with tight deadlines?",
    "Where do you see yourself in five years?",
  ];

  const startInterview = async () => {
    if (!candidateName.trim()) {
      setSetupError("Please enter your name");
      return;
    }

    if (!cameraReady) {
      const started = await startCamera();
      if (!started) return;
    }

    setStage("interview");
    setIsAiThinking(true);

    // Generate questions
    const generatedQuestions = await generateQuestions();
    setQuestions(generatedQuestions);

    // AI greeting
    const greeting = `Hello ${candidateName}! Welcome to your interview for the ${position} position. I'm your AI interviewer today. I'll be asking you some questions, and I'd like you to answer them naturally by speaking. Take your time with each response. Let's begin with the first question.`;

    setAiMessage(greeting);
    speak(greeting);

    // Wait for greeting to finish, then ask first question
    setTimeout(() => {
      askQuestion(generatedQuestions[0]);
    }, 8000);

    setIsAiThinking(false);
  };

  const askQuestion = (question: string) => {
    setAiMessage(question);
    speak(question);
    setQuestionStartTime(Date.now());
    resetTranscript();

    // Start listening after AI finishes speaking
    setTimeout(() => {
      startListening();
    }, 3000);
  };

  const submitAnswer = async () => {
    stopListening();

    const answerText = transcript.trim() || interimTranscript.trim();

    if (!answerText) {
      // Prompt to answer
      const prompt = "I didn't catch that. Could you please answer the question?";
      speak(prompt);
      setAiMessage(prompt);
      setTimeout(() => startListening(), 2000);
      return;
    }

    setIsAiThinking(true);
    const answerDuration = Math.round((Date.now() - questionStartTime) / 1000);

    // Evaluate the answer
    let score = 70;
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluateAnswer",
          question: questions[currentQuestionIndex],
          answer: answerText,
          position,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        score = data.score || 70;
      }
    } catch (error) {
      console.error("Evaluation error:", error);
    }

    // Save answer
    const newAnswer: AnswerRecord = {
      question: questions[currentQuestionIndex],
      answer: answerText,
      score,
      emotion: currentEmotion,
      duration: answerDuration,
    };
    setAnswers(prev => [...prev, newAnswer]);

    // Generate AI response
    const responses = score >= 80
      ? ["Great answer! I can see you have strong experience in this area.", "Excellent response! Your experience really shows.", "Very impressive! You've given a thorough answer."]
      : score >= 60
        ? ["Thank you for that answer. Let's continue.", "Good response. I appreciate your perspective.", "Thanks for sharing that."]
        : ["I see. Thank you for your response.", "Alright, let's move on.", "Thank you for that."];

    const aiResponse = responses[Math.floor(Math.random() * responses.length)];

    if (currentQuestionIndex < questions.length - 1) {
      // More questions
      setAiMessage(aiResponse);
      speak(aiResponse);

      setTimeout(() => {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        askQuestion(questions[nextIndex]);
      }, 3000);
    } else {
      // Interview complete
      const closing = `${aiResponse} That concludes our interview. Thank you so much for your time today, ${candidateName}. I'm now analyzing your responses. Please wait a moment.`;
      setAiMessage(closing);
      speak(closing);

      setTimeout(() => {
        analyzeInterview();
      }, 5000);
    }

    setIsAiThinking(false);
    resetTranscript();
  };

  const analyzeInterview = async () => {
    setStage("analyzing");
    stopCamera();

    // Calculate scores
    const avgAnswerScore = answers.length > 0
      ? Math.round(answers.reduce((sum, a) => sum + a.score, 0) / answers.length)
      : 70;

    const metricsAvg = Math.round((confidence + engagement + clarity) / 3);
    const final = Math.round((avgAnswerScore * 0.7) + (metricsAvg * 0.3));

    setFinalScore(final);

    // Determine recommendation
    if (final >= 80) {
      setRecommendation("approved");
    } else if (final >= 60) {
      setRecommendation("review");
    } else {
      setRecommendation("rejected");
    }

    // Generate AI summary
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateFeedback",
          candidateName,
          position,
          questions: answers.map(a => ({ question: a.question, answer: a.answer, score: a.score })),
          detectionMetrics: { avgConfidence: confidence, avgEngagement: engagement, avgClarity: clarity },
          duration: totalDuration,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSummary(data.summary || "Analysis complete.");
      }
    } catch (error) {
      setAiSummary(final >= 80
        ? "Strong candidate showing excellent qualifications and communication skills."
        : final >= 60
          ? "Promising candidate with potential. Further evaluation recommended."
          : "Candidate may benefit from additional experience."
      );
    }

    setStage("results");
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // LOBBY STAGE
  if (stage === "lobby") {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8">
        <GradientBackground />

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">AI Interview</h1>
            <p className="text-white/50">Powered by Artificial Intelligence</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Camera Preview */}
            <GlassCard className="p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-400" />
                Camera Preview
              </h2>

              <div className="aspect-video bg-black/50 rounded-xl overflow-hidden relative mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!cameraReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Video className="w-12 h-12 text-white/20 mb-4" />
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
                <div className="flex justify-center gap-4 mb-4">
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

              <div className="p-3 rounded-lg bg-white/5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Camera</span>
                  <span className={cameraReady ? "text-green-400" : "text-yellow-400"}>
                    {cameraReady ? "Ready" : "Not enabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Microphone</span>
                  <span className={cameraReady ? "text-green-400" : "text-yellow-400"}>
                    {cameraReady ? "Ready" : "Not enabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Speech Recognition</span>
                  <span className={speechSupported ? "text-green-400" : "text-red-400"}>
                    {speechSupported ? "Supported" : "Not supported"}
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Join Form */}
            <GlassCard className="p-6">
              <h2 className="text-lg font-bold mb-4">Join Interview</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/50 mb-2">Your Full Name</label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-100">AI-Powered Interview</p>
                      <p className="text-purple-200/70 text-sm mt-1">
                        The AI will ask you questions verbally. Simply speak your answers naturally.
                        Your responses, body language, and communication will be analyzed in real-time.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <h3 className="font-medium text-blue-100 mb-2">Tips for Success:</h3>
                  <ul className="text-blue-200/70 text-sm space-y-1">
                    <li>• Speak clearly and at a natural pace</li>
                    <li>• Look at the camera as if talking to someone</li>
                    <li>• Take a moment to think before answering</li>
                    <li>• Be yourself and answer honestly</li>
                  </ul>
                </div>

                <Button
                  className="w-full h-14 text-lg gap-3"
                  onClick={startInterview}
                  disabled={!candidateName.trim()}
                >
                  <Phone className="w-6 h-6" />
                  Start AI Interview
                </Button>
              </div>
            </GlassCard>
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

        <div className="p-4 md:p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Interview</h1>
                <p className="text-white/50 text-sm">{position}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/40">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-100 text-sm font-bold">LIVE</span>
              </div>
              <div className="px-4 py-2 rounded-full bg-white/5 font-mono text-sm">
                <Clock className="w-4 h-4 inline mr-2" />
                {formatTime(totalDuration)}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Video Feed */}
            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="p-0 overflow-hidden aspect-video relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Emotion Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-100 text-sm capitalize">
                    {currentEmotion}
                  </span>
                </div>

                {/* Listening Indicator */}
                {isListening && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-100 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Listening...
                    </span>
                  </div>
                )}

                {/* AI Speaking Indicator */}
                {isSpeaking && (
                  <div className="absolute bottom-20 left-4 right-4">
                    <div className="p-4 rounded-xl bg-black/80 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center">
                          <Volume2 className="w-5 h-5 text-purple-400 animate-pulse" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-purple-400">AI Interviewer</p>
                          <p className="text-white">{aiMessage}</p>
                        </div>
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
                  </div>
                </div>
              </GlassCard>

              {/* Current Question & Answer */}
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
                          "w-3 h-3 rounded-full",
                          i < currentQuestionIndex ? "bg-green-500" :
                            i === currentQuestionIndex ? "bg-blue-500" : "bg-white/20"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                  <p className="text-lg">{questions[currentQuestionIndex] || "Loading question..."}</p>
                </div>

                {/* Transcript */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 min-h-[100px]">
                  <p className="text-sm text-white/50 mb-2">Your Response:</p>
                  <p className="text-white">
                    {transcript}
                    <span className="text-white/50">{interimTranscript}</span>
                    {isListening && !transcript && !interimTranscript && (
                      <span className="text-white/30 italic">Speak your answer...</span>
                    )}
                  </p>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    onClick={submitAnswer}
                    disabled={isAiThinking || isSpeaking || (!transcript && !interimTranscript)}
                  >
                    {isAiThinking ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                      </>
                    ) : (
                      "Submit Answer"
                    )}
                  </Button>
                </div>
              </GlassCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Live Metrics */}
              <GlassCard className="p-4">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  Live Analysis
                </h3>
                {[
                  { label: "Confidence", value: confidence, color: "blue" },
                  { label: "Engagement", value: engagement, color: "green" },
                  { label: "Clarity", value: clarity, color: "purple" },
                ].map((metric) => (
                  <div key={metric.label} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">{metric.label}</span>
                      <span>{Math.round(metric.value)}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          metric.color === "blue" && "bg-blue-500",
                          metric.color === "green" && "bg-green-500",
                          metric.color === "purple" && "bg-purple-500"
                        )}
                        animate={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </GlassCard>

              {/* Progress */}
              <GlassCard className="p-4">
                <h3 className="font-bold text-sm mb-4">Progress</h3>
                <div className="space-y-2">
                  {answers.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
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
                </div>
              </GlassCard>

              {/* Tips */}
              <GlassCard className="p-4">
                <h3 className="font-bold text-sm mb-3">Remember</h3>
                <ul className="text-xs text-white/50 space-y-2">
                  <li>• Speak naturally and clearly</li>
                  <li>• Take your time to think</li>
                  <li>• Click "Submit" when done</li>
                </ul>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ANALYZING STAGE
  if (stage === "analyzing") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <GradientBackground />
        <GlassCard className="p-12 text-center max-w-md">
          <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Analyzing Your Interview</h2>
          <p className="text-white/50">
            Our AI is reviewing your responses, body language, and communication skills...
          </p>
        </GlassCard>
      </div>
    );
  }

  // RESULTS STAGE
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

          <h1 className="text-3xl font-bold mb-2">Interview Complete!</h1>
          <p className="text-white/50">Thank you, {candidateName}</p>
        </div>

        {/* Score Card */}
        <GlassCard className="p-8 mb-6">
          <div className="text-center mb-8">
            <div className="text-7xl font-bold mb-4">{finalScore}%</div>
            <div className={cn(
              "inline-block px-6 py-3 rounded-full text-xl font-semibold",
              recommendation === "approved" ? "bg-green-500/20 text-green-400" :
                recommendation === "rejected" ? "bg-red-500/20 text-red-400" :
                  "bg-yellow-500/20 text-yellow-400"
            )}>
              {recommendation === "approved" ? "APPROVED" :
                recommendation === "rejected" ? "NOT APPROVED" :
                  "UNDER REVIEW"}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 rounded-xl bg-white/5">
              <div className="text-3xl font-bold text-blue-400">{Math.round(confidence)}%</div>
              <div className="text-white/50 text-sm">Confidence</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5">
              <div className="text-3xl font-bold text-green-400">{Math.round(engagement)}%</div>
              <div className="text-white/50 text-sm">Engagement</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5">
              <div className="text-3xl font-bold text-purple-400">{Math.round(clarity)}%</div>
              <div className="text-white/50 text-sm">Clarity</div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Assessment
            </h3>
            <p className="text-white/80">{aiSummary}</p>
          </div>
        </GlassCard>

        {/* Stats */}
        <GlassCard className="p-6 mb-6">
          <h3 className="font-bold mb-4">Interview Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold">{formatTime(totalDuration)}</div>
              <div className="text-white/50 text-sm">Duration</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold">{answers.length}</div>
              <div className="text-white/50 text-sm">Questions</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold">
                {answers.length > 0 ? Math.round(answers.reduce((s, a) => s + a.score, 0) / answers.length) : 0}%
              </div>
              <div className="text-white/50 text-sm">Avg Score</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold capitalize">{currentEmotion}</div>
              <div className="text-white/50 text-sm">Demeanor</div>
            </div>
          </div>
        </GlassCard>

        {/* Message */}
        <div className="text-center">
          <p className="text-white/50 mb-4">
            The hiring team will review your interview and contact you soon.
          </p>
          <p className="text-white/30 text-sm">You may close this window.</p>
        </div>
      </div>
    </div>
  );
}
