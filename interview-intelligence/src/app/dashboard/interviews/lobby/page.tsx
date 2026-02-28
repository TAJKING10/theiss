"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function InterviewLobbyPage() {
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [aiCalibrating, setAiCalibrating] = useState(true);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [systemChecks, setSystemChecks] = useState({
    camera: "checking",
    microphone: "checking",
    network: "checking",
    ai: "checking",
  });

  // Simulate system checks
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setSystemChecks((prev) => ({ ...prev, camera: "ready" }));
      setCameraReady(true);
    }, 1500);

    const timer2 = setTimeout(() => {
      setSystemChecks((prev) => ({ ...prev, microphone: "ready" }));
      setMicReady(true);
    }, 2000);

    const timer3 = setTimeout(() => {
      setSystemChecks((prev) => ({ ...prev, network: "ready" }));
    }, 2500);

    const calibrationInterval = setInterval(() => {
      setCalibrationProgress((prev) => {
        if (prev >= 100) {
          setAiCalibrating(false);
          setSystemChecks((s) => ({ ...s, ai: "ready" }));
          clearInterval(calibrationInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(calibrationInterval);
    };
  }, []);

  const allReady = Object.values(systemChecks).every((s) => s === "ready");

  const interviewDetails = {
    candidate: "Alex Thompson",
    position: "Frontend Developer",
    scheduledTime: "2:00 PM",
    duration: "45 minutes",
    type: "Technical Interview",
    interviewers: ["You", "Sarah Johnson"],
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard/interviews" className="text-sm text-white/50 hover:text-white transition-colors mb-2 inline-block">
            ← Back to Interviews
          </Link>
          <h1 className="text-3xl font-bold">Pre-Interview Lobby</h1>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/50">Interview starts in</div>
          <div className="text-2xl font-bold gradient-text">5:00</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Preview */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-gray-900 to-black relative">
              {cameraReady ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-white font-medium">Camera Preview</p>
                    <p className="text-white/50 text-sm">You look great!</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-white/20 mx-auto mb-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-white/50">Connecting camera...</p>
                  </div>
                </div>
              )}

              {/* Status indicator */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${cameraReady ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`} />
                <span className="text-sm text-white/70">{cameraReady ? "Camera Ready" : "Connecting..."}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-white/5 flex items-center justify-center gap-4">
              <button className={`p-4 rounded-full transition-colors ${cameraReady ? "bg-white/10 hover:bg-white/20" : "bg-white/5"}`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button className={`p-4 rounded-full transition-colors ${micReady ? "bg-white/10 hover:bg-white/20" : "bg-white/5"}`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* AI Calibration */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                aiCalibrating ? "bg-purple-500/20 animate-pulse" : "bg-green-500/20"
              }`}>
                {aiCalibrating ? (
                  <svg className="w-6 h-6 text-purple-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  {aiCalibrating ? "AI Calibrating..." : "AI Ready"}
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  {aiCalibrating
                    ? "Initializing multimodal analysis models for optimal performance."
                    : "All AI models calibrated and ready for real-time analysis."}
                </p>
                {aiCalibrating && (
                  <div className="space-y-2">
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${calibrationProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-white/40">
                      <span>Loading CNN, Wav2Vec 2.0, BERT...</span>
                      <span>{calibrationProgress}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Interview Details */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
            <h3 className="font-semibold mb-4">Interview Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-medium">
                  {interviewDetails.candidate.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{interviewDetails.candidate}</p>
                  <p className="text-sm text-white/50">{interviewDetails.position}</p>
                </div>
              </div>
              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Time</span>
                  <span>{interviewDetails.scheduledTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Duration</span>
                  <span>{interviewDetails.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Type</span>
                  <span>{interviewDetails.type}</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Checks */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
            <h3 className="font-semibold mb-4">System Checks</h3>
            <div className="space-y-3">
              {[
                { key: "camera", label: "Camera", icon: "📹" },
                { key: "microphone", label: "Microphone", icon: "🎙" },
                { key: "network", label: "Network", icon: "📶" },
                { key: "ai", label: "AI Models", icon: "🧠" },
              ].map((check) => (
                <div key={check.key} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <span>{check.icon}</span>
                    <span className="text-sm">{check.label}</span>
                  </div>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    systemChecks[check.key as keyof typeof systemChecks] === "ready"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {systemChecks[check.key as keyof typeof systemChecks] === "ready" ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
            <h3 className="font-semibold mb-4">Quick Tips</h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                Ensure good lighting on your face
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                Use headphones to reduce echo
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                Close other applications to save bandwidth
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                AI will analyze in real-time automatically
              </li>
            </ul>
          </div>

          {/* Start Button */}
          <Link
            href="/dashboard/interviews"
            className={`block w-full py-4 rounded-xl text-center font-semibold transition-all ${
              allReady
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/25"
                : "bg-white/10 text-white/50 cursor-not-allowed"
            }`}
          >
            {allReady ? "Start Interview" : "Preparing..."}
          </Link>
        </div>
      </div>
    </div>
  );
}
