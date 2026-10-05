# V21 Institutional Release Management Setup

Apply after V13–V20 in a dedicated VR Classroom Studio Supabase project.

V21 adds:
- `xr_releases`
- `xr_release_events`
- secure sequential release-transition RPC `xr_transition_release(...)`

Release lifecycle:
`draft → qa → approved → published → retired`

Cloud authorization:
- Draft → QA: workspace writer.
- QA → Approved: workspace owner/Admin/Reviewer approval permission.
- Approved → Published: workspace owner/Admin.
- Published → Retired: workspace owner/Admin.

A partial unique index enforces a single `published` release per project. Publishing a new release automatically retires the prior production release.

The release fingerprint is traceability metadata; it does not replace source control or the V19/V20 QA checks.
