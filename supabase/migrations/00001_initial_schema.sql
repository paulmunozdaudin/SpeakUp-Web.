-- Orato AI initial schema
-- Run in the Supabase SQL editor (or `supabase db push`) after creating the project.

-- ── profiles ─────────────────────────────────────────────────────────────
-- One row per auth user, auto-created on signup by the trigger below.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  -- TODO(stripe): replace with a reference to a subscriptions table.
  subscription_status text not null default 'free'
    check (subscription_status in ('free', 'pro')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── practice_sessions ────────────────────────────────────────────────────
-- `analysis` holds the full AnalysisResult JSON. Keeping it as jsonb lets the
-- AI schema evolve (video metrics, new dimensions) without migrations, while
-- frequently-queried fields stay as real columns.
create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  topic text not null,
  mode text not null default 'presentation',
  duration_seconds integer not null default 0,
  analysis jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists practice_sessions_user_created_idx
  on public.practice_sessions (user_id, created_at desc);

alter table public.practice_sessions enable row level security;

create policy "Users can view own sessions"
  on public.practice_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.practice_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.practice_sessions for delete
  using (auth.uid() = user_id);

-- TODO(storage): create a private `recordings` bucket + policies when we
-- start persisting raw audio for re-listening and video analysis.
