## Core Moves

### Register And Anti-Slop

- Pick product, brand, or hybrid before judging taste.
- Product UI should feel trustworthy, consistent, state-complete, and fast for repeated task work.
- Brand UI should have a point of view: distinctive palette, typography, imagery, pacing, and copy.
- Hybrid UI should not let expressive brand treatment leak into forms, tables, and repeated controls.
- Scan for generated-UI tells: gradient text, purple-blue gradients, cream defaults, nested cards, icon tiles above headings, repeated eyebrows, over-rounded cards, decorative glass, wide shadows with hairline borders, and generic SaaS copy.
- When the cleanup would only make the UI competent, run a distinction pass and add one signature move tied to the real product, task, or brand artifact.
- If local files are available, run the bundled static detector for a first pass, then verify findings manually.
- Choose the smallest proof recipe that can support the final claim; do not use a clean static scan as proof of visual quality.

See [registers.md](registers.md).
See [taste-calibration.md](taste-calibration.md).
See [anti-slop.md](anti-slop.md).
See [distinction.md](distinction.md).
See [detector-rules.md](detector-rules.md).
See [proof-recipes.md](proof-recipes.md).

### Taste Calibration

- Lock a design read before styling: surface, audience, register, visual language, existing system/aesthetic, and constraints.
- Set `DESIGN_VARIANCE`, `MOTION_INTENSITY`, and `VISUAL_DENSITY` when visual quality is part of the task.
- Product/dashboards bias toward lower variance, lower motion, and higher density; marketing/brand can raise variance and motion while keeping density readable.
- Existing design system wins. For greenfield work, choose an official system only when the category clearly calls for it; otherwise build from existing stack and tokens.
- For redesigns, audit first and preserve routes, IA, nav labels, copy voice, analytics hooks, form names/order, legal copy, SEO metadata, and existing accessibility wins unless explicitly in scope.
- Use reference images or generated section comps for open-ended premium brand/marketing/prototype work when that will improve fidelity; inspect references deeply before coding.
- If the user supplies a URL, video, screenshot, HTML export, or inspiration source, extract concrete layout/type/surface/motion rules before coding.
- For landing and pricing pages, solve offer, proof, objections, comparison, and CTA flow before adding visual recipes.
- Do not apply landing-page taste moves to product controls, tables, forms, or high-frequency workflows.

See [taste-calibration.md](taste-calibration.md).
See [reference-capture.md](reference-capture.md).
See [marketing-pages.md](marketing-pages.md).

### Typography

- Headings: `text-wrap: balance` for short headings.
- Body/captions/descriptions: `text-wrap: pretty` for short-to-medium copy.
- Long text, code, logs, dense tables: leave default wrapping.
- macOS crispness: apply `-webkit-font-smoothing: antialiased` once at the root.
- Dynamic/aligned numbers: use `font-variant-numeric: tabular-nums`.
- Long display headings need smaller scale; avoid crushed tracking and generic hero typography.

See [typography.md](typography.md).

### Interface Contracts

- Prefer semantic HTML before ARIA: `button` for actions, `a`/`Link` for navigation, `label` for controls.
- Icon-only actions need accessible names; decorative icons/images should be hidden from assistive tech.
- Focus states must be visible with `:focus-visible` or equivalent.
- Forms need labels, useful `name`/`autocomplete`, correct input types, inline errors, and first-error focus.
- Content must survive empty, short, average, and long values; flex text children usually need `min-w-0`.
- Stateful navigation should use URLs when users expect back/forward, sharing, refresh, or deep-linking.
- Dates, times, numbers, and currency should use `Intl.*` instead of hardcoded formatting.
- Hydration-sensitive values need stable server/client behavior.
- Production hardening includes empty/loading/error/permission states, long content, translations, rapid clicks, slow network, and large datasets.

See [contracts.md](contracts.md).
See [hardening.md](hardening.md).

### Surfaces

- Tight nested radii: `outer radius = inner radius + padding`.
- If nested surfaces are far apart, choose radii independently.
- Align optically when geometric centering looks wrong, especially asymmetric icons.
- Use shadows as borders for elevated cards/buttons/media; keep real borders for dividers, inputs, tables, and focus affordances.
- In dense dark UIs, structural cards, panels, buttons, and controls can use real `2px` borders at about `10%` neutral opacity for better reading; keep dense dividers/table rules at `1px`.
- Images/media: add an inset `1px` neutral outline, black/10 in light mode and white/10 in dark mode.
- Custom scrollbars should match the surface tokens, stay visible, and preserve native scrolling behavior.
- Hit areas: target 44x44px; 40x40px is the dense-UI floor. Never overlap hit areas.
- Avoid reflexive surface patterns: nested cards, thick side stripes, huge radii, glass-by-default, decorative stripe gradients, and hairline border plus wide shadow.
- Use bounded visual recipes only when they serve hierarchy, affordance, proof, or a real brand/product artifact.

See [surfaces.md](surfaces.md).
See [visual-recipes.md](visual-recipes.md).

### Motion

- Interactive state changes: prefer interruptible CSS transitions or Motion springs.
- First ask if the interaction should animate at all: keyboard/high-frequency actions usually should not travel.
- Every animation needs a job: spatial continuity, state indication, explanation, feedback, or softening abrupt change.
- Common UI motion: reuse existing project primitives or the smallest exact CSS/Motion pattern for dropdowns, modals, page slides, tabs, tooltips, accordions, number/text swaps, badges, skeletons, errors, success checks, card tilt, and similar patterns.
- One-shot entrances: keyframes or Motion variants are fine.
- Shared layout animation: use only when one logical object moves between states and Motion is already installed.
- Use shared motion vocabulary when a user describes an effect vaguely or when review findings need precise terms such as origin-aware animation, shared element transition, rubber-banding, stagger, or layout animation.
- Prefer strong custom easing over weak defaults; avoid `ease-in` for UI entry/opening.
- Keep most UI state changes under `300ms`; large spatial surfaces can go longer only when distance and context justify it.
- Anchored popovers/dropdowns/tooltips need trigger-aware `transform-origin`; modals can stay centered.
- Avoid `scale(0)` entries; start from visible scale plus opacity.
- Enter: split semantic chunks and stagger only when the user benefits from staged attention.
- Exit: make softer than enter; skip dramatic exits unless spatial context matters.
- Contextual icon swaps: opacity + scale + blur; keep CSS-only if no Motion dependency exists.
- Press feedback: `scale(0.96)` is a safe default, but skip where motion distracts or component semantics say static.
- Reduced motion: preserve state clarity without travel/blur-heavy effects.

See [animations.md](animations.md).
See [motion-craft.md](motion-craft.md) for the stricter motion decision and review bar.
See [motion-vocabulary.md](motion-vocabulary.md) when naming, disambiguating, or explaining animation effects.
See [motion-review.md](motion-review.md) for strict motion review blockers, remediation order, and approval criteria.

### Performance

- Never use `transition: all` or broad Tailwind `transition` when exact properties are known.
- Prefer compositor-friendly animation properties: `transform`, `opacity`, sometimes `filter`, `clip-path`, and `mask`.
- `will-change` is a hint, not a fix. Use exact properties, sparingly, for important interactions with first-frame stutter or Safari-sensitive transforms.
- Do not add `will-change` to every animated element; extra layers cost memory and may hurt performance.
- Canvas, WebGL, physics, particles, and animated embeds need reduced motion, static fallback, offscreen pause, density caps, and cleanup/disposal.

See [performance.md](performance.md).
See [immersive-web.md](immersive-web.md).

### Audit Score

- Use a score only when it helps: audits, reviews, readiness checks, or broad polish passes.
- Score accessibility, performance, theming/design-system, responsive/content resilience, and anti-slop fit from `0-4` each.
- Findings still lead when concrete bugs or regressions exist.

See [audit-score.md](audit-score.md).
