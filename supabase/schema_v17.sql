-- VR Classroom Studio V17 — adaptive learning analytics extension
-- Requires schema_v13.sql through schema_v16.sql.
-- Apply only to a dedicated VR Classroom Studio Supabase project.

create table if not exists public.xr_competencies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.xr_projects(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  competency_key text not null,
  name text not null,
  description text,
  mastery_threshold numeric(5,2) not null default 80 check (mastery_threshold between 0 and 100),
  mapping jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, competency_key)
);

create table if not exists public.xr_mastery_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.xr_projects(id) on delete cascade,
  learner_ref text not null,
  mastery jsonb not null default '{}'::jsonb,
  source text not null default 'authoring-preview',
  created_at timestamptz not null default now()
);

create table if not exists public.xr_experience_statements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.xr_projects(id) on delete cascade,
  actor_ref text,
  statement jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists xr_competencies_project_idx on public.xr_competencies(project_id);
create index if not exists xr_mastery_snapshots_project_idx on public.xr_mastery_snapshots(project_id, created_at desc);
create index if not exists xr_experience_statements_project_idx on public.xr_experience_statements(project_id, created_at desc);

alter table public.xr_competencies enable row level security;
alter table public.xr_mastery_snapshots enable row level security;
alter table public.xr_experience_statements enable row level security;

drop policy if exists "xr_competencies_select" on public.xr_competencies;
create policy "xr_competencies_select" on public.xr_competencies
for select to authenticated
using (public.xr_is_workspace_member(public.xr_project_workspace(project_id)));

drop policy if exists "xr_competencies_write" on public.xr_competencies;
create policy "xr_competencies_write" on public.xr_competencies
for all to authenticated
using (public.xr_can_write_workspace(public.xr_project_workspace(project_id)))
with check (
  created_by = (select auth.uid())
  and public.xr_can_write_workspace(public.xr_project_workspace(project_id))
);

drop policy if exists "xr_mastery_select" on public.xr_mastery_snapshots;
create policy "xr_mastery_select" on public.xr_mastery_snapshots
for select to authenticated
using (public.xr_is_workspace_member(public.xr_project_workspace(project_id)));

drop policy if exists "xr_mastery_insert" on public.xr_mastery_snapshots;
create policy "xr_mastery_insert" on public.xr_mastery_snapshots
for insert to authenticated
with check (public.xr_is_workspace_member(public.xr_project_workspace(project_id)));

drop policy if exists "xr_experience_select" on public.xr_experience_statements;
create policy "xr_experience_select" on public.xr_experience_statements
for select to authenticated
using (public.xr_is_workspace_member(public.xr_project_workspace(project_id)));

drop policy if exists "xr_experience_insert" on public.xr_experience_statements;
create policy "xr_experience_insert" on public.xr_experience_statements
for insert to authenticated
with check (public.xr_is_workspace_member(public.xr_project_workspace(project_id)));

grant select, insert, update, delete on public.xr_competencies to authenticated;
grant select, insert on public.xr_mastery_snapshots to authenticated;
grant select, insert on public.xr_experience_statements to authenticated;

create or replace function public.xr_protect_competency_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.project_id is distinct from old.project_id
     or new.created_by is distinct from old.created_by
     or new.competency_key is distinct from old.competency_key then
    raise exception 'competency identity fields are immutable';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists xr_competencies_protect_identity on public.xr_competencies;
create trigger xr_competencies_protect_identity
before update on public.xr_competencies
for each row execute function public.xr_protect_competency_identity();

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='xr_mastery_snapshots'
  ) then
    alter publication supabase_realtime add table public.xr_mastery_snapshots;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='xr_experience_statements'
  ) then
    alter publication supabase_realtime add table public.xr_experience_statements;
  end if;
end $$;
