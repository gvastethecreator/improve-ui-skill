# Executable Example: Component Polish

This example is backed by a detector fixture, not a narrative claim.

## Fixture

- Contract: [case.json](../fixtures/cases/component-polish/case.json)
- Before: [CommandMenu.tsx](../fixtures/cases/component-polish/before/CommandMenu.tsx), [menu.css](../fixtures/cases/component-polish/before/menu.css)
- After component: [CommandMenu.js](../fixtures/cases/component-polish/after/CommandMenu.js), [menu.css](../fixtures/cases/component-polish/after/menu.css)
- Runtime after-state: [fixture.html](../fixtures/cases/component-polish/after/fixture.html)
- Executable assertions: repository test `tests/golden-fixtures.test.mjs`

The case contract names findings that must appear before and be absent after. The repository test runs the detector, then loads the actual after component source through the runtime fixture in Chromium to prove closed content is hidden, opening moves focus, and the command has an observable outcome. This document does not substitute prose for the result.

## Reproduce

```powershell
node SKILLS/improve-ui/scripts/detect-ui-antipatterns.mjs --json --include-advisory SKILLS/improve-ui/fixtures/cases/component-polish/before
node SKILLS/improve-ui/scripts/detect-ui-antipatterns.mjs --json --include-advisory SKILLS/improve-ui/fixtures/cases/component-polish/after
```

Compare finding IDs with `expectedBefore` and `expectedAfterAbsent` in `case.json`, or run the repository test suite.

## Claim Limit

This fixture proves detector behavior plus its named open/closed/focus/command runtime assertions. It does not prove broader rendered hierarchy, responsive fit, motion feel, integration in a real product, or visual improvement. For a real component repair, create route-specific action groups, assertions, browser artifacts, and a hash-verified proof manifest using [proof-recipes.md](../proof-recipes.md).
