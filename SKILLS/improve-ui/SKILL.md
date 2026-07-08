---
name: improve-ui
description: "UI improvement router. Use for visual bugs, frontend polish, accessibility, motion, typography, surfaces, or hardening."
---

# Improve UI

Use Improve UI to make an existing or new interface feel better without forcing one aesthetic. Context first, then choose the smallest systemic fix that changes the visible outcome.

## Process

1. Frame the work before changing UI. Identify:

   - Surface: product app, dashboard, marketing page, content/editorial, commerce/media card, game/tool, design system component, or visual bug.
   - Task shape: build, polish pass, audit/review, compliance pass, bug fix, motion/performance pass, or design-system hardening.
   - Register: product, brand, or hybrid. Product serves task flow; brand persuades and differentiates; hybrid splits the surface by purpose.
   - Design read and dials when visual quality matters: audience, visual language, existing system/aesthetic, `DESIGN_VARIANCE`, `MOTION_INTENSITY`, and `VISUAL_DENSITY`.
   - Constraints: existing design system, framework, installed animation library, accessibility, interaction frequency, trigger modality, reduced-motion behavior, target devices/browsers, real-data edge cases.
   - Proof: screenshot, running app, source component, failing visual state, detector output, runtime audit output, or explicit blocker. If frontend code changes, visually verify before calling it done.
   - Done when the route, constraints, and proof source are explicit enough to choose references without guessing.

Ask only when missing context changes the decision. Otherwise use the nearest existing pattern and keep the diff small.

2. Route to the smallest useful reference set.
   - Use the Context Router below, then open only the reference files needed for the chosen surface and task shape.
   - When visual quality, redesign, bland/generic output, or brand/marketing quality is in scope, read `distinction.md` before settling on a direction.
   - When a supplied URL, video, screenshot, HTML export, or strong visual brief would reduce guessing, read `reference-capture.md` before implementation.
   - Done when every opened reference can change the implementation, review finding, or proof plan.

3. Change the real user path before polish.
   - For implementation, fix the component, state, layout, or primitive that users actually touch.
   - For audit/review, lead with P1/P2 findings from evidence, grouped by systemic cause.
   - Done when the main path and one relevant edge/recovery path are handled or explicitly blocked.

4. Prove the result and name the remaining risk.
   - Run the detector or review harness when local frontend files are available; use screenshots/browser proof for frontend code changes when a runnable UI exists.
   - Read `proof-recipes.md` when the task involves interaction, responsive fit, async states, motion, reference-led visual work, or a nontrivial final claim.
   - Done when the final note names files, proof, skipped checks, and any blocker without turning missing evidence into a pass.

## Context Router

- Product app/dashboard: density and scan speed win. Tight spacing, stable layout, clear focus, subtle motion, borders okay for tables/forms.
- Marketing/editorial: hierarchy and rhythm win. Text wrapping, staged enters, optical alignment, image outlines, expressive but intentional motion.
- Commerce/media cards: media edge quality wins. Image outline, shadow-as-border, concentric radius, hover states, tabular prices where dynamic.
- Design system/core component: token reuse and state coverage win. Fix root tokens/classes, preserve focus states, document only tricky exceptions.
- Visual bug/regression: reproduce visually first, patch the visible cause, then verify the same viewport/state.
- Visual direction/redesign: run taste calibration, audit before replacement, preserve current IA/copy/analytics/SEO unless explicitly in scope, then modernize by highest-impact lever.
- Reference-led brand/prototype work: extract the system from the strongest supplied or collected reference before coding. Use screenshots/crops/video beats to capture hierarchy, type, spacing, surfaces, motion, and proof gaps; do not imitate decorative style blindly.
- Landing/pricing page: structure and conversion clarity win. Use offer, audience, proof, objections, plan comparison, and CTA flow before visual effects.
- Motion/performance pass: decide if motion belongs by frequency and purpose, remove broad transitions first, reuse existing project primitives or the smallest exact CSS/Motion pattern that fits, then add targeted hints only for observed or likely stutter in important interactions.
- Immersive canvas/WebGL/3D: only use when the effect is a real product/brand artifact or hero/system layer. Require reduced motion, static fallback, pixel-ratio/density caps, offscreen pause, cleanup/disposal, and foreground readability proof.
- Compliance pass: check semantics, focus, forms, content resilience, images, navigation state, i18n, hydration, and touch/layout contracts before visual taste.
- Audit/review pass: run a deep-review ledger unless the user asks for quick polish only. Score accessibility, performance, theming/design-system, responsive/content resilience, and anti-slop fit from evidence, then fix highest-impact P1/P2 patterns before polish.
- Hardening pass: force real data states: empty, loading, error, permission, long text, translation, slow network, rapid clicks, and large data. For apps, dashboards, forms, and async regions, these checks are required in deep review.

## Deep Review Harness

Use this mode when the user asks to improve an interface, review UI quality, improve performance, or make a screen production-ready. Skip only for tiny visual bug fixes or when the user explicitly asks for quick polish.

Required ledger:

- Context: surface, register, user task, target viewports, important states, existing design-system constraints.
- Taste calibration: design read, dials, reference/source choice, and redesign preservation decisions when visual quality is in scope.
- Evidence: files/lines, detector output, screenshots/viewport states, runtime/browser output, or blocker.
- Findings: P1/P2 first, grouped by systemic cause rather than every repeated instance.
- Change ambition: `local fix`, `component primitive`, `token/system`, `layout shell`, or `state model`.
- Proof: before/after screenshot or runtime state for changed frontend behavior.

Recommended command:

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --out output/improve-ui/<slug> --fail-on=P1
```

Use [proof-recipes.md](proof-recipes.md) to choose viewports, state runs, action JSON, before/after artifacts, and blocked-proof language. If no URL is available, run static review and state that runtime/visual proof is blocked. If no detector can run, say why. Do not call a performance pass "deep" unless at least one real interaction or viewport state was inspected.

## Core Moves

Read `core-moves.md` after the context router selects visual polish, audit, build, compliance, motion, performance, or hardening work. Completion criterion: chosen moves produce evidence, not taste-only commentary.

## Output Contract

- Implementation: change code, then summarize files touched and visual/test proof.
- Audit/review: findings first, ordered by severity, with file/line references or viewport states. Include context/evidence ledger, score, systemic cause, and next actions when scope is broader than one bug. Use tables only when they improve scanning.
- Polish pass: group changes by principle, but omit principles that needed no change.
- If a tempting change is speculative, skip it and say why in one line.

Required gates for deep review:

- P1 unresolved means the review fails unless blocked by missing access or explicit scope.
- Frontend code change without visual proof is incomplete unless the blocker is stated.
- Local frontend files require detector output or explicit skip reason.
- Open-ended visual builds require taste calibration; broad brand/marketing work should use reference-led proof when image/reference generation is available and useful.
- Open-ended visual builds require a distinction note: rejected default, rejected second reflex, chosen signature move, and proof.
- Async/data UI requires empty, loading, error, permission, long-content, slow-network, and rapid-click checks or scoped skip reason.
- Motion review requires purpose, frequency, origin, duration/easing, interruptibility, reduced-motion, hover gating, and visual feel proof or blocker.
- Repeated P2 patterns should be fixed at primitive/token/layout level when that is safer than one-off instance patches.

## Checklist

Read `checklist.md` before finalizing a review or implementation pass. Completion criterion: every relevant checklist item is satisfied, fixed, or explicitly waived with evidence.

## Reference Files

- [typography.md](typography.md): wrapping, smoothing, tabular numbers
- [contracts.md](contracts.md): accessibility, forms, content, navigation, i18n, hydration
- [surfaces.md](surfaces.md): radii, optical alignment, shadows, outlines, hit areas
- [animations.md](animations.md): transitions, shared layout, enters/exits, icons, press feedback
- [motion-craft.md](motion-craft.md): frequency, purpose, easing, physicality, gestures, and strict motion review checks
- [motion-vocabulary.md](motion-vocabulary.md): precise names for motion effects and review language
- [motion-review.md](motion-review.md): non-negotiable motion review standards, blockers, remedial order, proof
- [performance.md](performance.md): transition specificity, compositor properties, `will-change`
- [proof-recipes.md](proof-recipes.md): task-to-evidence recipes, action JSON, screenshots, state coverage, and blocked-proof language
- [reference-capture.md](reference-capture.md): screenshot/video/HTML/reference extraction and prompt-pack workflow
- [marketing-pages.md](marketing-pages.md): landing/pricing page structure, proof, objections, and conversion checks
- [visual-recipes.md](visual-recipes.md): bounded detail recipes for shadows, lines, masks, reveals, icon/logo detail, and surface craft
- [immersive-web.md](immersive-web.md): canvas, WebGL, 3D, particles, globes, physics, embeds, and performance gates
- [distinction.md](distinction.md): reflex audit, signature moves, and originality gates for work that must beat generic public design patterns
- [registers.md](registers.md): product, brand, and hybrid design bars
- [taste-calibration.md](taste-calibration.md): design read, variance/motion/density dials, redesign protocol, reference-led flow
- [anti-slop.md](anti-slop.md): generated-UI tells and replacement moves
- [audit-score.md](audit-score.md): scored audit dimensions, severity, and report shape
- [hardening.md](hardening.md): real-data, async, i18n, network, and edge-state resilience
- [detector-rules.md](detector-rules.md): bundled static detector usage and rule meanings
