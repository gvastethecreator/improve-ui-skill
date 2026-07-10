# Frontend Performance

Use this reference when interface latency, animation smoothness, layout stability, asset cost, or long-session work is in scope. Measure the affected experience; do not infer performance from code style alone.

## Contents

- [Define the claim](#define-the-claim)
- [Remove broad rendering work](#remove-broad-rendering-work)
- [Interaction and render work](#interaction-and-render-work)
- [Assets and layout stability](#assets-and-layout-stability)
- [Motion and compositing](#motion-and-compositing)
- [Use will-change last](#use-will-change-last)
- [Offscreen and cleanup](#offscreen-and-cleanup)
- [Measure and report](#measure-and-report)

## Define The Claim

Name:

- user path and exact interaction;
- target browser/device class and build mode;
- before measurement or observed failure;
- metric or visible outcome;
- test conditions and acceptable variance.

Separate field metrics, lab metrics, and local diagnostic signals. A development build, short frame sample, console log, or source scan cannot prove production field performance.

## Remove Broad Rendering Work

Start with unnecessary work:

- Replace `transition: all` and broad transition utilities with exact properties.
- Avoid animating layout properties in frequent UI when transform/opacity can express the same visual result.
- Batch DOM reads and writes; investigate layout reads (`getBoundingClientRect`, `offset*`, `client*`, `scroll*`) interleaved with mutations.
- Keep per-keystroke controlled-input work small.
- Avoid state updates that rerender unrelated subtrees.
- Keep expensive filters, backdrop blur, large shadows, and masks out of repeated rows unless measured.
- Remove duplicate observers, listeners, timers, request loops, and data work.

Do not “optimize” a bounded, smooth behavior into harder-to-maintain code without evidence.

## Interaction And Render Work

- Profile the real slow interaction before memoizing broadly.
- Keep input feedback immediate even when the resulting operation is async.
- Virtualize, paginate, progressively load, or use `content-visibility` only when measured DOM/render cost warrants it.
- Prevent stale requests and unnecessary refetch/render cycles during navigation.
- Keep optimistic updates reversible and avoid rerendering the whole page for a local mutation.
- Prefer existing framework diagnostics and production profiling builds.
- Test rapid repeat, interruption, long content, and realistic data volume.

Numeric item-count rules are heuristics. Rich rows can fail at low counts; simple rows can remain fine at higher counts.

## Assets And Layout Stability

- Reserve media dimensions or aspect ratio to prevent unexpected shifts.
- Match delivered image size/format to rendered use; do not load a full-resolution asset for a thumbnail.
- Prioritize only genuinely critical above-fold assets; do not mark whole grids high priority.
- Add `preconnect` only for external origins actually used early enough to benefit; speculative connections consume resources.
- Lazy-load below-fold assets where it improves the path without delaying imminent content.
- Preload fonts only when critical and actually used; keep family/weight count intentional.
- Inspect fallback metrics and content swap when fonts cause visible reflow.
- Avoid late insertion above the user's current reading/action position.

Use the `web-vitals` implementation or a tool that follows the current CLS definition when reporting CLS. Raw summation of every layout-shift entry is not the Core Web Vital: current CLS uses the largest session window.

## Motion And Compositing

- Prefer transform and opacity for frequent motion; verify the target browser's actual rendering path.
- CSS and WAAPI can keep eligible motion off the main JavaScript thread, but not every property or implementation is accelerated.
- Keep gesture tracking attached to the pointer and avoid waiting for unrelated application reconciliation.
- For Motion, consider a full `transform` string only when hardware acceleration matters and profiling shows individual transform shorthand contributes to jank.
- Treat filters, clip paths, masks, and backdrop blur as conditional; size, area, browser, and overlap determine cost.
- Keep low-frequency size/layout animation bounded when it communicates the actual object and remains smooth.

Read `motion.md` when behavior and accessibility—not only cost—are part of the change.

## Use Will Change Last

`will-change` is a last-resort hint for an existing performance problem, not a default optimization.

Use it only when:

- evidence identifies first-frame or compositing trouble;
- the interaction is important;
- the exact changing property is known;
- the number of promoted elements stays small;
- memory, stacking-context, and visual side effects are acceptable.

Prefer enabling the hint shortly before the change and removing it afterward. Avoid `will-change: all`, blanket list-item hints, and speculative permanent layers. Remeasure after adding it; remove it if evidence does not improve.

## Offscreen And Cleanup

Inspect long-lived and hidden work:

- pause non-essential CSS/WAAPI ambient animation when its region is offscreen where practical;
- pause RAF, canvas, WebGL, physics, and media loops when offscreen, hidden, or reduced motion is active;
- cancel pending work and observers on unmount/route change;
- dispose renderers, textures, materials, geometry, physics worlds, workers, and object URLs;
- verify route cycles do not grow DOM, canvas, iframe, listener, timer, or GPU resources monotonically;
- keep hidden tabs from doing user-invisible high-frequency work.

An offscreen-animation detector is an investigation trigger. Confirm whether the animation is active, costly, and unnecessary before escalating.

## Measure And Report

Use an evidence stack appropriate to the claim:

- source scan: broad transitions, layout read/write risks, missing dimensions, heavy repeated effects;
- browser trace/profile: main-thread work, rendering, long tasks, interaction timing, network, memory;
- visual/runtime capture: jank, response, shift, offscreen behavior, console/network errors;
- Web Vitals implementation: LCP, INP, CLS when those metrics match the claim;
- production/field data: percentile and device segmentation when available.

Set budgets before running the gate or use project budgets. Do not make `0` long tasks, `0` CLS, a particular frame p95, or a local timing universal law. Explain whether a threshold is a project requirement, target, or diagnostic starting point.

Report:

- environment and versions;
- route, viewport/device, interaction, and data;
- before/after samples and variability;
- exact metric implementation;
- observed improvement and regressions;
- what the evidence cannot prove.

Do not call a source-only cleanup a measured performance improvement. Say it removed a known risk and runtime proof remains blocked.

See [sources-and-provenance.md](sources-and-provenance.md) for `web-vitals`, CLS, Motion, and `will-change` sources.
