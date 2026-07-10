# Sources And Provenance

Last verified: **2026-07-09**.

Use this ledger when a finding depends on a standard, browser feature, library behavior, or inherited material. Link to the exact criterion or documentation near the claim; do not cite this index as a substitute.

## Contents

- [Authority model](#authority-model)
- [Standards and accessibility](#standards-and-accessibility)
- [Browser and CSS behavior](#browser-and-css-behavior)
- [Testing and measurement](#testing-and-measurement)
- [Library-specific guidance](#library-specific-guidance)
- [Material provenance](#material-provenance)
- [Maintenance protocol](#maintenance-protocol)

## Authority Model

| Class | Meaning | Gate behavior |
|---|---|---|
| `standard` | Normative standard or explicit project requirement | Block only with direct in-scope evidence and named criterion |
| `practice` | Strong engineering default | Advisory unless project policy promotes it |
| `heuristic` | Contextual signal requiring confirmation | Never fail automatically; inspect rendered/product context |
| `preference` | Local aesthetic or style choice | Never block on its own |

Standards may contain exceptions and applicability conditions. Record them. Documentation examples and WAI-ARIA APG patterns are informative implementation guidance, not automatic proof of conformance.

## Standards And Accessibility

| Source | Authority and use | Notes |
|---|---|---|
| [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/) | `standard`; named A/AA/AAA success criteria | Use the normative criterion and scope, not a paraphrased checklist |
| [Target Size (Minimum), SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) | Informative explanation of the AA criterion | Minimum is `24×24 CSS px` or a documented exception including spacing |
| [Target Size (Enhanced), SC 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced) | Informative explanation of the AAA criterion | `44×44 CSS px`; may also be a product usability preference |
| [Decorative Images tutorial](https://www.w3.org/WAI/tutorials/images/decorative/) | WAI practice aligned with WCAG techniques | Decorative/redundant `<img>` uses `alt=""`; empty alt is not missing alt |
| [Label in Name, SC 2.5.3](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name) | Informative explanation of AA criterion | Keep visible label text within the accessible name for voice input |
| [Dragging Movements, SC 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements) | Informative explanation of AA criterion | Provide a single-pointer non-drag alternative unless an exception applies |
| [WAI-ARIA APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) | `practice`; widget keyboard/state patterns | Test actual browser/framework/AT behavior; APG is not a conformance certificate |
| [Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | `practice`; focus, keyboard, naming, return behavior | Prefer native/proven project primitives where possible |

Relevant WCAG 2.2 coverage in this skill also includes reflow, text spacing, non-text contrast, use of color, focus not obscured, pointer cancellation, accessible authentication, and keyboard/focus criteria. Open the current criterion before making a formal claim.

## Browser And CSS Behavior

| Source | Authority and use | Notes |
|---|---|---|
| [`prefers-reduced-motion` on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion) | Browser documentation and compatibility | Remove or replace non-essential motion; preserve state clarity |
| [Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/) | Evolving W3C specification | Defines `prefers-reduced-transparency`, `prefers-contrast`, and related features; verify support |
| [`@starting-style` on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40starting-style) | Browser documentation and compatibility | Progressive entry-transition enhancement; baseline content must stay usable |
| [`will-change` on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change) | Browser documentation | Last resort for existing performance problems; use sparingly and remove when possible |
| [`font-smooth` on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-smooth) | Browser documentation | Non-standard; treat vendor font smoothing as a visual preference, not a fix |

Browser support is time-sensitive. Recheck compatibility when a finding or implementation depends on one of these features.

## Testing And Measurement

| Source | Authority and use | Notes |
|---|---|---|
| [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing) | Official Playwright guidance | Automated tests catch only a subset; combine with manual and inclusive testing |
| [Playwright emulation](https://playwright.dev/docs/emulation) | Official Playwright guidance | Device emulation covers viewport, UA, touch and related settings; it is not physical-device proof |
| [`web-vitals`](https://github.com/GoogleChrome/web-vitals) | Google-maintained reference implementation | Prefer for metrics intended to match Chrome reporting; record package/version |
| [Cumulative Layout Shift](https://web.dev/articles/cls) | Google metric documentation | CLS uses the largest session window, not the sum of all page-lifetime shifts |

Local harness signals remain diagnostics unless their implementation and environment match the metric claimed. Record browser, version, OS, build mode, viewport/device, route, state, and commit for reproducibility.

## Library Specific Guidance

| Source | Authority and use | Notes |
|---|---|---|
| [Motion animation performance](https://motion.dev/docs/performance) | Official Motion documentation | Individual transform shorthand may not be accelerated; full `transform` is a targeted option when acceleration matters |

Library documentation is not a universal rule. Apply it only when that library/version is present and profiling demonstrates relevance. Preserve project primitives and version constraints.

## Material Provenance

- The skill package and its local documentation are maintained under the repository's MIT license.
- This refactor rewrites and consolidates the repository's previous skill material; it does not preserve long external quotations or third-party code examples.
- The prior `motion-craft.md` mentioned “Apple-style fluid interface guidance” without an exact title, URL, revision, or license. The consolidated motion reference retains only independently stated, broadly documented interaction principles and does not attribute or reproduce source-specific prose.
- W3C, MDN, Playwright, Google, and Motion materials are linked as conceptual/technical authorities. They are not bundled or relicensed by this skill.
- Executable fixtures and templates in this package are local test assets. Their expected results must be derived from executable checks, not narrative claims.
- Optional runtimes such as Playwright, axe, Motion, and `web-vitals` remain external dependencies. Follow their own licenses and versioned APIs; do not vendor them without recording license and source.

For future adapted material, record before inclusion:

- title and author/organization;
- canonical URL and revision/commit/tag;
- license and required notice;
- exact files or concepts adapted;
- whether text/code is copied, transformed, or only referenced;
- date last technically verified.

Do not add unattributed “inspired by” sections that cannot be audited.

## Maintenance Protocol

1. Recheck time-sensitive browser, library, and testing documentation before a release that depends on it.
2. Update `Last verified` only after opening the sources used by changed guidance.
3. Keep normative values beside their criterion and level; preserve exceptions.
4. Mark library-specific behavior with the relevant package and version when known.
5. Add sources only when they change an instruction; avoid bibliography inflation.
6. Remove obsolete guidance rather than keeping contradictory historical recommendations.
7. Run link validation and the executable fixture/eval suite after changing a sourced contract.
