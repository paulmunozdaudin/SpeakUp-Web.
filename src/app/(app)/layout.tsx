import { Sidebar } from "@/components/app/sidebar";

/**
 * Shared shell for all authenticated pages.
 * Route protection happens in src/proxy.ts; this layout is pure chrome.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 pb-24 md:ml-60 md:pb-8">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
