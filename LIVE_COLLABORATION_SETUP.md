# V15 Live Collaboration Setup

V15 extends the cloud-ready architecture with Realtime collaboration primitives and secure invitation records.

Apply in order to a **dedicated** VR Classroom Studio Supabase project:

1. `supabase/schema_v13.sql`
2. `supabase/schema_v14.sql`
3. `supabase/schema_v15.sql`
4. Run Security Advisor.
5. Run Performance Advisor.
6. Test Owner/Admin, Instructor and Reviewer accounts independently.
7. Verify Realtime is enabled for the project.

## Added capabilities

- Workspace invitation records by email.
- Secure invitation claim RPC matched against the authenticated user's email.
- Append-only activity-event table.
- Realtime publication for comments, tasks, approvals, project locks and media metadata.
- Supabase Presence/Broadcast channels for live collaborator awareness.

## Important

The browser creates invitation records but does not send institutional email by itself. Email delivery should be handled by an approved mail workflow, Edge Function or other backend action.

SCORM playback remains independent of the cloud layer.
