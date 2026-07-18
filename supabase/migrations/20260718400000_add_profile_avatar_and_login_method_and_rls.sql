-- Add avatar_url and login_method columns to public.profiles table
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists login_method text;

-- Backfill logic: populate avatar_url and login_method for existing users
update public.profiles p
set
  avatar_url = coalesce(u.raw_user_meta_data ->> 'avatar_url', ''),
  login_method = coalesce(u.raw_app_meta_data ->> 'provider', 'email')
from auth.users u
where p.id = u.id;

-- Re-create user registration trigger to populate main_account, avatar_url, and login_method
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, main_account, avatar_url, login_method)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'preferred_username',
      new.email,
      new.id::text
    ),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', ''),
    coalesce(new.raw_app_meta_data ->> 'provider', 'email')
  );
  return new;
end;
$$;

-- Create policy to allow authenticated users to view profiles
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);
