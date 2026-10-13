"use client";

/**
 * Daily challenge reminder for the native app — a repeating LOCAL
 * notification scheduled on the device itself, so it needs no push server
 * or Apple push certificates. The setting lives in localStorage (it's a
 * per-device preference, like the notification permission itself).
 */

import { isNativeApp } from "@/lib/native";

const STORAGE_KEY = "eloq-reminder";
const NOTIFICATION_ID = 1001;

export interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export const DEFAULT_REMINDER: ReminderSettings = { enabled: false, hour: 19, minute: 0 };

export function readReminder(): ReminderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_REMINDER, ...JSON.parse(raw) } : DEFAULT_REMINDER;
  } catch {
    return DEFAULT_REMINDER;
  }
}

function writeReminder(settings: ReminderSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable — the schedule on the device still applies.
  }
}

/** Schedules (or reschedules) the daily notification. Returns false when
 *  notifications aren't allowed. */
export async function enableReminder(
  hour: number,
  minute: number,
  text: { title: string; body: string },
): Promise<boolean> {
  if (!isNativeApp()) return false;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== "granted") return false;

  await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });
  await LocalNotifications.schedule({
    notifications: [
      {
        id: NOTIFICATION_ID,
        title: text.title,
        body: text.body,
        schedule: { on: { hour, minute }, allowWhileIdle: true },
        extra: { path: "/challenges" },
      },
    ],
  });
  writeReminder({ enabled: true, hour, minute });
  return true;
}

export async function disableReminder(): Promise<void> {
  const current = readReminder();
  writeReminder({ ...current, enabled: false });
  if (!isNativeApp()) return;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });
}

export function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
