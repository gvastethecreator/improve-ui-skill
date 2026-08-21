# Frontend Performance

When interface latency, animation smoothness, layout stability, asset cost, or long-session work is in scope. Measure the affected experience. Do not infer performance from code style.

## Define The Claim

Name: user path and exact interaction; target browser/device class and build mode; before measurement or observed failure; metric or visible outcome; test conditions and acceptable variance.

Separate field, lab, and local diagnostic signals. A development build, short frame sample, console log, or source scan cannot prove production field performance.

## Remove Broad Rendering Work

Unnecessary work: replace `transition: all` and broad transition utilities with exact properties; avoid layout-property animation in frequent UI when transform/opacity can express it; batch DOM reads/writes and investigate layout reads (`getBoundingClientRect`, `offset*`, `client*`, `scroll*`) interleaved with mutations; small per-keystroke controlled-input work; no state updates that rerender unrelated subtrees; expensive filters, backdrop blur, large shadows, and masks out of repeated rows unless measured; remove duplicate observers, listeners, timers, request loops, and data work.

Do not "optimize" a bounded, smooth behavior into harder-to-maintain code without evidence.

## Interaction And Render Work

Profile the real slow interaction before memoizing. Input feedback stays immediate even when the operation is async. Virtualize, paginate, progressively load, or use `content-visibility` only when measured DOM/render cost warrants it. Prevent stale requests and unnecessary refetch/render cycles during navigation. Optimistic updates stay reversible; do not rerender the whole page for a local mutation. Prefer existing framework diagnostics and production profiling. Test rapid repeat, interruption, long content, and realistic data volume.

Item-count rules are heuristics. Rich rows can fail at low counts; simple rows can remain fine at higher counts.

## Assets And Layout Stability

Reserve media dimensions or aspect ratio. Match delivered image size/format to rendered use — no full-resolution asset for a thumbnail. Prioritize only critical above-fold assets; do not mark whole grids high priority. `preconnect` only for origins used early enough to benefit; speculative connections consume resources. Lazy-load below-fold assets where it improves the path without delaying imminent content. Preload fonts only when critical and used; family/weight count intentional. Inspect fallback metrics and content swap when fonts cause visible reflow. No late insertion above the user's current reading/action position.

When reporting CLS, use the `web-vitals` implementation or a tool that follows the current CLS definition. Raw summation of every layout-shift entry is not the Core Web Vital — current CLS uses the largest session window.

## Motion And Compositing

Prefer transform and opacity for frequent motion; check the target browser's rendering path. CSS and WAAPI can keep eligible motion off the main JavaScript thread, but not every property or implementation is accelerated. Gesture tracking stays on the pointer — do not wait for unrelated reconciliation. For Motion, if hardware acceleration matters and profiling shows individual transform shorthand contributes to jank, consider a full `transform` string. Filters, clip paths, masks, and backdrop blur are conditional: size, area, browser, and overlap determine cost. Low-frequency size/layout animation stays bounded when it communicates the actual object and remains smooth.

If behavior and accessibility, not only cost, are part of the change, read `motion.md`.

## Use Will Change Last

`will-change` is a last-resort hint for an existing performance problem, not a default optimization. Use only when evidence identifies first-frame or compositing trouble; the interaction is important; the exact changing property is known; promoted elements stay few; memory, stacking-context, and visual side effects are acceptable.

Enable the hint before the change and remove it afterward. Avoid `will-change: all`, blanket list-item hints, and speculative permanent layers. Remeasure after adding it. If evidence does not improve, remove it.

## Offscreen And Cleanup

Pause non-essential CSS/WAAPI ambient animation when its region is offscreen; pause RAF, canvas, WebGL, physics, and media loops when offscreen, hidden, or reduced motion is active; cancel pending work and observers on unmount/route change; dispose renderers, textures, materials, geometry, physics worlds, workers, and object URLs; check route cycles do not grow DOM, canvas, iframe, listener, timer, or GPU resources monotonically; hidden tabs must not do user-invisible high-frequency work.

Offscreen-animation detector: investigation trigger. Check whether the animation is active, costly, and unnecessary before escalating.

## Measure And Report

Evidence stack for the claim: source scan (broad transitions, layout read/write risks, missing dimensions, heavy repeated effects); browser trace/profile (main-thread work, rendering, long tasks, interaction timing, network, memory); visual/runtime capture (jank, response, shift, offscreen behavior, console/network errors); Web Vitals (LCP, INP, CLS when those metrics match the claim); production/field data (percentile and device segmentation when available).

Set budgets before running the gate or use project budgets. Do not make `0` long tasks, `0` CLS, a particular frame p95, or a local timing universal law. Say whether a threshold is a project requirement, target, or diagnostic starting point.

Report: environment and versions; route, viewport/device, interaction, and data; before/after samples and variability; exact metric implementation; observed improvement and regressions; what the evidence cannot prove.

Do not call a source-only cleanup a measured performance improvement. Say it removed a known risk and runtime proof remains blocked.

See [sources-and-provenance.md](sources-and-provenance.md) for `web-vitals`, CLS, Motion, and `will-change` sources.
