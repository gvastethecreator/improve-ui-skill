# Dependency review — 2026-08-15

- Migrated the repository from npm lockfiles/scripts to pnpm 11.21.0; no Bun runtime was found.
- Updated `playwright` from 1.61.1 to 1.62.1 and regenerated `pnpm-lock.yaml`.
- Playwright 1.62.1 is the current registry release at review time. Review the upstream release notes before the next browser-major update: <https://github.com/microsoft/playwright/releases>.
- The skill remains dependency-light; browser tests are the only installed package surface.
