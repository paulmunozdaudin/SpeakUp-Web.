import type { Locale } from "@/lib/i18n";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalDocument {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export type LegalContent = Record<Locale, LegalDocument>;
