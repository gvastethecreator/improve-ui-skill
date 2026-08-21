# Visual quality

Hierarchy, typography, color, surfaces, imagery, or generic visual language. Judgments are contextual. Most are `practice`, `heuristic`, or `preference`, not standards.

## Contents

- [Choose the register](#choose-the-register)
- [Calibrate before styling](#calibrate-before-styling)
- [Repair hierarchy](#repair-hierarchy)
- [Typography](#typography)
- [Color and contrast](#color-and-contrast)
- [Surfaces and elevation](#surfaces-and-elevation)
- [Imagery and references](#imagery-and-references)
- [Detect generic output](#detect-generic-output)
- [Create distinction](#create-distinction)
- [Visual proof](#visual-proof)

## Choose the register

Pick one register before judging:

- `product`: repeated tasks, scanning, state clarity, consistency, restraint. Familiarity can increase trust.
- `brand`: persuasion, memorability, voice, pacing, real proof. Distinction over category familiarity.
- `hybrid`: brand on persuasion/identity; product discipline on controls, forms, tables, repeated workflows.

Ask: task vs trust; how often they see the surface; consistency vs memorability as the larger risk.

No landing-page theatrics on dense product controls. No flattening a brand page into anonymous product chrome.

## Calibrate before styling

One-line design read:

`<surface> for <audience>; <register>; <visual language>; based on <existing system/reference>; constrained by <data/access/device/brand>.`

If these dials help, set them:

- `DESIGN_VARIANCE`: system-rigid `1` to expressive/asymmetric `10`
- `MOTION_INTENSITY`: static `1` to narrative/cinematic `10`
- `VISUAL_DENSITY`: gallery-airy `1` to cockpit-dense `10`

Ranges are heuristics, not rules. Product work usually lowers variance and motion while allowing density; brand work can raise both while preserving readability. Split hybrid surfaces by function.

Inspect tokens, primitives, component library, type, iconography, and established states before a new visual vocabulary. Avoid mixing design systems unless the migration is in scope.

## Repair hierarchy

First readable object must match the user's main task.

Before decorative polish:

- remove duplicate status, warnings, labels, badges, ornamental wrappers
- merge overlapping summaries into one source of truth
- demote diagnostics and metadata into a stable support zone
- promote the primary object, current state, next action, recovery path
- one visually primary action per region
- flatten cards-inside-cards into spacing, sections, or one justified surface layer
- comparable values in stable columns; density where comparison benefits
- reveal advanced/destructive actions progressively; never hide essential recovery
- navigation and persistent controls as a quieter functional layer
- brand and expression in the content they serve

Do not say "improve spacing." Name which group gets tighter, which boundary gets larger, and why.

## Typography

Type roles match the register: product — compact stable scale, display type sparingly, labels/data optimized for repetition; brand — display type can carry voice, long headings must not consume the viewport; hybrid — keep expressive type out of forms, settings, tables, operational labels.

Readable line length, commonly `60–75ch`; then check the actual typeface and content. If supported, `text-wrap: balance` for short headings and `text-wrap: pretty` for short supporting copy; long text, logs, tables, measured layouts stay predictable. Tabular numerals where changing digits must align or avoid shift — check the font's result. Tracking/uppercase for short labels only, not body text. Prevent flex/grid truncation bugs with the correct min-size and wrapping.

Treat `-webkit-font-smoothing` and `-moz-osx-font-smoothing` as non-standard visual preferences, not correctness fixes. Do not add them automatically. If already present, keep them root-scoped and check the target platform.

## Color and contrast

After real foreground/background and applicable criterion, treat WCAG contrast as a standard. Follow `accessibility.md` for the normative path.

Visual direction: derive palette roles from existing tokens, a real brand artifact, subject matter, or an explicit reference; define background, surface, text, muted text, accent, focus, semantic-state roles; inactive quieter than primary and selected; tune text for colored backgrounds; do not reuse neutral gray blindly; one coherent accent strategy unless the product already owns a broader palette. Check light/dark, selected, disabled, error, high-contrast. Skip states the product does not support. Translucent chrome only if the same spatial object stays visible behind it and text stays legible. Solid fallback under reduced transparency. Do not choose a blur or material by the tint it happens to produce.

Cream, purple gradients, glass, neon glow, or monochrome editorial styling are not inherently wrong. Unearned, content-obscuring, or interchangeable across unrelated products → heuristics.

For gradients, judge the rendered field: role, stops, origin/angle, interpolation, contrast across the full surface, banding, clipping, repetition, fallback, themes, performance. Do not flatten an intentional gradient because a detector recognized a common hue pair.

## Surfaces and elevation

Use containment when it communicates grouping, repetition, elevation, or interaction. Prefer spacing, headings, dividers, background bands before adding another card. Nested radii optically related. `outer radius ≈ inner radius + padding` is useful for close concentric surfaces, not a law. One primary elevation model per surface: edge, tint, or shadow. Combine only when each has a distinct job. Preserve real borders for inputs, tables, separators, focus, structural regions. If media otherwise disappears into the background, give it a subtle edge. Align asymmetric icons optically, not only mathematically. Prefer the established product icon set or a coherent library. Custom SVG must declare grid, viewBox, stroke/fill and corner language, optical center, target sizes. Inspect at real size and enlarged crops before accepting. Pills for pill-like labels/controls. If the system owns them, large radii on cards can be valid. Every remaining scroll region is a designed component: theme-aware thumb/track, appropriate width, hover/active. Preserve platform behavior, visibility, contrast, forced colors, keyboard, wheel, touch, zoom. Never hide the scrollbar merely to avoid styling it. If width changes disrupt scanning, `scrollbar-gutter: stable` on important scroll regions.

Do not fail a surface on a numeric radius, shadow width, or border opacity without rendered evidence.

## Imagery and references

Use real product output, photography, diagrams, screenshots, or approved brand assets. Do not fabricate dashboards, testimonials, customer logos, metrics, or metadata as persuasive evidence.

When a screenshot, URL, video, HTML export, or inspiration source is supplied:

1. Record source, viewport/frame, and role: reproduce, structure, motion, inspiration, or anti-reference.
2. Extract only decisions that affect code: hierarchy, grid, type scale, spacing, color roles, surfaces, imagery, interaction, responsive behavior.
3. Record what the existing system overrides and what must not be copied.
4. Implement the extracted system, not a decorative imitation.
5. Compare against the same target state.

Full-page capture can be sparse or misleading under lazy loading, scroll animation, Canvas/WebGL, or long media — use viewport slices and named section crops. For video, decompose into beats; record each beat's purpose, layout, motion, interaction, timing, implementation risk.

Prefer one strong reference per state/section over an unfocused mood board.

## Detect generic output

Advisory heuristics; need visual and product context:

- repeated icon-tile/heading/paragraph cards
- centered hero plus three equal feature cards by default
- repeated tiny uppercase eyebrows or decorative numbering
- fake status, version, location, branch, or telemetry labels
- nested rounded wrappers with uniform spacing and no hierarchy
- stock "premium" palette, type pairing, or glow treatment unrelated to the subject
- generic SaaS copy that avoids naming the product action and consequence
- identical reveal animation on every section
- decorative glass, stripes, grids, or gradients with no structural role
- iOS Settings chrome, system-glass costume, or SF-like chrome on a web product that did not ask for Apple-feel
- replacing one fashionable default with another equally predictable anti-default

Check intent. An established system, real product data, or brand asset can make the same pattern appropriate.

## Create distinction

After competence, at most one or two signature moves tied to the subject:

- product artifact or real output
- typography or layout derived from the content
- brand material, place, instrument, workflow, or data shape
- interaction that teaches the product
- recurring frame, line, crop, or media treatment that organizes the page

Record: rejected obvious default; rejected second reflex; selected signature move; why it fits audience and register; viewport/state proving it works.

Skip distinction for tiny bug fixes, regulated workflows, or dense controls where novelty harms trust.

## Visual proof

Same route, viewport, state, content, theme, and data before/after. Viewport screenshots for fold and hierarchy; full-page only for page rhythm. Device scale factor `2` or higher. Icons, scrollbar surfaces, dense spacing, small alignment: focused crops. If layout changes, inspect narrow/mobile and a realistic small laptop. Check focus, hover, selected, disabled, long content, and one relevant edge state for component polish. Separate observation from interpretation: "CTA is below the fold at 1280×720" is evidence; "feels timid" is a heuristic. No rendered artifact: keep a visual claim `blocked` or `limited`.

See [sources-and-provenance.md](sources-and-provenance.md) for the non-standard font-smoothing note and this reference's authority model. Chrome-versus-content, large-text reflow, anti-iOS-costume: [human-interface-craft.md](human-interface-craft.md).
