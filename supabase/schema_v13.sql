-- VR Classroom Studio V13 — Cloud-ready Supabase schema
-- Apply only to a dedicated Supabase project for VR Classroom Studio.

create extension if not exists pgcrypto;

create table if not exists public.xr_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.xr_workspace_members (
  workspace_id uuid not null references public.xr_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','instructor','reviewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.xr_projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.xr_workspaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  course_code text,
  project_data jsonb not null default '{}'::jsonb,
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.xr_project_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.xr_projects(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Cloud version',
  project_data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists xr_workspace_members_user_idx on public.xr_workspace_members(user_id);
create index if not exists xr_projects_workspace_idx on public.xr_projects(workspace_id);
create index if not exists xr_projects_owner_idx on public.xr_projects(owner_id);
create index if not exists xr_project_versions_project_idx on public.xr_project_versions(project_id, created_at desc);

create or replace function public.xr_protect_workspace_identity()
returns trigger
language plpgsql
set search_path = public
as $
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'workspace owner_id is immutable';
  end if;
  return new;
end;
$;

drop trigger if exists xr_workspaces_protect_identity on public.xr_workspaces;
create trigger xr_workspaces_protect_identity
before update on public.xr_workspaces
for each row execute function public.xr_protect_workspace_identity();

create or replace function public.xr_protect_project_identity()
returns trigger
language plpgsql
set search_path = public
as $
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'project owner_id is immutable';
  end if;
  if new.workspace_id is distinct from old.workspace_id then
    raise exception 'project workspace_id is immutable';
  end if;
  return new;
end;
$;

drop trigger if exists xr_projects_protect_identity on public.xr_projects;
create trigger xr_projects_protect_identity
before update on public.xr_projects
for each row execute function public.xr_protect_project_identity();


alter table public.xr_workspaces enable row level security;
alter table public.xr_workspace_members enable row level security;
alter table public.xr_projects enable row level security;
alter table public.xr_project_versions enable row level security;

create or replace function public.xr_is_workspace_member(target_workspace uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.xr_workspace_members m
    where m.workspace_id = target_workspace
      and m.user_id = (select auth.uid())
  ) or exists (
    select 1 from public.xr_workspaces w
    where w.id = target_workspace
      and w.owner_id = (select auth.uid())
  );
$$;

create or replace function public.xr_can_write_workspace(target_workspace uuid)
returns boolean
language sql stable security definer
set search_path = public
as $
  select exists (
    select 1 from public.xr_workspaces w
    where w.id = target_workspace and w.owner_id = (select auth.uid())
  ) or exists (
    select 1 from public.xr_workspace_members m
    where m.workspace_id = target_workspace
      and m.user_id = (select auth.uid())
      and m.role in ('admin','instructor')
  );
$;

create or replace function public.xr_is_workspace_admin(target_workspace uuid)
returns boolean
language sql stable security definer
set search_path = public
as $
  select exists (
    select 1 from public.xr_workspaces w
    where w.id = target_workspace and w.owner_id = (select auth.uid())
  ) or exists (
    select 1 from public.xr_workspace_members m
    where m.workspace_id = target_workspace
      and m.user_id = (select auth.uid())
      and m.role = 'admin'
  );
$;

revoke all on function public.xr_is_workspace_member(uuid) from public;
revoke all on function public.xr_can_write_workspace(uuid) from public;
revoke all on function public.xr_is_workspace_admin(uuid) from public;
grant execute on function public.xr_is_workspace_member(uuid) to authenticated;
grant execute on function public.xr_can_write_workspace(uuid) to authenticated;
grant execute on function public.xr_is_workspace_admin(uuid) to authenticated;

drop policy if exists "xr_workspaces_select" on public.xr_workspaces;
create policy "xr_workspaces_select" on public.xr_workspaces
for select to authenticated
using (public.xr_is_workspace_member(id));

drop policy if exists "xr_workspaces_insert" on public.xr_workspaces;
create policy "xr_workspaces_insert" on public.xr_workspaces
for insert to authenticated
with check ((select auth.uid()) is not null and owner_id = (select auth.uid()));

drop policy if exists "xr_workspaces_update" on public.xr_workspaces;
create policy "xr_workspaces_update" on public.xr_workspaces
for update to authenticated
using (public.xr_is_workspace_admin(id))
with check (public.xr_is_workspace_admin(id));

drop policy if exists "xr_workspaces_delete" on public.xr_workspaces;
create policy "xr_workspaces_delete" on public.xr_workspaces
for delete to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "xr_members_select" on public.xr_workspace_members;
create policy "xr_members_select" on public.xr_workspace_members
for select to authenticated
using (public.xr_is_workspace_member(workspace_id));

drop policy if exists "xr_members_insert" on public.xr_workspace_members;
create policy "xr_members_insert" on public.xr_workspace_members
for insert to authenticated
with check (public.xr_is_workspace_admin(workspace_id));

drop policy if exists "xr_members_update" on public.xr_workspace_members;
create policy "xr_members_update" on public.xr_workspace_members
for update to authenticated
using (public.xr_is_workspace_admin(workspace_id))
with check (public.xr_is_workspace_admin(workspace_id));

drop policy if exists "xr_members_delete" on public.xr_workspace_members;
create policy "xr_members_delete" on public.xr_workspace_members
for delete to authenticated
using (public.xr_is_workspace_admin(workspace_id));

drop policy if exists "xr_projects_select" on public.xr_projects;
create policy "xr_projects_select" on public.xr_projects
for select to authenticated
using (public.xr_is_workspace_member(workspace_id));

drop policy if exists "xr_projects_insert" on public.xr_projects;
create policy "xr_projects_insert" on public.xr_projects
for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and public.xr_can_write_workspace(workspace_id)
);

drop policy if exists "xr_projects_update" on public.xr_projects;
create policy "xr_projects_update" on public.xr_projects
for update to authenticated
using (public.xr_can_write_workspace(workspace_id))
with check (public.xr_can_write_workspace(workspace_id));

drop policy if exists "xr_projects_delete" on public.xr_projects;
create policy "xr_projects_delete" on public.xr_projects
for delete to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1 from public.xr_workspace_members m
    where m.workspace_id = xr_projects.workspace_id
      and m.user_id = (select auth.uid())
      and m.role = 'admin'
  )
);

drop policy if exists "xr_versions_select" on public.xr_project_versions;
create policy "xr_versions_select" on public.xr_project_versions
for select to authenticated
using (
  exists (
    select 1 from public.xr_projects p
    where p.id = xr_project_versions.project_id
      and public.xr_is_workspace_member(p.workspace_id)
  )
);

drop policy if exists "xr_versions_insert" on public.xr_project_versions;
create policy "xr_versions_insert" on public.xr_project_versions
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.xr_projects p
    where p.id = xr_project_versions.project_id
      and public.xr_can_write_workspace(p.workspace_id)
  )
);

grant select, insert, update, delete on public.xr_workspaces to authenticated;
grant select, insert, update, delete on public.xr_workspace_members to authenticated;
grant select, insert, update, delete on public.xr_projects to authenticated;
grant select, insert on public.xr_project_versions to authenticated;
