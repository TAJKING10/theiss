"use client";

import { useState, useEffect, useRef } from "react";
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
  CheckCircle2,
  AlertCircle,
  Clock,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { getInterview, updateInterview, completeInterview } from "@/lib/actions/interviews";
import { getInterviewQuestions, initializeInterviewQuestions, answerQuestion } from "@/lib/actions/questions";
import { cn } from "@/lib/utils";
import type { InterviewWithCandidate, InterviewQuestion } from "@/lib/supabase/types";

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<InterviewWithCandidate | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [notes, setNotes] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [aiInsights, setAiInsights] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadData();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [interviewId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const loadData = async () => {
    try {
      const interviewData = await getInterview(interviewId);
      setInterview(interviewData);

      if (interviewData) {
        let questionsData = await getInterviewQuestions(interviewId);

        // If no questions, initialize with default ones
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Failed to access camera:", error);
    }
  };

  const startSession = async () => {
    await startCamera();
    setIsRecording(true);
    await updateInterview(interviewId, { status: "in_progress" });
    setInterview(prev => prev ? { ...prev, status: "in_progress" } : null);

    // Simulate AI insights
    simulateAiInsights();
  };

  const simulateAiInsights = () => {
    const insights = [
      "Candidate is speaking clearly and confidently",
      "Good eye contact maintained",
      "Consider asking follow-up about previous experience",
      "Positive body language detected",
      "Technical terminology used appropriately",
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < insights.length) {
        setAiInsights(prev => [insights[index], ...prev].slice(0, 5));
        index++;
      }
    }, 10000);

    return () => clearInterval(interval);
  };

  const pauseSession = () => {
    setIsPaused(!isPaused);
  };

  const stopSession = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    // Calculate score based on answered questions
    const answeredQuestions = questions.filter(q => q.answer);
    const avgScore = answeredQuestions.length > 0
      ? Math.round(answeredQuestions.reduce((acc, q) => acc + (q.score || 70), 0) / answeredQuestions.length)
      : 75;

    await completeInterview(interviewId, avgScore, notes, {
      duration: duration,
      questionsAsked: questions.length,
      questionsAnswered: answeredQuestions.length,
    });

    router.push(`/dashboard/interviews/${interviewId}`);
  };

  const nextQuestion = async () => {
    // Save current answer
    if (currentAnswer && questions[currentQuestionIndex]) {
      const score = Math.floor(Math.random() * 30) + 70; // Simulated AI score
      await answerQuestion(questions[currentQuestionIndex].id, currentAnswer, {
        confidence: score,
        keywords: ["relevant", "technical"],
      }, score);

      setQuestions(prev => prev.map((q, i) =>
        i === currentQuestionIndex ? { ...q, answer: currentAnswer, score } : q
      ));
    }

    setCurrentAnswer("");
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <GlassCard className="p-12 text-center max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Interview Not Found</h2>
          <Link href="/dashboard/interviews">
            <Button>Back to Interviews</Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <GradientBackground />

      <div className="p-4 md:p-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/interviews/${interviewId}`}>
              <Button variant="ghost" size="icon" className="rounded-full bg-white/5 h-10 w-10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{interview.title}</h1>
              <p className="text-white/50 text-sm">
                {interview.candidate?.name} &middot; {interview.candidate?.position}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isRecording && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/40">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-100 text-sm font-bold">LIVE</span>
              </div>
            )}
            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 font-mono text-sm">
              <Clock className="w-4 h-4 inline mr-2" />
              {formatTime(duration)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Video Area */}
          <div className="xl:col-span-3 space-y-6">
            <GlassCard className="p-0 border-none relative overflow-hidden aspect-video bg-black shadow-2xl">
              {!isRecording ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6"
                  >
                    <Video className="w-10 h-10 text-white/20" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">Ready to Start</h3>
                  <p className="text-white/40 mb-8 max-w-sm text-center">
                    Click Start Session to begin the AI-powered interview with {interview.candidate?.name}.
                  </p>
                  <Button onClick={startSession} className="gap-2 px-8 h-12 text-lg">
                    <Play className="w-5 h-5" /> Start Session
                  </Button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* AI Scanning Effect */}
                  <motion.div
                    animate={{ y: ["0%", "100%", "0%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 right-0 h-1 bg-blue-500/30 blur-sm z-10"
                  />

                  {/* Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="secondary"
                        size="icon"
                        className={cn("h-12 w-12 rounded-full", !videoEnabled && "bg-red-500/20 border-red-500/40")}
                        onClick={toggleVideo}
                      >
                        {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className={cn("h-12 w-12 rounded-full", !audioEnabled && "bg-red-500/20 border-red-500/40")}
                        onClick={toggleAudio}
                      >
                        {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-12 w-12 rounded-full"
                        onClick={pauseSession}
                      >
                        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                      </Button>
                      <Button
                        className="h-12 px-8 bg-red-500/20 border-red-500/40 text-red-100 hover:bg-red-500/30"
                        onClick={stopSession}
                      >
                        <Square className="w-4 h-4 mr-2 fill-current" /> End Interview
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </GlassCard>

            {/* Questions Panel */}
            {isRecording && questions.length > 0 && (
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </h3>
                  <div className="flex gap-2">
                    {questions.map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          i === currentQuestionIndex
                            ? "bg-blue-500"
                            : i < currentQuestionIndex
                            ? "bg-green-500"
                            : "bg-white/20"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                  <p className="text-lg">{questions[currentQuestionIndex]?.question}</p>
                </div>

                <div className="space-y-4">
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type candidate's answer or key points..."
                    className="w-full h-24 p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 resize-none"
                  />
                  <div className="flex justify-end gap-3">
                    {currentQuestionIndex > 0 && (
                      <Button variant="secondary" onClick={() => setCurrentQuestionIndex(prev => prev - 1)}>
                        Previous
                      </Button>
                    )}
                    <Button onClick={nextQuestion} className="gap-2">
                      {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Questions"}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* AI Insights */}
            <GlassCard className="p-0">
              <div className="p-4 border-b border-white/5 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">AI Insights</h3>
              </div>
              <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                <AnimatePresence>
                  {aiInsights.length > 0 ? (
                    aiInsights.map((insight, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 rounded-lg bg-white/5 text-sm text-white/70"
                      >
                        {insight}
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-white/30 text-sm text-center py-4">
                      AI insights will appear here during the interview
                    </p>
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>

            {/* Signals */}
            {isRecording && (
              <GlassCard className="p-4 space-y-4">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Live Signals
                </h3>
                {[
                  { label: "Confidence", value: 87 },
                  { label: "Engagement", value: 92 },
                  { label: "Clarity", value: 85 },
                ].map((signal) => (
                  <div key={signal.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/50">{signal.label}</span>
                      <span className="font-medium">{signal.value}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${signal.value}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </GlassCard>
            )}

            {/* Notes */}
            <GlassCard className="p-4 space-y-4">
              <h3 className="font-bold text-sm">Quick Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type your observations..."
                className="w-full h-32 p-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50 resize-none"
              />
            </GlassCard>

            {/* Fairness */}
            <GlassCard className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Fairness Active</h4>
                <p className="text-xs text-white/40">Bias detection enabled</p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
