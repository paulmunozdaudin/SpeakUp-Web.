"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Referral {
  email: string;
  createdAt: string;
  subscriptionStatus: string;
}

export function ReferralsLookup() {
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[] | null>(null);

  async function handleSearch() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setPending(true);
    setError(null);
    setReferrals(null);
    try {
      const res = await fetch(
        `/api/admin/referrals?code=${encodeURIComponent(trimmed)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Error ${res.status}`);
        return;
      }
      setReferrals(data.referrals);
    } catch {
      setError("Network error — try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="max-w-md space-y-4">
      <div>
        <CardTitle>Look up a referral code</CardTitle>
        <p className="mt-0.5 text-sm text-muted">
          See everyone who signed up through a creator&apos;s link
          (eloq-oral.com/?ref=code).
        </p>
      </div>
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <Input
            placeholder="e.g. maria"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="off"
          />
        </div>
        <Button
          variant="secondary"
          loading={pending}
          disabled={!code.trim() || pending}
          onClick={handleSearch}
        >
          {!pending && <Search className="h-4 w-4" />}
          Search
        </Button>
      </div>
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
      {referrals && referrals.length === 0 && (
        <p className="text-sm text-muted">No signups yet for this code.</p>
      )}
      {referrals && referrals.length > 0 && (
        <ul className="space-y-2 text-sm">
          {referrals.map((r) => (
            <li
              key={r.email + r.createdAt}
              className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
            >
              <span className="truncate">{r.email}</span>
              <span className="shrink-0 text-xs text-muted">
                {r.subscriptionStatus === "pro" ? "Pro" : "Free"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
