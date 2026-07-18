-- Create Group Notices Table
create table if not exists public.group_notices (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) >= 3 and char_length(content) <= 1000),
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.group_notices enable row level security;

-- ---------------------------------------------------------------------------
-- Group Notices RLS Policies
-- ---------------------------------------------------------------------------

-- Select: Only members of the group can view group notices
create policy "group_notices_select_members"
  on public.group_notices for select
  to authenticated
  using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = group_notices.group_id
        and group_members.profile_id = auth.uid()
    )
  );

-- Insert: Only group Creators and Officials can post notices
create policy "group_notices_insert_officers"
  on public.group_notices for insert
  to authenticated
  with check (
    exists (
      select 1 from public.group_members
      where group_members.group_id = group_notices.group_id
        and group_members.profile_id = auth.uid()
        and group_members.role in ('CREATOR', 'OFFICIAL')
    )
  );
