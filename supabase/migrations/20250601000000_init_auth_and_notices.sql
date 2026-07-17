-- Fullstack Template: notices + profiles + RLS
-- Aplicado automaticamente com: npm run db:reset

-- ---------------------------------------------------------------------------
-- Notices (mural público)
-- ---------------------------------------------------------------------------
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) >= 3 and char_length(title) <= 100),
  content text not null check (char_length(content) >= 5 and char_length(content) <= 1000),
  created_at timestamptz not null default now()
);

alter table public.notices enable row level security;

create policy "notices_select_public"
  on public.notices for select
  to anon, authenticated
  using (true);

create policy "notices_insert_authenticated"
  on public.notices for insert
  to authenticated
  with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- Profiles (espelho de auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Trigger: cria profile ao registrar usuário
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
