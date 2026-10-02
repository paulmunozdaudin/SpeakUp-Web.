"use client";

import { useDict } from "@/lib/i18n";
import { Section } from "./section";

const METRIC_POSITIONS = [
  "top-[4%] left-[2%] lg:left-[8%]",
  "top-[16%] right-[2%] lg:right-[10%]",
  "top-[48%] left-[-2%] lg:left-[2%]",
  "top-[52%] right-[-2%] lg:right-[4%]",
  "bottom-[14%] left-[4%] lg:left-[12%]",
  "bottom-[8%] right-[4%] lg:right-[14%]",
] as const;

const CARD_DELAYS = ["0s", "3.3s", "6.6s", "10s", "13.3s", "16.6s"] as const;

/**
 * Full hologram showcase — replaces the old "Practice / Prepare an exam"
 * two-card chooser (those links already live in the hero's own CTAs). A
 * CSS/SVG "holographic presenter": a solid gradient silhouette gesturing
 * with both arms, a standing mic, speaking-pulse rings and Eloq's own
 * coaching metrics floating around it — entirely hand-built (no Three.js/
 * 3D asset in the project), on an aurora-blob background matching the
 * rest of the dark theme. Every loop is plain CSS (@keyframes in
 * globals.css), which the site's global prefers-reduced-motion rule
 * already collapses to a calm resting frame.
 */
export function HoloPresenter() {
  const d = useDict();

  const metrics = [
    { label: d.landing.previewMetrics.clarity, value: 88 },
    { label: d.landing.previewMetrics.confidence, value: 82 },
    { label: d.landing.previewMetrics.pacing, value: 79 },
    { label: d.landing.previewMetrics.structure, value: 91 },
    { label: d.videoMetrics.eyeContact, value: 86 },
    { label: d.videoMetrics.gestures, value: 84 },
  ];

  return (
    <Section eyebrow={d.landing.holoEyebrow} title={d.landing.holoTitle}>
      <div className="relative mx-auto -mt-4 h-[560px] max-w-3xl overflow-hidden rounded-[2.5rem] border border-border bg-[#0a0712] sm:h-[640px]">
        {/* Aurora blobs */}
        <div
          aria-hidden
          className="absolute -left-32 -top-40 h-[480px] w-[480px] rounded-full opacity-60 blur-[70px] [animation:holo-blob-a_22s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(circle, #4f3b9e, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute -right-28 top-[8%] h-[420px] w-[420px] rounded-full opacity-60 blur-[70px] [animation:holo-blob-b_26s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(circle, #6d28d9, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-40 left-[22%] h-[420px] w-[420px] rounded-full opacity-50 blur-[70px] [animation:holo-blob-c_20s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(circle, #3730a3, transparent 70%)" }}
        />

        {/* Floating metric cards */}
        {metrics.map((metric, i) => (
          <div
            key={metric.label}
            className={`absolute rounded-2xl border border-[rgba(167,139,250,0.3)] bg-[rgba(20,14,36,0.65)] px-4 py-2.5 opacity-0 shadow-[0_14px_30px_-14px_rgba(124,58,237,0.6)] backdrop-blur-md [animation:holo-card-float_20s_ease-in-out_infinite] ${METRIC_POSITIONS[i]}`}
            style={{ animationDelay: CARD_DELAYS[i] }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#c4b5fd]">
              {metric.label}
            </div>
            <div className="mt-0.5 text-xl font-extrabold text-white">
              {metric.value}
            </div>
          </div>
        ))}

        {/* The hologram itself */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-[460px] w-[300px] sm:h-[520px] sm:w-[340px]">
            {/* Base glow disc */}
            <div
              aria-hidden
              className="absolute bottom-16 left-1/2 h-7 w-56 -translate-x-1/2 rounded-full blur-[3px]"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(199,183,255,0.5), rgba(124,58,237,0.1) 70%, transparent 75%)",
              }}
            />

            {/* Speaking-pulse rings near the head */}
            <div className="absolute left-1/2 top-[7%] h-16 w-16 -translate-x-1/2">
              {["0s", "1.1s", "2.2s"].map((delay) => (
                <span
                  key={delay}
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-[#c4b5fd]/50 [animation:holo-speak-wave_2.2s_ease-out_infinite]"
                  style={{ animationDelay: delay }}
                />
              ))}
            </div>

            {/* Figure */}
            <div className="absolute inset-0 [animation:holo-idle-bob_6s_ease-in-out_infinite]">
              <svg
                viewBox="0 0 230 420"
                className="h-full w-full overflow-visible"
                aria-hidden
              >
                <defs>
                  <linearGradient id="holoFigGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="35%" stopColor="#d8cdfb" />
                    <stop offset="70%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#5b21b6" stopOpacity="0" />
                  </linearGradient>
                  <filter id="holoGlow" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="3.2" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <g filter="url(#holoGlow)">
                  {/* legs */}
                  <path d="M105,228 Q95,320 90,400" fill="none" stroke="url(#holoFigGrad)" strokeWidth="26" strokeLinecap="round" />
                  <path d="M135,228 Q145,320 150,400" fill="none" stroke="url(#holoFigGrad)" strokeWidth="26" strokeLinecap="round" />
                  {/* torso */}
                  <ellipse cx="120" cy="165" rx="38" ry="78" fill="url(#holoFigGrad)" />
                  {/* left gesturing arm */}
                  <g className="origin-[90px_112px] [animation:holo-arm-sway-2_5s_ease-in-out_infinite]">
                    <path d="M90,112 Q65,150 72,205" fill="none" stroke="url(#holoFigGrad)" strokeWidth="20" strokeLinecap="round" />
                    <circle cx="72" cy="207" r="10" fill="url(#holoFigGrad)" />
                  </g>
                  {/* right gesturing arm */}
                  <g className="origin-[150px_104px] [animation:holo-arm-sway_4.5s_ease-in-out_infinite]">
                    <path d="M150,104 Q195,80 215,55" fill="none" stroke="url(#holoFigGrad)" strokeWidth="20" strokeLinecap="round" />
                    <circle cx="215" cy="55" r="10" fill="url(#holoFigGrad)" />
                  </g>
                  {/* neck + head */}
                  <rect x="110" y="68" width="20" height="22" rx="9" fill="url(#holoFigGrad)" />
                  <circle cx="120" cy="48" r="25" fill="url(#holoFigGrad)" />
                </g>
              </svg>
            </div>

            {/* Standing mic in front of the figure */}
            <svg
              viewBox="0 0 40 160"
              className="absolute bottom-[58px] left-1/2 h-32 w-8 -translate-x-1/2 opacity-70"
              style={{ filter: "drop-shadow(0 0 6px rgba(199,183,255,0.7))" }}
              aria-hidden
            >
              <line x1="20" y1="60" x2="20" y2="155" stroke="#e9e4ff" strokeWidth="2" />
              <ellipse cx="20" cy="155" rx="14" ry="3.5" fill="#e9e4ff" fillOpacity="0.3" />
              <rect x="11" y="18" width="18" height="34" rx="9" fill="#e9e4ff" fillOpacity="0.85" />
              <path d="M5,38 a15,15 0 0 0 30,0" fill="none" stroke="#e9e4ff" strokeWidth="2" />
            </svg>

            {/* Particles */}
            {[
              { left: "16%", bottom: "22%", delay: "0s", duration: "7s" },
              { left: "80%", bottom: "28%", delay: "1.5s", duration: "8.5s" },
              { left: "26%", bottom: "16%", delay: "3s", duration: "7.8s" },
              { left: "68%", bottom: "20%", delay: "4.5s", duration: "9s" },
              { left: "50%", bottom: "12%", delay: "2.2s", duration: "7.4s" },
              { left: "38%", bottom: "32%", delay: "5.5s", duration: "7.2s" },
            ].map((p) => (
              <span
                key={`${p.left}-${p.bottom}`}
                aria-hidden
                className="absolute h-[3px] w-[3px] rounded-full bg-[#e9e4ff] opacity-0 shadow-[0_0_6px_1.5px_rgba(167,139,250,0.9)] [animation-name:holo-particle-float] [animation-timing-function:ease-in] [animation-iteration-count:infinite]"
                style={{ left: p.left, bottom: p.bottom, animationDelay: p.delay, animationDuration: p.duration }}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
