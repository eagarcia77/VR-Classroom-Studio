-- VR Classroom Studio V14 — collaboration and cloud media extension
-- Requires supabase/schema_v13.sql first.
-- Apply only to a dedicated VR Classroom Studio Supabase project.

create table if not exists public.xr_review_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.xr_projects(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  severity text not null default 'note' check (severity in ('note','warning','blocker')),
  anchor_type text not null default 'project' check (anchor_type in ('project','scene','object','station')),
  anchor_id text,
  body text not null check (char_length(body) between 1 and 10000),
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.xr_review_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.xr_projects(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  assignee_id uuid references auth.users(id) on delete set null,
  title text not null check (char_length(title) between 1 and 500),
  priority text not null default 'normal' check (priority in ('normal','high','blocker')),
  status text not null default 'open' check (status in ('open','done')),
  due_date date,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.xr_project_approvals (
  project_id uuid not null references public.xr_projects(id) on delete cascade,
  gate text not null check (gate in ('instructional','accessibility','technical','final')),
  approved_by uuid not null references auth.users(id) on delete cascade,
  approved_at timestamptz not null default now(),
  note text,
  primary key (project_id, gate)
);

create table if not exists public.xr_project_locks (
  project_id uuid primary key references public.xr_projects(id) on delete cascade,
  locked_by uuid not null references auth.users(id) on delete cascade,
  lock_token uuid not null default gen_random_uuid(),
  acquired_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (expires_at > acquired_at)
);

create table if not exists public.xr_media_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.xr_projects(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  byte_size bigint not null default 0 check (byte_size >= 0),
  sha256 text check (sha256 is null or sha256 ~ '^[0-9a-f]{64}$'),
  accessibility jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(project_id, storage_path)
);

create index if not exists xr_review_comments_project_idx on public.xr_review_comments(project_id, created_at desc);
create index if not exists xr_review_tasks_project_idx on public.xr_review_tasks(project_id, status, due_date);
create index if not exists xr_media_assets_project_idx on public.xr_media_assets(project_id);

alter table public.xr_review_comments enable row level security;
alter table public.xr_review_tasks enable row level security;
alter table public.xr_project_approvals enable row level security;
alter table public.xr_project_locks enable row level security;
alter table public.xr_media_assets enable row level security;

create or replace function public.xr_project_workspace(target_project uuid)
returns uuid
language sql stable security definer
set search_path = public
as $$
  select workspace_id from public.xr_projects where id = target_project
$$;

create or replace function public.xr_can_approve_project(target_project uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.xr_projects p
    where p.id = target_project
      and (
        p.owner_id = (select auth.uid())
        or exists (
          select 1 from public.xr_workspace_members m
          where m.workspace_id = p.workspace_id
            and m.user_id = (select auth.uid())
            and m.role in ('admin','reviewer')
        )
      )
  )
$$;

revoke all on function public.xr_project_workspace(uuid) from public;
revoke all on function public.xr_can_approve_project(uuid) from public;
grant execute on function public.xr_project_workspace(uuid) to authenticated;
grant execute on function public.xr_can_approve_project(uuid) to authenticated;

drop policy if exists "xr_review_comments_select" on public.xr_review_comments;
create policy "xr_review_comments_select" on public.xr_review_comments
for select to authenticated
using (public.xr_is_workspace_member(public.xr_project_workspace(project_id)));

drop policy if exists "xr_review_comments_insert" on public.xr_review_comments;
create policy "xr_review_comments_insert" on public.xr_review_comments
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and public.xr_is_workspace_member(public.xr_project_workspace(project_id))
);

drop policy if exists "xr_review_comments_update" on public.xr_review_comments;
create policy "xr_review_comments_update" on public.xr_review_comments
for update to authenticated
using (
  created_by = (select auth.uid())
  or public.xr_is_workspace_admin(public.xr_project_workspace(project_id))
)
with check (
  created_by = (select auth.uid())
  or public.xr_is_workspace_admin(public.xr_project_workspace(project_id))
);

drop policy if exists "xr_review_comments_delete" on public.xr_review_comments;
create policy "xr_review_comments_delete" on public.xr_review_comments
for delete to authenticated
using (
  created_by = (select auth.uid())
  or public.xr_is_workspace_admin(public.xr_project_workspace(project_id))
);

drop policy if exists "xr_review_tasks_select" on public.xr_review_tasks;
create policy "xr_review_tasks_select" on public.xr_review_tasks
for select to authenticated
using (public.xr_is_workspace_member(public.xr_project_workspace(project_id)));

drop policy if exists "xr_review_tasks_write" on public.xr_review_tasks;
drop policy if exists "xr_review_tasks_insert" on public.xr_review_tasks;
create policy "xr_review_tasks_insert" on public.xr_review_tasks
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and public.xr_can_write_workspace(public.xr_project_workspace(project_id))
);

drop policy if exists "xr_review_tasks_update" on public.xr_review_tasks;
create policy "xr_review_tasks_update" on public.xr_review_tasks
for update to authenticated
using (public.xr_can_write_workspace(public.xr_project_workspace(project_id)))
with check (public.xr_can_write_workspace(public.xr_project_workspace(project_id)));

drop policy if exists "xr_review_tasks_delete" on public.xr_review_tasks;
create policy "xr_review_tasks_delete" on public.xr_review_tasks
for delete to authenticated
using (public.xr_can_write_workspace(public.xr_project_workspace(project_id)));

drop policy if exists "xr_project_approvals_select" on public.xr_project_approvals;
create policy "xr_project_approvals_select" on public.xr_project_approvals
for select to authenticated
using (public.xr_is_workspace_member(public.xr_project_workspace(project_id)));

drop policy if exists "xr_project_approvals_insert" on public.xr_project_approvals;
create policy "xr_project_approvals_insert" on public.xr_project_approvals
for insert to authenticated
with check (
  approved_by = (select auth.uid())
  and public.xr_can_approve_project(project_id)
);

drop policy if exists "xr_project_approvals_update" on public.xr_project_approvals;
create policy "xr_project_approvals_update" on public.xr_project_approvals
for update to authenticated
using (public.xr_can_approve_project(project_id))
with check (
  approved_by = (select auth.uid())
  and public.xr_can_approve_project(project_id)
);

drop policy if exists "xr_project_approvals_delete" on public.xr_project_approvals;
create policy "xr_project_approvals_delete" on public.xr_project_approvals
for delete to authenticated
using (public.xr_can_approve_project(project_id));

drop policy if exists "xr_project_locks_select" on public.xr_project_locks;
create policy "xr_project_locks_select" on public.xr_project_locks
for select to authenticated
using (public.xr_is_workspace_member(public.xr_project_workspace(project_id)));

drop policy if exists "xr_project_locks_write" on public.xr_project_locks;
create policy "xr_project_locks_write" on public.xr_project_locks
for all to authenticated
using (
  locked_by = (select auth.uid())
  and public.xr_can_write_workspace(public.xr_project_workspace(project_id))
)
with check (
  locked_by = (select auth.uid())
  and public.xr_can_write_workspace(public.xr_project_workspace(project_id))
);

drop policy if exists "xr_media_assets_select" on public.xr_media_assets;
create policy "xr_media_assets_select" on public.xr_media_assets
for select to authenticated
using (public.xr_is_workspace_member(public.xr_project_workspace(project_id)));

drop policy if exists "xr_media_assets_write" on public.xr_media_assets;
drop policy if exists "xr_media_assets_insert" on public.xr_media_assets;
create policy "xr_media_assets_insert" on public.xr_media_assets
for insert to authenticated
with check (
  uploaded_by = (select auth.uid())
  and public.xr_can_write_workspace(public.xr_project_workspace(project_id))
);

drop policy if exists "xr_media_assets_update" on public.xr_media_assets;
create policy "xr_media_assets_update" on public.xr_media_assets
for update to authenticated
using (public.xr_can_write_workspace(public.xr_project_workspace(project_id)))
with check (public.xr_can_write_workspace(public.xr_project_workspace(project_id)));

drop policy if exists "xr_media_assets_delete" on public.xr_media_assets;
create policy "xr_media_assets_delete" on public.xr_media_assets
for delete to authenticated
using (public.xr_can_write_workspace(public.xr_project_workspace(project_id)));


create or replace function public.xr_protect_review_comment_identity()
returns trigger
language plpgsql
set search_path = public
as $
begin
  if new.project_id is distinct from old.project_id
     or new.created_by is distinct from old.created_by then
    raise exception 'review comment identity fields are immutable';
  end if;
  return new;
end;
$;

drop trigger if exists xr_review_comments_protect_identity on public.xr_review_comments;
create trigger xr_review_comments_protect_identity
before update on public.xr_review_comments
for each row execute function public.xr_protect_review_comment_identity();

create or replace function public.xr_protect_review_task_identity()
returns trigger
language plpgsql
set search_path = public
as $
begin
  if new.project_id is distinct from old.project_id
     or new.created_by is distinct from old.created_by then
    raise exception 'review task identity fields are immutable';
  end if;
  return new;
end;
$;

drop trigger if exists xr_review_tasks_protect_identity on public.xr_review_tasks;
create trigger xr_review_tasks_protect_identity
before update on public.xr_review_tasks
for each row execute function public.xr_protect_review_task_identity();

create or replace function public.xr_protect_approval_identity()
returns trigger
language plpgsql
set search_path = public
as $
begin
  if new.project_id is distinct from old.project_id
     or new.gate is distinct from old.gate then
    raise exception 'approval identity fields are immutable';
  end if;
  return new;
end;
$;

drop trigger if exists xr_project_approvals_protect_identity on public.xr_project_approvals;
create trigger xr_project_approvals_protect_identity
before update on public.xr_project_approvals
for each row execute function public.xr_protect_approval_identity();

create or replace function public.xr_protect_media_asset_identity()
returns trigger
language plpgsql
set search_path = public
as $
begin
  if new.project_id is distinct from old.project_id
     or new.uploaded_by is distinct from old.uploaded_by then
    raise exception 'media asset identity fields are immutable';
  end if;
  return new;
end;
$;

drop trigger if exists xr_media_assets_protect_identity on public.xr_media_assets;
create trigger xr_media_assets_protect_identity
before update on public.xr_media_assets
for each row execute function public.xr_protect_media_asset_identity();

grant select, insert, update, delete on public.xr_review_comments to authenticated;
grant select, insert, update, delete on public.xr_review_tasks to authenticated;
grant select, insert, update, delete on public.xr_project_approvals to authenticated;
grant select, insert, update, delete on public.xr_project_locks to authenticated;
grant select, insert, update, delete on public.xr_media_assets to authenticated;

-- Private media bucket for future cloud media sync.
insert into storage.buckets (id, name, public, file_size_limit)
values ('xr-media', 'xr-media', false, 104857600)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "xr_media_storage_select" on storage.objects;
create policy "xr_media_storage_select" on storage.objects
for select to authenticated
using (
  bucket_id = 'xr-media'
  and array_length(storage.foldername(name), 1) >= 1
  and exists (
    select 1 from public.xr_projects p
    where p.id::text = (storage.foldername(name))[1]
      and public.xr_is_workspace_member(p.workspace_id)
  )
);

drop policy if exists "xr_media_storage_insert" on storage.objects;
create policy "xr_media_storage_insert" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'xr-media'
  and array_length(storage.foldername(name), 1) >= 1
  and exists (
    select 1 from public.xr_projects p
    where p.id::text = (storage.foldername(name))[1]
      and public.xr_can_write_workspace(p.workspace_id)
  )
);

drop policy if exists "xr_media_storage_update" on storage.objects;
create policy "xr_media_storage_update" on storage.objects
for update to authenticated
using (
  bucket_id = 'xr-media'
  and exists (
    select 1 from public.xr_projects p
    where p.id::text = (storage.foldername(name))[1]
      and public.xr_can_write_workspace(p.workspace_id)
  )
)
with check (
  bucket_id = 'xr-media'
  and exists (
    select 1 from public.xr_projects p
    where p.id::text = (storage.foldername(name))[1]
      and public.xr_can_write_workspace(p.workspace_id)
  )
);

drop policy if exists "xr_media_storage_delete" on storage.objects;
create policy "xr_media_storage_delete" on storage.objects
for delete to authenticated
using (
  bucket_id = 'xr-media'
  and exists (
    select 1 from public.xr_projects p
    where p.id::text = (storage.foldername(name))[1]
      and public.xr_can_write_workspace(p.workspace_id)
  )
);
