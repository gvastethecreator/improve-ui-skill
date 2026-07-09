# Surgical Patterns

Use this when a visible UI problem repeats across components, routes, states, or breakpoints. The goal is to fix the underlying interface pattern instead of painting over one instance.

## When To Use

- The same hierarchy problem appears in several cards, panels, rows, or sections.
- Status, CTA, navigation, or data display rules are inconsistent across the view.
- The issue survives after a local polish pass because the primitive, token, layout shell, or state model is wrong.
- A screenshot looks better after one patch but the next state or breakpoint collapses.

## Repair Order

1. Name the repeated visible symptom.
2. Find the shared source: primitive, token, layout container, state model, data contract, copy pattern, media treatment, or motion primitive.
3. Choose the smallest systemic fix that changes future instances.
4. Patch one real user path plus one edge/recovery path.
5. Capture proof at the same viewport/state before claiming the pattern is resolved.

## Patterns

### Hierarchy Inversion

Symptom: diagnostics, badges, metadata, decorative labels, or secondary controls visually beat the main task.

Fix:
- Promote the primary object or action with size, placement, contrast, or density.
- Demote secondary metadata into a predictable support zone.
- Remove decorative labels that compete with actual affordances.

Proof:
- The first readable object in screenshot matches the user's main task.
- Keyboard/focus order still follows the task flow.

### Status Duplication

Symptom: pills, banners, counters, icons, and row colors all communicate overlapping states.

Fix:
- Create one status source and one display hierarchy.
- Reserve banners for blocking or global state.
- Keep row/card markers compact and consistent.

Proof:
- Each state has one canonical label and one severity mapping.
- Loading, error, permission, and empty states do not contradict each other.

### Nested Surface Debt

Symptom: cards inside cards, boxed sections inside boxed shells, shadows used as borders, or panels fighting for depth.

Fix:
- Flatten page sections into unframed layout bands.
- Keep cards for repeated items, modals, or truly framed tools.
- Replace stacked shadows with spacing, separators, or a single surface layer.

Proof:
- The page reads as one layout, not a pile of containers.
- Hover/focus states do not resize or shift parent surfaces.

### CTA Democracy

Symptom: every button has the same weight, destructive actions look normal, or primary actions are buried.

Fix:
- Define primary, secondary, tertiary, and destructive treatments.
- Limit each region to one primary action.
- Use icon-only controls when the command is familiar and space is tight.

Proof:
- A screenshot makes the next best action obvious in under three seconds.
- Disabled, loading, destructive, and focus states are covered.

### Density Confusion

Symptom: dashboards, tables, or operational screens use roomy marketing spacing, or detail pages hide the evidence users need.

Fix:
- Use a density gradient: summary first, dense evidence second, details on demand.
- Put measures, timestamps, ownership, and status near the object they describe.
- Use tabular numbers and stable columns for comparable values.

Proof:
- A user can compare the key rows/cards without opening every item.
- Long content and empty data preserve alignment.

### Missing State Model

Symptom: default state is polished but loading, error, permission, long text, slow network, or rapid clicks break the layout.

Fix:
- Add explicit state slots at the async region, not a global afterthought.
- Keep skeletons, empty copy, retries, and permission text aligned to the same layout.
- Disable or queue repeated actions where double-submit is possible.

Proof:
- Empty, loading, error, permission, long-content, slow-network, and rapid-click states are listed or scoped.

### Motion Theater

Symptom: broad transitions, long durations, ease-in entry, bouncing UI, layout animation, or decorative movement distracts from frequent work.

Fix:
- Delete broad transitions first.
- Use transform/opacity only when motion helps orientation or feedback.
- Gate hover motion and respect reduced motion.

Proof:
- Trigger, repeat trigger, interrupt, reduced motion, and frame budget are checked or scoped.

### Media Edge Failure

Symptom: real product images, avatars, charts, maps, or previews look cropped, blurry, broken, fake, or unanchored.

Fix:
- Use real media when proof matters.
- Reserve dimensions, add meaningful alt, and crop from the focal point.
- Add a subtle outline or background only when the media edge needs separation.

Proof:
- Images load with natural size, dimensions, alt, and useful crop on desktop and mobile.

### Responsive Squeeze

Symptom: desktop layout is squeezed into mobile, controls wrap unpredictably, or fixed widths cause horizontal overflow.

Fix:
- Add a structural breakpoint or container query.
- Reorder by task priority, not source order reflex.
- Replace card soup with a single-column task flow when space is limited.

Proof:
- Narrow viewport has no horizontal overflow, clipped text, or hidden primary action.

### Token Drift

Symptom: literal colors, one-off shadows, custom radii, and local spacing values diverge from the design system.

Fix:
- Patch the nearest token or primitive when repeated.
- Keep one-off overrides only when there is a named product reason.
- Delete unused decorative variants.

Proof:
- Repeated instances inherit the repaired primitive without manual matching.

## Done

- The repeated cause is named.
- The patch happens at the shared source when that is safer than instance edits.
- One main path and one relevant edge/recovery path are inspected.
- Remaining pattern risk is explicit instead of hidden behind a polished screenshot.
