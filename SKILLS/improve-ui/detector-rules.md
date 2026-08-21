# Detector Rules

Bundled detector is deterministic source triage, not design judgment. Commands live in [proof-recipes.md](proof-recipes.md).

## Rule Classes

- `objective`: source pattern with a testable technical, accessibility, or runtime consequence. Can gate.
- `advisory`: contextual visual, taste, or risk signal. Needs manual confirmation. Does not gate unless explicitly included for exploration.

Detector must report class, severity, confidence, category, message, location, and stable fingerprint. Severity does not turn an advisory heuristic into an objective fact.

## Gate Semantics

- `--strict` gates objective P0/P1 findings.
- `--fail-on` applies to objective rules only.
- `--strict` and `--fail-on` are mutually exclusive: fixed strict contract or an explicit severity threshold.
- Output reports both classes. `--include-advisory` opts advisory findings into the selected failure threshold. Calibration or an explicitly chosen local policy.
- `--include-test-fixtures` forces normally suppressed high-severity matches in test/spec/story/snapshot and `__tests__`/`__fixtures__` surfaces. Calibration, not product review.
- Missing, unreadable, or zero-supported-UI-source target is blocked, never a clean scan.

Harness report gate output and exit status are the machine contract. Do not infer a pass from a low finding count.

## Objective Signals

Objective rules can cover:

- explicit `<img>` without `alt` when no spread attribute can supply it
- truly empty native button with no explicit accessible-name attribute
- explicit interactive role plus pointer handler that demonstrably lacks focusability or keyboard activation, when no spread can supply the contract
- `transition: all` / `transition-all`
- empty media source
- `will-change: all` and explicit layout-heavy `will-change` hints. Initial value `will-change: auto` is neutral and must not be reported.

A regex cannot prove computed semantics, final layout, animation purpose, or runtime cost. Runtime inspection can promote a source uncertainty to an objective result — e.g. a visible rendered button with an empty computed accessible name.

## Advisory Signals

Advisory rules can surface:

- image spread attributes where static analysis cannot prove whether `alt` is supplied
- empty-looking buttons with spread props that can supply children or an accessible name
- icon-only buttons whose rendered icon component can supply a title or accessible name
- generic `div`/`span` handlers that may be event delegation or analytics, not a custom control
- missing reserved media dimensions, fixed-size/overflow risks, and file-local reduced-motion gaps handled elsewhere
- layout read/write proximity and mass-layering patterns that need runtime confirmation
- generic gradients, cream palettes, glass, glow, stripes, or oversized radii
- nested-card structures and repeated icon-tile sections
- generic SaaS copy, fake metadata, or placeholder proof
- canned writing: binary contrasts, filler openings, vague attribution, importance claims, synonym cycling, dramatic fragments
- bounce, long timing, center-origin, or other motion that can be contextually wrong
- literal color drift when a token system can exist elsewhere
- blur/effect density that needs runtime and visual inspection

Treat provider-branded style rules as legacy candidates. Use behavior- or pattern-based names backed by fixtures. Do not claim a visual tell belongs to a particular model without a calibrated corpus.

Writing-pattern signals remain advisory. Confirm the full copy set, product voice, facts, and user state before proposing a change. Gate them only through an explicit project copy policy.

## Confirm Findings

For every reported issue:

1. Open the exact file/location.
2. Determine whether the match is generated, vendored, test/fixture, dead, or real product code.
3. Inspect the surrounding primitive and project convention.
4. For visual or behavior claims, inspect the rendered state.
5. Group repeated instances by shared cause.
6. Suppress only with a documented, narrow fingerprint and rationale.

Baselines represent accepted existing debt, not hide new defects. Fingerprints use a stable reported path plus an occurrence ordinal, not line numbers. Baseline and allowlist entries are a multiset: one recorded occurrence suppresses one current occurrence, never every identical match.

## Report

State:

- target, reported path base, supported files scanned, and whether test-fixture suppression was overridden
- detector version/commit and flags
- objective/advisory counts by severity
- gate policy and exit status
- confirmed findings and false positives
- baseline/allowlist use
- untracked or unsupported files excluded
- runtime/visual limits

A clean source scan proves only that no enabled source rule matched the scanned files.
