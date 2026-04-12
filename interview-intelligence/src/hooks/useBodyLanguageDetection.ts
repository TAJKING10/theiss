"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface BodyLanguageResult {
  raw_class: string;
  label: string;
  emoji: string;
  color: "green" | "blue" | "yellow" | "red" | "gray";
  tip: string;
  confidence: number;
  body_language_score: number;
  all_scores: Record<string, number>;
  posture: string;
  posture_score: number;
  posture_tip: string;
  eye_contact: boolean;
  head_position: string;
  gesturing: boolean;
  face_visible: boolean;
  timestamp: number;
}

const DEFAULT_RESULT: BodyLanguageResult = {
  raw_class: "",
  label: "Initializing…",
  emoji: "👤",
  color: "gray",
  tip: "Starting body language analysis",
  confidence: 0,
  body_language_score: 0,
  all_scores: {},
  posture: "unknown",
  posture_score: 0,
  posture_tip: "",
  eye_contact: false,
  head_position: "centered",
  gesturing: false,
  face_visible: false,
  timestamp: 0,
};

interface UseBodyLanguageOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled?: boolean;
  intervalMs?: number;
  apiUrl?: string;
}

export function useBodyLanguageDetection({
  videoRef,
  enabled = true,
  intervalMs = 3000,
  apiUrl = "http://localhost:8001",
}: UseBodyLanguageOptions) {
  const [current, setCurrent]     = useState<BodyLanguageResult>(DEFAULT_RESULT);
  const [history, setHistory]     = useState<BodyLanguageResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef   = useRef<HTMLCanvasElement | null>(null);

  // Check API availability
  const checkApi = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) { setApiAvailable(true); setError(null); return true; }
    } catch {}
    setApiAvailable(false);
    return false;
  }, [apiUrl]);

  // Capture frame from video and send to API
  const analyzeFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !apiAvailable) return;

    // Draw frame to canvas
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    canvas.width  = 320;  // resize to reduce bandwidth
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, 320, 240);

    // Get base64 JPEG
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    const base64  = dataUrl.replace(/^data:image\/jpeg;base64,/, "");

    setIsAnalyzing(true);
    try {
      const res = await fetch(`${apiUrl}/predict`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ image: base64 }),
        signal:  AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const data: BodyLanguageResult = await res.json();
        data.timestamp = Date.now();
        setCurrent(data);
        if (data.face_visible) {
          setHistory(prev => [data, ...prev].slice(0, 20));
        }
      }
    } catch {
      // silent fail — don't interrupt interview
    } finally {
      setIsAnalyzing(false);
    }
  }, [videoRef, apiUrl, apiAvailable]);

  // Start/stop analysis loop
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    checkApi().then(available => {
      if (!available) return;
      analyzeFrame(); // first frame immediately
      intervalRef.current = setInterval(analyzeFrame, intervalMs);
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, analyzeFrame, checkApi, intervalMs]);

  // Poll for API if not available
  useEffect(() => {
    if (apiAvailable) return;
    const poll = setInterval(checkApi, 5000);
    return () => clearInterval(poll);
  }, [apiAvailable, checkApi]);

  // Compute dominant body language over recent history
  const dominant = (() => {
    if (history.length === 0) return null;
    const counts: Record<string, number> = {};
    for (const h of history) {
      if (h.face_visible) counts[h.label] = (counts[h.label] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? null;
  })();

  // Average body language score across history
  const averageScore = history.length > 0
    ? Math.round(history.reduce((s, h) => s + h.body_language_score, 0) / history.length)
    : 0;

  // Eye contact percentage
  const eyeContactPct = history.length > 0
    ? Math.round(history.filter(h => h.eye_contact).length / history.length * 100)
    : 0;

  // Posture quality percentage
  const goodPosturePct = history.length > 0
    ? Math.round(history.filter(h => h.posture === "good").length / history.length * 100)
    : 0;

  return {
    current,
    history,
    dominant,
    averageScore,
    eyeContactPct,
    goodPosturePct,
    isAnalyzing,
    apiAvailable,
    error,
    analyzeFrame,
  };
}
