# Registers

Use this file to decide which design bar applies before judging taste.

## Choose A Register

Pick the first matching register:

- Product: app UI, dashboards, admin, tools, authenticated surfaces, settings, tables, editors, or operational workflows.
- Brand: marketing pages, landing pages, portfolios, campaigns, launch pages, editorial pages, venue/product pages, and any surface where the design itself persuades.
- Hybrid: logged-out product marketing plus a real app preview, onboarding, empty states, commerce/media cards, or docs portals.

For hybrid surfaces, apply product rules to task controls and brand rules to persuasion/identity areas. Do not let brand expressiveness infect forms, tables, and repeated controls.

## Product Register

Product design serves the task. Familiarity is often a feature.

### Product Goals

- Trust from category-fluent users.
- Fast scanning and repeated use.
- Consistent component vocabulary.
- Clear state, focus, and error handling.
- Restrained color and motion.

### Product Typography

- One well-tuned sans family can be correct.
- Prefer fixed rem scales over fluid display type.
- Use tight ratios, usually around `1.125-1.2`, for dense UIs.
- Preserve prose line length around `65-75ch`; tables, logs, and data can be wider.
- Avoid display fonts in labels, buttons, controls, and data.

### Product Color

- Default to restrained color: neutrals plus one accent.
- Accent belongs to primary actions, selection, current location, and state indicators.
- Define semantic states: hover, focus, active, disabled, selected, loading, error, warning, success, info.
- Use a second neutral layer for sidebars, toolbars, and panels when it improves structure.
- Avoid full-saturation accents on inactive states.

### Product Layout

- Density is allowed when the user needs comparison.
- Responsive behavior is structural: collapse sidebar, convert table, stack panels, change nav.
- Avoid fluid hero-scale typography inside tools.
- Prefer inline and progressive alternatives before opening a modal.

### Product Motion

- Keep most transitions in `150ms-250ms`.
- Motion conveys state, feedback, loading, reveal, or spatial relation.
- Avoid orchestrated page-load sequences.
- Reduce hover decoration in dense controls.

### Product Bans

- Decorative motion that does not convey state.
- Inconsistent controls for the same action.
- Display type in operational labels.
- Reinvented standard controls without a real usability reason.
- Modal as first thought.

## Brand Register

Brand design persuades. Distinctiveness matters more than product familiarity.

### Brand Goals

- A clear point of view.
- Memorability.
- Visual voice that matches the offer.
- Strong hierarchy and pacing.
- Real imagery or artifacts when the subject demands it.

### Brand Typography

- Pick type from a voice axis, not fashion.
- Use contrast deliberately: serif plus sans, geometric plus humanist, condensed plus regular, or one distinctive family with enough internal range.
- Display headings can be larger, but long headings need smaller scale.
- Avoid repeating the same tiny uppercase section kicker everywhere.
- Avoid default editorial-magazine styling unless the content is actually editorial.

### Brand Color

Choose a color strategy before values:

- Restrained: tinted neutrals plus one accent, accent under `10%`.
- Committed: one saturated color carries `30-60%` of the surface.
- Full palette: `3-4` named roles used deliberately.
- Drenched: the surface is the color.

Name a real reference or physical scene before choosing the palette. If the reference does not force a color strategy, the palette is probably generic.

### Brand Layout

- One dominant idea per fold is valid.
- Asymmetry, full-bleed imagery, and paced scroll can be correct.
- Cards are allowed only when they are the right affordance.
- For image-led briefs, let the image carry the hero rather than replacing it with decorative blocks.

### Brand Motion

- One orchestrated first-load moment can be stronger than many small tricks.
- Some brands should skip entrance motion; restraint can be voice.
- Motion should reveal the narrative, not blanket every section.

### Brand Bans

- Safe palette with no point of view.
- Zero imagery for physical or visual subjects.
- Generic editorial aesthetics on non-editorial briefs.
- Repeated numbered or eyebrow scaffolding.
- Large rounded icon tiles above every heading.

## Hybrid Surfaces

Examples:

- SaaS landing page with an interactive product preview.
- Onboarding flow inside an app.
- Commerce product detail page.
- Docs site with marketing hero and task docs.

Rules:

- Use brand register for first impression, story, and persuasion.
- Use product register for controls, forms, state, and repeated navigation.
- Keep the transition between registers explicit: layout band, media boundary, nav shift, or content purpose.
- Do not use decorative brand motion on product controls.

## Register Questions

- Is the user here to complete a task or choose/trust something?
- Will they see this every day or once before deciding?
- Is consistency or memorability the bigger risk?
- Does the subject require real imagery or can UI itself carry the message?
- Would category-standard UI increase trust or make the page forgettable?
