-- Supabase schema for PDF Guru multitenant application

create extension if not exists "pgcrypto";

create table if not exists tenants (
  id text primary key,
  name text not null,
  theme_color text not null default '#005bbf',
  logo_url text,
  created_at timestamptz not null default now()
);

alter table tenants enable row level security;
create policy "Authenticated users can read tenants" on tenants
  for select using (auth.uid() is not null);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id text not null references tenants(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references tenants(id) on delete cascade,
  title text not null,
  modified_at date not null,
  storage_path text,
  created_at timestamptz not null default now()
);

alter table documents enable row level security;
create policy "Tenant members can read documents" on documents
  for select using (
    tenant_id = (
      select tenant_id from profiles where profiles.id = auth.uid()
    )
  );

create policy "Tenant members can insert documents" on documents
  for insert with check (
    tenant_id = (
      select tenant_id from profiles where profiles.id = auth.uid()
    )
  );

create policy "Tenant members can update documents" on documents
  for update using (
    tenant_id = (
      select tenant_id from profiles where profiles.id = auth.uid()
    )
  ) with check (
    tenant_id = (
      select tenant_id from profiles where profiles.id = auth.uid()
    )
  );

create policy "Tenant members can delete documents" on documents
  for delete using (
    tenant_id = (
      select tenant_id from profiles where profiles.id = auth.uid()
    )
  );

alter table profiles enable row level security;
create policy "Users can read own profile" on profiles
  for select using (id = auth.uid());

create policy "Users can insert their own profile" on profiles
  for insert with check (id = auth.uid());

create policy "Users can update own profile" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
