# Typography

Typography polish should reduce awkward wrapping, shifting numbers, and platform rendering surprises. Do not apply text tricks to every block by default.

## Text Wrapping

Use `text-wrap: balance` for short headings and titles where even line length matters.

```css
h1,
h2,
h3 {
  text-wrap: balance;
}
```

Tailwind:

```tsx
<h1 className="text-balance">Designing natural interfaces</h1>
```

Use `text-wrap: pretty` for short-to-medium body copy, descriptions, captions, and list text where orphaned final words look sloppy.

```css
.description,
figcaption {
  text-wrap: pretty;
}
```

Tailwind:

```tsx
<p className="text-pretty">A short paragraph that should not leave a lonely final word.</p>
```

Skip both for:

- Long article bodies where normal wrapping is fine.
- Code, logs, preformatted text.
- Dense tables or data grids.
- Containers where wrapping must remain predictable for measurement.

Practical pairing:

- Heading: `balance`.
- Supporting copy: `pretty`.
- Long content: default.

## Hierarchy And Scale

Product UI and brand UI need different type behavior:

- Product UI: fixed rem scale, tight hierarchy, labels and data stay functional.
- Brand UI: display type can carry voice, but long headings must not dominate the whole viewport.
- Hybrid surfaces: keep expressive type out of tables, forms, settings, nav, and repeated controls.

Avoid:

- Long hero sentences at huge display size.
- Display letter spacing so tight that glyphs touch.
- Fluid display headings inside dense tools and sidebars.
- One generic font everywhere on a brand surface when the type has no voice.
- Two typefaces that are too similar to create hierarchy.
- Repeated tiny uppercase tracked labels above every section.

Use:

- Body/prose max width around `65-75ch`.
- Display heading max around `6rem` unless the word count is very short and verified visually.
- Letter spacing no tighter than about `-0.04em`; `-0.02em` to `-0.03em` is usually enough.
- Wide tracking only for short uppercase labels, not body copy.

## Font Smoothing

On macOS, text can render heavier than intended. Apply smoothing once at the root.

```css
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

Tailwind:

```tsx
<html className="antialiased">
```

Do not sprinkle smoothing per component. Root-level is enough and avoids inconsistent weight.

## Tabular Numbers

Use tabular numbers when changing digits would shift layout or hurt comparison.

```css
.counter {
  font-variant-numeric: tabular-nums;
}
```

Tailwind:

```tsx
<span className="tabular-nums">{count}</span>
```

Use for:

- Timers and counters.
- Prices or metrics that update.
- Scoreboards and dashboards.
- Numeric table columns.
- Animated number transitions.

Skip for:

- Static decorative numbers.
- Phone numbers, zip codes, and identifiers.
- Version strings.
- Typography where proportional numerals are part of the art direction.

Some fonts change numeral shape with tabular figures. Verify the result in the actual font.

## Quick Audit

- Headings do not leave awkward single-word lines.
- Long display headings do not overflow or consume the whole viewport.
- Display tracking keeps glyphs legible.
- Uppercase/tracking is limited to short labels.
- Product UI labels, buttons, and data avoid decorative display type.
- Descriptions and captions avoid orphans where supported.
- Root smoothing exists once.
- Dynamic numbers do not cause layout shift.
- Tables and code keep predictable wrapping.

See [registers.md](registers.md) and [anti-slop.md](anti-slop.md).
