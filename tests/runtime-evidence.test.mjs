import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileUrl, makeWorkspace, readReview, runReview, writeFixture } from "./review-helpers.mjs";

const playwrightCandidates = [
  process.env.PLAYWRIGHT_PATH,
  path.join(process.cwd(), "node_modules", "playwright"),
  path.join(os.tmpdir(), "improve-ui-playwright", "node_modules", "playwright"),
].filter(Boolean);
const hasPlaywright = playwrightCandidates.some((candidate) => fs.existsSync(candidate));

function runtimeFixture() {
  const workspace = makeWorkspace("improve-ui-runtime-");
  const html = writeFixture(workspace, "index.html", `<!doctype html>
<html><head><meta charset="utf-8"><title>Runtime fixture</title>
<style>body{margin:0;background:#fff;color:#111}button{width:96px;height:44px}</style></head>
<body><button id="ready">Ready</button>
<img alt="" width="1" height="1" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==">
</body></html>`);
  const actions = writeFixture(workspace, "actions.json", JSON.stringify({
    name: "ready",
    actions: [{ type: "click", selector: "#ready" }],
    assertions: [{ type: "visible", selector: "#ready" }],
  }));
  return { workspace, html, actions };
}

function accessibleButtonFixture(buttonMarkup) {
  const workspace = makeWorkspace("improve-ui-accessible-name-");
  const html = writeFixture(workspace, "index.html", `<!doctype html>
<html><head><meta charset="utf-8"><title>Accessible name fixture</title>
<style>body{margin:0;background:#fff;color:#111}button{width:48px;height:48px}</style></head>
<body>${buttonMarkup}</body></html>`);
  const actions = writeFixture(workspace, "actions.json", JSON.stringify({
    name: "button-name",
    actions: [{ type: "wait", ms: 0 }],
    assertions: [{ type: "visible", selector: "button" }],
  }));
  const outDir = path.join(workspace, "report");
  const result = runReview([
    "--url", fileUrl(html),
    "--actions", actions,
    "--viewport", "320x240",
    "--settle-ms", "0",
    "--out", outDir,
    "--strict",
  ]);
  return { result, review: readReview(outDir) };
}

test("a successful required runtime result carries distinct viewport and full-page artifacts", { skip: !hasPlaywright }, () => {
  const fixture = runtimeFixture();
  const outDir = path.join(fixture.workspace, "report");

  const result = runReview([
    "--path", fixture.html,
    "--url", fileUrl(fixture.html),
    "--actions", fixture.actions,
    "--viewport", "320x240",
    "--settle-ms", "0",
    "--out", outDir,
    "--strict",
  ]);

  assert.equal(result.status, 0, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.evidenceCoverage.runtime.status, "captured");
  assert.equal(review.evidenceCoverage.static.status, "captured");
  assert.equal(review.evidenceCoverage.runtime.results[0].actionCount, 1);
  assert.equal(review.evidenceCoverage.runtime.results[0].assertionCount, 1);
  assert.equal(review.evidenceCoverage.runtime.results[0].artifacts.length, 2);
  assert.equal(review.runtime.results.length, 1);
  const runtimeResult = review.runtime.results[0];
  assert.equal(runtimeResult.ok, true);
  assert.equal(runtimeResult.artifacts.viewport.kind, "viewport");
  assert.equal(runtimeResult.artifacts.fullPage.kind, "full-page");
  assert.notEqual(runtimeResult.artifacts.viewport.path, runtimeResult.artifacts.fullPage.path);
  assert.equal(runtimeResult.artifacts.viewport.mediaType, "image/png");
  assert.ok(runtimeResult.artifacts.viewport.byteLength > 0);
  assert.equal(fs.existsSync(runtimeResult.artifacts.viewport.path), true);
  assert.equal(fs.existsSync(runtimeResult.artifacts.fullPage.path), true);
  assert.match(runtimeResult.artifacts.viewport.sha256, /^[a-f0-9]{64}$/);
  assert.equal(
    review.findings.some((finding) => ["runtime-missing-img-alt", "runtime-broken-image", "runtime-missing-img-dimensions"].includes(finding.id)),
    false,
    "alt=\"\" is valid for decorative images and dimensions are present",
  );
  assert.equal(review.assessment.total, null, "zero automated findings cannot manufacture a positive score");
  assert.equal(review.assessment.verdict, "incomplete");
  assert.deepEqual(Object.keys(review.assessment.dimensions), [
    "accessibility",
    "performance",
    "themingDesignSystem",
    "responsiveContent",
    "visualTrustFit",
  ]);
});

test("an image alt supplies the accessible name of its containing button", { skip: !hasPlaywright }, () => {
  const { result, review } = accessibleButtonFixture(`
    <button><img alt="Save" width="1" height="1" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="></button>
  `);

  assert.equal(result.status, 0, result.stdout || result.stderr);
  assert.equal(review.runtime.results[0].metrics.unnamedButtonsExact, true);
  assert.equal(review.runtime.results[0].metrics.unnamedButtons, 0);
  assert.equal(review.findings.some((finding) => finding.id === "unnamed-buttons"), false);
});

test("aria-labelledby that resolves to no element does not manufacture a button name", { skip: !hasPlaywright }, () => {
  const { result, review } = accessibleButtonFixture('<button aria-labelledby="missing-label"></button>');

  assert.equal(result.status, 1, result.stdout || result.stderr);
  assert.equal(review.runtime.results[0].metrics.unnamedButtonsExact, true);
  assert.equal(review.runtime.results[0].metrics.unnamedButtons, 1);
  const finding = review.findings.find((candidate) => candidate.id === "unnamed-buttons");
  assert.equal(finding.classification, "objective");
  assert.equal(finding.confidence, "high");
  assert.equal(finding.severity, "P1");
});

test("hidden descendant text does not manufacture a button accessible name", { skip: !hasPlaywright }, () => {
  const { result, review } = accessibleButtonFixture('<button><span hidden>Hidden label</span></button>');

  assert.equal(result.status, 1, result.stdout || result.stderr);
  assert.equal(review.runtime.results[0].metrics.accessibleNameAuditSource, "chromium-accessibility-tree");
  assert.equal(review.runtime.results[0].metrics.unnamedButtonsExact, true);
  assert.equal(review.runtime.results[0].metrics.unnamedButtons, 1);
  assert.equal(review.findings.find((candidate) => candidate.id === "unnamed-buttons").classification, "objective");
});

test("a browser launch failure is blocked and strict exits non-zero", () => {
  const workspace = makeWorkspace("improve-ui-launch-");
  const adapter = path.join(workspace, "playwright");
  fs.mkdirSync(adapter, { recursive: true });
  fs.writeFileSync(path.join(adapter, "package.json"), JSON.stringify({ main: "index.cjs" }));
  fs.writeFileSync(path.join(adapter, "index.cjs"), "module.exports={chromium:{launch:async()=>{throw new Error('launch exploded')}}};");
  const outDir = path.join(workspace, "report");

  const result = runReview([
    "--url", "https://example.invalid",
    "--viewport", "320x240",
    "--out", outDir,
    "--strict",
  ], { env: { PLAYWRIGHT_PATH: adapter } });

  assert.equal(result.status, 1, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.assessment.verdict, "blocked");
  assert.equal(review.evidenceCoverage.runtime.status, "blocked");
  assert.match(review.ledger.blockers.map((item) => item.reason).join(" "), /launch failed.*launch exploded/i);
});

test("navigation failure creates a failed required result and blocks strict", { skip: !hasPlaywright }, () => {
  const workspace = makeWorkspace("improve-ui-navigation-");
  const outDir = path.join(workspace, "report");

  const result = runReview([
    "--url", "http://127.0.0.1:1",
    "--viewport", "320x240",
    "--timeout", "1000",
    "--settle-ms", "0",
    "--out", outDir,
    "--strict",
  ]);

  assert.equal(result.status, 1, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.evidenceCoverage.runtime.status, "blocked");
  assert.equal(review.runtime.results[0].ok, false);
  assert.equal(review.runtime.results[0].phase, "navigation");
});

test("action failure cannot pass merely because the runtime object exists", { skip: !hasPlaywright }, () => {
  const fixture = runtimeFixture();
  const actions = writeFixture(fixture.workspace, "broken-actions.json", JSON.stringify({
    name: "broken",
    actions: [{ type: "click", selector: "#does-not-exist", timeout: 100 }],
    assertions: [{ type: "visible", selector: "#ready" }],
  }));
  const outDir = path.join(fixture.workspace, "report");

  const result = runReview([
    "--url", fileUrl(fixture.html),
    "--actions", actions,
    "--viewport", "320x240",
    "--settle-ms", "0",
    "--out", outDir,
    "--strict",
  ]);

  assert.equal(result.status, 1, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.ok(review.runtime, "runtime evidence pack is still emitted for diagnosis");
  assert.equal(review.runtime.results[0].phase, "action");
  assert.equal(review.runtime.results[0].ok, false);
  assert.equal(review.evidenceCoverage.runtime.status, "blocked");
  assert.equal(review.gates.find((gate) => gate.gate === "runtime-visual").status, "fail");
});

test("assertion failure blocks the state before artifacts are accepted", { skip: !hasPlaywright }, () => {
  const fixture = runtimeFixture();
  const actions = writeFixture(fixture.workspace, "broken-assertion.json", JSON.stringify({
    name: "broken-assertion",
    actions: [{ type: "click", selector: "#ready" }],
    assertions: [{ type: "hidden", selector: "#ready", timeout: 100 }],
  }));
  const outDir = path.join(fixture.workspace, "report");

  const result = runReview([
    "--url", fileUrl(fixture.html),
    "--actions", actions,
    "--viewport", "320x240",
    "--settle-ms", "0",
    "--out", outDir,
    "--strict",
  ]);

  assert.equal(result.status, 1, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.runtime.results[0].phase, "assertion");
  assert.equal(review.runtime.results[0].ok, false);
  assert.equal(review.evidenceCoverage.runtime.status, "blocked");
});
