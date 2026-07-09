# Performance

Performance polish is mostly removing broad work. Add hints only after the browser has a clear, small job.

## Transition Only What Changes

Do not use `transition: all` when the changing properties are known. Broad transitions make unrelated changes animate, hide bugs, and ask the browser to watch everything.

```css
/* Good */
.button {
  transition-property: scale, background-color;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

/* Bad */
.button {
  transition: all 150ms ease-out;
}
```

Tailwind:

```tsx
// Good
<button className="transition-[scale,background-color] duration-150 ease-out">

// Good for transforms only
<button className="transition-transform duration-150 ease-out">

// Avoid when exact properties are known
<button className="transition duration-150 ease-out">
```

Use the smallest exact list that matches the interaction. Do not create animation tokens unless the project already has a token pattern.

## Compositor-Friendly Properties

Prefer properties the browser can usually compose without layout or paint:

- `transform`
- `opacity`
- `filter` for small blur/brightness effects
- `clip-path` and `mask` when already proven smooth

Avoid animating layout/paint-heavy properties for frequent interactions:

- `top`, `left`, `right`, `bottom`
- `width`, `height`
- `padding`, `margin`
- `background`, `border`, `box-shadow` for large surfaces

`box-shadow` can still be fine for small hover states. Measure or visually inspect before "optimizing" it.

Bounded exceptions exist. A deliberate card resize or plus-menu morph may animate `width`/`height` when the size change is the visible object. Keep those exceptions low-frequency, exact-property, scoped to one component, and visually verified. Do not generalize them into broad layout animation advice.

## Motion Under Load

CSS animations and transitions can stay smooth while JavaScript is busy. Prefer CSS for predetermined motion such as menus, tabs, skeletons, and one-shot reveals. Use JavaScript or springs when values are dynamic, gesture-driven, or need interruption logic.

Avoid inherited CSS variables for high-frequency child transforms. Updating a variable on a parent can force style recalculation across the subtree.

```js
// Avoid for drag loops on large subtrees.
container.style.setProperty("--drag-y", `${distance}px`);

// Prefer updating the moving element directly.
movingElement.style.transform = `translateY(${distance}px)`;
```

When using Motion/Framer Motion on motion that must stay smooth under page load, prefer full transform strings over shorthand props when profiling shows dropped frames:

```tsx
// Convenient, but rAF-bound under load.
<motion.div animate={{ x: 100 }} />

// More explicit and easier for the compositor.
<motion.div animate={{ transform: "translateX(100px)" }} />
```

For programmatic motion without a library, use WAAPI when it keeps the animation on compositor-friendly properties:

```js
element.animate(
  [
    { transform: "translateY(100%)", opacity: 0 },
    { transform: "translateY(0)", opacity: 1 },
  ],
  { duration: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "both" },
);
```

For gesture-driven UI, performance proof is about continuity:

- Move the element directly during pointer tracking; do not wait for state reconciliation before the object follows the pointer.
- Capture the pointer after drag intent so updates continue outside the original bounds.
- Use a spring or direct compositor transform for the release; avoid restarting a fixed keyframe from zero.
- Hand off velocity where the toolchain supports it, or state why the interaction is intentionally distance-only.

## Blur, Transparency, And Materials

Blur is expensive enough to deserve a job. Use it to support a real material layer, soften an awkward crossfade, or separate floating chrome from content. Do not use it as a default card treatment.

Rules:

- Keep crossfade blur tiny, often around `2px`.
- Treat `20px+` blur as a functional material choice that needs runtime inspection, not polish by default.
- Avoid large blur/backdrop-filter inside repeated rows or cards.
- Provide reduced-transparency and high-contrast fallbacks when blurred/translucent surfaces carry text or navigation.
- Verify Safari-sensitive blur and backdrop-filter work on the actual target browser when that browser matters.

## `will-change`

`will-change` is a browser hint. It may promote an element to its own compositing layer before the animation starts, smoothing the first frame. It also costs memory, and browsers may ignore it.

Use it when all are true:

- The interaction is important or frequently noticed.
- The animated property is compositor-friendly.
- There is observed first-frame stutter, Safari jank, or a high-confidence risk such as a complex transform-heavy hover.
- You can name the exact property.

```css
/* Good */
.animated-card {
  will-change: transform;
}

.fading-preview {
  will-change: transform, opacity;
}

/* Avoid */
.everything {
  will-change: all;
}

.layout-animation {
  will-change: width, height, padding;
}
```

Useful values:

- `transform`: movement, scale, rotation.
- `opacity`: fades.
- `filter`: small blur/brightness effects.
- `clip-path`, `mask`: sometimes useful; verify visually.
- `scroll-position`: scroll containers with intentional scroll-offset animation.
- `contents`: high-update inner content; pair with containment when appropriate.

```css
.virtual-list {
  contain: content;
  will-change: contents;
}
```

Skip it when:

- You have not seen or reasonably expected stutter.
- The element animates layout properties.
- Many list items would get their own layer.
- The animation is rare or below the fold.
- The browser already performs smoothly.

If a temporary class can cover the interaction, prefer adding `will-change` shortly before the animation and removing it after. Long-lived hints are only for long-lived hot interactions.

## Offscreen And Long-Session Motion

Animation cost often hides below the first viewport. When a page has CSS animations, canvas, WebGL, physics, marquees, skeletons, or scroll effects, check whether work keeps running while it is not visible.

Expected behavior:

- CSS and WAAPI animations below or above the viewport are paused, not started yet, or limited to essential low-cost state.
- Canvas, WebGL, Three.js, Matter.js, globe, and particle loops pause when their region is offscreen, the tab is hidden, or reduced motion is enabled.
- Route changes dispose renderers, worlds, observers, listeners, timers, textures, materials, and animation frames.
- Long-running pages do not show monotonic DOM/canvas/iframe growth after route cycles.

The review harness records `animationAudit` and `canvasDetails` for each runtime viewport. Treat `offscreen-running-animation` and `offscreen-active-canvas` as investigation triggers; verify source before rewriting a motion system.

For manual browser proof, sample top, middle, footer, and mobile top states. The useful pass criterion is `offscreenRunningCount: 0` for targeted optimization work, plus no active offscreen canvas/WebGL marker unless the project documents why it must run.

## Quick Audit

- Run the review harness when the task is a deep performance/UI review:

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <path> --url <local-url> --out output/improve-ui/<slug> --fail-on=P1
```

- Run the local anti-pattern detector when auditing local frontend files:

```powershell
node SKILLS/improve-ui/scripts/detect-ui-antipatterns.mjs --json --fail-on=P1 <path>
```

- Search for `transition-all`, `transition: all`, and broad animation helpers.
- Replace broad transitions with exact properties.
- Look for layout properties animated on hover/open/drag.
- Check parent CSS variable updates inside drag or pointer loops.
- Check Motion shorthand on animations that run during page transitions/loading.
- Check gesture interactions for pointer capture, 1:1 tracking, velocity handoff, and no restart-on-release keyframes.
- Check backdrop-filter or heavy blur surfaces for reduced-transparency/contrast fallback and repeated-list cost.
- Check layout reads near writes: `getBoundingClientRect`, `offset*`, `scroll*`, `client*` paired with `style`, `classList`, or state updates in the same handler/frame.
- Check asset pressure: missing image dimensions, oversized rendered images, duplicate font families, above-fold lazy images, and broken network requests.
- Check runtime pressure when a URL is available: long tasks, frame p95/max, unexpected layout shifts, console errors, mobile overflow, offscreen running animations, and active offscreen canvas/WebGL regions.
- Add `will-change` only after the above cleanup.
- Verify the visible interaction, especially in Safari-sensitive motion if that browser matters.

Detector findings are signals, not proof. Confirm important findings in code or browser state before reporting them.

Suggested runtime budgets for one short interaction:

- Long tasks: `0`.
- Frame p95: `<= 20ms`.
- Frame max: `<= 50ms`.
- Unexpected layout shift: `0`.
- Console/network failures: `0`.

Adjust budgets when the target hardware, dev mode, or browser makes the default unfair. State the adjustment in the review.

## Web UI Hotspots

Check these when the interface feels sluggish or the audit is explicitly performance-focused:

- Large lists: paginate, virtualize, or use `content-visibility: auto` when rendered DOM size is the problem.
- Avoid layout reads during render: `getBoundingClientRect`, `offsetHeight`, `offsetWidth`, `scrollTop`.
- Batch DOM reads and writes; do not interleave measuring and mutating in loops.
- Prefer uncontrolled inputs for high-frequency typing unless controlled state is needed.
- Controlled inputs must keep per-keystroke work cheap.
- Add `preconnect` only for real external asset/CDN origins used on the page.
- Preload critical fonts only when they are actually above-the-fold and use `font-display: swap`.

Do not treat numeric thresholds like "50 items" as law. A simple 80-row list can be fine; a rich 20-row list can be too heavy. Verify the actual DOM and interaction.
