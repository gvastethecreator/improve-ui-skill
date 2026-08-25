# Proof Recipes And CLI Contract

Keep executable commands and JSON schemas here. Other references link here; do not copy CLI examples.

## Contents

- [Choose The Smallest Proof](#choose-the-smallest-proof)
- [Static Detector](#static-detector)
- [Review Harness](#review-harness)
- [Strict Implementation Gate](#strict-implementation-gate)
- [Proof Manifest](#proof-manifest)
- [Action Groups And Assertions](#action-groups-and-assertions)
- [Async UI Contract](#async-ui-contract)
- [Artifacts And Report Layers](#artifacts-and-report-layers)
- [Design Dossier](#design-dossier)
- [Blocked Proof Language](#blocked-proof-language)
- [Completion Rules](#completion-rules)

## Choose The Smallest Proof

- Static audit: detector plus source inspection. State runtime and visual quality remain unverified.
- Visual regression: same route, state, viewport, content, theme, data before/after.
- Component polish: default plus the most relevant focus/hover/disabled/long-content/narrow state.
- Product/dashboard: main desktop or container state plus narrow/mobile and one async or high-density edge.
- Marketing/pricing: first viewport, first real proof section, decision/price region, mobile.
- Interaction/motion: trigger, repeated/interrupted trigger, focus/keyboard, reduced motion, runtime visual evidence.
- Gesture: slow drag, flick, reversal, release outside bounds, cancellation, non-drag alternative, reduced motion.
- Responsive/content: breakpoint boundaries, 320 CSS px/reflow where applicable, long/unbroken content, relevant locale/direction.
- Async/data: seven required async groups for a deep async review. Smaller explicitly scoped set for focused work.
- Performance: measured affected interaction and environment. Source-only work supports a risk-reduction claim.
- Immersive: visible render, fallback, mobile/narrow, reduced motion, offscreen pause, cleanup, runtime behavior.

## Static Detector

Read-only source triage writes JSON to stdout:

```powershell
node SKILLS/improve-ui/scripts/detect-ui-antipatterns.mjs --json <frontend-path>
```

Objective P0/P1 strict gate:

```powershell
node SKILLS/improve-ui/scripts/detect-ui-antipatterns.mjs --json --strict --out output/improve-ui/<slug>/static-findings.json <frontend-path>
```

Report always labels advisory signals for contextual review. `--include-advisory` opts them into the selected failure threshold only during calibration or explicit local policy. Ordinary `--fail-on` applies to objective rules only; mutually exclusive with detector `--strict`. `--include-test-fixtures` only calibrates normally suppressed test/spec/story/snapshot surfaces. Missing/unreadable target, or zero supported UI files, is blocked — not a clean result.

## Review Harness

Runtime review: named state, explicit viewports:

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --out output/improve-ui/<slug> --action-group default=output/improve-ui/<slug>/default.actions.json --viewport 1280x800 --viewport 390x844
```

Static-only when no runnable URL exists:

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path>
```

Static-only output cannot support visual, interaction, responsive-runtime, measured-performance claims.

Omit `--out` for diagnose/verify/audit unless the user requested a report artifact. Harness then uses a unique OS temp directory and returns the absolute path with `outputMode: "temporary"`; project stays untouched. Explicit `--out` opts into durable output (`outputMode: "explicit"`) for authorized reports/implementation evidence.

Useful controls:

- Browser proof requires Playwright plus installed Chromium. Harness looks in the target repo `node_modules`, then `PLAYWRIGHT_PATH` (Playwright package directory) or `PLAYWRIGHT_NODE_MODULES` (`node_modules` directory). If unavailable, runtime coverage is blocked, not skipped.
- `--actions file`: load one group. Fallback name `default`, overridden by JSON `name`. `--action-group name=file`: CLI fallback name. `--action-group file`: filename stem as fallback. JSON `name` takes precedence over either fallback.
- `--viewport WIDTHxHEIGHT`: repeat for distinct viewports. One replaces defaults. Duplicate dimensions are rejected.
- `--wait-until domcontentloaded|load|networkidle|commit`: choose readiness deliberately.
- `--settle-ms N`: bounded post-load/action settle. Do not use it to hide missing assertions.
- `--include-advisory`: opt advisory source/runtime signals into gates. Leave off for ordinary objective policy.
- `--detail-capture`: runtime artifacts at device scale factor `2`. Required for strict visual-polish, screenshot-critique, icon, alignment, dense-layout, scrollbar claims.

## Strict Implementation Gate

Final claim an editable interface improved:

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --out output/improve-ui/<slug> --action-group main=output/improve-ui/<slug>/main.actions.json --action-group edge=output/improve-ui/<slug>/edge.actions.json --strict --p2-policy systemic --systemic-p2-count 2 --require-runtime --require-change-proof --proof-manifest output/improve-ui/<slug>/proof.json --detail-capture
```

Strict mode blocks:

- objective P0/P1 findings
- objective P2 findings according to `--p2-policy`
- invalid target or required runtime/state evidence
- invalid structured change proof when required
- failed actions, assertions, or required artifacts
- other explicit blockers in the report

Harness P2 policies:

- `systemic` (default): block an objective P2 rule when its rule ID repeats at least the configured count
- `all`: block every objective P2
- `none`: do not block objective P2
- `--systemic-p2-count N`: set the repeat threshold. Use `N >= 2`.

`--change-proof <path>` is a strict alias for `--proof-manifest <path>`. Accepts only a JSON file path, never free-form prose.

## Proof Manifest

Use this schema:

```json
{
  "version": 1,
  "claim": "The default account menu keeps its hierarchy and fits 1280x800 after the component repair.",
  "before": {
    "artifact": "before/default-1280x800.png",
    "state": "default",
    "viewport": { "width": 1280, "height": 800 },
    "kind": "viewport",
    "deviceScaleFactor": 1,
    "sha256": "<64-lowercase-hex-characters>"
  },
  "after": {
    "artifact": "after/default-1280x800.png",
    "state": "default",
    "viewport": "1280x800",
    "kind": "viewport",
    "deviceScaleFactor": 1,
    "sha256": "<64-lowercase-hex-characters>"
  }
}
```

Rules:

- `version` must equal `1`; non-empty `claim` string. Resolve artifact paths relative to the manifest; both files must exist.
- Reject artifacts that overlap or alias planned/current harness output by path, canonical target, or physical file identity — a run cannot use its own capture as independent change proof.
- Each artifact: structurally verified, non-interlaced 8-bit RGB/RGBA PNG, at least `32×32`. Check chunks, CRCs, compressed image data, media type, dimensions from bytes, not the extension. Check SHA-256 against file content. Before/after hashes must differ; byte-identical artifacts do not evidence a change.
- Non-empty state. Normalize viewport from `WIDTHxHEIGHT` or `{width,height}`. `kind`: `viewport`, `full-page`, or `element`. Default `deviceScaleFactor: 1`, or record the actual value up to `8`.
- `viewport`: pixels = viewport × device scale. `full-page`: at least scaled viewport width and height so overflow remains inspectable. `element`: scoped to that element.
- Identical before/after state, declared viewport, kind, device scale. Viewport captures share exact pixel dimensions. Full-page or element captures can differ in height/size when the change itself affects layout. Claim specific to what the artifacts show.

A valid pair proves comparable artifacts exist, not that after is better. Tie quality to rendered inspection and other relevant evidence.

Use separate manifests for different states or viewports when one pair cannot represent the claim honestly.

## Action Groups And Assertions

Object, not a bare action array, for strict runtime evidence:

```json
{
  "name": "menu-open",
  "actions": [
    { "type": "click", "selector": "[data-testid='account-menu-trigger']" },
    { "type": "wait", "ms": 100 }
  ],
  "assertions": [
    { "type": "visible", "selector": "[data-testid='account-menu']" },
    { "type": "attribute", "selector": "[data-testid='account-menu-trigger']", "name": "aria-expanded", "equals": "true" },
    { "type": "focused", "selector": "[data-testid='account-menu'] [role='menuitem']" },
    { "type": "count", "selector": "[data-testid='account-menu'] [role='menuitem']", "equals": 4 }
  ]
}
```

Actions:

- `click`: `selector`
- `hover`: `selector`
- `type`: `selector`, `value`
- `press`: optional `selector` (defaults to body), `key`
- `scroll`: optional `x`, `y`
- `wait`: `ms`

Assertions:

- `visible` / `hidden`: `selector`
- `text`: `selector` plus at least one of `equals`, `contains`, `matches` (optional regex `flags`)
- `url`: `equals`, `contains`, or `matches`
- `attribute`: `selector`, attribute `name`, and value matcher
- `focused`: `selector`
- `count`: `selector`, integer `equals`

Every strict state needs ≥1 meaningful assertion and must finish successfully. Assert user-facing state, not a generic always-present wrapper. Action-group names and normalized artifact filename stems must be unique. Report stores each source file/hash; redacts typed values; keeps length+SHA-256 for reproducibility. Optional action/assertion `timeout`: integer ms `1`–`60000`. `wait.ms` can be `0`. Invalid objects, unsupported types, duplicate viewports, malformed regexes are CLI errors, not runtime evidence.

## Async UI Contract

`--async-ui` requires seven groups that ran successfully and passed assertions:

- `empty`
- `loading`
- `error`
- `permission`
- `long-content`
- `slow-network`
- `rapid-click`

Example invocation pattern:

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --out output/improve-ui/<slug> --async-ui --action-group empty=<empty.json> --action-group loading=<loading.json> --action-group error=<error.json> --action-group permission=<permission.json> --action-group long-content=<long-content.json> --action-group slow-network=<slow-network.json> --action-group rapid-click=<rapid-click.json> --strict --require-runtime
```

Fixtures, mock routes, request interception, or product state controls reach each state. Naming groups or passing `--states` is not coverage. Each async group needs state-specific action/assertion evidence. Reusing one identical combined action-and-assertion signature under seven names is blocked.

## Artifacts And Report Layers

Each successful runtime state/viewport produces separate viewport and full-page artifacts: path, SHA-256, state, viewport, kind, device scale factor, media type, byte length. Verified change-proof artifacts also report pixel dimensions. Viewport artifacts for fold/hierarchy; full-page for page rhythm; device scale factor `2` or focused crops for fine craft.

Ownership marker records only reserved report names and deterministic screenshot paths with SHA-256. Invalid marker or modified recorded artifact: harness refuses cleanup before deleting. Reusing `--out` removes only unchanged files from the verified marker, preserves unrelated user files, rejects symlink/junction output paths — so stale screenshots cannot masquerade as current evidence.

JSON report keeps separate:

- `assessment`: each dimension `unknown|observed`, score `null|0..4`
- `evidenceCoverage`: static, runtime state/assertion, proof, artifacts, and blockers
- `expectations`: fixture/regression checks
- `gates`: objective policy and required-evidence outcomes
- reproducibility metadata: skill name/version/manifest hash, harness/detector hashes, separate target/harness Git roots/commits/dirty state, Node/platform, browser, configuration, target, evidence paths

Inspect `review.json`, generated README, screenshots, process exit status. A generated report is not a pass unless its required gates pass.

## Design Dossier

Material critique, proposal, or redesign handoff: generate both durable views from one manifest:

```powershell
node SKILLS/improve-ui/scripts/generate-design-report.mjs --manifest output/improve-ui/<slug>/report-manifest.json --out output/improve-ui/<slug>/report.html --strict-assets
```

Also writes `report.md` and lossless `report-assets/`. Follow [references/reporting.md](references/reporting.md) for manifest, annotation, portability, language, report-quality rules. Harness-generated `README.md` is a compact machine-run index, not a dossier replacement.

## Blocked Proof Language

Use direct limits:

- `Runtime proof blocked: no runnable URL was available; source inspection ran.`
- `Visual proof blocked: browser runtime was unavailable; rendered fit remains unknown.`
- `State proof scoped: loading and error ran; permission and slow-network require fixtures not present.`
- `Performance claim limited: source removes broad work, but no before/after runtime measurement was captured.`
- `Gesture proof limited: pointer behavior is implemented, but touch hardware and slowed capture were not available.`
- `Change proof invalid: before/after artifacts did not share state and viewport.`

Do not upgrade blocked work to verified, complete, production-ready, excellent, or conformant.

## Completion Rules

- Match the recipe to the claim.
- Prove the main path and one relevant edge/recovery path for nontrivial implementation.
- Named runtime states must run and pass assertions.
- Use structured, hash-verified artifacts for strict change proof.
- Keep advisory heuristics out of objective gates.
- Keep uninspected dimensions unknown.
- Record exact commands, exits, artifacts, environment, blockers, claim limits.
