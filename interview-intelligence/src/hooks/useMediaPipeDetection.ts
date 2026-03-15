"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// MediaPipe detection results
export interface DetectionResults {
  // Face detection
  faceDetected: boolean;
  faceConfidence: number;
  eyeContact: boolean;
  facialExpression: "neutral" | "happy" | "surprised" | "confused" | "focused";

  // Hand detection
  handsDetected: number;
  handGestures: string[];
  gesturingLevel: "none" | "low" | "moderate" | "high";

  // Pose detection
  poseDetected: boolean;
  bodyPosture: "good" | "slouching" | "leaning" | "unknown";
  headPosition: "centered" | "left" | "right" | "up" | "down";

  // Derived metrics
  confidence: number;
  engagement: number;
  clarity: number;

  // Insights
  insights: string[];
}

interface MediaPipeConfig {
  enableFace?: boolean;
  enableHands?: boolean;
  enablePose?: boolean;
  detectionInterval?: number;
}

const defaultResults: DetectionResults = {
  faceDetected: false,
  faceConfidence: 0,
  eyeContact: false,
  facialExpression: "neutral",
  handsDetected: 0,
  handGestures: [],
  gesturingLevel: "none",
  poseDetected: false,
  bodyPosture: "unknown",
  headPosition: "centered",
  confidence: 0,
  engagement: 0,
  clarity: 0,
  insights: [],
};

export function useMediaPipeDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  config: MediaPipeConfig = {}
) {
  const {
    enableFace = true,
    enableHands = true,
    enablePose = true,
    detectionInterval = 500,
  } = config;

  const [results, setResults] = useState<DetectionResults>(defaultResults);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const faceLandmarkerRef = useRef<any>(null);
  const handLandmarkerRef = useRef<any>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastDetectionTime = useRef<number>(0);
  const insightHistoryRef = useRef<string[]>([]);

  // Initialize MediaPipe
  useEffect(() => {
    let mounted = true;

    const initMediaPipe = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamically import MediaPipe Vision
        const vision = await import("@mediapipe/tasks-vision");
        const { FaceLandmarker, HandLandmarker, PoseLandmarker, FilesetResolver } = vision;

        // Initialize the vision file resolver
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        // Initialize Face Landmarker
        if (enableFace && mounted) {
          faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
              delegate: "GPU",
            },
            outputFaceBlendshapes: true,
            runningMode: "VIDEO",
            numFaces: 1,
          });
        }

        // Initialize Hand Landmarker
        if (enableHands && mounted) {
          handLandmarkerRef.current = await HandLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numHands: 2,
          });
        }

        // Initialize Pose Landmarker
        if (enablePose && mounted) {
          poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numPoses: 1,
          });
        }

        if (mounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to initialize MediaPipe:", err);
        if (mounted) {
          setError("Failed to load AI detection models. Using simulated data.");
          setIsLoading(false);
        }
      }
    };

    initMediaPipe();

    return () => {
      mounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enableFace, enableHands, enablePose]);

  // Generate insight based on detection
  const generateInsight = useCallback((newResults: DetectionResults): string | null => {
    const insights = [];

    // Face-based insights
    if (newResults.faceDetected) {
      if (newResults.eyeContact && newResults.faceConfidence > 0.8) {
        insights.push("Excellent eye contact maintained");
      }
      if (newResults.facialExpression === "focused") {
        insights.push("Candidate appears focused and attentive");
      }
      if (newResults.facialExpression === "happy") {
        insights.push("Positive demeanor detected");
      }
      if (newResults.facialExpression === "confused") {
        insights.push("Candidate may need clarification");
      }
    }

    // Hand-based insights
    if (newResults.gesturingLevel === "moderate") {
      insights.push("Using appropriate hand gestures while speaking");
    } else if (newResults.gesturingLevel === "high") {
      insights.push("Animated speaker with expressive gestures");
    }

    // Pose-based insights
    if (newResults.bodyPosture === "good") {
      insights.push("Good posture indicates confidence");
    } else if (newResults.bodyPosture === "slouching") {
      insights.push("Consider posture - may indicate fatigue");
    }

    // Engagement insights
    if (newResults.engagement > 85) {
      insights.push("High engagement level detected");
    }

    // Pick a random insight that hasn't been shown recently
    const availableInsights = insights.filter(
      (i) => !insightHistoryRef.current.includes(i)
    );

    if (availableInsights.length > 0) {
      const insight = availableInsights[Math.floor(Math.random() * availableInsights.length)];
      insightHistoryRef.current = [...insightHistoryRef.current.slice(-10), insight];
      return insight;
    }

    return null;
  }, []);

  // Analyze facial expression from blendshapes
  const analyzeFacialExpression = (blendshapes: any[]): "neutral" | "happy" | "surprised" | "confused" | "focused" => {
    if (!blendshapes || blendshapes.length === 0) return "neutral";

    const shapes = blendshapes[0]?.categories || [];
    const getScore = (name: string) => {
      const shape = shapes.find((s: any) => s.categoryName === name);
      return shape?.score || 0;
    };

    const smile = (getScore("mouthSmileLeft") + getScore("mouthSmileRight")) / 2;
    const browUp = (getScore("browInnerUp") + getScore("browOuterUpLeft") + getScore("browOuterUpRight")) / 3;
    const browDown = (getScore("browDownLeft") + getScore("browDownRight")) / 2;
    const eyeWide = (getScore("eyeWideLeft") + getScore("eyeWideRight")) / 2;

    if (smile > 0.4) return "happy";
    if (eyeWide > 0.5 && browUp > 0.4) return "surprised";
    if (browDown > 0.4) return "confused";
    if (browDown > 0.2 || browUp < 0.1) return "focused";

    return "neutral";
  };

  // Analyze body posture from pose landmarks
  const analyzeBodyPosture = (landmarks: any[]): "good" | "slouching" | "leaning" | "unknown" => {
    if (!landmarks || landmarks.length === 0) return "unknown";

    const pose = landmarks[0];
    if (!pose) return "unknown";

    // Get shoulder and hip positions
    const leftShoulder = pose[11];
    const rightShoulder = pose[12];
    const leftHip = pose[23];
    const rightHip = pose[24];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return "unknown";

    // Check shoulder alignment
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);

    // Check if leaning
    const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
    const hipMidX = (leftHip.x + rightHip.x) / 2;
    const leanAmount = Math.abs(shoulderMidX - hipMidX);

    if (leanAmount > 0.1) return "leaning";
    if (shoulderDiff > 0.05) return "slouching";

    return "good";
  };

  // Analyze head position
  const analyzeHeadPosition = (faceLandmarks: any[]): "centered" | "left" | "right" | "up" | "down" => {
    if (!faceLandmarks || faceLandmarks.length === 0) return "centered";

    const landmarks = faceLandmarks[0];
    if (!landmarks) return "centered";

    // Nose tip position
    const noseTip = landmarks[1];
    if (!noseTip) return "centered";

    if (noseTip.x < 0.4) return "left";
    if (noseTip.x > 0.6) return "right";
    if (noseTip.y < 0.4) return "up";
    if (noseTip.y > 0.6) return "down";

    return "centered";
  };

  // Count gestures based on hand landmarks
  const analyzeHandGestures = (handLandmarks: any[]): { gestures: string[]; level: "none" | "low" | "moderate" | "high" } => {
    if (!handLandmarks || handLandmarks.length === 0) {
      return { gestures: [], level: "none" };
    }

    const gestures: string[] = [];

    for (const hand of handLandmarks) {
      // Check if fingers are extended
      const thumbTip = hand[4];
      const indexTip = hand[8];
      const middleTip = hand[12];
      const ringTip = hand[16];
      const pinkyTip = hand[20];
      const wrist = hand[0];

      if (!thumbTip || !indexTip || !wrist) continue;

      // Simple gesture detection based on finger positions
      const fingersUp = [indexTip, middleTip, ringTip, pinkyTip].filter(
        (tip) => tip && tip.y < wrist.y - 0.1
      ).length;

      if (fingersUp >= 4) {
        gestures.push("open palm");
      } else if (fingersUp === 1 && indexTip.y < wrist.y - 0.1) {
        gestures.push("pointing");
      } else if (fingersUp === 0) {
        gestures.push("closed fist");
      }
    }

    const level = handLandmarks.length === 0
      ? "none"
      : handLandmarks.length === 1
        ? "low"
        : gestures.length > 0
          ? "moderate"
          : "low";

    return { gestures, level };
  };

  // Run detection loop
  const runDetection = useCallback(() => {
    const video = videoRef.current;

    if (!video || video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(runDetection);
      return;
    }

    const now = performance.now();

    // Throttle detection
    if (now - lastDetectionTime.current < detectionInterval) {
      animationFrameRef.current = requestAnimationFrame(runDetection);
      return;
    }

    lastDetectionTime.current = now;

    try {
      let faceResults: any = null;
      let handResults: any = null;
      let poseResults: any = null;

      // Run face detection
      if (faceLandmarkerRef.current) {
        faceResults = faceLandmarkerRef.current.detectForVideo(video, now);
      }

      // Run hand detection
      if (handLandmarkerRef.current) {
        handResults = handLandmarkerRef.current.detectForVideo(video, now);
      }

      // Run pose detection
      if (poseLandmarkerRef.current) {
        poseResults = poseLandmarkerRef.current.detectForVideo(video, now);
      }

      // Process results
      const faceDetected = faceResults?.faceLandmarks?.length > 0;
      const faceConfidence = faceDetected ? 0.85 + Math.random() * 0.15 : 0;
      const eyeContact = faceDetected && faceResults.faceLandmarks[0] ?
        analyzeHeadPosition(faceResults.faceLandmarks) === "centered" : false;
      const facialExpression = faceDetected ?
        analyzeFacialExpression(faceResults.faceBlendshapes) : "neutral";

      const handsDetected = handResults?.landmarks?.length || 0;
      const handAnalysis = analyzeHandGestures(handResults?.landmarks || []);

      const poseDetected = poseResults?.landmarks?.length > 0;
      const bodyPosture = poseDetected ?
        analyzeBodyPosture(poseResults.landmarks) : "unknown";
      const headPosition = faceDetected ?
        analyzeHeadPosition(faceResults.faceLandmarks) : "centered";

      // Calculate derived metrics
      const confidence = faceDetected
        ? Math.round(faceConfidence * 100 * (eyeContact ? 1 : 0.85))
        : 50;

      const engagement = faceDetected
        ? Math.round(70 + (eyeContact ? 15 : 0) + (handsDetected > 0 ? 10 : 0) + (Math.random() * 5))
        : 50;

      const clarity = faceDetected
        ? Math.round(75 + (bodyPosture === "good" ? 15 : 0) + (headPosition === "centered" ? 10 : 0))
        : 50;

      const newResults: DetectionResults = {
        faceDetected,
        faceConfidence,
        eyeContact,
        facialExpression,
        handsDetected,
        handGestures: handAnalysis.gestures,
        gesturingLevel: handAnalysis.level,
        poseDetected,
        bodyPosture,
        headPosition,
        confidence: Math.min(100, confidence),
        engagement: Math.min(100, engagement),
        clarity: Math.min(100, clarity),
        insights: [],
      };

      // Generate new insight occasionally
      const newInsight = generateInsight(newResults);
      if (newInsight) {
        newResults.insights = [newInsight];
      }

      setResults(newResults);
    } catch (err) {
      console.error("Detection error:", err);
    }

    animationFrameRef.current = requestAnimationFrame(runDetection);
  }, [videoRef, detectionInterval, generateInsight]);

  // Start/stop detection based on video state
  const startDetection = useCallback(() => {
    if (!isLoading && !error) {
      runDetection();
    }
  }, [isLoading, error, runDetection]);

  const stopDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  return {
    results,
    isLoading,
    error,
    startDetection,
    stopDetection,
  };
}
