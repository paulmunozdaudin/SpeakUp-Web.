"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePassword } from "@/services/auth.service";
import { useDict } from "@/lib/i18n";

/**
 * Landing page for the Supabase password-recovery link.
 * The recovery link signs the user in with a temporary session,
 * so we only need to set the new password.
 */
export default function ResetPasswordPage() {
  const d = useDict();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (password !== confirm) {
      setError(d.auth.passwordsDontMatch);
      return;
    }

    setLoading(true);
    const result = await updatePassword(password);

    if (!result.ok) {
      setError(result.error ?? d.auth.genericError);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">
        {d.auth.resetTitle}
      </h1>
      <p className="mt-1.5 text-sm text-muted">{d.auth.resetSubtitle}</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          label={d.auth.newPassword}
          name="password"
          type="password"
          placeholder={d.auth.passwordPlaceholder}
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Input
          label={d.auth.confirmPassword}
          name="confirm"
          type="password"
          placeholder={d.auth.confirmPasswordPlaceholder}
          autoComplete="new-password"
          minLength={8}
          required
        />
        {error && (
          <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}
        <Button type="submit" loading={loading} className="w-full">
          {d.auth.updatePassword}
        </Button>
      </form>
    </>
  );
}
