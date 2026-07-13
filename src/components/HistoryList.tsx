import { useState } from "react";
import { Trash2, Copy, Share2, Volume2, Check } from "lucide-react";
import { TranslationItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface HistoryListProps {
  history: TranslationItem[];
  onClearHistory: () => void;
  onRepeatSpeak: (text: string) => void;
}

export function HistoryList({ history, onClearHistory, onRepeatSpeak }: HistoryListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async (item: TranslationItem) => {
    const textToShare = `[Tradução] ${item.originalText} ➔ ${item.translatedText}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tradução',
          text: textToShare,
        });
      } catch (e) {
        console.warn(e);
      }
    } else {
      alert("Texto copiado para o compartilhamento!");
      await navigator.clipboard.writeText(textToShare);
    }
  };

  // Keep the history size compact or scrollable
  if (history.length === 0) return null;

  return (
    <div className="w-full mt-6 border-t border-gray-100/80 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Histórico de Traduções ({history.length})
        </h3>
        <button
          onClick={onClearHistory}
          className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 px-2.5 py-1.5 rounded-xl transition-all border border-transparent hover:border-rose-100/30 flex items-center gap-1"
        >
          <Trash2 size={12} />
          <span>Limpar Histórico</span>
        </button>
      </div>

      <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
        <AnimatePresence initial={false}>
          {history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="bg-gray-50/40 border border-gray-100/80 rounded-xl p-3.5 flex flex-col gap-2 relative group overflow-hidden"
            >
              {/* Meta information */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider bg-white border border-gray-200/40 px-1.5 py-0.5 rounded-md">
                  {item.detectedLanguage} ➔ PT-BR ({item.detectedLanguageCode})
                </span>
                <span className="text-[9px] text-gray-400 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Text pair */}
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-500 leading-relaxed italic">
                  "{item.originalText}"
                </p>
                <p className="text-xs font-bold text-gray-800 leading-relaxed">
                  {item.translatedText}
                </p>
              </div>

              {/* Float micro action toolbar */}
              <div className="flex justify-end gap-1 border-t border-gray-100/40 pt-2 mt-1">
                {/* Speak */}
                <button
                  onClick={() => onRepeatSpeak(item.translatedText)}
                  className="p-1.5 text-indigo-500 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 transition-all"
                  title="Falar tradução"
                >
                  <Volume2 size={12} />
                </button>

                {/* Copy */}
                <button
                  onClick={() => handleCopy(item.id, item.translatedText)}
                  className={`p-1.5 rounded-lg border border-transparent transition-all ${
                    copiedId === item.id 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                      : 'text-gray-400 hover:bg-white hover:border-gray-100'
                  }`}
                  title="Copiar texto"
                >
                  {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                </button>

                {/* Share */}
                <button
                  onClick={() => handleShare(item)}
                  className="p-1.5 text-gray-400 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 transition-all"
                  title="Compartilhar"
                >
                  <Share2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
