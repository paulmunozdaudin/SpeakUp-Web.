# Orato AI — Practice presentations with AI

Your personal public speaking coach, available 24/7. Record a presentation,
get instant AI feedback on clarity, confidence, pacing and delivery, and
track your improvement over time.

**Workflow:** Practice → Analyze → Improve.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com) — design tokens, dark mode
- [Supabase](https://supabase.com) — auth (via `@supabase/ssr`) + Postgres with RLS
- [Framer Motion](https://www.framer.com/motion/) — animations
- OpenAI integration (placeholder provider, see below)
- Stripe-ready (placeholders)
- Deploys to [Vercel](https://vercel.com) out of the box

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Demo mode (zero config)

Without env vars the app runs fully in **demo mode**: auth is disabled and
sessions are stored in `localStorage`, so the whole practice → analyze →
improve loop works locally out of the box.

### Full setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/00001_initial_schema.sql` in the SQL editor
   (creates `profiles` + `practice_sessions` with RLS and a signup trigger).
3. Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Restart the dev server — signup, login, password reset and per-user session
storage are now live.

## Project structure

```
src/
├── app/
│   ├── (auth)/          # login, signup, forgot/reset password
│   ├── (app)/           # protected: dashboard, practice, results, history, profile
│   ├── api/analyze/     # server-side AI analysis endpoint
│   ├── auth/callback/   # Supabase code exchange
│   └── page.tsx         # landing page
├── components/          # ui kit + feature components (landing, dashboard, …)
├── hooks/               # useRecorder, useSessions, useUser
├── services/            # auth, sessions, analysis + ai/ provider architecture
├── lib/supabase/        # browser/server clients, env config
├── types/               # domain types (AnalysisResult, PracticeSession, …)
├── utils/               # cn, formatters, score helpers
└── proxy.ts             # session refresh + protected routes
supabase/migrations/     # SQL schema
```

## AI architecture

Analysis runs server-side behind `POST /api/analyze` so vendor keys never
reach the browser. Providers implement a single interface:

```
services/ai/
├── provider.ts        # AnalysisProvider interface + AnalysisRequest
├── mock-provider.ts   # deterministic mock (active today)
├── openai-provider.ts # TODO(ai): Whisper transcription + LLM structured output
└── index.ts           # factory — flip USE_OPENAI when the pipeline lands
```

`AnalysisResult` already models every metric (clarity, confidence, pace,
structure, persuasiveness, vocabulary, filler words) plus reserved fields
for future video analysis (eye contact, body language), so shipping the real
provider requires no UI changes.

## Roadmap (architected, not yet built)

Practice modes for interviews, startup pitches, school, TED talks, sales and
language exams already exist as an extensible enum. Placeholders with `TODO`
markers cover: Stripe billing, PDF reports, achievements, video analysis,
coach avatars, leaderboards, daily challenges and AI-generated practice
questions.

## Deployment (Vercel)

Push to GitHub, import the repo in Vercel, add the env vars from
`.env.example`. No extra configuration needed.
