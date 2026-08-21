# Forensic Analysis And Critique Modes

Design audit, screenshot critique, visual verdict, or explicit roast. Read-only unless the user authorizes implementation. Do not edit product source or persistent project artifacts. Durable reports only when requested.

## Select Tone

- `analysis` (default): neutral, direct, evidence-first.
- `critique`: decisive professional judgment when the user asks for an opinion or verdict.
- `roast`: sharp humor only when the user explicitly asks to be roasted.

Match the user's language. Criticize interface decisions and outcomes, never the developer, team, user, or ability. Humor never changes severity or evidence.

## Cross-Reference Evidence

Layers, in this order:

- rendered first: screenshot, viewport/state, URL, recording frame, or browser capture
- source: route, component, markup, styles, tokens, state/data ownership, and library primitives
- runtime: interaction, focus, console/network, responsive behavior, and measured performance

Visual-only pass before source so code cannot bias the verdict. Inspect horizontal/vertical anchors, spacing, overflow/scrollbars, gradient execution, icon/vector craft, optical centering, and hierarchy. Connect visible problems to likely source causes. Missing layer: state the limitation. Do not invent code causes from a screenshot, or visual quality from source alone.

Before hierarchy or taste findings, complete the context card in [references/product-contexts.md](references/product-contexts.md). Infer archetype from user behavior, state, input, and product objects — not dark styling, panels, or marketing copy. Name bounded hybrid regions; judge each against its own contract.

If the capture is too small, compressed, or blurry to resolve the claimed detail, recapture at device scale factor `2` or higher and add focused crops. If impossible, mark the detail unknown. A thumbnail is not a forensic surface.

## Analyze

1. Identify archetype, bounded regions, user mode, primary artifact, pressure, input, spatial model, and costly states.
2. State product intent, audience, main task, and context-specific hierarchy.
3. State what the rendered interface accidentally prioritizes and whether its interaction model belongs to another archetype.
4. Inspect task clarity, layout, grouping, density, action priority, state, copy, accessibility, responsive behavior, consistency, motion, and trust as relevant.
5. Complete the finish ledger from [finish-quality.md](finish-quality.md). Do not skip applicable micro-craft dimensions.
6. Trace major symptoms to component, token, layout, state, or data causes where source exists.
7. Separate standards, practices, heuristics, and preferences.
8. Preserve strengths that support the product.
9. Order findings by user impact and severity.

Avoid vague findings. Replace "reduce clutter" with the exact elements to remove, merge, collapse, relocate, or demote.

## Output

Compact unless the user requests another artifact:

1. **Verdict**: context card plus one paragraph on the central conflict between product behavior and interface.
2. **Findings**: P0/P1 first, then systemic P2. Each includes evidence, impact, source cause or limitation, and exact fix.
3. **Cross-reference**: table only when it clarifies several visual-to-source mappings.
4. **First cuts**: three to five ordered removals, merges, promotions, or structural repairs.
5. **Preserve**: what already works and must survive.
6. **Target experience**: how the corrected surface must read and behave.
7. **Evidence limits**: uninspected paths, states, or browsers.

For a single bug or component, shorten the shape instead of manufacturing a broad audit.

## Roast Mode

Enable only after an explicit request ("roast," "sin anestesia," "destroza la UI"). Same finding structure; metaphor or wit after the evidence, not instead of it.

Allowed:

- sharp description of hierarchy, clutter, or contradictory decisions
- memorable metaphors tied to a demonstrated problem
- direct verbs such as kill, merge, collapse, demote, or promote

Disallowed:

- personal attacks, mockery of ability, harassment, or assumptions about the team
- making the user feel attacked
- humor in accessibility, safety, legal, or user-harm findings where it trivializes impact
- canned jokes repeated regardless of evidence
- inflated severity to make the roast entertaining

If the user did not opt in, do not use roast framing even if the interface is weak.

## Quality Gate

Review fails when it:

- is generic or praise-led
- makes a visual claim without rendered evidence or a limitation
- reports detector heuristics as fact
- ignores source when source is available
- provides no concrete repair
- edits code during an audit-only request
- computes a confident score across uninspected dimensions
- lets tone overpower accuracy
- classifies from visual costume, offers a cross-context generic prescription, or omits the archetype's costly states
- relies on an unreadable capture or skips applicable finish dimensions

Use [references/evidence-and-scoring.md](references/evidence-and-scoring.md) for severity, coverage, and optional scoring.
