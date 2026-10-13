"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useDict } from "@/lib/i18n";
import { isNativeApp } from "@/lib/native";
import { fill } from "@/lib/challenges";
import {
  DEFAULT_REMINDER,
  disableReminder,
  enableReminder,
  formatTime,
  readReminder,
  type ReminderSettings,
} from "@/lib/reminders";
import { Button } from "@/components/ui/button";

/** Daily-reminder setting — only rendered inside the native app, where
 *  local notifications exist. */
export function ReminderCard() {
  const d = useDict();
  const r = d.challenges.reminder;
  const [native, setNative] = useState(false);
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_REMINDER);
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);

  // Platform and stored preference are browser-only facts.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setNative(isNativeApp());
    setSettings(readReminder());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  if (!native) return null;

  async function turnOn(hour: number, minute: number) {
    setBusy(true);
    const ok = await enableReminder(hour, minute, {
      title: r.notificationTitle,
      body: r.notificationBody,
    });
    setDenied(!ok);
    if (ok) setSettings({ enabled: true, hour, minute });
    setBusy(false);
  }

  async function turnOff() {
    setBusy(true);
    await disableReminder();
    setSettings((s) => ({ ...s, enabled: false }));
    setBusy(false);
  }

  const time = formatTime(settings.hour, settings.minute);

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
          {settings.enabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">{r.title}</h2>
          <p className="mt-0.5 text-xs text-muted">
            {settings.enabled ? fill(r.on, { time }) : r.description}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted">
          {r.timeLabel}
          <input
            type="time"
            value={time}
            disabled={busy}
            onChange={(event) => {
              const [h, m] = event.target.value.split(":").map(Number);
              if (Number.isNaN(h) || Number.isNaN(m)) return;
              if (settings.enabled) turnOn(h, m);
              else setSettings((s) => ({ ...s, hour: h, minute: m }));
            }}
            className="rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-foreground"
          />
        </label>
        {settings.enabled ? (
          <Button variant="secondary" size="sm" disabled={busy} onClick={turnOff}>
            {r.disable}
          </Button>
        ) : (
          <Button size="sm" disabled={busy} onClick={() => turnOn(settings.hour, settings.minute)}>
            {r.enable}
          </Button>
        )}
      </div>
      {denied && <p className="mt-3 text-xs text-danger">{r.denied}</p>}
    </section>
  );
}
