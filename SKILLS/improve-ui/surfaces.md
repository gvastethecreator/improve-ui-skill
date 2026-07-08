# Surfaces

Surfaces carry hierarchy, touch targets, media edges, and state. Keep fixes tied to the surface job.

## Context

- Dense apps: clarity and scan speed. Borders are fine for grids, inputs, dividers, and focus states.
- Cards/media: depth and edge quality. Shadows-as-borders and image outlines usually help.
- Marketing/editorial: larger rhythm and hierarchy. Radii, shadows, and optical alignment can be more expressive.
- Design systems: prefer token fixes over one-off component overrides.
- Anti-slop: avoid nested cards, one-sided accent stripes, huge card radii, glass-by-default, and hairline border plus wide soft shadow unless the design system explicitly owns them.

## Concentric Border Radius

For tight nested rounded elements:

```text
outer radius = inner radius + padding
```

```css
/* Good: 12 + 8 */
.card {
  padding: 8px;
  border-radius: 20px;
}

.card-inner {
  border-radius: 12px;
}
```

```tsx
// Tailwind: 16px outer, 8px padding, 8px inner
<div className="rounded-2xl p-2">
  <div className="rounded-lg">...</div>
</div>
```

Skip strict math when:

- Padding/gap is large enough that the layers read as separate surfaces.
- The project uses intentional asymmetry.
- The inner item is not visually nested, such as a floating badge.

## Optical Alignment

Geometric centering is the starting point. Adjust optically when the shape looks off.

Buttons with text and icon:

```css
.button-with-icon {
  padding-left: 16px;
  padding-right: 14px;
}
```

Play triangles:

```css
.play-button svg {
  margin-left: 2px;
}
```

Asymmetric icons:

- Best: fix the SVG viewBox/path so every use benefits.
- Fallback: add a tiny margin/padding at the component boundary.
- Avoid: random per-instance nudges without a visible reason.

## Shadows Instead of Borders

Use shadows as borders when a border is trying to create depth on cards, buttons, popovers, media wrappers, or raised containers.

```css
:root {
  --shadow-border:
    0 0 0 1px rgba(0, 0, 0, 0.06),
    0 1px 2px -1px rgba(0, 0, 0, 0.06),
    0 2px 4px 0 rgba(0, 0, 0, 0.04);
  --shadow-border-hover:
    0 0 0 1px rgba(0, 0, 0, 0.08),
    0 1px 2px -1px rgba(0, 0, 0, 0.08),
    0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

.card {
  box-shadow: var(--shadow-border);
  transition-property: box-shadow;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

.card:hover {
  box-shadow: var(--shadow-border-hover);
}
```

Dark mode often needs only a subtle light ring:

```css
.dark {
  --shadow-border: 0 0 0 1px rgba(255, 255, 255, 0.08);
  --shadow-border-hover: 0 0 0 1px rgba(255, 255, 255, 0.13);
}
```

Keep real borders for:

- Input outlines and focus states.
- Dividers and table/list separators.
- Dense grid boundaries.
- Semantically flat surfaces where depth would lie.

Avoid pairing a visible `1px` border with a broad soft shadow on the same card or button. That pattern often creates a generic ghost card instead of a clear surface. Choose one job: defined edge, low-opacity structural border, or restrained elevation.

## 2px Low-Opacity Borders

In dense dark UIs, a `1px` border can disappear into black panels. Use a thicker neutral border at low opacity when the edge is part of the reading system.

```css
:root {
  --surface-border: rgba(255, 255, 255, 0.1);
  --surface-border-hover: rgba(255, 255, 255, 0.16);
}

.panel,
.card,
.control {
  border: 2px solid var(--surface-border);
}

.panel:hover,
.control:hover {
  border-color: var(--surface-border-hover);
}
```

Light mode equivalent:

```css
:root {
  --surface-border: rgba(0, 0, 0, 0.1);
}
```

Use it for:

- Structural panels, cards, tool surfaces, buttons, inputs, and popovers.
- Prototype shells where edges must read quickly against a black background.
- Surfaces whose border is the primary separation cue.

Keep `1px` for:

- Table rows, list separators, panel dividers, hairlines, and compact grids.
- Focus outlines, unless the existing design system already defines them.
- Media inset outlines, which should usually remain `1px` inside the image edge.

Avoid thick colored `border-left` or `border-right` accents on cards, list items, and callouts. If color needs to signal state, use a full-perimeter border, background tint, icon, label, or semantic state token.

Avoid `32px+` radii on cards, panels, and inputs. Pills can be fully rounded; structural surfaces should stay inside the local radius scale.

## Image and Media Outlines

Images often need a neutral inset edge so they do not bleed into the surface.

```css
.media {
  outline: 1px solid rgba(0, 0, 0, 0.1);
  outline-offset: -1px;
}

.dark .media {
  outline-color: rgba(255, 255, 255, 0.1);
}
```

Tailwind:

```tsx
<img className="outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10" />
```

Rules:

- Light mode: neutral black at low opacity.
- Dark mode: neutral white at low opacity.
- Avoid palette-tinted outlines; they make image edges look dirty.
- Skip outlines on deliberately borderless/full-bleed media.

## Hit Areas

Target 44x44px. Use 40x40px as the floor in dense desktop UI.

```css
.small-control {
  position: relative;
  width: 20px;
  height: 20px;
}

.small-control::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 40px;
  height: 40px;
  transform: translate(-50%, -50%);
}
```

Do not let expanded hit areas overlap. If controls are too close, increase spacing or shrink the pseudo-element to the largest non-overlapping target.

## Custom Scrollbars

Customize scrollbars only when the interface already has a strong surface system or the default scrollbar clashes with the shell. Keep the scrollbar visible and native; do not replace scrolling with JS.

```css
:root {
  --scrollbar-track: #050505;
  --scrollbar-thumb: rgba(255, 255, 255, 0.16);
  --scrollbar-thumb-hover: rgba(255, 255, 255, 0.24);
}

* {
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
  scrollbar-width: thin;
}

*::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

*::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
}

*::-webkit-scrollbar-thumb {
  border: 2px solid var(--scrollbar-track);
  border-radius: 999px;
  background-color: var(--scrollbar-thumb);
  background-clip: padding-box;
}

*::-webkit-scrollbar-thumb:hover {
  background-color: var(--scrollbar-thumb-hover);
}
```

Rules:

- Match track/thumb colors to the surface tokens.
- Keep contrast subtle but discoverable.
- Use `scrollbar-gutter: stable` on important panels when layout shift would hurt scanning.
- Verify both desktop and mobile overflow states.

## Quick Audit

- Nested rounded surfaces: radius math or intentional exception.
- No cards inside cards unless the nested surface has a real interaction or containment job.
- No thick one-sided accent border unless it is a table/grid boundary, not decoration.
- No decorative glass or stripe backgrounds by default.
- No hairline border plus broad shadow stack unless the design system documents it.
- Icon buttons: visual center, not only flex center.
- Media cards: neutral image edge.
- Raised surfaces: shadow-as-border where depth is the goal.
- Dense dark shell: `2px` low-opacity structural borders where `1px` is too weak.
- Scroll containers: custom scrollbar matches tokens and remains visible/native.
- Forms/tables: borders preserved where they carry structure.
- Touch targets: large enough and non-overlapping.

See [anti-slop.md](anti-slop.md).
