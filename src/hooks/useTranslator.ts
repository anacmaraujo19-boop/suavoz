import { useState, useEffect, useRef, useCallback } from "react";
import { TranslationItem, VoiceSettings } from "../types";
import { translateText } from "../services/translationService";

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function useTranslator() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [interimTranscript, setInterimTranscript] = useState("");
  const [history, setHistory] = useState<TranslationItem[]>(() => {
    try {
      const saved = localStorage.getItem("translation_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem("voice_settings");
      return saved ? JSON.parse(saved) : { speed: 1.0, volume: 1.0, gender: 'female' };
    } catch {
      return { speed: 1.0, volume: 1.0, gender: 'female' };
    }
  });

  // Common languages support for selection to enforce better recognition if needed
  const [selectedLanguage, setSelectedLanguage] = useState<string>("auto");

  // State flags for the continuous recognition loop
  const recognitionRef = useRef<any>(null);
  const isActiveRef = useRef(false); // Does the user want the conversation session to be active?
  const isSpeakingRef = useRef(false); // Is SpeechSynthesis active right now?
  const isProcessingRef = useRef(false); // Is Gemini actively translating?

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem("translation_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("voice_settings", JSON.stringify(settings));
  }, [settings]);

  // Test the connection state (Gemini API availability)
  useEffect(() => {
    const checkConnection = async () => {
      const clientKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
      
      // Try to probe the backend health, or if in Netlify client mode check VITE key
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: "test" })
        });
        if (res.ok) {
          setConnectionStatus('connected');
          return;
        }
      } catch (e) {
        // Safe to ignore backend failure if we have a client key
      }

      if (clientKey) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    };
    checkConnection();
  }, []);

  // Speak function
  const speakTranslation = useCallback((text: string) => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = settings.speed;
    utterance.volume = settings.volume;

    // Select suitable voice
    const voices = window.speechSynthesis.getVoices();
    const ptVoices = voices.filter(v => v.lang.startsWith("pt"));
    
    let selectedVoice = ptVoices.find(v => v.lang === "pt-BR");

    if (ptVoices.length > 0) {
      if (settings.gender === 'female') {
        // Try to find typical female voice names or defaults
        selectedVoice = ptVoices.find(v => v.name.toLowerCase().includes("maria") || v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("google pt-br")) || ptVoices[0];
      } else if (settings.gender === 'male') {
        selectedVoice = ptVoices.find(v => v.name.toLowerCase().includes("daniel") || v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("google português")) || ptVoices[0];
      } else {
        selectedVoice = ptVoices.find(v => v.lang === "pt-BR") || ptVoices[0];
      }
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    let safetyTimeout: any = null;

    const clearSafetyTimeout = () => {
      if (safetyTimeout) {
        clearTimeout(safetyTimeout);
        safetyTimeout = null;
      }
    };

    const handleSpeechEnd = () => {
      clearSafetyTimeout();
      if (isSpeakingRef.current) {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        // Resume listening if session is active
        setTimeout(() => {
          if (isActiveRef.current && !isProcessingRef.current) {
            startRecognitionEngine();
          }
        }, 300);
      }
    };

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      setIsSpeaking(true);
      // Temporarily stop recognition to avoid feedback
      if (recognitionRef.current && isListening) {
        recognitionRef.current.abort();
      }

      // Safety timeout: recover in case mobile browser never fires onend/onerror
      const estimatedMs = Math.max(3000, (text.length / 12) * 1000 + 4000);
      safetyTimeout = setTimeout(() => {
        console.warn("Safety recovery: Forcing speech end.");
        handleSpeechEnd();
      }, estimatedMs);
    };

    utterance.onend = () => {
      handleSpeechEnd();
    };

    utterance.onerror = (e) => {
      console.warn("SpeechSynthesis error:", e);
      handleSpeechEnd();
    };

    window.speechSynthesis.speak(utterance);
  }, [settings, isListening]);

  // Translate function
  const handleTranslate = useCallback(async (textToTranslate: string) => {
    if (!textToTranslate.trim()) return;

    try {
      setIsTranslating(true);
      isProcessingRef.current = true;

      // Stop listening during API call to be safe
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const result = await translateText(textToTranslate);

      const newItem: TranslationItem = {
        id: crypto.randomUUID(),
        originalText: textToTranslate,
        translatedText: result.translatedText,
        detectedLanguage: result.detectedLanguage,
        detectedLanguageCode: result.detectedLanguageCode,
        timestamp: Date.now()
      };

      setHistory(prev => [newItem, ...prev]);
      
      // Speak the translated result out loud
      speakTranslation(result.translatedText);
    } catch (error: any) {
      console.error(error);
      // In case of error, resume listening if active
      if (isActiveRef.current && !isSpeakingRef.current) {
        startRecognitionEngine();
      }
    } finally {
      setIsTranslating(false);
      isProcessingRef.current = false;
    }
  }, [speakTranslation]);

  // Start Recognition Engine
  const startRecognitionEngine = useCallback(() => {
    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false; // We use false with auto-restart onend for reliable sentence segmenting!
      recognition.interimResults = true;
      
      if (selectedLanguage !== "auto") {
        recognition.lang = selectedLanguage;
      }

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final.trim()) {
          setInterimTranscript("");
          handleTranslate(final);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech Recognition Error:", event.error);
        if (event.error === "not-allowed") {
          isActiveRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
        
        // Auto-restart if session should be active and we are NOT speaking or translating
        setTimeout(() => {
          if (isActiveRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
            startRecognitionEngine();
          }
        }, 300); // 300ms is much safer for mobile audio context release!
      };

      recognition.start();
    } catch (e) {
      console.error("Error starting speech recognition:", e);
    }
  }, [selectedLanguage, handleTranslate]);

  // Start Conversation session
  const startConversation = useCallback(() => {
    if (!SpeechRecognition) {
      alert("O seu navegador não suporta a API de Reconhecimento de Voz. Experimente usar o Google Chrome ou Safari.");
      return;
    }

    // iOS/Android Chrome SpeechSynthesis Pre-Unlock with a user gesture
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const silentUtterance = new SpeechSynthesisUtterance(" ");
        silentUtterance.lang = "pt-BR";
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
      } catch (e) {
        console.warn("Falha ao desbloquear síntese de voz:", e);
      }
    }

    isActiveRef.current = true;
    startRecognitionEngine();
  }, [startRecognitionEngine]);

  // Stop Conversation session
  const stopConversation = useCallback(() => {
    isActiveRef.current = false;
    setIsListening(false);
    setInterimTranscript("");
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Clear translation history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Update Settings
  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Load voices on mount to ensure SpeechSynthesis behaves perfectly
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    isTranslating,
    connectionStatus,
    interimTranscript,
    history,
    settings,
    selectedLanguage,
    setSelectedLanguage,
    startConversation,
    stopConversation,
    clearHistory,
    updateSettings,
    speakTranslation
  };
}
