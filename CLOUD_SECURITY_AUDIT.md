# V13 Cloud Security Audit

Status: **Cloud-ready, not provisioned**

## Isolation decision
Existing Supabase projects were inspected only to identify available infrastructure. VR Classroom Studio is not connected to or sharing tables with those projects.

## Browser credentials
- Allowed: modern Supabase publishable key or legacy anon key.
- Rejected: `sb_secret_...` and detectable `service_role` JWTs.
- No service-role credential is stored in the repository or browser configuration.

## Database authorization model
The supplied `supabase/schema_v13.sql` enables Row Level Security on:
- `xr_workspaces`
- `xr_workspace_members`
- `xr_projects`
- `xr_project_versions`

Role intent:
- Workspace owner/Admin: membership administration and project write access.
- Instructor: project/version write access.
- Reviewer: read access only.

Database triggers prevent reassignment of:
- workspace `owner_id`
- project `owner_id`
- project `workspace_id`

## Conflict control
Cloud project updates use a numeric `revision`. The browser updates only when its expected revision matches the database row. A mismatch is surfaced as a conflict instead of silently overwriting newer work.

## Data boundary
SCORM playback does not require Supabase. Exported SCORM packages remain standalone for Blackboard. V13 cloud sync stores structured JSON; local media binaries remain in Project Bundle/SCORM until a future audited Storage implementation is provisioned.

## Provisioning requirement
Do not apply this schema to FYNEXO or another unrelated database. Create a dedicated Supabase project, apply the migration, then run Supabase Security and Performance Advisors before enabling production cloud sync.