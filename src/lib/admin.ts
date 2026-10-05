/**
 * Founder-only gate for the manual admin tools (e.g. /admin — marking a
 * user Pro by hand after a manual Bizum/PayPal payment, before the
 * Lemon Squeezy integration is wired up). A couple of hardcoded addresses
 * rather than a role column: there's a small, known set of people who
 * should ever see this.
 */
const ADMIN_EMAILS = ["paulmunozdaudin@gmail.com", "pauldaudinmunoz@gmail.com"];

export function isAdminEmail(email: string | null | undefined): boolean {
  return ADMIN_EMAILS.includes((email ?? "").toLowerCase());
}
