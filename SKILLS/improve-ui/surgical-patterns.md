# Surgical Patterns

Use this when a UI symptom repeats across components, routes, states, or breakpoints. Repair the shared cause instead of polishing one instance.

## Repair Loop

1. Name the repeated visible symptom and user consequence.
2. Find the shared primitive, token, layout shell, state/data contract, copy rule, media treatment, or motion primitive.
3. Choose the smallest systemic change that fixes future instances.
4. Patch one real path and one edge/recovery path.
5. Compare the same viewport/state and run focused regression checks.

## Pattern Map

| Pattern | Source clues | Repair | Proof |
|---|---|---|---|
| Hierarchy inversion | Metadata, badges, diagnostics, or secondary controls dominate | Promote task/object/action; consolidate support info | First readable object matches main task; focus order remains logical |
| Status duplication | Pills, banners, counters, icons, and color repeat or contradict state | Create one state source and severity/display hierarchy | Each state has one canonical meaning across loading/error/permission/empty |
| Nested surface debt | Cards inside cards, competing shadows/edges, wrapper proliferation | Flatten sections; reserve cards for real repeated/framed objects | Layout reads as one structure; state changes do not shift parent surfaces |
| CTA democracy | Every action looks primary; destructive and routine actions match | Define action hierarchy; one primary per decision region | Next action is obvious; pending/disabled/destructive/focus states work |
| Density confusion | Marketing spacing in operational UI or evidence hidden behind panels | Use summary → evidence → detail-on-demand; stabilize comparable values | Users can scan/compare without opening every item; long/empty data aligns |
| Missing state model | Default is polished; loading/error/permission/stale states conflict | Model async states explicitly and keep failures local | Each state is executed, asserted, recoverable, and visually consistent |
| Motion theater | Every mount/hover travels; keyframes fight interruption | Remove purposeless/high-frequency motion; reuse a bounded primitive | Rapid/reversed trigger and reduced motion remain clear |
| Media edge failure | Screenshots/images disappear, stretch, crop badly, or shift layout | Reserve size; define fit/crop/fallback/edge treatment | Slow/fail/portrait/landscape and theme states remain stable |
| Responsive squeeze | Desktop columns only shrink; overflow gets hidden | Change structure at meaningful boundaries; fix the overflowing child | Core task works at boundary widths, zoom/reflow, and long content |
| Alignment drift | Repeated controls, rows, icons, or columns miss shared anchors | Repair the shared grid/control primitive; correct optical offsets at the source | Browser geometry and readable crops show stable horizontal/vertical anchors |
| Spacing drift | Repeated relationships use arbitrary margins or local nudges | Move padding/gap roles into the owning primitive or semantic token | Sibling, group, and section gaps repeat intentionally across real content |
| Native scrollbar leak | Scroll ownership exists but browser-default chrome breaks the surface | Style the actual shared scroll region without hiding it or creating nested traps | Thumb/track, hover/active, themes, keyboard, wheel, touch, and forced colors are exercised |
| Vector icon drift | Hand-drawn paths vary in grid, weight, cap, silhouette, or centering | Use the product icon system or rebuild a justified custom family | Real-size and enlarged crops pass across controls and supported themes |
| Token drift | Literal colors/spacing/radii/motion repeat inconsistently | Map roles to existing semantic tokens; add only missing shared roles | Representative components and states converge without regressions |
| Copy scaffolding | Repeated labels, fake metadata, jargon, or generic prose | Remove duplication; name real object/action/consequence | Important state is shorter and clearer without losing required meaning |
| Focus/overlay breakage | Dialogs, drawers, sticky UI obscure or lose focus | Repair shared overlay/focus primitive | Open, tab, escape, close, and return focus work across consumers |

## Scope Guard

- Fix the shared layer only when the repeated evidence justifies its blast radius.
- Add or update regression tests for existing consumers before widening a primitive change.
- Preserve legitimate variants; do not force unrelated surfaces into one visual treatment.
- Keep taste heuristics advisory unless the product system explicitly bans the pattern.
- If the shared fix is riskier than two isolated defects, keep the repair local and record the debt.

## Done

- The shared cause, affected consumers, and migration surface are named.
- Main and edge paths pass.
- Existing consumers were checked in proportion to blast radius.
- The same symptom no longer recurs in touched scope.
- Remaining variants or deferred consumers are explicit.
