-- Switch billing from Stripe to Lemon Squeezy.
-- Adds the new columns the Lemon Squeezy webhook writes to; the old
-- stripe_customer_id/stripe_subscription_id columns are left in place
-- (unused, harmless) rather than dropped, since no code reads them anymore
-- and dropping isn't worth the risk for a couple of empty nullable columns.
-- Run in the Supabase SQL editor (or `supabase db push`).

alter table public.profiles
  add column if not exists lemonsqueezy_customer_id text,
  add column if not exists lemonsqueezy_subscription_id text;

create unique index if not exists profiles_lemonsqueezy_customer_id_idx
  on public.profiles (lemonsqueezy_customer_id)
  where lemonsqueezy_customer_id is not null;

create unique index if not exists profiles_lemonsqueezy_subscription_id_idx
  on public.profiles (lemonsqueezy_subscription_id)
  where lemonsqueezy_subscription_id is not null;

-- Extend the billing-column protection trigger (00004) to guard the new
-- columns too — same rule: only the service role (the webhook) may write
-- them, never the user's own session.
create or replace function public.protect_billing_columns()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    new.subscription_status := old.subscription_status;
    new.stripe_customer_id := old.stripe_customer_id;
    new.stripe_subscription_id := old.stripe_subscription_id;
    new.lemonsqueezy_customer_id := old.lemonsqueezy_customer_id;
    new.lemonsqueezy_subscription_id := old.lemonsqueezy_subscription_id;
    new.current_period_end := old.current_period_end;
  end if;
  return new;
end;
$$;
