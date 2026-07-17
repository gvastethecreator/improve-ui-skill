# Motion Implementation Traps

Load this route only while implementing motion. It is not required for a static critique or for deciding whether motion belongs.

## Contents

- [Tooltips and repeated disclosure](#tooltips-and-repeated-disclosure)
- [Geometry and identity](#geometry-and-identity)
- [Measure the shipped path](#measure-the-shipped-path)
- [Synchronize to rendered milestones](#synchronize-to-rendered-milestones)
- [Static first, enhancement second](#static-first-enhancement-second)
- [Choose the primitive](#choose-the-primitive)
- [Preserve composable transforms](#preserve-composable-transforms)
- [Stable state and focus](#stable-state-and-focus)
- [Production diagnostics](#production-diagnostics)

## Tooltips And Repeated Disclosure

Delay the first tooltip enough to avoid accidental hover noise, then skip or sharply reduce that delay while the pointer moves between neighboring tooltip triggers. Reset the grace period after leaving the group. Keep keyboard focus immediate, make content dismissible, and never force users to replay a fade while scanning a toolbar.

## Geometry And Identity

For SVG transforms, wrap the moving shape in a `<g>` when transform origins or mixed primitives fight the browser. Set and verify `transform-box: fill-box` plus the intended `transform-origin`; inspect the actual bounding box instead of guessing from the `viewBox`.

Give every shared-layout transition a unique, stable identity within its rendered scope. Duplicate layout IDs make unrelated objects teleport. Coordinate exit and entry order with `AnimatePresence` or the framework equivalent, and keep both endpoints mounted only when the transition contract expects it.

Animate between genuinely interpolable values. Resolve classes, CSS variables, `auto`, percentages, filters, and compound transforms to compatible start/end representations before blaming the library. Do not hide a discrete layout jump behind an easing curve.

Use `initial={false}` when the mounted state already represents the user's saved or interactive reality and an entrance animation would falsely replay a change. Keep true first-run entrances explicit rather than disabling them globally.

## Measure The Shipped Path

For complex, continuous, gesture-driven, canvas/WebGL, or suspected performance-sensitive motion, profile before and after in a production build on representative lower-end hardware and a normal target. Record only the metrics that could falsify the claim: frame time, long tasks, layout/paint cost, memory, or input latency. For a bounded microtransition, inspect interruption, repetition, and reduced motion in the shipped build; escalate to profiling when evidence suggests cost. Development-mode stutter and a flagship laptop's smoothness are both unreliable witnesses. Preserve the route, device, state, relevant capture or metrics, and reduced-motion result with the verdict.

## Synchronize To Rendered Milestones

Do not coordinate a state change with a timeout copied from the nominal CSS duration. Delays, reduced mode, background tabs, interrupted transitions, and future token changes make it drift.

Prefer:

- transitionend or animationend filtered to the intended element and property;
- a framework completion callback;
- a timeline label or finished promise;
- an observable cover or layout milestone;
- an immediate reduced-motion branch.

Always include cancellation and cleanup. Ignore stale completion from a superseded transition. If interaction is intentionally locked during a rare scene cover, expose the state and guarantee unlock on completion, cancellation, error, route change, and reduced motion.

## Static First, Enhancement Second

Render primary content in its readable destination state by default. Add an enhancement class or data attribute only after motion is ready. A failed script, hydration mismatch, blocked module, or unsupported API must leave the interface usable.

For first-run entrances:

- keep critical heading, action, and navigation visible;
- use a no-JavaScript fallback when the initial CSS is hidden;
- avoid a long chain whose later items never reveal after one error;
- do not replay after hydration, tab restoration, saved state, or routine navigation unless the event genuinely happened again.

## Choose The Primitive

- CSS transitions: reversible hover, focus, pressed, disclosure, and bounded state changes.
- CSS keyframes: finite authored sequences with known phases.
- Web Animations API: imperative cancellation, retargeting, playback inspection, or several coordinated native effects.
- FLIP/shared layout: the same object changes geometry.
- View transitions: route or document continuity when identity and browser support justify it.
- Animation library/timeline: gestures, springs, orchestration, or existing project grammar that CSS cannot express cleanly.
- Canvas/WebGL: the visual system is genuinely spatial, simulated, or too numerous for DOM—not because a gradient needed a shader.

Use the smallest primitive that expresses cancellation, reduced mode, and proof. Do not add a dependency for one fade. Do not force complex direct manipulation through CSS classes because dependencies are unfashionable.

## Preserve Composable Transforms

Several systems writing one transform property will overwrite one another. Put independent responsibilities on nested elements or compose them in one owner:

- outer element: layout or shared-position motion;
- middle element: gesture translation/scale;
- inner element: hover, press, or authored deformation;
- SVG group: shape-local pivot.

Keep transform order explicit. Translate-then-rotate differs from rotate-then-translate. Inspect the real pivot and bounding box at final size.

Register and animate CSS custom properties only when their syntax is declared and the interpolated values are compatible. Otherwise they may change discretely while the code appears animated.

## Stable State And Focus

Do not restart animation by changing a component key unless remounting is the intended product state. Remounting can erase focus, selection, scroll position, media playback, local edits, and assistive-technology context.

During overlays and route transitions:

- move focus only after the destination is ready;
- keep escape and back behavior deterministic;
- return focus to a surviving logical origin;
- prevent invisible outgoing layers from intercepting pointer events;
- remove inert, aria-hidden, and temporary stacking state after completion;
- preserve scroll intentionally or reset it explicitly.

## Production Diagnostics

When a transition feels wrong, record separate causes:

- response latency before the first visible frame;
- wrong origin or object identity;
- phase timing and overlap;
- main-thread or compositor pressure;
- layout shift or unstable destination;
- queued/stale completion;
- focus or pointer interception;
- reduced-mode mismatch.

Do not solve response latency by shortening a visually correct settle. Do not solve a wrong origin with a spring. Do not solve layout shift with a longer fade.
