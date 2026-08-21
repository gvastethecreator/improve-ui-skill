# Motion

Decide whether motion belongs; implement it coherently; review behavior. Timing and style are practices. If a standard or project token says otherwise, follow that token.

## Contents

- [Decide whether to animate](#decide-whether-to-animate)
- [Classify and map the event](#classify-and-map-the-event)
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

Name one job: spatial continuity; state change; explain a relationship; acknowledge input or completion; soften a confusing layout/content change. Delete motion with no job.

Frequency: keyboard shortcuts, command palettes, repeated list nav, high-frequency tools: instant, avoid travel; hover and repeated controls: color, opacity, or a tiny transform only when it clarifies feedback; occasional modals, drawers, popovers, toasts, panels: restrained spatial motion when it explains origin; rare onboarding, completion, editorial, or brand: more expression; do not block reading or interaction.

Match existing motion tokens and primitives before a new library or vocabulary.

## Classify And Map The Event

One primary class: `feedback` (input, success, failure, progress); `state` (mode, selection, validation, loading, availability); `spatial` (origin, destination, containment, object identity); `attention` (rare consequential change); `ambient` (ongoing life or material without demanding action).

Do not use ambient motion to counterfeit product activity, or attention motion on every update. For a nontrivial sequence, persist `motion-plan.json` plus the same-facts [motion plan](../templates/motion-plan.md):

```text
event and trigger:
class + purpose + frequency:
origin -> destination:
affected elements and causal order:
duration + easing family:
interrupt / reverse / retarget / cancel:
reduced-motion alternative:
focus and input contract:
performance risk:
proof state + capture:
```

Tie state commits to `transitionend`/`animationend`, a framework completion callback, a timeline label/promise, or another observable rendered milestone. Never sync product state to a copied duration timeout — interruption, reduced mode, background tabs, and future token changes desynchronize it. Load [motion-implementation.md](motion-implementation.md) for transform ownership, static-first enhancement, focus continuity, and cleanup traps.

## Choose The Mechanism

CSS transitions for interruptible toggles and state changes. Keyframes for one-shot or looping sequences that do not need retargeting. Web Animations API when programmatic control helps and a library is excessive. Installed motion library for shared layout, springs, presence, and gestures it already owns. Direct transforms or springs for pointer-driven interaction. Browser View Transitions only when support, navigation architecture, and fallback fit.

Do not add Motion, GSAP, or another runtime for a small opacity/transform transition the existing stack can express.

## Timing And Easing

Tuning ranges: press `100–160ms`; tooltip or small popover `125–200ms`; dropdown/select `150–250ms`; most UI state changes under `300ms`; large spatial surfaces `200–500ms` only when distance and context justify it.

Easing by job: open/close/enter/exit → responsive ease-out; movement between visible positions or morphs → ease-in-out or a suitable spring; hover/color → subtle existing token; constant loop → linear.

Avoid `ease-in` for UI opening/entry — it delays visible response. Durations over `300ms`, bounce, or overshoot are review prompts, not automatic failures. Frequency, distance, register, and proof decide.

Keep exit quieter or faster than enter unless spatial continuity requires otherwise.

## Origins And Continuity

Scale and rotate from a believable origin. Anchor menus, popovers, tooltips to the trigger side or library-provided origin. Centered modals stay centered. Avoid entry from `scale(0)`; small visible scale range only when scale communicates the surface. Drawers/sheets from their edge. Percentage translation when travel is defined by the element's own size. Shared-element/layout transitions only when one logical object persists between states. Shared IDs unique. Check interruption, scroll, and route behavior.

For SVG transforms, if viewport geometry creates a false center, set the transform box/origin on the actual graphic group.

## Enter, Exit, And Sequence

Keep content usable without JS-driven reveal. Do not hide essential content in a permanently hidden base style waiting for hydration or an observer.

For progressive CSS entry, keep the normal state visible; use `@starting-style` where supported:

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

Older browsers render the final visible state. If entry motion matters, check support; never make comprehension depend on it.

Stagger only when staged attention helps; gaps around `30–80ms`. Avoid stagger in dense lists, tables, logs, repeated workflows. Do not default to `100ms` gaps for routine UI.

If disappearance must feel immediate or updates happen frequently, skip exit animation.

## Press, Hover, And Tooltips

Respond on pointer-down/`:active`, before async work completes. Small press scale, often `0.95–0.98`, only when it does not fight drag, selection, or dense toolbar ergonomics. Gate hover-only movement behind `(hover: hover) and (pointer: fine)`. Visible focus independent of hover. Delay the first accidental tooltip hover; inside one tooltip group, switch adjacent targets with little or no repeated entrance delay. Tooltip content must be reachable from keyboard focus and remain dismissible/hoverable according to the interaction contract.

## Gestures

Direct manipulation must feel attached to input: acknowledge pointer-down immediately; preserve the grab offset so the object does not jump; track the pointer 1:1 within the interaction model; establish pointer capture after drag intent; continue through pointer leaving the original bounds; allow reversal/interruption from the current visual value; decide dismissal/snap from distance and velocity where appropriate; hand release velocity into the settle animation when supported; resistance beyond natural boundaries instead of a hard stop when the metaphor calls for it.

Also provide the keyboard and single-pointer non-drag alternative the interaction requires. Physical polish does not replace accessibility.

Test slow drag, short flick, long flick, reversal, release outside bounds, cancellation, second pointer, and reduced motion.

## Reduced Motion And Material

Apply `prefers-reduced-motion`. Remove or replace non-essential travel, scale, parallax, blur, and ambient loops. Preserve state clarity. If disabling all transitions removes essential feedback, do not disable them globally.

Translucent functional chrome: solid readable baseline; `prefers-reduced-transparency` as progressive enhancement where supported; account for `prefers-contrast` and `forced-colors` for the actual platform/user base; check text, focus, and control boundaries over plain and busy content.

Reduced transparency is not universally available. Never make the fallback depend on the media query firing.

## Performance

Name exact transitioned properties. Avoid `transition: all`. Prefer transform and opacity for frequent motion; measure paint/composite; do not assume every filter, clip, or transform is cheap. Avoid layout-property motion in frequent interactions. Bounded low-frequency size changes OK when the size change is the actual object and proof is smooth. If profiling shows individual transform shorthand blocked by main-thread work, treat full `transform` strings in Motion as a targeted optimization — do not rewrite all shorthand speculatively. Avoid high-frequency inherited CSS-variable updates across large subtrees. Add `will-change` only after observed performance evidence. Follow `performance.md`. Pause ambient/canvas loops offscreen and in hidden tabs.

## Review Protocol

Review the exact interaction, not isolated declarations:

1. Record purpose, frequency, input modality, origin, and project primitive.
2. Trigger rapidly: open/close/open, toggle repeatedly, interrupt midway, navigate during motion.
3. Inspect reduced motion and relevant pointer modes.
4. If coordination is hard to judge, slow playback `2×–5×` or use DevTools.
5. If performance is part of the claim, inspect frame/runtime evidence.
6. Capture the state or video segment and name remaining limitations.

Block completion when motion hides core content; makes a high-frequency action materially slower; breaks reduced-motion access; loses user input; or visibly janks on the supported target.

Stylistic mismatch is a heuristic. If the design system defines it, do not treat it as a heuristic.

## Vocabulary

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
