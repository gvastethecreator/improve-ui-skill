# Animations

Motion should explain state, not decorate every state. Pick the cheapest pattern that preserves intent and can be interrupted when the user changes their mind.

## Choosing Motion

- Start with frequency: keyboard shortcuts, command palettes, and repeated navigation should usually be instant; occasional surfaces can animate; rare feedback can carry more delight.
- Name the purpose before coding: spatial continuity, state indication, explanation, feedback, or softening an abrupt layout/content change.
- Hover, press, toggle, open/close: use transitions or Motion springs that retarget.
- Common UI transition patterns: reuse existing project primitives before inventing custom motion.
- Page/section entrance: keyframes or Motion variants are fine because the sequence runs once.
- Drag, resize, reordering: preserve responsiveness over choreography.
- Gesture-driven UI should feel directly manipulated: feedback starts on pointer-down, the object tracks the pointer 1:1, interruption starts from the current on-screen value, and release hands velocity into the settle animation when possible.
- Dense operational UI: shorter, quieter motion; avoid stagger that slows scanning.
- Marketing/editorial UI: staged entry can help hierarchy if it does not block reading.
- Reduced motion: keep opacity/color/state changes, remove travel, blur, and scale-heavy effects.
- Reduced transparency/contrast: if motion uses translucent material or blur as functional chrome, provide a solid or higher-contrast fallback.
- Set `transform-origin` deliberately for scale/rotate. Defaults often look wrong.
- Avoid `scale(0)` entry states; start around `scale(0.9-0.97)` with opacity.
- Avoid `ease-in` for UI entry/opening; users should see motion immediately after intent.
- Avoid bounce, elastic, wobble, and decorative image hover transforms unless the register and component personality clearly earn them.
- Reveal animations must enhance visible default content; do not hide core content until JavaScript fires.
- Name the effect before choosing the implementation. For example, "origin-aware animation" routes to transform-origin work, "shared element transition" routes to shared layout/view transitions, and "rubber-banding" routes to gesture physics rather than a simple slide.

See [motion-craft.md](motion-craft.md) for the stricter review bar.
See [motion-vocabulary.md](motion-vocabulary.md) when a request describes the effect by feel instead of by name.
See [motion-review.md](motion-review.md) when auditing or approving motion changes.
See [anti-slop.md](anti-slop.md) for generated motion tells.

## Timing And Easing

Use these as starting points, then adapt to the existing design system tokens:

- Press feedback: `100ms-160ms`.
- Tooltip and small popover: `125ms-200ms`.
- Dropdown and select: `150ms-250ms`.
- Most UI state changes: under `300ms`.
- Large spatial surfaces: `200ms-500ms` only when distance and context justify it.

Choose the curve by job:

- Enter/open/close: strong ease-out.
- Move/morph between visible positions: strong ease-in-out.
- Hover/color-only: existing ease token or a subtle ease.
- Constant loops: linear.

```css
:root {
  --motion-ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1);
  --motion-ease-in-out-strong: cubic-bezier(0.77, 0, 0.175, 1);
  --motion-ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
}
```

## Interruptible Interactions

Users can reverse intent mid-animation. CSS transitions interpolate toward the latest state, so they work well for interactive UI. Keyframes run on a fixed timeline and often restart or snap.

```css
/* Good: interruptible drawer transition */
.drawer {
  transform: translateX(-100%);
  transition-property: transform;
  transition-duration: 200ms;
  transition-timing-function: ease-out;
}

.drawer[data-open="true"] {
  transform: translateX(0);
}
```

```css
/* Avoid for toggles: fixed timeline, harder to retarget */
.drawer[data-open="true"] {
  animation: slide-in 200ms ease-out forwards;
}
```

Rule: transitions for interactions, keyframes for one-shot sequences.

Use `@starting-style` for CSS-only entry when browser support is acceptable:

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 180ms var(--motion-ease-out-strong), transform 180ms var(--motion-ease-out-strong);

  @starting-style {
    opacity: 0;
    transform: translateY(100%);
  }
}
```

## Common Interaction Patterns

Use a small existing project primitive or exact CSS/Motion pattern when the UI matches a known interaction: dropdown, modal, panel, page step, tabs, tooltip, accordion, badge, icon swap, number/text swap, skeleton reveal, input clear, success check, error shake, text reveal, card tilt, plus-menu morph, or card resize.

Decision order:

- Match the visible object first.
- Prefer the lowest-overhead matching implementation already present in the project.
- Keep CSS variables/tokens installed once when new tokens are genuinely needed.
- Preserve reduced-motion behavior.
- Keep JS orchestration minimal and tied to CSS variable durations.
- Skip custom motion if project primitives already solve the state change cleanly.

Tooltip pattern:

- Delay the first tooltip enough to avoid accidental hover.
- After one tooltip is open, adjacent tooltip targets should switch nearly instantly and without a full entrance animation.
- Keep the instant state local to the tooltip group; do not remove all tooltip delay globally.

Gesture pattern:

- Use Pointer Events and `setPointerCapture` once drag intent is established.
- Preserve the pointer's grab offset so the element does not jump under the cursor/finger.
- Track a short position/time history to compute release velocity.
- Choose dismissal or snap target from distance plus velocity; a quick flick can commit even if distance is short.
- Use rubber-band/friction beyond natural boundaries instead of a hard stop.
- Use springs or direct transforms for user-driven motion; avoid fixed keyframes for anything the user can reverse mid-flight.

## Motion Vocabulary Routing

Use vocabulary as a routing layer:

- Fade, crossfade, blur: use opacity plus optional tiny blur; avoid hiding real content until JS.
- Slide, page transition, direction-aware transition: use transform, not left/top.
- Scale, pop, origin-aware animation: set transform origin deliberately and avoid `scale(0)`.
- Reveal, mask, clip-path, before/after slider: use clipping only when reveal is the actual visual model.
- Shared element transition, continuity transition, morph: preserve object identity; use Motion layout only if already installed or browser View Transitions when appropriate.
- Drag, swipe, rubber-banding: use pointer capture, velocity/distance dismissal, boundary damping, and reduced-motion fallback.
- Stagger, orchestration: keep gaps `30ms-80ms`; skip in dense repeated workflows.
- Skeleton, shimmer, number ticker, text morph: keep loading/status meaning clear and use tabular numbers where digits change.

## Transform Origins and SVG

Scale and rotation need a believable origin. Buttons usually scale from center. Drawers/sheets move from their entering edge. Menus often open from the trigger side.

For SVG icon transforms, wrap paths in a `<g>` and set the SVG transform box:

```css
.icon-motion g {
  transform-box: fill-box;
  transform-origin: center;
}
```

This keeps rotation/scale centered on the drawn shape, not the whole SVG viewport.

Anchored popovers, dropdowns, and tooltips should scale from the trigger side or from the UI library's transform-origin variable. Center origin is reserved for centered surfaces such as modals.

Use percentage translation when the element should move by its own size:

```css
.drawer[data-open="false"] {
  transform: translateY(100%);
}
```

## Shared Layout Animations

Use shared layout only when the same logical object appears in different places or shapes across states: selected tab pill, card-to-dialog preview, moved highlight, expanded media card.

Use it lazily:

- Use Motion only if the project already has `motion` or `framer-motion`.
- Give the moving element a stable `layoutId`.
- Keep each `layoutId` unique within the same rendered state.
- Render separate state-specific elements that share the same `layoutId`; do not manually animate every coordinate.
- Keep elements with `layoutId` outside `AnimatePresence` unless you want initial/exit animations to affect the shared movement.
- Animate values that must interpolate smoothly, such as `borderRadius`, through Motion props instead of only switching class names.

```tsx
import { motion } from "motion/react";

function SelectedPill({ activeTab }) {
  return (
    <div className="relative">
      {activeTab === "overview" ? (
        <motion.div layoutId="selected-tab" className="absolute inset-0 rounded-lg" />
      ) : null}
      {activeTab === "settings" ? (
        <motion.div layoutId="selected-tab" className="absolute inset-0 rounded-lg" />
      ) : null}
    </div>
  );
}
```

For multiple moving objects, each object gets its own unique ID:

```tsx
<motion.div layoutId="avatar" />
<motion.div layoutId="preview-card" />
<motion.div layoutId="price-badge" />
```

Common failures:

- Duplicate `layoutId` in the same state: animation breaks or picks the wrong element.
- Shared element inside `AnimatePresence`: it fades while moving when you only wanted layout motion.
- Different style values hidden in classes: Motion may not interpolate them as intended; pass the changing value to `animate`.
- Using shared layout for unrelated objects: it looks magical in code and confusing in UI.

## Enter Animations

Split only when staged attention helps. A hero, empty state, modal content, or onboarding step can benefit. A dense table, log stream, or repeated list usually should not.

```tsx
function PageHeader() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <motion.h1 variants={enterItem}>Welcome</motion.h1>
      <motion.p variants={enterItem}>A short description.</motion.p>
      <motion.div variants={enterItem}>
        <Button>Get started</Button>
      </motion.div>
    </motion.div>
  );
}

const enterItem = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};
```

CSS-only version:

```css
.stagger-item {
  opacity: 0;
  transform: translateY(8px);
  filter: blur(4px);
  animation: enter 400ms ease-out forwards;
  animation-delay: calc(var(--stagger, 0) * 100ms);
}

@keyframes enter {
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}
```

Use word-level stagger sparingly. It suits editorial hero copy; it is noisy for routine app screens.

## Exit Animations

Exit should usually be quieter than enter because attention is moving elsewhere.

```tsx
<motion.div
  exit={{
    opacity: 0,
    y: -8,
    filter: "blur(4px)",
    transition: { duration: 0.15, ease: "easeOut" },
  }}
>
  {content}
</motion.div>
```

Use full travel only when spatial context matters: drawer closing, card returning to grid, sheet leaving from an edge.

```tsx
<motion.div
  exit={{
    opacity: 0,
    x: "calc(-100% - 4px)",
    transition: { duration: 0.2, ease: "easeOut" },
  }}
/>
```

Skipping exit animation is valid for high-frequency updates, dense tables, logs, and states where disappearance must feel instant.

## Contextual Icon Animations

For icons that appear on hover or swap on state change, animate `opacity`, `scale`, and `filter` instead of only toggling visibility.

Use Motion when already installed:

```tsx
import { AnimatePresence, motion } from "motion/react";

function IconSwap({ state, Icon }) {
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={state}
        initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
        transition={{ type: "spring", duration: 0.3, bounce: 0 }}
      >
        <Icon />
      </motion.span>
    </AnimatePresence>
  );
}
```

CSS-only fallback:

```tsx
function IconButton({ isActive, ActiveIcon, InactiveIcon }) {
  return (
    <button>
      <span className="relative grid place-items-center">
        <span
          className={cn(
            "absolute inset-0 grid place-items-center transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
            isActive ? "scale-100 opacity-100 blur-0" : "scale-[0.25] opacity-0 blur-[4px]",
          )}
        >
          <ActiveIcon />
        </span>
        <span
          className={cn(
            "transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
            isActive ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-0",
          )}
        >
          <InactiveIcon />
        </span>
      </span>
    </button>
  );
}
```

Animate:

- Hover-revealed actions.
- Play/pause, copy/check, like/liked, loading/success.
- Contextual toolbar icons.

Skip:

- Static navigation icons.
- Decorative icons.
- Icon plus text labels where swapping the icon would add noise.

## Press Feedback

`scale(0.95-0.98)` is a safe range for tactile press feedback. Use transform/scale so layout does not shift.

```css
.button {
  transition-property: scale;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

.button:active {
  scale: 0.96;
}
```

Skip press scale for drag handles, text selection controls, already-animated controls, or dense toolbars where movement distracts.

Gate hover-only motion to pointer devices that can actually hover:

```css
@media (hover: hover) and (pointer: fine) {
  .button:hover {
    scale: 1.02;
  }
}
```

## Gestures

Drag and swipe interactions need physical details more than decorative easing:

- Dismiss by distance or velocity so a fast flick counts.
- Capture the pointer after dragging starts.
- Ignore extra touch points once a drag is active.
- Apply damping or friction beyond natural boundaries instead of hard stops.
- Prefer springs for gestures the user can interrupt or reverse.
- Pass release velocity into the spring when supported so the object does not visibly change speed at release.

## Initial Page Load

Use `initial={false}` on `AnimatePresence` for components that have a default mounted state and should animate only after user interaction.

```tsx
<AnimatePresence initial={false} mode="popLayout">
  <motion.span key={state} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
</AnimatePresence>
```

Do not add `initial={false}` to intentional first-load hero/page enters. Verify a full refresh after changing it.
