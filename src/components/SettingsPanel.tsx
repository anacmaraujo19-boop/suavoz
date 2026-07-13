import { Volume2, VolumeX, Gauge, User, Check } from "lucide-react";
import { VoiceSettings } from "../types";
import { motion } from "motion/react";

interface SettingsPanelProps {
  settings: VoiceSettings;
  onUpdateSettings: (settings: Partial<VoiceSettings>) => void;
}

export function SettingsPanel({ settings, onUpdateSettings }: SettingsPanelProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="w-full bg-white/80 backdrop-blur-xl border border-gray-150/50 rounded-2xl p-5 shadow-lg shadow-gray-200/40 mb-6"
    >
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
        Configurações da Voz do Tradutor
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Volume setting */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              {settings.volume === 0 ? <VolumeX size={14} className="text-gray-400" /> : <Volume2 size={14} className="text-indigo-500" />}
              Volume da Leitura
            </label>
            <span className="text-[10px] font-mono font-medium text-gray-400">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <VolumeX size={12} className="text-gray-400" />
            <input 
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => onUpdateSettings({ volume: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
            />
            <Volume2 size={12} className="text-gray-500" />
          </div>
        </div>

        {/* Speed setting */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Gauge size={14} className="text-indigo-500" />
              Velocidade da Voz
            </label>
            <span className="text-[10px] font-mono font-medium text-gray-400">
              {settings.speed.toFixed(1)}x
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold text-gray-400">0.5x</span>
            <input 
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.speed}
              onChange={(e) => onUpdateSettings({ speed: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
            />
            <span className="text-[10px] font-semibold text-gray-500">2.0x</span>
          </div>
        </div>

        {/* Voice Gender option */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <User size={14} className="text-indigo-500" />
            Gênero da Voz (PT-BR)
          </label>
          <div className="flex gap-2">
            {(['female', 'male', 'neutral'] as const).map((gender) => {
              const labelMap = { female: 'Feminino', male: 'Masculino', neutral: 'Padrão' };
              const active = settings.gender === gender;
              return (
                <button
                  key={gender}
                  onClick={() => onUpdateSettings({ gender })}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
                    active 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/10' 
                      : 'bg-gray-50/80 hover:bg-gray-100/80 border-gray-200 text-gray-600'
                  }`}
                >
                  {active && <Check size={10} strokeWidth={3} />}
                  {labelMap[gender]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
