# Sources and provenance

Last verified: **2026-08-27**.

Ledger for findings that depend on a standard, browser feature, library behavior, or inherited material. Link the exact criterion or documentation near the claim; do not cite this index as a substitute.

## Contents

- [Authority model](#authority-model)
- [Standards and accessibility](#standards-and-accessibility)
- [Human interface practice](#human-interface-practice)
- [Browser and CSS behavior](#browser-and-css-behavior)
- [Testing and measurement](#testing-and-measurement)
- [Library-specific guidance](#library-specific-guidance)
- [Material provenance](#material-provenance)
- [Maintenance protocol](#maintenance-protocol)

## Authority model

| Class | Meaning | Gate behavior |
|---|---|---|
| `standard` | Normative standard or explicit project requirement | Block only with direct in-scope evidence and named criterion |
| `practice` | Strong engineering default | Advisory unless project policy promotes it |
| `heuristic` | Contextual signal; needs verification | Never fail automatically. Inspect rendered or product context |
| `preference` | Local aesthetic or style choice | Never block on its own |

Standards can contain exceptions and applicability conditions; record them. Documentation examples and WAI-ARIA APG patterns are informative, not automatic proof of conformance.

## Standards and accessibility

| Source | Authority and use | Notes |
|---|---|---|
| [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/) | `standard`. Named A/AA/AAA criteria | Normative criterion and scope, not a paraphrased checklist |
| [Target Size (Minimum), SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) | AA criterion (informative) | Minimum `24×24 CSS px` or a documented exception including spacing |
| [Target Size (Enhanced), SC 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced) | AAA criterion (informative) | `44×44 CSS px`. Also a product usability preference |
| [Decorative Images tutorial](https://www.w3.org/WAI/tutorials/images/decorative/) | WAI practice aligned with WCAG techniques | Decorative/redundant `<img>` uses `alt=""`. Empty alt is not missing alt |
| [Label in Name, SC 2.5.3](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name) | AA criterion (informative) | Visible label text within the accessible name for voice input |
| [Dragging Movements, SC 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements) | AA criterion (informative) | Single-pointer non-drag alternative unless an exception applies |
| [WAI-ARIA APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) | `practice`. Widget keyboard/state patterns | Test actual browser/framework/AT behavior. APG is not a conformance certificate |
| [Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | `practice`. Focus, keyboard, naming, return behavior | Prefer native/proven project primitives where possible |

Relevant WCAG 2.2: reflow, text spacing, non-text contrast, use of color, focus not obscured, pointer cancellation, accessible authentication, keyboard/focus. Open the current criterion before a formal claim.

## Human interface practice

Copyrighted design references are linked as conceptual `practice` or `heuristic`; restate transferable tests in original prose. No source text, images, type metrics, system colors, material specs, or numeric scales copied. Not web standards; must not gate CI.

| Source | Authority and use | Notes |
|---|---|---|
| [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines) | `practice`. Human-behavior craft for web UI | Use [human-interface-craft.md](human-interface-craft.md). Do not clone iOS/macOS chrome. |
| [Refactoring UI](https://www.refactoringui.com/) | `heuristic`. Hierarchy, grouping, colored-surface text, action rank | Book by Adam Wathan and Steve Schoger. Conceptual tests only. No book text, images, or numeric scales copied. Must not gate CI. |
| [Principles of great design (WWDC26)](https://developer.apple.com/videos/play/wwdc2026/250/) | `practice`. Purpose, agency, responsibility, familiarity, flexibility, simplicity, craft, delight | Tests, not slogans. Delight is a result, not confetti. |
| [Inclusion](https://developer.apple.com/design/human-interface-guidelines/inclusion) | `practice`. Language and imagery | Transformed into copy tests. No HIG quotations. |
| [Privacy](https://developer.apple.com/design/human-interface-guidelines/privacy) | `practice`. Permission timing and purpose copy | Ask in context. Keep denied states usable. |
| [Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding), [Searching](https://developer.apple.com/design/human-interface-guidelines/searching), [Progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators), [Materials](https://developer.apple.com/design/human-interface-guidelines/materials) | `practice`. First-run, findability, progress, chrome-versus-content | Translucency only when the same spatial object remains behind chrome. Solid fallback for reduced transparency. |

Last technically verified for this section: **2026-08-27**.

## Browser and CSS behavior

| Source | Authority and use | Notes |
|---|---|---|
| [`prefers-reduced-motion` on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion) | Browser docs and compatibility | Remove or replace non-essential motion. Preserve state clarity |
| [Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/) | Evolving W3C specification | Defines `prefers-reduced-transparency`, `prefers-contrast`, and related features. Check support |
| [`@starting-style` on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40starting-style) | Browser docs and compatibility | Progressive entry enhancement. Baseline content must stay usable |
| [`will-change` on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change) | Browser documentation | Last resort for existing performance problems. Use sparingly; remove when possible |
| [`font-smooth` on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-smooth) | Browser documentation | Non-standard. Treat vendor font smoothing as a visual preference, not a fix |

Browser support is time-sensitive; recheck when a finding or implementation depends on these features.

## Testing and measurement

| Source | Authority and use | Notes |
|---|---|---|
| [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing) | Official Playwright guidance | Automated tests catch a subset. Combine with manual and inclusive testing |
| [Playwright emulation](https://playwright.dev/docs/emulation) | Official Playwright guidance | Covers viewport, UA, touch and related settings. Not physical-device proof |
| [`web-vitals`](https://github.com/GoogleChrome/web-vitals) | Google-maintained reference implementation | Prefer when matching Chrome reporting. Record package/version |
| [Cumulative Layout Shift](https://web.dev/articles/cls) | Google metric documentation | Largest session window, not the sum of all page-lifetime shifts |

Local harness signals remain diagnostics unless implementation and environment match the claimed metric. Record browser, version, OS, build mode, viewport/device, route, state, and commit.

## Library-specific guidance

| Source | Authority and use | Notes |
|---|---|---|
| [Motion animation performance](https://motion.dev/docs/performance) | Official Motion documentation | Individual transform shorthand can stay unaccelerated; full `transform` is a targeted option when acceleration matters |

Library docs are not a universal rule. Apply only when that library/version is present and profiling shows relevance. Preserve project primitives and version constraints.

## Material provenance

- Skill package and local documentation: repository MIT license.
- Refactors and consolidates previous skill material. No long external quotations or third-party code examples.
- [No AI Slop](https://github.com/petergyang/no-ai-slop) by Peter Yang, commit `61c21c351da4dcb40946a11fead978f2078a2c65`, MIT. [copy and writing quality](copy-and-writing.md) adapts editing principles and named pattern checks for UI copy and design reports. Prose and workflow rewritten; no upstream scripts or agent metadata imported. Last checked 2026-07-22. Preserve the full license in [Third-Party Notices](../THIRD_PARTY_NOTICES.md).
- Prior `motion-craft.md` mentioned "Apple-style fluid interface guidance" with no title, URL, revision, or license. Consolidated motion reference keeps only independently stated, broadly documented interaction principles; does not attribute or reproduce source-specific prose.
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines) and [Principles of great design (WWDC26)](https://developer.apple.com/videos/play/wwdc2026/250/) by Apple. [human-interface-craft.md](human-interface-craft.md) adapts transferable interaction, permission, onboarding, progress, search, inclusion, and display-setting tests for existing web UI. Last checked 2026-08-12. Apple materials remain Apple's; this skill only links them.
- [Refactoring UI](https://www.refactoringui.com/) by Adam Wathan and Steve Schoger. [visual-quality.md](visual-quality.md) restates transferable hierarchy and surface tests in original prose. Last checked 2026-08-27. The book remains the authors'; this skill only links it. Reviewed [s0xDk/refactoring-ui-skill](https://github.com/s0xDk/refactoring-ui-skill) commit `48872143abb0a8feb6d9bf58e222afbd800210b0` as a third-party encoding of those concepts; no files, CSS tokens, or wording imported.
- W3C, MDN, Playwright, Google, Motion, and Apple HIG/WWDC materials are linked as authorities. Not bundled or relicensed.
- Executable fixtures and templates are local test assets. Expected results from executable checks, not narrative claims.
- Optional runtimes (Playwright, axe, Motion, `web-vitals`) remain external. Follow their licenses and versioned APIs. Do not vendor them without recording license and source.

For future adapted material, record before inclusion: title and author/organization; canonical URL and revision/commit/tag; license and required notice; exact files or concepts adapted; whether text/code is copied, transformed, or only referenced; date last technically verified.

Do not add unattributed "inspired by" sections that cannot be audited.

## Maintenance protocol

1. Recheck time-sensitive browser, library, and testing docs before a dependent release.
2. Update `Last verified` only after opening the sources used by changed guidance.
3. Keep normative values beside their criterion and level. Preserve exceptions.
4. Mark library-specific behavior with package and version when known.
5. Add sources only when they change an instruction. Avoid bibliography inflation.
6. Remove obsolete guidance; do not keep contradictory historical recommendations.
7. Run link validation and the executable fixture/eval suite after changing a sourced contract.
