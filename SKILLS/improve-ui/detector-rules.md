# Detector Rules

Use this file when a local code scan can catch objective UI anti-patterns before or during visual review. Keep the local detector small, deterministic, and dependency-free.

Run the bundled scanner when you have local frontend files:

```powershell
node SKILLS/improve-ui/scripts/detect-ui-antipatterns.mjs <file-or-directory>
```

For machine-readable output:

```powershell
node SKILLS/improve-ui/scripts/detect-ui-antipatterns.mjs --json <file-or-directory>
```

For gated deep review:

```powershell
node SKILLS/improve-ui/scripts/detect-ui-antipatterns.mjs --json --fail-on=P1 --out output/improve-ui/<slug>/static-findings.json <file-or-directory>
```

Useful flags:

- `--fail-on=P1|P2|P3`: exit nonzero when matching or worse findings exist.
- `--format=text|md|json`: choose report format.
- `--out <file>`: write report to disk.
- `--allowlist <json>`: suppress known finding fingerprints.
- `--baseline <json>`: suppress existing findings from earlier JSON output.
- `--changed-only`: scan only changed Git files inside the target.
- `--category <name>`: filter by category or rule id.
- `--gpt` / `--gemini`: enable provider-specific generated-UI signals.

Full harness:

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --out output/improve-ui/<slug> --fail-on=P1
```

Strict harness gates:

```powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --out output/improve-ui/<slug> --require-runtime --require-change-proof --change-proof "before/after proof captured for changed main path and one edge state" --fail-verdict=good
```

Runtime-only harness signals include:

- `low-contrast-text`: visible text fails runtime contrast sampling.
- `offscreen-running-animation`: visible page has animations running outside the sampled viewport.
- `offscreen-active-canvas`: canvas/WebGL area is marked active while outside the sampled viewport.

Smoke-test flags for harness maintenance:

- `--expect-finding <id>`: fail if a known fixture finding disappears unexpectedly.
- `--expect-verdict <verdict>`: fail if the review score changes unexpectedly.
- `--fail-verdict=<verdict>`: fail if the verdict is below a required bar.
- `--require-runtime`: fail when runtime/browser proof is missing.
- `--require-change-proof --change-proof "<note>"`: require a named before/after or equivalent proof note.
- `--action-group state=actions.json`: run named interaction states and save state-specific screenshots.

The detector is a starting signal, not a verdict. Confirm important findings visually or in code before reporting them.

## Included Rules

Slop and taste signals:

- `gradient-text`: gradient clipped into text.
- `side-stripe-border`: thick one-sided accent border.
- `purple-blue-gradient`: reflex purple, violet, blue, cyan, or pink gradient.
- `cream-surface`: warm-neutral body or token names chosen by reflex.
- `nested-card-copy`: likely nested card structure.
- `icon-tile-stack`: rounded icon tile stacked above a heading.
- `oversized-radius`: `32px+` radius on cards/panels/inputs.
- `wide-shadow-border`: hairline border plus wide soft shadow.
- `repeating-stripes`: repeating stripe gradient decoration.
- `glass-default`: backdrop blur/glass treatment.
- `heavy-blur-effect`: `20px+` blur or backdrop blur that needs a functional material/crossfade reason and runtime proof.
- `hero-eyebrow`: tracked uppercase eyebrow near hero heading.
- `bounce-easing`: bounce, elastic, wobble, jiggle, or overshoot easing.
- `marketing-buzzword`: generic SaaS copy.
- `scaffold-label`: visible labels such as Section 01, Stage 1, or Question 05 used as generic structure.
- `generic-placeholder-data`: default names, companies, lorem ipsum, or fake customer data.
- `fake-product-preview`: div-based mock dashboard/browser/terminal previews standing in for real product evidence.
- `fake-version-metadata`: decorative version, branch, sync, or build metadata that does not carry product meaning.

Quality signals:

- `transition-all`: broad property transition.
- `layout-transition`: width, height, margin, padding, top, or left transition.
- `ease-in-ui-motion`: `ease-in` on UI entry/opening or class usage.
- `scale-zero-entry`: `scale(0)` or `scale-0` entry risk.
- `center-origin-anchored-motion`: trigger-anchored surfaces scaling from center.
- `keyframes-dynamic-ui`: keyframes near rapidly-triggered UI such as toasts, toggles, menus, drawers.
- `long-ui-duration`: UI motion over `300ms` that needs explicit justification.
- `framer-motion-shorthand-risk`: Motion `x`/`y`/`scale` shorthand on potentially busy-page motion.
- `parent-css-var-transform-risk`: parent/root CSS variables driving transform-like child motion.
- `ungated-hover-motion`: hover motion without `(hover: hover) and (pointer: fine)`.
- `gesture-missing-pointer-capture`: pointer-driven drag/swipe code without `setPointerCapture`.
- `layout-read-write-risk`: layout reads near DOM writes or state writes.
- `will-change-broad`: broad or layout-heavy `will-change`.
- `will-change-mass-layering`: many `will-change` hints in one file.
- `expensive-effect-list-risk`: filters, blur, or large shadows inside repeated render patterns.
- `missing-img-alt`: image without `alt`.
- `missing-img-dimensions`: image without reserved dimensions.
- `empty-img-src`: empty or placeholder image source.
- `button-name-risk`: empty/icon-only button without accessible name.
- `interactive-div`: clickable `div`/`span` without role.
- `nowrap-risk`: `white-space: nowrap` or `whitespace-nowrap` without obvious overflow handling.
- `fixed-width-mobile-risk`: large fixed widths that may break mobile.
- `tiny-text`: text smaller than `12px`.
- `all-caps-body`: uppercase transform likely applied beyond short labels.
- `z-index-overlay-risk`: very high z-index values.
- `hardcoded-color-drift`: literal color values where tokens may be expected.
- `missing-reduced-motion-guard`: motion in a file without `prefers-reduced-motion`.
- `missing-reduced-transparency-fallback`: blurred/translucent chrome without `prefers-reduced-transparency`, `prefers-contrast`, or `forced-colors` fallback.

Provider-gated signals:

- `gpt-thin-border-wide-shadow`: enabled by `--gpt`.
- `gpt-repeating-stripes`: enabled by `--gpt`.
- `gemini-image-hover-transform`: enabled by `--gemini`.

## How To Use Findings

- Treat contrast, missing alt, broad transitions, layout transitions, and overflow as quality issues first.
- Treat blurred material findings as design/performance/accessibility findings together: ask whether the surface is functional chrome, whether text remains readable, and whether a solid/high-contrast fallback exists.
- Treat gesture findings as review prompts: verify pointer-down response, 1:1 tracking, grab offset, pointer capture, velocity handoff, and interruption before approving.
- Treat slop signals as design findings only after checking register and intent.
- Group repeated findings by pattern.
- Do not report generated-file or dependency findings unless the user explicitly asks.
- Prefer fixing primitives/tokens if many findings share the same source.

## False Positive Rules

Ignore a finding when:

- The pattern belongs to a documented design system.
- The file is generated, vendored, fixture-only, or test-only.
- The pattern is isolated and clearly intentional.
- A slop rule conflicts with product-register trust and the product-register choice is better for users.
- The finding is inside a deliberately scoped motion primitive whose local component docs require that layout property or overshoot easing. Verify the actual interaction before escalating.
- `gesture-missing-pointer-capture` appears in non-drag pointer tracking, such as hover sensors, drawing canvases with their own capture model, or library wrappers that capture internally.
- `missing-reduced-transparency-fallback` appears on purely decorative blur that is removed or hidden in the real rendered state; still prefer deleting decorative blur.
- `long-ui-duration`, bounce, and layout-animation findings are allowed only when frequency, spatial distance, containment, and visual proof justify them.

## Escalation

- P1: missing alt on meaningful images, low contrast found elsewhere, layout transition causing jank, `ease-in` entry, `scale(0)` entry, text overflow that breaks core flow.
- P2: repeated visual tells, drift from tokens, repeated generic copy, nested cards, broad transition helpers, ungated hover motion, missing reduced-motion path, keyframes on rapidly-triggered UI.
- P2: blurred functional chrome without reduced-transparency/contrast fallback, heavy blur in repeated content, gesture motion that jumps, loses pointer, or ignores velocity when the gesture is central.
- P3: isolated stylistic tells with low user impact.
