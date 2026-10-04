# V16 Intelligent Collaboration Setup

Apply after the earlier cloud-ready migrations:

1. `supabase/schema_v13.sql`
2. `supabase/schema_v14.sql`
3. `supabase/schema_v15.sql`
4. `supabase/schema_v16.sql`

V16 adds:

- Realtime publication for `xr_activity_events`.
- Optional persisted learning-alignment reports.
- Realtime publication for alignment reports.

The browser continues to work without these migrations. If the dedicated backend is not provisioned, V16 falls back to local activity, local review pins, local alignment analysis and local conflict comparison UI.
