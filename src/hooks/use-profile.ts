"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUser } from "./use-user";

export type SubscriptionStatus = "free" | "pro";

interface UseProfileResult {
  subscriptionStatus: SubscriptionStatus;
  loading: boolean;
}

/** Reads the signed-in user's real subscription plan from Supabase. */
export function useProfile(): UseProfileResult {
  const { user, loading: userLoading } = useUser();
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus>("free");
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (userLoading || !user) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let cancelled = false;
    supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setSubscriptionStatus(
          data?.subscription_status === "pro" ? "pro" : "free",
        );
        setFetched(true);
      });

    return () => {
      cancelled = true;
    };
  }, [user, userLoading]);

  return {
    subscriptionStatus: user ? subscriptionStatus : "free",
    loading: userLoading || (Boolean(user) && !fetched),
  };
}
