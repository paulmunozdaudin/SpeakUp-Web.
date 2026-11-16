"""
Synthesises the promo's soundtrack from scratch (no samples, no third-party
audio, so there is nothing to license):

    python3 scripts/make-promo-audio.py

For each promo variant it writes music.wav (120 BPM, A minor) and sfx.wav
(whooshes, taps, pops, impacts) into that variant's folder under public/,
cut to the timeline in src/promo/timeline.ts. Needs numpy.
"""
import os
import wave

import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(7)

# Timelines (seconds) — keep in sync with the T objects in
# src/promo/timeline.ts. `taps` are the taps on the phone screen and
# `swooshes` the screen changes of the last scenes.
VARIANTS = {
    "promo": dict(  # French
        total=33.0, hook2=1.75, problem=3.5, part2=5.5, reveal=7.5, phone=8.6, setup=10.0,
        tap_start=12.6, tap_record=13.6, tap_stop=16.3, results=17.6,
        callouts=(18.9, 19.55, 20.2, 20.85, 21.5), camera=22.15, tail=23.5,
        taps=(24.4, 25.3, 26.2), swooshes=(), cta=28.0, button=29.7,
    ),
    "promo-es": dict(  # Spanish
        total=30.0, hook2=1.75, problem=3.5, part2=5.25, reveal=7.0, phone=8.0, setup=9.2,
        tap_start=11.0, tap_record=11.9, tap_stop=14.2, results=15.3,
        callouts=(16.5, 17.1, 17.7, 18.3, 18.9), camera=None, tail=19.5,
        taps=(20.5,), swooshes=(21.45, 22.4), cta=25.5, button=27.0,
    ),
}

# Set per variant by configure().
TOTAL = 0.0
N = 0
DROP = 0.0  # the reveal — the beat comes in
OUTRO = 0.0  # call to action — the beat leaves
V = {}


def configure(variant):
    global TOTAL, N, DROP, OUTRO, V
    V = variant
    TOTAL = variant["total"]
    N = int(SR * TOTAL)
    DROP = variant["reveal"]
    OUTRO = variant["cta"]


def t_axis(seconds):
    return np.arange(int(SR * seconds)) / SR


def place(track, sound, at, gain=1.0, pan=0.0):
    """Mix a mono sound into a stereo track at `at` seconds."""
    start = int(at * SR)
    if start >= N or start < 0:
        return
    sound = sound[: N - start]
    left = gain * np.sqrt(0.5 * (1 - pan)) * 1.414
    right = gain * np.sqrt(0.5 * (1 + pan)) * 1.414
    track[start : start + len(sound), 0] += sound * left
    track[start : start + len(sound), 1] += sound * right


def fft_filter(x, low=None, high=None, width=0.35):
    """Zero-phase band shaping with smooth (raised-cosine) edges."""
    spec = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1 / SR)
    gain = np.ones_like(freqs)
    if high is not None:  # low-pass at `high`
        lo, hi = high * (1 - width), high * (1 + width)
        gain *= np.clip((hi - freqs) / (hi - lo), 0, 1) ** 2
    if low is not None:  # high-pass at `low`
        lo, hi = low * (1 - width), low * (1 + width)
        gain *= np.clip((freqs - lo) / (hi - lo), 0, 1) ** 2
    return np.fft.irfft(spec * gain, len(x))


def env_exp(seconds, decay):
    return np.exp(-t_axis(seconds) / decay)


def midi(note):
    return 440.0 * 2 ** ((note - 69) / 12)


def saw(freq, seconds, detune=0.0):
    t = t_axis(seconds)
    out = np.zeros_like(t)
    for d in (-detune, 0.0, detune) if detune else (0.0,):
        phase = (t * freq * (1 + d)) % 1.0
        out += 2 * phase - 1
    return out / (3 if detune else 1)


# ── Drum voices ────────────────────────────────────────────────────────────
def kick():
    t = t_axis(0.32)
    freq = 46 + 110 * np.exp(-t / 0.035)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t / 0.13)
    click = fft_filter(rng.standard_normal(len(t)), low=2500) * np.exp(-t / 0.004) * 0.25
    return np.tanh((body + click) * 1.6)


def clap():
    t = t_axis(0.22)
    noise = fft_filter(rng.standard_normal(len(t)), low=900, high=6500)
    env = np.zeros_like(t)
    for offset in (0.0, 0.011, 0.023):
        env += np.where(t >= offset, np.exp(-(t - offset) / 0.012), 0) * 0.5
    env += np.where(t >= 0.03, np.exp(-(t - 0.03) / 0.07), 0)
    return noise * env * 0.5


def hat(open_=False):
    t = t_axis(0.18 if open_ else 0.06)
    noise = fft_filter(rng.standard_normal(len(t)), low=7000)
    return noise * np.exp(-t / (0.06 if open_ else 0.014)) * 0.35


# ── Music ──────────────────────────────────────────────────────────────────
# vi – IV – I – V in C major (A minor feel): one chord per bar.
CHORDS = [
    (45, [57, 60, 64, 67]),  # Am7
    (41, [57, 60, 65, 69]),  # Fmaj
    (48, [55, 60, 64, 67]),  # C
    (43, [55, 59, 62, 67]),  # G
]


def make_music():
    music = np.zeros((N, 2))
    pump = np.ones(N)  # side-chain curve, ducked on every kick of the drop
    bars = int(np.ceil(TOTAL / BAR))
    KICK, CLAP, HAT, OHAT = kick(), clap(), hat(), hat(True)

    def section(time):
        if time < 3.5:
            return "hook"
        if time < DROP:
            return "problem"
        if time < OUTRO:
            return "drop"
        return "outro"

    # Drums
    for beat in range(int(TOTAL / BEAT)):
        time = beat * BEAT
        part = section(time)
        if part == "hook" and beat % 2 == 0:
            place(music, KICK, time, 0.55)
        if part == "problem" and beat % 4 in (0, 2):
            place(music, KICK, time, 0.5)
        if part == "drop":
            # A one-bar break before the exams scene keeps it from droning.
            in_break = V["tail"] - 1.0 <= time < V["tail"]
            if not in_break:
                place(music, KICK, time, 0.9)
                i = int(time * SR)
                length = int(0.28 * SR)
                curve = 1 - 0.55 * np.exp(-t_axis(0.28) / 0.09)
                pump[i : i + length] = np.minimum(pump[i : i + length], curve[: max(0, min(length, N - i))])
                if beat % 2 == 1:
                    place(music, CLAP, time, 0.55)
            for sub in range(2):
                place(music, HAT, time + sub * BEAT / 2, 0.22 if sub == 0 else 0.34, pan=0.25)
            if beat % 4 == 3:
                place(music, OHAT, time + BEAT / 2, 0.2, pan=-0.2)
    # Snare-ish fill into the exams scene.
    for k in range(4):
        place(music, CLAP, V["tail"] - 0.5 + k * 0.125, 0.25 + 0.08 * k)

    # Harmony
    for bar in range(bars):
        time = bar * BAR
        part = section(time)
        root, notes = CHORDS[bar % 4]
        seconds = min(BAR, TOTAL - time)
        if seconds <= 0:
            break

        # Pad: detuned saws, soft attack.
        pad = sum(saw(midi(n), seconds + 0.4, 0.004) for n in notes) / len(notes)
        cutoff = {"hook": 700, "problem": 1100, "drop": 2600, "outro": 1800}[part]
        pad = fft_filter(pad, high=cutoff)
        tp = t_axis(seconds + 0.4)
        pad *= np.clip(tp / 0.25, 0, 1) * np.clip((seconds + 0.4 - tp) / 0.4, 0, 1)
        place(music, pad, time, {"hook": 0.20, "problem": 0.22, "drop": 0.2, "outro": 0.3}[part])

        # Sub bass: follows the root in 8ths on the drop, long notes elsewhere.
        if part == "drop":
            for eighth in range(8):
                at = time + eighth * BEAT / 2
                if at >= OUTRO:
                    break
                tb = t_axis(BEAT / 2 * 0.92)
                f = midi(root - 12 if eighth % 4 != 3 else root)
                note = (np.sin(2 * np.pi * f * tb) + 0.3 * fft_filter(saw(f, len(tb) / SR), high=500)) * np.clip(tb / 0.006, 0, 1) * np.exp(-tb / 0.2)
                place(music, note, at, 0.42)
        elif part != "hook":
            tb = t_axis(seconds)
            note = np.sin(2 * np.pi * midi(root - 12) * tb) * np.clip(tb / 0.05, 0, 1) * np.clip((seconds - tb) / 0.3, 0, 1)
            place(music, note, time, 0.3)

        # Pluck arpeggio: 16ths on the drop, sparse 8ths before it.
        steps = 16 if part == "drop" else 8 if part in ("problem", "outro") else 0
        pattern = [0, 1, 2, 3, 2, 1, 2, 3, 0, 2, 1, 3, 2, 3, 1, 2]
        for step in range(steps):
            at = time + step * BAR / steps
            if at >= TOTAL - 0.2:
                break
            note = notes[pattern[step % 16] % len(notes)] + (12 if part == "drop" and step % 4 == 3 else 0)
            f = midi(note + 12)
            tn = t_axis(0.32)
            pluck = fft_filter(saw(f, 0.32, 0.003), high=3200 if part == "drop" else 1800) * np.exp(-tn / (0.07 if part == "drop" else 0.12))
            vol = 0.17 if part == "drop" else 0.13
            place(music, pluck, at, vol, pan=0.5 if step % 2 else -0.5)
            place(music, pluck, at + BEAT * 0.75, vol * 0.3, pan=-0.5 if step % 2 else 0.5)  # echo

    # Side-chain everything that isn't the kick's own transient (approximation:
    # duck the whole bed a little — the kick is loud enough to read through).
    music *= (0.55 + 0.45 * pump)[:, None]

    # Final chord swell under the call to action, then fade.
    fade = np.ones(N)
    tail = int(2.2 * SR)
    fade[-tail:] = np.linspace(1, 0, tail) ** 1.5
    music *= fade[:, None]
    return music


# ── Sound effects ──────────────────────────────────────────────────────────
def whoosh(seconds=0.5, bright=1.0):
    t = t_axis(seconds)
    noise = rng.standard_normal(len(t))
    out = np.zeros_like(t)
    # Sweep a band upwards by cross-fading a few filtered layers.
    bands = [(300, 1200), (700, 2600), (1500, 5200), (3000, 9000)]
    for k, (lo, hi) in enumerate(bands):
        centre = (k + 0.5) / len(bands)
        out += fft_filter(noise, low=lo, high=hi * bright) * np.exp(-((t / seconds - centre) ** 2) / 0.03)
    return out * np.sin(np.pi * t / seconds) ** 1.5 * 0.5


def riser(seconds=0.6):
    t = t_axis(seconds)
    noise = fft_filter(rng.standard_normal(len(t)), low=2000)
    tone = np.sin(2 * np.pi * np.cumsum(300 + 1500 * (t / seconds) ** 2) / SR)
    return (noise * 0.5 + tone * 0.25) * (t / seconds) ** 2


def impact():
    t = t_axis(1.4)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t / 0.05)) / SR) * np.exp(-t / 0.35)
    air = fft_filter(rng.standard_normal(len(t)), low=1500, high=9000) * np.exp(-t / 0.25) * 0.3
    return np.tanh((boom * 1.2 + air))


def tap():
    t = t_axis(0.07)
    return (np.sin(2 * np.pi * 1700 * t) * np.exp(-t / 0.006) + np.sin(2 * np.pi * 320 * t) * np.exp(-t / 0.015)) * 0.6


def pop(note=76):
    t = t_axis(0.16)
    f = midi(note) * (1 + 0.35 * np.exp(-t / 0.012))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.045) * 0.6


def chime(notes=(76, 81, 88)):
    out = np.zeros(int(SR * 1.3))
    for k, note in enumerate(notes):
        t = t_axis(1.0)
        bell = (np.sin(2 * np.pi * midi(note) * t) + 0.35 * np.sin(2 * np.pi * midi(note) * 2.01 * t)) * np.exp(-t / 0.28)
        start = int(k * 0.07 * SR)
        out[start : start + len(bell)] += bell * 0.4
    return out


def glitch():
    t = t_axis(0.3)
    tone = np.sign(np.sin(2 * np.pi * 180 * t)) * 0.2
    gate = (np.sin(2 * np.pi * 22 * t) > 0).astype(float)
    return fft_filter(tone * gate, high=2500) * np.exp(-t / 0.2)


def make_sfx():
    sfx = np.zeros((N, 2))
    cue = lambda sound, at, gain=1.0, pan=0.0: place(sfx, sound, at, gain, pan)

    cue(impact(), 0.0, 0.7)
    cue(whoosh(0.45), V["hook2"] - 0.3, 0.6)
    cue(impact(), V["hook2"], 0.5)
    cue(whoosh(0.5), V["problem"] - 0.2, 0.7)
    for k in range(3):  # revision cards ticked off
        cue(pop(72 + 2 * k), V["problem"] + 0.5 + 0.3 * k, 0.45)
    cue(glitch(), V["part2"], 0.8)
    first = V["part2"] + 0.4
    step = (V["reveal"] - 0.8 - first) / 2
    for k in range(3):  # filler-word chips
        cue(pop(64 - 2 * k), first + k * step, 0.5, pan=(-0.4, 0.4, 0.0)[k])
    cue(riser(0.7), V["reveal"] - 0.7, 0.8)
    cue(impact(), V["reveal"], 1.0)
    cue(whoosh(0.5), V["phone"] - 0.1, 0.6)
    cue(whoosh(0.4, 1.3), V["setup"], 0.5)
    cue(tap(), V["tap_start"], 0.9)
    cue(tap(), V["tap_record"], 0.9)
    cue(pop(84), V["tap_record"] + 0.12, 0.4)  # recording starts
    cue(tap(), V["tap_stop"], 0.9)
    cue(whoosh(0.4), V["tap_stop"] + 0.05, 0.45)
    cue(chime(), V["results"] + 0.15, 0.8)  # the score lands
    for k, at in enumerate(V["callouts"]):  # metric call-outs
        cue(whoosh(0.22, 1.4), at - 0.1, 0.3)
        cue(pop(72 + 2 * k), at, 0.6, pan=(-0.3, 0.3)[k % 2])
    if V["camera"] is not None:  # camera mode card
        cue(whoosh(0.3, 1.3), V["camera"] - 0.1, 0.35)
        cue(pop(84), V["camera"], 0.5)
    cue(whoosh(0.45), V["tail"] - 0.2, 0.6)
    for k, at in enumerate(V["taps"]):
        cue(tap(), at, 0.8)
        cue(pop(76 + 3 * k), at + 0.03, 0.35)
    for at in V["swooshes"]:
        cue(whoosh(0.35, 1.2), at, 0.45)
    cue(riser(0.6), OUTRO - 0.6, 0.7)
    cue(impact(), OUTRO, 0.9)
    cue(chime((69, 76, 81, 88)), OUTRO + 0.15, 0.6)
    cue(pop(81), V["button"], 0.5)
    return sfx


def write(path, stereo, peak=0.89):
    stereo = np.tanh(stereo * 1.1)
    stereo = stereo / np.max(np.abs(stereo)) * peak
    data = (stereo * 32767).astype("<i2")
    with wave.open(path, "wb") as f:
        f.setnchannels(2)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(data.tobytes())
    print("wrote", path)


if __name__ == "__main__":
    for folder, variant in VARIANTS.items():
        configure(variant)
        out = os.path.join(os.path.dirname(__file__), "..", "public", folder)
        os.makedirs(out, exist_ok=True)
        write(os.path.join(out, "music.wav"), make_music(), peak=0.8)
        write(os.path.join(out, "sfx.wav"), make_sfx(), peak=0.7)
