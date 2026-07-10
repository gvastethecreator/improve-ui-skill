import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileUrl, makeWorkspace, readReview, runReview, sha256, pngBuffer, writeFixture } from "./review-helpers.mjs";

test("omitting --out creates a unique temporary report without writing inside the cwd", (t) => {
  const workspace = makeWorkspace("improve-ui-temporary-output-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const reports = [];
  t.after(() => {
    for (const report of reports) fs.rmSync(report, { recursive: true, force: true });
  });

  for (let run = 0; run < 2; run += 1) {
    const result = runReview(["--path", target], { cwd: workspace });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const summary = JSON.parse(result.stdout);
    const report = path.resolve(summary.outDir);
    const relativeToTemp = path.relative(path.resolve(os.tmpdir()), report);
    assert.equal(path.isAbsolute(summary.outDir), true);
    assert.ok(relativeToTemp && relativeToTemp !== ".." && !relativeToTemp.startsWith(`..${path.sep}`));
    assert.equal(summary.outputMode, "temporary");
    assert.equal(readReview(report).metadata.output.mode, "temporary");
    reports.push(report);
  }

  assert.notEqual(reports[0], reports[1]);
  assert.equal(fs.existsSync(path.join(workspace, "output", "improve-ui")), false);
});

test("rerunning an output directory removes only previously owned evidence", () => {
  const workspace = makeWorkspace("improve-ui-owned-output-");
  const html = writeFixture(workspace, "index.html", '<!doctype html><button id="one">One</button><button id="two">Two</button>');
  const one = writeFixture(workspace, "one.json", JSON.stringify({
    actions: [{ type: "click", selector: "#one" }], assertions: [{ type: "visible", selector: "#one" }],
  }));
  const two = writeFixture(workspace, "two.json", JSON.stringify({
    actions: [{ type: "click", selector: "#two" }], assertions: [{ type: "visible", selector: "#two" }],
  }));
  const outDir = path.join(workspace, "report");
  const first = runReview([
    "--url", fileUrl(html),
    "--action-group", `one=${one}`,
    "--action-group", `two=${two}`,
    "--viewport", "320x240",
    "--settle-ms", "0",
    "--out", outDir,
    "--strict",
  ]);
  assert.equal(first.status, 0, first.stdout || first.stderr);
  const firstSummary = JSON.parse(first.stdout);
  const firstReview = readReview(outDir);
  assert.equal(firstSummary.outputMode, "explicit");
  assert.equal(firstReview.metadata.output.mode, "explicit");
  assert.equal(firstReview.metadata.output.directory, path.resolve(outDir));
  const ownedScreenshots = firstReview.runtime.results.flatMap((result) => Object.values(result.artifacts).map((artifact) => artifact.path));
  assert.ok(ownedScreenshots.every((file) => fs.existsSync(file)));
  assert.equal(fs.existsSync(path.join(outDir, "runtime-findings.json")), true);
  const userFile = writeFixture(outDir, "screenshots/user-note.txt", "preserve me");

  const second = runReview(["--path", html, "--out", outDir, "--strict"]);

  assert.equal(second.status, 0, second.stdout || second.stderr);
  assert.equal(JSON.parse(second.stdout).outDir, firstSummary.outDir);
  assert.equal(fs.existsSync(path.join(outDir, "runtime-findings.json")), false);
  assert.ok(ownedScreenshots.every((file) => !fs.existsSync(file)));
  assert.equal(fs.readFileSync(userFile, "utf8"), "preserve me");
  assert.equal(fs.existsSync(path.join(outDir, ".improve-ui-owned.json")), true);
});

test("Windows reruns converge when an action-group name changes only by case", (t) => {
  if (process.platform !== "win32") return t.skip("Windows path comparison regression");
  const workspace = makeWorkspace("improve-ui-case-only-rerun-");
  const html = writeFixture(workspace, "index.html", '<!doctype html><button id="ready">Ready</button>');
  const actions = writeFixture(workspace, "actions.json", JSON.stringify({
    actions: [{ type: "click", selector: "#ready" }], assertions: [{ type: "visible", selector: "#ready" }],
  }));
  const outDir = path.join(workspace, "report");
  const common = ["--url", fileUrl(html), "--viewport", "64x48", "--settle-ms", "0", "--out", outDir, "--strict"];

  const first = runReview([...common, "--action-group", `State=${actions}`]);
  assert.equal(first.status, 0, first.stdout || first.stderr);
  const second = runReview([...common, "--action-group", `state=${actions}`]);

  assert.equal(second.status, 0, second.stdout || second.stderr);
  const marker = JSON.parse(fs.readFileSync(path.join(outDir, ".improve-ui-owned.json"), "utf8"));
  assert.ok(marker.files.some((entry) => entry.path === "screenshots/state-64x48-viewport.png"));
});

test("rerunning preserves a formerly owned report that the user modified", () => {
  const workspace = makeWorkspace("improve-ui-modified-owned-output-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const outDir = path.join(workspace, "report");
  const first = runReview(["--path", target, "--out", outDir, "--strict"]);
  assert.equal(first.status, 0, first.stderr || first.stdout);
  const readme = path.join(outDir, "README.md");
  const userContent = "user changed this report after the review\n";
  fs.writeFileSync(readme, userContent);

  const second = runReview(["--path", target, "--out", outDir, "--strict"]);

  assert.equal(second.status, 2, second.stdout || second.stderr);
  assert.match(second.stderr, /changed since it was recorded|content hash/i);
  assert.equal(fs.readFileSync(readme, "utf8"), userContent);
});

test("a forged ownership marker cannot claim and delete an arbitrary user file", () => {
  const workspace = makeWorkspace("improve-ui-forged-ownership-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const outDir = path.join(workspace, "report");
  const userFile = writeFixture(outDir, "screenshots/user-upload.png", "do not delete\n");
  fs.writeFileSync(path.join(outDir, ".improve-ui-owned.json"), JSON.stringify({
    schemaVersion: 2,
    owner: "improve-ui-review",
    files: [{ path: "screenshots/user-upload.png", sha256: sha256(userFile) }],
  }));

  const result = runReview(["--path", target, "--out", outDir, "--strict"]);

  assert.equal(result.status, 2, result.stdout || result.stderr);
  assert.match(result.stderr, /not a recognized improve-ui review artifact/i);
  assert.equal(fs.readFileSync(userFile, "utf8"), "do not delete\n");
});

test("cleanup validates every recorded hash before deleting any prior artifact", () => {
  const workspace = makeWorkspace("improve-ui-atomic-owned-cleanup-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const outDir = path.join(workspace, "report");
  const priorReview = writeFixture(outDir, "review.json", "prior review\n");
  const screenshot = writeFixture(outDir, "screenshots/state-320x240-viewport.png", "prior screenshot\n");
  const originalScreenshotHash = sha256(screenshot);
  fs.writeFileSync(path.join(outDir, ".improve-ui-owned.json"), JSON.stringify({
    schemaVersion: 2,
    owner: "improve-ui-review",
    files: [
      { path: "review.json", sha256: sha256(priorReview) },
      { path: "screenshots/state-320x240-viewport.png", sha256: originalScreenshotHash },
    ],
  }));
  fs.writeFileSync(screenshot, "user edited screenshot\n");

  const result = runReview(["--path", target, "--out", outDir, "--strict"]);

  assert.equal(result.status, 2, result.stdout || result.stderr);
  assert.equal(fs.readFileSync(priorReview, "utf8"), "prior review\n");
  assert.equal(fs.readFileSync(screenshot, "utf8"), "user edited screenshot\n");
});

test("duplicate ownership entries are rejected before cleanup deletes anything", () => {
  const workspace = makeWorkspace("improve-ui-duplicate-ownership-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const outDir = path.join(workspace, "report");
  const priorReview = writeFixture(outDir, "review.json", "prior review\n");
  const digest = sha256(priorReview);
  fs.writeFileSync(path.join(outDir, ".improve-ui-owned.json"), JSON.stringify({
    schemaVersion: 2,
    owner: "improve-ui-review",
    files: [
      { path: "review.json", sha256: digest },
      { path: "review.json", sha256: digest },
    ],
  }));

  const result = runReview(["--path", target, "--out", outDir, "--strict"]);

  assert.equal(result.status, 2, result.stdout || result.stderr);
  assert.match(result.stderr, /duplicate ownership path/i);
  assert.equal(fs.readFileSync(priorReview, "utf8"), "prior review\n");
});

test("an unowned planned screenshot collision is rejected before runtime can overwrite it", () => {
  const workspace = makeWorkspace("improve-ui-proof-overlap-");
  const html = writeFixture(workspace, "index.html", '<!doctype html><button id="ready">Ready</button>');
  const actions = writeFixture(workspace, "actions.json", JSON.stringify({
    name: "state",
    actions: [{ type: "click", selector: "#ready" }],
    assertions: [{ type: "visible", selector: "#ready" }],
  }));
  const outDir = path.join(workspace, "report");
  const overwritten = writeFixture(outDir, "screenshots/state-64x48-viewport.png", pngBuffer(64, 48, [200, 10, 10, 255]));
  const before = writeFixture(workspace, "before.png", pngBuffer(64, 48, [10, 10, 200, 255]));
  const proof = writeFixture(workspace, "proof.json", JSON.stringify({
    version: 1,
    claim: "The viewport changed.",
    before: { artifact: "before.png", state: "state", viewport: "64x48", kind: "viewport", sha256: sha256(before) },
    after: { artifact: path.relative(workspace, overwritten), state: "state", viewport: "64x48", kind: "viewport", sha256: sha256(overwritten) },
  }));
  const expectedOldHash = sha256(overwritten);

  const result = runReview([
    "--url", fileUrl(html),
    "--actions", actions,
    "--viewport", "64x48",
    "--settle-ms", "0",
    "--proof-manifest", proof,
    "--require-change-proof",
    "--out", outDir,
    "--strict",
  ]);

  assert.equal(result.status, 2, result.stdout || result.stderr);
  assert.match(result.stderr, /output collision|not owned/i);
  assert.equal(sha256(overwritten), expectedOldHash, "the unowned screenshot must be preserved");
});

test("change proof cannot claim a report path that will be overwritten later in the run", () => {
  const workspace = makeWorkspace("improve-ui-proof-future-output-");
  const html = writeFixture(workspace, "index.html", '<!doctype html><button id="ready">Ready</button>');
  const actions = writeFixture(workspace, "actions.json", JSON.stringify({
    name: "state",
    actions: [{ type: "wait", ms: 0 }],
    assertions: [{ type: "visible", selector: "#ready" }],
  }));
  const before = writeFixture(workspace, "before.png", pngBuffer(64, 48, [10, 10, 200, 255]));
  const afterTemplate = writeFixture(workspace, "after-template.png", pngBuffer(64, 48, [200, 10, 10, 255]));
  const outDir = path.join(workspace, "report");
  const futureReadme = path.join(outDir, "README.md");
  const proof = writeFixture(workspace, "proof.json", JSON.stringify({
    version: 1,
    claim: "The viewport changed.",
    before: { artifact: "before.png", state: "state", viewport: "64x48", kind: "viewport", sha256: sha256(before) },
    after: { artifact: "report/README.md", state: "state", viewport: "64x48", kind: "viewport", sha256: sha256(afterTemplate) },
  }));
  const adapter = path.join(workspace, "playwright");
  const screenshotPng = pngBuffer(64, 48).toString("base64");
  const claimedAfterPng = fs.readFileSync(afterTemplate).toString("base64");
  fs.mkdirSync(adapter);
  fs.writeFileSync(path.join(adapter, "package.json"), JSON.stringify({ main: "index.cjs" }));
  fs.writeFileSync(path.join(adapter, "index.cjs"), `
const fs = require("node:fs");
const page = {
  on() {}, async addInitScript() {}, async goto() {}, async waitForTimeout() {},
  locator() { return { async waitFor() {} }; },
  async screenshot(options) { fs.writeFileSync(options.path, Buffer.from("${screenshotPng}", "base64")); },
  async evaluate() {
    fs.writeFileSync(${JSON.stringify(futureReadme)}, Buffer.from("${claimedAfterPng}", "base64"));
    return { title: "Fixture", width: 64, height: 48, scrollWidth: 64, scrollHeight: 48,
      horizontalOverflow: false, smallHitAreas: [], unnamedButtons: 0, clippedText: [], imageIssues: [], contrastIssues: [],
      animationAudit: { total: 0, running: 0, offscreenRunningCount: 0, offscreenRunning: [] }, canvasDetails: [],
      longTasks: [], layoutShifts: [], cls: 0, frameStats: { samples: 1, p95: 16, max: 16 } };
  },
  async close() {}, mouse: { async wheel() {} }, async click() {}, async hover() {}, async fill() {}, async press() {},
  url() { return "https://example.test"; }
};
module.exports = { chromium: { launch: async () => ({ version: () => "test-browser", newPage: async () => page, close: async () => {} }) } };
`);

  const result = runReview([
    "--url", fileUrl(html),
    "--actions", actions,
    "--viewport", "64x48",
    "--settle-ms", "0",
    "--proof-manifest", proof,
    "--require-change-proof",
    "--out", outDir,
    "--strict",
  ], { env: { PLAYWRIGHT_PATH: adapter } });

  assert.equal(result.status, 1, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.evidenceCoverage.changeProof.status, "blocked");
  assert.match(review.ledger.blockers.map((blocker) => blocker.reason).join(" "), /overlap|reserved|owned output/i);
  assert.notEqual(sha256(futureReadme), sha256(afterTemplate), "the report replaces the transient claimed artifact");
});

for (const aliasKind of ["symlink", "hard-link"]) {
  test(`change proof rejects a ${aliasKind} alias of a same-run screenshot`, (t) => {
    const fixture = sameRunScreenshotAliasFixture(aliasKind);
    if (!fixture) return t.skip(`${aliasKind} creation unavailable`);

    const result = runReview(fixture.args, { env: { PLAYWRIGHT_PATH: fixture.adapter } });

    assert.equal(result.status, 1, result.stdout || result.stderr);
    const review = readReview(fixture.outDir);
    assert.equal(review.evidenceCoverage.changeProof.status, "blocked");
    assert.match(review.ledger.blockers.map((blocker) => blocker.reason).join(" "), /alias|physical|reserved|owned output|overlap/i);
  });
}

test("a screenshot written before a later capture failure remains owned and does not wedge the next run", () => {
  const workspace = makeWorkspace("improve-ui-partial-screenshot-");
  const html = writeFixture(workspace, "index.html", '<!doctype html><button id="ready">Ready</button>');
  const actions = writeFixture(workspace, "actions.json", JSON.stringify({
    name: "state",
    actions: [{ type: "wait", ms: 0 }],
    assertions: [{ type: "visible", selector: "#ready" }],
  }));
  const adapter = path.join(workspace, "playwright");
  const screenshotPng = pngBuffer(64, 48).toString("base64");
  fs.mkdirSync(adapter);
  fs.writeFileSync(path.join(adapter, "package.json"), JSON.stringify({ main: "index.cjs" }));
  fs.writeFileSync(path.join(adapter, "index.cjs"), `
const fs = require("node:fs");
let screenshotCount = 0;
const page = {
  on() {}, async addInitScript() {}, async goto() {}, async waitForTimeout() {},
  locator() { return { async waitFor() {} }; },
  async screenshot(options) {
    screenshotCount += 1;
    if (screenshotCount === 2) throw new Error("full-page capture exploded");
    fs.writeFileSync(options.path, Buffer.from("${screenshotPng}", "base64"));
  },
  async evaluate() { return { title: "Fixture", width: 64, height: 48, scrollWidth: 64, scrollHeight: 48,
    horizontalOverflow: false, smallHitAreas: [], unnamedButtons: 0, clippedText: [], imageIssues: [], contrastIssues: [],
    animationAudit: { total: 0, running: 0, offscreenRunningCount: 0, offscreenRunning: [] }, canvasDetails: [],
    longTasks: [], layoutShifts: [], cls: 0, frameStats: { samples: 1, p95: 16, max: 16 } }; },
  async close() {}, mouse: { async wheel() {} }, async click() {}, async hover() {}, async fill() {}, async press() {},
  url() { return "https://example.test"; }
};
module.exports = { chromium: { launch: async () => ({ version: () => "test-browser", newPage: async () => page, close: async () => {} }) } };
`);
  const outDir = path.join(workspace, "report");
  const viewportScreenshot = path.join(outDir, "screenshots", "state-64x48-viewport.png");

  const first = runReview([
    "--url", fileUrl(html), "--actions", actions, "--viewport", "64x48", "--settle-ms", "0", "--out", outDir, "--strict",
  ], { env: { PLAYWRIGHT_PATH: adapter } });

  assert.equal(first.status, 1, first.stdout || first.stderr);
  assert.equal(fs.existsSync(viewportScreenshot), true);
  const marker = JSON.parse(fs.readFileSync(path.join(outDir, ".improve-ui-owned.json"), "utf8"));
  assert.equal(marker.files.some((entry) => entry.path === "screenshots/state-64x48-viewport.png" && entry.sha256 === sha256(viewportScreenshot)), true);

  const second = runReview(["--path", html, "--out", outDir, "--strict"]);

  assert.equal(second.status, 0, second.stdout || second.stderr);
  assert.equal(fs.existsSync(viewportScreenshot), false);
});

test("an owned descendant whose name starts with two dots is still inside the output root", () => {
  const workspace = makeWorkspace("improve-ui-dotdot-name-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const outDir = path.join(workspace, "report");
  const oldEvidence = writeFixture(outDir, "screenshots/..evidence-320x240-viewport.png", "owned stale evidence");
  fs.writeFileSync(path.join(outDir, ".improve-ui-owned.json"), JSON.stringify({
    schemaVersion: 2,
    owner: "improve-ui-review",
    files: [{ path: "screenshots/..evidence-320x240-viewport.png", sha256: sha256(oldEvidence) }],
  }));

  const result = runReview(["--path", target, "--out", outDir, "--strict"]);

  assert.equal(result.status, 0, result.stdout || result.stderr);
  assert.equal(fs.existsSync(oldEvidence), false);
});

function sameRunScreenshotAliasFixture(aliasKind) {
  const workspace = makeWorkspace(`improve-ui-proof-${aliasKind}-alias-`);
  const html = writeFixture(workspace, "index.html", '<!doctype html><button id="ready">Ready</button>');
  const actions = writeFixture(workspace, "actions.json", JSON.stringify({
    name: "state", actions: [{ type: "wait", ms: 0 }], assertions: [{ type: "visible", selector: "#ready" }],
  }));
  const outDir = path.join(workspace, "report");
  const screenshotsDir = path.join(outDir, "screenshots");
  fs.mkdirSync(screenshotsDir, { recursive: true });
  const screenshotName = "state-64x48-viewport.png";
  let aliasPath;
  if (aliasKind === "symlink") {
    const aliasDir = path.join(workspace, "proof-alias");
    try {
      fs.symlinkSync(screenshotsDir, aliasDir, process.platform === "win32" ? "junction" : "dir");
    } catch {
      return null;
    }
    aliasPath = path.join(aliasDir, screenshotName);
  } else {
    const probe = writeFixture(workspace, "link-probe-source", "probe");
    const probeAlias = path.join(workspace, "link-probe-alias");
    try {
      fs.linkSync(probe, probeAlias);
      fs.unlinkSync(probeAlias);
    } catch {
      return null;
    }
    aliasPath = path.join(workspace, "proof-hard-link.png");
  }
  const before = writeFixture(workspace, "before.png", pngBuffer(64, 48, [10, 10, 200, 255]));
  const afterBytes = pngBuffer(64, 48, [200, 10, 10, 255]);
  const afterTemplate = writeFixture(workspace, "after-template.png", afterBytes);
  const proof = writeFixture(workspace, "proof.json", JSON.stringify({
    version: 1,
    claim: "The viewport changed.",
    before: { artifact: "before.png", state: "state", viewport: "64x48", kind: "viewport", sha256: sha256(before) },
    after: { artifact: path.relative(workspace, aliasPath), state: "state", viewport: "64x48", kind: "viewport", sha256: sha256(afterTemplate) },
  }));
  const adapter = path.join(workspace, "playwright");
  fs.mkdirSync(adapter);
  fs.writeFileSync(path.join(adapter, "package.json"), JSON.stringify({ main: "index.cjs" }));
  fs.writeFileSync(path.join(adapter, "index.cjs"), `
const fs = require("node:fs");
const bytes = Buffer.from("${afterBytes.toString("base64")}", "base64");
const aliasPath = ${JSON.stringify(aliasKind === "hard-link" ? aliasPath : null)};
const page = {
  on() {}, async addInitScript() {}, async goto() {}, async waitForTimeout() {},
  locator() { return { async waitFor() {} }; },
  async screenshot(options) {
    fs.writeFileSync(options.path, bytes);
    if (aliasPath && options.path.endsWith("-viewport.png")) fs.linkSync(options.path, aliasPath);
  },
  async evaluate() { return { title: "Fixture", width: 64, height: 48, scrollWidth: 64, scrollHeight: 48,
    horizontalOverflow: false, smallHitAreas: [], unnamedButtons: 0, clippedText: [], imageIssues: [], contrastIssues: [],
    animationAudit: { total: 0, running: 0, offscreenRunningCount: 0, offscreenRunning: [] }, canvasDetails: [],
    longTasks: [], layoutShifts: [], cls: 0, frameStats: { samples: 1, p95: 16, max: 16 } }; },
  async close() {}, mouse: { async wheel() {} }, async click() {}, async hover() {}, async fill() {}, async press() {},
  url() { return "https://example.test"; }
};
module.exports = { chromium: { launch: async () => ({ version: () => "test-browser", newPage: async () => page, close: async () => {} }) } };
`);
  return {
    adapter,
    outDir,
    args: ["--url", fileUrl(html), "--actions", actions, "--viewport", "64x48", "--settle-ms", "0",
      "--proof-manifest", proof, "--require-change-proof", "--out", outDir, "--strict"],
  };
}
