# Golden Example: Component Polish

## Brief

Existing command menu has jittery open motion, clipped long labels, and icon-only actions without accessible names.

## Surgical Read

- Surface: design-system component.
- Main task: find and trigger a command quickly.
- Visible problem: visual polish hides interaction debt.
- Source cause: menu primitive uses `transition-all`, center-origin scale, fixed width, and unlabeled icon buttons.
- Cut order: accessibility names, motion primitive, text wrapping, focus state, proof.

## Changes

- Added accessible names to icon buttons.
- Replaced `transition-all` with opacity/transform only.
- Set transform origin from trigger side and removed scale-zero entry.
- Added max inline size, wrapping, and stable row height.

## Proof

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path src/components/CommandMenu.tsx --url http://localhost:5173/menu-fixture --action-group open=output/improve-ui/menu-open.actions.json --out output/improve-ui/command-menu --expect-finding=transition-all --fail-verdict=acceptable
```

## Final Claim

The component improves because the primitive now protects repeated instances. The visual claim needs screenshot proof for default, open, focus, long label, and reduced-motion states.

