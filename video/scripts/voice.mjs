/**
 * Generates the voiceover with ElevenLabs and the exact timing of every
 * word, then writes both into the props file so captions sync perfectly.
 *
 *   ELEVENLABS_API_KEY=... npm run voice -- props/my-ad.json [voiceId]
 *
 * The key can also live in video/.env (ELEVENLABS_API_KEY=...), which is
 * git-ignored. The default voice is a calm, deep multilingual one; pass
 * any voice ID from your ElevenLabs library to change it.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { basename } from "node:path";

const DEFAULT_VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // "Adam" — calm, deep
const MODEL_ID = "eleven_multilingual_v2";

function loadKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  if (existsSync(".env")) {
    const match = readFileSync(".env", "utf8").match(/^ELEVENLABS_API_KEY=(.+)$/m);
    if (match) return match[1].trim();
  }
  return null;
}

const [propsPath, voiceId = DEFAULT_VOICE_ID] = process.argv.slice(2);
if (!propsPath) {
  console.error("Usage: npm run voice -- props/my-ad.json [voiceId]");
  process.exit(1);
}
const apiKey = loadKey();
if (!apiKey) {
  console.error("Missing ELEVENLABS_API_KEY (env var or video/.env).");
  process.exit(1);
}

const props = JSON.parse(readFileSync(propsPath, "utf8"));
const text = props.lines.map((line) => line.text).join(" ");

const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: { stability: 0.55, similarity_boost: 0.8, style: 0.25 },
    }),
  },
);
if (!response.ok) {
  console.error(`ElevenLabs responded ${response.status}: ${await response.text()}`);
  process.exit(1);
}
const { audio_base64, alignment } = await response.json();

// Group character timings into words (split on whitespace, exactly like
// the captions do, so word N here is word N on screen).
const timings = [];
let current = null;
alignment.characters.forEach((char, i) => {
  const start = alignment.character_start_times_seconds[i];
  const end = alignment.character_end_times_seconds[i];
  if (/\s/.test(char)) {
    if (current) timings.push(current);
    current = null;
    return;
  }
  if (!current) current = { word: char, start, end };
  else {
    current.word += char;
    current.end = end;
  }
});
if (current) timings.push(current);

const name = basename(propsPath, ".json");
const audioFile = `voice-${name}.mp3`;
writeFileSync(`public/${audioFile}`, Buffer.from(audio_base64, "base64"));
writeFileSync(propsPath, JSON.stringify({ ...props, voice: audioFile, timings }, null, 2) + "\n");
console.log(`Saved public/${audioFile} and ${timings.length} word timings into ${propsPath}`);
