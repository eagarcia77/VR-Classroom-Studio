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

## V14 collaboration extension
- Review comments: project members can read; authenticated project members can create; comment author or workspace Admin can modify/delete.
- Review tasks: workspace writers can create/update/delete; identity fields are immutable.
- Project approvals: workspace owner/Admin/Reviewer can approve; project/gate identity is immutable.
- Project locks: workspace writers can acquire/update their own locks.
- Media asset metadata: workspace writers can create/update/delete; project/uploader identity is immutable.
- Private `xr-media` Storage bucket uses project ID as the first path segment and inherits workspace membership/write authorization.


## V15 realtime and invitation extension
- Realtime Presence uses authenticated Supabase channels and does not expose privileged server credentials.
- Workspace invitations are created by workspace Admin/Owner and matched against the authenticated user's email when claimed.
- Invitation acceptance is performed through a security-definer RPC with expiry, email and authentication checks.
- Authenticated browser clients do not receive direct UPDATE permission on invitation state.
- Activity events are append-only to authenticated project/workspace members.
- Realtime publication is prepared for review comments, tasks, approvals, locks and media metadata.
- Private Storage uploads remain project-scoped through V14 RLS policies.


## V16 intelligent collaboration extension
- `xr_alignment_reports` is RLS-protected and readable only by workspace members.
- Authenticated workspace members may insert alignment reports only as themselves.
- `xr_activity_events` and alignment reports are prepared for Supabase Realtime publication.
- V16 does not add privileged browser credentials or bypass V13/V14/V15 authorization helpers.
- Conflict resolution remains an explicit user decision per audited project domain; there is no automatic destructive merge.


## V17 adaptive learning extension
- Added RLS-protected `xr_competencies`, `xr_mastery_snapshots` and `xr_experience_statements` tables.
- Competency identity fields are immutable; workspace writers may update only mutable competency content.
- Mastery snapshots and experience statements are insert-only for authenticated workspace members through the supplied client grants.
- Realtime publication is prepared for mastery snapshots and experience statements.
- These analytics tables are optional and do not alter Blackboard SCORM playback requirements.


## V18 accessibility evidence extension
- Added RLS-protected `xr_accessibility_reports` and `xr_publication_reports` tables.
- Reports are append-only for authenticated workspace members through the supplied grants.
- Realtime publication is prepared for both report types.
- Accessibility reports are explicitly treated as authoring QA evidence, not legal or standards certification.


## V19 delivery evidence extension
- Added RLS-protected `xr_delivery_reports` for append-only delivery QA evidence.
- Authenticated workspace members can insert reports only as themselves.
- Reports can include self-test and Production Audit snapshots plus non-secret package metadata.
- A SHA-256 fingerprint of selected package metadata can be stored for traceability; no privileged credential is included.
- Realtime publication is prepared for delivery reports.


## V20 release evidence extension
- Added RLS-protected `xr_test_runs`, `xr_release_candidates` and `xr_blackboard_validations` tables.
- Authenticated workspace members can insert test/validation evidence as themselves; Release Candidate insertion requires workspace write permission.
- Client grants are append-only (SELECT + INSERT), preserving historical QA evidence.
- Realtime publication is prepared for all three evidence tables.
- Release Candidate records store fingerprints and summaries, not privileged credentials or student records.

## V21 institutional release extension
- Added RLS-protected xr_releases and xr_release_events.
- Release rows are created only as Draft and must reference a same-project cloud Release Candidate with passing V20 test evidence.
- Browser clients do not receive direct UPDATE permission for release status; transitions use the security-definer xr_transition_release(...) RPC.
- Transition permissions are role-aware: writer for QA, approval-authorized reviewer/admin for Approved, and Admin/Owner for Published/Retired.
- Approved requires all four governance approval gates.
- Published requires a passing Blackboard validation tied to the same Release Candidate.
- A partial unique index guarantees one Published release per project; publishing automatically retires the prior production release.
- Release identity fields and project fingerprint are immutable after insert.
