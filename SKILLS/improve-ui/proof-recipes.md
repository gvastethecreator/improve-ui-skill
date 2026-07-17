# Proof Recipes And CLI Contract

Keep executable commands and JSON schemas here. Other references should link to this file instead of copying CLI examples.

## Contents

- [Choose the smallest proof](#choose-the-smallest-proof)
- [Static detector](#static-detector)
- [Review harness](#review-harness)
- [Strict implementation gate](#strict-implementation-gate)
- [Proof manifest](#proof-manifest)
- [Action groups and assertions](#action-groups-and-assertions)
- [Async UI contract](#async-ui-contract)
- [Artifacts and report layers](#artifacts-and-report-layers)
- [Design dossier](#design-dossier)
- [Blocked proof language](#blocked-proof-language)
- [Completion rules](#completion-rules)

## Choose The Smallest Proof

- Static audit: detector plus source inspection; state that runtime and visual quality remain unverified.
- Visual regression: same route, state, viewport, content, theme, and data before/after.
- Component polish: default plus the most relevant focus/hover/disabled/long-content/narrow state.
- Product/dashboard: main desktop or container state plus narrow/mobile and one async or high-density edge.
- Marketing/pricing: first viewport, first real proof section, decision/price region, and mobile.
- Interaction/motion: trigger, repeated/interrupted trigger, focus/keyboard, reduced motion, and runtime visual evidence.
- Gesture: slow drag, flick, reversal, release outside bounds, cancellation, non-drag alternative, and reduced motion.
- Responsive/content: breakpoint boundaries, 320 CSS px/reflow where applicable, long/unbroken content, and relevant locale/direction.
- Async/data: the seven required async groups for a deep async review; use a smaller explicitly scoped set for focused work.
- Performance: measured affected interaction and environment; source-only work supports a risk-reduction claim.
- Immersive: visible render, fallback, mobile/narrow, reduced motion, offscreen pause, cleanup, and runtime behavior.

## Static Detector

Read-only source triage writes JSON to stdout:

```powershell
node SKILLS/improve-ui/scripts/detect-ui-antipatterns.mjs --json <frontend-path>
```

Objective P0/P1 strict gate:

```powershell
node SKILLS/improve-ui/scripts/detect-ui-antipatterns.mjs --json --strict --out output/improve-ui/<slug>/static-findings.json <frontend-path>
```

The report always labels advisory signals for contextual review. Add `--include-advisory` only to opt them into the selected failure threshold during calibration or an explicitly chosen local policy; ordinary `--fail-on` applies to objective rules only and is mutually exclusive with detector `--strict`. Use `--include-test-fixtures` only to calibrate normally suppressed test/spec/story/snapshot surfaces. A missing/unreadable target or zero supported UI files is blocked, not a clean result.

## Review Harness

Runtime review with a named state and explicit viewports:

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --out output/improve-ui/<slug> --action-group default=output/improve-ui/<slug>/default.actions.json --viewport 1280x800 --viewport 390x844
```

Static-only review when no runnable URL exists:

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path>
```

Static-only output cannot support visual, interaction, responsive-runtime, or measured-performance claims.

Omit `--out` for diagnose/verify/audit work unless the user requested a report artifact. The harness then uses a unique operating-system temporary directory, returns its absolute path with `outputMode: "temporary"`, and leaves the project untouched. Explicit `--out` with a destination opts into durable output and reports `outputMode: "explicit"`; use it for authorized reports and implementation evidence.

Useful controls:

- Browser proof requires Playwright plus an installed Chromium binary. The harness looks in the target repository's `node_modules`, then `PLAYWRIGHT_PATH` (path to the Playwright package directory) or `PLAYWRIGHT_NODE_MODULES` (path to a `node_modules` directory). If unavailable, runtime coverage is blocked rather than skipped.
- `--actions file`: load one group; fallback name is `default`, overridden by JSON `name`.
- `--action-group name=file`: set a CLI fallback name.
- `--action-group file`: use the filename stem as fallback.
- JSON `name` takes precedence over either fallback.
- `--viewport WIDTHxHEIGHT`: repeat for distinct viewports; passing one replaces defaults and duplicate dimensions are rejected.
- `--wait-until domcontentloaded|load|networkidle|commit`: choose readiness deliberately.
- `--settle-ms N`: add a bounded post-load/action settle period; do not use it to hide missing assertions.
- `--include-advisory`: opt advisory source/runtime signals into gates; leave it off for ordinary objective policy.
- `--detail-capture`: capture runtime artifacts at device scale factor `2`; require it for strict visual-polish, screenshot-critique, icon, alignment, dense-layout, and scrollbar claims.

## Strict Implementation Gate

Use this for a final claim that an editable interface improved:

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --out output/improve-ui/<slug> --action-group main=output/improve-ui/<slug>/main.actions.json --action-group edge=output/improve-ui/<slug>/edge.actions.json --strict --p2-policy systemic --systemic-p2-count 2 --require-runtime --require-change-proof --proof-manifest output/improve-ui/<slug>/proof.json --detail-capture
```

Strict mode blocks:

- objective P0/P1 findings;
- objective P2 findings according to `--p2-policy`;
- invalid target or required runtime/state evidence;
- invalid structured change proof when required;
- failed actions, assertions, or required artifacts;
- other explicit blockers in the report.

Harness P2 policies:

- `systemic` (default): block an objective P2 rule when its rule ID repeats at least the configured count;
- `all`: block every objective P2;
- `none`: do not block objective P2;
- `--systemic-p2-count N`: set the repeat threshold; use `N >= 2`.

`--change-proof <path>` is a strict alias for `--proof-manifest <path>`. It accepts only a JSON file path, never free-form prose.

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

- Require `version` to equal `1`.
- Require a non-empty `claim` string.
- Resolve artifact paths relative to the manifest.
- Require both files to exist.
- Reject artifacts that overlap or alias planned/current harness output by path, canonical target, or physical file identity; a run cannot use its own capture as independent change proof.
- Require each artifact to contain a structurally validated, non-interlaced 8-bit RGB/RGBA PNG with at least `32×32` pixels. Validate chunks, CRCs, compressed image data, media type, and dimensions from bytes rather than the extension.
- Verify SHA-256 against file content.
- Require different before/after hashes; byte-identical artifacts do not evidence a change.
- Require non-empty state.
- Normalize viewport from `WIDTHxHEIGHT` or `{width,height}`.
- Require `kind` to be `viewport`, `full-page`, or `element`; use the default `deviceScaleFactor: 1` or record the actual value up to `8`.
- For `viewport`, require pixels to equal viewport × device scale. For `full-page`, require at least the scaled viewport width and height so real overflow remains inspectable. An `element` artifact remains scoped to that element.
- Require identical before/after state, declared viewport, kind, and device scale. Viewport captures therefore share exact pixel dimensions; full-page or element captures may differ in height/size when the change itself affects layout.
- Keep the claim specific to what the artifacts show.

A valid pair proves comparable artifacts exist; it does not by itself prove the after state is better. Tie the quality judgment to rendered inspection and other relevant evidence.

Use separate manifests for different states or viewports when one pair cannot represent the claim honestly.

## Action Groups And Assertions

Use an object, not a bare action array, for strict runtime evidence:

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

- `click`: `selector`;
- `hover`: `selector`;
- `type`: `selector`, `value`;
- `press`: optional `selector` (defaults to body), `key`;
- `scroll`: optional `x`, `y`;
- `wait`: `ms`.

Assertions:

- `visible` / `hidden`: `selector`;
- `text`: `selector` plus at least one of `equals`, `contains`, `matches` (optional regex `flags`);
- `url`: `equals`, `contains`, or `matches`;
- `attribute`: `selector`, attribute `name`, and value matcher;
- `focused`: `selector`;
- `count`: `selector`, integer `equals`.

Every strict state must contain at least one meaningful assertion and finish successfully. Assert the state users care about, not a generic wrapper that is always present.

Effective action-group names and their normalized artifact filename stems must be unique. The report stores each source file/hash and redacts typed values while retaining their length and SHA-256 for reproducibility.
Optional action/assertion `timeout` values are integer milliseconds from `1` to `60000`; `wait.ms` may be `0`. Invalid objects, unsupported types, duplicate viewports, and malformed regular expressions are CLI errors rather than runtime evidence.

## Async UI Contract

`--async-ui` requires seven successfully executed and asserted groups:

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

Use fixtures, mock routes, request interception, or product state controls to reach each state. Naming groups or passing `--states` does not count as coverage.

Each async group must have state-specific action/assertion evidence; reusing one identical combined action-and-assertion signature under seven different names is blocked.

## Artifacts And Report Layers

Each successful runtime state/viewport must produce separate viewport and full-page artifacts with path, SHA-256, state, viewport, kind, device scale factor, media type, and byte length. Validated change-proof artifacts additionally report pixel dimensions. Use viewport artifacts for fold/hierarchy claims; use full-page artifacts for page rhythm; use device scale factor `2` evidence or focused crops for fine craft.

The ownership marker records only reserved report names and deterministic screenshot paths with SHA-256; if the marker is invalid or any recorded artifact was modified, the harness refuses cleanup before deleting anything. Reusing the same `--out` removes only unchanged files from the validated marker, preserves unrelated user files, and rejects symlink/junction output paths; this prevents stale screenshots from masquerading as current evidence.

The JSON report keeps separate:

- `assessment`: each dimension `unknown|observed`, score `null|0..4`;
- `evidenceCoverage`: static, runtime state/assertion, proof, artifacts, and blockers;
- `expectations`: fixture/regression checks;
- `gates`: objective policy and required-evidence outcomes;
- reproducibility metadata: skill name/version/manifest hash, harness/detector hashes, separate target/harness Git roots/commits/dirty state, Node/platform, browser, configuration, target, and evidence paths.

Inspect `review.json`, generated README, screenshots, and the process exit status. A generated report is not a pass unless its required gates pass.

## Design Dossier

For a material critique, proposal, or redesign handoff, generate both durable views from one manifest:

```powershell
node SKILLS/improve-ui/scripts/generate-design-report.mjs --manifest output/improve-ui/<slug>/report-manifest.json --out output/improve-ui/<slug>/report.html --strict-assets
```

The command also writes `report.md` and lossless `report-assets/`. Follow [references/reporting.md](references/reporting.md) for manifest, annotation, portability, language, and report-quality rules. The harness-generated `README.md` remains a compact machine-run index; it does not replace the dossier.

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
- Require executed assertions for named runtime states.
- Use structured, hash-verified artifacts for strict change proof.
- Keep advisory heuristics out of objective gates.
- Keep uninspected dimensions unknown.
- Record exact commands, exits, artifacts, environment, blockers, and claim limits.
