# Visual Recipes

Use this when the route needs a bounded craft move after context, register, and system are known. These are recipes, not an aesthetic library. Pick one or two that solve a specific visual problem.

Keep these recipes portable, bounded, and tied to a specific UI job.

## Selection Rule

Name the job before the recipe:

- Separate layers -> structural lines, framed grid, alpha mask, or shadow-as-border.
- Add polish to a raised surface -> neutral layered shadow, gradient edge, or optical radius correction.
- Focus attention -> masked reveal, restrained stagger, section crop, or media outline.
- Add identity to marketing/editorial -> numbering, logo/icon style, one material treatment, or one signature frame.
- Add immersive depth -> read `immersive-web.md` instead of stacking CSS decoration.

If the recipe cannot be explained as hierarchy, clarity, affordance, brand artifact, or proof, skip it.

## Surface Detail

- Neutral layered shadows: use for compact cards, buttons, popovers, hero media, and modal-like surfaces when default shadows feel blunt. Keep them neutral, avoid stacking with visible hairline borders, and use one elevation strength per state.
- Shadow as border: use when a card or button needs a crisp edge without another divider. Keep focus rings separate and visible.
- Gradient border: use sparingly on premium CTAs, pricing cards, selected states, or hero media. It should emphasize a real state or focal object, not decorate every card.
- Structural borders: use thin, readable dividers for tables, forms, dashboards, framed editorial layouts, and dense information. Avoid turning every section into a card.
- Concentric radius: nested surfaces should step down logically; giant radii belong mostly to pills, not cards or inputs.

## Layout Detail

- Container guide lines: useful for agency/editorial/technical pages that need precision. Keep opacity low and do not let guides compete with content.
- Framed grid: useful for landing/editorial structures with visible boundaries, L corners, or section spans. Works best when the grid also organizes content.
- Nested frames: use only when nesting communicates hierarchy; otherwise flatten with spacing and headings.
- Split technical layout: useful for hybrid product/brand pages where text and product artifact need equal weight.
- Image-first grid: useful when real photography, screenshots, or generated media are the primary proof.

## Mask And Edge Detail

- Alpha edge fade: use for scrollable rows, carousels, overflow previews, or before/after comparisons where content continues beyond the edge.
- Progressive blur: use for sticky headers, top/bottom overlays, or depth at viewport edges. Keep blur layers sparse and verify legibility/performance.
- Media outline: add a subtle outline or shadow-as-border to screenshots, videos, maps, and product media so edges survive light and dark backgrounds.
- Diagonal/chamfered corners: use when the design language is technical, industrial, game-like, or instrument-like. Apply consistently to a few component families.

## Motion Detail

- Fade/rise reveal: default low-risk reveal for sections, cards, and modals. Keep distance small and duration short.
- Masked word/line reveal: use for editorial hero copy or section titles where reading sequence matters. Avoid in dense apps.
- Scroll reveal: use once per section or content group. Do not replay on tiny scroll movements.
- Marquee loop: use only for nonessential logos/tags. Pause or slow for reduced motion and avoid meaningful content inside an infinite loop.
- Magnetic hover: use only for low-frequency brand CTAs/cards, gated to fine pointers, with tiny transform values.

## Icon, Logo, And Number Detail

- Logos: prefer real SVG/icon sources over text placeholders. Keep brand marks optically aligned and sized consistently.
- Icon family: use the project's existing icon family first. Switch style only when the whole surface benefits and the dependency already exists or is approved.
- Number markers: use `01`, `02`, `03` details for steps, process, or editorial rhythm; avoid decorative numbering with no information structure.

## Avoid

- More than two decorative recipes on one small section.
- Recipes that fight the existing design system.
- Glass, gradient, dither, laser, or skeuomorphic effects as generic "premium" moves.
- Heavy effects inside repeated lists, tables, or high-frequency controls.
- Copying a recipe without visual proof that it improves the target viewport/state.
