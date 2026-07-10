# Foundation

Use this reference for a broad or systemic pass. For a local defect, use `../interface-surgery.md` without loading this file.

## Contents

- [Rule authority](#rule-authority)
- [Surgical read](#surgical-read)
- [Preservation contract](#preservation-contract)
- [Systemic repair order](#systemic-repair-order)
- [Severity](#severity)
- [State and interaction contracts](#state-and-interaction-contracts)
- [Completion rules](#completion-rules)

## Rule Authority

Classify every recommendation before using it:

- `standard`: A normative requirement from a named standard or an explicit project contract. Treat as blocking only when direct evidence shows a violation in scope.
- `practice`: A robust engineering default. Deviate when the repository or measured behavior supports a better choice.
- `heuristic`: A contextual diagnostic signal. Confirm it in the rendered interface or product context before reporting it as a problem.
- `preference`: A local taste choice. Never fail a review or CI gate on it alone.

Do not turn a guideline into a standard by repeating it. Cite the source and criterion for standards; label uncertain interpretations.

## Surgical Read

Before editing, record the minimum useful diagnosis:

- Surface and route: identify the screen, component, state, and real user path.
- Main task: state what users must understand or do first.
- Intended hierarchy: identify what the interface appears to prioritize.
- Accidental priority: identify what is visually louder than the task.
- User harm: name blocked action, confusion, error risk, access barrier, latency, or trust loss.
- Source cause: locate the primitive, token, layout shell, state model, component boundary, data contract, or isolated style.
- Cut order: name the smallest set of removals, merges, promotions, or repairs.
- Proof target: select a state, viewport, assertion, artifact, or measured interaction.

Avoid diagnoses such as “needs more polish.” Name the element, source cause, and user consequence.

## Preservation Contract

Preserve these unless the user explicitly includes them:

- information architecture, route slugs, primary navigation labels, and deep-link behavior;
- form names, field order, validation semantics, data shape, and submission behavior;
- analytics event names, tracking hooks, experiments, and consent behavior;
- SEO metadata, structured data, headings that carry document meaning, and legal copy;
- keyboard paths, accessible names, focus behavior, reduced-motion handling, and other accessibility wins;
- framework, package manager, established component library, tokens, icon family, and repository conventions;
- user content, real data, and approved brand assets.

Do not preserve a contract that causes the defect. Change it deliberately, document the consequence, and verify downstream consumers.

## Systemic Repair Order

Repair in this order:

1. Restore task completion, accurate state, semantics, and recoverability.
2. Fix hierarchy and layout structure.
3. Fix repeated causes at the state model, primitive, token, or shell.
4. Harden responsive, content, locale, loading, error, and permission behavior.
5. Remove unnecessary runtime work and motion.
6. Refine typography, color, surfaces, and details.
7. Add distinction only when the surface needs persuasion or identity.

Choose change ambition explicitly:

- `local fix`: one isolated defect with no repeated cause;
- `component primitive`: repeated component behavior or state;
- `token/system`: color, space, type, radius, motion, or semantic-state drift;
- `layout shell`: hierarchy or responsive structure shared by a view;
- `state model`: duplicate, contradictory, missing, or stale state ownership.

Prefer the smallest ambition that removes the cause without widening scope.

## Severity

- `P0`: Prevents a core task, loses data, creates a severe security/safety issue, or traps the user with no recovery.
- `P1`: Breaks a core flow, materially misrepresents state, causes a demonstrated accessibility failure, or creates severe responsive/performance failure.
- `P2`: Degrades comprehension, resilience, consistency, trust, or repeated use without blocking the core task.
- `P3`: Low-impact polish or optional refinement.

Do not make taste P1. Escalate a visual heuristic only when evidence connects it to readability, trust, task priority, or a documented product requirement.

## State And Interaction Contracts

For each region touched, identify applicable contracts:

- default, hover, focus-visible, active/pressed, selected, disabled, pending, and destructive;
- initial loading, refresh, loading more, empty, error, permission denied, stale, and retry;
- short, typical, long, unbroken, translated, CJK, and RTL content when relevant;
- keyboard, fine pointer, coarse pointer, touch, zoom, and reduced motion;
- narrow container, mobile, small laptop, desktop, and high-density data;
- offline, timeout, cancellation, repeated action, and concurrent/stale response.

For destructive actions, offer undo when the action is safely reversible; require confirmation when it is irreversible or costly, and preserve a clear cancel path.

Test only states the product can reach, but do not claim unexecuted states as covered. Add fixtures or state controls when production readiness requires otherwise unreachable states.

## Completion Rules

Complete the pass only when:

- the changed code sits on the real path;
- the visible/systemic cause is removed or measurably reduced;
- the main state and one relevant edge or recovery state pass;
- unresolved P0/P1 findings are fixed, explicitly out of scope, or blocked with a concrete reason;
- repeated in-scope P2 causes are fixed or intentionally deferred with impact;
- evidence supports the exact claim and uninspected dimensions remain `unknown`;
- unrelated user changes remain intact.

Use “implemented, not fully verified” or “reviewed, blocked by …” when proof is incomplete. Do not substitute confidence for evidence.
