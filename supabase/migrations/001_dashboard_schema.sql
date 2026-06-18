-- Dashboard schema: inserate table, besichtigungsslots extensions, RLS for authenticated staff

-- 1. Inserate table
create table if not exists public.inserate (
  id uuid primary key default gen_random_uuid(),
  is24_inserat_id text not null unique,
  titel text not null,
  adresse text not null,
  zimmer numeric not null,
  flaeche_qm numeric not null,
  kaltmiete_eur numeric not null,
  status text not null default 'aktiv',
  is24_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inserate_is24_idx on public.inserate (is24_inserat_id);
create index if not exists inserate_status_idx on public.inserate (status);

alter table public.inserate enable row level security;

-- 2. Extend besichtigungsslots (table may already exist from landing page migration)
alter table public.besichtigungsslots
  add column if not exists inserat_id uuid references public.inserate(id) on delete cascade;

alter table public.besichtigungsslots
  add column if not exists dauer_minuten integer not null default 30;

create index if not exists besichtigungsslots_inserat_idx
  on public.besichtigungsslots (inserat_id);

-- 3. RLS policies for authenticated staff (dashboard users)

-- inserate
drop policy if exists "staff_select_inserate" on public.inserate;
create policy "staff_select_inserate" on public.inserate
  for select to authenticated using (true);

drop policy if exists "staff_insert_inserate" on public.inserate;
create policy "staff_insert_inserate" on public.inserate
  for insert to authenticated with check (true);

drop policy if exists "staff_update_inserate" on public.inserate;
create policy "staff_update_inserate" on public.inserate
  for update to authenticated using (true);

-- besichtigungsslots
drop policy if exists "staff_select_slots" on public.besichtigungsslots;
create policy "staff_select_slots" on public.besichtigungsslots
  for select to authenticated using (true);

drop policy if exists "staff_insert_slots" on public.besichtigungsslots;
create policy "staff_insert_slots" on public.besichtigungsslots
  for insert to authenticated with check (true);

drop policy if exists "staff_update_slots" on public.besichtigungsslots;
create policy "staff_update_slots" on public.besichtigungsslots
  for update to authenticated using (true);

drop policy if exists "staff_delete_slots" on public.besichtigungsslots;
create policy "staff_delete_slots" on public.besichtigungsslots
  for delete to authenticated using (belegt = 0);

-- leads (read + update for HITL refresh)
drop policy if exists "staff_select_leads" on public.leads;
create policy "staff_select_leads" on public.leads
  for select to authenticated using (true);

drop policy if exists "staff_update_leads" on public.leads;
create policy "staff_update_leads" on public.leads
  for update to authenticated using (true);

-- 4. Demo seed (optional — remove in production if not needed)
insert into public.inserate (
  is24_inserat_id, titel, adresse, zimmer, flaeche_qm, kaltmiete_eur, status, is24_url
)
values (
  'IS24-48291',
  'Helle 3-Zi.-Wohnung — Mainzer Str.',
  'Mainzer Str. 12, 56626 Andernach',
  3,
  78,
  850,
  'aktiv',
  'https://www.immobilienscout24.de'
)
on conflict (is24_inserat_id) do nothing;

insert into public.besichtigungsslots (
  inserat_id, adresse, datum, uhrzeit, dauer_minuten, kapazitaet
)
select
  i.id,
  i.adresse,
  (current_date + interval '3 days')::date,
  '10:00:00'::time,
  30,
  5
from public.inserate i
where i.is24_inserat_id = 'IS24-48291'
  and not exists (
    select 1 from public.besichtigungsslots s
    where s.inserat_id = i.id
  );
