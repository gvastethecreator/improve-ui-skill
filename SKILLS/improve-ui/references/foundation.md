# Foundation

Broad or systemic pass. Local defect: use `../interface-surgery.md` without loading this file.

## Rule authority

Classify every recommendation before using it:

- `standard`: normative requirement from a named standard or explicit project contract. Blocking only if direct evidence shows a violation in scope.
- `practice`: engineering default. Deviate if the repo or measured behavior supports a better choice.
- `heuristic`: contextual diagnostic. Check it in the rendered interface or product context before reporting it as a problem.
- `preference`: local taste. Never fail a review or CI gate on it alone.

Do not turn a guideline into a standard by repeating it. Cite source and criterion for standards. Label uncertain interpretations.

## Surgical read

Before editing, record the minimum useful diagnosis: surface and route (screen, component, state, real user path); main task; intended hierarchy; accidental priority (what is visually louder than the task); user harm (blocked action, confusion, error risk, access barrier, latency, or trust loss); source cause (primitive, token, layout shell, state model, component boundary, data contract, or isolated style); cut order (smallest set of removals, merges, promotions, or repairs); proof target (state, viewport, assertion, artifact, or measured interaction).

Avoid “needs more polish.” Name the element, source cause, and user consequence.

## Preservation contract

Preserve unless the user explicitly includes them:

- information architecture, route slugs, primary navigation labels, deep-link behavior
- form names, field order, validation semantics, data shape, submission behavior
- analytics event names, tracking hooks, experiments, consent behavior
- SEO metadata, structured data, headings that carry document meaning, legal copy
- keyboard paths, accessible names, focus behavior, reduced-motion handling, other accessibility wins
- framework, package manager, established component library, tokens, icon family, repo conventions
- user content, real data, approved brand assets

Do not preserve a contract that causes the defect. Change it deliberately. Document the consequence. Check downstream consumers.

## Systemic repair order

1. Restore task completion, accurate state, semantics, recoverability
2. Fix hierarchy and layout structure
3. Fix repeated causes at the state model, primitive, token, or shell
4. Harden responsive, content, locale, loading, error, permission behavior
5. Remove unnecessary runtime work and motion
6. Refine typography, color, surfaces, details
7. Add distinction only when the surface needs persuasion or identity

Choose change ambition explicitly:

- `local fix`: one isolated defect, no repeated cause
- `component primitive`: repeated component behavior or state
- `token/system`: color, space, type, radius, motion, or semantic-state drift
- `layout shell`: hierarchy or responsive structure shared by a view
- `state model`: duplicate, contradictory, missing, or stale state ownership

Prefer the smallest ambition that removes the cause without widening scope.

## Severity

- `P0`: prevents a core task, loses data, severe security/safety issue, or traps the user with no recovery
- `P1`: breaks a core flow, materially misrepresents state, demonstrated accessibility failure, or severe responsive/performance failure
- `P2`: degrades comprehension, resilience, consistency, trust, or repeated use without blocking the core task
- `P3`: low-impact polish or optional refinement

Do not make taste P1. Escalate a visual heuristic only if evidence ties it to readability, trust, task priority, or a documented product requirement.

## State and interaction contracts

For each region touched, identify applicable contracts:

- default, hover, focus-visible, active/pressed, selected, disabled, pending, destructive
- initial loading, refresh, loading more, empty, error, permission denied, stale, retry
- short, typical, long, unbroken, translated, CJK, RTL content when relevant
- keyboard, fine pointer, coarse pointer, touch, zoom, reduced motion
- narrow container, mobile, small laptop, desktop, high-density data
- offline, timeout, cancellation, repeated action, concurrent/stale response

Safely reversible → offer undo. Irreversible or costly → require confirmation. Keep a clear cancel path.

Test only states the product can reach. Do not claim unexecuted states as covered. If production readiness requires otherwise unreachable states, add fixtures or state controls.

## Completion rules

Complete only when:

- changed code sits on the real path
- visible/systemic cause is removed or measurably reduced
- main state and one relevant edge or recovery state pass
- unresolved P0/P1 findings are fixed, explicitly out of scope, or blocked with a concrete reason
- repeated in-scope P2 causes are fixed or intentionally deferred with impact
- evidence supports the exact claim; uninspected dimensions remain `unknown`
- unrelated user changes remain intact

Incomplete proof: “implemented, not fully verified” or “reviewed, blocked by …”. Do not substitute confidence for evidence.
