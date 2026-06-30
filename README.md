<div align="center">

# ✨ Lumos

### Describe your UI. Watch it come to life.

Lumos is an AI studio that turns plain-English prompts into **production-ready React + Tailwind components**, rendered live in a secure sandbox and refined through natural conversation.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-6-black?logo=vercel)](https://sdk.vercel.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## Overview

Lumos closes the gap between an idea and a working component. Type what you want — a pricing
table, a dashboard card, a hero section — and Lumos streams clean, accessible React code while
rendering it live. Keep refining in plain English ("make the header sticky, add a dark variant")
and Lumos edits in place, saving every version so you can roll back anytime.

It works with the models you already trust: **Groq**, **OpenAI**, **Anthropic**, **Google Gemini**,
or a fully **local Ollama** model — and you can bring your own keys, stored only in your browser.

## Features

- 🪄 **Prompt → component** — natural-language generation of React + Tailwind UI.
- ⚡ **Live sandbox preview** — instant rendering via Sandpack with Tailwind preloaded.
- 💬 **Conversational iteration** — refine components with follow-up prompts.
- 🕓 **Version history** — every generation is saved; jump back with one click.
- 🔀 **Multi-provider with auto-fallback** — switch providers on the fly; auto-retry on rate limits.
- 🔑 **Bring your own key** — keys live in your browser and are only forwarded to your chosen provider.
- 🛡️ **Sandboxed & validated** — generated code is statically sanitized before it ever runs.
- 🧱 **Preview / Code tabs**, one-click **copy** and **download** as `.tsx`.
- 🖥️ **Run 100% local** — point at Ollama (`gemma3:4b`) for unlimited, offline generation.

## Tech Stack

| Area        | Choice                                                        |
| ----------- | ------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router, RSC) · React 19                       |
| Styling     | Tailwind CSS v4                                               |
| AI          | Vercel AI SDK (`ai`) + `@ai-sdk/{groq,openai,anthropic,google}` + custom Ollama provider |
| Preview     | `@codesandbox/sandpack-react`                                 |
| Persistence | Prisma 7 + PostgreSQL (`@prisma/adapter-pg`)                  |
| Auth        | Clerk (optional — app runs in open mode if unset)             |
| UX          | Framer Motion, Lucide icons, Sonner toasts                    |

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database ([Neon](https://neon.tech) has a generous free tier)
- At least one AI provider key, **or** [Ollama](https://ollama.com) installed locally

### Installation

```bash
git clone https://github.com/shahriar-ahmed-seam/lumos.git
cd lumos
npm install
cp .env.example .env.local   # then fill in your keys
```

### Configure environment

Edit `.env.local`. The only hard requirement is `DATABASE_URL`; add at least one provider key
(or run Ollama locally).

```dotenv
DATABASE_URL=postgresql://user:password@host:5432/lumos
GROQ_API_KEY=gsk_...            # free tier — recommended default
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_AI_PROVIDER=groq
```

> Keys can also be added in-app (Settings → API Keys). Those are stored in your browser only.

### Database

```bash
npm run db:migrate      # apply migrations (production)
# or, for local development:
npm run db:migrate:dev
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run fully local with Ollama

```bash
ollama pull gemma3:4b
ollama serve
```

Then pick **Local (Ollama)** in the model selector — no API key, no cloud, no rate limits.

## Deployment

### Vercel (recommended)

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — Next.js is detected automatically.
3. Add environment variables (`DATABASE_URL` + any provider keys).
4. Deploy. The build runs `prisma generate && next build`; run `npm run db:migrate` once against your database.

A free Postgres can be created on [Neon](https://neon.tech) and its URL pasted into Vercel.

### Render (all-in-one)

This repo includes a [`render.yaml`](render.yaml) blueprint that provisions a managed Postgres
database and a Node web service. In Render: **New → Blueprint**, point it at your repo, then add
your provider keys in the dashboard.

## Project Structure

```
src/
├── app/
│   ├── api/                # generate, projects, chats, components routes
│   ├── api-keys/           # in-browser key management
│   ├── dashboard/          # the studio (chat + live preview)
│   ├── sign-in, sign-up/   # Clerk auth (optional)
│   ├── layout.tsx          # root layout, theme + optional Clerk provider
│   └── page.tsx            # cinematic landing page
├── components/
│   ├── dashboard/          # studio UI (sidebar, chat, preview, settings, model selector)
│   ├── marketing/          # landing page
│   └── providers/          # theme provider
├── hooks/                  # use-chat-store (client state machine)
└── lib/
    ├── ai/                 # provider config, prompts, rate-limit, Ollama provider
    ├── sandbox/            # code validation + component registry
    ├── marketing/          # curated imagery + attribution
    ├── client-settings.ts  # BYO-key localStorage helpers
    └── db.ts               # Prisma singleton
```

## Security Notes

- API keys entered in-app are stored in `localStorage` and sent only to the same-origin
  `/api/generate` endpoint, which forwards them solely to your chosen AI provider.
- Never commit real secrets. `.env.example` contains placeholders only; `.env*` files are gitignored.
- Generated code is statically sanitized (`src/lib/sandbox/code-validator.ts`) before rendering.

## Credits

- Cinematic hero photography by [Milad Fakurian](https://unsplash.com/@fakurian),
  [Pawel Czerwinski](https://unsplash.com/@pawel_czerwinski), and
  [MagicPattern](https://unsplash.com/@magicpattern) on [Unsplash](https://unsplash.com).

## License

[MIT](LICENSE) © Shahriar Ahmed
