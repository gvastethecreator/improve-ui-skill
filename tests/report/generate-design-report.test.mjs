import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const generatorPath = path.join(
  repoRoot,
  "SKILLS",
  "improve-ui",
  "scripts",
  "generate-design-report.mjs",
);
const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

function sandbox(name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), "improve-ui-report-" + name + "-"));
}

function baseManifest(imageName = "capture.png") {
  return {
    version: 1,
    mode: "redesign",
    title: "Operations command center",
    eyebrow: "DESIGN CASE 017",
    verdict: {
      severity: "P1",
      label: "Hierarchy failure",
      summary: "The alert lane and the ambient metrics currently compete for the same attention.",
    },
    context: {
      archetype: "operator cockpit",
      userMode: "continuous monitoring under pressure",
      primaryArtifact: "incident queue",
      proofTarget: "triage remains legible at 1280x800 and 390x844",
    },
    summary: [
      "The redesign turns a card wall into a decision surface.",
      "Evidence and actions share one scan lane; ambient telemetry moves to a quieter rail.",
    ],
    screenshots: [
      {
        id: "before-default",
        src: imageName,
        alt: "Current command center with several equal-weight panels",
        label: "Before · default",
        stage: "before",
        state: "default",
        viewport: "1280×800",
        annotations: [
          { x: 12.5, y: 20, width: 30, height: 18, subject: "Alert queue", label: "Repeated equal-weight panels erase priority.", tone: "error" },
          { x: 80, y: 12, subject: "Action rail", label: "Alert status is detached from its action.", tone: "warning" },
        ],
      },
    ],
    findings: [
      {
        id: "flat-priority",
        severity: "P1",
        title: "Every panel shouts at the same volume",
        evidence: "The first viewport contains six panels with equal surface, heading, and spacing treatment.",
        damage: "Operators cannot identify the next decision without reading every region.",
        cause: "The composition is a repeated-card inventory instead of an incident workflow.",
        solution: "Create one incident spine, bind evidence to each decision, and demote ambient metrics to the secondary rail.",
        roast: "This is a monitoring surface organized like a sticker collection.",
        screenshotId: "before-default",
      },
    ],
    directions: [
      {
        name: "Incident spine",
        status: "selected",
        thesis: "One vertical decision sequence owns the first scan.",
        signature: "A live incident rail with evidence stitched directly into each escalation.",
        why: "It matches the operator task and remains stable as incidents change.",
      },
      {
        name: "Telemetry field",
        status: "rejected",
        thesis: "A spatial field makes system topology dominant.",
        why: "Topology is useful, but it delays the immediate triage decision in this surface.",
      },
    ],
    actions: [
      {
        priority: "01",
        title: "Rebuild the first viewport around incident priority",
        detail: "Replace the equal panel matrix with the incident spine and one supporting telemetry rail.",
        proof: "A five-second test identifies the active incident, owner, severity, and next action.",
      },
    ],
    preserve: ["Keep the existing alert vocabulary and keyboard shortcuts."],
    proof: [
      { label: "Default viewport", status: "failed", detail: "Priority is not legible.", artifact: "before-default" },
      { label: "Recovery state", status: "blocked", detail: "No recovery fixture was supplied." },
    ],
    risks: ["The telemetry rail may overflow with long service names."],
    limitations: ["No authenticated production dataset was available."],
    metadata: { generated: "2026-07-16", target: "local fixture" },
  };
}

function writeCase(dir, manifest, imageBytes = tinyPng) {
  const manifestPath = path.join(dir, "report.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  if (imageBytes) fs.writeFileSync(path.join(dir, "capture.png"), imageBytes);
  return manifestPath;
}

function runGenerator(args) {
  return spawnSync(process.execPath, [generatorPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

test("generates a standalone annotated dossier and escapes hostile text", () => {
  const dir = sandbox("standalone");
  const manifest = baseManifest();
  manifest.title = "Ops <script>alert(1)</script>";
  manifest.findings[0].evidence = "<img src=x onerror=alert(1)> evidence";
  manifest.screenshots[0].annotations[0].subject = "Alert queue <svg onload=alert(1)>";
  const manifestPath = writeCase(dir, manifest);
  const outPath = path.join(dir, "report.html");

  const result = runGenerator(["--manifest", manifestPath, "--out", outPath, "--strict-assets"]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const summary = JSON.parse(result.stdout);
  const html = fs.readFileSync(outPath, "utf8");
  const markdownPath = path.join(dir, "report.md");
  const markdown = fs.readFileSync(markdownPath, "utf8");
  const markdownAsset = path.join(dir, "report-assets", "before-default.png");
  assert.equal(summary.markdownPath, markdownPath);
  assert.equal(summary.markdownAssets, 1);
  assert.equal(summary.embeddedImages, 1);
  assert.equal(summary.missingImages, 0);
  assert.match(html, /data:image\/png;base64,/);
  assert.match(html, /left:12\.5%;top:20%;width:30%;height:18%/);
  assert.match(html, /Alert queue &lt;svg onload=alert\(1\)&gt;/);
  assert.match(html, /<svg class="evidence-source"[^>]+viewBox="0 0 1 1"/);
  assert.equal((html.match(/class="annotation-loupe tone-/g) || []).length, 2);
  assert.equal((html.match(/class="loupe-label"/g) || []).length, 2);
  assert.equal((html.match(/<use href="#source-before-default"/g) || []).length, 2);
  assert.equal((html.match(/data:image\/png;base64,/g) || []).length, 1);
  assert.match(html, /<rect class="loupe-target"/);
  assert.match(html, /<circle class="loupe-target"/);
  assert.match(html, />before</);
  assert.match(html, /Evidence wall/);
  assert.match(html, /Proof ledger/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt; evidence/);
  assert.match(html, /@media print/);
  assert.doesNotMatch(html, /<script(?:\s|>)/i);
  assert.doesNotMatch(html, /<svg\s+onload/i);
  assert.doesNotMatch(html, /<link[^>]+stylesheet/i);
  assert.match(markdown, /^# Ops &lt;script&gt;alert\(1\)&lt;\/script&gt;/m);
  assert.match(markdown, /^## Evidence wall$/m);
  assert.match(markdown, /^## Findings$/m);
  assert.match(markdown, /^## Directions$/m);
  assert.match(markdown, /^## Moves$/m);
  assert.match(markdown, /^## Do not break$/m);
  assert.match(markdown, /^## Proof ledger$/m);
  assert.match(markdown, /\*\*Alert queue &lt;svg onload=alert\(1\)&gt;\*\*/);
  assert.match(markdown, /`x=12\.5%, y=20%, width=30%, height=18%`/);
  assert.match(markdown, /!\[[^\]]+\]\(report-assets\/before-default\.png\)/);
  assert.doesNotMatch(markdown, /data:image\//i);
  assert.doesNotMatch(markdown, /<script(?:\s|>)/i);
  assert.equal(fs.readFileSync(markdownAsset).equals(tinyPng), true);
});
test("supports an explicit Markdown path and materializes embedded evidence losslessly", () => {
  const dir = sandbox("markdown-out");
  const manifest = baseManifest();
  manifest.screenshots[0].src = "data:image/png;base64," + tinyPng.toString("base64");
  const manifestPath = writeCase(dir, manifest, null);
  const outPath = path.join(dir, "visual.html");
  const markdownPath = path.join(dir, "ingestion", "dossier.md");

  const result = runGenerator([
    "--manifest",
    manifestPath,
    "--out",
    outPath,
    "--markdown-out",
    markdownPath,
    "--strict-assets",
  ]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const summary = JSON.parse(result.stdout);
  const markdown = fs.readFileSync(markdownPath, "utf8");
  const assetPath = path.join(dir, "ingestion", "report-assets", "before-default.png");
  assert.equal(summary.markdownPath, markdownPath);
  assert.match(markdown, /report-assets\/before-default\.png/);
  assert.equal(fs.readFileSync(assetPath).equals(tinyPng), true);
});

test("keeps annotation badges visible when evidence touches a screenshot edge", () => {
  const dir = sandbox("annotation-edges");
  const manifest = baseManifest();
  manifest.screenshots[0].annotations = [
    { x: 1, y: 1, width: 30, height: 18, subject: "Top-left panel", label: "Visible at the edge.", tone: "error" },
    { x: 99, y: 99, subject: "Bottom-right control", label: "Visible at the opposite edge.", tone: "warning" },
  ];
  const outPath = path.join(dir, "report.html");

  const result = runGenerator(["--manifest", writeCase(dir, manifest), "--out", outPath, "--strict-assets"]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const html = fs.readFileSync(outPath, "utf8");
  assert.match(html, /annotation-box tone-error label-inset-left label-inset-top/);
  assert.match(html, /annotation-pin tone-warning label-inset-right label-inset-bottom/);
});

test("requires screenshot stage and a literal subject for every annotation", () => {
  const missingStageDir = sandbox("annotation-missing-stage");
  const missingStage = baseManifest();
  delete missingStage.screenshots[0].stage;
  const missingStageResult = runGenerator([
    "--manifest",
    writeCase(missingStageDir, missingStage),
    "--out",
    path.join(missingStageDir, "report.html"),
  ]);

  assert.equal(missingStageResult.status, 2, missingStageResult.stderr || missingStageResult.stdout);
  assert.match(missingStageResult.stderr, /screenshots\[0\]\.stage/i);

  const missingSubjectDir = sandbox("annotation-missing-subject");
  const missingSubject = baseManifest();
  delete missingSubject.screenshots[0].annotations[0].subject;
  const missingSubjectResult = runGenerator([
    "--manifest",
    writeCase(missingSubjectDir, missingSubject),
    "--out",
    path.join(missingSubjectDir, "report.html"),
  ]);

  assert.equal(missingSubjectResult.status, 2, missingSubjectResult.stderr || missingSubjectResult.stdout);
  assert.match(missingSubjectResult.stderr, /annotation\.subject/i);
});

test("rejects proposal callouts on before or reference evidence", () => {
  for (const stage of ["before", "reference"]) {
    const dir = sandbox("proposal-on-" + stage);
    const manifest = baseManifest();
    manifest.screenshots[0].stage = stage;
    manifest.screenshots[0].annotations[0].tone = "proposal";
    const result = runGenerator([
      "--manifest",
      writeCase(dir, manifest),
      "--out",
      path.join(dir, "report.html"),
    ]);

    assert.equal(result.status, 2, result.stderr || result.stdout);
    assert.match(result.stderr, /proposal annotations are not allowed/i);
  }

  const proposalDir = sandbox("proposal-on-proposal");
  const proposalManifest = baseManifest();
  proposalManifest.screenshots[0].stage = "proposal";
  proposalManifest.screenshots[0].annotations[0].tone = "proposal";
  const proposalResult = runGenerator([
    "--manifest",
    writeCase(proposalDir, proposalManifest),
    "--out",
    path.join(proposalDir, "report.html"),
  ]);

  assert.equal(proposalResult.status, 0, proposalResult.stderr || proposalResult.stdout);
});

test("renders a visible evidence placeholder when an image is missing", () => {
  const dir = sandbox("missing");
  const manifestPath = writeCase(dir, baseManifest("missing.png"), null);
  const outPath = path.join(dir, "report.html");

  const result = runGenerator(["--manifest", manifestPath, "--out", outPath]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const summary = JSON.parse(result.stdout);
  const html = fs.readFileSync(outPath, "utf8");
  const markdown = fs.readFileSync(path.join(dir, "report.md"), "utf8");
  assert.equal(summary.missingImages, 1);
  assert.match(summary.warnings[0], /missing/i);
  assert.match(html, /Evidence unavailable/);
  assert.match(html, /Artifact warnings/);
  assert.match(markdown, /Evidence unavailable/);
  assert.match(markdown, /Artifact warnings/);
});

test("never fetches remote screenshots or serializes their query strings", () => {
  const dir = sandbox("remote");
  const source = "https://private.example.test/captures/ops.png?token=do-not-serialize";
  const manifestPath = writeCase(dir, baseManifest(source), null);
  const outPath = path.join(dir, "report.html");

  const result = runGenerator(["--manifest", manifestPath, "--out", outPath]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const summary = JSON.parse(result.stdout);
  const html = fs.readFileSync(outPath, "utf8");
  const markdown = fs.readFileSync(path.join(dir, "report.md"), "utf8");
  assert.equal(summary.missingImages, 1);
  assert.match(html, /Evidence unavailable/);
  assert.match(html, /private\.example\.test\/ops\.png/);
  assert.doesNotMatch(html, /https:\/\/private\.example\.test/);
  assert.doesNotMatch(html, /do-not-serialize/);
  assert.match(markdown, /private\.example\.test\/ops\.png/);
  assert.doesNotMatch(markdown, /https:\/\/private\.example\.test/);
  assert.doesNotMatch(markdown, /do-not-serialize/);
});

test("renders built-in Spanish report chrome when the manifest language is Spanish", () => {
  const dir = sandbox("spanish");
  const manifest = baseManifest();
  manifest.language = "es-AR";
  const manifestPath = writeCase(dir, manifest);
  const outPath = path.join(dir, "report.html");

  const result = runGenerator(["--manifest", manifestPath, "--out", outPath, "--strict-assets"]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const html = fs.readFileSync(outPath, "utf8");
  assert.match(html, /<html lang="es-AR">/);
  assert.match(html, /Muro de evidencia/);
  assert.match(html, /Hallazgos que obligan a actuar/);
  assert.match(html, /Registro de pruebas/);
  assert.match(html, /Arquetipo/);
  assert.match(html, /Modo de usuario/);
  assert.match(html, /seleccionada/);
  assert.match(html, /falló/);
  assert.doesNotMatch(html, />Archetype</);
  assert.doesNotMatch(html, />selected</);
  assert.match(html, /Autónomo · imprimible · sin recursos externos/);
  assert.match(html, />antes</);
});

test("strict asset mode rejects missing and corrupt screenshots", () => {
  const missingDir = sandbox("strict-missing");
  const missingManifest = writeCase(missingDir, baseManifest("missing.png"), null);
  const missingOut = path.join(missingDir, "report.html");
  const missingResult = runGenerator(["--manifest", missingManifest, "--out", missingOut, "--strict-assets"]);

  assert.equal(missingResult.status, 2, missingResult.stderr || missingResult.stdout);
  assert.match(missingResult.stderr, /asset is missing/i);
  assert.equal(fs.existsSync(missingOut), false);

  const corruptDir = sandbox("strict-corrupt");
  const corruptManifest = writeCase(corruptDir, baseManifest(), Buffer.from("not an image"));
  const corruptResult = runGenerator([
    "--manifest",
    corruptManifest,
    "--out",
    path.join(corruptDir, "report.html"),
    "--strict-assets",
  ]);

  assert.equal(corruptResult.status, 2, corruptResult.stderr || corruptResult.stdout);
  assert.match(corruptResult.stderr, /corrupt or unsupported/i);
});

test("strict asset mode validates embedded image bytes and declared MIME type", () => {
  const dir = sandbox("strict-data-uri");
  const manifest = baseManifest();
  manifest.screenshots[0].src = "data:image/png;base64," + Buffer.from("not an image").toString("base64");
  const manifestPath = writeCase(dir, manifest, null);

  const result = runGenerator([
    "--manifest",
    manifestPath,
    "--out",
    path.join(dir, "report.html"),
    "--strict-assets",
  ]);

  assert.equal(result.status, 2, result.stderr || result.stdout);
  assert.match(result.stderr, /data is corrupt|MIME type is incorrect/i);
});

test("rejects annotation geometry outside normalized screenshot bounds", () => {
  const dir = sandbox("annotation-bounds");
  const manifest = baseManifest();
  manifest.screenshots[0].annotations[0] = {
    x: 80,
    y: 20,
    width: 30,
    height: 20,
    label: "This box exceeds the right edge.",
  };
  const manifestPath = writeCase(dir, manifest);

  const result = runGenerator(["--manifest", manifestPath, "--out", path.join(dir, "report.html")]);

  assert.equal(result.status, 2, result.stderr || result.stdout);
  assert.match(result.stderr, /exceeds screenshot bounds/i);
});

test("rejects findings linked to an unknown screenshot", () => {
  const dir = sandbox("unknown-link");
  const manifest = baseManifest();
  manifest.findings[0].screenshotId = "not-present";
  const manifestPath = writeCase(dir, manifest);

  const result = runGenerator(["--manifest", manifestPath, "--out", path.join(dir, "report.html")]);

  assert.equal(result.status, 2, result.stderr || result.stdout);
  assert.match(result.stderr, /unknown screenshotId/i);
});

test("linked-image mode discloses that the report is not portable", () => {
  const dir = sandbox("linked");
  const manifestPath = writeCase(dir, baseManifest());
  const outPath = path.join(dir, "report.html");

  const result = runGenerator(["--manifest", manifestPath, "--out", outPath, "--no-embed-images"]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const summary = JSON.parse(result.stdout);
  const html = fs.readFileSync(outPath, "utf8");
  assert.equal(summary.embeddedImages, 0);
  assert.match(summary.warnings[0], /linked instead of embedded/i);
  assert.match(html, /capture\.png/);
  assert.doesNotMatch(html, /data:image\/png;base64,/);
});

test("maps improve-ui runtime and hash-verified proof artifacts without inventing annotations", async () => {
  const { designReportManifestFromReview } = await import(pathToFileURL(generatorPath).href);
  const manifest = designReportManifestFromReview({
    reviewedAt: "2026-07-16T00:00:00.000Z",
    target: { path: "src/App.tsx", url: "http://127.0.0.1:4173" },
    ledger: { context: { register: "product", surface: "command center", states: ["incident"], viewports: [{ width: 1280, height: 800 }] }, blockers: [] },
    proof: {
      before: { artifact: "proof/before.png", state: "incident", viewport: { width: 1280, height: 800 }, kind: "viewport" },
      after: { artifact: "proof/after.png", state: "incident", viewport: { width: 1280, height: 800 }, kind: "viewport" },
    },
    runtime: { results: [{
      ok: true,
      state: "incident",
      viewport: { width: 1280, height: 800 },
      artifacts: { viewport: { path: "screenshots/incident-1280x800-viewport.png" } },
    }] },
    findings: [{ id: "native-scrollbar", severity: "P2", message: "Scroll owner needs visual confirmation.", file: "src/App.tsx", line: 10 }],
    assessment: { verdict: "incomplete", dimensions: { visualTrustFit: { status: "unknown" } } },
    gates: [{ gate: "runtime", status: "pass", detail: "captured" }],
  }, { baseDir: "C:/evidence" });

  assert.deepEqual(manifest.screenshots.map((item) => [item.id, item.stage]), [
    ["proof-before", "before"],
    ["proof-after", "after"],
    ["runtime-1", "detail"],
  ]);
  assert.ok(manifest.screenshots.every((item) => item.annotations.length === 0));
  assert.equal(manifest.findings[0].screenshotId, "proof-before");
  assert.match(manifest.limitations.join(" "), /does not invent annotation coordinates/i);
});
