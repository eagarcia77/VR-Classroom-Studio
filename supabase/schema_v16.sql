-- VR Classroom Studio V16 — realtime activity feed and alignment reports
-- Requires schema_v13.sql, schema_v14.sql, schema_v15.sql.
-- Apply only to a dedicated VR Classroom Studio Supabase project.

create table if not exists public.xr_alignment_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.xr_projects(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  summary jsonb not null default '{}'::jsonb,
  report_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists xr_alignment_reports_project_idx
  on public.xr_alignment_reports(project_id, created_at desc);

alter table public.xr_alignment_reports enable row level security;

drop policy if exists "xr_alignment_reports_select" on public.xr_alignment_reports;
create policy "xr_alignment_reports_select" on public.xr_alignment_reports
for select to authenticated
using (public.xr_is_workspace_member(public.xr_project_workspace(project_id)));

drop policy if exists "xr_alignment_reports_insert" on public.xr_alignment_reports;
create policy "xr_alignment_reports_insert" on public.xr_alignment_reports
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and public.xr_is_workspace_member(public.xr_project_workspace(project_id))
);

grant select, insert on public.xr_alignment_reports to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'xr_activity_events'
  ) then
    alter publication supabase_realtime add table public.xr_activity_events;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'xr_alignment_reports'
  ) then
    alter publication supabase_realtime add table public.xr_alignment_reports;
  end if;
end $$;
