# VR Classroom Studio

VR Classroom Studio is an immersive authoring platform for instructors to design VR/AR-ready learning activities and export them as **SCORM 2004** packages for **Blackboard Ultra**.

## V2 — Immersive Authoring Studio

### Authoring
- Instructor dashboard
- UCAN Academic Mall starter experience
- Immersive template gallery
- Add, edit, reorder and remove learning stations
- Learning objectives editor
- Station types: resource, question/challenge, video, reflection and teleport/navigation
- Configurable required stations, points, completion rule and passing score

### XR
- A-Frame/WebXR runtime
- Desktop 3D fallback
- VR-prioritized, Desktop-prioritized and AR-ready project modes
- Locomotion configuration
- Environment themes
- Spatial-audio project setting
- 3D object library
- Custom GLB/GLTF URL registration

### Accessibility & comfort
- Reduced-motion project setting
- High-contrast project setting
- Captions/transcript policy
- Non-VR alternative policy
- Accessibility labels for learning stations

### Blackboard / SCORM
- Browser-side SCORM 2004 ZIP generation using JSZip
- SCORM reporting for score, scaled score, progress, completion and success
- Student preview before export
- Validation before packaging

### Project portability
- Local browser save/load
- Export project definition as JSON
- Import project JSON
- No student data is stored by the authoring site

## Live application

https://vr-classroom-studio.onrender.com

## Blackboard workflow

1. Create the immersive activity.
2. Add learning objectives and required stations.
3. Configure XR and accessibility settings.
4. Select **Validate**.
5. Preview the student experience.
6. Select **Export SCORM**.
7. In Blackboard Ultra, create/upload a SCORM package.
8. Configure Blackboard grading and attempt options.

## Repository architecture

- `index.html` — instructor authoring application, preview and SCORM generator
- `scorm_template/` — reference SCORM source files
- `render.yaml` — Render static-site blueprint

## Development roadmap

- True drag-and-drop 3D scene canvas with transform gizmos
- Local GLB/GLTF upload and bundling into exported SCORM
- 360° image/video environments
- Advanced assessment engine with answer choices and automated scoring
- Branching scenarios
- Interactive hotspot editor
- Media manager
- Scene-to-scene portals
- WebXR AR placement runtime
- xAPI/cmi5 option
- LTI 1.3 integration architecture
- Institutional template library
- AI-assisted room and assessment generation
- WCAG-oriented authoring audit
