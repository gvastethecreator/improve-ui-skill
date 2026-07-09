# Interface Surgery

Use this when the target UI already exists as code, screenshot, route, prototype, component, or running app.

The job is not to invent a new product identity. The job is to find what the current interface is trying to do, identify what is sabotaging it, cut the highest-impact weakness, and prove the user-facing path got better.

## Surgical Read

Before changing anything, name:

- Existing surface: screen, route, component, modal, dashboard, landing section, flow, or visual bug.
- Main user task: what the user must do or understand first.
- Current hierarchy: what the UI intends to prioritize.
- Accidental hierarchy: what the UI actually makes loud.
- Source cause: component boundary, state model, token drift, layout shell, hardcoded value, copy duplication, inaccessible markup, or missing edge state.
- Proof target: screenshot, URL, component state, detector run, browser state, test, or blocker.

Done when the visible problem and likely source cause are both named.

## Cut Order

1. Fix P1 issues before taste.
2. Fix repeated/systemic P2 patterns at the primitive, token, layout, or state-model level when safer than instance edits.
3. Preserve working IA, route slugs, primary nav labels, form order, SEO/legal copy, analytics hooks, and accessibility wins unless explicitly in scope.
4. Prefer one root fix over a dozen cosmetic patches.
5. Keep the diff small enough that the improvement can be reviewed.

## What To Cut

Cut or collapse:

- duplicate status blocks
- repeated warnings competing for attention
- nested cards and ornamental wrappers
- fake metadata and decorative badges
- inactive controls that look primary
- motion that hides content or distracts from frequent actions
- label/copy noise that repeats the same state
- one-viewport layout assumptions

Promote:

- the main task
- the current state
- the next action
- recovery path
- source of truth for status or progress
- real product/media/data evidence

## Proof

For nontrivial changes, prove at least:

- main viewport/state after the patch
- one relevant edge or recovery state
- detector/static output when local frontend files exist
- visual proof or explicit blocker when a runnable UI exists

Do not call the work done if proof still shows the same P1 or repeated/systemic P2 pattern.

## Done

- The patch touches the real user path.
- The systemic cause is removed or downgraded.
- The final claim is backed by source, screenshot/browser evidence, detector output, or a named blocker.
- Remaining risks are named without turning them into a pass.
