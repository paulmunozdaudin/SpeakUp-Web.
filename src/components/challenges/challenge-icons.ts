import { BookOpen, Ban, Lightbulb, MessageCircle, Shuffle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ChallengeType } from "@/types";

export const CHALLENGE_ICONS: Record<ChallengeType, LucideIcon> = {
  improvise: Shuffle,
  reading: BookOpen,
  explain: Lightbulb,
  noFillers: Ban,
  story: MessageCircle,
};
