export interface TranslationItem {
  id: string;
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  detectedLanguageCode: string;
  timestamp: number;
}

export interface VoiceSettings {
  speed: number;   // 0.5 to 2
  volume: number;  // 0 to 1
  gender: 'male' | 'female' | 'neutral';
}
