# Tradutor Simultâneo Live 🎙️✨

Um aplicativo da web progressivo (PWA) de tradução simultânea, moderno, responsivo e altamente fluido. Ele escuta continuamente o áudio em qualquer idioma falado, detecta automaticamente o idioma e traduz instantaneamente para **Português (Brasil)** com exibição de texto e leitura em voz alta.

Inspirado na estética minimalista e refinada da Apple, o design é focado na simplicidade, elegância, usabilidade e baixíssima latência.

---

## ✨ Funcionalidades principais

- 🎙️ **Conversação contínua (mãos livres)**: O aplicativo escuta sem interrupções. Ele detecta pausas naturais na fala, envia o áudio para o Gemini, traduz e fala o resultado sem exigir cliques repetitivos.
- 🌎 **Detecção automática de idioma**: Traduza de qualquer idioma do mundo suportado pelo Gemini para o Português (Brasil).
- 🔊 **Text-to-Speech integrado**: Leitura automatizada das traduções usando vozes brasileiras de alta definição (Web Speech API).
- 🎨 **Design inspirado na Apple**: Interface minimalista com cantos arredondados, fundo claro e glassmorphism refinado.
- ⚡ **Pulsador e Soundwaves dinâmicos**: Feedback visual e animações fluidas para indicar o estado de escuta.
- 🗄️ **Histórico completo**: Histórico das traduções anteriores com controle individual de escuta, cópia de texto e compartilhamento nativo do dispositivo.
- ⚙️ **Configurações avançadas de voz**: Controle em tempo real do volume, velocidade da voz (speed) e gênero da voz (Feminino, Masculino ou Padrão).
- 📲 **PWA Completo**: Instalável no Android, iPhone (iOS), macOS e Windows com Service Worker de carregamento offline acelerado.
- 🔒 **Arquitetura Híbrida Segura**: Rota segura no servidor Express para chamadas de API com fallback transparente para o cliente quando implantado em plataformas estáticas (como Netlify).

---

## 🛠️ Tecnologias Utilizadas

- **React 19** & **Vite 6**
- **TypeScript**
- **Tailwind CSS v4** (estilização moderna e otimizada)
- **Motion** (para micro-animações fluidas e transições suaves)
- **Express** (como servidor full-stack integrado)
- **Gemini 3.5 Flash** (via SDK `@google/genai` oficial)
- **Web Speech Synthesis API** & **MediaDevices API**

---

## 🚀 Como Executar Localmente

### 1. Clonar e Instalar as dependências

```bash
npm install
```

### 2. Configurar a Chave da API Gemini

Renomeie ou crie o arquivo `.env` a partir do `.env.example` e insira sua chave da API Gemini:

```env
GEMINI_API_KEY="SUA_CHAVE_AQUI"
# Para deploy no Netlify ou estático:
VITE_GEMINI_API_KEY="SUA_CHAVE_AQUI"
```

### 3. Executar o Servidor de Desenvolvimento

```bash
npm run dev
```

---

## 📦 Como Compilar e Implantar no Netlify

O projeto está configurado para implantação direta e automática no **Netlify** através do arquivo `netlify.toml` incluído na raiz.

Para compilar localmente:

```bash
npm run build
```

Isso gerará a pasta `dist/` contendo todo o aplicativo otimizado e pronto para ser servido estaticamente no Netlify.

---

## 📄 Licença

Este projeto é disponibilizado sob a licença **Apache-2.0**.
