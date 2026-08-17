# Contributing

Thank you for improving Improve UI. Keep changes focused on existing-interface diagnosis, repair, audit, or verification.

## Local setup

```powershell
corepack enable
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm run check
```

## Pull requests

- Explain the user-facing contract or failure class being changed.
- Update the nearest existing test or fixture when behavior changes.
- Keep source and browser evidence separate; do not turn advisory taste into an automated pass.
- Run `pnpm run check` and `git diff --check` before opening the pull request.
- Preserve the canonical source at `SKILLS/improve-ui`; do not edit junction copies.

Security reports belong in the private process described in [SECURITY.md](SECURITY.md), not in public issues.
