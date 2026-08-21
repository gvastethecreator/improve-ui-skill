# Motion Implementation Traps

Load only while implementing motion. Skip for a static critique or deciding whether motion belongs.

## Tooltips And Repeated Disclosure

Delay the first tooltip enough to avoid accidental hover; skip or cut that delay while the pointer moves between neighboring tooltip triggers. Reset the grace period after leaving the group. Keyboard focus stays immediate. Content is dismissible. Never force a fade replay while scanning a toolbar.

## Geometry And Identity

For SVG transforms, if transform origins or mixed primitives fight the browser, wrap the moving shape in a `<g>`. Set and check `transform-box: fill-box` plus intended `transform-origin`. Inspect the bounding box — do not guess from the `viewBox`.

Every shared-layout transition needs unique, stable identity in its rendered scope — duplicate layout IDs make unrelated objects teleport. Coordinate exit and entry with `AnimatePresence` or the framework equivalent. Mount both endpoints only when the transition contract expects it.

Animate between interpolable values. Resolve classes, CSS variables, `auto`, percentages, filters, and compound transforms to compatible start/end values before blaming the library. Do not hide a discrete layout jump behind an easing curve.

If the mounted state already represents saved or interactive reality, use `initial={false}` — an entrance animation falsely replays a change. Keep true first-run entrances explicit; do not disable them globally.

## Measure The Shipped Path

For complex, continuous, gesture-driven, canvas/WebGL, or performance-sensitive motion, profile before and after on a production build, lower-end hardware, and a normal target. Record only falsifying metrics: frame time, long tasks, layout/paint cost, memory, or input latency. Bounded microtransition: inspect interruption, repetition, and reduced motion in the shipped build; profile if evidence suggests cost. Dev-mode stutter and flagship-laptop smoothness are unreliable. Preserve route, device, state, capture or metrics, and reduced-motion result with the verdict.

## Synchronize To Rendered Milestones

Do not coordinate a state change with a timeout copied from the CSS duration — delays, reduced mode, background tabs, interrupted transitions, and future token changes make it drift.

Prefer: transitionend or animationend filtered to the intended element and property; a framework completion callback; a timeline label or finished promise; an observable cover or layout milestone; an immediate reduced-motion branch.

Include cancellation and cleanup. Ignore stale completion from a superseded transition. If interaction is locked during a rare scene cover, expose it. Unlock on completion, cancellation, error, route change, and reduced motion.

## Static First, Enhancement Second

Render primary content in its readable destination by default. Add an enhancement class or data attribute only after motion is ready. Failed script, hydration mismatch, blocked module, or unsupported API must leave the interface usable.

First-run entrances: keep critical heading, action, and navigation visible; no-JavaScript fallback when the initial CSS is hidden; avoid a long chain whose later items never reveal after one error; replay after hydration, tab restoration, saved state, or navigation only if the event happened again.

## Choose The Primitive

CSS transitions: reversible hover, focus, pressed, disclosure, bounded state changes. CSS keyframes: finite authored sequences with known phases. Web Animations API: imperative cancellation, retargeting, playback inspection, coordinated native effects. FLIP/shared layout: same object changes geometry. View transitions: route or document continuity when identity and browser support justify it. Animation library/timeline: gestures, springs, orchestration, or project grammar CSS cannot express cleanly. Canvas/WebGL: visual system is spatial, simulated, or too numerous for DOM — do not use it because a gradient needed a shader.

Smallest primitive that expresses cancellation, reduced mode, and proof. Do not add a dependency for one fade, or force complex direct manipulation through CSS classes.

## Preserve Composable Transforms

Several systems writing one transform overwrite one another. Independent responsibilities on nested elements, or one owner: outer = layout or shared-position motion; middle = gesture translation/scale; inner = hover, press, or authored deformation; SVG group = shape-local pivot.

Transform order is explicit: translate-then-rotate differs from rotate-then-translate. Inspect the real pivot and bounding box at final size.

Register and animate CSS custom properties only when syntax is declared and interpolated values are compatible. Otherwise they can change discretely while the code appears animated.

## Stable State And Focus

If remounting is not the intended state, do not restart animation by changing a component key — remounting can erase focus, selection, scroll position, media playback, local edits, and assistive-technology context.

Overlays and route transitions: move focus only after the destination is ready; escape and back stay deterministic; return focus to a surviving origin; prevent invisible outgoing layers from intercepting pointer events; remove inert, aria-hidden, and temporary stacking state after completion; preserve or reset scroll explicitly.

## Production Diagnostics

When a transition feels wrong, separate: response latency before the first visible frame; wrong origin or object identity; phase timing and overlap; main-thread or compositor pressure; layout shift or unstable destination; queued/stale completion; focus or pointer interception; reduced-mode mismatch.

Do not solve response latency by shortening a visually correct settle. Do not solve a wrong origin with a spring. Do not solve layout shift with a longer fade.
