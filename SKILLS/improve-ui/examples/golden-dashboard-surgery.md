# Executable Example: Dashboard Surgery

This example is backed by a detector fixture, not a narrative claim.

## Fixture

- Contract: [case.json](../fixtures/cases/dashboard-surgery/case.json)
- Before: [AccountTable.tsx](../fixtures/cases/dashboard-surgery/before/AccountTable.tsx), [dashboard.css](../fixtures/cases/dashboard-surgery/before/dashboard.css)
- After: [AccountTable.tsx](../fixtures/cases/dashboard-surgery/after/AccountTable.tsx), [dashboard.css](../fixtures/cases/dashboard-surgery/after/dashboard.css)
- Executable assertion: repository test `tests/golden-fixtures.test.mjs`

The case contract names findings that must appear before and be absent after. The repository test runs the detector and evaluates that contract; this document does not substitute prose for the result.

## Reproduce

```powershell
node SKILLS/improve-ui/scripts/detect-ui-antipatterns.mjs --json --include-advisory SKILLS/improve-ui/fixtures/cases/dashboard-surgery/before
node SKILLS/improve-ui/scripts/detect-ui-antipatterns.mjs --json --include-advisory SKILLS/improve-ui/fixtures/cases/dashboard-surgery/after
```

Compare finding IDs with `expectedBefore` and `expectedAfterAbsent` in `case.json`, or run the repository test suite.

## Claim Limit

This fixture proves detector behavior against authored source examples. It does not prove dashboard hierarchy, keyboard flow, async states, responsive behavior, or visual improvement. For a real dashboard repair, execute the main path and relevant edge states with assertions and browser artifacts using [proof-recipes.md](../proof-recipes.md).
