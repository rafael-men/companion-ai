# Companion AI

Um **companheiro virtual em 3D** renderizado em tempo real que conversa com você através de um chat conectado a um modelo de linguagem (LLM), com voz humanizada, animações faciais e busca na web.

## ✨ Funcionalidades

### Conversa com IA
- **Chat com LLM** via [Groq](https://groq.com/) (modelo `qwen/qwen3.8-27b`), com respostas rápidas.
- **Memória de contexto** — o histórico inteiro da conversa é enviado ao modelo, então o companheiro lembra do que foi dito antes.
- **Busca na web (RAG)** — perguntas factuais/atuais disparam uma busca via [Tavily](https://tavily.com); os resultados são injetados no contexto para respostas embasadas.
- **Personalidades** selecionáveis (Amigável, Profissional, Engraçado, Sarcástico) que alteram o tom das respostas.
- **Respostas humanizadas** — prompt afinado para soar como um amigo real: frases curtas, naturais, sem listas, títulos ou tom de manual.
- **Saudação contextual** — cumprimenta conforme a hora do dia e comenta quando você volta depois de um tempo, com frases variadas.
- **Nome do usuário** — você se identifica e o companheiro te chama pelo nome.
- **Tratamento de erros amigável** — mensagens claras para falhas de chave (401), modelo (404) ou limite de uso (429).

### Avatar 3D
- **Renderização VRM** com [Three.js](https://threejs.org/) + [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) e [@pixiv/three-vrm](https://github.com/pixiv/three-vrm). Suporta VRM 0.x e 1.0.
- **Seleção de modelo** — dropdown com os avatares da pasta `public/models/`.
- **Lip-sync por vogais** — a boca articula as vogais (A/I/U/E/O) estimadas a partir do texto enquanto o avatar "fala".
- **Olhar que acompanha** — a cabeça segue suavemente o cursor do mouse.
- **Gestos de cabeça** — acena (sim) ou nega (não) conforme o conteúdo da resposta.
- **Animação procedural** — respiração, balanço sutil do corpo e piscar automáticos.
- **Reação ao toque** — clicar no avatar faz ele fechar os olhos e reagir com uma fala.
- **Animações VRMA** — emotes animados em `public/assets/animations/` via [@pixiv/three-vrm-animation](https://github.com/pixiv/three-vrm-animation), com crossfade suave entre animações.
- **Seletor de emotes** — dropdown na sidebar para tocar qualquer animação VRMA (em loop ou uma única vez).
- **Saudação animada** — ao abrir o app ou trocar de avatar, o personagem executa o emote de cumprimento (`VRMA_01.vrma`) uma única vez antes de voltar às animações procedurais.
- **Pose natural ajustável** — braços baixados (saindo da T-pose) com ângulo controlável por slider (compatível com rigs diferentes).
- **Orientação automática** — modelos VRM 0.x são girados para ficar de frente para a câmera.

### Interface
- **Tema Liquid Glass** roxo, com efeito de vidro fosco (backdrop-blur) em painéis e balões.
- **Modo claro / escuro** — alternável e persistido; respeita a preferência do sistema na primeira visita.
- **Fundos de tela** — galeria de miniaturas para escolher uma imagem de fundo (de `public/assets/`).
- **Sidebar retrátil** — coluna fina no desktop que expande; no celular vira um menu com botão hambúrguer.
- **Salvamento automático** das configurações (avatar, personalidade, pose) no `localStorage`.
- **Design system** com [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + ícones [lucide-react](https://lucide.dev/).
- **Layout responsivo** — adapta-se de telas de celular a desktop.

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Build / dev | Vite 7 |
| UI | React 19 |
| Estilo | Tailwind CSS 4 + shadcn/ui |
| Ícones | lucide-react |
| 3D | three, @react-three/fiber, @react-three/drei |
| VRM | @pixiv/three-vrm |
| Animação VRM | @pixiv/three-vrm-animation |
| IA | Groq API (compatível com OpenAI) |
| Busca web | Tavily API |

## 🚀 Como rodar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar as chaves de API
Crie um arquivo `.env` na raiz (use `.env.example` como base):
```env
VITE_GROQ_KEY=sua-chave-do-groq
VITE_TAVILY_KEY=sua-chave-da-tavily   # opcional, para busca web
```
> Groq: chave grátis em [console.groq.com](https://console.groq.com/keys). Tavily: [tavily.com](https://tavily.com).

### 3. Rodar em desenvolvimento
```bash
npm run dev
```
Acesse o endereço exibido no terminal (geralmente `http://localhost:5173`).

## 📦 Scripts

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento com hot-reload |
| `npm run build` | Gera a build de produção em `dist/` |
| `npm run preview` | Pré-visualiza a build de produção |
| `npm run lint` | Roda o ESLint |
| `npm run models` | Regenera a lista de avatares a partir de `public/models/` |
| `npm run animations` | Regenera a lista de animações a partir de `public/assets/animations/` |
| `npm run backgrounds` | Regenera a lista de fundos a partir de `public/assets/` |

## 🎭 Adicionar conteúdo

**Novo avatar:** coloque o `.vrm` em `public/models/` e rode `npm run models`.

**Novo fundo:** coloque a imagem em `public/assets/` e rode `npm run backgrounds`.

**Nova animação:** coloque o arquivo `.vrma` em `public/assets/animations/` e rode `npm run animations`.

> Os modelos precisam ser **VRM** (não GLB/FBX). Modelos com rig humanoide e *blendshapes* de boca (`A I U E O`) aproveitam o lip-sync e as animações. Para animações, use o formato **VRM Animation (`.vrma`)** — idealmente capturadas/exportadas para o mesmo rig do modelo.

## 📁 Estrutura

```
src/
├── App.jsx                  # Orquestra os componentes e o estado global
├── components/
│   ├── ChatBox.jsx          # Campo de envio de mensagem
│   ├── ChatHistory.jsx      # Balões da conversa + indicador "digitando"
│   ├── ThreeViewer.jsx      # Cena 3D (Canvas, luzes, câmera)
│   ├── VRMAvatar.jsx        # Carrega e anima o avatar VRM
│   ├── SidePanel.jsx        # Sidebar (orquestra os subcomponentes)
│   ├── sidebar/             # Subcomponentes da sidebar
│   └── ui/                  # Componentes do shadcn/ui
├── hooks/
│   ├── useChat.js           # Estado e lógica da conversa
│   ├── useTextLipSync.js    # Gera intensidades de vogais a partir do texto
│   └── useDarkMode.js       # Alterna e persiste o tema claro/escuro
└── lib/
    ├── llm.js               # Comunicação com o LLM (Groq) + injeção de busca
    ├── websearch.js         # Busca web (Tavily) e heurística de quando buscar
    ├── vrm.js               # Pose, animação, lip-sync e expressões do VRM
    ├── vrma.js              # Carrega e reproduz animações VRMA (mixer, crossfade, término)
    ├── animations.js        # Lista de animações VRMA (gerada)
    ├── gesto.js             # Detecta gesto de cabeça (sim/não) na resposta
    ├── saudacao.js          # Saudação contextual (hora do dia + ausência)
    ├── models.js            # Lista de avatares (gerada)
    ├── backgrounds.js       # Lista de fundos (gerada)
    ├── personalidades.js    # Personalidades disponíveis
    └── utils.js             # Utilitário cn() do shadcn
```

## ⚠️ Notas

- As chaves de API ficam no front-end (app sem backend), então **vão no bundle**. Para produção, o ideal é um backend/proxy que guarde as chaves. Nunca commite o `.env` (já está no `.gitignore`).
- O free tier das APIs tem limite de requisições; em caso de erro **429**, aguarde ou adicione saldo/cota.
- O lip-sync é estimado a partir do texto (não áudio real) — uma aproximação convincente, mas não fonéticamente perfeita.
