-- VR Classroom Studio V20 — Blackboard test lab and Release Candidate evidence
-- Requires schema_v13.sql through schema_v19.sql.
-- Apply only to a dedicated VR Classroom Studio Supabase project.

create table if not exists public.xr_test_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.xr_projects(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  test_suite text not null default 'Blackboard Test Lab V20',
  project_fingerprint text not null check (project_fingerprint ~ '^[0-9a-f]{64}$'),
  passed boolean not null default false,
  results jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.xr_release_candidates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.xr_projects(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 240),
  project_fingerprint text not null check (project_fingerprint ~ '^[0-9a-f]{64}$'),
  delivery_profile text,
  summary jsonb not null default '{}'::jsonb,
  test_run_id uuid references public.xr_test_runs(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.xr_blackboard_validations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.xr_projects(id) on delete cascade,
  release_candidate_id uuid references public.xr_release_candidates(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  course_shell text,
  tester text,
  passed boolean not null default false,
  checklist jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists xr_test_runs_project_idx
  on public.xr_test_runs(project_id, created_at desc);
create index if not exists xr_release_candidates_project_idx
  on public.xr_release_candidates(project_id, created_at desc);
create index if not exists xr_blackboard_validations_project_idx
  on public.xr_blackboard_validations(project_id, created_at desc);

alter table public.xr_test_runs enable row level security;
alter table public.xr_release_candidates enable row level security;
alter table public.xr_blackboard_validations enable row level security;

drop policy if exists "xr_test_runs_select" on public.xr_test_runs;
create policy "xr_test_runs_select" on public.xr_test_runs
for select to authenticated
using (public.xr_is_workspace_member(public.xr_project_workspace(project_id)));

drop policy if exists "xr_test_runs_insert" on public.xr_test_runs;
create policy "xr_test_runs_insert" on public.xr_test_runs
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and public.xr_is_workspace_member(public.xr_project_workspace(project_id))
);

drop policy if exists "xr_release_candidates_select" on public.xr_release_candidates;
create policy "xr_release_candidates_select" on public.xr_release_candidates
for select to authenticated
using (public.xr_is_workspace_member(public.xr_project_workspace(project_id)));

drop policy if exists "xr_release_candidates_insert" on public.xr_release_candidates;
create policy "xr_release_candidates_insert" on public.xr_release_candidates
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and public.xr_can_write_workspace(public.xr_project_workspace(project_id))
);

drop policy if exists "xr_blackboard_validations_select" on public.xr_blackboard_validations;
create policy "xr_blackboard_validations_select" on public.xr_blackboard_validations
for select to authenticated
using (public.xr_is_workspace_member(public.xr_project_workspace(project_id)));

drop policy if exists "xr_blackboard_validations_insert" on public.xr_blackboard_validations;
create policy "xr_blackboard_validations_insert" on public.xr_blackboard_validations
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and public.xr_is_workspace_member(public.xr_project_workspace(project_id))
);

grant select, insert on public.xr_test_runs to authenticated;
grant select, insert on public.xr_release_candidates to authenticated;
grant select, insert on public.xr_blackboard_validations to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='xr_test_runs'
  ) then
    alter publication supabase_realtime add table public.xr_test_runs;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='xr_release_candidates'
  ) then
    alter publication supabase_realtime add table public.xr_release_candidates;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='xr_blackboard_validations'
  ) then
    alter publication supabase_realtime add table public.xr_blackboard_validations;
  end if;
end $$;
