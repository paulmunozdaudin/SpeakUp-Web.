# Promo Eloq AI (TikTok / Reels / Shorts)

Vertical 1080×1920, 30 fps, captions on screen, one variant per language:

- **French** (`Promo`, 34.5 s, with voice-over) — students preparing the Brevet, Bac de Français
  and Grand Oral.
- **Spanish** (`PromoEs`, 30 s) — presentations, investor pitches, interviews
  and the daily challenges.

Scenes live in `src/promo/Promo.tsx`; timings, texts and which captures each
variant uses are in `src/promo/timeline.ts`.

| Command | What it does |
|---|---|
| `npm run promo` / `npm run promo:es` | Renders `out/eloq-promo.mp4` / `out/eloq-promo-es.mp4` (music + sound effects) |
| `npm run promo:sfx-only` / `npm run promo:es:sfx-only` | Same cuts without music |
| `npm run promo:cover` / `npm run promo:es:cover` | Renders the covers |
| `npm run studio` | Opens Remotion Studio to edit and preview |
| `npm run promo:audio` | Regenerates `music.wav` and `sfx.wav` for both variants |
| `npm run promo:capture` | Re-captures the app screens (see below) |

## Assets (`public/promo/` French, `public/promo-es/` Spanish)

- **App screens** — real captures of Eloq, dark theme, phone
  viewport, taken by `scripts/capture-promo.cjs` against a local dev server
  (`npm run dev` in the repo root, then
  `NODE_PATH=$(npm root -g) node scripts/capture-promo.cjs`, with
  `PROMO_LOCALE=es` for Spanish). The microphone is Chromium's fake device,
  so the transcript is a fixed speech in that language; the
  scores shown are the ones the app's analysis engine computes for it.
  `frames.json` holds the frame timings and the position of each metric card.
- **Voice-over (French)** — `public/promo/voice.wav`, an ElevenLabs recording
  of the script. `PROMO_FR.voice.clips` in `timeline.ts` cuts it into phrases
  and places each on its scene; pass `--props` with `"voice":false` to
  render without it.
- **Music and sound effects** — synthesised from scratch by
  `scripts/make-promo-audio.py` (numpy only, no samples), so there is no
  third-party audio to license.
- **Fonts** — Inter (`public/fonts`), SIL Open Font License.

To change a text, edit the variant (`PROMO_FR` / `PROMO_ES`) in
`src/promo/timeline.ts`. If you move a timing, mirror it in `VARIANTS` in
`make-promo-audio.py` and run `npm run promo:audio`.
