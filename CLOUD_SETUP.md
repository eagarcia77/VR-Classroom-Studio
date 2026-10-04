# V13 Cloud Setup

VR Classroom Studio V13 is cloud-ready but does not automatically reuse another application's Supabase database.

## Recommended deployment

1. Create a dedicated Supabase project for VR Classroom Studio.
2. Apply `supabase/schema_v13.sql`.
3. Confirm the Security Advisor has no missing-RLS warnings.
4. Obtain the project URL and a **publishable** key.
5. In VR Classroom Studio open **Cloud Workspace V13** and enter those values.
6. Use email magic-link authentication.
7. Create a workspace, then sync projects.

## Security model

- Browser: publishable key only.
- Never place a service-role key in the browser or repository.
- All exposed tables have Row Level Security enabled.
- Workspace membership controls project read access.
- Only workspace owner/admin/instructor roles can write.
- Reviewer is read-only at the database-policy level when using the supplied schema.
- SCORM packages do not require Supabase and remain standalone for Blackboard playback.

## Important

Local media binaries are still packaged in Project Bundles/SCORM. V13 cloud sync stores structured project JSON. A future Storage migration can add cloud media assets after a dedicated backend is provisioned and audited.
