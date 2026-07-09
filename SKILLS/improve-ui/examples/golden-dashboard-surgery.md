# Golden Example: Dashboard Surgery

## Brief

Existing revenue dashboard feels "busy but weak." The source is editable and a local URL exists.

## Surgical Read

- Surface: product dashboard.
- Main task: compare account health and decide the next action.
- Visible problem: metadata chips, decorative cards, and equal-weight CTAs overpower the actual risk ranking.
- Source cause: card primitive uses the same elevation, spacing, and button treatment for every region.
- Cut order: promote risk table, demote metadata, unify status model, reduce nested surfaces, prove desktop plus narrow state.

## Changes

- Replaced nested cards with one dense table shell and one supporting insight rail.
- Moved sync/build metadata into a small footer row.
- Collapsed three competing status pills into one status column with severity tokens.
- Limited each account row to one primary action and one icon menu.

## Proof

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path src/dashboard --url http://localhost:5173/accounts --out output/improve-ui/accounts-dashboard --require-runtime --require-change-proof --change-proof "before/after screenshots cover 1280x800 default and 390x844 narrow account list" --fail-verdict=good
```

## Final Claim

The dashboard is not merely prettier; its primary comparison task is clearer, repeated status noise is removed at the primitive level, and runtime evidence covers desktop plus narrow layout. Slow-network and permission states remain scoped unless fixtures exist.

