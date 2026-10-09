import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/client-error
 * Body: JSON { kind, detail, path }. Writes one "[client-error]" line to
 * the server logs (Vercel → Logs) so failures users hit in their browser —
 * mic/speech errors, failed analyses, uncaught exceptions — are visible
 * instead of only surfacing when someone emails about "a bug". Nothing is
 * stored; no transcript or personal data is ever sent here.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const clip = (value: unknown, max: number) =>
      typeof value === "string" ? value.slice(0, max) : "";
    const kind = clip(body.kind, 40);
    if (!kind) return new NextResponse(null, { status: 400 });

    console.error(
      "[client-error]",
      JSON.stringify({
        kind,
        detail: clip(body.detail, 500),
        path: clip(body.path, 200),
        userAgent: clip(request.headers.get("user-agent"), 300),
      }),
    );
  } catch {
    // Malformed body — nothing worth logging.
  }
  return new NextResponse(null, { status: 204 });
}
