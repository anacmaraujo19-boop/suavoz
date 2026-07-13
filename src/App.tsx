import { useState, useEffect } from "react";
import { useTranslator } from "./hooks/useTranslator";
import { Header } from "./components/Header";
import { SettingsPanel } from "./components/SettingsPanel";
import { Visualizer } from "./components/Visualizer";
import { TranslationBubble } from "./components/TranslationBubble";
import { HistoryList } from "./components/HistoryList";
import { Sparkles, Download, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const {
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
  } = useTranslator();

  const [showSettings, setShowSettings] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Monitor PWA Installability
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  // Register PWA Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("Service Worker registrado com sucesso: ", reg.scope);
          })
          .catch((err) => {
            console.error("Falha ao registrar o Service Worker: ", err);
          });
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-start py-8 px-4 sm:px-6 md:px-8 selection:bg-indigo-150 font-sans">
      {/* Decorative background glow elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute -top-[150px] left-[10%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-indigo-300 to-indigo-100 blur-[80px]" />
        <div className="absolute -top-[180px] right-[10%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-fuchsia-300 to-fuchsia-100 blur-[80px]" />
      </div>

      {/* Main app container */}
      <main className="relative z-10 w-full max-w-lg bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[32px] shadow-2xl shadow-gray-200/60 overflow-hidden flex flex-col min-h-[620px]">
        {/* App Header */}
        <Header
          connectionStatus={connectionStatus}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          onToggleSettings={() => setShowSettings(!showSettings)}
          showSettings={showSettings}
        />

        {/* Content Body */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Slide-out settings */}
          <AnimatePresence>
            {showSettings && (
              <SettingsPanel
                settings={settings}
                onUpdateSettings={updateSettings}
              />
            )}
          </AnimatePresence>

          {/* Central Microphone & Pulse waves */}
          <Visualizer
            isListening={isListening}
            onStart={startConversation}
            onStop={stopConversation}
          />

          {/* Core active translation block */}
          <TranslationBubble
            lastItem={history[0]}
            interimTranscript={interimTranscript}
            isTranslating={isTranslating}
            onRepeatSpeak={speakTranslation}
          />

          {/* PWA Install Promo banner */}
          <AnimatePresence>
            {isInstallable && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-4 mb-2 bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 border border-indigo-100/50 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-gray-100 shrink-0">
                    <Download size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">Instale no seu aparelho</h4>
                    <p className="text-[10px] text-gray-500 font-medium">Use offline com rapidez direto da tela inicial</p>
                  </div>
                </div>
                <button
                  onClick={handleInstallPWA}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] px-3.5 py-2 rounded-xl transition-all shadow-sm shadow-indigo-600/10 shrink-0"
                >
                  Instalar
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Translation history list */}
          <HistoryList
            history={history}
            onClearHistory={clearHistory}
            onRepeatSpeak={speakTranslation}
          />
        </div>

        {/* Footer info tag */}
        <footer className="w-full text-center py-4 px-6 border-t border-gray-50 bg-gray-50/30 flex items-center justify-center gap-1.5">
          <Info size={11} className="text-gray-400" />
          <p className="text-[10px] text-gray-400 font-medium">
            Desenvolvido com a tecnologia de IA de ponta do Gemini 3.5 Flash
          </p>
        </footer>
      </main>

      {/* Safari PWA helpful hint */}
      <p className="mt-4 text-[10px] text-gray-400/80 font-medium text-center max-w-[280px]">
        No iPhone (Safari), use o menu de compartilhamento e selecione "Adicionar à Tela de Início".
      </p>
    </div>
  );
}
