---
name: improve-ui
description: "Relentless UI improvement router. Use for design analysis, UI audits/roasts, visual bugs, frontend polish, accessibility, motion, typography, surfaces, or hardening."
---

# Improve UI

Use Improve UI to make an existing or new interface materially better without forcing one aesthetic. Be adversarial toward weak UI and collaborative toward the user: challenge vague hierarchy, fake priority, generic visuals, inaccessible states, and half-finished proof before settling for polish.

## Process

1. Start in relentless mode.
   - Read `relentless-mode.md` for any interface improvement, UI audit/review, production-ready pass, polish, redesign, screenshot critique, design verdict, or visible UI bug.
   - Treat vague praise, detector-only output, advice-only fixes, and "looks better" without evidence as failed runs.
   - If the repo is editable and the user asked to improve or fix UI, plan to patch the real path before finalizing unless blocked.
   - Done when the target bar, strongest visible/systemic risk, and stop condition are explicit.

2. Frame the work before changing UI. Identify:

   - Surface: product app, dashboard, marketing page, content/editorial, commerce/media card, game/tool, design system component, or visual bug.
   - Task shape: build, polish pass, audit/review, compliance pass, bug fix, motion/performance pass, or design-system hardening.
   - Register: product, brand, or hybrid. Product serves task flow; brand persuades and differentiates; hybrid splits the surface by purpose.
   - Design read and dials when visual quality matters: audience, visual language, existing system/aesthetic, `DESIGN_VARIANCE`, `MOTION_INTENSITY`, and `VISUAL_DENSITY`.
   - Constraints: existing design system, framework, installed animation library, accessibility, interaction frequency, trigger modality, reduced-motion behavior, target devices/browsers, real-data edge cases.
   - Proof: screenshot, running app, source component, failing visual state, detector output, runtime audit output, or explicit blocker. If frontend code changes, visually verify before calling it done.
   - Done when the route, constraints, and proof source are explicit enough to choose references without guessing.

Ask only when missing context changes the decision. Otherwise use the nearest existing pattern and keep the diff small.

3. Route to the smallest useful reference set.
   - Use the Context Router below, then open only the reference files needed for the chosen surface and task shape.
   - When the user asks for design analysis, UI audit/review, screenshot critique, visual quality verdict, or a roast, read `forensic-roast.md` before producing findings; cross-reference screenshot/runtime evidence with code when both exist.
   - When visual quality, redesign, bland/generic output, or brand/marketing quality is in scope, read `distinction.md` before settling on a direction.
   - When a supplied URL, video, screenshot, HTML export, or strong visual brief would reduce guessing, read `reference-capture.md` before implementation.
   - Done when every opened reference can change the implementation, review finding, or proof plan.

4. Change the real user path before polish.
   - For implementation, fix the component, state, layout, or primitive that users actually touch.
   - For audit/review, lead with P1/P2 findings from evidence, grouped by systemic cause; if the request is actionable and files are editable, convert the top findings into patches before finalizing.
   - Fix repeated P2 patterns at the primitive/token/layout/state level when safer than patching instances.
   - Done when the main path and one relevant edge/recovery path are handled, or when the unresolved part is explicitly blocked.

5. Prove the result and name the remaining risk.
   - Run the detector or review harness when local frontend files are available; use screenshots/browser proof for frontend code changes when a runnable UI exists.
   - Read `proof-recipes.md` when the task involves interaction, responsive fit, async states, motion, reference-led visual work, or a nontrivial final claim.
   - If proof still shows P1 or repeated/systemic P2 issues in the touched path, keep iterating or state the blocker; do not call the work done.
   - Done when the final note names files, proof, skipped checks, blockers, and remaining risks without turning missing evidence into a pass.

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
- Audit/review pass: run a deep-review ledger unless the user asks for quick polish only. For design analysis, use the forensic roast contract: product intent, main task, intended hierarchy, accidental priority, screenshot/code evidence, ruthless cuts, and implementation-level fixes. Score accessibility, performance, theming/design-system, responsive/content resilience, and anti-slop fit from evidence, then fix highest-impact P1/P2 patterns before polish.
- Hardening pass: force real data states: empty, loading, error, permission, long text, translation, slow network, rapid clicks, and large data. For apps, dashboards, forms, and async regions, these checks are required in deep review.

## Deep Review Harness

Use this mode when the user asks to improve an interface, review UI quality, improve performance, or make a screen production-ready. Skip only for tiny visual bug fixes or when the user explicitly asks for quick polish. Deep review is red until P1 and repeated/systemic P2 issues in scope are fixed, blocked, or explicitly deferred.

Required ledger:

- Context: surface, register, user task, target viewports, important states, existing design-system constraints.
- Taste calibration: design read, dials, reference/source choice, and redesign preservation decisions when visual quality is in scope.
- Evidence: files/lines, detector output, screenshots/viewport states, runtime/browser output, or blocker.
- Forensic design read: product intent, main user task, intended visual hierarchy, accidental priority, screenshot/code cross-reference, and the first five cuts when the task is analysis/review/roast.
- Findings: P1/P2 first, grouped by systemic cause rather than every repeated instance.
- Change ambition: `local fix`, `component primitive`, `token/system`, `layout shell`, or `state model`.
- Proof: before/after screenshot or runtime state for changed frontend behavior.

Recommended command:

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --out output/improve-ui/<slug> --fail-on=P2
```

Use [proof-recipes.md](proof-recipes.md) to choose viewports, state runs, action JSON, before/after artifacts, and blocked-proof language. If no URL is available, run static review and state that runtime/visual proof is blocked. If no detector can run, say why. Do not call a performance pass "deep" unless at least one real interaction or viewport state was inspected.

## Core Moves

Read `core-moves.md` after the context router selects visual polish, audit, build, compliance, motion, performance, or hardening work. Completion criterion: chosen moves produce evidence, not taste-only commentary.

## Output Contract

- Implementation: change code, then summarize files touched and visual/test proof.
- Design analysis/roast: use `forensic-roast.md` output shape unless the user requested another artifact. Major criticism without screenshot/browser/source evidence is invalid unless the missing evidence is named as a blocker.
- Audit/review: findings first, ordered by severity, with file/line references or viewport states. Include context/evidence ledger, score, systemic cause, and next actions when scope is broader than one bug. If the user asked to improve and the repo is editable, do not stop at next actions; implement the top in-scope fix. Use tables only when they improve scanning.
- Polish pass: group changes by principle, but omit principles that needed no change.
- If a tempting change is speculative, skip it and say why in one line.

Required gates for deep review:

- P1 unresolved means the review fails unless blocked by missing access or explicit scope.
- Relentless mode skipped without an explicit quick/scope reason means the run is incomplete.
- Design analysis without `forensic-roast.md` criteria is incomplete when the user asked for a design verdict, audit, screenshot critique, or roast.
- Advice-only output is incomplete when the user asked to improve/fix UI and the relevant source is editable.
- Frontend code change without visual proof is incomplete unless the blocker is stated.
- Local frontend files require detector output or explicit skip reason.
- Repeated/systemic P2 findings in the touched path require another pass unless blocked or explicitly out of scope.
- Open-ended visual builds require taste calibration; broad brand/marketing work should use reference-led proof when image/reference generation is available and useful.
- Open-ended visual builds require a distinction note: rejected default, rejected second reflex, chosen signature move, and proof.
- Async/data UI requires empty, loading, error, permission, long-content, slow-network, and rapid-click checks or scoped skip reason.
- Motion review requires purpose, frequency, origin, duration/easing, interruptibility, reduced-motion, hover gating, and visual feel proof or blocker.
- Repeated P2 patterns should be fixed at primitive/token/layout level when that is safer than one-off instance patches.

## Checklist

Read `checklist.md` before finalizing a review or implementation pass. Completion criterion: every relevant checklist item is satisfied, fixed, or explicitly waived with evidence.

## Reference Files

- [typography.md](typography.md): wrapping, smoothing, tabular numbers
- [relentless-mode.md](relentless-mode.md): required execution stance, improvement loop, failure conditions, and stop rules
- [forensic-roast.md](forensic-roast.md): required brutal, evidence-backed screenshot/code design analysis and roast output
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
