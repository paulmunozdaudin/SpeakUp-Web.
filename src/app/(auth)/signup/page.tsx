"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "@/services/auth.service";
import { useDict } from "@/lib/i18n";

export default function SignupPage() {
  const d = useDict();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const result = await signUp(
      form.get("fullName") as string,
      form.get("email") as string,
      form.get("password") as string,
    );

    if (!result.ok) {
      setError(result.error ?? d.auth.genericError);
      setLoading(false);
      return;
    }
    if (result.needsEmailConfirmation) {
      setConfirmationSent(true);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (confirmationSent) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <MailCheck className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold">{d.auth.checkInbox}</h1>
        <p className="mt-2 max-w-xs text-sm text-muted">
          {d.auth.confirmationSent}
        </p>
        <Link href="/login" className="mt-6">
          <Button variant="secondary">{d.auth.backToLogin}</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">
        {d.auth.signupTitle}
      </h1>
      <p className="mt-1.5 text-sm text-muted">{d.auth.signupSubtitle}</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          label={d.auth.fullName}
          name="fullName"
          type="text"
          placeholder="Ada Lovelace"
          autoComplete="name"
          required
        />
        <Input
          label={d.auth.email}
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <Input
          label={d.auth.password}
          name="password"
          type="password"
          placeholder={d.auth.passwordPlaceholder}
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
          {d.auth.createAccount}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        {d.auth.haveAccount}{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          {d.common.logIn}
        </Link>
      </p>
    </>
  );
}
