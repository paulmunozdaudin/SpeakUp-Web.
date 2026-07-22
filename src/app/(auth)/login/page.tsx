"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/services/auth.service";
import { useDict } from "@/lib/i18n";

function LoginForm() {
  const d = useDict();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const result = await signIn(
      form.get("email") as string,
      form.get("password") as string,
    );

    if (!result.ok) {
      setError(result.error ?? d.auth.genericError);
      setLoading(false);
      return;
    }
    router.push(searchParams.get("next") ?? "/dashboard");
    router.refresh();
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">
        {d.auth.loginTitle}
      </h1>
      <p className="mt-1.5 text-sm text-muted">{d.auth.loginSubtitle}</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          label={d.auth.email}
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <div className="space-y-1.5">
          <Input
            label={d.auth.password}
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-accent hover:underline"
            >
              {d.auth.forgotPassword}
            </Link>
          </div>
        </div>
        {error && (
          <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}
        <Button type="submit" loading={loading} className="w-full">
          {d.common.logIn}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        {d.auth.noAccount}{" "}
        <Link href="/signup" className="font-medium text-accent hover:underline">
          {d.common.signUp}
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
