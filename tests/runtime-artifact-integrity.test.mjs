import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { makeWorkspace, pngBuffer, readReview, reviewScript, runReviewScript, writeFixture } from "./review-helpers.mjs";

function fakeRuntimeHarness({ screenshotSource, logFile = null }) {
  const workspace = makeWorkspace("improve-ui-runtime-artifact-");
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
  fs.mkdirSync(adapter, { recursive: true });
  fs.writeFileSync(path.join(adapter, "package.json"), JSON.stringify({ main: "index.cjs" }));
  fs.writeFileSync(path.join(adapter, "index.cjs"), `
const fs = require("node:fs");
const logFile = ${JSON.stringify(logFile)};
const log = (value) => { if (logFile) fs.appendFileSync(logFile, JSON.stringify(value) + "\\n"); };
const cleanMetrics = {
  title: "Clean", width: 320, height: 240, scrollWidth: 320, scrollHeight: 240,
  horizontalOverflow: false, smallHitAreas: [], unnamedButtons: 0, clippedText: [], imageIssues: [], contrastIssues: [],
  animationAudit: { total: 0, running: 0, offscreenRunningCount: 0, offscreenRunning: [] }, canvasDetails: [],
  longTasks: [], layoutShifts: [], cls: 0, frameStats: { samples: 120, p95: 16, max: 16 }
};
const page = {
  on() {}, async addInitScript() {}, async goto() { return { status: () => 200, url: () => "https://example.test" }; },
  async waitForTimeout(ms) { log({ wait: ms }); },
  locator() { return { async waitFor() {} }; },
  async screenshot(options) { ${screenshotSource} },
  async evaluate() { return cleanMetrics; }, async close() {},
  mouse: { async wheel(x, y) { log({ wheel: [x, y] }); } },
  async click() {}, async hover() {}, async fill() {}, async press() {}, url() { return "https://example.test"; }
};
module.exports = { chromium: { launch: async () => ({ version: () => "test-browser", newPage: async () => page, close: async () => {} }) } };
`);
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  return { workspace, harness, adapter, target };
}

function runFixture(fixture, actions) {
  const actionFile = writeFixture(fixture.workspace, "actions.json", JSON.stringify(actions));
  const outDir = path.join(fixture.workspace, "report");
  const result = runReviewScript(fixture.harness, [
    "--path", fixture.target,
    "--url", "https://example.test",
    "--actions", actionFile,
    "--viewport", "320x240",
    "--settle-ms", "0",
    "--out", outDir,
    "--strict",
  ], { env: { PLAYWRIGHT_PATH: fixture.adapter } });
  return { result, review: readReview(outDir) };
}

test("text bytes named png cannot satisfy runtime artifact evidence", () => {
  const fixture = fakeRuntimeHarness({ screenshotSource: 'fs.writeFileSync(options.path, Buffer.from("not a png screenshot"));' });
  const { result, review } = runFixture(fixture, {
    name: "state",
    actions: [{ type: "wait", ms: 0 }],
    assertions: [{ type: "visible", selector: "main" }],
  });

  assert.equal(result.status, 1, result.stdout || result.stderr);
  assert.equal(review.evidenceCoverage.runtime.status, "blocked");
  assert.equal(review.runtime.results[0].ok, false);
  assert.equal(review.runtime.results[0].phase, "artifact");
});

test("zero-valued scroll and wait inputs are preserved instead of replaced by defaults", () => {
  const workspace = makeWorkspace("improve-ui-zero-values-");
  const logFile = path.join(workspace, "calls.jsonl");
  const fixture = fakeRuntimeHarness({
    screenshotSource: `fs.writeFileSync(options.path, Buffer.from("${pngBuffer(320, 240).toString("base64")}", "base64"));`,
    logFile,
  });
  const { result } = runFixture(fixture, {
    name: "zeroes",
    actions: [{ type: "scroll", x: 0, y: 0 }, { type: "wait", ms: 0 }],
    assertions: [{ type: "visible", selector: "main" }],
  });

  assert.equal(result.status, 0, result.stdout || result.stderr);
  const calls = fs.readFileSync(logFile, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
  assert.ok(calls.some((entry) => entry.wheel?.[0] === 0 && entry.wheel?.[1] === 0));
  assert.ok(calls.some((entry) => entry.wait === 0));
});
