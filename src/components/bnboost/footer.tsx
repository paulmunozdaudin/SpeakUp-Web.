import { BnboostLogo } from "./logo";

export function BnboostFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 sm:flex-row sm:justify-between sm:px-8">
        <BnboostLogo />
        <p className="text-xs text-neutral-400">
          © {new Date().getFullYear()} BNBoost. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
