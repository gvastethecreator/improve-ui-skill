---
name: improve-ui
description: "Improve, diagnose, audit, critique, roast, harden, or verify an existing web interface in source code, screenshots, or a running app. Use for targeted fixes and visual quality across studios/editors, dashboards, command centers, transactional apps, marketing surfaces, interactive prototypes, and existing web game HUDs/overlays, including accessibility, responsive/async states, motion, performance, and production readiness. Do not use for blank-canvas design, native UI, formal WCAG certification, or specialist renderer/game/3D-system implementation."
---

# Improve UI

Improve the existing interface. Preserve its path, trace weakness to source, make the smallest authorized systemic change, and limit claims to evidence.

## Contents

- [Entry](#mandatory-entry-frame)
- [Profiles](#choose-a-profile)
- [Process](#process)
- [Router](#context-router)
- [Harness](#deep-review-harness)
- [Closeout](#output-contract)

## Mandatory Entry Frame

- Code, screenshots, and runtime prove different claims; source cannot prove visual quality. For nontrivial implementation, use [execution-contract.md](execution-contract.md), [product contexts](references/product-contexts.md), and [finish quality](finish-quality.md).
- Scope existing web UI. Route blank-canvas, native UI, and specialist renderer/game/3D work elsewhere; keep web HUD, overlay, fallback, and integration quality here.
- Preserve working IA, routes, labels, contracts, analytics, SEO, legal copy, and accessibility wins unless scoped. Never claim formal WCAG certification.
- `diagnose`, `verify`, `audit`, `review`, `critique`, and `roast` remain read-only; do not edit product source or persistent artifacts. Create durable reports only when requested.
- Explicit `improve`, `fix`, `repair`, `polish`, `redesign`, `implement`, or `harden` requests may edit only the requested path. Mixed requests diagnose briefly, then fix in scope.
- Default to neutral forensic language; use verdict or roast tone only when requested.

## Choose A Profile

Profiles set scope and proof; they do not grant mutation authority.
- `micro`: One defect. Reproduce it; for authorized implementation, patch locally and verify the same state and viewport.
- `focused` (default): One bounded surface or flow. Inspect the main path plus one edge/recovery state; fix only when authorized.
- `deep`: Broad audit/redesign, shared primitives, three or more state families, production readiness, or explicit comprehensive work. Cover relevant dimensions/states; leave uninspected dimensions `unknown`.

Do not escalate to `deep` merely because references or scripts exist. State the profile in the working notes for nontrivial runs.

## Process

1. Inspect rules, tree, framework, tokens, primitives, route, and run/test commands. Preserve unrelated changes.
2. Frame one surface: archetype, user mode, artifact, pressure, input, spatial model, costly states, hierarchy, cause, constraints, and proof matrix. Split unrelated archetypes into isolated work units.
3. Choose one Context Router row; combine only domains actually in scope.
4. The builder owns baseline capture -> inspect -> correct -> recapture. Without reproduction, change only a clear source-backed cause and label proof provisional.
5. For `focused`/`deep`, inventory every applicable dimension before editing: `dimension - damage - planned move - severity`; mark clean `pass` and uninspected `unknown`. In implementation, fix P0/P1 first, then in-scope P2/taste rows. In diagnose/audit/verify, report findings with evidence without editing. Close each row or record why it is `blocked`.
6. Verify by profile: `micro` reruns the exact defect state and viewport; `focused` covers the main path and one edge/recovery state; `deep` executes the declared relevant state-family and viewport matrix, covers applicable dimensions, and leaves uninspected dimensions `unknown`.
7. Run `structure` and `finish`; persist context, before/after/detail proof, and finish ledger from the execution contract. Stop only when applicable dimensions pass or a named blocker limits the claim.
8. For material reviews/proposals, follow [reporting](references/reporting.md) and generate synchronized Markdown + HTML from one manifest.

For implementation, start with [interface-surgery.md](interface-surgery.md); add [surgical-patterns.md](surgical-patterns.md) only when a symptom repeats. Do not preload the other core references.

## Context Router

Choose one primary row, then union only the domain references and proof obligations needed by the actual scope.

| Task | Read the minimum set | Required proof |
|---|---|---|
| Tiny visual regression | [interface-surgery.md](interface-surgery.md) | Same state and viewport before/after when available |
| Component or repeated UI defect | [interface-surgery.md](interface-surgery.md), then [surgical-patterns.md](surgical-patterns.md) if repeated; add [finish-quality.md](finish-quality.md) for rendered craft | Main state plus one edge state |
| Product context: studio/editor, dashboard, command center, transactional/admin, game HUD, prototype, commerce/content | [references/product-contexts.md](references/product-contexts.md) | Context card plus archetype-specific costly states, viewports, interactions, and detail evidence |
| Neutral audit or design verdict | [forensic-roast.md](forensic-roast.md), [finish-quality.md](finish-quality.md), [references/evidence-and-scoring.md](references/evidence-and-scoring.md); add [reporting](references/reporting.md) for a durable dossier | Source for implementation findings; readable rendered viewport and detail evidence for visual verdict; unknown where absent |
| Explicit roast | [forensic-roast.md](forensic-roast.md), [finish-quality.md](finish-quality.md) | Same evidence bar as a neutral audit |
| Geometry, rhythm, dense layouts, HUD safe areas | [references/geometry-and-rhythm.md](references/geometry-and-rhythm.md), [finish-quality.md](finish-quality.md) | Alignment map, measured repetition, and detail crops |
| Hierarchy, taste, typography, surfaces, generic or cheap-looking UI | [references/visual-quality.md](references/visual-quality.md), [references/authorship-and-specificity.md](references/authorship-and-specificity.md), [finish-quality.md](finish-quality.md) | Before/after or reference/after visual artifact, product-causality test, and finish ledger |
| Product copy, labels, state messages, or report prose | [references/copy-and-writing.md](references/copy-and-writing.md) plus the matching product route | Same-state before/after, preserved facts/tokens, rendered fit, and accessible names/status |
| Semantics, keyboard, focus, forms, contrast | [references/accessibility.md](references/accessibility.md) | Manual interaction plus automated evidence when available |
| Modality, permissions, onboarding, progress, search, undo, large text, inclusion | [references/human-interface-craft.md](references/human-interface-craft.md) | The pattern's costly state from that file's proof table |
| Responsive, content, i18n, async, real-data states | [references/responsive-hardening.md](references/responsive-hardening.md) | Executed states, assertions, and relevant viewports |
| Motion or gesture | [references/motion.md](references/motion.md); add [motion implementation traps](references/motion-implementation.md) while editing and [performance](references/performance.md) only for runtime cost | Repeated/interrupted trigger, reduced motion, and visual/runtime evidence |
| Material review or proposal | [references/reporting.md](references/reporting.md) plus the diagnosis route | Synchronized reports, local assets, exact annotation mapping, and proof limits |
| Frontend performance | [references/performance.md](references/performance.md), [proof-recipes.md](proof-recipes.md) | Measured interaction or explicitly limited source-only claim |
| Landing or pricing page | [references/marketing.md](references/marketing.md); add [visual quality](references/visual-quality.md) only for art direction | First viewport, proof/decision section, and mobile |
| Canvas/WebGL/3D already present | [references/immersive.md](references/immersive.md), [performance](references/performance.md) | Readability, fallback, offscreen pause, cleanup, and runtime |
| Detector or harness operation | [detector-rules.md](detector-rules.md), [proof-recipes.md](proof-recipes.md) | Exact command, outputs, and exit status |
| Broad production-readiness pass | [references/foundation.md](references/foundation.md), [accessibility](references/accessibility.md), [responsive hardening](references/responsive-hardening.md), [evidence/scoring](references/evidence-and-scoring.md) | Relevant dimensions and state manifest; untested remains unknown |

Use [core-moves.md](core-moves.md) only as a compact map when the correct route is still unclear. Use [references/sources-and-provenance.md](references/sources-and-provenance.md) when a standard, browser behavior, or third-party recommendation determines a finding.

## Deep Review Harness

- Keep commands and manifest formats centralized in [proof-recipes.md](proof-recipes.md); do not copy stale CLI examples into other references.
- Use strict mode only for final implementation claims with a valid target and the evidence it requires.
- Treat objective detector rules as gateable. Keep advisory taste heuristics opt-in and visually confirm them.
- Require every named runtime state to execute successfully and meet its assertion; listing a state is not coverage. Cross states with viewports only where the claim or risk requires it, and record the tested matrix.
- Require structured before/after or equivalent artifacts for change proof; prose is not proof. Use `--detail-capture` for strict visual-polish, critique, icon, alignment, dense-layout, or scrollbar claims.
- Keep `assessment`, `evidenceCoverage`, and harness expectations separate. Never raise quality because a regression expectation passed.
- Leave an uninspected dimension `unknown`; do not compute a total score across unknown dimensions.

## Failure Conditions

Treat the run as incomplete when any relevant condition holds:

- a read-only request edited product source without implementation authority;
- an implementation request stopped at advice despite an editable, reachable path;
- a missing target or zero supported source files was reported as clean;
- frontend code changed without rendered proof, skipped an applicable finish dimension, used unreadable detail evidence, or lacked an explicit proof blocker;
- a named state was not executed and asserted successfully;
- `focused` or `deep` work started editing without an improvement inventory, or ended with in-scope rows that are neither closed nor `blocked` with a reason;
- the run executed only cosmetic inventory rows while higher-severity rows stayed open without a named blocker;
- prose, a pathless success message, or mismatched artifacts were used as change proof;
- a detector heuristic was reported as objective design truth;
- the repair used a generic cross-context prescription, left the primary archetype unknown, or skipped its costly states;
- unrelated primary archetypes were batched into one implementation work unit, or the builder delegated its proof loop to a later coordinator;
- unresolved in-scope P0/P1 findings were hidden by an aggregate score;
- unknown dimensions were initialized, scored, or presented as passing;
- formal conformance or production-readiness language exceeded the inspected scope.

## Output Contract

- Lead audits with the context card and findings ordered by severity, then evidence limits, preserved strengths, and concrete next actions.
- Lead implementations with the result, then the inventory with each row's status, files changed, proof, skipped checks, blockers, and remaining risk.
- Separate report usefulness from claim status: evidence may be partial while the requested completion remains blocked.
- Cite file/line for source findings and viewport/state/artifact for visual findings; include the finish ledger for nontrivial visual work.
- Label rules as `standard`, `practice`, `heuristic`, or `preference`; never block on taste alone.
- Match the user's language and tone. For UI copy or report prose, apply [copy and writing quality](references/copy-and-writing.md), preserve voice and facts, and critique decisions and user effects.
- Material reviews/proposals use one-manifest `report.md` + `report.html`; ids, annotation geometry, decisions, proof states, and limitations must match.
- Use [checklist.md](checklist.md) before a nontrivial final claim.

## Reference Files

Use the [package map](reference-index.md) to find secondary references, templates, examples, and tooling after the router selects the concern.
