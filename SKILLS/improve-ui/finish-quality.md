# Finish Quality Gate

For every rendered polish, visual repair, redesign, screenshot review, or final quality claim. Acceptance criteria, not optional extras.

## Separate Structure From Finish

1. `structure` pass: task hierarchy, composition, content, state, responsive fit, interaction.
2. `finish` pass: alignment, spacing rhythm, overflow/scrollbars, gradients, icons/vector craft, copy/prose, capture legibility.

Do not pass finish from source, tokens, a detector, or a full-page thumbnail. Compare the same route, viewport, state, theme, content, and auth context after each correction.

## Alignment And Spacing

- Visible anchors: shell edges, headings, controls, repeated rows, columns, media, actions. Inspect left/right edges, baselines, centers, optical centering.
- Check icon/text/control centering, mixed control heights, repeated row starts, accidental one-pixel drift, and components that align internally but miss the surrounding grid.
- Distinguish internal padding, sibling gap, group gap, and section gap. Repeated relationships must repeat. Name intentional hierarchy exceptions.
- Measure suspicious boxes with browser geometry, rulers, or overlays; inspect focused crops. A tidy token value does not overrule a visibly crooked result.

## Overflow And Scrollbars

- Inventory page, panel, menu, table, code, drawer, modal, and nested scroll ownership. Remove accidental overflow and nested scroll traps first.
- Style remaining scrollbars minimally to fit the interface. Define thumb, track, width, radius, hover/active, contrast, and supported-theme behavior with `scrollbar-width`/`scrollbar-color` and `::-webkit-scrollbar*` where relevant.
- Do not hide the affordance. Preserve keyboard, wheel, track, thumb, touch, zoom, and forced-colors. If scrollbar appearance can shift aligned content, use `scrollbar-gutter: stable`.
- Exercise the scroll region. A static screenshot cannot prove scroll ownership, sticky interaction, or nested-wheel behavior.

## Gradients

Gradients are valid design material. Judge execution, not existence.

- Concrete role: light, depth, focus, material, state, atmosphere, or brand.
- Inspect stop placement, angle/origin, interpolation, muddy midpoints, banding, clipping, repetition, contrast across the field, theme behavior, and performance.
- Readable solid fallback where text, controls, or semantic state depend on the gradient. Do not fail a hue pair only because it is common.

## Icons And Vector Craft

- Use the project's icon system, a coherent library, or a verified brand asset. Do not improvise one-off SVG paths to fill space.
- Custom vector only when product-specific and the current system cannot express it. Define grid, `viewBox`, stroke/fill, cap/join, corner language, negative space, optical center, and target sizes before drawing.
- Inspect every real rendered size and an enlarged crop, commonly `16`, `20`, and `24` CSS px plus a `4x` detail view. Check supported themes, button alignment, silhouette, stroke weight, and family consistency.
- Replace weak geometry instead of repeatedly nudging a shapeless path.

## Copy And Prose

- Open [copy and writing quality](references/copy-and-writing.md) when the task changes user-facing text or creates a material review, proposal, or report.
- Inspect copy in its rendered state. Check user task, voice, facts, action, consequence, recovery, accessible name, and translation tokens.
- Treat named writing patterns as `practice` or `heuristic` unless project policy promotes them. A word list does not override product meaning, legal text, or an approved brand voice.
- Check changed text at narrow and wide widths, zoom, long content, and relevant locales. Exercise each changed loading, empty, permission, error, success, and recovery state.

## Readable Visual Evidence

- Viewport captures for hierarchy; full-page for rhythm; focused crops for dense rows, controls, scrollbars, gradients, and icons.
- `--detail-capture` in the bundled harness for device scale factor `2` evidence. If a supplied screenshot is compressed, tiny, or blurry, recapture when possible; otherwise enlarge it and narrow the claim.
- For reviews, inspect the image before opening source. Then trace visible failures to code. Code can explain a defect; it cannot make an ugly rendered decision disappear.

## Finish Ledger

Record before closeout:

```text
alignment: passed | failed | n/a | blocked — evidence
spacing rhythm: passed | failed | n/a | blocked — evidence
overflow and scrollbars: passed | failed | n/a | blocked — evidence
gradients: passed | failed | n/a | blocked — evidence
icons and vector craft: passed | failed | n/a | blocked — evidence
copy and prose: passed | failed | n/a | blocked — evidence
capture legibility: passed | failed | blocked — evidence
```

Any applicable `failed` continues the loop. Any `blocked` limits the claim. If a defect survives a correction, repair the shared primitive, token, shell, layout rule, or asset source instead of another local nudge.

## Resolution Standard

Do not solve weak craft only by deleting it. Supply the better move: stronger anchor, clearer spacing, fitted scrollbar, deliberate gradient, coherent icon source, or product-specific copy. If the first fix is only competent and generic, generate two materially different bounded alternatives, choose one against the task and product system, and prove it.
