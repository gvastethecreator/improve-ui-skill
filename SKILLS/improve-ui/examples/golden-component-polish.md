# Executable example: component polish

Backed by a detector fixture — not a narrative claim.

## Fixture

- Contract: [case.json](../fixtures/cases/component-polish/case.json)
- Before: [CommandMenu.tsx](../fixtures/cases/component-polish/before/CommandMenu.tsx), [menu.css](../fixtures/cases/component-polish/before/menu.css)
- After component: [CommandMenu.js](../fixtures/cases/component-polish/after/CommandMenu.js), [menu.css](../fixtures/cases/component-polish/after/menu.css)
- Runtime after-state: [fixture.html](../fixtures/cases/component-polish/after/fixture.html)
- Source calibration: repository test `tests/golden-fixtures.test.mjs`
- Browser assertions: `tests/runtime-golden-fixture-contract.test.mjs`

The case contract names findings that must appear before and be absent after. The source test checks those detector results. The separate runtime test loads the after component in Chromium and checks hidden content, opening focus, and the command's observable outcome. Neither this document nor a source-only run substitutes for that browser result.

## Reproduce

```powershell
node SKILLS/improve-ui/scripts/detect-ui-antipatterns.mjs --json --include-advisory SKILLS/improve-ui/fixtures/cases/component-polish/before
node SKILLS/improve-ui/scripts/detect-ui-antipatterns.mjs --json --include-advisory SKILLS/improve-ui/fixtures/cases/component-polish/after
```

Compare finding IDs with `expectedBefore` and `expectedAfterAbsent` in `case.json`, or run the named source test. Run the separate runtime test for the browser assertions.

## Claim limit

Proves detector behavior plus named open/closed/focus/command runtime assertions. Does not prove broader rendered hierarchy, responsive fit, motion feel, product integration, or visual improvement. For a real component repair, create route-specific action groups, assertions, browser artifacts, and a hash-verified proof manifest using [proof-recipes.md](../proof-recipes.md).
