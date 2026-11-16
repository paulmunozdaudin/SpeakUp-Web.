import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/fonts";
import { PROMO_FR, PROMO_VARIANTS, type Caption, type PromoConfig, type PromoLocale, type Rect, type Screen } from "./timeline";

/**
 * Launch promo for Eloq AI (9:16, one variant per language — see
 * timeline.ts). Every app screen is a real
 * capture of the product (scripts/capture-promo.cjs); the rest is motion
 * design in the app's own palette.
 */
export interface PromoProps {
  /** false renders the cut with sound effects only. */
  music: boolean;
  locale: PromoLocale;
  [key: string]: unknown;
}

const Config = React.createContext<PromoConfig>(PROMO_FR);
const useCfg = () => React.useContext(Config);

const font = "Inter";
for (const subset of ["latin", "latin-ext"]) {
  loadFont({ family: font, url: staticFile(`fonts/inter-${subset}.woff2`), weight: "100 900" });
}

// Palette lifted from the app's dark theme (src/app/globals.css) and logo.
const BG = "#07070b";
const SURFACE = "#131316";
const BORDER = "#27272a";
const MUTED = "#a1a1aa";
const ACCENT = "#6366f1";
const VIOLET = "#a996fb";
const BLUE = "#60a5fa";
const SUCCESS = "#22c55e";
const WARNING = "#f59e0b";
const GRADIENT = `linear-gradient(95deg, ${VIOLET} 0%, #818cf8 45%, ${BLUE} 100%)`;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** Hooks every scene uses: time in seconds plus ramp / spring helpers. */
function useClock() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const ramp = (from: number, to: number, a = 0, b = 1, easing = ease) =>
    interpolate(t, [from, to], [a, b], { ...clamp, easing });
  const pop = (at: number, damping = 14, stiffness = 170) =>
    spring({ frame: frame - at * fps, fps, config: { damping, stiffness, mass: 0.8 } });
  return { frame, fps, t, ramp, pop };
}

/** Resolves a file in the current variant's asset folder. */
const useAsset = () => {
  const { dir } = useCfg();
  return (name: string) => staticFile(`${dir}/${name}`);
};

// ── Backdrop ────────────────────────────────────────────────────────────────
const Backdrop: React.FC = () => {
  const { t, ramp } = useClock();
  const { T } = useCfg();
  const drift = (speed: number, phase: number) => Math.sin(t * speed + phase);
  // The glow swells when the beat drops and on the call to action.
  const energy = 0.55 + 0.45 * ramp(T.reveal - 0.2, T.reveal + 0.4) - 0.15 * ramp(T.cta, T.cta + 1);
  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1300,
          height: 1300,
          left: -350 + drift(0.35, 0) * 120,
          top: -300 + drift(0.27, 1) * 140,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(99,102,241,${0.5 * energy}) 0%, rgba(99,102,241,0) 62%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          right: -420 + drift(0.3, 2) * 130,
          bottom: -260 + drift(0.22, 3) * 150,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(59,130,246,${0.36 * energy}) 0%, rgba(59,130,246,0) 62%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: 90 + drift(0.2, 4) * 90,
          top: 620 + drift(0.31, 5) * 110,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(169,150,251,${0.16 * energy}) 0%, rgba(169,150,251,0) 60%)`,
        }}
      />
      {/* Fine grid, fading towards the edges */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          backgroundPosition: `0 ${-(t * 12) % 90}px`,
          maskImage: "radial-gradient(ellipse 75% 60% at 50% 45%, black 20%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 60% at 50% 45%, black 20%, transparent 80%)",
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

// ── Text ────────────────────────────────────────────────────────────────────
const gradientText: React.CSSProperties = {
  backgroundImage: GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

/** Words rise in one after another; `out` (0→1) blurs the block away. */
const Kinetic: React.FC<{
  lines: string[];
  at: number;
  size: number;
  accent?: string[];
  out?: number;
  stagger?: number;
  lineHeight?: number;
}> = ({ lines, at, size, accent = [], out = 0, stagger = 0.07, lineHeight = 1.06 }) => {
  const { pop } = useClock();
  let index = 0;
  return (
    <div
      style={{
        fontFamily: font,
        fontWeight: 800,
        fontSize: size,
        lineHeight,
        letterSpacing: "-0.035em",
        color: "white",
        textAlign: "center",
        opacity: 1 - out,
        transform: `translateY(${-70 * out}px) scale(${1 + 0.06 * out})`,
        filter: out > 0 ? `blur(${out * 14}px)` : undefined,
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "center", gap: "0.24em", flexWrap: "nowrap", whiteSpace: "nowrap" }}>
          {line.split(" ").map((word, j) => {
            const p = pop(at + index * stagger, 15, 190);
            index += 1;
            return (
              <span
                key={j}
                style={{
                  display: "inline-block",
                  opacity: Math.min(1, p * 1.4),
                  transform: `translateY(${(1 - p) * 60}px) scale(${0.92 + 0.08 * p})`,
                  filter: p < 0.9 ? `blur(${(1 - p) * 10}px)` : undefined,
                  ...(accent.includes(word) ? gradientText : {}),
                  // Keeps descenders of gradient-clipped words from being cut.
                  paddingBottom: "0.08em",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ── Logo ────────────────────────────────────────────────────────────────────
/** The real Eloq mark (src/app/icon.svg): three white rings, a violet core. */
const EloqMark: React.FC<{ size: number; progress?: number; tile?: boolean }> = ({ size, progress = 1, tile = true }) => {
  const ring = (i: number) => interpolate(progress, [i * 0.18, i * 0.18 + 0.5], [0, 1], clamp);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ overflow: "visible" }}>
      {tile && <rect width="24" height="24" rx="7.3" fill="#0f0a1f" stroke="rgba(169,150,251,0.35)" strokeWidth="0.15" />}
      {[10.5, 8, 5.3].map((r, i) => (
        <circle
          key={r}
          cx="12"
          cy="12"
          r={r * (0.7 + 0.3 * ring(2 - i))}
          fill="none"
          stroke="#ffffff"
          strokeOpacity={0.85 * ring(2 - i)}
          strokeWidth="1.1"
        />
      ))}
      <circle cx="12" cy="12" r={2.6} fill="none" stroke={VIOLET} strokeWidth="1.3" opacity={ring(0)} />
      <circle cx="12" cy="12" r={1} fill={VIOLET} opacity={ring(0)} />
    </svg>
  );
};

/** Rings rippling outwards from a point, echoing the logo. */
const Ripples: React.FC<{ at: number; x: number; y: number; count?: number; max?: number; color?: string }> = ({
  at,
  x,
  y,
  count = 3,
  max = 900,
  color = "169,150,251",
}) => {
  const { t } = useClock();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const p = interpolate(t, [at + i * 0.16, at + i * 0.16 + 1.3], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        if (p <= 0 || p >= 1) return null;
        const size = max * p;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              border: `3px solid rgba(${color},${0.55 * (1 - p)})`,
            }}
          />
        );
      })}
    </>
  );
};

// ── Scene 1 — hook ──────────────────────────────────────────────────────────
const Hook: React.FC = () => {
  const { t, ramp } = useClock();
  const { T, text } = useCfg();
  if (t > T.problem + 0.3) return null;
  const exit1 = ramp(T.hookLine2 - 0.2, T.hookLine2 + 0.05);
  const exit2 = ramp(T.problem - 0.2, T.problem + 0.1);
  return (
    <AbsoluteFill>
      <Ripples at={0.02} x={540} y={880} max={1500} />
      <Ripples at={T.hookLine2} x={540} y={880} max={1500} color="96,165,250" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 160 }}>
        {t < T.hookLine2 + 0.1 && (
          <Kinetic lines={text.hook1.lines} at={0.05} size={text.hook1.size} accent={text.hook1.accent} out={exit1} />
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 160 }}>
        {t >= T.hookLine2 - 0.05 && (
          <Kinetic
            lines={text.hook2.lines}
            at={T.hookLine2}
            size={text.hook2.size}
            accent={text.hook2.accent}
            out={exit2}
            stagger={0.06}
            lineHeight={1.12}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 2 — the problem ───────────────────────────────────────────────────
const NoteCard: React.FC<{ index: number }> = ({ index }) => {
  const { pop, ramp } = useClock();
  const { T, text } = useCfg();
  const enter = pop(T.problem + 0.08 + index * 0.1, 15, 150);
  const check = pop(T.problem + 0.5 + index * 0.3, 11, 220);
  const leave = ramp(T.problemPart2 - 0.25, T.problemPart2 + 0.1);
  const tilt = [-7, 2, 8][index];
  const offsetX = [-215, 0, 215][index];
  const offsetY = [40, 0, 50][index];
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - 250 + offsetX * enter - (index - 1) * 500 * leave,
        top: 760 + offsetY + (1 - enter) * 500 - leave * 120,
        width: 500,
        height: 620,
        borderRadius: 36,
        background: `linear-gradient(160deg, #1b1b22 0%, ${SURFACE} 100%)`,
        border: `2px solid ${index === 1 ? "rgba(129,140,248,0.55)" : BORDER}`,
        boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
        transform: `rotate(${tilt * enter}deg)`,
        opacity: enter * (1 - leave),
        padding: 44,
        fontFamily: font,
        zIndex: index === 1 ? 3 : 1,
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 600, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {text.noteLabel} {index + 1}
      </div>
      <div style={{ marginTop: 10, fontSize: 46, fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>
        {text.noteTitles[index]}
      </div>
      {[0.92, 0.74, 0.86, 0.6, 0.8].map((w, i) => (
        <div
          key={i}
          style={{
            marginTop: i === 0 ? 44 : 26,
            height: 16,
            width: `${w * 100}%`,
            borderRadius: 8,
            background: i === 1 ? "rgba(129,140,248,0.5)" : "rgba(255,255,255,0.13)",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          right: 34,
          bottom: 34,
          width: 84,
          height: 84,
          borderRadius: "50%",
          background: SUCCESS,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${check})`,
          boxShadow: `0 0 50px rgba(34,197,94,${0.6 * check})`,
        }}
      >
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#04130a" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
    </div>
  );
};

const FILLER_SPOTS = [
  { x: 110, y: 800 },
  { x: 330, y: 1500 },
  { x: 470, y: 890 },
];

const Problem: React.FC = () => {
  const { t, ramp, pop } = useClock();
  const { T, text } = useCfg();
  // The three filler chips pop across the second half of the scene.
  const fillerStep = (T.reveal - 0.8 - (T.problemPart2 + 0.4)) / 2;
  const fillers = FILLER_SPOTS.map((spot, i) => ({ ...spot, text: text.fillers[i], at: T.problemPart2 + 0.4 + i * fillerStep }));
  if (t < T.problem - 0.1 || t > T.reveal + 0.25) return null;
  const exit = ramp(T.reveal - 0.3, T.reveal + 0.05);
  const part2 = pop(T.problemPart2 - 0.1, 16, 140);
  const falter = ramp(T.problemPart2 + 0.05, T.problemPart2 + 0.6);
  const out1 = ramp(T.problemPart2 - 0.25, T.problemPart2);
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `scale(${1 + exit * 0.15})`, filter: exit > 0 ? `blur(${exit * 16}px)` : undefined }}>
      <div style={{ position: "absolute", top: 250, left: 0, right: 0 }}>
        {t < T.problemPart2 + 0.05 && (
          <Kinetic lines={text.problem1.lines} at={T.problem + 0.12} size={text.problem1.size} accent={text.problem1.accent} out={out1} />
        )}
      </div>
      <div style={{ position: "absolute", top: 250, left: 0, right: 0 }}>
        {t >= T.problemPart2 - 0.1 && (
          <Kinetic lines={text.problem2.lines} at={T.problemPart2} size={text.problem2.size} accent={text.problem2.accent} />
        )}
      </div>

      {t < T.problemPart2 + 0.2 && [0, 2, 1].map((i) => <NoteCard key={i} index={i} />)}

      {/* A voice that starts steady, then falters */}
      {t >= T.problemPart2 - 0.15 && (
        <div
          style={{
            position: "absolute",
            left: 90,
            right: 90,
            top: 1010,
            height: 420,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            opacity: part2,
            transform: `scale(${0.9 + 0.1 * part2})`,
          }}
        >
          {Array.from({ length: 34 }).map((_, i) => {
            const steady = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.9 + t * 9) * Math.cos(i * 0.37 + t * 5));
            const broken = 0.05 + 0.5 * Math.abs(Math.sin(i * 2.7 + Math.floor(t * 9) * 1.9)) * (Math.sin(i * 0.5 + Math.floor(t * 6)) > 0.2 ? 1 : 0.12);
            const h = steady * (1 - falter) + broken * falter;
            return (
              <div
                key={i}
                style={{
                  width: 14,
                  height: `${Math.max(4, h * 100)}%`,
                  borderRadius: 7,
                  background: falter > 0.5 ? `linear-gradient(${WARNING}, #ef4444)` : `linear-gradient(${VIOLET}, ${ACCENT})`,
                  opacity: 0.55 + 0.45 * h,
                }}
              />
            );
          })}
        </div>
      )}
      {fillers.map((f) => {
        const p = pop(f.at, 10, 230);
        if (t < f.at) return null;
        return (
          <div
            key={f.text}
            style={{
              position: "absolute",
              left: f.x,
              top: f.y,
              padding: "20px 38px",
              borderRadius: 999,
              background: "rgba(245,158,11,0.14)",
              border: "2px solid rgba(245,158,11,0.6)",
              color: "#fcd34d",
              fontFamily: font,
              fontWeight: 700,
              fontSize: 56,
              letterSpacing: "-0.02em",
              transform: `scale(${p}) rotate(${(f.x % 7) - 3}deg)`,
              boxShadow: "0 20px 60px rgba(245,158,11,0.25)",
            }}
          >
            {f.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── Scene 3 — reveal ────────────────────────────────────────────────────────
const Reveal: React.FC = () => {
  const { t, ramp, pop } = useClock();
  const { T, text } = useCfg();
  if (t < T.reveal - 0.05 || t > T.phoneIn + 0.5) return null;
  const enter = pop(T.reveal, 13, 160);
  const exit = ramp(T.phoneIn - 0.15, T.phoneIn + 0.3);
  const flash = ramp(T.reveal, T.reveal + 0.35, 0.55, 0, Easing.out(Easing.quad));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, rgba(169,150,251,${flash}), transparent 65%)` }} />
      <Ripples at={T.reveal} x={540} y={760} count={4} max={1700} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 220,
          opacity: 1 - exit,
          transform: `translateY(${-260 * exit}px) scale(${1 - 0.25 * exit})`,
        }}
      >
        <div style={{ transform: `scale(${0.5 + 0.5 * enter})`, opacity: enter, filter: "drop-shadow(0 0 70px rgba(129,140,248,0.75))" }}>
          <EloqMark size={250} progress={interpolate(t, [T.reveal, T.reveal + 0.6], [0, 1], clamp)} />
        </div>
        <div style={{ height: 56 }} />
        <Kinetic lines={text.reveal} at={T.reveal + 0.12} size={150} accent={["Eloq", "AI."]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Phone ───────────────────────────────────────────────────────────────────
const SHOT_W = 1200;
const SHOT_H = 2400;
const SCREEN_W = 700;
const K = SCREEN_W / SHOT_W; // capture px → video px
const SCREEN_H = SHOT_H * K;
const BEZEL = 16;
const PHONE_TOP = 470;

/** A full-viewport capture. */
const Still: React.FC<{ file: string }> = ({ file }) => {
  const img = useAsset();
  return <Img src={img(file)} style={{ position: "absolute", left: 0, top: 0, width: SCREEN_W, height: SCREEN_H }} />;
};

/** A whole-page capture scrolled behind the app's real header and tab bar. */
const Scrolled: React.FC<{ file: string; height: number; scroll: number }> = ({ file, height, scroll }) => {
  const img = useAsset();
  const { frames } = useCfg();
  const max = height - SHOT_H;
  const y = Math.max(0, Math.min(max, scroll));
  const header = frames.chrome.header;
  const nav = frames.chrome.nav;
  return (
    <>
      <Img src={img(file)} style={{ position: "absolute", left: 0, top: -y * K, width: SCREEN_W, height: height * K }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN_W, height: header * K, overflow: "hidden" }}>
        <Img src={img("chrome.png")} style={{ position: "absolute", left: 0, top: 0, width: SCREEN_W, height: SCREEN_H }} />
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, width: SCREEN_W, height: nav * K, overflow: "hidden" }}>
        <Img src={img("chrome.png")} style={{ position: "absolute", left: 0, bottom: 0, width: SCREEN_W, height: SCREEN_H }} />
      </div>
    </>
  );
};

/** A finger tap on the screen, in capture coordinates. */
const Tap: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const { t } = useClock();
  const p = interpolate(t, [at - 0.12, at + 0.45], [0, 1], clamp);
  if (p <= 0 || p >= 1) return null;
  const press = interpolate(p, [0, 0.2, 1], [0.6, 1, 1.9]);
  return (
    <div
      style={{
        position: "absolute",
        left: x * K - 55,
        top: y * K - 55,
        width: 110,
        height: 110,
        borderRadius: "50%",
        background: `rgba(255,255,255,${0.32 * (1 - p)})`,
        border: `3px solid rgba(255,255,255,${0.8 * (1 - p)})`,
        transform: `scale(${press})`,
      }}
    />
  );
};

interface Segment {
  from: number;
  to: number;
  render: (t: number) => React.ReactNode;
}

function frameAt<F extends { file: string; t: number }>(list: F[], elapsed: number): F {
  let current = list[0];
  for (const f of list) if (f.t <= elapsed) current = f;
  return current;
}

const inOut = { ...clamp, easing: Easing.inOut(Easing.cubic) };

function renderScreen(screen: Screen, t: number): React.ReactNode {
  if (screen.kind === "still") return <Still file={screen.file} />;
  const scroll = interpolate(t, screen.over, [screen.scrollFrom, screen.scrollTo], inOut);
  return <Scrolled file={screen.file} height={screen.height} scroll={scroll} />;
}

/** Everything the phone shows, in order. */
function buildSegments(cfg: PromoConfig): Segment[] {
  const { T, frames } = cfg;
  const firstStop = 1560; // setup page scrolled down to the mode cards
  return [
    { from: T.phoneIn - 0.2, to: T.setup, render: () => <Still file="landing.png" /> },
    {
      from: T.setup,
      to: T.recIdle,
      render: (t) => {
        const scroll =
          interpolate(t, [T.setup + 0.35, T.demo - 0.15], [0, firstStop], inOut) +
          interpolate(t, [T.demo, T.tapStart - 0.1], [0, cfg.setupHeight - SHOT_H - firstStop], inOut);
        return <Scrolled file="setup-long.png" height={cfg.setupHeight} scroll={scroll} />;
      },
    },
    { from: T.recIdle, to: T.recording, render: () => <Still file="rec-idle.png" /> },
    // Played a little faster than real time so the timer visibly runs.
    { from: T.recording, to: T.recLate, render: (t) => <Still file={frameAt(frames.recording, (t - T.recording) * 2.2).file} /> },
    { from: T.recLate, to: T.analysing, render: () => <Still file="rec-late.png" /> },
    { from: T.analysing, to: T.results, render: (t) => <Still file={frameAt(frames.analysing, t - T.analysing + 0.38).file} /> },
    {
      from: T.results,
      to: T.tail,
      render: (t) => {
        // Rest on the score, then follow each metric as it is called out.
        const stops = cfg.calloutKeys.map((k) => frames.rects[k].y - 760);
        const times = [T.metrics, ...T.callouts.map((c) => c - 0.05)];
        const values = [70, ...stops];
        let scroll = values[0];
        for (let i = 1; i < times.length; i++) {
          scroll += interpolate(t, [times[i] - 0.3, times[i] + 0.15], [0, values[i] - values[i - 1]], inOut);
        }
        return <Scrolled file="metrics-long.png" height={cfg.metricsHeight} scroll={scroll} />;
      },
    },
    ...cfg.tailScreens.map((screen) => ({ from: screen.from, to: screen.to, render: (t: number) => renderScreen(screen, t) })),
  ];
}

const FADE = 0.16;

const Phone: React.FC = () => {
  const { t, ramp, pop } = useClock();
  const cfg = useCfg();
  const { T } = cfg;
  const segments = React.useMemo(() => buildSegments(cfg), [cfg]);
  if (t < T.phoneIn - 0.2 || t > T.cta + 0.5) return null;

  const enter = pop(T.phoneIn, 17, 110);
  const exit = ramp(T.cta - 0.25, T.cta + 0.2);
  // Push in on the score, ease back out for the call-outs, lean in on the exams.
  const zoom =
    1 +
    0.14 * ramp(T.results + 0.1, T.results + 0.8) -
    0.14 * ramp(T.metrics - 0.15, T.metrics + 0.35) +
    0.05 * ramp(T.tail, T.tail + 0.6);
  const lift = 0;
  // The phone steps back while the real metric cards are pulled out of it.
  const dim = ramp(T.callouts[0] - 0.2, T.callouts[0] + 0.15) - ramp(T.tail - 0.2, T.tail + 0.1);
  const breathe = Math.sin(t * 1.3) * 6;
  const scanning = t >= T.analysing && t < T.results;

  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - SCREEN_W) / 2 - BEZEL,
        top: PHONE_TOP + (1 - enter) * 1700 + exit * 1500 + breathe + lift,
        width: SCREEN_W + BEZEL * 2,
        height: SCREEN_H + BEZEL * 2,
        borderRadius: 96,
        padding: BEZEL,
        background: "linear-gradient(150deg, #3a3a44 0%, #16161b 30%, #0c0c10 70%, #2c2c36 100%)",
        boxShadow: `0 0 0 2px rgba(255,255,255,0.06), 0 60px 140px rgba(0,0,0,0.75), 0 0 160px rgba(99,102,241,${0.42 - 0.2 * dim})`,
        transform: `scale(${zoom * (1 - 0.06 * dim)}) rotate(${(1 - enter) * 6}deg)`,
        transformOrigin: "50% 0%",
        filter: dim > 0 ? `brightness(${1 - 0.5 * dim}) blur(${dim * 3}px)` : undefined,
      }}
    >
      <div style={{ position: "relative", width: SCREEN_W, height: SCREEN_H, borderRadius: 82, overflow: "hidden", background: BG }}>
        {segments.map((segment, i) => {
          if (t < segment.from || t > segment.to + FADE) return null;
          const opacity = i === 0 ? 1 : interpolate(t, [segment.from, segment.from + FADE], [0, 1], clamp);
          return (
            <AbsoluteFill key={i} style={{ opacity }}>
              {segment.render(t)}
            </AbsoluteFill>
          );
        })}

        {/* Taps on the real buttons */}
        {cfg.taps.map((tap) => (
          <Tap key={tap.at} at={tap.at} x={tap.x} y={tap.y} />
        ))}

        {/* A light sweep while the analysis runs */}
        {scanning && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: interpolate((t - T.analysing) % 0.9, [0, 0.9], [-200, SCREEN_H]),
              height: 220,
              background: "linear-gradient(rgba(129,140,248,0), rgba(129,140,248,0.28), rgba(129,140,248,0))",
            }}
          />
        )}
        {/* Glass reflection */}
        <AbsoluteFill style={{ background: "linear-gradient(125deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 28%)", pointerEvents: "none" }} />
      </div>
    </div>
  );
};

// ── Metric call-outs (real cards, cropped from the capture) ─────────────────
const Crop: React.FC<{ file: string; pageHeight: number; rect: Rect; width: number }> = ({ file, pageHeight, rect, width }) => {
  const img = useAsset();
  const k = width / rect.w;
  return (
    <div style={{ position: "relative", width, height: rect.h * k, borderRadius: 58 * k * (SHOT_W / 1104), overflow: "hidden" }}>
      <Img
        src={img(file)}
        style={{ position: "absolute", left: -rect.x * k, top: -rect.y * k, width: SHOT_W * k, height: pageHeight * k, maxWidth: "none" }}
      />
    </div>
  );
};

const Callouts: React.FC = () => {
  const { t, pop, ramp } = useClock();
  const cfg = useCfg();
  const { T } = cfg;
  const rects = cfg.frames.rects;
  const afterLast = T.camera ?? T.tail;
  if (t < T.callouts[0] - 0.1 || t > T.tail + 0.2) return null;
  const WIDTH = 960;
  return (
    <AbsoluteFill>
      {cfg.calloutKeys.map((key, i) => {
        const at = T.callouts[i];
        const next = i < cfg.calloutKeys.length - 1 ? T.callouts[i + 1] : afterLast;
        if (t < at - 0.05 || t > next + 0.35) return null;
        const p = pop(at, 13, 180);
        const out = ramp(next - 0.08, next + 0.25);
        const rect = rects[key];
        const side = i % 2 === 0 ? -1 : 1;
        return (
          <div
            key={key}
            style={{
              position: "absolute",
              left: (1080 - WIDTH) / 2,
              top: 900 - (rect.h * (WIDTH / rect.w)) / 2 - out * 380,
              opacity: Math.min(1, p * 1.5) * (1 - out),
              transform: `scale(${(0.7 + 0.3 * p) * (1 - 0.18 * out)}) rotate(${side * (1 - p) * 5 + side * 1.2}deg)`,
              borderRadius: 50,
              boxShadow: "0 50px 120px rgba(0,0,0,0.7), 0 0 0 2px rgba(129,140,248,0.55), 0 0 120px rgba(99,102,241,0.55)",
            }}
          >
            <Crop file="metrics-long.png" pageHeight={cfg.metricsHeight} rect={rect} width={WIDTH} />
          </div>
        );
      })}

      {/* Camera mode: the real option card from the setup screen */}
      {T.camera !== undefined &&
        cfg.cameraRect &&
        t >= T.camera - 0.05 &&
        (() => {
          const p = pop(T.camera, 14, 170);
          const out = ramp(T.tail - 0.15, T.tail + 0.15);
          const rect = cfg.cameraRect;
          return (
            <div
              style={{
                position: "absolute",
                left: (1080 - WIDTH) / 2,
                top: 900 - (rect.h * (WIDTH / rect.w)) / 2,
                opacity: Math.min(1, p * 1.5) * (1 - out),
                transform: `scale(${0.7 + 0.3 * p})`,
                borderRadius: 50,
                boxShadow: "0 50px 120px rgba(0,0,0,0.7), 0 0 0 2px rgba(96,165,250,0.6), 0 0 120px rgba(59,130,246,0.5)",
              }}
            >
              <Crop file="setup-long.png" pageHeight={cfg.setupHeight} rect={rect} width={WIDTH} />
            </div>
          );
        })()}
    </AbsoluteFill>
  );
};

// ── Captions ────────────────────────────────────────────────────────────────
const CaptionBlock: React.FC<{ caption: Caption }> = ({ caption }) => {
  const { t, ramp, pop } = useClock();
  const { text } = useCfg();
  if (t < caption.from - 0.05 || t > caption.to + 0.2) return null;
  const out = ramp(caption.to - 0.12, caption.to + 0.12);
  const pill = pop(caption.from, 13, 200);
  const size = caption.lines.length >= 3 ? 62 : 70;
  return (
    <div style={{ position: "absolute", top: caption.step ? 196 : caption.lines.length >= 3 ? 190 : 230, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {caption.step && (
        <div
          style={{
            marginBottom: 22,
            padding: "10px 26px",
            borderRadius: 999,
            background: "rgba(99,102,241,0.18)",
            border: "2px solid rgba(129,140,248,0.6)",
            color: "#c7d2fe",
            fontFamily: font,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "0.08em",
            opacity: pill * (1 - out),
            transform: `scale(${0.8 + 0.2 * pill})`,
          }}
        >
          {text.stepLabel} {caption.step}
        </div>
      )}
      <div style={{ filter: "drop-shadow(0 6px 30px rgba(0,0,0,0.9))" }}>
        <Kinetic lines={caption.lines} at={caption.from + 0.04} size={size} accent={caption.accent} out={out} stagger={0.05} lineHeight={1.14} />
      </div>
    </div>
  );
};

// ── Scene 6 — call to action ────────────────────────────────────────────────
const Cta: React.FC = () => {
  const { t, pop, ramp } = useClock();
  const { T, text } = useCfg();
  if (t < T.cta - 0.05) return null;
  const enter = pop(T.cta + 0.05, 14, 140);
  const button = pop(T.ctaButton, 12, 190);
  const flash = ramp(T.cta, T.cta + 0.4, 0.5, 0, Easing.out(Easing.quad));
  const glow = 0.6 + 0.4 * Math.sin((t - T.ctaButton) * 3.2);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 38%, rgba(169,150,251,${flash}), transparent 65%)` }} />
      <Ripples at={T.cta} x={540} y={630} count={4} max={1800} />
      <Ripples at={T.ctaButton + 0.4} x={540} y={630} count={2} max={1500} color="96,165,250" />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 470 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 36,
            opacity: enter,
            transform: `scale(${0.6 + 0.4 * enter})`,
            filter: "drop-shadow(0 0 80px rgba(129,140,248,0.7))",
          }}
        >
          <EloqMark size={210} progress={interpolate(t, [T.cta, T.cta + 0.8], [0, 1], clamp)} />
          <div style={{ fontFamily: font, fontWeight: 800, fontSize: 150, letterSpacing: "-0.045em", color: "white" }}>Eloq AI</div>
        </div>
        <div style={{ height: 150 }} />
        <Kinetic lines={text.cta.lines} at={T.cta + 0.45} size={text.cta.size} accent={text.cta.accent} lineHeight={1.1} />
        <div style={{ height: 130 }} />
        <div
          style={{
            padding: "38px 78px",
            borderRadius: 999,
            background: `linear-gradient(95deg, #818cf8, ${ACCENT})`,
            color: "white",
            fontFamily: font,
            fontWeight: 700,
            fontSize: 62,
            letterSpacing: "-0.02em",
            opacity: Math.min(1, button * 1.4),
            transform: `scale(${0.7 + 0.3 * button})`,
            boxShadow: `0 30px 80px rgba(99,102,241,${0.35 + 0.3 * glow}), inset 0 2px 0 rgba(255,255,255,0.25)`,
          }}
        >
          {text.ctaButton}
        </div>
        <div
          style={{
            marginTop: 44,
            fontFamily: font,
            fontWeight: 700,
            fontSize: 66,
            letterSpacing: "-0.02em",
            color: "white",
            opacity: pop(T.ctaButton + 0.25, 16, 150),
          }}
        >
          {text.ctaUrlPrefix} <span style={gradientText}>eloq-oral.com</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Composition ─────────────────────────────────────────────────────────────
const PromoScenes: React.FC<{ music: boolean }> = ({ music }) => {
  const { t } = useClock();
  const cfg = useCfg();
  const img = useAsset();
  const fadeOut = interpolate(t, [cfg.seconds - 0.35, cfg.seconds], [1, 0.92], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: fadeOut }}>
      <Backdrop />
      <Hook />
      <Problem />
      <Reveal />
      <Phone />
      <Callouts />
      {cfg.captions.map((caption) => (
        <CaptionBlock key={caption.from} caption={caption} />
      ))}
      <Cta />
      {music && <Audio src={img("music.wav")} volume={0.8} />}
      <Audio src={img("sfx.wav")} volume={music ? 0.75 : 0.9} />
    </AbsoluteFill>
  );
};

export const Promo: React.FC<PromoProps> = ({ music, locale }) => (
  <Config.Provider value={PROMO_VARIANTS[locale] ?? PROMO_FR}>
    <PromoScenes music={music} />
  </Config.Provider>
);

/** Still for the TikTok cover: the hook over the real results screen. */
const CoverArt: React.FC = () => {
  const cfg = useCfg();
  const { hook1 } = cfg.text;
  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1500,
          height: 1500,
          left: -210,
          top: -420,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.55) 0%, rgba(99,102,241,0) 62%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          right: -400,
          bottom: -200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(59,130,246,0) 62%)",
        }}
      />
      <div style={{ position: "absolute", top: 210, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
        <EloqMark size={84} />
        <div style={{ fontFamily: font, fontWeight: 800, fontSize: 62, letterSpacing: "-0.04em", color: "white" }}>Eloq AI</div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 360,
          left: 0,
          right: 0,
          fontFamily: font,
          fontWeight: 800,
          fontSize: hook1.size - 6,
          lineHeight: 1.04,
          letterSpacing: "-0.04em",
          color: "white",
          textAlign: "center",
        }}
      >
        {hook1.lines.map((line) => (
          <div key={line}>
            {line.split(" ").map((word, i) => (
              <span key={i} style={hook1.accent.includes(word) ? gradientText : undefined}>
                {word}{" "}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: (1080 - SCREEN_W) / 2 - BEZEL,
          top: 760,
          width: SCREEN_W + BEZEL * 2,
          height: SCREEN_H + BEZEL * 2,
          borderRadius: 96,
          padding: BEZEL,
          background: "linear-gradient(150deg, #3a3a44 0%, #16161b 30%, #0c0c10 70%, #2c2c36 100%)",
          boxShadow: "0 60px 140px rgba(0,0,0,0.75), 0 0 180px rgba(99,102,241,0.5)",
          transform: "rotate(-3deg)",
        }}
      >
        <div style={{ position: "relative", width: SCREEN_W, height: SCREEN_H, borderRadius: 82, overflow: "hidden" }}>
          <Scrolled file="metrics-long.png" height={cfg.metricsHeight} scroll={70} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const PromoCover: React.FC<{ locale: PromoLocale; [key: string]: unknown }> = ({ locale }) => (
  <Config.Provider value={PROMO_VARIANTS[locale] ?? PROMO_FR}>
    <CoverArt />
  </Config.Provider>
);
