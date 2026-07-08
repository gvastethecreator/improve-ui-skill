# Anti-Slop

Use this file when a UI looks generated, generic, templated, or strangely fashionable without a reason. It defines the local critique layer for the context router.

## Principle

Generated-looking UI usually fails because it reaches for the same reflexes across unrelated products. Do not ban personality. Ban unearned repetition, default aesthetics, and decorative complexity that does not serve the surface.

Ask:

- Could this visual decision be predicted from the category alone?
- Could it be predicted from a common anti-reference, such as "not SaaS beige, so editorial black-and-white"?
- Does this element solve a product or brand problem, or is it generic design theater?
- Does a simpler structure communicate the same thing with less affectation?
- Did the agent lock a design read, or did it start from the usual centered hero/card grid/glow defaults?
- Would the same palette, typography, layout rhythm, and microcopy appear for an unrelated brand?

If a pattern is intentional and supported by the product's existing design system, keep it. If it appears because it is easy or familiar, replace it.

Anti-slop is only the floor. For visual work that needs to beat generic public design patterns, read [distinction.md](distinction.md) and require a signature move after the cleanup.

## Second-Order Slop

The first AI default is easy to spot. The second one is more dangerous: it avoids the obvious tell but lands in another saturated lane.

Flag:

- "Not SaaS purple" becoming default editorial black-and-white.
- "Not beige luxury" becoming cold chrome on every premium-consumer brief.
- "Not boring dashboard" becoming dark terminal cosplay with decorative logs.
- "More motion" becoming scroll-reveal on every section.
- "More premium" becoming oversized serif italics, fake metadata, and muted everything.

Fix by naming the actual object, task, audience, and constraint. If the replacement could fit a competitor's site with only the logo changed, it is still generic.

## Severity

- P1: blocks trust, readability, accessibility, or shipping quality.
- P2: makes the design feel generated or weak, but users can still complete work.
- P3: polish issue, acceptable if it is clearly intentional or rare.

Use P1 sparingly. Most anti-slop findings are P2 unless they also break contrast, layout, semantics, or real tasks.

## Color And Contrast Tells

Flag:

- Gradient text on headings, metrics, or CTAs.
- Purple, violet, blue, cyan, or pink gradients used as the default brand move.
- Warm cream, beige, sand, parchment, ivory, paper, or linen body backgrounds chosen by reflex.
- Beige/brass/oxblood/espresso premium-consumer palettes applied because the category feels "artisan", "luxury", "wellness", or "cookware" rather than because the brand owns those colors.
- Gray text on saturated or colored backgrounds.
- Low-contrast placeholder, secondary, or body text.
- Dark UI with colored glows everywhere.
- Glass blur as the default surface style.
- Palette shifts by section with no system: warm gray shell, blue CTA, rose badges, teal footer, and unrelated chart accents.

Prefer:

- Solid text color with emphasis from size, weight, placement, or a real brand color.
- Palettes derived from a scene, brand artifact, product domain, or existing tokens.
- Neutral body surfaces that are actually neutral, or a committed brand color that owns the surface.
- Text color tuned toward the background hue when the background is colored.
- Purposeful lighting: one meaningful glow beats many decorative glows.
- One accent strategy for the surface unless a real design system defines broader semantic color.
- Premium-consumer alternatives that actually differentiate: cold chrome, forest, cobalt, olive/brick, monochrome with one saturated pop, or a real brand-derived palette.

## Typography And Copy Tells

Flag:

- One generic font family across a brand surface where voice matters.
- Font pairing where the two families are too similar to create hierarchy.
- Display text with letter spacing tighter than the glyphs can carry.
- Long hero sentences set at huge display size.
- Oversized italic serif hero headlines used as default taste.
- Tiny uppercase tracked eyebrow labels repeated above every section.
- Numbered section markers used as generic scaffolding instead of a real sequence.
- Hero headlines that wrap into four or more lines because the container is too narrow or the copy is too verbose.
- Random serif italic words inserted into sans headlines only to look premium.
- All-caps body copy.
- Wide tracking on long body text.
- Generic SaaS copy such as "streamline", "empower", "supercharge", "world-class", "next-generation", and "cutting-edge" when the sentence could say the literal product action.
- Repeated aphoristic cadence: "Not X. Y.", "No X. Just Y.", "More than X. A Y."

Prefer:

- Product UI: one well-tuned sans can be correct; avoid display theatrics in labels, buttons, data, and forms.
- Brand/marketing: pick type from a voice axis, not from a trend. Serif/sans contrast, geometric/humanist contrast, or one distinctive family used deliberately.
- Short labels only for uppercase/tracking.
- Hero copy that fits the viewport: strong headline, concise support, visible CTA, no filler microcopy below the CTA.
- Same-family emphasis before gimmick pairings; italic or weight changes can beat random font swaps.
- Copy that names the real object, action, audience, and consequence.

## Layout And Surface Tells

Flag:

- Cards inside cards.
- Endless identical card grids with icon, heading, and paragraph.
- Three equal feature cards as the default answer to every landing page.
- Repeated left-text/right-image sections with no rhythm change.
- Rounded-square icon tile stacked above every heading.
- Thick colored side-stripe borders on cards, callouts, alerts, or list items.
- Hairline border plus a wide soft shadow on the same element.
- Border radii of `32px` or more on cards, sections, panels, and inputs.
- Repeating stripe gradients used as decoration.
- Same spacing value everywhere.
- Giant rounded wrapper sections containing more rounded cards and more inner panels.
- Fake metadata rows, status pills, version labels, city/time/weather strips, or decorative coordinate labels that do not carry product meaning.
- Modal as first solution when inline/progressive disclosure would work.

Prefer:

- Structure from hierarchy, typography, spacing, dividers, and state, not card nesting.
- Full-perimeter borders, subtle background tint, a leading icon, or nothing instead of side stripes.
- Radius scale with a clear role: small for dense tools, medium for cards, pill only for pills.
- One elevation model at a time: defined edge or shadow, not both as decoration.
- Varied rhythm: tight groups, larger section breaks, and deliberate empty space.
- Distinct section families on brand pages: hero, proof, feature narrative, product/media moment, testimonial, pricing/CTA, not one card row repeated.
- Open layout and direct alignment before adding containers.

## Motion And Effect Tells

Flag:

- Bounce or elastic easing on serious product UI.
- Decorative page-load choreography in product surfaces.
- Same reveal animation applied to every section by reflex.
- Image scale/rotate hover without a reason.
- Layout-property animation used casually.
- Claimed cinematic or premium motion that is not actually implemented.
- GSAP or heavy animation dependency added when CSS or existing Motion primitives would cover the job.
- Hover-only affordances on touch surfaces.
- Content hidden until JavaScript-triggered reveal fires.

Prefer:

- Motion that conveys state, feedback, loading, reveal, or spatial relation.
- Product UI transitions around `150ms-250ms`.
- Brand surfaces with one orchestrated moment when the brand earns it.
- Visible default content enhanced by motion, never content gated by motion.
- Reduced-motion paths that preserve state clarity.

See [motion-craft.md](motion-craft.md).

## Imagery And Media Tells

Flag:

- Broken, empty, placeholder, or guessed image URLs.
- Decorative generated SVG scenes when the user needs a real product, place, object, or state.
- Zero imagery on a page where the subject is physical, visual, or experiential.
- Generic category imagery instead of specific object or scene imagery.
- One compressed moodboard or design board used as the only source when text, spacing, or controls are too small to inspect.
- Div-based fake screenshots used where a real product state, generated bitmap, or explicit placeholder slot is needed.

Prefer:

- One strong verified image over many weak ones.
- Image search or generated bitmap assets when the brief needs visual specificity.
- Section-specific reference images or detail views when open-ended visual fidelity matters.
- Alt text that names the meaningful subject and state.
- Neutral inset image outlines from [surfaces.md](surfaces.md) when edges bleed into the shell.

## Design-System Drift Tells

Flag:

- Literal colors not in tokens when a design system exists.
- Random border-radius values outside the documented radius scale.
- New font families outside the design system without an explicit brand reason.
- Components with partial states: default and hover only, but no focus, disabled, loading, error, selected, or active states.
- Same action expressed with different button shapes or icon grammar across screens.

Prefer:

- Extend tokens only when the new value has a durable role.
- Fix primitives first, then component instances.
- Keep one state vocabulary across the surface.

## Quick Audit

- Scan for gradient text, warm-neutral body backgrounds, purple-blue gradients, nested cards, icon tiles, repeated eyebrows, and side stripes.
- Check hero/first viewport: line count, visible CTA, small-laptop fit, no tag soup.
- Check palette/radius/icon consistency before adding new visual ideas.
- Check contrast before making a taste claim.
- Check whether product or brand register changes the verdict.
- If a pattern is intentional, name the design-system or brand reason.
- If a pattern is reflexive, replace it with simpler structure.
- If the cleanup leaves the page merely competent, run the distinction pass and add one signature move tied to the task or brand.
