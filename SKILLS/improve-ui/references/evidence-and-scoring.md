# Evidence and scoring

Audits, deep reviews, production-readiness, structured verdicts. Findings lead; scores are optional summaries — never manufacture certainty from missing evidence.

## Contents

- [Separate report layers](#separate-report-layers)
- [Build evidence coverage](#build-evidence-coverage)
- [Assess dimensions](#assess-dimensions)
- [Score only observed dimensions](#score-only-observed-dimensions)
- [Use severity independently](#use-severity-independently)
- [Set the verdict](#set-the-verdict)
- [Report shape](#report-shape)
- [Reproducibility](#reproducibility)

## Separate report layers

- `assessment`: Quality observations by dimension. Each is `unknown` or `observed`. Score is `null` or `0..4`.
- `evidenceCoverage`: Source, runtime states, assertions, viewports, artifacts, browsers, blockers actually inspected.
- `expectations`: Fixture/regression expectations behaved as expected. Validates the harness, not the interface.
- `gates`: Objective policy outcomes, proof validity, runtime/state success, blockers.

Expectation pass ≠ quality score. Gate failure blocks the claimed reason; it does not describe visual quality.

## Build evidence coverage

Record evidence IDs; attach them to findings:

- source: file, line, commit/diff, component, token, or state owner
- visual: artifact path/hash, route, state, viewport, theme, and content fixture
- runtime: browser/version, action group, assertion result, console/network, metric implementation
- test: command, environment, exit status, and relevant output
- manual: keyboard, focus, screen reader, touch/device, zoom, or slowed-motion observation
- blocker: missing URL, route, fixture, auth, browser, device, dependency, or access

Evidence supports only matching claims:

- Source proves implementation properties, not rendered appearance.
- Screenshot proves one visual state, not keyboard, motion feel, or cleanup.
- Automated accessibility output proves only enabled detectable rules in reached states.
- Emulation proves deterministic emulated conditions, not physical-device behavior.
- Local runtime samples do not prove field percentiles.
- A detector clean scan proves only that enabled rules did not match supported scanned files.

## Assess dimensions

Select dimensions relevant to requested scope. Deep full-interface review: all five.

### Accessibility

`observed`: source/semantics plus rendered/manual checks of the core interaction. Name automated and untested areas.

- `0`: core path inaccessible or task-blocking failures dominate.
- `1`: major keyboard, focus, name, contrast, form, or status failures.
- `2`: meaningful support exists but several important gaps remain.
- `3`: core inspected paths work with minor or bounded gaps.
- `4`: strong inspected coverage across semantics, keyboard/focus, rendered states, and dynamic behavior.

Never describe a `4` as WCAG certification.

### Performance

`observed`: runtime measurement of the named interaction/environment plus source context. Source-only cleanup stays `unknown` for measured quality.

- `0`: core interaction is blocked, crashes, or severely unstable.
- `1`: demonstrated major jank, latency, shift, resource, or asset failures.
- `2`: usable but important measured roughness remains.
- `3`: inspected interactions meet declared budgets with minor risk.
- `4`: strong measured behavior across the important inspected load/device states.

### Theming and design system

`observed`: representative source primitives/tokens plus rendered states/themes applicable to the path.

- `0`: no coherent roles. Core themes/states break.
- `1`: extensive literals, drift, or inconsistent state vocabulary.
- `2`: partial system with repeated gaps or exceptions.
- `3`: coherent reuse with minor drift.
- `4`: strong semantic tokens/primitives and complete inspected states/themes.

### Responsive and content resilience

`observed`: relevant viewport/container boundaries and at least one real-content or edge state. Deep review requires the applicable state matrix.

- `0`: core flow unusable outside one default layout/content state.
- `1`: major overflow, reflow, touch, content, or recovery failures.
- `2`: usable but several important states/boundaries remain brittle.
- `3`: inspected viewports and content hold up, with minor gaps.
- `4`: strong inspected coverage across viewport, zoom/reflow, content, locale, and async states relevant to scope.

### Visual trust and fit

`observed`: rendered interface plus product/register context. Use reference evidence when fidelity is claimed.

- `0`: hierarchy or visual treatment materially prevents comprehension/trust.
- `1`: major hierarchy, readability, credibility, or register mismatch.
- `2`: competent but important clarity/consistency/generic-treatment gaps remain.
- `3`: intentional, clear, context-fit interface with minor weaknesses.
- `4`: distinctive or appropriately restrained work with strong hierarchy and no material inspected visual weakness.

Advisory anti-slop heuristics never determine this score alone.

## Score only observed dimensions

- Uninspected or insufficiently evidenced dimension: `{ status: "unknown", score: null }`. Never init at `4`. Never infer a positive score from zero findings.
- Overall total only when every dimension selected for the declared review scope is observed; else `null`. Focused work: relevant dimension scores only — do not normalize a partial set to `/20`.
- Cite evidence IDs for every score; note conflicting evidence.

If all five dimensions are observed, an optional `/20` summary:

- `18–20`: excellent within inspected scope
- `14–17`: good, with named weaknesses
- `10–13`: acceptable but significant work remains
- `6–9`: poor
- `0–5`: critical

Bands summarize evidence. They do not override severity or gates.

## Use severity independently

- `P0`: core task impossible, data loss, severe safety/security issue, or no recovery.
- `P1`: broken core flow, misleading state, demonstrated accessibility failure, or severe responsive/performance failure.
- `P2`: material comprehension, resilience, consistency, trust, or repeated-use problem.
- `P3`: low-impact polish or optional refinement.

One unresolved in-scope P0/P1 blocks implementation-quality completion. A high aggregate score does not override this. If user impact is not demonstrated and no project requirement exists, do not elevate taste to P1.

## Set the verdict

Use:

- `blocked` when required target, runtime, state, proof, or gate evidence cannot run or cannot be validated
- `critical`, `poor`, `acceptable`, `good`, or `excellent` only when the selected scope has sufficient observed evidence
- `partial` or plain-language dimension findings for focused audits where an aggregate verdict misleads

Strict implementation claims need valid structured change proof, successful required runtime states/assertions, and passing objective gates. Missing proof cannot become `good` from a low visible finding count.

## Report shape

Lead with concrete findings when defects exist:

1. Scope/profile/register and permission mode.
2. Verdict or partial status.
3. P0/P1 then systemic P2 findings with evidence IDs and fixes.
4. Assessment by relevant dimension, including `unknown`.
5. Evidence coverage and blockers.
6. Preserved strengths.
7. Implemented changes or next actions, according to authority.
8. Claim limits and remaining risk.

Table only if it improves comparison; not by default.

## Reproducibility

Record skill/harness version or commit, target commit, dirty state, OS, browser/version, viewport/device, URL/route, theme/locale, build mode, action groups, proof manifest/hash, commands, exit statuses.

Use [../proof-recipes.md](../proof-recipes.md) for the executable contract and [sources-and-provenance.md](sources-and-provenance.md) for authority and metric sources.
