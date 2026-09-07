---
name: improve-ui
description: "Existing web UI: improve, diagnose, audit, critique, roast, harden, verify. Studios, dashboards, command centers, transactional apps, marketing, prototypes, game HUDs. Not blank-canvas, native, WCAG cert, or specialist 3D."
---

# Improve UI

Find the highest-impact defects in an existing interface and remove their causes. Preserve what works. Meet the requested visual ambition and prove the gain.

## Contents

[Entry](#mandatory-entry-frame) · [Profiles](#choose-a-profile) · [Process](#process) · [Router](#context-router) · [Harness](#deep-review-harness) · [Closeout](#output-contract)

## Mandatory Entry Frame

- Code, screenshots, and runtime prove different claims; source cannot prove visual quality. Nontrivial implementation: [execution-contract.md](execution-contract.md), [product contexts](references/product-contexts.md), [finish quality](finish-quality.md).
- Scope: existing web UI. Route blank-canvas, native UI, specialist renderer/game/3D elsewhere. Keep web HUD, overlay, fallback, and integration here.
- Preserve IA, routes, labels, contracts, analytics, SEO, legal copy, and accessibility wins unless scoped. Never claim WCAG certification.
- `diagnose`, `verify`, `audit`, `review`, `critique`, and `roast` stay read-only. Do not edit source or persistent artifacts. Durable reports only when requested.
- Explicit `improve`, `fix`, `repair`, `polish`, `redesign`, `implement`, or `harden`: edit only requested path. Mixed requests diagnose briefly, then fix in scope.
- Neutral forensic language. Verdict or roast tone only when requested.

## Choose A Profile

Profiles set scope and proof — not mutation authority.
- `micro`: One defect. Reproduce it. If implementation is authorized, patch and check same state and viewport.
- `focused` (default): One bounded surface or flow. Inspect main path plus one edge or recovery state. Fix only when authorized.
- `deep`: Broad audit or redesign, shared primitives, 3+ state families, production readiness, or explicit comprehensive work. Cover relevant dimensions. Uninspected stay `unknown`.

Do not escalate to `deep` only because references or scripts exist. State profile in working notes for nontrivial runs.

## Process

1. Inspect rules, tree, framework, tokens, primitives, route, and run/test commands. Preserve unrelated changes.
2. Frame the user's decision, primary artifact, intended attention order, costly transition, and preserved strengths. Split unrelated archetypes into isolated units. Keep context in concise working notes.
3. `focused`/`deep` diagnosis: use [defect-hunt.md](references/defect-hunt.md) to inspect task, relationships, and detail. Challenge each major finding with the strongest counterargument. Choose only relevant Context Router references.
4. Connect evidence -> consequence -> cause -> exact move -> acceptance. Separate observation from inference and severity from confidence. Builder owns baseline capture -> inspect -> correct -> recapture. Missing reproduction limits proof.
5. Keep a short improvement inventory of confirmed causes and visual opportunities, not one invented defect per dimension. Implementation: P0/P1 first, then repeated costs and the largest visual mismatch. Diagnose/audit/verify: report with evidence; do not edit. Close each in-scope row or name its blocker.
6. Check by profile. `micro`: exact defect state and viewport. `focused`: main path plus one edge or recovery. `deep`: declared relevant state-family and viewport matrix.
7. At the verification boundary, judge `structure` and `finish` against matched evidence. Name gain and regression; classify the comparison `better | flat | worse | inconclusive`. Trace a surviving cause instead of adding decoration. Stop when the scoped outcome is evidenced or a named blocker limits it.
8. Requested durable reviews or proposals: [reporting](references/reporting.md). Otherwise keep findings and proof references in a concise response; do not create a dossier by default.

Implementation: start with [interface-surgery.md](interface-surgery.md). Add [surgical-patterns.md](surgical-patterns.md) only when a symptom repeats. Do not preload other core refs.

## Context Router

Choose one primary row. Union only domain references and proof obligations the scope needs.

| Task | Read the minimum set | Required proof |
|---|---|---|
| Tiny visual regression | [interface-surgery.md](interface-surgery.md) | Same state/viewport before/after when available |
| Component or repeated UI defect | [interface-surgery.md](interface-surgery.md); if repeated, [surgical-patterns.md](surgical-patterns.md). Add [finish-quality.md](finish-quality.md) for rendered craft | Main state plus one edge |
| Product context: studio/editor, dashboard, command center, transactional/admin, game HUD, prototype, commerce/content | [references/product-contexts.md](references/product-contexts.md) | Context card plus costly states, viewports, interactions, detail evidence |
| Neutral audit or design verdict | [forensic-roast.md](forensic-roast.md), [finish-quality.md](finish-quality.md), [references/evidence-and-scoring.md](references/evidence-and-scoring.md). Add [reporting](references/reporting.md) for a durable dossier | Source for implementation findings. Rendered viewport and detail evidence for visual verdict. Unknown where absent |
| Explicit roast | [forensic-roast.md](forensic-roast.md), [finish-quality.md](finish-quality.md) | Same evidence bar as neutral audit |
| Geometry, rhythm, dense layouts, HUD safe areas | [references/geometry-and-rhythm.md](references/geometry-and-rhythm.md), [finish-quality.md](finish-quality.md) | Alignment map, measured repetition, detail crops |
| Hierarchy, taste, typography, surfaces, generic or cheap-looking UI | [references/visual-quality.md](references/visual-quality.md), [references/authorship-and-specificity.md](references/authorship-and-specificity.md), [finish-quality.md](finish-quality.md) | Before/after or reference/after artifact, product-causality test, finish ledger |
| Product copy, labels, state messages, or report prose | [references/copy-and-writing.md](references/copy-and-writing.md) plus matching product route | Same-state before/after, preserved facts/tokens, rendered fit, accessible names/status |
| Semantics, keyboard, focus, forms, contrast | [references/accessibility.md](references/accessibility.md) | Manual interaction plus automated evidence when available |
| Modality, permissions, onboarding, progress, search, undo, large text, inclusion | [references/human-interface-craft.md](references/human-interface-craft.md) | Pattern's costly state from that file's proof table |
| Decision load, interruption/return, partial results, AI-assisted actions, or UX measurement | [references/experience-quality.md](references/experience-quality.md) | Task cost, effect contract, outcome and matching evidence; synthetic runs do not establish human outcomes |
| Responsive, content, i18n, async, real-data states | [references/responsive-hardening.md](references/responsive-hardening.md) | Run states, assertions, relevant viewports |
| Motion or gesture | [references/motion.md](references/motion.md). Add [motion implementation traps](references/motion-implementation.md) while editing. Add [performance](references/performance.md) only for runtime cost | Repeated or interrupted trigger, reduced motion, visual/runtime evidence |
| Requested durable review or proposal | [references/reporting.md](references/reporting.md) plus the diagnosis route | Synchronized reports, local assets, exact annotation mapping, proof limits |
| Frontend performance | [references/performance.md](references/performance.md), [proof-recipes.md](proof-recipes.md) | Measured interaction or limited source-only claim |
| Landing or pricing page | [references/marketing.md](references/marketing.md). Add [visual quality](references/visual-quality.md) only for art direction | First viewport, proof/decision section, mobile |
| Canvas/WebGL/3D already present | [references/immersive.md](references/immersive.md), [performance](references/performance.md) | Readability, fallback, offscreen pause, cleanup, runtime |
| Detector or harness operation | [detector-rules.md](detector-rules.md), [proof-recipes.md](proof-recipes.md) | Exact command, outputs, exit status |
| Broad production-readiness pass | [references/foundation.md](references/foundation.md), [accessibility](references/accessibility.md), [responsive hardening](references/responsive-hardening.md), [evidence/scoring](references/evidence-and-scoring.md) | Relevant dimensions and state manifest. Untested remains unknown |

[core-moves.md](core-moves.md) only as a compact map when route is still unclear. [references/sources-and-provenance.md](references/sources-and-provenance.md) when a standard, browser behavior, or third-party recommendation determines a finding.

## Deep Review Harness

- Keep commands and manifest formats in [proof-recipes.md](proof-recipes.md). Do not copy stale CLI examples into other refs.
- Strict mode only for final implementation claims with valid target and required evidence.
- Objective detector rules are gateable. Advisory taste heuristics stay opt-in; check visually.
- Named runtime states must run and meet their assertion. A listed state is not coverage. Cross with viewports only where claim or risk requires it. Record tested matrix.
- Structured before/after or equivalent artifacts for change proof. Prose is not proof. `--detail-capture` for strict visual-polish, critique, icon, alignment, dense-layout, or scrollbar claims.
- Keep `assessment`, `evidenceCoverage`, and harness expectations separate. Never raise quality because a regression expectation passed.
- Uninspected dimension stays `unknown`. Do not total-score across unknown dimensions.

## Failure Conditions

Incomplete when any condition holds:

- read-only request edited product source without implementation authority
- implementation request stopped at advice despite editable, reachable path
- missing target or zero supported source files reported as clean
- visual changes claimed successful without matched rendered evidence, readable detail, or an explicit proof blocker
- `focused` or `deep` started editing without an improvement inventory, or ended with in-scope rows neither closed nor `blocked` with a reason
- run completed only cosmetic inventory rows while higher-severity rows stayed open without a named blocker
- detector heuristic reported as objective design truth
- repair used a generic cross-context prescription, left primary archetype unknown, or skipped its costly states
- unresolved in-scope P0/P1 findings hidden by an aggregate score
- formal conformance or production-readiness language exceeded inspected scope
- proposed repair has no observable acceptance condition, repeats the surviving cause, or removes useful information to look cleaner
- verdict punishes a convention without checking intent, or treats functioning controls as proof of strong visual design

## Output Contract

- Audits: context card, findings by severity, evidence limits, preserved strengths, next actions.
- Implementations: result first, inventory (row status, files, proof, skipped checks, blockers, remaining risk).
- Separate report usefulness from claim status. Evidence can be partial while completion stays blocked.
- Cite file/line for source findings; viewport, state, and artifact for visual findings. Finish ledger for nontrivial visual work.
- Label rules `standard`, `practice`, `heuristic`, or `preference`. A missed visual brief can fail design quality; taste cannot fail functional correctness or conformance.
- Match user language and tone. For UI copy or report prose, apply [copy and writing quality](references/copy-and-writing.md). Preserve voice and facts. Critique decisions and user effects.
- Requested durable reviews and proposals: one-manifest `report.md` + `report.html`. Ids, annotation geometry, decisions, proof states, and limitations must match.
- Use [checklist.md](checklist.md) before nontrivial final claim.

## Reference Files

Secondary refs, templates, examples, tooling: [package map](reference-index.md) after the router selects concern.
