-- Security fix: the "Users can update own profile" policy from
-- 00001_initial_schema.sql has no column restriction, so any signed-in user
-- can call supabase.from('profiles').update({ subscription_status: 'pro' })
-- directly from the browser and grant themselves Pro for free. Billing
-- columns must only ever change via server code running with the
-- service-role key (the Stripe webhook, and the checkout route's stale
-- customer-id repair) — never via the user's own session.
--
-- Run in the Supabase SQL editor (or `supabase db push`).

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
    new.current_period_end := old.current_period_end;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_billing_columns_trigger on public.profiles;
create trigger protect_billing_columns_trigger
  before update on public.profiles
  for each row execute function public.protect_billing_columns();
