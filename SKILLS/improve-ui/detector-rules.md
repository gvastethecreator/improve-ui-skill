# Detector Rules

Use the bundled detector as deterministic source triage, not as design judgment. Keep commands centralized in [proof-recipes.md](proof-recipes.md).

## Rule Classes

- `objective`: A source pattern with a testable technical/accessibility/runtime consequence. These rules may participate in gates.
- `advisory`: A contextual visual, taste, or risk signal. These rules require manual confirmation and do not gate unless explicitly included for exploration.

The detector should report each rule's class, severity, confidence, category, message, location, and stable fingerprint. Severity does not turn an advisory heuristic into an objective fact.

## Gate Semantics

- `--strict` gates objective P0/P1 findings.
- `--fail-on` applies to objective rules only.
- `--strict` and `--fail-on` are mutually exclusive; choose the fixed strict contract or an explicit severity threshold.
- Output reports both classes for contextual review. `--include-advisory` explicitly opts advisory findings into the selected failure threshold; reserve it for calibration or an explicitly chosen local policy.
- `--include-test-fixtures` forces normally suppressed high-severity matches in test/spec/story/snapshot and `__tests__`/`__fixtures__` surfaces; use it for detector calibration, not product review.
- A missing target, unreadable target, or target with zero supported UI source files is blocked, never a clean scan.

Use the harness report's gate output and exit status as the machine contract. Do not infer a pass from a low finding count.

## Objective Signals

Objective rules can cover source evidence such as:

- an explicit `<img>` without `alt` when no spread attribute could supply it;
- a truly empty native button with no explicit accessible-name attribute;
- an explicit interactive role plus pointer handler that demonstrably lacks focusability or keyboard activation, when no spread can supply the contract;
- `transition: all` / `transition-all`;
- empty media source;
- `will-change: all` and explicit layout-heavy `will-change` hints. The initial value `will-change: auto` is neutral and must not be reported.

Confirm rule limitations. A regex cannot prove computed semantics, final layout, animation purpose, or runtime cost.
Runtime inspection may promote a source uncertainty to an objective result—for example, a visible rendered button with an empty computed accessible name.

## Advisory Signals

Advisory rules can surface candidates such as:

- image spread attributes where static analysis cannot prove whether `alt` is supplied;
- empty-looking buttons with spread props that may supply children or an accessible name;
- icon-only buttons whose rendered icon component may supply a title or accessible name;
- generic `div`/`span` handlers that may represent event delegation or analytics rather than a custom control;
- missing reserved media dimensions, fixed-size/overflow risks, and file-local reduced-motion gaps that may be handled elsewhere;
- layout read/write proximity and mass-layering patterns that require runtime confirmation;
- generic gradients, cream palettes, glass, glow, stripes, or oversized radii;
- nested-card structures and repeated icon-tile sections;
- generic SaaS copy, fake metadata, or placeholder proof;
- bounce, long timing, center-origin, or other motion that may be contextually wrong;
- literal color drift when a token system may exist elsewhere;
- blur/effect density that needs runtime and visual inspection.

Treat provider-branded style rules as legacy candidates. Prefer behavior- or pattern-based names backed by fixtures; do not claim a visual tell belongs to a particular model without a calibrated corpus.

## Confirm Findings

For every reported issue:

1. Open the exact file/location.
2. Determine whether the match is generated, vendored, test/fixture, dead, or real product code.
3. Inspect the surrounding primitive and project convention.
4. For visual or behavior claims, inspect the rendered state.
5. Group repeated instances by shared cause.
6. Suppress only with a documented, narrow fingerprint and rationale.

Baselines should represent accepted existing debt, not hide new defects. Fingerprints use a stable reported path plus an occurrence ordinal rather than line numbers. Baseline and allowlist entries are consumed as a multiset: one recorded occurrence suppresses one current occurrence, never every identical match.

## Report

State:

- target, reported path base, and supported files scanned, including whether test-fixture suppression was overridden;
- detector version/commit and flags;
- objective/advisory counts by severity;
- gate policy and exit status;
- confirmed findings and false positives;
- baseline/allowlist use;
- untracked or unsupported files excluded;
- runtime/visual limits.

A clean source scan proves only that no enabled source rule matched the scanned files.
