"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

export interface TabDef {
  key: string;
  label: string;
}

export function ResultsTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative shrink-0 cursor-pointer px-4 py-3 text-sm font-medium transition-colors",
              isActive ? "text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
            {isActive && (
              <motion.span
                layoutId="results-tab-underline"
                className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
