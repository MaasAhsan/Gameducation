-- Gameducation schema
-- Run in Supabase SQL editor (Dashboard → SQL).
-- Uses the built-in auth.users table. Do NOT store service-role keys in the app.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Pemain',
  gems integer not null default 0 check (gems >= 0),
  streak integer not null default 0 check (streak >= 0),
  last_play_date date,
  daily_claimed_on date,
  is_guest boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory (
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table if not exists public.question_sets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  description text default '',
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.custom_questions (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.question_sets(id) on delete cascade,
  prompt text not null check (char_length(prompt) between 1 and 400),
  options text[] not null check (cardinality(options) = 4),
  correct_index smallint not null check (correct_index between 0 and 3),
  explanation text default '',
  category text default 'campuran',
  difficulty text default 'sedang',
  sort_order integer not null default 0
);

create table if not exists public.match_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null,
  score integer not null default 0,
  accuracy integer not null default 0,
  gems_earned integer not null default 0,
  category text,
  difficulty text,
  played_at timestamptz not null default now()
);

create index if not exists match_history_user_idx on public.match_history (user_id, played_at desc);
create index if not exists question_sets_owner_idx on public.question_sets (owner_id);

alter table public.profiles enable row level security;
alter table public.inventory enable row level security;
alter table public.question_sets enable row level security;
alter table public.custom_questions enable row level security;
alter table public.match_history enable row level security;

-- Profiles: owner can read/update self. Public display name is readable by authenticated users.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "inventory_own" on public.inventory
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "sets_select" on public.question_sets
  for select using (auth.uid() = owner_id or is_public = true);

create policy "sets_mutate_own" on public.question_sets
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "questions_select" on public.custom_questions
  for select using (
    exists (
      select 1 from public.question_sets s
      where s.id = set_id and (s.owner_id = auth.uid() or s.is_public = true)
    )
  );

create policy "questions_mutate_own" on public.custom_questions
  for all using (
    exists (select 1 from public.question_sets s where s.id = set_id and s.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.question_sets s where s.id = set_id and s.owner_id = auth.uid())
  );

create policy "history_own" on public.match_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, is_guest)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Pemain'),
    coalesce((new.raw_user_meta_data->>'is_guest')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
