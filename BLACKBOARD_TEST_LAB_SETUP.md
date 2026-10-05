# V20 Blackboard Test Lab & Release Candidate Setup

Apply after V13–V19 in a dedicated VR Classroom Studio Supabase project.

V20 adds optional append-only evidence tables:

- `xr_test_runs`
- `xr_release_candidates`
- `xr_blackboard_validations`

Release Candidates store a SHA-256 fingerprint of the project structure/media metadata used during QA. The record does not lock Blackboard or the browser; it provides a traceable baseline that the authoring UI can compare with the current project.

The post-upload validation is intentionally manual because only a real institutional Blackboard import can verify LMS-specific launch, gradebook, completion and resume behavior.
