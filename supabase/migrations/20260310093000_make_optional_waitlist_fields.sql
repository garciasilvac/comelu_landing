alter table public.leads
  drop constraint if exists leads_intereses_max_3;

alter table public.leads
  add constraint leads_intereses_max_3 check (cardinality(intereses) <= 3);
