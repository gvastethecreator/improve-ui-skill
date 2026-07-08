# Motion Review

Use this file when the task is to review, harden, or improve animation quality.

## Review Posture

Motion approval is earned. A transition that runs but feels late, starts from the wrong origin, fires too often, cannot be interrupted, or drops frames is a finding.

Review only what you can inspect: code, computed styles, screenshots/video, browser animation tools, runtime metrics, or a stated blocker. Static findings are signals; visual feel still needs browser proof when frontend behavior changes.

## Non-Negotiables

- Justified motion: every animation needs one job: orientation, state, explanation, feedback, or softened change.
- Frequency fit: 100+/day and keyboard-triggered actions get no travel animation; repeated hover/list navigation gets minimal motion; occasional surfaces can use standard motion; rare feedback can delight.
- Responsive easing: enter/open/exit/close uses ease-out or a strong custom curve; never `ease-in` for UI entry.
- Duration fit: most UI motion stays under `300ms`; button press `100ms-160ms`, tooltip/popover `125ms-200ms`, dropdown/select `150ms-250ms`, drawer/modal `200ms-500ms` only when distance justifies it.
- Physical origin: anchored popovers, dropdowns, and tooltips scale from the trigger; modals can stay centered.
- No `scale(0)`: start from roughly `0.9-0.97` plus opacity.
- Interruptibility: rapidly triggered and gesture motion retargets from current state through transitions or springs, not keyframes that restart.
- Compositor first: prefer `transform` and `opacity`; layout-property animation needs a deliberate low-frequency reason.
- Accessibility: reduced-motion path exists, and hover motion is gated behind `(hover: hover) and (pointer: fine)`.
- Cohesion: motion matches the product register and component personality.

## Escalation Triggers

Treat these as P1/P2 unless the project has a documented exception and visual proof:

- `transition: all` or broad Tailwind transition helpers.
- `scale(0)` entry.
- `ease-in` on UI entry/opening.
- Keyboard shortcut, command palette, or high-frequency action with travel animation.
- UI duration over `300ms` without a spatial or deliberate-action reason.
- `transform-origin: center` on trigger-anchored popover/dropdown/tooltip.
- Keyframes on toggles, toasts, or quickly repeated interactions.
- Layout-property animation where transform/opacity would work.
- Framer Motion `x`, `y`, or `scale` shorthand on motion that must survive page load or busy UI.
- Parent CSS variable updates driving many child transforms.
- Missing reduced-motion path.
- Ungated hover motion.
- Symmetric timing on hold/press interactions where deliberate phase should be slower than release.

## Remedial Order

Prefer earlier fixes over later ones:

1. Delete motion that has no job, fires too often, or is keyboard-triggered.
2. Reduce distance, duration, blur, scale, or number of moving parts.
3. Fix easing: `ease-in` to ease-out/custom, weak default to stronger project token.
4. Fix origin and physicality: trigger-aware origin, no `scale(0)`.
5. Make it interruptible: keyframes to transitions, gestures to springs/direct transforms.
6. Move work to compositor properties or WAAPI when JS control is required.
7. Make timing asymmetric for hold/press/destructive confirmations.
8. Add subtle polish: blur for awkward crossfades, small stagger, `@starting-style`.
9. Add or verify reduced-motion and hover gating.

## Finding Shape

Use normal repo review style; use a table only when it truly improves scanning.

Each motion finding should answer:

- Before: exact file/line/style/behavior.
- After: concrete replacement or deletion.
- Why: frequency, purpose, origin, interruptibility, performance, accessibility, or cohesion.
- Proof needed: screenshot/video, slowed animation, DevTools animation panel, runtime metrics, or explicit blocker.

Decision:

- Block: feel-breaking regression, high-frequency/keyboard travel, `scale(0)`, `ease-in` entry, missing reduced-motion on significant movement, or easy non-GPU animation fix left undone.
- Approve: no feel-breaking regressions, durations/easing fit, interruptibility handled, reduced-motion respected, and visual proof captured.

## Debugging Checklist

- Slow the animation `2x-5x` or use DevTools animation inspector when feel is uncertain.
- Step frame-by-frame for coordinated transform, opacity, color, blur, and clip-path.
- Test real touch hardware for drag, swipe, drawer, and dismiss gestures when possible.
- Verify fast repeated trigger: open/close/open, rapid toggle, rapid toast add/remove.
- Verify reduced-motion behavior preserves state clarity without travel-heavy motion.
- Verify hover behavior does not become a hidden touch affordance.
