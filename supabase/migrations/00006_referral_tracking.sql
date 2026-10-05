-- Referral/affiliate tracking: records which referral code (if any) brought
-- in a signup, so a creator with a revenue-share deal can be credited.
-- No dedicated referrals table — a free-text code on the profile is enough
-- at this scale, looked up by code from /admin.
-- Run in the Supabase SQL editor (or `supabase db push`).

alter table public.profiles
  add column if not exists referred_by text;

create index if not exists profiles_referred_by_idx
  on public.profiles (referred_by)
  where referred_by is not null;

-- Record the referral code (if any) passed at signup via
-- raw_user_meta_data.referred_by — see src/services/auth.service.ts and
-- src/lib/referral.ts.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, referred_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'referred_by', '')
  );
  return new;
end;
$$;

-- Extend the column-protection trigger from 00004/00005: referred_by is
-- only ever set once, at signup, by the (security definer) trigger above —
-- a user's own session must never be able to rewrite it afterwards to fake
-- a referral.
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
    new.referred_by := old.referred_by;
  end if;
  return new;
end;
$$;
