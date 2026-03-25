-- StarPoints Database Schema
-- Run this in your Supabase SQL editor to set up the database.

-- ── profiles ─────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null default 'Champion',
  avatar text not null default '🦁',
  theme text not null default 'default',
  current_balance integer not null default 0,
  lifetime_points integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_date text,
  goal_reward_name text,
  goal_reward_cost integer,
  goal_reward_id text,
  parent_pin text not null default '1234',
  admin_pin text not null default '123456',
  bonus_multiplier integer not null default 1,
  bonus_multiplier_date text,
  sound_enabled boolean not null default false,
  daily_login_bonus boolean not null default false,
  created_at timestamptz default now()
);

-- ── tasks ─────────────────────────────────────────────────────────────────────
create table if not exists tasks (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  points integer not null,
  category text not null,
  emoji text not null default '⭐',
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- ── rewards ───────────────────────────────────────────────────────────────────
create table if not exists rewards (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  point_cost integer not null,
  category text not null,
  emoji text not null default '🎁',
  weekend_only boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- ── transactions ─────────────────────────────────────────────────────────────
create table if not exists transactions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  reference_id text,
  reference_name text,
  points_delta integer not null,
  balance_after integer not null,
  timestamp timestamptz not null default now(),
  notes text,
  created_at timestamptz default now()
);

-- ── badges ───────────────────────────────────────────────────────────────────
create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  badge_key text not null,
  earned_at timestamptz default now(),
  unique(user_id, badge_key)
);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table tasks enable row level security;
alter table rewards enable row level security;
alter table transactions enable row level security;
alter table badges enable row level security;

-- Users can only access their own data
create policy "Users can CRUD own profiles"
  on profiles for all
  using (auth.uid() = user_id);

create policy "Users can CRUD own tasks"
  on tasks for all
  using (auth.uid() = user_id);

create policy "Users can CRUD own rewards"
  on rewards for all
  using (auth.uid() = user_id);

create policy "Users can CRUD own transactions"
  on transactions for all
  using (auth.uid() = user_id);

create policy "Users can CRUD own badges"
  on badges for all
  using (auth.uid() = user_id);

-- ── Enable Realtime ───────────────────────────────────────────────────────────
-- Run in the Supabase dashboard: Database > Replication > add profiles table
-- Or run:
-- alter publication supabase_realtime add table profiles;
