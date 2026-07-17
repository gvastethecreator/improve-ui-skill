# Design Dossiers: Markdown + HTML

Use this route when an existing interface needs a material critique, screenshot review, improvement proposal, or redesign proposal. The dossier is one decision artifact in two synchronized views: ingestion-first Markdown for fast correction and standalone HTML for visual inspection. Both contain the evidence, diagnosis, proposed moves, preservation contract, and proof targets.

## Contents

- [Required artifacts](#required-artifacts)
- [Choose the report mode](#choose-the-report-mode)
- [Manifest contract](#manifest-contract)
- [Screenshot discipline](#screenshot-discipline)
- [Content order](#content-order)
- [Report quality gate](#report-quality-gate)

Do not generate a dossier for a tiny implementation note, a routine status update, or code-only work with no visual proposal. Do generate one when the user must evaluate, approve, compare, hand off, or continue the design later.

## Required Artifacts

Persist the complete dossier:

- report-manifest.json: structured, reviewable source;
- report.md: deterministic, ingestion-first report with explicit evidence geometry;
- report-assets/: lossless local evidence referenced by report.md;
- report.html: standalone visual dossier with full-image overlays and annotation zooms.

The manifest is the source of truth. Generate both views in one command; never hand-edit one report into a different conclusion.

Use the bundled generator:

~~~powershell
node SKILLS/improve-ui/scripts/generate-design-report.mjs --manifest output/improve-ui/<slug>/report-manifest.json --out output/improve-ui/<slug>/report.html --strict-assets
~~~

The generator writes `report.md` and `report.html` from the same normalized manifest. Use `--markdown-out <path.md>` only when the caller needs another stable path.

The full review harness emits `report.md`, `report-assets/`, and `report.html` automatically beside `review.json` and its compact `README.md` index:

~~~powershell
node SKILLS/improve-ui/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --out output/improve-ui/<slug> --detail-capture
~~~

Use strict assets for the final dossier. Draft mode may show an explicit evidence placeholder and warning when a capture is missing or corrupt. Never let a broken image icon masquerade as evidence.

Local PNG, JPEG, GIF, WebP, and AVIF screenshots are embedded in HTML by default and copied byte-for-byte into `report-assets/` for Markdown. Markdown never receives a data URI. External image URLs fail in strict mode because they make the artifact non-portable; draft mode renders a sanitized evidence placeholder in both reports and never fetches them. The no-embed-images flag affects the HTML draft only; Markdown still receives local sidecar evidence. Disclose when the HTML will break after moving away from linked files.

## Choose The Report Mode

- **critique**: lead with the dominant failure, severity-ranked causes, exact fixes, do-not-break contract, cuts, and proof limits.
- **proposal**: lead with the context and decision, show incompatible directions, select one, explain what it kills, and state assets/states/proof needed.
- **redesign**: combine before evidence, systemic diagnosis, selected direction, replacement system, migration moves, preservation contract, and before/after proof plan.

The visual layout may remain the forensic dossier. The information order changes by mode. Do not invent three decorative templates that weaken consistency.

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

Text fields accept plain text and line breaks. They do not accept trusted HTML. The generator escapes titles, findings, labels, metadata, and all other user-controlled content.

Set language to a BCP 47-style tag. English and Spanish include built-in report chrome; Spanish regional tags use the Spanish labels. For another language, provide a labels object that overrides the report chrome while keeping all values plain text. The dossier must follow the user's language.

### Verdict severities

Use blocker, P1, P2, P3, or info. Severity describes the dominant evidenced risk, not the amount of effort.

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

Coordinates are percentages from the screenshot's top-left corner. A point annotation uses x and y. A box also supplies width and height. All values must stay from 0 to 100, and boxes must remain within the screenshot.

`stage` is required and must be `before`, `reference`, `proposal`, `after`, or `detail`. Use tones error, warning, proposal, or note. A proposal tone is invalid on before/reference evidence: annotate only what is visibly present there, and put the proposed move in directions/actions or on an actual proposal/after image.

`subject` is required and names the literal element or region inside the marker—such as `Panel LIVE ALERTS`, `Row 04 · payment-core`, or `Recovery button`. `label` states the visible condition and why it matters. Numbered overlays render both values in the matching legend. When image dimensions are available, each legend entry also renders an automatic context-padded evidence zoom from the exact same coordinates and image source. Markdown records the same subject, tone, claim, and normalized geometry.

### Annotation calibration

Do not estimate percentages from memory or from a thumbnail. For each marker:

1. inspect the source image at native resolution and record its pixel width and height;
2. identify the exact pixel rectangle or point containing the named subject;
3. convert with `x% = leftPx / imageWidth × 100`, `y% = topPx / imageHeight × 100`, and the equivalent formula for width/height;
4. generate the dossier and inspect the full rendered screenshot plus every automatic evidence zoom at readable scale;
5. read each legend item, trace its number back to the full image, and cross-check the matching Markdown geometry; fail the report if any view points to a different subject or if the description claims anything not visible inside or immediately adjacent to it.

Use one marker for one literal subject. Split broad claims across focused crops or multiple markers. A box that spans unrelated panels is not evidence; it is decorative geometry.

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

Every major finding needs evidence, damage, cause, and exact solution. A roast is optional and must be earned. screenshotId must reference a supplied screenshot.

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

Use selected, rejected, or explored. Directions must be incompatible at the information architecture, composition, or interaction level. Palette-only variations are not directions.

### Actions

~~~json
{
  "priority": "01",
  "title": "Rebuild the first viewport around incident priority",
  "detail": "Replace the equal panel matrix with an incident spine and one telemetry rail.",
  "proof": "A five-second test identifies incident, owner, severity, and next action."
}
~~~

Order moves by user damage. Do not pad to a fixed number.

### Proof ledger

~~~json
{
  "label": "Recovery state",
  "status": "blocked",
  "detail": "No recovery fixture was supplied.",
  "artifact": "actions-recovery.json"
}
~~~

Use passed, failed, blocked, n/a, or unknown. The artifact may name a capture, command, route, state, source line, or test. Do not mark captured evidence as passed unless it was inspected or compared.

## Screenshot Discipline

Every screenshot must record:

- route or source;
- viewport and device scale when relevant;
- state and interaction setup;
- theme, auth, and content fixture when they affect the result;
- whether it is before, reference, proposal, after, or detail;
- limitations such as compression, missing font, synthetic data, or blocked state.

Use the same route, viewport, state, theme, content, and auth context for before/after comparison. Use DPR 2 or focused crops for icons, spacing, control alignment, scrollbars, and annotation detail.

Annotate only findings that are visible in the capture. Do not draw a box around a region and make a source-only claim. Link source evidence in the finding or proof ledger.

Avoid callout collisions:

- prefer a box for a region and a point for a precise control;
- keep markers away from the screenshot edge;
- split an overloaded screenshot into focused evidence;
- use short labels in the legend, not paragraphs over the image;
- do not cover the exact defect with the marker.

## Content Order

A strong dossier answers in this order:

1. What is the verdict or selected direction?
2. What product and user contract caused that judgment?
3. What evidence was actually observed?
4. What systemic causes explain the symptoms?
5. What exact moves replace them?
6. What must not be broken?
7. What proof would make the new claim pass?
8. What remains risky, missing, synthetic, or blocked?

The Markdown is the ingestion and correction handoff. The HTML is the visual inspection handoff. Neither is decoration around a chat response, and neither may contradict the other. Keep the chat closeout short and link both artifacts.

## Report Quality Gate

Before delivery:

- validate the manifest with the generator;
- run strict asset mode;
- open report.html locally with network disabled or confirm it has no external dependencies;
- ingest report.md independently and confirm it contains every section, finding, decision, proof state, limitation, warning, annotation subject, tone, and geometry;
- confirm report.md uses only relative `report-assets/` paths, contains no data URI, and every referenced asset exists;
- inspect desktop and narrow widths;
- verify images, annotations, evidence zooms, legend links, anchors, overflow, focus, and print behavior;
- verify each numbered marker and evidence zoom contain the exact `subject` named in the legend and that its `label` describes visible evidence rather than a future solution;
- compare report.md and report.html section counts, ids, statuses, and conclusions; any drift is a failed generation;
- verify hostile text is escaped and no absolute secret-bearing URL or query string leaked;
- verify missing evidence is visible rather than silently omitted;
- confirm every major proposal is tied to evidence, a product cause, or an explicit hypothesis;
- confirm the proof ledger limits the final claim.

The report fails when it is pretty but generic, when annotations or zooms target the wrong subject, when screenshots are thumbnails, when Markdown cannot be ingested without the HTML, when the two views drift, when a missing image disappears without warning, when source paths or secrets leak, when a proposal lacks a real product cause, or when the dossier itself is presented as proof that the design works.
