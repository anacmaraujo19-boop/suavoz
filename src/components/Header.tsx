import { Wifi, WifiOff, Languages, Settings } from "lucide-react";

interface HeaderProps {
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  onToggleSettings: () => void;
  showSettings: boolean;
}

const LANGUAGES = [
  { code: "auto", name: "Detectar Idioma" },
  { code: "en-US", name: "Inglês (EUA)" },
  { code: "es-ES", name: "Espanhol" },
  { code: "fr-FR", name: "Francês" },
  { code: "de-DE", name: "Alemão" },
  { code: "it-IT", name: "Italiano" },
  { code: "ja-JP", name: "Japonês" },
  { code: "zh-CN", name: "Chinês" },
  { code: "pt-BR", name: "Português" },
];

export function Header({
  connectionStatus,
  selectedLanguage,
  setSelectedLanguage,
  onToggleSettings,
  showSettings
}: HeaderProps) {
  return (
    <header className="w-full flex items-center justify-between py-4 px-6 border-b border-gray-100/80 bg-white/40 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Languages size={18} />
        </div>
        <div>
          <h1 className="text-base font-semibold text-gray-900 tracking-tight">Tradutor Live</h1>
          <p className="text-[10px] text-gray-400 font-medium">Conversa Inteligente</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Connection Status Badge */}
        <div 
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase transition-all duration-300 ${
            connectionStatus === 'connected' 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
              : connectionStatus === 'connecting'
              ? 'bg-amber-50 text-amber-600 border border-amber-100'
              : 'bg-rose-50 text-rose-600 border border-rose-100'
          }`}
        >
          {connectionStatus === 'connected' ? (
            <>
              <Wifi size={10} className="animate-pulse" />
              <span>Conectado</span>
            </>
          ) : connectionStatus === 'connecting' ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              <span>Conectando</span>
            </>
          ) : (
            <>
              <WifiOff size={10} />
              <span>Sem Conexão</span>
            </>
          )}
        </div>

        {/* Language Selection Select */}
        <div className="relative flex items-center bg-gray-50/80 hover:bg-gray-100/80 border border-gray-200/50 rounded-full px-2.5 py-1 transition-all">
          <Languages size={12} className="text-gray-500 mr-1" />
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-transparent text-xs font-medium text-gray-700 focus:outline-none pr-1 cursor-pointer appearance-none"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Settings Toggle Button */}
        <button
          onClick={onToggleSettings}
          className={`p-2 rounded-full transition-all border ${
            showSettings 
              ? 'bg-indigo-50 border-indigo-100 text-indigo-600' 
              : 'bg-gray-50 hover:bg-gray-100 border-gray-200/50 text-gray-600'
          }`}
          aria-label="Configurações de Voz"
        >
          <Settings size={16} className={showSettings ? "animate-spin-slow" : ""} />
        </button>
      </div>
    </header>
  );
}
