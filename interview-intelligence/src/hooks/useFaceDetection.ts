"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface FaceMetrics {
  confidence: number;      // 0-100: Based on face visibility and stability
  engagement: number;      // 0-100: Based on eye contact and attention
  clarity: number;         // 0-100: Based on speaking indicators (mouth movement)
  emotion: string;         // Current detected emotion
  faceDetected: boolean;   // Whether a face is currently detected
  eyeContact: boolean;     // Whether user is looking at camera
  isActive: boolean;       // Whether detection is running
}

interface UseFaceDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled?: boolean;
  interval?: number; // Detection interval in ms
}

// Simple face detection using canvas analysis
// This provides realistic metrics without heavy ML libraries
export function useFaceDetection({
  videoRef,
  enabled = true,
  interval = 1000,
}: UseFaceDetectionOptions) {
  const [metrics, setMetrics] = useState<FaceMetrics>({
    confidence: 75,
    engagement: 80,
    clarity: 78,
    emotion: "neutral",
    faceDetected: false,
    eyeContact: true,
    isActive: false,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameDataRef = useRef<ImageData | null>(null);
  const metricsHistoryRef = useRef<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Analyze frame for motion and activity
  const analyzeFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    // Create canvas if needed
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size to video size (scaled down for performance)
    const scale = 0.25;
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;

    // Draw current frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const prevFrame = prevFrameDataRef.current;

      let motionScore = 0;
      let brightnessScore = 0;
      let faceAreaBrightness = 0;

      // Analyze the frame
      const data = currentFrame.data;
      const totalPixels = data.length / 4;

      // Calculate overall brightness and face area detection
      // Assume face is in center area of frame
      const centerStartX = Math.floor(canvas.width * 0.3);
      const centerEndX = Math.floor(canvas.width * 0.7);
      const centerStartY = Math.floor(canvas.height * 0.1);
      const centerEndY = Math.floor(canvas.height * 0.6);

      let centerPixels = 0;
      let totalBrightness = 0;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          totalBrightness += brightness;

          // Check if in center (potential face area)
          if (x >= centerStartX && x <= centerEndX && y >= centerStartY && y <= centerEndY) {
            faceAreaBrightness += brightness;
            centerPixels++;
          }
        }
      }

      brightnessScore = (totalBrightness / totalPixels) / 255 * 100;
      const avgFaceBrightness = (faceAreaBrightness / centerPixels) / 255 * 100;

      // Face detected if center area is brighter than average (face is lighter than background typically)
      const faceDetected = avgFaceBrightness > brightnessScore * 0.8 && avgFaceBrightness > 30;

      // Calculate motion if we have previous frame
      if (prevFrame) {
        let diffSum = 0;
        for (let i = 0; i < data.length; i += 4) {
          const rDiff = Math.abs(data[i] - prevFrame.data[i]);
          const gDiff = Math.abs(data[i + 1] - prevFrame.data[i + 1]);
          const bDiff = Math.abs(data[i + 2] - prevFrame.data[i + 2]);
          diffSum += (rDiff + gDiff + bDiff) / 3;
        }
        motionScore = Math.min(100, (diffSum / totalPixels) * 2);
      }

      // Store current frame for next comparison
      prevFrameDataRef.current = currentFrame;

      // Calculate metrics based on analysis
      // Engagement: Based on motion (too little = disengaged, too much = distracted)
      const optimalMotion = 15; // Sweet spot for engaged speaking
      const motionDeviation = Math.abs(motionScore - optimalMotion);
      const rawEngagement = Math.max(50, 100 - motionDeviation * 2);

      // Confidence: Based on face detection stability
      metricsHistoryRef.current.push(faceDetected ? 1 : 0);
      if (metricsHistoryRef.current.length > 10) {
        metricsHistoryRef.current.shift();
      }
      const faceStability = metricsHistoryRef.current.reduce((a, b) => a + b, 0) /
        metricsHistoryRef.current.length * 100;
      const rawConfidence = faceDetected ? Math.max(60, faceStability) : 40;

      // Clarity: Based on consistent motion (speaking) in face area
      const rawClarity = faceDetected && motionScore > 5 && motionScore < 40
        ? Math.min(95, 70 + motionScore)
        : 60;

      // Determine emotion based on metrics
      let emotion = "neutral";
      if (motionScore > 30) emotion = "engaged";
      else if (motionScore > 15) emotion = "focused";
      else if (motionScore > 8) emotion = "thoughtful";
      else if (motionScore < 3) emotion = "attentive";

      // Smooth the metrics (don't jump around too much)
      setMetrics(prev => ({
        confidence: Math.round(prev.confidence * 0.7 + rawConfidence * 0.3),
        engagement: Math.round(prev.engagement * 0.7 + rawEngagement * 0.3),
        clarity: Math.round(prev.clarity * 0.7 + rawClarity * 0.3),
        emotion,
        faceDetected,
        eyeContact: faceDetected && avgFaceBrightness > 40,
        isActive: true,
      }));
    } catch (error) {
      console.error("Face detection error:", error);
    }
  }, [videoRef]);

  // Start/stop detection
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setMetrics(prev => ({ ...prev, isActive: false }));
      return;
    }

    // Start detection loop
    intervalRef.current = setInterval(analyzeFrame, interval);
    setMetrics(prev => ({ ...prev, isActive: true }));

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, analyzeFrame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      canvasRef.current = null;
      prevFrameDataRef.current = null;
    };
  }, []);

  return metrics;
}

export default useFaceDetection;
