# V14 Collaboration and Cloud Media Setup

V14 extends the V13 cloud-ready model with review governance and private XR media storage.

Apply in order to a **dedicated VR Classroom Studio Supabase project**:

1. `supabase/schema_v13.sql`
2. `supabase/schema_v14.sql`
3. Run Supabase Security Advisor.
4. Run Supabase Performance Advisor.
5. Verify Auth redirect URLs include the production Render URL.
6. Test Owner/Admin, Instructor and Reviewer accounts separately.

## Cloud collaboration tables

- `xr_review_comments`
- `xr_review_tasks`
- `xr_project_approvals`
- `xr_project_locks`
- `xr_media_assets`

## Storage

V14 defines a private `xr-media` bucket with a 100 MB per-file limit.

Expected object path:

`<project-uuid>/<asset-file-name>`

Storage policies map the first folder segment to `xr_projects.id` and reuse the workspace membership/write functions created by V13.

## Important

The current V14 browser UI computes local SHA-256 media fingerprints and stores review/governance metadata in the project JSON. The Supabase collaboration tables and Storage bucket are **ready for a future dedicated backend connection** but are not applied automatically.
