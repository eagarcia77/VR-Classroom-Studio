# V19 Blackboard Delivery QA Setup

Apply after V13–V18 in a dedicated VR Classroom Studio Supabase project.

V19 adds the optional table:

- `xr_delivery_reports`

It can preserve authoring-side evidence of:
- delivery profile;
- SCORM package self-test results;
- blocker/warning counts;
- production audit snapshot;
- package metadata.

This table is not required for Blackboard playback. Exported SCORM packages remain standalone.

The in-browser V19 self-test is a deterministic package/runtime smoke test. It does not replace a final LMS import test in the institution's actual Blackboard environment.
