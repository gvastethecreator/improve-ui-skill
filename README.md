# Improve UI

![Improve UI banner](./assets/readme-banner.png)

> Relentless Codex skill pack for frontend polish, UI review, accessibility, motion, typography, and interface hardening.

[![License: MIT](https://shieldcn.dev/badge/license-MIT-yellow.svg?variant=secondary&size=xs)](./LICENSE)
[![Status](https://shieldcn.dev/badge/status-preview-purple.svg?variant=secondary&size=xs)](#status)

Improve UI helps Codex make interfaces materially better from evidence. It routes by surface, task, design register, constraints, and proof so a polish pass can stay small without becoming shallow, and so a review cannot hide behind vague "looks good" commentary.

- Start in relentless mode for improvement, audit, polish, production-readiness, screenshot critique, and visible UI bugs.
- Review product apps, dashboards, marketing pages, visual bugs, and design-system components with screenshot/code cross-reference.
- Produce brutal forensic design roasts when asked for design analysis, then turn top findings into fixes when the repo is editable.
- Run a static detector for common generated-UI and production-readiness issues.
- Use compact references for typography, surfaces, motion, accessibility, performance, state hardening, anti-slop, visual distinction, and proof recipes.
- Keep runtime or screenshot proof attached to frontend changes when available.
- Prefer systemic fixes over repeated one-off patches; P1 and repeated/systemic P2 findings stay red until fixed, blocked, or explicitly deferred.

## Quick Install

Download this repo or ask Codex to install `improve-ui` in your workspace.

## Behavior Contract

The skill is intentionally demanding:

- `relentless-mode.md` defines the default improvement loop, failure conditions, challenge language, and stop rules.
- `forensic-roast.md` defines the screenshot-plus-code design analysis format for audits, roasts, and visual verdicts.
- `audit-score.md` treats detector output as evidence, not design judgment, and keeps low-score/P1/P2 work from being called done too early.
- `checklist.md` is the final guardrail for proof, accessibility, state coverage, motion, and visual-system health.

## Useful Commands

Run the detector against the included fixture:

```powershell
node .\SKILLS\improve-ui\scripts\detect-ui-antipatterns.mjs .\SKILLS\improve-ui\fixtures\deep-review-bad.tsx
```

Run the broader review harness:

```powershell
node .\SKILLS\improve-ui\scripts\run-interface-review.mjs --path <frontend-path> --out .scratch\improve-ui\<slug> --fail-on=P2
```

Run the package smoke used by this repo:

```powershell
node .\SKILLS\improve-ui\scripts\run-interface-review.mjs --path .\SKILLS\improve-ui\fixtures\deep-review-bad.tsx --out .scratch\improve-ui-readme-smoke --fail-on=P0
```

## What's Inside

- [`SKILL.md`](./SKILLS/improve-ui/SKILL.md): router and output contract.
- [`relentless-mode.md`](./SKILLS/improve-ui/relentless-mode.md): required execution stance and iteration loop.
- [`forensic-roast.md`](./SKILLS/improve-ui/forensic-roast.md): brutal screenshot/code design analysis format.
- [`scripts/`](./SKILLS/improve-ui/scripts): static detector and review harness.
- [`*.md`](./SKILLS/improve-ui): focused references for typography, surfaces, animation, performance, hardening, audits, visual distinction, proof, and real-data resilience.

## Health Checks

From this repo:

```powershell
git diff --check
node .\SKILLS\improve-ui\scripts\run-interface-review.mjs --path .\SKILLS\improve-ui\fixtures\deep-review-bad.tsx --out .scratch\improve-ui-readme-smoke --fail-on=P0
```

From the canonical skills workspace when this repo is linked into an `agents-matrix` checkout:

```powershell
ruby scripts\validate-skills
.\scripts\sync-global-skills.ps1 -DryRun
```

## Status

Preview skill pack.

- Static detector and fixture are included.
- Browser/runtime proof depends on the target project being runnable.
- Motion and visual recommendations must be verified on the real UI before being called done, or reported as blocked.

## License

MIT.
