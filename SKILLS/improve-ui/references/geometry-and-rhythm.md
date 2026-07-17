# Geometry, Rhythm, And Density

Use this route when repairing dense tools, command centers, HUDs, repeated rows, split panes, inspectors, data fields, or any surface where alignment and spacing determine comprehension. Use it during the finish pass when the complaint is “something feels off” but the cause is geometric.

## Contents

- [Start with relationships](#start-with-relationships)
- [Build an alignment map](#build-an-alignment-map)
- [Make rhythm legible](#make-rhythm-legible)
- [Clear the cut](#clear-the-cut)
- [Density by product job](#density-by-product-job)
- [Optical correction](#optical-correction)
- [Responsive recomposition](#responsive-recomposition)
- [Geometry proof](#geometry-proof)
- [Failure patterns](#failure-patterns)

## Start With Relationships

Do not begin by picking a spacing scale. Name the relationships the space must explain:

- **within**: icon to label, label to value, title to helper, field to error;
- **between**: sibling controls, repeated rows, related cards, evidence and action;
- **section**: one task group to another;
- **edge**: content to shell, viewport, safe area, crop, or scroll boundary;
- **interruption**: a deliberate break for a new phase, warning, decision, or narrative beat.

The values may come from existing tokens, but the relationship owns the value. One gap repeated everywhere is not consistency. It is hierarchy removal.

For broad work, record a geometry ledger before styling:

~~~text
frame and safe area:
primary alignment anchors:
secondary anchors:
within / between / section / edge rhythm:
repeated series:
parallel regions:
scroll owners:
variable-content reservations:
intentional breaks:
proof route + viewport + state:
~~~

Persist it as `geometry-ledger.json` plus the same-facts [geometry ledger](../templates/geometry-ledger.md) when several builders, surfaces, or proof states are involved.

## Build An Alignment Map

Name the lines the eye is supposed to trust:

- shell edges and main content frame;
- first text baselines;
- row starts and ends;
- numeric or temporal columns;
- control centers;
- canvas, evidence, or selected-object edge;
- alert, status, and action lanes;
- HUD safe-area and reticle or world-space anchors.

Align what participates in the same scan. Break alignment only to signal a real semantic change. A random offset is not dynamism.

For parallel rows or columns, inspect:

- matching starts, ends, centers, and baselines;
- equal control and row heights where the contracts are equal;
- icon crop and text optical center;
- reserved space for optional badges, errors, counts, avatars, and actions;
- equal content clearance at the container edge;
- stable geometry across loading, selection, error, and long content.

Do not add a border on hover or validation if it changes the box size. Reserve the geometry or use outline, inset shadow, or an existing border slot.

## Make Rhythm Legible

Use a small family of related distances, then tune optically. The exact ratio is contextual; the ordering is not:

~~~text
within < between < section
~~~

Edge clearance may be tighter in a cockpit and larger in a rare decision screen. Dense does not mean cramped. Spacious does not mean every object floats without a relationship.

Repeated siblings need parity unless a subgroup intentionally changes cadence. For a visible series:

1. capture the bounding boxes;
2. list adjacent gaps;
3. explain every material delta;
4. trace unexplained drift to margin collapse, line height, variable content, absolute positioning, grid tracks, or nested padding;
5. repair the shared primitive, not each symptom.

The runtime harness reports repeated list-gap spread above three rendered pixels as a review lead. That threshold is not a universal design law. Confirm whether grouping, wrapping, or optical correction earned the difference.

Avoid stacking sibling margins from multiple owners. Prefer one layout owner with gap when the relationship is uniform. Use explicit section margins when the relationship changes. Record named exceptions instead of adding magic numbers until the screenshot stops complaining.

## Clear The Cut

Nothing should look accidentally sliced, stranded, or glued to an edge.

Inspect:

- clipped text, focus rings, shadows, badges, tooltips, and selected outlines;
- media focal points and masks;
- sticky headers meeting scrolling content;
- bottom rows behind toolbars, browser chrome, or safe areas;
- full-bleed surfaces meeting the viewport;
- hard seams between adjacent colors, gradients, images, canvas, and native controls;
- horizontal overflow and nested scroll traps;
- the final visible item in every scroll region.

A deliberate crop has an authored focal point and enough context to read as intentional. An accidental crop looks like missing padding.

Use scrollbar-gutter where scrollbar appearance would shift aligned content. Style scrollbars minimally when the platform allows it, but preserve wheel, keyboard, touch, zoom, forced-color, and discoverability behavior. Hiding the scrollbar does not solve scroll ownership.

## Density By Product Job

Card count is not density. Density is the amount of decision-relevant information a user can scan without losing structure.

### Command centers

- Separate urgent decisions, active ownership, freshness, evidence, and ambient telemetry.
- Keep the incident or operational spine stable while live values update.
- Use saturation, motion, and large type as scarce alarm resources.
- Reserve variable-width timestamps, service names, and counts so updates do not shove actions sideways.
- Wallboard mode optimizes distance and shared awareness; operator mode optimizes selection, detail, keyboard traversal, and recovery. Do not average them.

### Editors and studios

- Let the artifact or canvas own the frame.
- Align inspectors to the object or region they change.
- Keep toolbars stable across selection changes; reserve optional tool groups.
- Put irreversible or global actions outside the high-frequency local-control rhythm.
- Make zoom, pan, timeline, and property density support direct manipulation rather than surround it with dashboard chrome.

### HUDs and playable interfaces

- Start from the play field, not a web-page shell.
- Define safe areas, world-space versus screen-space anchors, occlusion budgets, input modality, and glance distance.
- Tether health, ammo, cooldown, target, objective, or threat signals to the decision they influence.
- Preserve the center and predicted travel/aim regions unless the mechanic requires occupation.
- Test motion, contrast, and scale against the busiest game state, not a clean menu background.
- Recompose for aspect ratio and touch; do not stack desktop widgets into the play field.

### Data and decision surfaces

- Align values by meaning: decimal, time, status, owner, or comparison baseline.
- Keep headers and row actions stable with long content.
- Use whitespace and rules to expose groups, not a card around every metric.
- Connect selected evidence to the action it enables.

## Optical Correction

Mathematical alignment is the baseline, not the verdict. Inspect at rendered size:

- circles and curved glyphs may need overshoot;
- play arrows and asymmetrical icons need visual centering;
- mixed-case labels have different apparent centers than all-caps labels;
- one-pixel hairlines change weight against dark and light fields;
- icons with loose viewBoxes drift despite equal CSS boxes;
- media subjects need focal alignment rather than box centering.

Apply optical corrections at the icon, type, or primitive layer and document why. Do not use one-off transforms to hide a broken source asset across dozens of controls.

## Responsive Recomposition

At every target width, decide:

- which region remains dominant;
- what collapses, becomes a drawer, changes order, summarizes, or disappears;
- who owns vertical and horizontal scroll;
- whether dense tables transform into comparison, list, or detail flows;
- how fixed/sticky regions avoid covering the last item;
- how safe areas and touch targets change;
- which alignment anchors survive.

Never prove responsiveness with an empty state alone. Long labels, dense data, error text, selected actions, and open overlays expose the real geometry.

## Geometry Proof

Run two passes:

### Structure pass

- main artifact dominance;
- frame and anchor map;
- region proportions;
- scan order;
- density gradient;
- scroll ownership;
- responsive recomposition.

### Finish pass

- sibling gaps and section cadence;
- parallel baselines and control centers;
- internal padding;
- clipped edges and final scroll item;
- icon/text optical fit;
- variable-content stability;
- scrollbar, seam, and safe-area treatment.

Use full-frame evidence for structure and DPR 2 or focused crops for finish. Record measured deltas when the issue repeats. Pass only when every material exception is intentional or explicitly blocked.

## Failure Patterns

- One spacing token used at every level.
- Repeated gaps that drift without grouping.
- Parallel columns with different starting lines.
- Equal card surfaces masking unequal priority.
- Optional metadata that changes action alignment.
- Nested scroll regions with no clear owner.
- A sticky control covering the final row.
- “Centered” icons that look visibly drunk.
- Large empty areas created by a missing content/state contract.
- Crops and seams defended as “editorial” after they fail at another viewport.

Do not end with “improve spacing.” Name the relationship, current measured behavior, shared cause, replacement rule, and proof state.
