# Proof Recipes

Use this when the task needs evidence beyond "I changed the code": interaction fixes, responsive fit, async states, motion/performance, reference-led visual work, broad polish, or any final claim a reviewer could challenge.

The job is to pick the smallest proof that can support the claim. More screenshots are not better if they do not inspect a meaningful state.

## Pick A Recipe

- Static-only code review: run the detector, inspect files/lines manually, and state runtime proof is blocked when no URL/app is available.
- Visual bug/regression: capture before state when possible, reproduce the failing viewport/state, patch, then capture the same viewport/state after.
- Component polish: inspect default, hover/focus/disabled, long text, narrow width, and one edge state.
- Product app/dashboard: inspect desktop and mobile or narrow container, long content, empty/loading/error/permission where relevant, keyboard/focus basics, and one high-density state.
- Marketing/landing/pricing: inspect first viewport, proof/product section, CTA/pricing decision point, and mobile. Use reference/after or before/after artifacts when visual quality is the claim.
- Interaction/motion: inspect the trigger, interrupted/repeated trigger, reduced motion, hover gating, transform origin, duration/easing, and runtime frame/console signals when a URL exists.
- Async/data UI: inspect empty, loading, error, permission, long-content, slow-network, and rapid-click states, or state why a subset is scoped.
- Immersive canvas/WebGL/3D: inspect visible render, mobile/narrow render, reduced motion/fallback, offscreen pause, cleanup/disposal path, console/WebGL errors, and foreground readability.
- Reference-led work: record source/reference, extracted system, what was copied/adapted/rejected, and after proof against the same target read.

## Harness Basics

Use the full harness when local files or a runnable URL exist:

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --out output/improve-ui/<slug> --fail-on=P1
```

Use static only when no URL is available:

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path> --out output/improve-ui/<slug> --fail-on=P1
```

Use async coverage listing when the task is an async/data UI:

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --async-ui --states empty,loading,error,permission,long-content,slow-network,rapid-click --out output/improve-ui/<slug>
```

The `--states` list is a contract marker; it does not magically navigate the app. Pair it with screenshots, local fixtures, route params, mock toggles, or action files that actually reach those states.

## Action Files

Use an action file when the proof depends on an interaction after page load.

```json
[
  { "type": "click", "selector": "[data-testid='open-menu']" },
  { "type": "wait", "ms": 250 },
  { "type": "hover", "selector": "[data-testid='danger-action']" },
  { "type": "press", "selector": "body", "key": "Escape" },
  { "type": "scroll", "y": 800 }
]
```

Supported actions:

- `click`: selector
- `hover`: selector
- `type`: selector plus `value`
- `press`: selector plus `key`; selector defaults to `body`
- `scroll`: `x` and/or `y`
- `wait`: `ms`

Run:

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --actions output/improve-ui/<slug>/actions.json --out output/improve-ui/<slug>
```

For multiple states, prefer multiple small runs with clear slugs over one vague action chain:

- `output/improve-ui/<slug>-default`
- `output/improve-ui/<slug>-menu-open`
- `output/improve-ui/<slug>-error`
- `output/improve-ui/<slug>-mobile`

## Evidence Ledger

For final reporting, name:

- Command: exact command or reason unavailable.
- Path: `output/improve-ui/<slug>/review.json`, README, screenshots, test logs, or manual artifact path.
- Viewport/state: e.g. `1280x800 default`, `390x844 menu open`, `pricing annual`, `error state`.
- Finding support: detector rule, file/line, screenshot state, console/runtime metric, or manual observation.
- Claim limit: what the evidence does not prove.

## Blocked Proof Language

Use direct language when evidence is unavailable:

- `Runtime proof blocked: no runnable URL was available. Static detector and source inspection ran.`
- `Visual proof blocked: Playwright/browser runtime was unavailable. Code and detector checks passed; UI fit remains unverified.`
- `State proof scoped: loading and error states were inspected; permission and slow-network states require fixtures not present in this repo.`
- `Performance claim limited: source removes broad work, but no before/after runtime trace was captured.`

Do not upgrade a blocked claim into `verified`, `complete`, `production-ready`, or `deep review`.

## Done

- The proof recipe matches the task and final claim.
- At least one main path and one relevant edge/recovery state are inspected for nontrivial UI changes.
- Visual claims cite before/after, reference/after, or explicit blocker.
- Runtime, static, and manual proof limits are clear enough that a later reviewer can reproduce or challenge them.
