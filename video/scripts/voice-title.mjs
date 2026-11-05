/**
 * Generates the title voice-over for a read-along (Lectura) video with
 * ElevenLabs and links it in the props file. The video then holds the
 * title exactly as long as the voice lasts before the text starts.
 *
 *   ELEVENLABS_API_KEY=... npm run voice-title -- props/lectura-x.json [voiceId]
 *
 * Says `voiceText` from the props, or the title ("Mejora tu oratoria").
 * The key can also live in video/.env (git-ignored).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { basename } from "node:path";

const DEFAULT_VOICE_ID = "pNInz6obpgDQGcFmaJgB";
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
  console.error("Usage: npm run voice-title -- props/lectura-x.json [voiceId]");
  process.exit(1);
}
const apiKey = loadKey();
if (!apiKey) {
  console.error("Missing ELEVENLABS_API_KEY (env var or video/.env).");
  process.exit(1);
}

const props = JSON.parse(readFileSync(propsPath, "utf8"));
const text = props.voiceText ?? props.title;

const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "xi-api-key": apiKey, Accept: "audio/mpeg" },
  body: JSON.stringify({
    text,
    model_id: MODEL_ID,
    voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35 },
  }),
});
if (!response.ok) {
  console.error(`ElevenLabs responded ${response.status}: ${await response.text()}`);
  process.exit(1);
}

mkdirSync("public/voices", { recursive: true });
const file = `voices/${basename(propsPath, ".json")}.mp3`;
writeFileSync(`public/${file}`, Buffer.from(await response.arrayBuffer()));
props.voice = file;
writeFileSync(propsPath, `${JSON.stringify(props, null, 2)}\n`);
console.log(`Saved public/${file} ("${text}") and linked it in ${propsPath}`);
