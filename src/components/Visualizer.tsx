import { motion } from "motion/react";
import { Mic, MicOff } from "lucide-react";

interface VisualizerProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function Visualizer({ isListening, onStart, onStop }: VisualizerProps) {
  // Generate random animations for soundwave bars
  const waveBars = [
    { delay: 0.1, duration: 1.2 },
    { delay: 0.3, duration: 0.9 },
    { delay: 0.0, duration: 1.4 },
    { delay: 0.4, duration: 1.0 },
    { delay: 0.2, duration: 1.3 },
    { delay: 0.5, duration: 0.8 },
    { delay: 0.1, duration: 1.1 },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-6">
      {/* Visualizer Pulsating Wave Circle */}
      <div className="relative flex items-center justify-center">
        {isListening && (
          <>
            {/* Soft glowing ripple rings */}
            <motion.div
              animate={{ scale: [1, 1.8, 1], opacity: [0.15, 0, 0.15] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute w-44 h-44 rounded-full bg-indigo-500/10 border border-indigo-500/20"
            />
            <motion.div
              animate={{ scale: [1, 2.5, 1], opacity: [0.1, 0, 0.1] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
              className="absolute w-44 h-44 rounded-full bg-fuchsia-500/5 border border-fuchsia-500/10"
            />
          </>
        )}

        {/* Central Core Button */}
        <motion.button
          onClick={isListening ? onStop : onStart}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-500 ${
            isListening 
              ? 'bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-indigo-500/30' 
              : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-150/40 shadow-gray-200/50'
          }`}
          aria-label={isListening ? "Parar Conversa" : "Iniciar Conversa"}
        >
          {isListening ? (
            <div className="flex flex-col items-center justify-center gap-1">
              <Mic size={36} className="animate-pulse" />
              <span className="text-[11px] font-bold tracking-wider uppercase opacity-90">Ouvindo</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-1">
                <Mic size={24} />
              </div>
              <span className="text-xs font-semibold text-gray-600 tracking-tight">Iniciar Conversa</span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Soundwaves bar animation */}
      <div className="h-10 flex items-center justify-center gap-1.5 mt-8">
        {isListening ? (
          waveBars.map((bar, i) => (
            <motion.div
              key={i}
              animate={{ height: ["12px", "36px", "12px"] }}
              transition={{ 
                repeat: Infinity, 
                duration: bar.duration, 
                delay: bar.delay, 
                ease: "easeInOut" 
              }}
              className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-fuchsia-500"
            />
          ))
        ) : (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <span className="text-xs text-gray-400 font-medium ml-1">Pronto para falar</span>
          </div>
        )}
      </div>
    </div>
  );
}
