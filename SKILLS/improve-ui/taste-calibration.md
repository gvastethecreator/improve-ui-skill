# Taste Calibration

Use this after [registers.md](registers.md) when visual quality, redesign, marketing, portfolio, prototype, or "make it look better" work is in scope. Pair it with [distinction.md](distinction.md) when the result must beat generic public design patterns.

## Design Read

Before changing visuals, lock a one-line read:

`Reading this as: <surface> for <audience>, <register>, <visual language>, using <existing system or aesthetic family>, constrained by <a11y/data/device/brand>.`

Read these signals first:

- Surface kind: app, dashboard, marketing page, editorial, commerce, portfolio, prototype, or component.
- Audience: repeated operator, buyer, developer, designer, recruiter, public-service user, casual consumer, or player.
- User language: calm, premium, brutalist, playful, serious B2B, editorial, cinematic, dense, accessible, experimental.
- Existing references: screenshots, URLs, brand assets, product tokens, existing UI libraries, competitor names.
- Quiet constraints: regulated/trust-first work, accessibility, real-data density, touch devices, analytics, SEO, legal copy.

Ask only one clarifying question when the design read could split into incompatible directions. Otherwise choose the nearest strong interpretation and proceed.

## Three Dials

Set these dials before selecting layout, typography, color, and motion. They are not user-facing controls; they are an internal guard against generic defaults.

- `DESIGN_VARIANCE`: `1` = system-rigid, `5` = balanced, `10` = expressive/asymmetric.
- `MOTION_INTENSITY`: `1` = static, `5` = purposeful reveals and feedback, `10` = cinematic/scroll-led.
- `VISUAL_DENSITY`: `1` = gallery-airy, `5` = normal product/marketing, `10` = cockpit/data-dense.

Default by register:

- Product app/dashboard: variance `2-4`, motion `1-3`, density `5-9`.
- Brand/marketing/portfolio: variance `5-9`, motion `3-7`, density `2-5`.
- Hybrid: split the dial by area; brand for persuasion, product for controls.
- Public-sector, healthcare, finance, legal, accessibility-critical: variance `1-3`, motion `1-2`, density `4-6`.
- Game/tool prototype: variance and motion follow the experience goal; density follows repeated use.

If a user asks for "premium", "polished", "distinctive", or "not generic", do not lower the quality bar. Use the dials to raise specificity while keeping the scope tied to the requested surface.

## System Before Aesthetic

Existing project system wins unless the user asks for a new direction.

- Check the repo's component library, CSS framework, tokens, package manager, and icon family before introducing anything.
- Use one design system per surface. Do not mix Material, Fluent, Carbon, shadcn, Primer, Polaris, Atlassian, or custom primitives casually.
- For greenfield or missing systems, choose an official system when the category clearly demands it: enterprise Microsoft -> Fluent, IBM/analytics -> Carbon, Shopify admin -> Polaris, GitHub/dev community -> Primer, public-sector UK -> GOV.UK, US public-sector -> USWDS, Material-like products -> Material.
- If the brief is an aesthetic, label it honestly as an approximation or custom treatment. Do not pretend glass, bento, brutalism, editorial, or Liquid Glass are official web systems.
- Before importing a library, check `package.json`; if missing, prefer existing dependencies or ask before adding a major new one.

## Redesign Protocol

For existing projects, audit before replacing.

1. Scan framework, styling method, tokens, component primitives, routes, and current patterns.
2. Infer current dials. A redesign starts from the current system, not a generic baseline.
3. Diagnose generic tells, broken states, layout debt, accessibility gaps, and missing real-data behavior.
4. Preserve IA, route slugs, primary nav labels, copy voice, legal/consent text, analytics event names, form names/order, existing accessibility wins, and SEO metadata unless the user explicitly asks to change them.
5. Apply modernization levers in order: typography, spacing/rhythm, palette cleanup, state/interaction feedback, motion layer, key-section recomposition, full block replacement.
6. Stop when the requested outcome is met. Do not rewrite the app because the landing page was weak.

Targeted evolution is the default. Full redesign is justified only when the structure itself is broken, the brand is changing, or the user asks for overhaul.

## Reference-Led Flow

Use reference images, supplied screenshots, URLs, videos, HTML exports, or generated section comps when the task is mainly visual and the design direction is open: premium landing, portfolio, brand page, prototype visual direction, hero, multi-section marketing site, or "make this beautiful". Read [reference-capture.md](reference-capture.md) when the source needs extraction before coding.

Do not force image-first work for technical bugs, small component fixes, dense product dashboards, or precise existing design-system work.

When using references:

- Prefer one clear reference per section or state over one tiny compressed board.
- Generate or collect extra detail views when text, buttons, spacing, or component rules are unclear.
- Inspect before coding: visible text, hierarchy, type scale, line wraps, spacing, gutters, button shape, radius logic, color roles, image treatment, shadows, grid, and repeated motifs.
- Implement the extracted system, not a generic reinterpretation.
- If references are unavailable, build from the design read and dials, then verify visually.
- For landing or pricing work, read [marketing-pages.md](marketing-pages.md) before selecting section order or visual recipes.
- For a single craft detail, read [visual-recipes.md](visual-recipes.md) after the page or component job is clear.
- For canvas, WebGL, 3D, particles, physics, globes, or animated embeds, read [immersive-web.md](immersive-web.md) before adding the effect.

## Preflight

Before finalizing a visual pass, check:

- Design read and dials are explicit enough to prevent defaulting.
- Register is respected; brand expression does not leak into dense controls.
- Existing system or official system choice is honored.
- Color uses one coherent palette and one accent strategy unless the brand system already defines more.
- Radius, icon, shadow, border, and typography systems are consistent.
- Hero/first viewport, when present, is readable on a small laptop: headline not overwrapped, CTA visible, no cluttered micro-label soup.
- No reflexive AI tells: purple-blue gradient default, beige/brass premium default, nested cards, three identical feature cards, repeated tiny eyebrows, fake metadata strips, placeholder brands, or generic SaaS copy.
- Distinction pass names the rejected default, rejected second reflex, and one signature move tied to the task, brand, or product artifact.
- Reference-led work states what was copied, adapted, rejected, and why.
- Motion has purpose, reduced-motion behavior, cleanup, and exact animated properties.
- Immersive effects include fallback, offscreen pause, density caps, and cleanup proof.
- Empty/loading/error/permission/long-content states are covered when async or real-data UI is involved.
- Visual proof exists for changed frontend behavior, or the blocker is stated.
