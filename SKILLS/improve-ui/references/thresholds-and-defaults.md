# Thresholds and defaults

Numbers that turn a visual or accessibility claim into pass or fail evidence, and starting values for a surface whose tokens are missing or broken. Project tokens beat the defaults. A measured `standard` failure stays a failure whatever the tokens say.

## Contents

- [Measurable thresholds](#measurable-thresholds)
- [Checks the harness does not run](#checks-the-harness-does-not-run)
- [Contrast arithmetic in OKLCH](#contrast-arithmetic-in-oklch)
- [Starting values without tokens](#starting-values-without-tokens)
- [Traps one capture hides](#traps-one-capture-hides)

## Measurable thresholds

WCAG 2.2 and Core Web Vitals values checked at w3.org and web.dev on 2026-11-17.

| Check | Pass | Label | Measure |
|---|---|---|---|
| Text contrast | 4.5:1; 3:1 for large text (24 px, or 18.5 px bold). No rounding: 4.499:1 fails | standard, 1.4.3 AA | Harness `contrastIssues` on solid backgrounds; sample pixels by hand over images, gradients, and translucency |
| Component and state contrast | 3:1 against adjacent colors for control boundaries, meaningful icons, focus indicators, and selected states. Disabled controls are exempt | standard, 1.4.11 AA | DPR 2 crop, sample both sides of the edge |
| Target size | 24×24 CSS px, or a 24 px circle centered on each undersized target does not touch another target or circle. Inline text links are exempt | standard, 2.5.8 AA | Harness `smallHitAreas` (24 px boundary) |
| Comfortable target | 44×44 CSS px for touch, frequent, destructive, or edge controls | AAA 2.5.5, practice | Same metric, stricter reading |
| Reflow | No two-direction scroll at 320 CSS px wide (256 px tall for horizontal content). Data tables, maps, diagrams, and toolbars are exempt | standard, 1.4.10 AA | `--viewport 320x800`; harness `horizontalOverflow` |
| Text spacing | Line height 1.5, paragraph spacing 2em, letter spacing 0.12em, word spacing 0.16em lose no content or function | standard, 1.4.12 AA | Override below; harness `clippedText` |
| Resize text | 200% without loss | standard, 1.4.4 AA | `--viewport 640x400` with device scale 2 approximates 200% of a 1280 px window |
| Focus visible | Indicator meets 3:1, and a sticky header, toast, or overlay never hides the focused control entirely | standard, 1.4.11 and 2.4.11 AA | Keyboard pass plus the probe below |
| Focus appearance | Indicator area at least a 2 CSS px perimeter and a 3:1 change between focused and unfocused pixels | AAA 2.4.13 | Use as the target when no project rule exists |
| Auto-moving content | Pause, stop, or hide when it starts by itself, runs over 5 s, and sits beside other content | standard, 2.2.2 A | Watch the page idle for 6 s |
| Flashing | At most 3 flashes in any second | standard, 2.3.1 A | Frame-step the recording |
| Layout shift | CLS ≤ 0.1 | Core Web Vitals "good" at p75 | Harness `cls` or `web-vitals`; lab value is a proxy for field data |
| Interaction latency | INP ≤ 200 ms | Core Web Vitals "good" at p75 of page loads | Trace the named interaction; harness `longTasks` |
| Loading | LCP ≤ 2.5 s | Core Web Vitals "good" at p75 | Field data or a throttled lab run, labeled as such |
| Sibling gap drift | Adjacent gaps in one series differ by 3 rendered px or less unless grouping explains it | heuristic | Harness `repeatedSpacingIssues` is a lead, not a verdict |
| Mobile input zoom | Text inputs, selects, and textareas at 16 px or more on phones | practice (iOS Safari zooms the page on focus below 16 px) | Probe below at 390 px |

## Checks the harness does not run

Run in a Playwright session on the same route and state as the capture. Record the result next to the screenshot.

```js
// 1.4.12 text spacing override; then capture and look for clipping, overlap, hidden controls.
await page.addStyleTag({ content: `*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}` });

// User preferences. Capture each state that the claim covers.
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.emulateMedia({ colorScheme: 'dark' });
await page.emulateMedia({ forcedColors: 'active' }); // only where the browser supports the emulation

// Inputs that make iOS Safari zoom on focus.
await page.evaluate(() => [...document.querySelectorAll('input:not([type=checkbox]):not([type=radio]), select, textarea')]
  .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
  .map((el) => el.name || el.id || el.outerHTML.slice(0, 80)));

// Focus probe: each tab stop shows an indicator and is not covered by another element.
const stops = [];
for (let i = 0; i < 60; i += 1) {
  await page.keyboard.press('Tab');
  stops.push(await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return {
      el: el.tagName + (el.id ? `#${el.id}` : ''),
      indicator: (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none',
      covered: !!top && top !== el && !el.contains(top),
    };
  }));
}
```

`indicator: false` is a lead: some focus styles draw on a pseudo-element or a wrapper, so confirm in the capture. `covered: true` at the element's center fails 2.4.11 only when the whole control is hidden; check the crop.

## Contrast arithmetic in OKLCH

For neutral colors, OKLCH lightness is exactly the cube root of relative luminance: `Y = L³`. A neutral pair can be planned without a checker:

| Background | 4.5:1 text | 3:1 text and UI |
|---|---|---|
| White (`L 1`) | `L ≤ 0.568` | `L ≤ 0.669` |
| Black (`L 0`) | `L ≥ 0.559` | `L ≥ 0.464` |
| Dark canvas `L 0.18` (≈ `#121212`) | `L ≥ 0.586` | `L ≥ 0.490` |
| Dark surface `L 0.22` | `L ≥ 0.606` | `L ≥ 0.509` |

White text on an accent fill needs the fill's `L ≤ 0.568`. Saturated colors drift up to about ±0.045 in sRGB: OKLCH reads saturated blues, reds, and magentas lighter than their luminance. Keep a 0.05 margin on dark backgrounds and check the final pair with the real rendered colors.

To keep a hue on a colored surface ([visual-quality.md](visual-quality.md)): keep the surface's hue and chroma, move only `L` past the bound, then check.

## Starting values without tokens

Use these only to repair a surface that has no usable scale. Record which ones you introduced.

| Role | Starting value | Notes |
|---|---|---|
| Body text | 16 px, line height 1.5 | Dense product UI: 14 px / 20 px |
| Small text | 12 px minimum, line height about 1.33 | Below 12 px only for non-essential metadata |
| Headings | Line height 1.1–1.25 | Long headings wrap with `text-wrap: balance` |
| Type scale | 4–6 steps, ratio 1.125–1.2 for product, 1.25–1.333 for editorial or marketing | One ratio per surface |
| Spacing | 4 px base: 4, 8, 12, 16, 24, 32, 48, 64, 96 | A common relationship set: within 8, between 16, section 32–48 |
| Control height | 32 px compact desktop, 36–40 px default, 44–48 px touch | Inputs and buttons in one row share a height |
| Icon | 16, 20, or 24 px; 1.5–2 px stroke; 6–8 px gap to its label | One family and one stroke per surface |
| Radius | 4–8 px for controls, a larger step for containers; nested `outer = inner + padding` | Pills only for pill-shaped controls |
| Focus ring | 2 px solid outline, 2 px offset, on `:focus-visible` | Color meets 3:1 against the component and the page |
| Table rows | 32–36 px dense, 40–44 px default, 48–56 px comfortable | Numbers right-aligned with `font-variant-numeric: tabular-nums` |
| Dark theme | Canvas near `#121212` (OKLCH `L ≈ 0.18`), not `#000`; body text near `L 0.93`, not pure white | Show elevation with lighter surfaces, not darker shadows; lower accent chroma |
| Layers | Named z-index scale: base, sticky, dropdown, overlay, modal, toast, tooltip | The defect is unnamed magic numbers, not the exact values |
| Motion | Tuning ranges in [motion.md](motion.md) | Durations yield to existing tokens |

## Traps one capture hides

- `100vh` on phones includes the area behind the browser toolbar. Full-height layouts use `100dvh` (or `100svh` when the content must fit with the toolbar shown); check that the last control is visible.
- Fixed bottom bars need `viewport-fit=cover` in the viewport meta and `padding-bottom: env(safe-area-inset-bottom)`.
- A flex child with long content needs `min-width: 0` (`min-height: 0` in a column) before truncation works; grid tracks need `minmax(0, 1fr)`.
- Single-line ellipsis needs `overflow: hidden`, `white-space: nowrap`, and `text-overflow: ellipsis`; multi-line needs `line-clamp` or `-webkit-line-clamp` with `display: -webkit-box`.
- `:hover` styles stick after a tap on touch screens; scope them to `@media (hover: hover)`.
- `outline: none` with no replacement focus style.
- A sticky header covers anchor targets and focused fields; add `scroll-margin-top` or `scroll-padding-top` equal to its height.
- Images without `width`/`height` or `aspect-ratio` shift layout on load.
- `font-display: swap` without a metric-matched fallback shifts text; use `size-adjust` and the `*-override` descriptors on the fallback face.
- Dark mode through `filter: invert()` breaks images, shadows, and contrast.
- A spinner that appears for under 300 ms reads as a flicker; delay it by 300–500 ms and keep the control's pressed or pending state immediate.
- `pointer-events: none` on a disabled button also removes its tooltip and the explanation of why it is disabled.
