AGENTS.md — Frontend-Only Christmas Tree Lucky Draw (Three.js)

0) Mission

Build a single-page, frontend-only “Lucky Draw” experience with stunning visuals suitable for live projection. The centerpiece is a 3D particle Christmas tree (Three.js) with participant names attached as particle-text labels. Each time the host presses Run, the scene plays a cinematic sequence: the tree rotates, names cycle and highlight to build anticipation, then the camera zooms in to reveal one winner clearly. Winners cannot win again within the same session (until Reset).

1) Hard Requirements (non-negotiable)
	•	Frontend-only: No backend, no network calls required.
	•	Three.js for rendering; use WebGL.
	•	Visuals: 3D particle Christmas tree, sparkle/twinkle effects, names displayed as particle-text labels.
	•	Interaction: Run triggers an anticipation animation culminating in a winner reveal.
	•	No repeat winners in-session: Each winner is removed from remaining pool.
	•	Handle ~140 names smoothly; target 60 FPS on a typical modern laptop.
	•	Winner must be legible on a projector (use an HTML overlay for crispness).

2) Deliverable

A runnable frontend project (Vite or similar) that launches locally.

Must include
	•	Clear README run instructions.
	•	A default embedded list of names (placeholder array), plus a UI to paste/import names.
	•	Buttons: Run, Reset, Paste/Import Names, Export Winners.
	•	Winners panel listing drawn winners (name + round + timestamp).

Nice-to-have
	•	Fullscreen toggle.
	•	Persist session state via localStorage (toggleable).
	•	Reduced motion support (prefers-reduced-motion).
	•	Basic sound toggle (if audio is added).

3) Recommended Tech Stack
	•	Vite + TypeScript + React (preferred) OR Vite + vanilla TS.
	•	three
	•	Postprocessing (choose one):
	•	three/examples/jsm/postprocessing/* with EffectComposer + UnrealBloomPass
	•	or postprocessing npm package (if faster)
	•	Text rendering for 3D labels:
	•	Preferred: troika-three-text (MSDF text; crisp in 3D)
	•	Alternative: Canvas-to-texture sprites (simpler; slightly less sharp)
	•	Winner overlay: HTML/CSS always.

4) UX / UI Spec

4.1 Layout
	•	Full-screen canvas background.
	•	Minimal UI overlay (top-left or bottom-left):
	•	Run (primary)
	•	Reset
	•	Paste/Import Names
	•	Export Winners
	•	Optional gear icon for settings
	•	Side or bottom panel: Winners list + remaining count.

4.2 States
	•	Idle: tree subtly animates (slow rotation, twinkles, snow).
	•	Running: Run disabled; show “Drawing…”; optional “Skip to reveal”.
	•	Completed: winner announced; Run re-enabled if remaining > 0.
	•	Exhausted: remaining = 0; Run disabled; show “All names drawn”.

4.3 Accessibility & legibility
	•	Winner overlay text must be very large and high-contrast.
	•	Support prefers-reduced-motion:
	•	Shorter camera moves, fewer flashes, reduced particle motion.

5) Functional Spec

5.1 Name Input
	•	Default list: names.json or names.ts exporting string[].
	•	Paste modal:
	•	one name per line
	•	trim whitespace
	•	remove empty lines
	•	optional dedupe toggle (default ON)
	•	Validate maximum display length:
	•	for long names, scale down in 3D; allow overlay to wrap.

5.2 Session State

Use a centralized state object:

type Winner = { name: string; timestamp: number; round: number };

type Settings = {
  persist: boolean;
  sound: boolean;
  reducedMotion: boolean;
  dedupe: boolean;
};

type AppState = {
  allNames: string[];
  remainingNames: string[];
  winners: Winner[];
  round: number;
  settings: Settings;
  isRunning: boolean;
};

5.3 Randomness & No-repeat Winners
	•	Shuffle remaining names once at session start or after import.
	•	Use Fisher–Yates with crypto.getRandomValues.
	•	For each Run:
	•	winner = remainingNames.pop() (or shift)
	•	add to winners
	•	never reinsert until Reset

5.4 Animation Phases (10–14 seconds total)

Implement as a deterministic state machine with an update loop:
	1.	Ignition (≈1.5s): ramp rotation + glow + snow
	2.	Showcase (≈6–8s): cycle highlights among candidates
	3.	Slowdown (≈2–3s): decelerate, narrow highlights, begin camera alignment
	4.	Lock & Reveal (≈1.5–2s): zoom in, snap winner label to center, show overlay

Notes:
	•	Highlighted “candidate names” during spin should be sampled from remainingNames.
	•	In the final seconds, bias highlights toward a small finalist set including the winner to avoid cognitive dissonance.

6) Visual / Three.js Scene Spec

6.1 Scene Objects
	•	Particle Christmas tree:
	•	Cone/spiral distribution via BufferGeometry + PointsMaterial
	•	Twinkle: per-particle flicker using shader or CPU-updated attribute
	•	Optional star topper: brighter points, separate mesh
	•	Snow:
	•	lightweight particle system in front of camera (subtle)
	•	Name labels:
	•	Attached to tree surface or orbiting with anchors
	•	Only show a subset concurrently (e.g., 20–40) to avoid clutter
	•	Highlight effect: brighter + slightly larger + pulse
	•	Postprocessing:
	•	bloom, mild vignette, filmic tone mapping

6.2 Performance Guidance
	•	Tree particles should be a single Points draw call.
	•	Names:
	•	prefer batching/instancing; avoid 140 heavy meshes always visible
	•	dynamically reuse label objects for currently-visible subset
	•	Adaptive quality:
	•	sample FPS first 2 seconds; if low, reduce particle count or disable heavier passes.

7) Winner Reveal Spec
	•	Winner must be revealed in TWO layers:
	1.	In-scene 3D particle text (stylized)
	2.	HTML overlay (large, crisp, center screen)

Overlay should include:
	•	Winner name
	•	Round number
	•	Remaining count

8) Persistence (Optional but Recommended)

If settings.persist = true:
	•	Save { remainingNames, winners, round, settings } to localStorage.
	•	Restore on load.
	•	Include a “Clear saved session” option (or Reset clears).

9) Export Winners
	•	Button exports winners as CSV and/or JSON.
	•	CSV columns: round,name,timestampISO.

10) Edge Cases
	•	Duplicate names:
	•	default dedupe ON; allow OFF
	•	Extremely long names:
	•	scale down 3D; overlay wraps or reduces font-size
	•	Empty input:
	•	disable Run; show a clear message
	•	Exhausted pool:
	•	disable Run; show completion state
	•	Mid-run refresh:
	•	if persist ON: resume safely; else restart

11) Acceptance Criteria
	•	Imports ~140 names and runs smoothly.
	•	Winner never repeats within a session.
	•	Winner reveal is readable from distance.
	•	No animation dead-ends; Run cannot be double-triggered.
	•	Reset restores full pool and clears winners (and clears localStorage if persist ON).

12) Implementation Checklist
	•	Project scaffold (Vite TS)
	•	Three.js scene setup: renderer, camera, controls (controls optional)
	•	Particle tree generation (cone/spiral)
	•	Snow particle system
	•	Name label system (subset visible + highlight)
	•	Animation state machine + easing
	•	Random shuffle with crypto
	•	UI overlay: run/reset/import/export + winner overlay
	•	Winners list + remaining counter
	•	Optional: persistence + reduced motion
	•	Basic performance tuning + adaptive quality

13) Notes to AGENTS
	•	Keep architecture clean: scene/, state/, ui/, utils/.
	•	Prefer deterministic updates: one render loop; do not spawn multiple intervals.
	•	Avoid heavy per-frame allocations.
	•	Provide clear configuration constants for timings, particle counts, and label counts.