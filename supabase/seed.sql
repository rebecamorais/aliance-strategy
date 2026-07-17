-- Usuário de teste local (rodado com `npm run db:reset`)
-- Login: dev@local.test / devpassword

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  user_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
begin
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) values (
    user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'dev@local.test',
    extensions.crypt('devpassword', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Dev Local"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  on conflict (id) do nothing;

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    user_id,
    user_id,
    format('{"sub":"%s","email":"dev@local.test"}', user_id)::jsonb,
    'email',
    user_id::text,
    now(),
    now(),
    now()
  )
  on conflict do nothing;
end $$;
