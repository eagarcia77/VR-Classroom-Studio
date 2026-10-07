# VR Classroom Studio

## V26 — Immersive Lesson Forge

V26 returns the application to its original instructional-authoring purpose: an instructor can transform learning objectives into a functional multi-scene immersive activity, preview it, validate it and export it to Blackboard as SCORM without manual VR programming.

The forge creates distinct spatial architectures rather than cosmetic variants:
- **Central Hub:** a hub-and-spoke world with bidirectional portals between the mission hub and each objective room.
- **Mission Sequence:** a guided linear path from briefing through each objective to a completion deck.
- **Knowledge Constellation:** a nonlinear nexus with objective rooms, return routes and cross-links between objective nodes.

For every learning objective, V26 creates a required evidence station, spatial station marker, competency mapping and a share of a 100-point scoring blueprint. Activity modes adapt the instructional prompt for exploration, scenario, simulated lab or role-play. Delivery can target hybrid Desktop + VR, VR-first, AR-oriented or Desktop 3D while retaining the non-VR fallback setting.

Generated instructional worlds require explicit instructor review before final SCORM export.



## V25 — Intelligent Minimal Command Center

V25 adds a global Command Palette (Cmd/Ctrl + K), cross-project search across scenes, stations, NPCs, competencies, media, 3D objects and releases, Focus Mode, a compact project-readiness dashboard, keyboard-first navigation and a contextual VRC-NOVA guide driven by the current project state. V25 is authoring-only and does not alter the exported SCORM runtime.



## V24 — Minimalist White Experience

V24 establishes the white minimalist interface as the primary visual experience across authoring, governance, QA, adaptive learning and release management. Dark surfaces are intentionally retained only where they improve technical or immersive readability, such as 3D/XR previews, spatial graphs and diagnostic logs. The orbital logo remains in the header and VRC-NOVA is reduced to a subtle interface-guide presence.



## V23 — Holographic World Engine

V23 adds the production visual identity assets, VRC-NOVA interface mascot, Holographic World Engine, and a deterministic Course Digital Twin simulator. Synthetic learner agents are used only for route/QA stress testing; they are not presented as predictions of real student behavior.


## V22 — Cosmic Intelligence / Deep-XR

V22 adds a frontier-technology layer using real browser/XR capabilities: Cosmic Mission Control, device capability telemetry, a Spatial Knowledge Constellation graph, deterministic Procedural Scenario Synthesis, a runtime Constellation Navigator, and Deep-XR topology/performance auditing.

The optional `Alien-Inspired` presentation mode is strictly an aesthetic/interaction concept. The application does not claim to use verified extraterrestrial technology.


## Ownership

**Owner & Creator:** Eduardo Augusto García Rodríguez  
**Application:** VR Classroom Studio  
**Original application copyright:** © 2026 Eduardo Augusto García Rodríguez.

Third-party libraries, standards, trademarks, LMS/platform names and externally supplied content remain subject to their respective owners, licenses and terms. This ownership notice identifies the creator/owner of the original application and does not represent a government trademark registration.


## V21 — Release Management & Institutional QA Dashboard

V21 adds an institutional release lifecycle (Draft → QA → Approved → Published → Retired), semantic versioning, one-authorized-production-release control, Release Candidate fingerprint binding, regression summaries, generated changelog metadata, rollback planning, release governance timeline, local release ledger export, and a cloud-ready release workflow with secure transition RPCs.


## V20 — Blackboard Test Lab & Release Candidate Workflow

V20 adds deterministic SCORM lifecycle/resume tests, a large suspend-data smoke test, score/pass-fail edge-case tests, Release Candidate fingerprints, regression summaries, a delivery-profile-aware Blackboard post-upload checklist, diagnostic report downloads, and optional append-only cloud evidence for test runs, release candidates and Blackboard validation records.

## V19 — Blackboard Delivery & QA Automation

V19 adds an in-memory SCORM package self-test, ZIP inspector, SCORM 2004 lifecycle simulator against a mock LMS API, delivery profiles, an export gate that runs package QA before download, downloadable QA reports, and optional cloud delivery-report persistence. The self-test validates packaging and runtime assumptions but does not replace a final import test in the institution's actual Blackboard environment.

## V18 — Accessibility & Quality Intelligence

V18 adds WCAG-oriented authoring checks, keyboard/focus mapping, a contrast calculator, motion-safety controls, an equivalent Accessible 2D Mode inside the exported runtime, and a Blackboard Publication Checklist that cross-checks SCORM manifest coverage, media bytes, accessibility blockers, score configuration and production-audit blockers. These checks support QA but do not constitute formal WCAG certification.

## V17 — Adaptive Learning & Experience Intelligence

V17 adds competencies, mastery thresholds, evidence mapping, adaptive remediation/mastery routes, an Experience Intelligence dashboard, xAPI-shaped local/runtime event objects, and optional cloud analytics tables for competencies, mastery snapshots and experience statements. Blackboard delivery remains SCORM-first and standalone.

## V16 — Intelligent Collaborative Authoring

V16 adds clickable 3D review pins anchored to scene objects, a collaborative activity feed with Realtime-ready cloud events, a learning-alignment audit across objectives/activities/assessment/SCORM scoring, persisted cloud alignment reports, and a domain-level conflict resolver for selectively keeping local or cloud project sections. All cloud capabilities remain optional.

## V15 — Live Collaboration Ready

V15 adds Supabase Realtime presence, cloud review/task/approval synchronization, private cloud media upload adapter, secure workspace invitation records, pending-invite claim flow, cloud merge preflight, and a V15 schema extension for invitations, activity events and Realtime publication. All cloud features remain optional; local authoring and standalone Blackboard SCORM continue to work without a backend.

## V14 — Collaborative Review & Governance

V14 adds anchored review comments, remediation tasks, configurable publication approvals, local multi-tab presence/locking, SHA-256 media integrity fingerprints, publication governance checks, and a cloud-ready collaboration/storage schema for a future dedicated Supabase backend. Critical review blockers, blocker tasks, required approvals, or media integrity mismatches can prevent an audited export.

## V13 — Cloud-Ready Institutional Platform

V13 adds an optional authenticated Supabase cloud adapter while preserving the V12 local workspace and standalone SCORM workflow. It supports magic-link authentication, cloud workspaces, project sync with optimistic revision checks, cloud version snapshots and restore-as-working-copy. A dedicated RLS schema is included in `supabase/schema_v13.sql`. No existing Supabase project is modified automatically.

## V12 — Institutional XR Workspace

V12 adds a local multi-project dashboard, institutional metadata, structural autosave, persistent local version history, project cloning, reusable structural templates, local workflow roles (Instructor/Reviewer/Admin), and institutional audit checks. Roles are intentionally identified as workflow/UI roles only until real authentication and server-side RBAC are introduced.

## V11 — Professional XR Authoring

V11 adds direct in-canvas transform gizmo controls, multi-selection, grouping/ungrouping, duplication, grid snapping, animation timeline authoring, authoring-side learning analytics, and an experimental capability-gated immersive-AR placement mode using WebXR hit-test where supported. Desktop 3D and VR remain the stable fallback modes.

## V10 — Visual Logic & Smart Scenario Studio

V10 adds a visual WHEN/IF/THEN rule editor, branching NPC dialogue nodes and choices, a local Smart Scenario Generator that creates scenes/stations/rules/NPC guidance from a pedagogical brief, and asset-level accessibility metadata for media. Generated station scoring is normalized to exactly 100 points and no external AI/API is required.

## V9 — NPC & Scenario Studio

V9 adds virtual guides/NPCs, optional packaged GLB/GLTF NPC models, accessible text dialogue, conditional NPC availability, variable updates, bonus scoring, an automatic Scenario State Map, object-state metadata with runtime effects, and a direct transform pad linked to the V6 3D selection. NPC awards and object states persist through SCORM suspend data.

## V8 — Immersive Simulation Objects

V8 adds collectibles and inventory, smart doors/locks, trigger zones, inspectable objects, packaged media screens, proximity audio zones, and packaged 360° scene backgrounds. The runtime persists inventory through SCORM suspend data and the production audit now validates inventory mappings, door dependencies, trigger-zone geometry, immersive media references, and 360° assets.

## V7 — Interaction & Simulation Engine

V7 adds project variables, interactive hotspots, WHEN/IF/THEN simulation rules, branching to scenes, conditional actions, timer events, bonus scoring, and SCORM-resumable simulation state. Production audit checks validate event sources, branching targets, variables, timers and whether any simulation behavior is enabled.

## V6 — Live 3D Authoring Studio

V6 adds a real WebGL/A-Frame authoring scene, direct object selection, hierarchy view, X/Y/Z transforms, rotation, scale, keyboard nudging, camera presets, duplication, and undo/redo. The production audit now also checks 3D scale validity, spatial bounds, empty scenes, and orphaned scene mappings.

## V5 — Media Packaging, Project Bundles & XR Capability Checks

V5 adds local-media packaging for GLB/GLTF, images, video, audio and PDF; Project Bundle export/import; scene duplication/deletion; browser-session snapshots; device XR capability checks; and V5 audit checks for missing media bytes, orphaned local assets and remaining external-model dependencies.

## V4 — Production Audit & Hardened SCORM

V4 adds a built-in production readiness audit, hardened SCORM session/resume handling, accessible runtime dialogs, and a self-contained A-Frame 1.8.0 runtime bundled into new SCORM exports. See `AUDIT_REPORT.md` for the current engineering status.

VR Classroom Studio is a browser-based immersive authoring platform for instructors who want to create VR/AR-ready learning experiences and export them as **SCORM 2004** packages for **Blackboard Ultra**.

## V3 — Spatial Authoring + Assessment

### Spatial Designer
- Multi-scene immersive projects
- Visual top-view room designer
- Drag-and-drop positioning
- Editable X/Z coordinates
- Rotation and scale controls
- Scene-specific objects
- Portal objects that connect scenes
- Learning-station markers
- Scene switching from the authoring interface

### Immersive templates
- Immersive Academic Hub
- Virtual Classroom
- Simulation Lab
- Museum / Gallery
- Cybersecurity Operations Center
- Clinical Simulation Room

### 3D/XR authoring
- A-Frame / WebXR runtime
- Desktop 3D fallback
- VR-prioritized and desktop-prioritized modes
- AR-ready project mode
- Locomotion configuration
- Environment themes
- Spatial-audio project setting
- Built-in object types
- Custom GLB/GLTF URL registration

### Advanced assessment engine
- Questions attached to immersive stations
- Multiple choice
- True/false
- Reflection activities
- Per-question points
- Automated answer scoring
- Station completion + assessment points combined in the SCORM score

### Accessibility and comfort
- Accessibility labels for stations
- Reduced-motion project policy
- High-contrast project policy
- Captions/transcript policy
- Required non-VR alternative option

### Blackboard / SCORM 2004
The exported SCO reports:
- `cmi.score.raw`
- `cmi.score.scaled`
- `cmi.progress_measure`
- `cmi.completion_status`
- `cmi.success_status`

### Project portability
- Save/load project locally
- Export project definition to JSON
- Import project JSON
- No student data is stored by the authoring site

## Live application

https://vr-classroom-studio.onrender.com

## Blackboard workflow

1. Design the immersive experience.
2. Create one or more scenes.
3. Place stations, objects and portals.
4. Add learning objectives.
5. Add assessments.
6. Configure XR and accessibility.
7. Validate the project.
8. Preview the student experience.
9. Export SCORM 2004.
10. Upload the generated ZIP to Blackboard Ultra.

## Repository

- `index.html` — core instructor authoring application and SCORM exporter
- `v3.js` — spatial designer, multi-scene system and assessment engine
- `v3.css` — V3 authoring UI styles
- `scorm_template/` — reference SCORM source files
- `render.yaml` — Render static-site configuration

## Next engineering priorities

- Full 3D authoring canvas with transform gizmos
- Bundled local GLB/GLTF uploads inside SCORM ZIP
- 360° images and video environments
- Rich media manager
- Branching rules and conditional portals
- Question banks and randomized assessment pools
- AR placement workflow
- Scene thumbnails and room cloning
- Autosave/version history
- WCAG-oriented authoring audit
- xAPI/cmi5 output
- LTI 1.3 institutional integration
- AI-assisted scene, assessment and learning-objective generation
