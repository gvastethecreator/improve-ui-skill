# Forensic Analysis And Critique Modes

Use this for a design audit, screenshot critique, visual verdict, or explicit roast. Remain read-only unless the user separately authorizes implementation: do not edit product source or persistent project artifacts, and create durable reports only when requested.

## Select Tone

- `analysis` (default): neutral, direct, evidence-first.
- `critique`: decisive professional judgment when the user asks for an opinion or verdict.
- `roast`: sharp humor only when the user explicitly asks to be roasted.

Match the user's language. In every mode, criticize interface decisions and outcomes, never the developer, team, user, or personal ability. Humor never changes severity or evidence requirements.

## Cross-Reference Evidence

Use the available layers:

- rendered evidence: screenshot, viewport/state, URL, recording frame, or browser capture;
- source evidence: route, component, markup, styles, tokens, state/data ownership, and library primitives;
- runtime evidence: interaction, focus, console/network, responsive behavior, and measured performance.

When visual and source evidence exist, connect the visible problem to its likely source cause. When one layer is missing, state the limitation. Do not invent code causes from a screenshot or visual quality from source alone.

## Analyze

1. Identify the product intent, audience, and main task.
2. State the intended visual hierarchy.
3. State what the rendered interface accidentally prioritizes.
4. Inspect task clarity, layout, grouping, density, action priority, state, copy, accessibility, responsive behavior, consistency, motion, and trust as relevant.
5. Trace major symptoms to component, token, layout, state, or data causes where source exists.
6. Separate standards, practices, heuristics, and preferences.
7. Preserve strengths that support the product.
8. Order findings by user impact and severity.

Avoid vague findings. Replace “reduce clutter” with the exact elements to remove, merge, collapse, relocate, or demote.

## Output

Use this compact shape unless the user requests another artifact:

1. **Verdict**: one paragraph describing the central conflict between task and interface.
2. **Findings**: P0/P1 first, then systemic P2; each includes evidence, impact, source cause or limitation, and exact fix.
3. **Cross-reference**: use a table only when it clarifies several visual-to-source mappings.
4. **First cuts**: three to five ordered removals, merges, promotions, or structural repairs.
5. **Preserve**: name what already works and should survive.
6. **Target experience**: describe how the corrected surface should read and behave.
7. **Evidence limits**: name uninspected paths, states, or browsers.

For a single bug or component, shorten the shape instead of manufacturing a broad audit.

## Roast Mode

Enable only after an explicit request containing intent such as “roast,” “sin anestesia,” or “destroza la UI.” Keep the same finding structure and add concise metaphor or wit after the evidence—not instead of it.

Allowed:

- sharp description of hierarchy, clutter, or contradictory decisions;
- memorable metaphors tied to a demonstrated problem;
- direct verbs such as kill, merge, collapse, demote, or promote.

Disallowed:

- personal attacks, mockery of ability, harassment, or assumptions about the team;
- making the user feel attacked;
- humor in accessibility, safety, legal, or user-harm findings where it trivializes impact;
- canned jokes repeated regardless of evidence;
- inflated severity to make the roast entertaining.

If the user did not opt in, do not use roast framing even if the interface is weak.

## Quality Gate

The review fails when it:

- is generic or praise-led;
- makes a visual claim without rendered evidence or a limitation;
- reports detector heuristics as fact;
- ignores source when source is available;
- provides no concrete repair;
- edits code during an audit-only request;
- computes a confident score across uninspected dimensions;
- lets tone overpower accuracy.

Use [references/evidence-and-scoring.md](references/evidence-and-scoring.md) for severity, coverage, and optional scoring.
