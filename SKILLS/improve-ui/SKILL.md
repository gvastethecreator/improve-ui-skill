---
name: improve-ui
description: "Improve, diagnose, audit, critique, roast, harden, or verify an existing web interface in source code, screenshots, or a running app. Use for targeted UI fixes, visual polish, design-system drift, accessibility checks, responsive or async-state failures, motion, frontend performance, marketing surfaces, and evidence-backed production-readiness work. Do not use for blank-canvas or greenfield design, native UI, formal WCAG certification, or specialist renderer/game/3D-system implementation; do use it for existing web HUD, overlay, and integration quality around those systems."
---

# Improve UI

Improve the interface users already have. Preserve the real product path, locate the source of the visible weakness, make the smallest systemic change authorized by the request, and limit every claim to the evidence collected.

## Contents

- [Mandatory entry frame](#mandatory-entry-frame)
- [Choose a profile](#choose-a-profile)
- [Process](#process)
- [Context router](#context-router)
- [Deep review harness](#deep-review-harness)
- [Failure conditions](#failure-conditions)
- [Output contract](#output-contract)
- [Reference files](#reference-files)

## Mandatory Entry Frame

- Treat code, screenshots, and runtime states as evidence with different limits; never infer a visual pass from source alone.
- Scope work to existing web UI. Route blank-canvas requests to a greenfield design-and-build skill, native UI to a platform skill, and specialist renderer/game/3D-system implementation to the matching domain skill; keep existing web HUD, overlay, fallback, and integration-quality work here.
- Describe accessibility work as an audit or improvement against named criteria, never as formal WCAG conformance or certification.
- Preserve working IA, routes, labels, form contracts, analytics, SEO, legal copy, and accessibility wins unless the user places them in scope.
- Separate authority before acting:
  - For `diagnose`, `verify`, `audit`, `review`, `analyze`, `critique`, `roast`, or "does this look good?", remain read-only; do not edit product source or persistent project artifacts. Use temporary diagnostic output only when necessary; create durable reports only when requested.
  - For `improve`, `fix`, `repair`, `polish`, `redesign`, `implement`, `harden`, or an equivalent explicit change imperative, edit only the requested path and verify it.
  - For a mixed request, diagnose briefly, then implement the in-scope fixes.
- Use neutral forensic analysis by default. Use professional critique when a verdict is requested. Use roast language only when the user explicitly asks for a roast.

## Choose A Profile

Profiles set scope and proof; they do not grant mutation authority.
- `micro`: Isolated visual bug or tiny component defect. Reproduce the exact state. For authorized implementation, patch locally; verify the same state and viewport.
- `focused` (default): One surface or flow with bounded consumers and states. Frame hierarchy and constraints, inspect the main path plus one relevant edge/recovery state, and fix them only when authorized.
- `deep`: Broad audit, shared primitive/multiple-consumer redesign, three or more required state families, production readiness, or explicit comprehensive work. Cover relevant dimensions and states; leave uninspected dimensions `unknown`.

Do not escalate to `deep` merely because references or scripts exist. State the profile in the working notes for nontrivial runs.

## Process

1. Inspect the repository rules, working tree, framework, tokens, primitives, target route, and available run/test commands. Preserve unrelated changes.
2. Frame the surface: main user task, intended hierarchy, accidental priority, register (`product`, `brand`, or `hybrid`), source cause, constraints, and proof target.
3. Choose one primary Context Router row by the requested outcome. Combine rows only for domains actually in scope; open a listed secondary reference when the request or first inspection exposes that concern.
4. Capture baseline evidence before editing when the claim is visual, interactive, responsive, or performance-related. For implementation without reproduction, change only a clear source-backed cause and label the result provisional; do not guess.
5. Prioritize P0/P1 before taste: in implementation, fix them at the safest primitive, token, layout-shell, state-model, or local source; in diagnose/audit/verify, report them with evidence without editing.
6. Verify by profile: for `micro`, rerun the exact defect state and viewport; for `focused`, verify the in-scope main path and one relevant edge/recovery state; for `deep`, execute the declared relevant state-family and viewport matrix, cover applicable dimensions, and leave uninspected dimensions `unknown`. After edits, rerun source checks and runtime proof in proportion to risk.
7. Stop when the requested bar is evidenced, remaining risk is out of scope, or a specific blocker prevents further proof. Never turn a blocker into a pass.

For implementation, start with [interface-surgery.md](interface-surgery.md); add [surgical-patterns.md](surgical-patterns.md) only when a symptom repeats. Do not preload the other core references.

## Context Router

Choose one primary row, then union only the domain references and proof obligations needed by the actual scope.

| Task | Read the minimum set | Required proof |
|---|---|---|
| Tiny visual regression | [interface-surgery.md](interface-surgery.md) | Same state and viewport before/after when available |
| Component or repeated UI defect | [interface-surgery.md](interface-surgery.md), then [surgical-patterns.md](surgical-patterns.md) if repeated | Main state plus one edge state |
| Neutral audit or design verdict | [forensic-roast.md](forensic-roast.md), [references/evidence-and-scoring.md](references/evidence-and-scoring.md) | Source for implementation findings; rendered named viewport for visual verdict; unknown where absent |
| Explicit roast | [forensic-roast.md](forensic-roast.md) | Same evidence bar as a neutral audit |
| Hierarchy, taste, typography, surfaces, generic UI | [references/visual-quality.md](references/visual-quality.md) | Before/after or reference/after visual artifact |
| Semantics, keyboard, focus, forms, contrast | [references/accessibility.md](references/accessibility.md) | Manual interaction plus automated evidence when available |
| Responsive, content, i18n, async, real-data states | [references/responsive-hardening.md](references/responsive-hardening.md) | Executed states, assertions, and relevant viewports |
| Motion or gesture | [references/motion.md](references/motion.md); add [references/performance.md](references/performance.md) only for runtime cost | Repeated/interrupted trigger, reduced motion, and visual/runtime evidence |
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
- Require structured before/after or equivalent artifacts for change proof; prose is not proof.
- Keep `assessment`, `evidenceCoverage`, and harness expectations separate. Never raise quality because a regression expectation passed.
- Leave an uninspected dimension `unknown`; do not compute a total score across unknown dimensions.

## Failure Conditions

Treat the run as incomplete when any relevant condition holds:

- a read-only request edited product source without implementation authority;
- an implementation request stopped at advice despite an editable, reachable path;
- a missing target or zero supported source files was reported as clean;
- frontend code changed without rendered proof or an explicit proof blocker;
- a named state was not executed and asserted successfully;
- prose, a pathless success message, or mismatched artifacts were used as change proof;
- a detector heuristic was reported as objective design truth;
- unresolved in-scope P0/P1 findings were hidden by an aggregate score;
- unknown dimensions were initialized, scored, or presented as passing;
- formal conformance or production-readiness language exceeded the inspected scope.

## Output Contract

- Lead audits with findings ordered by severity, then evidence limits, preserved strengths, and concrete next actions.
- Lead implementations with the result, then files changed, proof, skipped checks, blockers, and remaining risk.
- Separate report usefulness from claim status: evidence may be partial while the requested completion remains blocked.
- Cite file/line for source findings and viewport/state/artifact for visual findings.
- Label rules as `standard`, `practice`, `heuristic`, or `preference`; never block on taste alone.
- Match the user's language and requested tone. Attack interface decisions, never the people who made them.
- Use [checklist.md](checklist.md) before a nontrivial final claim.

## Reference Files

- Core workflow: [relentless-mode.md](relentless-mode.md), [interface-surgery.md](interface-surgery.md), [surgical-patterns.md](surgical-patterns.md), [core-moves.md](core-moves.md)
- Evidence tooling: [proof-recipes.md](proof-recipes.md), [detector-rules.md](detector-rules.md), [checklist.md](checklist.md)
- Review tone: [forensic-roast.md](forensic-roast.md)
- Domain references: [foundation](references/foundation.md), [visual quality](references/visual-quality.md), [accessibility](references/accessibility.md), [responsive hardening](references/responsive-hardening.md), [motion](references/motion.md), [performance](references/performance.md), [marketing](references/marketing.md), [immersive web](references/immersive.md), [evidence and scoring](references/evidence-and-scoring.md)
- Authority ledger: [sources and provenance](references/sources-and-provenance.md)
- Reusable records: [surgical read](templates/surgical-read.md), [surgery log](templates/surgery-log.md), [evidence ledger](templates/evidence-ledger.md)
- Executable examples: [component polish](examples/golden-component-polish.md), [dashboard surgery](examples/golden-dashboard-surgery.md), [landing repair](examples/golden-landing-repair.md)
