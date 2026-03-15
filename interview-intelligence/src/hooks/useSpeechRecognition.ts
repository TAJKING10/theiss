"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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
  const isListeningRef = useRef(false);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;

      recognition.onresult = (event: any) => {
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

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setError("Microphone access denied. Please allow microphone access.");
          setIsListening(false);
          isListeningRef.current = false;
        } else if (event.error === "no-speech") {
          // Ignore no-speech errors
        } else if (event.error === "aborted") {
          // Ignore aborted errors
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // Auto-restart if still listening
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Ignore if already started
          }
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [continuous, interimResults, language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListeningRef.current) {
      setError(null);
      setTranscript("");
      setInterimTranscript("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
        isListeningRef.current = true;
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      isListeningRef.current = false;
      setIsListening(false);
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }
  }, []);

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

// Text-to-Speech hook - simplified to prevent loops
export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const callbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setIsSupported("speechSynthesis" in window);
  }, []);

  const speak = useCallback((
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
      onEnd?: () => void;
    }
  ) => {
    if (!isSupported || typeof window === "undefined") {
      options?.onEnd?.();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate || 1;
    utterance.pitch = options?.pitch || 1;
    utterance.volume = options?.volume || 1;

    // Get available voices and select a female voice
    const voices = window.speechSynthesis.getVoices();
    // Prefer female voices - look for common female voice names
    const femaleVoice = voices.find(v =>
      v.name.includes("Zira") || // Microsoft Zira (female)
      v.name.includes("Samantha") || // Mac Samantha (female)
      v.name.includes("Victoria") || // Mac Victoria (female)
      v.name.includes("Karen") || // Mac Karen (female)
      v.name.includes("Google UK English Female") ||
      v.name.includes("Google US English") && v.name.includes("Female") ||
      v.name.includes("Female") ||
      v.name.includes("Heera") || // Microsoft Heera (female)
      v.name.includes("Susan") || // Microsoft Susan (female)
      v.name.includes("Hazel") // Microsoft Hazel (female)
    ) || voices.find(v =>
      // Fallback: voices that are typically female
      v.name.includes("Microsoft Zira") ||
      v.name.includes("en-US") && !v.name.includes("David") && !v.name.includes("Mark")
    ) || voices.find(v => v.lang.startsWith("en"));

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    // Store callback
    callbackRef.current = options?.onEnd || null;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (callbackRef.current) {
        callbackRef.current();
        callbackRef.current = null;
      }
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
      if (callbackRef.current) {
        callbackRef.current();
        callbackRef.current = null;
      }
    };

    utteranceRef.current = utterance;

    // Small delay to ensure voices are loaded
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported && typeof window !== "undefined") {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      callbackRef.current = null;
    }
  }, [isSupported]);

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
  };
}
