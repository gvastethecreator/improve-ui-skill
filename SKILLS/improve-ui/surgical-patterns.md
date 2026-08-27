# Surgical Patterns

Repair the shared cause when a UI symptom repeats across components, routes, states, or breakpoints.

## Repair Loop

1. Name the repeated visible symptom and user consequence.
2. Find the shared primitive, token, layout shell, state/data contract, copy rule, media treatment, or motion primitive.
3. Choose the smallest systemic change that fixes future instances.
4. Patch one real path and one edge/recovery path.
5. Compare the same viewport/state and run focused regression checks.

## Pattern Map

| Pattern | Source clues | Repair | Proof |
|---|---|---|---|
| Hierarchy inversion | Metadata, badges, diagnostics, or secondary controls dominate; type-size jumps doing all the work | Soften competing neighbors first; promote task/object/action with weight and color before size | First readable object matches main task; type sizes stay in the existing scale; focus order logical |
| Status duplication | Pills, banners, counters, icons, color repeat or contradict state | One state source and severity hierarchy | One canonical meaning per state across loading/error/permission/empty |
| Nested surface debt | Cards inside cards, competing shadows/edges, wrapper proliferation | Flatten; cards only for real repeated/framed objects | Layout reads as one structure; state changes don't shift parent surfaces |
| CTA democracy | Every action looks primary; destructive and routine match | One primary per decision region; destructive primary only on confirm | Next action obvious; pending/disabled/destructive/focus states work |
| Density confusion | Marketing spacing in operational UI or evidence hidden behind panels | summary → evidence → detail-on-demand | Scan/compare without opening every item; long/empty data aligns |
| Missing state model | Default polished; loading/error/permission/stale conflict | Model async states; keep failures local | Each state run, asserted, recoverable, visually consistent |
| Motion theater | Every mount/hover travels; keyframes fight interruption | Remove purposeless/high-frequency motion; reuse a bounded primitive | Rapid/reversed trigger and reduced motion remain clear |
| Media edge failure | Screenshots/images disappear, stretch, crop badly, or shift layout | Reserve size; define fit/crop/fallback | Slow/fail/portrait/landscape and theme states remain stable |
| Responsive squeeze | Desktop columns only shrink; overflow hidden | Change structure at meaningful boundaries; fix overflowing child | Core task works at boundary widths, zoom/reflow, long content |
| Alignment drift | Repeated controls, rows, icons, or columns miss shared anchors | Repair shared grid/control primitive; correct optical offsets at source | Browser geometry and readable crops show stable H/V anchors |
| Spacing drift | Repeated relationships use arbitrary margins or local nudges | Move padding/gap roles into owning primitive or semantic token | Sibling, group, section gaps repeat intentionally |
| Native scrollbar leak | Scroll ownership exists but browser-default chrome breaks the surface | Style the actual shared scroll region; don't hide it or nest traps | Thumb/track, hover/active, themes, keyboard, wheel, touch, forced colors |
| Vector icon drift | Hand-drawn paths vary in grid, weight, cap, silhouette, or centering | Product icon system or rebuild a justified custom family | Real-size and enlarged crops pass across controls and themes |
| Token drift | Literal colors/spacing/radii/motion repeat inconsistently | Map roles to existing semantic tokens; add only missing shared roles | Representative components and states converge without regressions |
| Copy scaffolding | Repeated labels, fake metadata, jargon, or generic prose | Remove duplication; drop labels the format already implies; name real object/action/consequence | Important state shorter and clearer without losing required meaning |
| Focus/overlay breakage | Dialogs, drawers, sticky UI obscure or lose focus | Repair shared overlay/focus primitive | Open, tab, escape, close, return focus work across consumers |

## Scope Guard

- Fix the shared layer only when repeated evidence justifies its blast radius.
- Add or update regression tests for existing consumers before widening a primitive change.
- Preserve legitimate variants. Do not force unrelated surfaces into one visual treatment.
- Keep taste heuristics advisory unless the product system explicitly bans the pattern.
- If the shared fix is riskier than two isolated defects, keep the repair local and record the debt.

## Done

- Shared cause, affected consumers, and migration surface named.
- Main and edge paths pass.
- Existing consumers verified in proportion to blast radius.
- Same symptom no longer recurs in touched scope.
- Remaining variants or deferred consumers explicit.
