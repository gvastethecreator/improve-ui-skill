<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/header/document.svg?title=Improve+UI&subtitle=Keep+the+product.+Remove+the+friction.&logo=wand2&theme=blue&align=center&mode=dark" />
    <img alt="Improve UI — keep the product, remove the friction" src="https://shieldcn.dev/header/document.svg?title=Improve+UI&subtitle=Keep+the+product.+Remove+the+friction.&logo=wand2&theme=blue&align=center&mode=light" />
  </picture>
</p>

> Evidence-gated Codex skill for diagnosing, repairing, auditing, and verifying an existing web interface.

<p align="center">
  <a href="https://github.com/gvastethecreator/improve-ui-skill/actions/workflows/ci.yml"><img alt="CI status" src="https://shieldcn.dev/github/ci/gvastethecreator/improve-ui-skill.svg?workflow=ci&branch=main&variant=secondary&size=xs" /></a>
  <a href="https://gvastethecreator.github.io/improve-ui-skill/"><img alt="Project site" src="https://shieldcn.dev/badge/site-pages-1857c9.svg?logo=githubpages&variant=branded&size=xs" /></a>
  <a href="./SKILLS/improve-ui/skill-manifest.json"><img alt="Version 0.3.1" src="https://shieldcn.dev/badge/version-0.3.1-blue.svg?variant=secondary&size=xs" /></a>
  <a href="https://agentskills.io/"><img alt="Agent Skills compatible" src="https://shieldcn.dev/badge/Agent+Skills-compatible-111111.svg?variant=secondary&size=xs" /></a>
  <a href="https://github.com/gvastethecreator/improve-ui-skill/stargazers"><img alt="GitHub stars" src="https://shieldcn.dev/github/stars/gvastethecreator/improve-ui-skill.svg?variant=secondary&size=xs" /></a>
  <a href="LICENSE"><img alt="MIT license" src="https://shieldcn.dev/github/license/gvastethecreator/improve-ui-skill.svg?variant=secondary&size=xs" /></a>
</p>

[Project site](https://gvastethecreator.github.io/improve-ui-skill/) · [Install](#install) · [Operating contract](#operating-contract) · [Contributing](CONTRIBUTING.md)

Improve UI starts from a real product surface: editable source, a screenshot, a route, a component, or a running app. It preserves working product contracts, fixes the smallest systemic cause authorized by the request, and limits every completion claim to evidence that actually ran.

Scope covers existing web HUD, overlay, fallback, and integration quality, plus other existing web interfaces. Blank-canvas design, native UI, formal accessibility certification, and specialist renderer/game/3D-system implementation require their matching skills.

## Operating Contract

- Diagnose, verify, audit, review, critique, and roast requests are read-only unless the user also authorizes changes; durable reports are created only when requested.
- Improve, fix, polish, implement, and harden requests edit the scoped source and verify the result.
- Neutral forensic language is the default; roast tone is explicit opt-in.
- Objective technical defects can gate. Taste heuristics remain advisory until a human confirms them in context.
- Missing targets, failed runtime states, invalid proof, and uninspected dimensions never become a pass.
- Static analysis, evidence coverage, quality assessment, and regression expectations stay separate.
- UI copy and report prose preserve product voice and sourced facts; named writing patterns remain advisory unless project policy makes them a gate.

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

Generate a durable visual dossier for a material critique, proposal, or redesign. One manifest produces ingestion-first Markdown, standalone HTML, and lossless local evidence assets:

```text
node ./SKILLS/improve-ui/scripts/generate-design-report.mjs --manifest output/improve-ui/<slug>/report-manifest.json --out output/improve-ui/<slug>/report.html --strict-assets
```

The screenshot markers, legends, evidence zooms, and Markdown geometry share exact identities; invalid stage, subject, asset, or coordinate mappings fail closed. See [reporting.md](./SKILLS/improve-ui/references/reporting.md).

## Executable Calibration Cases

The golden examples are backed by source fixtures rather than fictional result claims:

- [component polish](./SKILLS/improve-ui/fixtures/cases/component-polish/case.json)
- [dashboard surgery](./SKILLS/improve-ui/fixtures/cases/dashboard-surgery/case.json)
- [landing repair](./SKILLS/improve-ui/fixtures/cases/landing-repair/case.json)

Each case contains `before/`, `after/`, and the exact detector findings expected to disappear. The repository tests execute both sides.

## Develop And Verify

Node 20.11 or newer is required for repository verification. The installed static detector itself has no third-party runtime dependency; browser proof loads Playwright explicitly when available.

```powershell
pnpm install --frozen-lockfile
npx playwright install chromium
pnpm run check:full
```

Useful focused commands:

```powershell
pnpm run validate
pnpm run validate:evals
pnpm run test:core
pnpm run test:browser
pnpm run test:full
pnpm run check:core
pnpm run check:full
git diff --check
```

`test:core` and `check:core` cover every non-browser contract without requiring Playwright. `test:browser` and `check:full` preflight both the Playwright package and Chromium; when either is absent they stop with install instructions instead of presenting a partial suite as a product regression or a complete gate. `test:unit` remains an alias for `test:core`.

The contract scenario suite in [evals/scenarios.json](./evals/scenarios.json) covers positive and negative routing, read-only authority, all three profiles, explicit roast, unavailable runtime, named-only states, invalid proof, advisory taste, and formal-compliance boundaries. Its structural validator does not pretend to grade an agent; [evals/README.md](./evals/README.md) describes leakage-free forward testing.

CI runs validation and the full test suite on Windows and Ubuntu with Node 20 and 24.

## Canonical Source And Local Junctions

`SKILLS/improve-ui` is the only editable skill directory. On a maintainer machine, `agents-matrix`, `.agents`, and `.codex` must be direct junctions to that directory. Never edit or synchronize a second physical copy: copies drift and a mirror conflicts with the active junction topology.

Consumer copy installs remain separate release artifacts; do not use them as a maintainer update path.

## Package Map

- [SKILL.md](./SKILLS/improve-ui/SKILL.md): compact trigger, authority, profile, routing, and output contract.
- [`references/`](./SKILLS/improve-ui/references): progressive domain guidance for context, geometry, authorship, copy, motion, and synchronized reporting.
- [detector-rules.md](./SKILLS/improve-ui/detector-rules.md): detector taxonomy, confidence, suppression, and baseline behavior.
- [proof-recipes.md](./SKILLS/improve-ui/proof-recipes.md): executable CLI and evidence schemas.
- [`templates/`](./SKILLS/improve-ui/templates): surgical read, surgery log, and evidence ledger records.
- [checklist.md](./SKILLS/improve-ui/checklist.md): one canonical final quality gate.
- [`examples/`](./SKILLS/improve-ui/examples): worked routes linked to executable fixtures.
- [`scripts/`](./SKILLS/improve-ui/scripts): dependency-free detector/report generator and optional-Playwright review harness.

## Limits

- Regex findings are triage signals, not a parser, visual judgment, or accessibility certification.
- A clean automated run means enabled checks found no matching defect in reached states; it does not prove overall interface quality.
- Browser emulation is not physical-device evidence, and local samples are not field performance data.
- Visual, motion, keyboard, screen-reader, content, and device claims require the corresponding evidence or must remain `unknown`/blocked.

## License

MIT. See [LICENSE](./LICENSE).

## Support

If Improve UI saves you review time, you can support continued maintenance through [GitHub Sponsors](https://github.com/sponsors/gvastethecreator) or [Ko-fi](https://ko-fi.com/gvaste).
