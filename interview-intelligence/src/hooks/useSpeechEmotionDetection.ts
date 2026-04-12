"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface EmotionResult {
  emotion: string;
  label: string;
  emoji: string;
  color: "green" | "blue" | "red" | "yellow" | "gray";
  description: string;
  confidence: number;
  all_scores: Record<string, number>;
  timestamp: number;
}

interface UseSpeechEmotionOptions {
  /** How often to sample audio (ms). Default 5000 */
  sampleInterval?: number;
  /** Python emotion API base URL */
  apiUrl?: string;
  /** Only run when interview is active */
  enabled?: boolean;
}

const DEFAULT_EMOTION: EmotionResult = {
  emotion: "relaxed",
  label: "Relaxed",
  emoji: "😊",
  color: "green",
  description: "Candidate appears calm and composed",
  confidence: 0,
  all_scores: {},
  timestamp: 0,
};

export function useSpeechEmotionDetection({
  sampleInterval = 5000,
  apiUrl = "http://localhost:8000",
  enabled = true,
}: UseSpeechEmotionOptions = {}) {
  const [currentEmotion, setCurrentEmotion] = useState<EmotionResult>(DEFAULT_EMOTION);
  const [emotionHistory, setEmotionHistory] = useState<EmotionResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef(false);

  // Check if Python API is available
  const checkApi = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        setApiAvailable(true);
        setError(null);
        return true;
      }
    } catch {
      // API not running yet
    }
    setApiAvailable(false);
    return false;
  }, [apiUrl]);

  // Send audio blob to Python API
  const analyzeAudio = useCallback(async (audioBlob: Blob) => {
    if (!apiAvailable || audioBlob.size < 1000) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "chunk.webm");

      const res = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const data = await res.json();
        const result: EmotionResult = {
          ...data,
          timestamp: Date.now(),
        };
        setCurrentEmotion(result);
        setEmotionHistory(prev => [result, ...prev].slice(0, 20));
      }
    } catch {
      // Silent fail — don't disrupt the interview
    } finally {
      setIsAnalyzing(false);
    }
  }, [apiUrl, apiAvailable]);

  // Start audio capture
  const startCapture = useCallback(async () => {
    if (isRecordingRef.current) return;

    const available = await checkApi();
    if (!available) {
      setError("Emotion service not running. Start with: python emotion_service/api.py");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      isRecordingRef.current = true;

      // Collect chunks periodically and analyze
      intervalRef.current = setInterval(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, sampleInterval);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          chunksRef.current = [];
          analyzeAudio(blob);
        }

        // Restart if still supposed to be recording
        if (isRecordingRef.current) {
          recorder.start();
        }
      };

      recorder.start();
    } catch (err) {
      setError("Microphone access denied");
      isRecordingRef.current = false;
    }
  }, [checkApi, analyzeAudio, sampleInterval]);

  // Stop capture
  const stopCapture = useCallback(() => {
    isRecordingRef.current = false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    chunksRef.current = [];
  }, []);

  // Start/stop based on enabled flag
  useEffect(() => {
    if (enabled) {
      startCapture();
    } else {
      stopCapture();
    }
    return () => stopCapture();
  }, [enabled, startCapture, stopCapture]);

  // Poll for API availability if not yet available
  useEffect(() => {
    if (apiAvailable) return;
    const poll = setInterval(checkApi, 5000);
    return () => clearInterval(poll);
  }, [apiAvailable, checkApi]);

  // Dominant emotion across history
  const dominantEmotion = (() => {
    if (emotionHistory.length === 0) return null;
    const counts: Record<string, number> = {};
    for (const e of emotionHistory) {
      counts[e.emotion] = (counts[e.emotion] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  })();

  return {
    currentEmotion,
    emotionHistory,
    dominantEmotion,
    isAnalyzing,
    apiAvailable,
    error,
    startCapture,
    stopCapture,
  };
}
