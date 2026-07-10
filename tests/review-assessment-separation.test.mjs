import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { makeWorkspace, pngBuffer, readReview, reviewScript, runReviewScript, writeFixture } from "./review-helpers.mjs";

function cleanStaticHarness() {
  const workspace = makeWorkspace("improve-ui-assessment-");
  const scripts = path.join(workspace, "scripts");
  fs.mkdirSync(scripts, { recursive: true });
  const harness = path.join(scripts, "run-interface-review.mjs");
  fs.copyFileSync(reviewScript, harness);
  fs.writeFileSync(path.join(scripts, "detect-ui-antipatterns.mjs"), [
    'import fs from "node:fs";',
    'const args = process.argv.slice(2);',
    'fs.writeFileSync(args[args.indexOf("--out") + 1], JSON.stringify({ files: 1, findings: [], summary: {} }));',
  ].join("\n"));
  return { workspace, harness, target: writeFixture(workspace, "target.tsx", "export const Target = () => <main />;") };
}

test("unobserved dimensions remain unknown and do not contribute a perfect score", () => {
  const fixture = cleanStaticHarness();
  const outDir = path.join(fixture.workspace, "report");

  const result = runReviewScript(fixture.harness, ["--path", fixture.target, "--out", outDir]);

  assert.equal(result.status, 0, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.assessment.dimensions.accessibility.status, "unknown");
  assert.equal(review.assessment.dimensions.accessibility.score, null);
  assert.equal(review.assessment.total, null);
  assert.equal(review.assessment.verdict, "incomplete");
  assert.equal(Object.hasOwn(review, "score"), false);
});

test("expectations are reported separately and cannot alter assessment or evidence gates", () => {
  const fixture = cleanStaticHarness();
  const outDir = path.join(fixture.workspace, "report");

  const result = runReviewScript(fixture.harness, [
    "--path", fixture.target,
    "--out", outDir,
    "--expect-finding", "not-present",
  ]);

  assert.equal(result.status, 1, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.expectations[0].status, "fail");
  assert.equal(review.gates.some((gate) => gate.gate === "expect-finding"), false);
  assert.equal(review.assessment.verdict, "incomplete");
  assert.equal(review.evidenceCoverage.static.status, "captured");
});

test("clean static and runtime automation remains coverage, not a positive quality score", () => {
  const fixture = cleanStaticHarness();
  const adapter = path.join(fixture.workspace, "playwright");
  const screenshotPng = pngBuffer(320, 240).toString("base64");
  fs.mkdirSync(adapter, { recursive: true });
  fs.writeFileSync(path.join(adapter, "package.json"), JSON.stringify({ main: "index.cjs" }));
  fs.writeFileSync(path.join(adapter, "index.cjs"), `
const fs = require("node:fs");
const cleanMetrics = {
  title: "Clean", width: 320, height: 240, scrollWidth: 320, scrollHeight: 240,
  horizontalOverflow: false, smallHitAreas: [], unnamedButtons: 0, clippedText: [],
  imageIssues: [], contrastIssues: [], animationAudit: { total: 0, running: 0, offscreenRunningCount: 0, offscreenRunning: [] },
  canvasDetails: [], longTasks: [], layoutShifts: [], cls: 0,
  frameStats: { samples: 120, p95: 16, max: 16 }
};
const page = {
  on() {}, async addInitScript() {}, async goto() {}, async waitForTimeout() {},
  locator() { return { async waitFor() {}, async textContent() { return "ready"; }, async getAttribute() { return null; }, async count() { return 1; } }; },
  async screenshot(options) { fs.writeFileSync(options.path, Buffer.from("${screenshotPng}", "base64")); },
  async evaluate() { return cleanMetrics; }, async close() {},
  mouse: { async wheel() {} }, async click() {}, async hover() {}, async fill() {}, async press() {}, url() { return "https://example.test"; }
};
module.exports = { chromium: { launch: async () => ({ version: () => "test-browser", newPage: async () => page, close: async () => {} }) } };
`);
  const actions = writeFixture(fixture.workspace, "actions.json", JSON.stringify({
    name: "clean",
    actions: [{ type: "wait", ms: 1 }],
    assertions: [{ type: "visible", selector: "main" }],
  }));
  const outDir = path.join(fixture.workspace, "clean-report");

  const result = runReviewScript(fixture.harness, [
    "--path", fixture.target,
    "--url", "https://example.test",
    "--actions", actions,
    "--viewport", "320x240",
    "--out", outDir,
    "--strict",
  ], { env: { PLAYWRIGHT_PATH: adapter } });

  assert.equal(result.status, 0, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.evidenceCoverage.static.status, "captured");
  assert.equal(review.evidenceCoverage.runtime.status, "captured");
  assert.equal(review.findings.length, 0);
  assert.equal(review.assessment.total, null);
  assert.equal(review.assessment.verdict, "incomplete");
  assert.ok(Object.values(review.assessment.dimensions).every((dimension) => dimension.status === "unknown" && dimension.score === null));
});
