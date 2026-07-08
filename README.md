# Improve UI

![Improve UI banner](./assets/readme-banner.png)

> Codex skill pack for frontend polish, UI review, accessibility, motion, typography, and interface hardening.

[![License: MIT](https://shieldcn.dev/badge/license-MIT-yellow.svg?variant=secondary&size=xs)](./LICENSE)
[![Status](https://shieldcn.dev/badge/status-preview-purple.svg?variant=secondary&size=xs)](#status)

Improve UI helps Codex make interfaces better from evidence. It routes by surface, task, design register, constraints, and proof so a polish pass can stay small without becoming shallow.

- Review product apps, dashboards, marketing pages, visual bugs, and design-system components.
- Run a static detector for common generated-UI and production-readiness issues.
- Use compact references for typography, surfaces, motion, accessibility, performance, and state hardening.
- Keep runtime or screenshot proof attached to frontend changes when available.
- Prefer systemic fixes over repeated one-off patches.

## Quick Install

Download this repo or ask Codex to install `improve-ui` in your workspace.

## Useful Commands

Run the detector against the included fixture:

```powershell
node .\SKILLS\improve-ui\scripts\detect-ui-antipatterns.mjs .\SKILLS\improve-ui\fixtures\deep-review-bad.tsx
```

Run the broader review harness:

```powershell
node .\SKILLS\improve-ui\scripts\run-interface-review.mjs --path <frontend-path> --out output/improve-ui/<slug>
```

## What's Inside

- [`SKILL.md`](./SKILLS/improve-ui/SKILL.md): router and output contract.
- [`scripts/`](./SKILLS/improve-ui/scripts): static detector and review harness.
- [`*.md`](./SKILLS/improve-ui): focused references for typography, surfaces, animation, performance, hardening, and audits.

## Status

Preview skill pack.

- Static detector and fixture are included.
- Browser/runtime proof depends on the target project being runnable.
- Motion and visual recommendations should be verified on the real UI before shipping.

## License

MIT.
