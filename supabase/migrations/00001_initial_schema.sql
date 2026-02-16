-- ============================================
-- 1. Tables (no cross-references yet)
-- ============================================

-- Profiles: synced from auth.users via trigger
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Goals
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  recurrence text not null default 'daily' check (recurrence in ('daily', 'weekdays', 'weekends', 'custom')),
  custom_days integer[] check (
    custom_days is null or (
      array_length(custom_days, 1) > 0 and
      custom_days <@ array[0,1,2,3,4,5,6]
    )
  ),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

-- Friendships (canonical ordering: user_a < user_b)
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);

-- Tasks (lazily created)
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (goal_id, date)
);

-- Invites
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  accepted_by uuid references public.profiles(id),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Confirmations
create table public.confirmations (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  confirmed_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (task_id, confirmed_by)
);

-- ============================================
-- 2. Functions
-- ============================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- are_friends helper (used in RLS policies)
create or replace function public.are_friends(uid1 uuid, uid2 uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.friendships
    where user_a = least(uid1, uid2)
      and user_b = greatest(uid1, uid2)
  );
$$;

-- ============================================
-- 3. RLS policies
-- ============================================

-- Profiles
alter table public.profiles enable row level security;

create policy "Users can read any profile"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Goals
alter table public.goals enable row level security;

create policy "Users can manage own goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Friends can read goals"
  on public.goals for select using (public.are_friends(auth.uid(), user_id));

-- Tasks
alter table public.tasks enable row level security;

create policy "Users can manage own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Friends can read tasks"
  on public.tasks for select using (public.are_friends(auth.uid(), user_id));

-- Friendships
alter table public.friendships enable row level security;

create policy "Users can read own friendships"
  on public.friendships for select
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Authenticated users can create friendships"
  on public.friendships for insert
  with check (auth.uid() = user_a or auth.uid() = user_b);

create policy "Users can delete own friendships"
  on public.friendships for delete
  using (auth.uid() = user_a or auth.uid() = user_b);

-- Invites
alter table public.invites enable row level security;

create policy "Users can manage own invites"
  on public.invites for all
  using (auth.uid() = inviter_id)
  with check (auth.uid() = inviter_id);

create policy "Anyone can read valid invites by code"
  on public.invites for select
  using (accepted_by is null and expires_at > now());

create policy "Authenticated users can accept invites"
  on public.invites for update
  using (auth.uid() is not null and accepted_by is null and expires_at > now());

-- Confirmations
alter table public.confirmations enable row level security;

create policy "Users can manage own confirmations"
  on public.confirmations for all
  using (auth.uid() = confirmed_by)
  with check (auth.uid() = confirmed_by);

create policy "Task owners can read confirmations"
  on public.confirmations for select
  using (
    exists (
      select 1 from public.tasks
      where tasks.id = confirmations.task_id
        and tasks.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. Indexes
-- ============================================
create index idx_goals_user_id on public.goals(user_id);
create index idx_tasks_goal_id on public.tasks(goal_id);
create index idx_tasks_user_date on public.tasks(user_id, date);
create index idx_friendships_user_a on public.friendships(user_a);
create index idx_friendships_user_b on public.friendships(user_b);
create index idx_invites_code on public.invites(code);
create index idx_confirmations_task_id on public.confirmations(task_id);
