# Evidence And Scoring

Use this reference for audits, deep reviews, production-readiness passes, and any structured verdict. Findings lead. Scores are optional summaries and may never manufacture certainty from missing evidence.

## Contents

- [Separate report layers](#separate-report-layers)
- [Build evidence coverage](#build-evidence-coverage)
- [Assess dimensions](#assess-dimensions)
- [Score only observed dimensions](#score-only-observed-dimensions)
- [Use severity independently](#use-severity-independently)
- [Set the verdict](#set-the-verdict)
- [Report shape](#report-shape)
- [Reproducibility](#reproducibility)

## Separate Report Layers

Keep four independent layers:

- `assessment`: Quality observations by dimension. Each dimension is `unknown` or `observed`; score is `null` or `0..4`.
- `evidenceCoverage`: What source, runtime states, assertions, viewports, artifacts, browsers, and blockers were actually inspected.
- `expectations`: Whether fixture/regression expectations behaved as expected. This validates the harness, not the interface.
- `gates`: Objective policy outcomes, proof validity, runtime/state success, and blockers.

Passing an expectation does not raise a quality score. A gate failure does not automatically describe visual quality; it blocks the requested claim for the stated reason.

## Build Evidence Coverage

Record evidence IDs and attach them to findings/observations:

- source: file, line, commit/diff, component, token, or state owner;
- visual: artifact path/hash, route, state, viewport, theme, and content fixture;
- runtime: browser/version, action group, assertion result, console/network, metric implementation;
- test: command, environment, exit status, and relevant output;
- manual: keyboard, focus, screen reader, touch/device, zoom, or slowed-motion observation;
- blocker: missing URL, route, fixture, auth, browser, device, dependency, or access.

Evidence can support only matching claims:

- Source proves implementation properties, not rendered appearance.
- Screenshot proves one visual state, not keyboard behavior, motion feel, or cleanup.
- Automated accessibility output proves only enabled detectable rules in reached states.
- Emulation proves deterministic emulated conditions, not physical-device behavior.
- Local runtime samples do not prove field percentiles.
- A detector clean scan proves only that enabled rules did not match supported scanned files.

## Assess Dimensions

Select dimensions relevant to the requested scope. In a deep full-interface review, consider all five.

### Accessibility

Minimum evidence for `observed`: relevant source/semantics plus rendered/manual checks of the core interaction; name automated and untested areas.

- `0`: core path inaccessible or task-blocking failures dominate.
- `1`: major keyboard, focus, name, contrast, form, or status failures.
- `2`: meaningful support exists but several important gaps remain.
- `3`: core inspected paths work with minor or bounded gaps.
- `4`: strong inspected coverage across semantics, keyboard/focus, rendered states, and dynamic behavior.

Never describe a `4` as WCAG certification.

### Performance

Minimum evidence for `observed`: runtime measurement of the named interaction/environment plus source context. Source-only cleanup remains `unknown` for measured quality.

- `0`: core interaction is blocked, crashes, or severely unstable.
- `1`: demonstrated major jank, latency, shift, resource, or asset failures.
- `2`: usable but important measured roughness remains.
- `3`: inspected interactions meet declared budgets with minor risk.
- `4`: strong measured behavior across the important inspected load/device states.

### Theming And Design System

Minimum evidence for `observed`: representative source primitives/tokens plus rendered states/themes applicable to the path.

- `0`: no coherent roles; core themes/states break.
- `1`: extensive literals, drift, or inconsistent state vocabulary.
- `2`: partial system with repeated gaps or exceptions.
- `3`: coherent reuse with minor drift.
- `4`: strong semantic tokens/primitives and complete inspected states/themes.

### Responsive And Content Resilience

Minimum evidence for `observed`: relevant viewport/container boundaries and at least one real-content or edge state; deep review requires the applicable state matrix.

- `0`: core flow unusable outside one default layout/content state.
- `1`: major overflow, reflow, touch, content, or recovery failures.
- `2`: usable but several important states/boundaries remain brittle.
- `3`: robust inspected viewports/content with minor gaps.
- `4`: strong inspected coverage across viewport, zoom/reflow, content, locale, and async states relevant to scope.

### Visual Trust And Fit

Minimum evidence for `observed`: rendered interface plus product/register context; reference evidence when fidelity is claimed.

- `0`: hierarchy or visual treatment materially prevents comprehension/trust.
- `1`: major hierarchy, readability, credibility, or register mismatch.
- `2`: competent but important clarity/consistency/generic-treatment gaps remain.
- `3`: intentional, clear, context-fit interface with minor weaknesses.
- `4`: distinctive or appropriately restrained work with strong hierarchy and no material inspected visual weakness.

Advisory anti-slop heuristics never determine this score alone.

## Score Only Observed Dimensions

- Set an uninspected or insufficiently evidenced dimension to `{ status: "unknown", score: null }`.
- Do not initialize dimensions at `4`.
- Do not infer a positive score from zero findings.
- Compute an overall total only when every dimension selected for the declared review scope is observed.
- Keep the total `null` if any required dimension is unknown.
- For focused work, report only the relevant dimension scores; do not normalize a partial set to `/20`.
- Cite evidence IDs for every score and note conflicting evidence.

When all five dimensions are observed, an optional `/20` summary can use:

- `18–20`: excellent within inspected scope;
- `14–17`: good, with named weaknesses;
- `10–13`: acceptable but significant work remains;
- `6–9`: poor;
- `0–5`: critical.

Bands summarize evidence; they do not override severity or gates.

## Use Severity Independently

- `P0`: core task impossible, data loss, severe safety/security issue, or no recovery.
- `P1`: broken core flow, misleading state, demonstrated accessibility failure, or severe responsive/performance failure.
- `P2`: material comprehension, resilience, consistency, trust, or repeated-use problem.
- `P3`: low-impact polish or optional refinement.

One unresolved in-scope P0/P1 blocks an implementation-quality completion even if the aggregate score is high. Do not elevate taste to P1 without demonstrated user impact or a project requirement.

## Set The Verdict

Use:

- `blocked` when required target, runtime, state, proof, or gate evidence could not run or validate;
- `critical`, `poor`, `acceptable`, `good`, or `excellent` only when the selected scope has sufficient observed evidence;
- `partial` or plain-language dimension findings for focused audits where an aggregate verdict would mislead.

Strict implementation claims require valid structured change proof, successful required runtime states/assertions, and passing objective gates. Missing proof cannot become `good` because the visible finding count is low.

## Report Shape

Lead with concrete findings when defects exist:

1. Scope/profile/register and permission mode.
2. Verdict or partial status.
3. P0/P1 then systemic P2 findings with evidence IDs and fixes.
4. Assessment by relevant dimension, including `unknown`.
5. Evidence coverage and blockers.
6. Preserved strengths.
7. Implemented changes or next actions, according to authority.
8. Claim limits and remaining risk.

Use a table when it materially improves comparison across dimensions or evidence, not by default.

## Reproducibility

Record skill/harness version or commit, target commit, dirty state, OS, browser/version, viewport/device, URL/route, theme/locale, build mode, action groups, proof manifest/hash, commands, and exit statuses.

Use [../proof-recipes.md](../proof-recipes.md) for the executable contract and [sources-and-provenance.md](sources-and-provenance.md) for authority and metric sources.
