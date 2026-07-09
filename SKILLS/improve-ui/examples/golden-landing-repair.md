# Golden Example: Landing Repair

## Brief

Implemented landing page looks generic and the product is not visible in the first viewport.

## Surgical Read

- Surface: marketing page already implemented.
- Main task: understand what the product is and why it matters.
- Visible problem: decorative hero treatment and generic claims outrank product evidence.
- Source cause: split hero uses a fake product preview, oversized cards, and vague CTA stack.
- Cut order: first-viewport product signal, real proof section, CTA hierarchy, mobile wrap, media edge.

## Changes

- Replaced fake preview with real product screenshot or live capture.
- Made headline literal and moved value prop into support copy.
- Reduced CTA set to one primary and one secondary.
- Added media outline, reserved image dimensions, and mobile crop rules.

## Proof

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path src/app/page.tsx --url http://localhost:3000 --out output/improve-ui/landing-repair --require-runtime --require-change-proof --change-proof "before/after first viewport and product proof section captured on desktop and mobile" --fail-verdict=good
```

## Final Claim

The page is stronger only if the first viewport shows the real product or a truthful state, mobile preserves the CTA/product read, and the final report names any SEO/copy areas intentionally left untouched.

