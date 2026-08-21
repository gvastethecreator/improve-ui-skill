# Interface Surgery

Implementation-level improvement of an existing web route, state, component, screenshot-backed defect, or running interface. Audit-only: same diagnosis, do not edit source.

## Surgical Read

Record before changing code:

- target route, surface, component, viewport, state
- primary archetype, bounded secondary regions, user mode, primary artifact, pressure, input, spatial model, and costly states from [product contexts](references/product-contexts.md)
- main task and next action
- intended hierarchy and accidental priority
- visible failure and user consequence
- likely source cause: primitive, token, shell, state model, data contract, component boundary, or isolated style
- preservation rules
- proof target and relevant edge/recovery state

Done when diagnosis connects a visible symptom and context delta to a source cause and archetype-specific testable outcome.

## Cut Order

1. Fix task blockers, misleading state, semantics, focus, recovery.
2. Fix hierarchy and responsive structure.
3. Remove duplicate status, warnings, CTAs, wrappers, copy.
4. Repair repeated causes at the shared primitive/token/layout/state source.
5. Harden the edge state most likely to expose the same weakness.
6. Refine type, color, surfaces, motion, visual detail.

If layout, scrolling, density, navigation, or motion belongs to another archetype, repair that mismatch before finish polish. Do not turn a studio into a dashboard, a command center into sci-fi analytics, or a game HUD into floating admin cards.

Keep isolated defects local. Do not replace a design system or rewrite a page for a small bug.

## Preserve

Preserve working routes, IA, labels, forms, data contracts, analytics, SEO, legal copy, accessibility, design-system conventions, and unrelated user changes unless in scope.

If one of these contracts causes the defect, change it deliberately and check affected consumers.

## Proof

For a `micro` change, reproduce and check the exact state and viewport.

For a `focused` or `deep` implementation, prove:

- changed main path
- one relevant edge or recovery state
- context-specific costly moment and any bounded hybrid-region boundary
- focused source/test/build checks
- visual/browser evidence when a runnable UI exists
- a completed [finish-quality.md](finish-quality.md) ledger when alignment, spacing, overflow/scrollbars, gradients, icons, or visual polish are in scope
- detector output when it catches an objective risk in the touched path
- explicit limits when runtime, state fixtures, or browsers are unavailable

Do not claim the fix from a screenshot that differs in content, route, state, viewport, or theme. Use structured proof artifacts for final visual-change claims.

## Finish

- Patch must touch the real user path.
- Source cause must be removed or reduced.
- Rerun the evidence that originally exposed the problem.
- Reinspect the rendered result at readable detail after the last correction. Do not assume a local nudge removed the visible defect.
- Keep untested behavior `unknown`.
- Name files changed, proof, skipped checks, blockers, remaining risk.

For repeated symptoms, continue with [surgical-patterns.md](surgical-patterns.md). For broad/systemic work, read [references/foundation.md](references/foundation.md).
