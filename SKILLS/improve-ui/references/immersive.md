# Existing Immersive Web UI

Use only when existing UI already contains canvas, WebGL, Three.js, shaders, particles, maps/globes, physics, or scroll-led visual layers. Route substantial renderer, game, or 3D work to the specialist skill; Improve UI owns integration quality and proof.

## Purpose Gate

Keep the effect only when it serves:

- real product, data, place, instrument, or game artifact;
- interaction users must understand or manipulate;
- brand/hero identity static media cannot carry;
- explicit user requirement.

Decorative immersion is a cost/benefit call. Prefer static image, video, or CSS when it communicates the same thing reliably.

## Integration Contract

Require:

- readable foreground text, controls, selection, focus over every important frame; semantic content and controls outside the canvas when users must act on them
- meaningful static/poster fallback for unsupported, reduced-motion, low-power, or failed contexts; DPR, particle/object, shadow, postprocess, texture caps appropriate to target devices
- pause or throttling offscreen and in hidden tabs; teardown of RAF, listeners, observers, timers, workers, renderers, geometries, materials, textures, worlds, object URLs
- mobile/coarse-pointer behavior independent of hover or precision input; loading and WebGL/context-failure states

Don't fix foreground readability with an opaque overlay that destroys the effect; tune composition, contrast, cropping, lighting, fallback together.

## Stack Discipline

- Reuse the repo renderer, lifecycle, asset pipeline, performance controls. Don't add a 3D/motion runtime to imitate a reference.
- Isolate visual effects from product state and navigation; couple only when interaction requires it. Stabilize camera, lighting, material, resize before decorative postprocessing.
- Keep render-loop ownership explicit; avoid multiple independent RAF loops. Specialist implementation owns shader, physics, renderer, asset correctness.

## Accessibility And Preferences

- Preserve information and actions outside purely visual output. Reduced motion: still/low-motion state. No scroll scrub or ambient camera travel.
- Keyboard and non-drag alternatives where applicable. Respect contrast/forced-colors in foreground UI.
- Avoid flashing and rapid patterns that create safety risk. Expose loading/error state; don't require interpreting a blank canvas.

## Performance Proof

Inspect:

- first meaningful render and asset failure; desktop plus mobile/narrow fallback; DPR extremes and resize/orientation; foreground readability over representative frames
- reduced motion and static fallback; offscreen and hidden-tab pause; route away/back cleanup
- console/WebGL errors, long tasks, frame behavior, memory/resource growth; repeated mount/unmount and context loss when risk warrants it

Performance claims: production-like assets and build mode. A screenshot proves appearance, not loop cost or cleanup.

## Escalate

High severity when the effect:

- hides or disables a core action, or leaves essential content inaccessible; renders blank or fails without fallback
- demonstrated major jank, crashes, context loss, or uncontrolled resource growth
- continues substantial work after leaving the surface; ignores a required reduced-motion path

Visual disconnect or excessive decoration is a heuristic; if it harms readability, trust, or a documented brand requirement, it isn't.

## Completion

- Name the effect's product/brand purpose and justify its place in the stack. Verify fallback, readability, reduced motion, offscreen behavior, density caps, cleanup.
- State tested browsers/devices and any unverified renderer behavior.
