/**
 * Fire-and-forget report of a user-facing failure to /api/client-error
 * (shows up in the server logs). Never throws, and each distinct error is
 * sent at most once per page load so a retry loop can't flood the logs.
 */
const sent = new Set<string>();
const MAX_REPORTS_PER_PAGE = 20;

export function reportClientError(kind: string, detail: string) {
  if (typeof window === "undefined") return;
  const key = `${kind}:${detail}`;
  if (sent.has(key) || sent.size >= MAX_REPORTS_PER_PAGE) return;
  sent.add(key);
  try {
    void fetch("/api/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, detail, path: window.location.pathname }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Reporting must never break the page.
  }
}
