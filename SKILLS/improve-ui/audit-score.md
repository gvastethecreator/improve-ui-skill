# Audit Score

Use this file when the user asks for an audit, review, polish readiness check, or "does this look good?" and a structured verdict will help.

## Scope

Score only what you can inspect. Use screenshots, browser state, code, computed styles, tests, detector output, and runtime audit output as evidence. Use [proof-recipes.md](proof-recipes.md) to choose the smallest evidence set that matches the claim. Do not let a clean detector result replace visual judgment.

If the task is a code review, lead with findings. If the task is a design audit, lead with the score and the highest-impact findings.

For deep review, produce a ledger before the verdict:

- Context: register, workflow, viewport/state scope, constraints.
- Evidence: files/lines, screenshots, detector JSON, runtime/browser output, or blocker.
- Findings: P1/P2 first, grouped by systemic cause.
- Change ambition: local fix, component primitive, token/system, layout shell, or state model.
- Proof: before/after state or reason proof is blocked.

## Dimensions

Score each dimension from `0` to `4`.

### Accessibility

- `0`: blocks keyboard, labels, semantics, or contrast across core flows.
- `1`: major gaps such as missing focus, unlabeled controls, or no keyboard path.
- `2`: partial effort with several WCAG AA failures or brittle semantics.
- `3`: mostly WCAG AA with minor gaps.
- `4`: strong semantic structure, keyboard flow, labels, contrast, live regions, and state announcements.

Check: contrast, labels, roles, heading order, focus, alt text, forms, live regions, and keyboard traps.

### Performance

- `0`: severe jank, layout thrash, unoptimized assets, or blocked interaction.
- `1`: major image, animation, render, or bundle issues.
- `2`: some optimization but visible rough edges.
- `3`: mostly fast with minor improvement opportunities.
- `4`: lean, smooth, measured, and resilient under load.

Check: layout reads/writes, animation properties, image sizing/loading, bundle/dependency weight, render churn, list size, costly filters/shadows, offscreen animations, and canvas/WebGL loops.

Suggested runtime budget for a short interaction:

- Long tasks: `0`.
- Frame p95: `<= 20ms`.
- Frame max: `<= 50ms`.
- Unexpected layout shift: `0`.
- Console/network failures: `0`.
- Offscreen running animations for targeted optimization: `0`.
- Active offscreen canvas/WebGL markers: `0`.

Budgets are starting points, not law. If hardware, browser, or task scope makes them unfair, state the adjusted budget before scoring.

### Theming And Design System

- `0`: no token system, hardcoded values everywhere, theme breaks.
- `1`: minimal tokens with many literal colors/radii/fonts.
- `2`: partial tokens with drift and inconsistent states.
- `3`: tokens mostly used and states mostly covered.
- `4`: coherent token system, dark/light or theme variants work, component states are complete.

Check: color tokens, radius scale, spacing scale, typography roles, semantic states, and repeated component vocabulary.

### Responsive And Content Resilience

- `0`: desktop-only or broken on mobile.
- `1`: major fixed-width, overflow, or touch target issues.
- `2`: usable on smaller screens but rough with real content.
- `3`: responsive with minor overflow/touch issues.
- `4`: robust across viewports, zoom, long text, empty states, and touch.

Check: viewport widths, text scaling, long words, CJK/RTL when relevant, 44px touch targets, overflow, safe areas, and responsive nav/table behavior.

### Anti-Slop And Visual Trust

- `0`: five or more strong generated-UI tells, or one tell dominates the page.
- `1`: three or four obvious tells.
- `2`: one or two noticeable tells.
- `3`: mostly intentional with small generic traces.
- `4`: distinctive, context-fit, and free of reflexive patterns.

Check: [anti-slop.md](anti-slop.md), [distinction.md](distinction.md), register fit, palette strategy, typography voice, layout rhythm, motion purpose, imagery, copy specificity, reference extraction when used, and whether a signature move makes the surface preferable rather than merely less generic.

When visual quality is in scope, also check [taste-calibration.md](taste-calibration.md): design read, dials, system choice, redesign preservation, and reference-led proof.

## Severity

- P0: blocks task completion, causes data loss, traps keyboard, or makes core content unreadable.
- P1: WCAG AA failure, broken responsive core flow, missing labels, major performance jank, or misleading state.
- P2: visible quality issue, generic visual tell, inconsistent design-system usage, or content resilience gap.
- P3: polish improvement with low user impact.

## Report Shape

Keep it concise:

- Score: `accessibility/performance/theming/responsive/anti-slop = X/X/X/X/X`, total `/20`.
- Verdict: `excellent`, `good`, `acceptable`, `poor`, `critical`, or `blocked` when requested evidence could not run.
- Context/evidence ledger: include only facts used for scoring.
- Top findings: ordered by severity with file/line or screenshot state.
- Systemic issues: repeated causes, not every instance.
- Positive findings: what should be preserved.
- Next actions: 1-5 concrete moves.

Rating bands:

- `18-20`: excellent, minor polish.
- `14-17`: good, address weak dimensions.
- `10-13`: acceptable, significant work remains.
- `6-9`: poor, major overhaul.
- `0-5`: critical, fundamentals broken.

If a requested detector, runtime, visual, or async-state gate is blocked, the verdict is `blocked` even when the visible finding count is low. Do not convert missing evidence into a high score.

## Evidence Rules

- Cite file and line for code-backed findings.
- Cite viewport/state for visual findings.
- Cite command output for detector/test findings.
- Cite `output/improve-ui/<slug>/review.json` or its README when the harness was run.
- For visual upgrades, cite before/after or reference/after artifacts; if unavailable, lower the claim or mark proof blocked.
- Mark speculative taste as speculative and keep it P3 unless it has a user impact.
- Do not flood with P3 issues; group them.

## Quick Workflow

1. Identify register from [registers.md](registers.md).
2. Run the review harness or lightweight static scans when local files are available.
3. Visually inspect the target state for frontend changes or live UI bugs.
4. Score dimensions.
5. Report highest severity first.
6. Recommend smallest next actions.

Harness:

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --out output/improve-ui/<slug> --fail-on=P1
```
