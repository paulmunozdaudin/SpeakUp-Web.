"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Trash2 } from "lucide-react";
import { signOut } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { useDict } from "@/lib/i18n";

/** Sign out + permanent account deletion (App Store requirement), for
 *  signed-in users. Deletion needs a second, explicit confirmation. */
export function AccountActions() {
  const d = useDict();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setBusy(true);
    await signOut();
    router.push("/");
    router.refresh();
  }

  async function handleDelete() {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/account/delete", { method: "POST" }).catch(() => null);
    if (!response?.ok) {
      setError(d.profile.deleteAccountError);
      setBusy(false);
      return;
    }
    await signOut().catch(() => {});
    router.push("/");
    router.refresh();
  }

  return (
    <Card className="space-y-4">
      <CardTitle>{d.profile.accountTitle}</CardTitle>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" disabled={busy} onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          {d.common.logOut}
        </Button>
        {!confirming && (
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => setConfirming(true)}
            className="text-danger"
          >
            <Trash2 className="h-4 w-4" />
            {d.profile.deleteAccount}
          </Button>
        )}
      </div>
      {confirming && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4">
          <p className="text-sm text-danger">{d.profile.deleteAccountWarning}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              disabled={busy}
              onClick={handleDelete}
              className="bg-danger hover:bg-danger/90"
            >
              {d.profile.deleteAccountConfirm}
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => setConfirming(false)}>
              {d.common.cancel}
            </Button>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </Card>
  );
}
