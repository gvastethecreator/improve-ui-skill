# Improve UI

![Improve UI banner](./assets/readme-banner.png)

> Evidence-gated Codex skill for diagnosing, repairing, auditing, and verifying an existing web interface.

[![License: MIT](https://shieldcn.dev/badge/license-MIT-yellow.svg?variant=secondary&size=xs)](./LICENSE)
[![Version](https://shieldcn.dev/badge/version-0.2.0-blue.svg?variant=secondary&size=xs)](./SKILLS/improve-ui/skill-manifest.json)

Improve UI starts from a real product surface: editable source, a screenshot, a route, a component, or a running app. It preserves working product contracts, fixes the smallest systemic cause authorized by the request, and limits every completion claim to evidence that actually ran.

It is not a blank-canvas design skill, a native UI specialist, a formal accessibility-certification tool, or a specialist renderer/game/3D-system implementation skill. Existing web HUD, overlay, fallback, and integration-quality work remains in scope.

## Operating Contract

- Diagnose, verify, audit, review, critique, and roast requests are read-only unless the user also authorizes changes; durable reports are created only when requested.
- Improve, fix, polish, implement, and harden requests edit the scoped source and verify the result.
- Neutral forensic language is the default; roast tone is explicit opt-in.
- Objective technical defects can gate. Taste heuristics remain advisory until a human confirms them in context.
- Missing targets, failed runtime states, invalid proof, and uninspected dimensions never become a pass.
- Static analysis, evidence coverage, quality assessment, and regression expectations stay separate.

The skill selects one proportional profile:

| Profile | Use it for | Evidence bar |
|---|---|---|
| `micro` | One isolated defect | Same relevant state; same viewport when visual |
| `focused` | One component, surface, or flow | Main path plus one relevant edge/recovery state |
| `deep` | Broad/systemic or production-readiness work | Applicable dimensions, viewports, and executed state matrix |

## Install

Install with the Skills CLI:

```powershell
npx skills add gvastethecreator/improve-ui-skill --skill improve-ui
```

Or clone the repository and install `SKILLS/improve-ui` through your Codex skill workflow.

## Quick Start

Run objective source checks. `--strict` blocks high-confidence objective P0/P1 findings; advisory visual heuristics do not fail by default.

```text
node ./SKILLS/improve-ui/scripts/detect-ui-antipatterns.mjs --json --strict <frontend-path>
```

Produce a static review report when no runtime is available:

```text
node ./SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path>
```

Omit `--out` for read-only diagnostics: the harness writes to a unique operating-system temporary directory and reports its path. Pass explicit `--out` with a destination only when a durable report or implementation evidence is authorized.

Exercise a running state at explicit viewports:

```text
node ./SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --action-group main=output/improve-ui/<slug>/main.actions.json --viewport 1280x800 --viewport 390x844 --require-runtime --strict --out output/improve-ui/<slug>
```

For a final implementation claim, add a structured, hash-verified before/after manifest:

```text
node ./SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --action-group main=output/improve-ui/<slug>/main.actions.json --strict --require-runtime --require-change-proof --proof-manifest output/improve-ui/<slug>/proof.json --out output/improve-ui/<slug>
```

The exact action, assertion, async-state, proof-manifest, P2-policy, and report schemas live in [proof-recipes.md](./SKILLS/improve-ui/proof-recipes.md). `--change-proof` is a path-only alias for `--proof-manifest`; free-form prose is not proof.

## Executable Calibration Cases

The golden examples are backed by source fixtures rather than fictional result claims:

- [component polish](./SKILLS/improve-ui/fixtures/cases/component-polish/case.json)
- [dashboard surgery](./SKILLS/improve-ui/fixtures/cases/dashboard-surgery/case.json)
- [landing repair](./SKILLS/improve-ui/fixtures/cases/landing-repair/case.json)

Each case contains `before/`, `after/`, and the exact detector findings expected to disappear. The repository tests execute both sides.

## Develop And Verify

Node 20.11 or newer is required for repository verification. The installed static detector itself has no third-party runtime dependency; browser proof loads Playwright explicitly when available.

```powershell
npm ci
npx playwright install chromium
npm run check
```

Useful focused commands:

```powershell
npm run validate
npm run validate:evals
npm run test:unit
npm run test:browser
git diff --check
```

The contract scenario suite in [evals/scenarios.json](./evals/scenarios.json) covers positive and negative routing, read-only authority, all three profiles, explicit roast, unavailable runtime, named-only states, invalid proof, advisory taste, and formal-compliance boundaries. Its structural validator does not pretend to grade an agent; [evals/README.md](./evals/README.md) describes leakage-free forward testing.

CI runs validation and the full test suite on Windows and Ubuntu with Node 20 and 22.

## Canonical Payload And Active Mirror

`SKILLS/improve-ui` is the canonical payload. Use the scoped mirror tool to detect or apply drift without touching unrelated files in the destination repository:

```text
node ./scripts/sync-skill-mirror.mjs --source ./SKILLS/improve-ui --target <agents-matrix-path>/skills/improve-ui --check --json
node ./scripts/sync-skill-mirror.mjs --source ./SKILLS/improve-ui --target <agents-matrix-path>/skills/improve-ui --write --json
```

The tool compares every file, reports a deterministic SHA-256 tree hash, removes only stale files inside the explicitly named `improve-ui` target, and verifies convergence after writing.

## Package Map

- [SKILL.md](./SKILLS/improve-ui/SKILL.md): compact trigger, authority, profile, routing, and output contract.
- [`references/`](./SKILLS/improve-ui/references): progressive domain guidance and the source/provenance ledger.
- [detector-rules.md](./SKILLS/improve-ui/detector-rules.md): detector taxonomy, confidence, suppression, and baseline behavior.
- [proof-recipes.md](./SKILLS/improve-ui/proof-recipes.md): executable CLI and evidence schemas.
- [`templates/`](./SKILLS/improve-ui/templates): surgical read, surgery log, and evidence ledger records.
- [checklist.md](./SKILLS/improve-ui/checklist.md): one canonical final quality gate.
- [`examples/`](./SKILLS/improve-ui/examples): worked routes linked to executable fixtures.
- [`scripts/`](./SKILLS/improve-ui/scripts): dependency-free static detector and optional-Playwright review harness.

## Limits

- Regex findings are triage signals, not a parser, visual judgment, or accessibility certification.
- A clean automated run means enabled checks found no matching defect in reached states; it does not prove overall interface quality.
- Browser emulation is not physical-device evidence, and local samples are not field performance data.
- Visual, motion, keyboard, screen-reader, content, and device claims require the corresponding evidence or must remain `unknown`/blocked.

## License

MIT. See [LICENSE](./LICENSE).
