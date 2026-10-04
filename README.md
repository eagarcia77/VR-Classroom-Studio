# VR Classroom Studio

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
- UCAN Academic Mall
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
