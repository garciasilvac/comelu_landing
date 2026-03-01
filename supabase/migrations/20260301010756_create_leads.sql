create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  telefono_pais text not null,
  telefono_numero text not null,
  rol text not null,
  tamano text not null,
  dolor text not null,
  intereses text[] not null default '{}',
  checklist boolean not null default false,
  market text not null default 'Chile',
  source text not null default 'landing_comelu',
  created_at timestamptz not null default timezone('utc', now()),
  constraint leads_intereses_max_3 check (cardinality(intereses) between 1 and 3),
  constraint leads_email_not_empty check (length(trim(email)) > 0)
);

alter table public.leads enable row level security;

drop policy if exists "Allow anonymous inserts on leads" on public.leads;
create policy "Allow anonymous inserts on leads"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (lower(email));
