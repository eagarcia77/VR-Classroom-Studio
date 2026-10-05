-- VR Classroom Studio V19 — SCORM delivery QA evidence
-- Requires schema_v13.sql through schema_v18.sql.
-- Apply only to a dedicated VR Classroom Studio Supabase project.

create table if not exists public.xr_delivery_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.xr_projects(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  delivery_profile text not null,
  package_standard text not null default 'SCORM 2004 4th Edition',
  ready boolean not null default false,
  blockers integer not null default 0 check (blockers >= 0),
  warnings integer not null default 0 check (warnings >= 0),
  self_test jsonb not null default '[]'::jsonb,
  production_audit jsonb not null default '[]'::jsonb,
  package_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists xr_delivery_reports_project_idx
  on public.xr_delivery_reports(project_id, created_at desc);

alter table public.xr_delivery_reports enable row level security;

drop policy if exists "xr_delivery_reports_select" on public.xr_delivery_reports;
create policy "xr_delivery_reports_select" on public.xr_delivery_reports
for select to authenticated
using (public.xr_is_workspace_member(public.xr_project_workspace(project_id)));

drop policy if exists "xr_delivery_reports_insert" on public.xr_delivery_reports;
create policy "xr_delivery_reports_insert" on public.xr_delivery_reports
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and public.xr_is_workspace_member(public.xr_project_workspace(project_id))
);

grant select, insert on public.xr_delivery_reports to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime'
      and schemaname='public'
      and tablename='xr_delivery_reports'
  ) then
    alter publication supabase_realtime add table public.xr_delivery_reports;
  end if;
end $$;
