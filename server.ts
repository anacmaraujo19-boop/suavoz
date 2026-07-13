import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parsing
app.use(express.json());

// Initialize Gemini SDK securely
let aiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARN: GEMINI_API_KEY is not defined. Falling back to client-side API calls if configured.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API endpoint for translation
app.post("/api/translate", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "O texto para tradução é obrigatório e deve ser uma string." });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({ 
        error: "Serviço de tradução indisponível no servidor (chave de API ausente).", 
        fallbackToClient: true 
      });
      return;
    }

    const promptText = `Você é um tradutor simultâneo de alta precisão. 
Traduza o seguinte texto para Português (Brasil).
Identifique o idioma original do texto (nome amigável e código ISO de duas letras).
Se o texto já estiver em Português (Brasil), retorne-o igual, identificando o idioma como Português.

Texto a ser traduzido:
"${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translation: {
              type: Type.STRING,
              description: "The translated text in Brazilian Portuguese."
            },
            detectedLanguage: {
              type: Type.STRING,
              description: "The friendly name of the detected language, capitalized, in Portuguese (e.g., 'Inglês', 'Espanhol', 'Francês', 'Alemão', 'Português')."
            },
            detectedLanguageCode: {
              type: Type.STRING,
              description: "The 2-letter ISO language code (e.g., 'en', 'es', 'fr', 'de', 'pt')."
            }
          },
          required: ["translation", "detectedLanguage", "detectedLanguageCode"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Resposta vazia recebida do Gemini.");
    }

    const result = JSON.parse(resultText.trim());
    res.json(result);
  } catch (error: any) {
    console.error("Erro na rota de tradução:", error);
    res.status(500).json({ error: error.message || "Erro interno ao traduzir o áudio." });
  }
});

// Setup Vite or static serving based on environment
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupServer();
