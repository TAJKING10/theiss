"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface UseSpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const {
    continuous = true,
    interimResults = true,
    language = "en-US",
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = interimResults;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript + " ";
          } else {
            interim += result[0].transcript;
          }
        }

        if (final) {
          setTranscript(prev => prev + final);
        }
        setInterimTranscript(interim);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setError("Microphone access denied. Please allow microphone access.");
        } else if (event.error === "no-speech") {
          // Ignore no-speech errors, just restart
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        // Auto-restart if still listening
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Ignore if already started
          }
        }
      };
    } else {
      setIsSupported(false);
      setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [continuous, interimResults, language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setError(null);
      setTranscript("");
      setInterimTranscript("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}

// Enhanced Text-to-Speech hook with emotion and queue support
export type SpeechEmotion = "neutral" | "excited" | "calm" | "questioning" | "encouraging";

interface SpeechQueueItem {
  text: string;
  emotion?: SpeechEmotion;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

interface UseTextToSpeechOptions {
  defaultRate?: number;
  defaultPitch?: number;
  defaultVolume?: number;
  preferredVoices?: string[];
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const {
    defaultRate = 1,
    defaultPitch = 1,
    defaultVolume = 1,
    preferredVoices = ["Google US English", "Microsoft Zira", "Samantha", "Alex"],
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [currentRate, setCurrentRate] = useState(defaultRate);

  const queueRef = useRef<SpeechQueueItem[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const supported = "speechSynthesis" in window;
    setIsSupported(supported);

    if (supported) {
      // Load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);

        // Select best voice
        if (voices.length > 0 && !selectedVoice) {
          // Try to find a preferred voice
          let bestVoice = voices.find(v =>
            preferredVoices.some(pv => v.name.includes(pv))
          );

          // Fallback to first English voice
          if (!bestVoice) {
            bestVoice = voices.find(v => v.lang.startsWith("en"));
          }

          // Fallback to first voice
          if (!bestVoice) {
            bestVoice = voices[0];
          }

          setSelectedVoice(bestVoice);
        }
      };

      loadVoices();

      // Chrome loads voices asynchronously
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [preferredVoices, selectedVoice]);

  // Get emotion-based speech parameters
  const getEmotionParams = useCallback((emotion: SpeechEmotion) => {
    switch (emotion) {
      case "excited":
        return { rate: 1.15, pitch: 1.15 };
      case "calm":
        return { rate: 0.9, pitch: 0.95 };
      case "questioning":
        return { rate: 0.95, pitch: 1.1 };
      case "encouraging":
        return { rate: 1.05, pitch: 1.1 };
      default:
        return { rate: 1, pitch: 1 };
    }
  }, []);

  // Process queue
  const processQueue = useCallback(() => {
    if (queueRef.current.length === 0 || isSpeaking) {
      return;
    }

    const item = queueRef.current.shift();
    if (!item) return;

    const emotionParams = getEmotionParams(item.emotion || "neutral");

    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.rate = item.rate ?? emotionParams.rate * currentRate;
    utterance.pitch = item.pitch ?? emotionParams.pitch * defaultPitch;
    utterance.volume = defaultVolume;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      item.onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      item.onEnd?.();
      // Process next item in queue
      processQueue();
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
      processQueue();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSpeaking, currentRate, defaultPitch, defaultVolume, selectedVoice, getEmotionParams]);

  const speak = useCallback((
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
      voice?: string;
      emotion?: SpeechEmotion;
      onStart?: () => void;
      onEnd?: () => void;
    }
  ) => {
    if (!isSupported) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    queueRef.current = [];

    const emotionParams = getEmotionParams(options?.emotion || "neutral");

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? emotionParams.rate * currentRate;
    utterance.pitch = options?.pitch ?? emotionParams.pitch * defaultPitch;
    utterance.volume = options?.volume ?? defaultVolume;

    // Get available voices and select a good one
    const voices = window.speechSynthesis.getVoices();

    // Try to find preferred voice
    let voice = selectedVoice;
    if (options?.voice) {
      voice = voices.find(v => v.name.includes(options.voice!)) || selectedVoice;
    }

    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      options?.onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      options?.onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, currentRate, defaultPitch, defaultVolume, selectedVoice, getEmotionParams]);

  const queueSpeak = useCallback((item: SpeechQueueItem) => {
    queueRef.current.push(item);
    if (!isSpeaking) {
      processQueue();
    }
  }, [isSpeaking, processQueue]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      queueRef.current = [];
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  const setRate = useCallback((rate: number) => {
    setCurrentRate(Math.max(0.5, Math.min(2, rate)));
  }, []);

  const selectVoice = useCallback((voiceName: string) => {
    const voice = availableVoices.find(v => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
    }
  }, [availableVoices]);

  return {
    isSpeaking,
    isPaused,
    isSupported,
    availableVoices,
    selectedVoice,
    currentRate,
    speak,
    queueSpeak,
    stop,
    pause,
    resume,
    setRate,
    selectVoice,
  };
}

// Hook for combined speech input/output
export function useSpeechInteraction(options?: {
  onTranscript?: (text: string) => void;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
}) {
  const recognition = useSpeechRecognition();
  const tts = useTextToSpeech();

  // Pause listening while speaking
  useEffect(() => {
    if (tts.isSpeaking && recognition.isListening) {
      recognition.stopListening();
    }
  }, [tts.isSpeaking, recognition.isListening]);

  // Callback when transcript changes
  useEffect(() => {
    if (recognition.transcript) {
      options?.onTranscript?.(recognition.transcript);
    }
  }, [recognition.transcript, options]);

  const speakAndListen = useCallback(async (text: string, emotion?: SpeechEmotion) => {
    return new Promise<void>((resolve) => {
      tts.speak(text, {
        emotion,
        onStart: options?.onSpeakStart,
        onEnd: () => {
          options?.onSpeakEnd?.();
          // Start listening after speaking
          setTimeout(() => {
            recognition.resetTranscript();
            recognition.startListening();
            resolve();
          }, 300);
        },
      });
    });
  }, [tts, recognition, options]);

  return {
    ...recognition,
    ...tts,
    speakAndListen,
  };
}
