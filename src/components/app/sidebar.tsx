"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  History,
  LayoutDashboard,
  LogOut,
  Mic,
  User,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { signOut } from "@/services/auth.service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn } from "@/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/practice", label: "Practice", icon: Mic },
  { href: "/history", label: "History", icon: History },
  { href: "/profile", label: "Profile", icon: User },
];

/** Desktop sidebar + mobile bottom navigation for the authenticated app. */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  const items = navItems.map((item) => {
    const active =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    return { ...item, active };
  });

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
        <Logo href="/dashboard" className="px-2" />
        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                item.active
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:bg-surface-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-border pt-4">
          {isSupabaseConfigured ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          ) : (
            <span className="px-3 text-xs text-muted">Demo mode</span>
          )}
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/90 backdrop-blur-xl md:hidden">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
              item.active ? "text-accent" : "text-muted",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
