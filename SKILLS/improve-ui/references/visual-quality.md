# Visual Quality

Use this reference when hierarchy, typography, color, surfaces, imagery, or generic visual language is the problem. These judgments are contextual: most are `practice`, `heuristic`, or `preference`, not standards.

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

## Choose The Register

Choose one register before judging the interface:

- `product`: Optimize repeated task completion, scanning, state clarity, consistency, and restraint. Familiarity can increase trust.
- `brand`: Optimize persuasion, memorability, voice, pacing, and real proof. Distinction matters more than category familiarity.
- `hybrid`: Apply brand expression to persuasion and identity; apply product discipline to controls, forms, tables, and repeated workflows.

Ask whether the user is here to complete a task or decide whom to trust, how frequently they see the surface, and whether consistency or memorability is the larger risk.

Do not apply landing-page theatrics to dense product controls. Do not flatten a brand page into anonymous product chrome.

## Calibrate Before Styling

Write a one-line design read:

`<surface> for <audience>; <register>; <visual language>; based on <existing system/reference>; constrained by <data/access/device/brand>.`

Set three internal dials only when they improve decisions:

- `DESIGN_VARIANCE`: system-rigid `1` to expressive/asymmetric `10`;
- `MOTION_INTENSITY`: static `1` to narrative/cinematic `10`;
- `VISUAL_DENSITY`: gallery-airy `1` to cockpit-dense `10`.

Use ranges as heuristics, not rules. Product work usually lowers variance and motion while allowing density. Brand work can raise variance and motion while preserving readability. Split hybrid surfaces by function.

Inspect the repository's tokens, primitives, component library, type, iconography, and established states before introducing a new visual vocabulary. Avoid mixing design systems unless the migration itself is in scope.

## Repair Hierarchy

Make the first readable object match the user's main task.

Prefer these moves before decorative polish:

- remove duplicate status, warnings, labels, badges, and ornamental wrappers;
- merge overlapping summaries into one source of truth;
- demote diagnostics and metadata into a stable support zone;
- promote the primary object, current state, next action, and recovery path;
- limit each region to one visually primary action;
- flatten cards-inside-cards into spacing, sections, or one justified surface layer;
- place comparable values in stable columns and use density where comparison benefits;
- reveal advanced or destructive actions progressively without hiding essential recovery.

Do not say “improve spacing.” Name which group becomes tighter, which boundary becomes larger, and why.

## Typography

Use type roles that match the register:

- Product: keep a compact, stable scale; use display type sparingly; optimize labels and data for repetition.
- Brand: let display type carry voice, but keep long headings from consuming the viewport.
- Hybrid: keep expressive type out of forms, settings, tables, and operational labels.

Apply these practices contextually:

- Keep prose around a readable line length, commonly `60–75ch`, then verify the actual typeface and content.
- Use `text-wrap: balance` for short headings and `text-wrap: pretty` for short supporting copy when supported; keep long text, logs, tables, and measured layouts predictable.
- Use tabular numerals where changing digits must align or avoid shift; verify the font's result.
- Reserve tracking and uppercase for short labels; avoid it for body text.
- Prevent flex/grid truncation bugs with the correct min-size and wrapping behavior.

Treat `-webkit-font-smoothing` and `-moz-osx-font-smoothing` as non-standard visual preferences, not correctness fixes. Do not add them automatically. If the established product uses them, keep them root-scoped and verify the target platform.

## Color And Contrast

Treat WCAG contrast as a standard only after evaluating the real foreground/background and applicable criterion. Follow `accessibility.md` for the normative path.

For visual direction:

- derive palette roles from existing tokens, a real brand artifact, subject matter, or an explicit reference;
- define background, surface, text, muted text, accent, focus, and semantic-state roles;
- keep inactive states quieter than primary and selected states;
- tune text for colored backgrounds instead of reusing neutral gray blindly;
- use one coherent accent strategy unless the product already owns a broader palette;
- verify light/dark, selected, disabled, error, and high-contrast states where supported.

Cream, purple gradients, glass, neon glow, or monochrome editorial styling are not inherently wrong. Treat them as heuristics only when they appear unearned, obscure content, or make unrelated products look interchangeable.

For gradients, judge the rendered field: role, stops, origin/angle, interpolation, contrast across the full surface, banding, clipping, repetition, fallback, themes, and performance. Do not replace an intentional gradient with a flat color merely because a detector recognized a common hue pair.

## Surfaces And Elevation

Use containment only when it communicates grouping, repetition, elevation, or interaction.

- Prefer spacing, headings, dividers, and background bands before adding another card.
- Keep nested radii optically related; `outer radius ≈ inner radius + padding` is a useful practice for close concentric surfaces, not a law.
- Choose one primary elevation model per surface: edge, tint, or shadow. Combine them only when each has a distinct job.
- Preserve real borders for inputs, tables, separators, focus, and structural regions.
- Give media a subtle edge when it would otherwise disappear into the background.
- Align asymmetric icons optically, not only mathematically.
- Prefer the established product icon set or a coherent library. Require custom SVG icons to declare a grid, viewBox, stroke/fill and corner language, optical center, and target sizes; inspect them at real size and in enlarged crops before accepting them.
- Keep pills for pill-like labels/controls; large radii on cards may be valid when the system owns them.
- Treat every remaining scroll region as a designed component. Use a minimal theme-aware custom thumb and track with appropriate width and hover/active states; preserve platform behavior, visibility, contrast, forced colors, keyboard, wheel, touch, and zoom usability. Never hide the scrollbar merely to avoid styling it.
- Use `scrollbar-gutter: stable` on important scroll regions when width changes would disrupt scanning.

Do not fail a surface on a numeric radius, shadow width, or border opacity without rendered evidence.

## Imagery And References

Use real product output, photography, diagrams, screenshots, or approved brand assets when they provide proof or identity. Do not fabricate dashboards, testimonials, customer logos, metrics, or metadata as persuasive evidence.

When a screenshot, URL, video, HTML export, or inspiration source is supplied:

1. Record source, viewport/frame, and role: reproduce, structure, motion, inspiration, or anti-reference.
2. Extract only decisions that affect code: hierarchy, grid, type scale, spacing, color roles, surfaces, imagery, interaction, and responsive behavior.
3. Record what the existing system overrides and what must not be copied.
4. Implement the extracted system, not a decorative imitation.
5. Compare against the same target state.

When lazy loading, scroll animation, Canvas/WebGL, or long media makes a full-page capture sparse or misleading, use viewport slices and named section crops. For video, decompose the reference into beats and record each beat's purpose, layout, motion, interaction, timing, and implementation risk.

Prefer one strong reference per state or section over an unfocused mood board.

## Detect Generic Output

Use these as advisory heuristics requiring visual and product context:

- repeated icon-tile/heading/paragraph cards;
- centered hero plus three equal feature cards by default;
- repeated tiny uppercase eyebrows or decorative numbering;
- fake status, version, location, branch, or telemetry labels;
- nested rounded wrappers with uniform spacing and no hierarchy;
- stock “premium” palette, type pairing, or glow treatment unrelated to the subject;
- generic SaaS copy that avoids naming the product action and consequence;
- identical reveal animation on every section;
- decorative glass, stripes, grids, or gradients with no structural role;
- replacing one fashionable default with another equally predictable anti-default.

Confirm intent. An established system, real product data, or brand asset can make the same pattern appropriate.

## Create Distinction

After competence, add at most one or two signature moves tied to the actual subject:

- product artifact or real output;
- typography or layout derived from the content;
- brand material, place, instrument, workflow, or data shape;
- interaction that teaches the product;
- recurring frame, line, crop, or media treatment that organizes the page.

Record:

- rejected obvious default;
- rejected second reflex;
- selected signature move;
- reason it fits the audience and register;
- viewport/state proving it works.

Skip distinction work for tiny bug fixes, regulated workflows, or dense controls where novelty harms trust.

## Visual Proof

- Compare the same route, viewport, state, content, theme, and data before/after.
- Capture viewport screenshots for fold and hierarchy; use full-page captures only for page rhythm.
- Capture at device scale factor `2` or higher and use focused crops when judging icons, scrollbar surfaces, dense spacing, or small alignment defects.
- Inspect narrow/mobile and a realistic small laptop when layout changes.
- Check focus, hover, selected, disabled, long content, and one relevant edge state for component polish.
- Separate observation from interpretation: “CTA is below the fold at 1280×720” is evidence; “feels timid” is a heuristic.
- Keep a visual claim `blocked` or `limited` when no rendered artifact exists.

See [sources-and-provenance.md](sources-and-provenance.md) for the non-standard font-smoothing note and the authority model used by this reference.
