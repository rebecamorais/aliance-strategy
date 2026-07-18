-- 1. Alter Profiles table to add main_account with backfill logic
alter table public.profiles add column if not exists main_account text;
update public.profiles set main_account = coalesce(full_name, email, id::text) where main_account is null;
alter table public.profiles alter column main_account set not null;

-- Add unique constraint only if it doesn't already exist
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_main_account_unique'
  ) then
    alter table public.profiles add constraint profiles_main_account_unique unique (main_account);
  end if;
end;
$$;

-- 2. Re-create user registration trigger to populate main_account
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, main_account)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'preferred_username',
      new.email,
      new.id::text
    )
  );
  return new;
end;
$$;

-- 3. Create Audit Logs Action Enum
create type public.log_action as enum ('APPLIED', 'ACCEPTED', 'REJECTED', 'REMOVED', 'LEFT');

-- 4. Create Group Logs Table
create table if not exists public.group_logs (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  action public.log_action not null,
  target_id uuid not null,
  target_name text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text,
  created_at timestamptz not null default now()
);

-- 5. Enable Row Level Security (RLS)
alter table public.group_logs enable row level security;

-- ---------------------------------------------------------------------------
-- Group Logs RLS Policies
-- ---------------------------------------------------------------------------

-- Select: Only members of the group can view group logs
create policy "group_logs_select_members"
  on public.group_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = group_logs.group_id
        and group_members.profile_id = auth.uid()
    )
  );

-- Insert: Any authenticated user can insert logs (to support client-scoped REST flows)
create policy "group_logs_insert_authenticated"
  on public.group_logs for insert
  to authenticated
  with check (auth.uid() is not null);
