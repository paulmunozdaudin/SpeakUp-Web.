"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Result = { ok: true; message: string } | { ok: false; message: string };

async function setPro(email: string, pro: boolean): Promise<Result> {
  try {
    const res = await fetch("/api/admin/set-pro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, pro }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, message: data.error ?? `Error ${res.status}` };
    }
    return {
      ok: true,
      message: `${data.email} is now ${data.subscriptionStatus.toUpperCase()}.`,
    };
  } catch {
    return { ok: false, message: "Network error — try again." };
  }
}

export function AdminProToggle() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState<"pro" | "free" | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleClick(pro: boolean) {
    const trimmed = email.trim();
    if (!trimmed) return;
    setPending(pro ? "pro" : "free");
    setResult(null);
    const outcome = await setPro(trimmed, pro);
    setResult(outcome);
    setPending(null);
  }

  return (
    <Card className="max-w-md space-y-4">
      <div>
        <CardTitle>Mark a user Pro manually</CardTitle>
        <p className="mt-0.5 text-sm text-muted">
          For payments collected by hand (Bizum, PayPal, etc.) outside Lemon
          Squeezy. Flips their subscription_status directly.
        </p>
      </div>
      <Input
        label="User email"
        type="email"
        placeholder="user@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="off"
      />
      <div className="flex gap-2">
        <Button
          variant="primary"
          loading={pending === "pro"}
          disabled={!email.trim() || pending !== null}
          onClick={() => handleClick(true)}
        >
          {pending !== "pro" && <Check className="h-4 w-4" />}
          Make Pro
        </Button>
        <Button
          variant="secondary"
          loading={pending === "free"}
          disabled={!email.trim() || pending !== null}
          onClick={() => handleClick(false)}
        >
          {pending !== "free" && <X className="h-4 w-4" />}
          Remove Pro
        </Button>
      </div>
      {result && (
        <p
          className={
            result.ok
              ? "text-sm font-medium text-accent"
              : "text-sm font-medium text-danger"
          }
        >
          {result.message}
        </p>
      )}
    </Card>
  );
}
