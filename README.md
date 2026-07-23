# Eloq AI — Practice presentations with AI

Your personal public speaking coach, available 24/7. Record a presentation
— live, spoken, no typing — and get a detailed AI coaching report on
clarity, confidence, structure, pacing, filler words and more, with a
rewritten version of your speech and the questions your audience is likely
to ask. Track your improvement over time.

**Workflow:** Practice → Analyze → Improve.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com) — design tokens, dark mode
- [Supabase](https://supabase.com) — auth (via `@supabase/ssr`) + Postgres with RLS
- [Framer Motion](https://www.framer.com/motion/) — animations
- Web Speech API — live, automatic speech-to-text (no audio upload, no typing)
- OpenAI (`gpt-4o-mini`) coach with a fully-functional heuristic fallback
- Stripe-ready (placeholders)
- Deploys to [Vercel](https://vercel.com) out of the box

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Demo mode (zero config)

Without env vars the app runs fully in **demo mode**: auth is disabled,
sessions are stored in `localStorage`, and the AI coach runs on the
built-in heuristic engine — so the whole practice → analyze → improve loop
works locally out of the box, with real scores and feedback computed from
what you actually said. No API keys required.

Speech-to-text needs a Chromium-based browser (Chrome, Edge) on desktop or
Android — that's where the Web Speech API is available today.

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
├── hooks/               # useSpeechRecorder, useSessions, useUser
├── services/
│   ├── analysis/engine.ts  # transcript statistics: wpm, fillers, structure…
│   └── ai/                 # provider architecture, see below
├── lib/supabase/        # browser/server clients, env config
├── types/               # domain types (AnalysisResult, PracticeSession, …)
├── utils/               # cn, formatters, score helpers
└── proxy.ts             # session refresh + protected routes
supabase/migrations/     # SQL schema
```

## How analysis works

1. **Transcription** — `useSpeechRecorder` streams the browser's
   `SpeechRecognition` API results into a live transcript as the user talks.
   Nothing is ever typed, pasted or uploaded as audio.
2. **Objective stats** — `services/analysis/engine.ts` computes real
   measurements from that transcript: words/minute, filler-word counts by
   language (Spanish and English lexicons), average and longest sentence
   length, discourse connectors, hedging language, evidence markers, and
   intro/body/conclusion detection.
3. **Coaching** — `POST /api/analyze` (transcript + those stats) is handed to
   an `AnalysisProvider`:

```
services/ai/
├── provider.ts              # AnalysisProvider interface + AnalysisRequest
├── heuristic-provider.ts    # turns real stats into scores + content-aware
│                             # feedback — the default, no API key needed
├── openai-provider.ts       # gpt-4o-mini, structured JSON, falls back to
│                             # the heuristic provider on any failure
├── question-bank.ts         # mode-specific audience questions (heuristic)
└── index.ts                 # factory — OpenAI when OPENAI_API_KEY is set
```

Every session is scored 0–100 on 13 dimensions (clarity, confidence,
structure, pace, fluency, filler control, sentence length, organization,
persuasion, naturalness, precision, opening strength, closing quality) and
comes back with a summary, highlights, weaknesses, exactly 5 concrete
recommendations, a rewritten "improved version" of the speech, and 5–10
questions an examiner/investor/interviewer would likely ask — all generated
from what was actually said, never generic filler text.

## Roadmap (architected, not yet built)

Placeholders with `TODO` markers cover: Stripe billing, PDF report export,
achievements, video analysis (eye contact, body language — reserved in the
schema), coach avatars, leaderboards and daily challenges.

## Deployment (Vercel)

Push to GitHub, import the repo in Vercel, add the env vars from
`.env.example`. No extra configuration needed.
