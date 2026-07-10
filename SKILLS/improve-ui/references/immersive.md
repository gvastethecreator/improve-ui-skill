# Existing Immersive Web UI

Use this reference only when an existing interface already contains canvas, WebGL, Three.js, shaders, particles, maps/globes, physics, or scroll-led visual layers. Route substantial renderer/game/3D implementation to the specialist skill; keep Improve UI responsible for integration quality and proof.

## Purpose Gate

Keep the effect only when it serves one of these roles:

- real product, data, place, instrument, or game artifact;
- interaction users must understand or manipulate;
- brand/hero identity that static media cannot carry adequately;
- explicit user requirement.

Treat decorative immersion as a heuristic cost/benefit decision. If a static image, video, or CSS surface communicates the same thing more reliably, prefer it.

## Integration Contract

Require:

- readable foreground text, controls, selection, and focus over every important frame;
- semantic content and controls outside the canvas when users must act on them;
- a meaningful static/poster fallback for unsupported, reduced-motion, low-power, or failed contexts;
- device-pixel-ratio, particle/object, shadow, postprocess, and texture caps appropriate to target devices;
- pause or throttling offscreen and in hidden tabs;
- teardown of RAF, listeners, observers, timers, workers, renderers, geometries, materials, textures, worlds, and object URLs;
- mobile/coarse-pointer behavior that does not depend on hover or precision input;
- loading and WebGL/context-failure states.

Do not solve foreground readability with an opaque overlay that destroys the effect's purpose; tune composition, contrast, cropping, lighting, and fallback together.

## Stack Discipline

- Reuse the repository's renderer, lifecycle, asset pipeline, and performance controls.
- Do not add a new 3D/motion runtime merely to imitate a reference.
- Keep visual effects isolated from product state and navigation unless interaction requires coupling.
- Stabilize camera, lighting, material, and resize behavior before decorative postprocessing.
- Keep render-loop ownership explicit; avoid multiple independent RAF loops.
- Let the specialist implementation own shader, physics, renderer, and asset correctness.

## Accessibility And Preferences

- Preserve complete information and actions outside purely visual output.
- Honor reduced motion with a still/low-motion state and no scroll scrub or ambient camera travel.
- Provide keyboard and non-drag alternatives for interaction where applicable.
- Respect contrast/forced-colors needs in foreground UI.
- Avoid flashing and rapid patterns that create safety risk.
- Expose loading/error state without requiring users to interpret a blank canvas.

## Performance Proof

Inspect:

- first meaningful render and asset failure;
- target desktop plus mobile/narrow fallback;
- supported DPR extremes and resize/orientation change;
- foreground readability over representative frames;
- reduced motion and static fallback;
- offscreen and hidden-tab pause;
- route away/back cleanup;
- console/WebGL errors, long tasks, frame behavior, memory/resource growth;
- repeated mount/unmount and context loss when risk warrants it.

Use production-like assets and build mode when making performance claims. A screenshot proves appearance, not loop cost or cleanup.

## Escalate

Treat as high severity when the effect:

- hides or disables a core action;
- leaves essential content inaccessible;
- renders blank or fails without fallback;
- causes demonstrated major jank, crashes, context loss, or uncontrolled resource growth;
- continues substantial work after leaving the surface;
- ignores a required reduced-motion path.

Treat visual disconnect or excessive decoration as a heuristic unless it harms readability, trust, or a documented brand requirement.

## Completion

- Name the effect's product/brand purpose.
- Justify its place in the existing stack.
- Verify fallback, readability, reduced motion, offscreen behavior, density caps, and cleanup.
- State the tested browsers/devices and any unverified renderer behavior.
