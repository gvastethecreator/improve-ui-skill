# Design Dossiers: Markdown + HTML

Material critique, screenshot review, improvement or redesign proposal. One decision artifact, two views: Markdown for ingestion/correction; HTML for visual inspection. Both carry evidence, diagnosis, moves, preservation contract, and proof targets.

## Contents

- [Required artifacts](#required-artifacts)
- [Choose the report mode](#choose-the-report-mode)
- [Manifest contract](#manifest-contract)
- [Screenshot discipline](#screenshot-discipline)
- [Content order](#content-order)
- [Report quality gate](#report-quality-gate)

Skip tiny implementation notes, routine status, or code-only work with no visual proposal. Generate if the user must evaluate, approve, compare, hand off, or continue later.

## Required Artifacts

Persist the dossier:

- report-manifest.json: structured, reviewable source;
- report.md: deterministic, ingestion-first report with explicit evidence geometry;
- report-assets/: lossless local evidence referenced by report.md;
- report.html: standalone visual dossier with full-image overlays and annotation zooms.

Manifest is source of truth. Generate both views in one command. Never hand-edit one report into a different conclusion.

Bundled generator:

~~~powershell
node SKILLS/improve-ui/scripts/generate-design-report.mjs --manifest output/improve-ui/<slug>/report-manifest.json --out output/improve-ui/<slug>/report.html --strict-assets
~~~

Writes `report.md` and `report.html` from the same normalized manifest. Alternate: `--markdown-out <path.md>`.

Harness emits `report.md`, `report-assets/`, and `report.html` beside `review.json` and its `README.md`:

~~~powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --out output/improve-ui/<slug> --detail-capture
~~~

Strict assets for the final dossier. Missing or corrupt capture: draft may show an explicit evidence placeholder and warning. Never let a broken-image icon masquerade as evidence.

Local PNG, JPEG, GIF, WebP, AVIF embed in HTML by default; copied byte-for-byte into `report-assets/` for Markdown. Markdown never gets a data URI. External image URLs fail in strict mode (non-portable). Draft renders a sanitized evidence placeholder in both reports and never fetches them. The no-embed-images flag affects HTML draft only; Markdown still gets local sidecar evidence. If HTML will break after moving away from linked files, disclose that.

## Choose The Report Mode

- **critique**: lead with dominant failure, severity-ranked causes, exact fixes, do-not-break contract, cuts, and proof limits.
- **proposal**: lead with context and decision, show incompatible directions, select one, explain what it kills, and state assets/states/proof needed.
- **redesign**: combine before evidence, systemic diagnosis, selected direction, replacement system, migration moves, preservation contract, and before/after proof plan.

Visual layout can stay the forensic dossier; information order changes by mode. Do not invent three decorative templates.

## Manifest Contract

The generator accepts version 1:

~~~json
{
  "version": 1,
  "language": "es-AR",
  "mode": "redesign",
  "title": "Operations command center",
  "eyebrow": "DESIGN CASE 017",
  "verdict": {
    "severity": "P1",
    "label": "Hierarchy failure",
    "summary": "The alert lane and ambient telemetry compete for the same attention."
  },
  "context": {
    "archetype": "operator cockpit",
    "userMode": "continuous monitoring under pressure",
    "primaryArtifact": "incident queue",
    "proofTarget": "triage at desktop and narrow viewport"
  },
  "summary": [
    "The redesign turns a card wall into a decision surface."
  ],
  "screenshots": [],
  "findings": [],
  "directions": [],
  "actions": [],
  "preserve": [],
  "proof": [],
  "risks": [],
  "limitations": [],
  "metadata": {
    "generated": "2026-07-16",
    "target": "local route"
  }
}
~~~

Text fields: plain text and line breaks, not trusted HTML. Generator escapes titles, findings, labels, metadata, and other user-controlled content.

Language: BCP 47-style tag. English and Spanish include built-in report chrome. Spanish regional tags use Spanish labels. Other language: a labels object that overrides chrome; keep values plain text. Dossier follows the user's language.

### Verdict severities

blocker, P1, P2, P3, or info. Severity is dominant evidenced risk, not effort.

### Screenshots

~~~json
{
  "id": "before-default",
  "src": "screenshots/before-default.png",
  "alt": "Current command center with equal-weight panels",
  "label": "Before · default",
  "stage": "before",
  "caption": "Same authenticated fixture used for the redesign.",
  "state": "default",
  "viewport": "1280×800",
  "annotations": [
    {
      "x": 12.5,
      "y": 20,
      "width": 30,
      "height": 18,
      "subject": "Equal-weight incident cards",
      "label": "Repeated panels erase operational priority.",
      "tone": "error"
    },
    {
      "x": 80,
      "y": 12,
      "subject": "Detached action status",
      "label": "The visible status is separated from the action it governs.",
      "tone": "warning"
    }
  ]
}
~~~

Coordinates are percentages from screenshot top-left. Point: x and y. Box also supplies width and height. Values 0–100; boxes must stay inside the screenshot.

`stage` is required: `before`, `reference`, `proposal`, `after`, or `detail`. Tones: error, warning, proposal, or note. Proposal tone is invalid on before/reference evidence: annotate only what is visible; put the proposed move in directions/actions or on an actual proposal/after image.

`subject` is required: the literal element or region inside the marker, such as `Panel LIVE ALERTS`, `Row 04 · payment-core`, or `Recovery button`. `label` states the visible condition and why it matters. Numbered overlays render both in the matching legend. When image dimensions are available, each legend entry also renders an automatic context-padded evidence zoom from the same coordinates and source. Markdown records the same subject, tone, claim, and normalized geometry.

### Annotation calibration

Do not estimate percentages from memory or a thumbnail. Per marker:

1. inspect the source at native resolution; record pixel width and height;
2. identify the exact pixel rectangle or point of the named subject;
3. convert with `x% = leftPx / imageWidth × 100`, `y% = topPx / imageHeight × 100`, and the equivalent formula for width/height;
4. generate the dossier; inspect the full rendered screenshot plus every automatic evidence zoom at readable scale;
5. read each legend item, trace its number to the full image, and compare Markdown geometry. Fail if any view points to a different subject, or if the description claims anything not visible inside or immediately adjacent.

One marker, one literal subject. Split broad claims across focused crops or multiple markers. A box spanning unrelated panels is decorative, not evidence.

### Findings

~~~json
{
  "id": "flat-priority",
  "severity": "P1",
  "title": "Every panel shouts at the same volume",
  "evidence": "Six first-viewport panels share surface, heading, and spacing treatment.",
  "damage": "Operators must read every region before identifying the next decision.",
  "cause": "The composition inventories widgets instead of modeling incident flow.",
  "solution": "Build one incident spine and move ambient metrics to a quiet rail.",
  "roast": "The command center is organized like a sticker collection.",
  "screenshotId": "before-default"
}
~~~

Every finding needs evidence, damage, cause, exact solution. Roast is optional and must be earned. screenshotId must reference a supplied screenshot.

### Directions

~~~json
{
  "name": "Incident spine",
  "status": "selected",
  "thesis": "One vertical decision sequence owns the first scan.",
  "signature": "Evidence is stitched directly into each escalation.",
  "why": "It matches the operator task and survives live updates."
}
~~~

Use selected, rejected, or explored. Directions must be incompatible at IA, composition, or interaction. Palette-only variations are not directions.

### Actions

~~~json
{
  "priority": "01",
  "title": "Rebuild the first viewport around incident priority",
  "detail": "Replace the equal panel matrix with an incident spine and one telemetry rail.",
  "proof": "A five-second test identifies incident, owner, severity, and next action."
}
~~~

Order moves by user damage. Do not pad to fixed number.

### Proof ledger

~~~json
{
  "label": "Recovery state",
  "status": "blocked",
  "detail": "No recovery fixture was supplied.",
  "artifact": "actions-recovery.json"
}
~~~

Use passed, failed, blocked, n/a, or unknown. Artifact can name a capture, command, route, state, source line, or test. Do not mark captured evidence as passed unless inspected or compared.

## Screenshot Discipline

Every screenshot records:

- route or source;
- viewport and device scale when relevant;
- state and interaction setup;
- theme, auth, and content fixture when they affect the result;
- whether before, reference, proposal, after, or detail;
- limitations: compression, missing font, synthetic data, or blocked state.

Same route, viewport, state, theme, content, and auth for before/after. DPR 2 or focused crops for icons, spacing, control alignment, scrollbars, and annotation detail.

Annotate only findings visible in the capture. Do not box a region and make a source-only claim. Link source evidence in the finding or proof ledger.

Avoid callout collisions:

- prefer a box for a region, a point for a precise control;
- keep markers off the screenshot edge;
- split an overloaded screenshot into focused evidence;
- short labels in the legend, not paragraphs over the image;
- do not cover the exact defect with the marker.

## Content Order

Answer in this order:

1. Verdict or selected direction?
2. Product and user contract that caused that judgment?
3. Evidence actually observed?
4. Systemic causes of the symptoms?
5. Exact moves that replace them?
6. What must not be broken?
7. Proof that makes the new claim pass?
8. What remains risky, missing, synthetic, or blocked?

Markdown is the ingestion/correction handoff; HTML is the visual inspection handoff. Neither is decoration around a chat response; neither must contradict the other. Keep chat closeout short and link both artifacts.

## Report Quality Gate

Before delivery:

- check the manifest with the generator; run strict asset mode
- open report.html locally with network disabled, or check it has no external dependencies
- ingest report.md independently: every section, finding, decision, proof state, limitation, warning, annotation subject, tone, geometry
- check report.md uses only relative `report-assets/` paths, contains no data URI, and every referenced asset exists
- inspect desktop and narrow widths
- check images, annotations, evidence zooms, legend links, anchors, overflow, focus, and print
- check each numbered marker and evidence zoom contain the exact `subject` named in the legend; its `label` describes visible evidence, not a future solution
- compare report.md and report.html section counts, ids, statuses, and conclusions (any drift fails generation)
- check hostile text is escaped and no absolute secret-bearing URL or query string leaked
- check missing evidence is visible, not silently omitted
- check every major proposal is tied to evidence, a product cause, or an explicit hypothesis
- check the proof ledger limits the final claim

Fail when:

- pretty but generic;
- annotations or zooms target the wrong subject;
- screenshots are thumbnails;
- Markdown cannot be ingested without HTML;
- two views drift;
- missing image disappears without warning;
- source paths or secrets leak;
- proposal lacks a real product cause;
- the dossier is presented as proof the design works.
