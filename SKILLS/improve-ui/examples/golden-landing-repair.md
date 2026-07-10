# Executable Example: Landing Repair

This example is backed by a detector fixture, not a narrative claim.

## Fixture

- Contract: [case.json](../fixtures/cases/landing-repair/case.json)
- Before: [Hero.tsx](../fixtures/cases/landing-repair/before/Hero.tsx)
- After: [Hero.tsx](../fixtures/cases/landing-repair/after/Hero.tsx)
- Executable assertion: repository test `tests/golden-fixtures.test.mjs`

The case contract names objective and advisory findings that must appear before and be absent after. The repository test runs the detector and evaluates that contract; this document does not substitute prose for the result.

## Reproduce

```powershell
node SKILLS/improve-ui/scripts/detect-ui-antipatterns.mjs --json --include-advisory SKILLS/improve-ui/fixtures/cases/landing-repair/before
node SKILLS/improve-ui/scripts/detect-ui-antipatterns.mjs --json --include-advisory SKILLS/improve-ui/fixtures/cases/landing-repair/after
```

Compare finding IDs with `expectedBefore` and `expectedAfterAbsent` in `case.json`, or run the repository test suite.

## Claim Limit

This fixture proves detector behavior against authored source examples. It does not prove offer clarity, conversion, first-viewport fit, mobile layout, authenticity of proof, or visual improvement. For a real landing repair, collect first-viewport and proof-section artifacts on relevant viewports with [proof-recipes.md](../proof-recipes.md).
