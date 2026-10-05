/**
 * Founder-only gate for the manual admin tools (e.g. /admin — marking a
 * user Pro by hand after a manual Bizum/PayPal payment, before the
 * Lemon Squeezy integration is wired up). Deliberately a single hardcoded
 * address rather than a role column: there's exactly one person who should
 * ever see this.
 */
const ADMIN_EMAIL = "paulmunozdaudin@gmail.com";

export function isAdminEmail(email: string | null | undefined): boolean {
  return (email ?? "").toLowerCase() === ADMIN_EMAIL;
}
