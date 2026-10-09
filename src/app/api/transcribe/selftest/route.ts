import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { TRANSCRIPTION_MODELS, extensionForMime } from "@/services/ai/transcription";

export const runtime = "nodejs";
export const maxDuration = 60;

/** One second of a 440 Hz tone as a 16 kHz mono 16-bit WAV — enough for
 *  OpenAI to accept the file, so a 200 proves the key can transcribe. */
function testTone(): Blob {
  const sampleRate = 16_000;
  const samples = sampleRate;
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const write = (offset: number, text: string) =>
    [...text].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  write(0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples * 2, true);
  for (let i = 0; i < samples; i++) {
    view.setInt16(44 + i * 2, Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 8000, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

/**
 * GET /api/transcribe/selftest — founder-only diagnostic. Sends a tiny test
 * tone to every transcription model and reports OpenAI's status per model,
 * so a production failure can be diagnosed from the browser in one click.
 */
export async function GET() {
  const serverClient = await getSupabaseServerClient();
  const user = serverClient ? (await serverClient.auth.getUser()).data.user : null;
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "OPENAI_API_KEY is not configured" });
  }

  const results = [];
  for (const model of TRANSCRIPTION_MODELS) {
    const form = new FormData();
    form.append("file", testTone(), `test.${extensionForMime("audio/wav")}`);
    form.append("model", model);
    try {
      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
        signal: AbortSignal.timeout(30_000),
      });
      const body = await response.text();
      results.push({ model, status: response.status, ok: response.ok, body: body.slice(0, 300) });
    } catch (err) {
      results.push({ model, status: 0, ok: false, body: err instanceof Error ? err.message : "failed" });
    }
  }
  return NextResponse.json({ ok: results.some((r) => r.ok), results });
}
