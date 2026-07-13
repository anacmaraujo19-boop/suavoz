import { useState } from "react";
import { Copy, Share2, Volume2, Sparkles, Check, Globe } from "lucide-react";
import { TranslationItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface TranslationBubbleProps {
  lastItem: TranslationItem | undefined;
  interimTranscript: string;
  isTranslating: boolean;
  onRepeatSpeak: (text: string) => void;
}

export function TranslationBubble({
  lastItem,
  interimTranscript,
  isTranslating,
  onRepeatSpeak
}: TranslationBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Falha ao copiar texto: ", e);
    }
  };

  const handleShare = async (item: TranslationItem) => {
    const textToShare = `Original: ${item.originalText}\nTradução (${item.detectedLanguage} -> Português): ${item.translatedText}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tradução Simultânea Live',
          text: textToShare,
        });
      } catch (e) {
        console.warn("Compartilhamento cancelado ou não suportado", e);
      }
    } else {
      // Fallback
      handleCopy(textToShare);
      alert("Texto de tradução copiado para área de transferência! (Compartilhamento nativo indisponível neste navegador)");
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 my-4 min-h-[140px] justify-center">
      <AnimatePresence mode="wait">
        {/* Case 1: Active user speaking right now (Interim Transcript) */}
        {interimTranscript && (
          <motion.div
            key="interim"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="self-start max-w-[85%] bg-indigo-50/50 border border-indigo-100/30 backdrop-blur-md text-gray-700 rounded-2xl rounded-tl-sm py-3.5 px-4 shadow-sm flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shrink-0" />
            <p className="text-sm font-medium italic leading-relaxed text-gray-600">
              "{interimTranscript}..."
            </p>
          </motion.div>
        )}

        {/* Case 2: Gemini is currently translating */}
        {isTranslating && (
          <motion.div
            key="translating"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full bg-white/50 backdrop-blur-md border border-gray-100/80 rounded-2xl p-4 shadow-sm flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold animate-pulse">
              <Sparkles size={14} className="animate-spin-slow" />
              <span>Traduzindo com Gemini 3.5...</span>
            </div>
            {/* Elegant Skeleton loading bar */}
            <div className="w-full h-4 bg-gray-100/80 rounded-full overflow-hidden relative">
              <motion.div
                animate={{ left: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-indigo-200/50 to-transparent"
              />
            </div>
          </motion.div>
        )}

        {/* Case 3: Display last translated phrase */}
        {!isTranslating && !interimTranscript && lastItem && (
          <motion.div
            key={lastItem.id}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="w-full bg-white border border-gray-150/40 rounded-2xl shadow-md shadow-gray-100/30 overflow-hidden"
          >
            {/* Header: Lang to Lang mapping */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/60 border-b border-gray-100/80">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                <Globe size={11} className="text-gray-400" />
                <span>{lastItem.detectedLanguage}</span>
                <span className="text-gray-300">➔</span>
                <span className="text-indigo-600">Português (Brasil)</span>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">
                {lastItem.detectedLanguageCode.toUpperCase()}
              </span>
            </div>

            <div className="p-4 flex flex-col gap-3">
              {/* Original Text (Lightly greyed) */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Texto Original</span>
                <p className="text-sm font-medium text-gray-500 italic leading-relaxed">
                  "{lastItem.originalText}"
                </p>
              </div>

              {/* Separation line */}
              <div className="border-t border-gray-100 my-1" />

              {/* Translated Text (Bold and primary) */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Tradução em Português</span>
                <p className="text-base font-semibold text-gray-900 leading-relaxed">
                  {lastItem.translatedText}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-end gap-1.5 mt-2 pt-2 border-t border-gray-50">
                {/* Repeat Audio Voice */}
                <button
                  onClick={() => onRepeatSpeak(lastItem.translatedText)}
                  className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50/50 border border-transparent hover:border-indigo-100/30 transition-all flex items-center gap-1 text-xs font-semibold"
                  title="Ouvir novamente"
                >
                  <Volume2 size={14} />
                  <span>Falar</span>
                </button>

                {/* Copy Button */}
                <button
                  onClick={() => handleCopy(lastItem.translatedText)}
                  className={`p-2 rounded-xl border transition-all flex items-center gap-1 text-xs font-semibold ${
                    copied 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                      : 'text-gray-500 hover:bg-gray-50 border-transparent hover:border-gray-200'
                  }`}
                  title="Copiar tradução"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={() => handleShare(lastItem)}
                  className="p-2 rounded-xl text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all flex items-center gap-1 text-xs font-semibold"
                  title="Compartilhar tradução"
                >
                  <Share2 size={14} />
                  <span>Compartilhar</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Case 4: No session yet */}
        {!isTranslating && !interimTranscript && !lastItem && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6 px-4"
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200/50 flex items-center justify-center text-gray-400 mx-auto mb-2">
              <Globe size={20} />
            </div>
            <p className="text-sm font-semibold text-gray-500">Nenhuma conversa ativa</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[260px] mx-auto leading-relaxed">
              Toque em "Iniciar Conversa" acima para falar em qualquer idioma. O app ouvirá, traduzirá para Português e falará a resposta.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
