import { TranslationItem } from "../types";

export async function translateText(text: string): Promise<Omit<TranslationItem, 'id' | 'timestamp' | 'originalText'>> {
  // 1. Tenta usar o backend seguro primeiro
  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        translatedText: data.translation,
        detectedLanguage: data.detectedLanguage,
        detectedLanguageCode: data.detectedLanguageCode,
      };
    }
    
    // Se o backend retornou erro mas sugeriu fallback ou se deu 404/503
    console.warn("Servidor respondeu com erro. Tentando fallback para cliente...");
  } catch (err) {
    console.warn("Não foi possível conectar ao servidor. Tentando fallback para cliente...", err);
  }

  // 2. Fallback: Chamada direta no cliente usando a chave do usuário se fornecida no ambiente
  const clientApiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
  if (!clientApiKey) {
    throw new Error(
      "Serviço de tradução indisponível. Para uso offline ou estático (Netlify), configure a variável de ambiente VITE_GEMINI_API_KEY no painel de configurações."
    );
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${clientApiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Você é um tradutor simultâneo de alta precisão. 
Traduza o seguinte texto para Português (Brasil).
Identifique o idioma original do texto (nome amigável e código ISO de duas letras).
Se o texto já estiver em Português (Brasil), retorne-o igual, identificando o idioma como Português.

Texto a ser traduzido:
"${text}"`
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              translation: { type: "STRING" },
              detectedLanguage: { type: "STRING" },
              detectedLanguageCode: { type: "STRING" }
            },
            required: ["translation", "detectedLanguage", "detectedLanguageCode"]
          }
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `Erro da API Gemini: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      throw new Error("Formato de resposta inesperado da API do Gemini.");
    }

    const parsed = JSON.parse(resultText.trim());
    return {
      translatedText: parsed.translation,
      detectedLanguage: parsed.detectedLanguage,
      detectedLanguageCode: parsed.detectedLanguageCode,
    };
  } catch (error: any) {
    console.error("Falha na tradução direta via cliente:", error);
    throw new Error(`Falha na tradução automática: ${error.message}`);
  }
}
