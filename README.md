# VR Classroom Studio

VR Classroom Studio is a browser-based authoring tool for creating immersive classroom activities and exporting them as **SCORM 2004** packages for **Blackboard Ultra**.

## MVP features

- Instructor authoring dashboard
- UCAN Academic Mall-inspired starter experience
- Add, edit and delete immersive learning stations
- Station types: resources, questions/challenges, video, reflection and navigation
- Configurable required stations, points and passing score
- Student preview
- Browser-side SCORM 2004 ZIP generation using JSZip
- SCORM reporting: score, progress, completion and success
- A-Frame/WebXR runtime with desktop 3D fallback
- Local project save/load
- No student data is sent to this website

## Run locally

Open `index.html` in a modern browser, or serve the repository with any static web server.

## Blackboard workflow

1. Create the VR activity in VR Classroom Studio.
2. Select **Validate**.
3. Select **Export SCORM**.
4. In Blackboard Ultra, add a SCORM package and upload the generated ZIP.
5. Configure gradebook and attempt settings in Blackboard.

## Architecture

- `index.html` — instructor authoring application and SCORM exporter
- `scorm_template/` — reference SCORM source files
- `render.yaml` — Render static-site blueprint

## Roadmap

- Drag-and-drop 3D room editor
- GLB/GLTF object upload
- 360 images/video
- WebXR AR mode
- Branching scenarios and advanced assessment types
- Media library and reusable templates
- Accessibility audit and reduced-motion mode
- xAPI/cmi5 and LTI 1.3 options
- AI-assisted room and activity generation