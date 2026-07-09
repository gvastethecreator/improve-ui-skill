# Motion Craft

Use this file as the stricter motion bar for `improve-ui`: decide if motion belongs, name what kind of motion it is, then choose the smallest motion that explains state.

Source fit:

- Keep: vocabulary-first diagnosis, frequency gating, motion purpose, strong easing, duration ranges, physical origins, interruptibility, gesture polish, perceived performance, reduced-motion and hover gating, performance caveats, blocker criteria, and slow-motion review.
- Also keep from Apple-style fluid interface guidance: input response on pointer-down, 1:1 drag tracking, velocity handoff, momentum projection, rubber-banding, and fallbacks for reduced transparency/contrast.
- Adapt: output format. This repo prefers terse findings and avoids tables unless they genuinely improve scanning.
- Omit: persona prompts, brand/course copy, rigid review theatrics, decorative glass as a default, and component-library naming advice unless the user is designing a public library.

Open [motion-vocabulary.md](motion-vocabulary.md) when the effect is described by feel or when a finding needs the exact term. Open [motion-review.md](motion-review.md) when the task is an animation review or when motion quality decides pass/fail.

## Should It Animate?

Start with frequency and input modality:

- Keyboard shortcuts, command palettes, list navigation, and actions used 100+ times/day: no travel animation. Keep state instant or nearly instant.
- Hover states and interactions seen tens of times/day: reduce motion. Use color, opacity, or a very small transform only when it clarifies feedback.
- Modals, drawers, popovers, toasts, and occasional panels: standard motion is fine when it explains spatial change.
- Onboarding, success, feedback, or rare editorial moments: delight is allowed, but keep interaction unblocked.

Motion needs one clear job:

- Spatial consistency: an object enters/exits from the place it belongs.
- State indication: a control visibly changes from one state to another.
- Explanation: motion teaches a relationship or feature.
- Feedback: the interface acknowledges press, drag, completion, or error.
- Softening abrupt change: layout/content changes avoid feeling broken.

If the only reason is "it looks cool", remove it for product UI and reserve it for rare expressive surfaces.

Perceived speed matters:

- The first visible response should happen immediately after intent. Press feedback belongs on pointer-down or `:active`, not after async work completes.
- A spinner, skeleton, or loading affordance can make the same wait feel faster or slower; do not use slow decorative loaders in task UI.
- Tooltips should usually delay the first accidental hover, then skip delay and animation while the user is moving across adjacent tooltip targets.
- Remove delays from command palettes, toolbar shortcuts, and repeated navigation once the action is clearly intentional.

## Easing And Timing

Choose easing by motion job:

- Entering, exiting, opening, closing: strong ease-out.
- Moving or morphing between two visible positions: strong ease-in-out.
- Hover or color-only changes: ease or token equivalent.
- Constant loops: linear.

Useful starting points:

```css
:root {
  --motion-ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1);
  --motion-ease-in-out-strong: cubic-bezier(0.77, 0, 0.175, 1);
  --motion-ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
}
```

Avoid `ease-in` for UI entry/opening. It delays the first visible movement and makes the interface feel late. Do not invent curves from scratch when the project has no token; start from a proven strong curve or a documented easing reference, then tune against the actual interaction.

Duration guide:

- Press feedback: `100ms-160ms`.
- Tooltip and small popover: `125ms-200ms`.
- Dropdown and select: `150ms-250ms`.
- Most UI state changes: stay under `300ms`.
- Large spatial surfaces such as drawers/modals: `200ms-500ms` only when the distance and context justify it.
- Marketing/explanatory motion: can be longer, but it must not block interaction.

Exit should usually be quieter and faster than enter. Slow deliberate phases, such as hold-to-delete, can be long; release and cancellation should snap back quickly.

## Physicality

Avoid "appears from nowhere" motion:

- Do not enter from `scale(0)`. Start around `scale(0.9)` to `scale(0.97)` with opacity.
- Anchored popovers, dropdowns, and tooltips should scale from the trigger side or library transform-origin variable.
- Modals are the exception: they can stay centered.
- Use `translateY(100%)` or similar percentages for self-size movement instead of hardcoded pixels when the element's own size defines the travel.
- Pressable elements can use `scale(0.95-0.98)` on `:active` when it does not fight selection, dragging, or dense toolbar ergonomics.

`clip-path: inset(...)` is useful for deliberate reveals, hold progress, comparison sliders, and seamless active-tab color transitions. Use it when clipping is the actual visual model, not as a generic animation trick.

## Interruptibility

Interactive motion should retarget when the user changes their mind:

- Use CSS transitions for toggles, toasts, open/close states, and hover/press state changes.
- Reserve keyframes for one-shot sequences that do not need to reverse mid-flight.
- Use `@starting-style` for CSS-only entry when browser support is acceptable; fall back to a mounted/data-state attribute when needed.
- Use springs for drag, swipe, pointer-tracked depth, or gestures that can be interrupted; keep bounce subtle and rare.
- Stagger group entry only when it improves hierarchy. Use `30ms-80ms` between items and never block interaction while the stagger plays.
- For awkward crossfades, a small `filter: blur(2px)` can blend two states; heavy blur is expensive and usually muddy.

## Gestures

Gesture polish is mostly invisible correctness. Treat drag/swipe/sheet motion as behavior, not choreography:

- Start feedback on pointer-down.
- Track the pointer 1:1 during the gesture and preserve the grab offset; do not snap the moving element to its center.
- Animate from the current on-screen value when interrupted, not from stale target state.
- Hand release velocity into the settling spring when the library supports it.
- Project momentum before choosing the final snap point; a flick should land where it is going, not merely near the release point.
- Dismiss by distance or velocity. A fast flick should not need to cross the same threshold as a slow drag.
- Apply damping/friction beyond natural boundaries instead of hard stops.
- Capture the pointer after drag starts so the drag survives leaving the element bounds.
- Ignore extra touch points after a drag starts to avoid jumping between fingers.
- Honor `prefers-reduced-motion` by dropping travel/position motion while preserving state clarity.

Useful starting points:

- Require a small movement threshold, around `8px-12px`, before committing to drag direction.
- For swipe dismissal, treat velocity around `0.11 px/ms` as a valid flick threshold when distance alone is not enough.
- Rubber-band beyond bounds with progressive resistance, not a binary clamp.
- Default springs should be critically damped or near it; add bounce only when user momentum caused the movement.

## Performance Triggers

Flag these before tuning taste:

- `transition: all` or broad helpers such as `transition-all`.
- `scale(0)` entry.
- `ease-in` on UI entry/opening.
- Animation on keyboard/high-frequency actions.
- UI durations over `300ms` without a spatial or deliberate-action reason.
- `transform-origin: center` on anchored popovers/dropdowns/tooltips.
- Keyframes for rapidly-triggered UI.
- Layout animation through `width`, `height`, `margin`, `padding`, `top`, or `left`.
- Driving many child transforms by updating an inherited CSS variable on a parent.
- Framer Motion shorthand (`x`, `y`, `scale`) on animation that must stay smooth while the page is busy.
- Missing reduced-motion path.
- Hover motion without `@media (hover: hover) and (pointer: fine)`.

## Motion Review Decision

Block a motion change when any of these remain after review:

- The motion has no user-facing job.
- A keyboard or very high-frequency action uses travel animation.
- UI entry/opening uses `ease-in` or starts from `scale(0)`.
- A trigger-anchored surface scales from center.
- A rapidly triggered interaction uses non-interruptible keyframes.
- Significant movement lacks reduced-motion handling.
- A transform/opacity replacement is obvious but layout properties still animate.

Approve only when purpose, frequency, easing, duration, origin, interruptibility, accessibility, performance, and product cohesion all fit the inspected surface.

## Review Proof

- Watch the exact changed state at normal speed and at 2x-5x slower speed when the feel is uncertain.
- Use browser animation tools or frame-by-frame stepping for coordinated transforms, color, opacity, and blur.
- Test real touch hardware for drawers, swipes, and drag-to-dismiss when the gesture itself is the feature.
- Prefer deleting or reducing motion when the interaction still reads clearly without it.
