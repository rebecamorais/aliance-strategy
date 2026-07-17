-- Create Group Role and Application Status Enums
create type public.group_role as enum ('CREATOR', 'OFFICIAL', 'MEMBER');
create type public.application_status as enum ('PENDING', 'ACCEPTED', 'REJECTED');

-- Create Groups Table
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text unique not null check (char_length(name) >= 3 and char_length(name) <= 50),
  description text not null check (char_length(description) >= 5 and char_length(description) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create Group Members Table (Pivot)
create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  role public.group_role not null default 'MEMBER',
  joined_at timestamptz not null default now(),
  unique (profile_id, group_id)
);

-- Create Applications Table
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  status public.application_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  unique (profile_id, group_id)
);

-- Enable Row Level Security (RLS)
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.applications enable row level security;

-- ---------------------------------------------------------------------------
-- Groups RLS Policies
-- ---------------------------------------------------------------------------

-- Select: Any authenticated user can view groups
create policy "groups_select_authenticated"
  on public.groups for select
  to authenticated
  using (true);

-- Insert: Any authenticated user can create a group
create policy "groups_insert_authenticated"
  on public.groups for insert
  to authenticated
  with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- Group Members RLS Policies
-- ---------------------------------------------------------------------------

-- Select: Any authenticated user can view group members
create policy "group_members_select_authenticated"
  on public.group_members for select
  to authenticated
  using (true);

-- Insert: Any authenticated user can join/be added
create policy "group_members_insert_authenticated"
  on public.group_members for insert
  to authenticated
  with check (auth.uid() is not null);

-- Delete: Creator of the group can delete members
create policy "group_members_delete_creator"
  on public.group_members for delete
  to authenticated
  using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = group_id
        and group_members.profile_id = auth.uid()
        and group_members.role = 'CREATOR'
    )
  );

-- ---------------------------------------------------------------------------
-- Applications RLS Policies
-- ---------------------------------------------------------------------------

-- Select: Owner of application OR group Creator/Official can view applications
create policy "applications_select_owner_or_admin"
  on public.applications for select
  to authenticated
  using (
    profile_id = auth.uid() or
    exists (
      select 1 from public.group_members
      where group_members.group_id = group_id
        and group_members.profile_id = auth.uid()
        and group_members.role in ('CREATOR', 'OFFICIAL')
    )
  );

-- Insert: Owner of application can apply
create policy "applications_insert_owner"
  on public.applications for insert
  to authenticated
  with check (profile_id = auth.uid());

-- Update/Delete: Owner can cancel OR group Creator/Official can update/delete
create policy "applications_modify_owner_or_admin"
  on public.applications for all
  to authenticated
  using (
    profile_id = auth.uid() or
    exists (
      select 1 from public.group_members
      where group_members.group_id = group_id
        and group_members.profile_id = auth.uid()
        and group_members.role in ('CREATOR', 'OFFICIAL')
    )
  );
