# Promo Eloq AI (TikTok / Reels / Shorts)

Vertical 1080×1920, 33 s, 30 fps, French captions. Composition `Promo` in
`src/promo/Promo.tsx`; timings and caption texts in `src/promo/timeline.ts`.

| Command | What it does |
|---|---|
| `npm run promo` | Renders `out/eloq-promo.mp4` (music + sound effects) |
| `npm run promo:sfx-only` | Same cut without music |
| `npm run promo:cover` | Renders the cover `out/eloq-promo-cover.png` |
| `npm run studio` | Opens Remotion Studio to edit and preview |
| `npm run promo:audio` | Regenerates `public/promo/music.wav` and `sfx.wav` |
| `npm run promo:capture` | Re-captures the app screens (see below) |

## Assets (`public/promo/`)

- **App screens** — real captures of Eloq in French, dark theme, phone
  viewport, taken by `scripts/capture-promo.cjs` against a local dev server
  (`npm run dev` in the repo root, then
  `NODE_PATH=$(npm root -g) node scripts/capture-promo.cjs`). The microphone
  is Chromium's fake device, so the transcript is a fixed French speech; the
  scores shown are the ones the app's analysis engine computes for it.
  `frames.json` holds the frame timings and the position of each metric card.
- **Music and sound effects** — synthesised from scratch by
  `scripts/make-promo-audio.py` (numpy only, no samples), so there is no
  third-party audio to license.
- **Fonts** — Inter (`public/fonts`), SIL Open Font License.

To change a caption, edit `CAPTIONS` in `src/promo/timeline.ts`. If you move
a timing in `T`, move the matching sound cue in `make-promo-audio.py` and
run `npm run promo:audio`.
