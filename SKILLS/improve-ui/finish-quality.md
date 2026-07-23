# Finish Quality Gate

Use this for every rendered polish, visual repair, redesign, screenshot review, or final quality claim. These checks are acceptance criteria, not decorative extras.

## Separate Structure From Finish

1. Run a `structure` pass for task hierarchy, composition, content, state, responsive fit, and interaction.
2. Run a `finish` pass for alignment, spacing rhythm, overflow/scrollbars, gradients, icons/vector craft, copy/prose, and capture legibility.

Do not pass finish from source, tokens, a detector, or a full-page thumbnail. Compare the same route, viewport, state, theme, content, and auth context after each correction.

## Alignment And Spacing

- Establish the visible anchors for shell edges, headings, controls, repeated rows, columns, media, and actions. Inspect left/right edges, baselines, centers, and optical centering.
- Check icon/text/control centering, mixed control heights, repeated row starts, accidental one-pixel drift, and components that align internally but miss the surrounding grid.
- Distinguish internal padding, sibling gap, group gap, and section gap. Repeated relationships must repeat; intentional hierarchy exceptions must be named.
- Measure suspicious boxes with browser geometry, rulers, or overlays and inspect focused crops. A tidy token value does not overrule a visibly crooked result.

## Overflow And Scrollbars

- Inventory page, panel, menu, table, code, drawer, modal, and nested scroll ownership. Remove accidental overflow and nested scroll traps first.
- Style every remaining scrollbar minimally to fit the interface. Define thumb, track, width, radius, hover/active state, contrast, and supported-theme behavior with `scrollbar-width`/`scrollbar-color` and `::-webkit-scrollbar*` where relevant.
- Do not hide the affordance. Preserve keyboard, wheel, track, thumb, touch, zoom, and forced-colors behavior. Use `scrollbar-gutter: stable` when appearance would shift aligned content.
- Exercise the scroll region. A static screenshot cannot prove scroll ownership, sticky interaction, or nested-wheel behavior.

## Gradients

Gradients are valid design material. Judge their execution, not their existence.

- Give the gradient a concrete role: light, depth, focus, material, state, atmosphere, or brand.
- Inspect stop placement, angle/origin, interpolation, muddy midpoints, banding, clipping, repetition, contrast across the field, theme behavior, and performance.
- Keep a readable solid fallback where text, controls, or semantic state depend on the gradient. Do not fail a hue pair merely because it is common.

## Icons And Vector Craft

- Prefer the project's icon system, a coherent library, or a verified brand asset. Do not improvise one-off SVG paths to fill space.
- Create a custom vector only when it is product-specific and the current system cannot express it. Define grid, `viewBox`, stroke/fill, cap/join, corner language, negative space, optical center, and target sizes before drawing.
- Inspect every real rendered size and an enlarged crop, commonly `16`, `20`, and `24` CSS px plus a `4x` detail view. Verify supported themes, button alignment, silhouette, stroke weight, and family consistency.
- Replace weak geometry instead of repeatedly nudging a shapeless path.

## Copy And Prose

- Open [copy and writing quality](references/copy-and-writing.md) when the task changes user-facing text or creates a material review, proposal, or report.
- Inspect copy in its rendered state. Check the user task, voice, facts, action, consequence, recovery, accessible name, and translation tokens.
- Treat named writing patterns as `practice` or `heuristic` unless project policy promotes them. A word list does not override product meaning, legal text, or an approved brand voice.
- Verify changed text at narrow and wide widths, zoom, long content, and relevant locales. Exercise each changed loading, empty, permission, error, success, and recovery state.

## Readable Visual Evidence

- Use viewport captures for hierarchy, full-page captures for rhythm, and focused crops for dense rows, controls, scrollbars, gradients, and icons.
- Use `--detail-capture` in the bundled harness for device scale factor `2` evidence. If a supplied screenshot is compressed, tiny, or blurry, recapture it when possible; otherwise enlarge it and narrow the claim.
- For reviews, inspect the image before opening source. Then trace visible failures to code. Code can explain a defect; it cannot make an ugly rendered decision disappear.

## Finish Ledger

Record this before closeout:

```text
alignment: passed | failed | n/a | blocked — evidence
spacing rhythm: passed | failed | n/a | blocked — evidence
overflow and scrollbars: passed | failed | n/a | blocked — evidence
gradients: passed | failed | n/a | blocked — evidence
icons and vector craft: passed | failed | n/a | blocked — evidence
copy and prose: passed | failed | n/a | blocked — evidence
capture legibility: passed | failed | blocked — evidence
```

Any applicable `failed` continues the loop. Any `blocked` limits the claim. If a defect survives a correction, repair the shared primitive, token, shell, layout rule, or asset source instead of applying another local nudge.

## Resolution Standard

Do not solve weak craft only by deleting it. Supply the better move: a stronger anchor, a clearer spacing relationship, a fitted scrollbar treatment, a deliberate gradient field, a coherent icon source, or direct product-specific copy. If the first fix is merely competent and generic, generate two materially different bounded alternatives, choose one against the task and product system, and prove it.
