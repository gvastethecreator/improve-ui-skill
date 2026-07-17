# Interface Surgery

Use this for implementation-level improvement of an existing web route, state, component, screenshot-backed defect, or running interface. For an audit-only request, use the same diagnosis but do not edit source.

## Surgical Read

Record before changing code:

- target route, surface, component, viewport, and state;
- primary archetype, bounded secondary regions, user mode, primary artifact, pressure, input, spatial model, and costly states from [product contexts](references/product-contexts.md);
- main task and next action;
- intended hierarchy and accidental priority;
- visible failure and user consequence;
- likely source cause: primitive, token, shell, state model, data contract, component boundary, or isolated style;
- preservation rules;
- proof target and relevant edge/recovery state.

Done when the diagnosis connects a visible symptom and context delta to a source cause and archetype-specific testable outcome.

## Cut Order

1. Fix task blockers, misleading state, semantics, focus, and recovery.
2. Fix hierarchy and responsive structure.
3. Remove duplicate status, warnings, CTAs, wrappers, and copy.
4. Repair repeated causes at the shared primitive/token/layout/state source.
5. Harden the edge state most likely to expose the same weakness.
6. Refine type, color, surfaces, motion, and visual detail.

If the current layout, scrolling, density, navigation, or motion model belongs to another archetype, repair that mismatch before finish polish. Do not turn a studio into a dashboard, a command center into sci-fi analytics, or a game HUD into floating admin cards.

Keep isolated defects local. Do not replace a design system or rewrite a page for a small bug.

## Preserve

Preserve working routes, IA, labels, forms, data contracts, analytics, SEO, legal copy, accessibility behavior, design-system conventions, and unrelated user changes unless explicitly in scope.

If one of these contracts causes the defect, change it deliberately and verify the affected consumers.

## Proof

For a `micro` change, reproduce and verify the exact state and viewport.

For a `focused` or `deep` implementation, prove:

- the changed main path;
- one relevant edge or recovery state;
- the context-specific costly moment and any bounded hybrid-region boundary;
- focused source/test/build checks;
- visual/browser evidence when a runnable UI exists;
- a completed [finish-quality.md](finish-quality.md) ledger when alignment, spacing, overflow/scrollbars, gradients, icons, or visual polish are in scope;
- detector output when it catches an objective risk in the touched path;
- explicit limits when runtime, state fixtures, or browsers are unavailable.

Do not claim the fix from a screenshot that differs in content, route, state, viewport, or theme. Use structured proof artifacts for final visual-change claims.

## Finish

- Ensure the patch touches the real user path.
- Confirm the source cause is removed or reduced.
- Rerun the evidence that originally exposed the problem.
- Reinspect the rendered result at readable detail after the last correction; do not assume a local nudge removed the visible defect.
- Keep untested behavior `unknown`.
- Name files changed, proof, skipped checks, blockers, and remaining risk.

For repeated symptoms, continue with [surgical-patterns.md](surgical-patterns.md). For broad/systemic work, read [references/foundation.md](references/foundation.md).
