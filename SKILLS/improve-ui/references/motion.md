# Motion

Use this reference to decide whether motion belongs, implement it coherently, and review its behavior. Timing and style guidance are practices unless a standard or project token says otherwise.

## Contents

- [Decide whether to animate](#decide-whether-to-animate)
- [Choose the mechanism](#choose-the-mechanism)
- [Timing and easing](#timing-and-easing)
- [Origins and continuity](#origins-and-continuity)
- [Enter, exit, and sequence](#enter-exit-and-sequence)
- [Press, hover, and tooltips](#press-hover-and-tooltips)
- [Gestures](#gestures)
- [Reduced motion and material](#reduced-motion-and-material)
- [Performance](#performance)
- [Review protocol](#review-protocol)
- [Vocabulary](#vocabulary)

## Decide Whether To Animate

Name one job before adding motion:

- show spatial continuity;
- communicate state change;
- explain a relationship;
- acknowledge input or completion;
- soften an otherwise confusing layout/content change.

Delete motion that has no job. Start from interaction frequency:

- Keyboard shortcuts, command palettes, repeated list navigation, and high-frequency tools: keep state instant or nearly instant; avoid travel.
- Hover and repeated controls: prefer color, opacity, or a tiny transform only when it clarifies feedback.
- Occasional modals, drawers, popovers, toasts, and panels: use restrained spatial motion when it explains origin.
- Rare onboarding, completion, editorial, or brand moments: allow more expression without blocking reading or interaction.

Match the existing project's motion tokens and primitives before introducing a library or new vocabulary.

## Choose The Mechanism

- Use CSS transitions for interruptible toggles and state changes.
- Use keyframes for one-shot or looping sequences that do not need retargeting.
- Use the Web Animations API when programmatic control helps and a library would be excessive.
- Use the installed motion library for shared layout, springs, presence, and gestures it already owns.
- Use direct transforms or springs for pointer-driven interaction.
- Use browser View Transitions only when support, navigation architecture, and fallback fit the product.

Do not add Motion, GSAP, or another runtime for a small opacity/transform transition the existing stack can express.

## Timing And Easing

Use these as tuning ranges, then verify in context:

- press feedback: `100–160ms`;
- tooltip or small popover: `125–200ms`;
- dropdown/select: `150–250ms`;
- most UI state changes: under `300ms`;
- large spatial surfaces: `200–500ms` only when distance and context justify it.

Choose easing by job:

- open, close, enter, exit: responsive ease-out;
- movement between visible positions or morphs: ease-in-out or a suitable spring;
- hover/color: subtle existing token;
- constant loop: linear.

Avoid `ease-in` for UI opening/entry because it delays visible response. Treat durations over `300ms`, bounce, or overshoot as review prompts, not automatic failures; frequency, distance, register, and proof decide.

Keep exit quieter or faster than enter unless spatial continuity requires otherwise.

## Origins And Continuity

- Scale and rotate from a believable origin.
- Anchor menus, popovers, and tooltips to the trigger side or library-provided origin.
- Keep centered modals centered.
- Avoid entry from `scale(0)`; use a small visible scale range only when scale communicates the surface.
- Move drawers/sheets from their edge.
- Use percentage translation when travel is defined by the element's own size.
- Apply shared-element/layout transitions only when one logical object persists between states.
- Keep shared IDs unique and verify interruption, scroll, and route behavior.

For SVG transforms, set the transform box/origin on the actual graphic group when viewport geometry would otherwise create a false center.

## Enter Exit And Sequence

Keep content usable without JavaScript-driven reveal. Do not put essential content in a permanently hidden base style waiting for hydration or an observer.

For progressive CSS entry, keep the normal state visible and use `@starting-style` where supported:

```css
.popover:popover-open {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition: opacity 180ms ease-out, transform 180ms ease-out;

  @starting-style {
    opacity: 0;
    transform: translateY(-4px) scale(.96);
  }
}

@media (prefers-reduced-motion: reduce) {
  .popover:popover-open { transition: opacity 100ms linear; }
  .popover:popover-open { transform: none; }
}
```

Older browsers render the final visible state. Verify support if entry motion is important; never make comprehension depend on it.

Use stagger only when staged attention helps. Keep gaps around `30–80ms`; avoid stagger in dense lists, tables, logs, and repeated workflows. Do not use `100ms` gaps as the default for routine UI.

Skip exit animation when disappearance must feel immediate or updates happen frequently.

## Press Hover And Tooltips

- Respond on pointer-down/`:active`, before async work completes.
- Use a small press scale, often `0.95–0.98`, only when it does not fight drag, selection, or dense toolbar ergonomics.
- Gate hover-only movement behind `(hover: hover) and (pointer: fine)`.
- Preserve a visible focus state independent of hover.
- Delay the first accidental tooltip hover; while moving through one tooltip group, switch adjacent targets with little or no repeated entrance delay.
- Ensure tooltip content is reachable from keyboard focus and remains dismissible/hoverable according to the interaction contract.

## Gestures

Make direct manipulation feel attached to input:

- acknowledge pointer-down immediately;
- preserve the grab offset so the object does not jump;
- track the pointer 1:1 within the interaction model;
- establish pointer capture after drag intent;
- continue through pointer leaving the original bounds;
- allow reversal/interruption from the current visual value;
- decide dismissal/snap from distance and velocity where appropriate;
- hand release velocity into the settle animation when supported;
- use resistance beyond natural boundaries instead of a hard stop when the metaphor calls for it.

Also provide the keyboard and single-pointer non-drag alternative required by the interaction. Physical polish does not replace accessibility.

Test slow drag, short flick, long flick, reversal, release outside bounds, cancellation, second pointer, and reduced motion.

## Reduced Motion And Material

Honor `prefers-reduced-motion` by removing or replacing non-essential travel, scale, parallax, blur, and ambient loops while preserving state clarity. Do not globally disable all transitions if doing so removes essential feedback.

For translucent functional chrome:

- provide a solid readable baseline;
- use `prefers-reduced-transparency` as progressive enhancement where supported;
- consider `prefers-contrast` and `forced-colors` for the actual platform/user base;
- verify text, focus, and control boundaries over plain and busy content.

Reduced transparency is not universally available. Never make the fallback depend on the media query firing.

## Performance

- Name exact transitioned properties; avoid `transition: all`.
- Prefer transform and opacity for frequent motion, but measure paint/composite behavior instead of assuming every filter, clip, or transform is cheap.
- Avoid layout-property motion in frequent interactions; allow bounded low-frequency size changes when the size change is the actual object and proof is smooth.
- Treat full `transform` strings in Motion as a targeted optimization when profiling shows individual transform shorthand is blocked by main-thread work; do not rewrite all shorthand speculatively.
- Avoid high-frequency inherited CSS-variable updates across large subtrees.
- Add `will-change` only after observed performance evidence; follow `performance.md`.
- Pause ambient/canvas loops offscreen and in hidden tabs.

## Review Protocol

Review the exact interaction, not isolated declarations:

1. Record purpose, frequency, input modality, origin, and project primitive.
2. Trigger rapidly: open/close/open, toggle repeatedly, interrupt midway, and navigate during motion.
3. Inspect reduced motion and relevant pointer modes.
4. Slow playback `2×–5×` or use DevTools when coordination is hard to judge.
5. Inspect frame/runtime evidence when performance is part of the claim.
6. Capture the state or video segment and name remaining limitations.

Block completion when motion hides core content, makes a high-frequency action materially slower, breaks reduced-motion access, loses user input, or visibly janks on the supported target. Treat stylistic mismatch as a heuristic unless the design system defines it.

## Vocabulary

Use precise terms to route fixes:

- `crossfade`: one state replaces another in place;
- `origin-aware animation`: anchored surface moves/scales from its trigger;
- `shared-element transition`: one logical object persists across views;
- `layout animation`: position/size reflows instead of snapping;
- `direction-aware transition`: forward/back use opposite spatial direction;
- `rubber-banding`: resistance beyond a boundary followed by return;
- `velocity handoff`: release animation starts with pointer velocity;
- `stagger`: sequential start offsets;
- `scroll-driven animation`: progress derives from scroll, not merely viewport entry;
- `interruptible`: the animation can retarget from its current visual state.

See [sources-and-provenance.md](sources-and-provenance.md) for `prefers-reduced-motion`, `@starting-style`, Media Queries Level 5, and Motion performance sources.
