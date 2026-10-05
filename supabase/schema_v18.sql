-- VR Classroom Studio V18 — accessibility and publication evidence extension
-- Requires schema_v13.sql through schema_v17.sql.
-- Apply only to a dedicated VR Classroom Studio Supabase project.

create table if not exists public.xr_accessibility_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.xr_projects(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  standard_target text not null default 'WCAG-oriented preflight',
  summary jsonb not null default '{}'::jsonb,
  report_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.xr_publication_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.xr_projects(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  target_lms text not null default 'Blackboard',
  package_standard text not null default 'SCORM 2004',
  ready boolean not null default false,
  blockers integer not null default 0 check (blockers >= 0),
  warnings integer not null default 0 check (warnings >= 0),
  checklist jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists xr_accessibility_reports_project_idx
  on public.xr_accessibility_reports(project_id, created_at desc);

create index if not exists xr_publication_reports_project_idx
  on public.xr_publication_reports(project_id, created_at desc);

alter table public.xr_accessibility_reports enable row level security;
alter table public.xr_publication_reports enable row level security;

drop policy if exists "xr_accessibility_reports_select" on public.xr_accessibility_reports;
create policy "xr_accessibility_reports_select" on public.xr_accessibility_reports
for select to authenticated
using (public.xr_is_workspace_member(public.xr_project_workspace(project_id)));

drop policy if exists "xr_accessibility_reports_insert" on public.xr_accessibility_reports;
create policy "xr_accessibility_reports_insert" on public.xr_accessibility_reports
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and public.xr_is_workspace_member(public.xr_project_workspace(project_id))
);

drop policy if exists "xr_publication_reports_select" on public.xr_publication_reports;
create policy "xr_publication_reports_select" on public.xr_publication_reports
for select to authenticated
using (public.xr_is_workspace_member(public.xr_project_workspace(project_id)));

drop policy if exists "xr_publication_reports_insert" on public.xr_publication_reports;
create policy "xr_publication_reports_insert" on public.xr_publication_reports
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and public.xr_is_workspace_member(public.xr_project_workspace(project_id))
);

grant select, insert on public.xr_accessibility_reports to authenticated;
grant select, insert on public.xr_publication_reports to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='xr_accessibility_reports'
  ) then
    alter publication supabase_realtime add table public.xr_accessibility_reports;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='xr_publication_reports'
  ) then
    alter publication supabase_realtime add table public.xr_publication_reports;
  end if;
end $$;
