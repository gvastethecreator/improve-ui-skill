import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { makeWorkspace, pngBuffer, readReview, reviewScript, runReviewScript, writeFixture } from "./review-helpers.mjs";

function runtimeHarness(metrics, { emitDiagnostics = false } = {}) {
  const workspace = makeWorkspace("improve-ui-runtime-taxonomy-");
  const scripts = path.join(workspace, "scripts");
  fs.mkdirSync(scripts, { recursive: true });
  const harness = path.join(scripts, "run-interface-review.mjs");
  fs.copyFileSync(reviewScript, harness);
  fs.writeFileSync(path.join(scripts, "detect-ui-antipatterns.mjs"), [
    'import fs from "node:fs";',
    'const args = process.argv.slice(2);',
    'fs.writeFileSync(args[args.indexOf("--out") + 1], JSON.stringify({ files: 1, findings: [], summary: {} }));',
  ].join("\n"));
  const adapter = path.join(workspace, "playwright");
  const screenshotPng = pngBuffer(320, 240).toString("base64");
  fs.mkdirSync(adapter, { recursive: true });
  fs.writeFileSync(path.join(adapter, "package.json"), JSON.stringify({ main: "index.cjs" }));
  fs.writeFileSync(path.join(adapter, "index.cjs"), `
const fs = require("node:fs");
const metrics = ${JSON.stringify(metrics)};
const emitDiagnostics = ${JSON.stringify(emitDiagnostics)};
const page = {
  on(name, callback) {
    if (!emitDiagnostics) return;
    if (name === "console") callback({ type: () => "error", text: () => "diagnostic console error" });
    if (name === "requestfailed") callback({ url: () => "https://third-party.invalid/track", failure: () => ({ errorText: "blocked" }) });
    if (name === "response") callback({ status: () => 500, url: () => "https://third-party.invalid/data", headers: () => ({}) });
  },
  async addInitScript() {}, async goto() {}, async waitForTimeout() {},
  locator() { return { async waitFor() {} }; },
  async screenshot(options) { fs.writeFileSync(options.path, Buffer.from("${screenshotPng}", "base64")); },
  async evaluate() { return metrics; }, async close() {},
  mouse: { async wheel() {} }, async click() {}, async hover() {}, async fill() {}, async press() {}, url() { return "https://example.test"; }
};
module.exports = { chromium: { launch: async () => ({ version: () => "test-browser", newPage: async () => page, close: async () => {} }) } };
`);
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const actions = writeFixture(workspace, "actions.json", JSON.stringify({
    name: "diagnostic",
    actions: [{ type: "wait", ms: 1 }],
    assertions: [{ type: "visible", selector: "main" }],
  }));
  return { workspace, harness, adapter, target, actions };
}

function baseMetrics(overrides = {}) {
  return {
    title: "Fixture", width: 320, height: 240, scrollWidth: 320, scrollHeight: 240,
    horizontalOverflow: false, smallHitAreas: [], unnamedButtons: 0, clippedText: [],
    imageIssues: [], contrastIssues: [], animationAudit: { total: 0, running: 0, offscreenRunningCount: 0, offscreenRunning: [] },
    canvasDetails: [], longTasks: [], layoutShifts: [], cls: 0,
    frameStats: { samples: 120, p95: 16, max: 16 },
    ...overrides,
  };
}

function runFixture(fixture, { strict = true, reportName = "report" } = {}) {
  const outDir = path.join(fixture.workspace, reportName);
  const result = runReviewScript(fixture.harness, [
    "--path", fixture.target,
    "--url", "https://example.test",
    "--actions", fixture.actions,
    "--viewport", "320x240",
    "--out", outDir,
    ...(strict ? ["--strict"] : []),
  ], { env: { PLAYWRIGHT_PATH: fixture.adapter } });
  return { result, review: readReview(outDir) };
}

test("strict runtime requires an assertion while relaxed snapshot capture does not", () => {
  const strictFixture = runtimeHarness(baseMetrics());
  const relaxedFixture = runtimeHarness(baseMetrics());
  fs.writeFileSync(strictFixture.actions, JSON.stringify({ name: "snapshot", actions: [], assertions: [] }));
  fs.writeFileSync(relaxedFixture.actions, JSON.stringify({ name: "snapshot", actions: [], assertions: [] }));

  const strict = runFixture(strictFixture);
  const relaxed = runFixture(relaxedFixture, { strict: false });

  assert.equal(strict.result.status, 1, strict.result.stdout || strict.result.stderr);
  assert.equal(strict.review.runtime.results[0].ok, true, "capture succeeded but is insufficient strict evidence");
  assert.equal(strict.review.evidenceCoverage.runtime.status, "blocked");
  assert.equal(strict.review.gates.find((gate) => gate.gate === "runtime-visual").status, "fail");
  assert.equal(relaxed.result.status, 0, relaxed.result.stdout || relaxed.result.stderr);
  assert.equal(relaxed.review.evidenceCoverage.runtime.status, "captured");
});

test("generic runtime probes remain advisory and cannot fail strict by repetition", () => {
  const fixture = runtimeHarness(baseMetrics({
    scrollWidth: 400,
    horizontalOverflow: true,
    smallHitAreas: [{ name: "icon", width: 20, height: 20 }],
    clippedText: [{ tag: "p", text: "truncated", scrollWidth: 200, clientWidth: 100 }],
    contrastIssues: [{ tag: "span", text: "lead", ratio: 2, threshold: 4.5 }],
    animationAudit: { total: 1, running: 1, offscreenRunningCount: 1, offscreenRunning: [{ tag: "div" }] },
    longTasks: [{ duration: 60 }],
    cls: 0.02,
    frameStats: { samples: 120, p95: 30, max: 60 },
  }), { emitDiagnostics: true });

  const { result, review } = runFixture(fixture);

  assert.equal(result.status, 0, result.stdout || result.stderr);
  assert.ok(review.findings.length >= 8);
  assert.ok(review.findings.every((finding) => finding.classification === "advisory"));
  assert.ok(review.findings.every((finding) => ["low", "medium"].includes(finding.confidence)));
  assert.equal(review.gates.find((gate) => gate.gate === "p0-p1-unresolved").status, "pass");
  assert.equal(review.gates.find((gate) => gate.gate === "systemic-p2-unresolved").status, "pass");
});

test("a visible image missing alt is an exact objective runtime defect", () => {
  const fixture = runtimeHarness(baseMetrics({
    imageIssues: [{ src: "image.png", alt: null, widthAttr: "10", heightAttr: "10", naturalWidth: 10, naturalHeight: 10 }],
  }));

  const { result, review } = runFixture(fixture);

  assert.equal(result.status, 1, result.stdout || result.stderr);
  const finding = review.findings.find((candidate) => candidate.id === "runtime-missing-img-alt");
  assert.equal(finding.classification, "objective");
  assert.equal(finding.confidence, "high");
  assert.equal(finding.severity, "P1");
});

test("missing image dimensions are advisory while a decoded-size failure is objective", () => {
  const missingDimensions = runtimeHarness(baseMetrics({
    imageIssues: [{ src: "image.png", alt: "", widthAttr: null, heightAttr: null, naturalWidth: 10, naturalHeight: 10 }],
  }));
  const brokenImage = runtimeHarness(baseMetrics({
    imageIssues: [{ src: "image.png", alt: "", widthAttr: "10", heightAttr: "10", naturalWidth: 0, naturalHeight: 0 }],
  }));

  const missing = runFixture(missingDimensions);
  const broken = runFixture(brokenImage);

  assert.equal(missing.result.status, 0, missing.result.stdout || missing.result.stderr);
  assert.equal(missing.review.findings.find((finding) => finding.id === "runtime-missing-img-dimensions").classification, "advisory");
  assert.equal(broken.result.status, 1, broken.result.stdout || broken.result.stderr);
  assert.equal(broken.review.findings.find((finding) => finding.id === "runtime-broken-image").classification, "objective");
});
