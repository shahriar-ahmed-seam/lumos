# Loomos - AI Copilot Instructions

You are an expert Senior Fullstack Engineer. We are building 'Loomos', a Generative UI platform where users describe an interface and AI generates the React component instantly.

## Tech Stack Rules

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS + Shadcn/UI (for the app UI)
- **Icons**: Lucide React (for icons)
- **AI SDK**: Vercel AI SDK (for streaming generation)
- **Sandbox**: @codesandbox/sandpack-react (for live preview)
- **Database**: Prisma + PostgreSQL (for database)
- **Auth**: Clerk (for authentication)

## Code Conventions

1. Always prefer Server Components where possible
2. Use `'use client'` only when hooks are needed
3. Use the `cn()` utility from `@/lib/utils` for Tailwind class merging
4. All AI-related code should use the unified provider from `@/lib/ai`
5. Follow the token-efficient prompting strategy in `@/lib/ai/prompts.ts`

## AI Provider Architecture

The app uses a unified AI provider system that supports:
- **Groq** (FREE tier): `llama-3.3-70b-versatile` (generation), `llama-3.1-8b-instant` (iterations)
- **OpenAI**: `gpt-4o`
- **Anthropic**: `claude-3-5-sonnet`
- **Local Ollama**: `llama3.1`

Use `getModelForTask('generate' | 'iterate', provider)` to get the appropriate model.

## File Structure

```
src/
├── app/
│   ├── api/generate/route.ts   # AI generation endpoint
│   ├── dashboard/              # Main app interface
│   ├── layout.tsx              # Root layout (dark mode)
│   └── page.tsx                # Landing page
├── components/
│   ├── ui/                     # Shadcn components
│   └── ...                     # App components
└── lib/
    ├── ai/                     # AI provider system
    │   ├── models.ts           # Model configuration
    │   ├── prompts.ts          # System prompts
    │   └── rate-limit.ts       # Rate limit handling
    └── utils.ts                # Utilities (cn, etc.)
```

## Key Principles

1. **Token Conservation**: Use smaller models for iterations
2. **Auto-Fallback**: Switch providers on rate limits
3. **Dark Mode First**: Default to dark theme
4. **Streaming**: Always stream AI responses
