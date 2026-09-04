-- Pro waitlist: captures interest in the Pro plan while Stripe is still in
-- test mode (checkout is disabled — see PRO_CHECKOUT_ENABLED in the app).
-- Run in the Supabase SQL editor (or `supabase db push`).

create table if not exists public.pro_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  -- Nullable: joining the waitlist never requires an account.
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.pro_waitlist enable row level security;

-- Anyone can join (including guests) — but nobody can read the list back
-- through the app; only the founder, via the Supabase dashboard/SQL editor.
create policy "Anyone can join the Pro waitlist"
  on public.pro_waitlist for insert
  with check (true);
