-- Create roles table
create table if not exists roles (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  permissions text[] default '{}',
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table roles enable row level security;

-- Create policy to allow authenticated users to read roles
create policy "Authenticated users can read roles"
  on roles for select
  to authenticated
  using (true);

-- Create policy to allow masters to manage roles
-- Note: This assumes we can check user permissions in policies, which is tricky without a helper function.
-- For now, we'll allow authenticated users to insert/update/delete if they have the right permission claim in their metadata or if we trust the app logic.
-- A better approach is to use a function `auth.jwt()` -> `user_metadata` -> `tipoUser`.

create policy "Masters can manage roles"
  on roles for all
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and (
        'MASTER' = any(users."tipoUser")
        or
        'TODAS_AS_PERMISSOES' = any(users.permissoes)
      )
    )
  );
