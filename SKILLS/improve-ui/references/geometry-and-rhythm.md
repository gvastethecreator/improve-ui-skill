# Geometry, rhythm, and density

Repair dense tools, command centers, HUDs, repeated rows, split panes, inspectors, or data fields when alignment and spacing determine comprehension, or on the finish pass when “something feels off” but the cause is geometric.

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

## Start with relationships

Do not start by picking a spacing scale. Name the relationships the space must explain:

- **within**: icon to label, label to value, title to helper, field to error
- **between**: sibling controls, repeated rows, related cards, evidence and action
- **section**: one task group to another
- **edge**: content to shell, viewport, safe area, crop, or scroll boundary
- **interruption**: a deliberate break for a new phase, warning, decision, or narrative beat

Tokens can supply values; the relationship owns the value. One gap repeated everywhere removes hierarchy.

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

If several builders, surfaces, or proof states are involved, persist as `geometry-ledger.json` plus the same-facts [geometry ledger](../templates/geometry-ledger.md).

## Build an alignment map

Lines the eye must trust: shell edges and main content frame; first text baselines; row starts and ends; numeric or temporal columns; control centers; canvas, evidence, or selected-object edge; alert, status, and action lanes; HUD safe-area and reticle or world-space anchors.

Align what participates in the same scan. Break alignment only to signal a real semantic change. Do not use a random offset as dynamism.

For parallel rows or columns, inspect matching starts, ends, centers, baselines; equal control and row heights where contracts are equal; icon crop and text optical center; reserved space for optional badges, errors, counts, avatars, actions; equal content clearance at the container edge; stable geometry across loading, selection, error, and long content.

If a border changes box size, do not add it on hover or validation. Reserve the geometry or use outline, inset shadow, or an existing border slot.

## Make rhythm legible

Small family of related distances, then tune optically. Exact ratio is contextual; ordering is not:

~~~text
within < between < section
~~~

Edge clearance: tighter in a cockpit, larger on a rare decision screen. Dense ≠ cramped. Spacious ≠ objects floating without a relationship.

Repeated siblings need parity unless a subgroup intentionally changes cadence. For a visible series: (1) capture bounding boxes (2) list adjacent gaps (3) explain every material delta (4) trace unexplained drift to margin collapse, line height, variable content, absolute positioning, grid tracks, or nested padding (5) repair the shared primitive, not each symptom.

Runtime harness flags list-gap spread above three rendered pixels as a review lead, not a universal design law. Check whether grouping, wrapping, or optical correction earned the difference.

Do not stack sibling margins from multiple owners. Uniform relationship: one layout owner with gap. Changing relationship: explicit section margins. Record named exceptions. Do not add magic numbers until the screenshot stops complaining.

## Clear the cut

No accidental slice, strand, or edge-glue. Inspect: clipped text, focus rings, shadows, badges, tooltips, selected outlines; media focal points and masks; sticky headers meeting scrolling content; bottom rows behind toolbars, browser chrome, or safe areas; full-bleed surfaces meeting the viewport; hard seams between adjacent colors, gradients, images, canvas, native controls; horizontal overflow and nested scroll traps; the final visible item in every scroll region.

A deliberate crop has an authored focal point and enough context to read as intentional. An accidental crop looks like missing padding.

If scrollbar appearance shifts aligned content, use scrollbar-gutter. If the platform allows it, style scrollbars minimally. Preserve wheel, keyboard, touch, zoom, forced-color, and discoverability. Hiding the scrollbar does not solve scroll ownership.

## Density by product job

Density is how much decision-relevant information a user can scan without losing structure. Card count is not density.

### Command centers

Separate urgent decisions, active ownership, freshness, evidence, ambient telemetry. Keep the incident or operational spine stable while live values update. Saturation, motion, large type: scarce alarm resources. Reserve variable-width timestamps, service names, counts so updates do not shove actions sideways. Wallboard: distance and shared awareness. Operator: selection, detail, keyboard traversal, recovery. Do not average them.

### Editors and studios

Artifact or canvas owns the frame. Align inspectors to the object or region they change. Toolbars stable across selection changes; reserve optional tool groups. Irreversible or global actions sit outside the high-frequency local-control rhythm. Zoom, pan, timeline, property density support direct manipulation — not dashboard chrome around it.

### HUDs and playable interfaces

Start from the play field, not a web-page shell. Define safe areas, world-space vs screen-space anchors, occlusion budgets, input modality, glance distance. Tether health, ammo, cooldown, target, objective, or threat signals to the decision they influence. Preserve the center and predicted travel/aim regions unless the mechanic requires occupation. Test motion, contrast, scale against the busiest game state, not a clean menu background. Recompose for aspect ratio and touch. Do not stack desktop widgets into the play field.

### Data and decision surfaces

Align values by meaning: decimal, time, status, owner, or comparison baseline. Headers and row actions stay stable with long content. Whitespace and rules expose groups — not a card around every metric. Connect selected evidence to the action it enables.

## Optical correction

Mathematical alignment is the baseline, not the verdict. Inspect at rendered size: circles and curved glyphs may need overshoot; play arrows and asymmetrical icons need visual centering; mixed-case labels have different apparent centers than all-caps; one-pixel hairlines change weight against dark and light fields; icons with loose viewBoxes drift despite equal CSS boxes; media subjects need focal alignment, not box centering.

Apply optical corrections at the icon, type, or primitive layer and document why. Do not use one-off transforms to hide a broken source asset across dozens of controls.

## Responsive recomposition

At every target width, decide which region stays dominant; what collapses, becomes a drawer, changes order, summarizes, or disappears; who owns vertical and horizontal scroll; whether dense tables become comparison, list, or detail flows; how fixed/sticky regions avoid covering the last item; how safe areas and touch targets change; which alignment anchors survive.

Never prove responsiveness with an empty state alone. Long labels, dense data, error text, selected actions, and open overlays expose the real geometry.

## Geometry proof

Two passes:

### Structure pass

- main artifact dominance
- frame and anchor map
- region proportions
- scan order
- density gradient
- scroll ownership
- responsive recomposition

### Finish pass

- sibling gaps and section cadence
- parallel baselines and control centers
- internal padding
- clipped edges and final scroll item
- icon/text optical fit
- variable-content stability
- scrollbar, seam, and safe-area treatment

Full-frame evidence for structure; DPR 2 or focused crops for finish. Record measured deltas when the issue repeats. Pass only when every material exception is intentional or explicitly blocked.

## Failure patterns

- One spacing token used at every level.
- Repeated gaps that drift without grouping.
- Parallel columns with different starting lines.
- Equal card surfaces masking unequal priority.
- Nav or sidebar sized as a grid percentage instead of a content-fixed width, with the main area flexing.
- Optional metadata that changes action alignment.
- Nested scroll regions with no clear owner.
- A sticky control covering the final row.
- “Centered” icons that look visibly drunk.
- Large empty areas from a missing content/state contract.
- Crops and seams defended as “editorial” after they fail at another viewport.

Do not end with “improve spacing.” Name the relationship, current measured behavior, shared cause, replacement rule, and proof state.
