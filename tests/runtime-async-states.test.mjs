import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileUrl, makeWorkspace, readReview, runReview, writeFixture } from "./review-helpers.mjs";

const asyncStates = ["empty", "loading", "error", "permission", "long-content", "slow-network", "rapid-click"];
const hasPlaywright = [
  process.env.PLAYWRIGHT_PATH,
  path.join(process.cwd(), "node_modules", "playwright"),
  path.join(os.tmpdir(), "improve-ui-playwright", "node_modules", "playwright"),
].filter(Boolean).some((candidate) => fs.existsSync(candidate));

test("listing async state names without executing them is blocked", () => {
  const workspace = makeWorkspace("improve-ui-async-labels-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const outDir = path.join(workspace, "report");

  const result = runReview([
    "--path", target,
    "--async-ui",
    "--states", asyncStates.join(","),
    "--out", outDir,
    "--strict",
  ]);

  assert.equal(result.status, 1, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.evidenceCoverage.asyncStates.status, "blocked");
  assert.deepEqual(review.evidenceCoverage.asyncStates.covered, []);
  assert.deepEqual(review.evidenceCoverage.asyncStates.missing, asyncStates);
});

test("every async state needs an action, assertion, successful run, and artifacts", { skip: !hasPlaywright }, () => {
  const workspace = makeWorkspace("improve-ui-async-proof-");
  const stateMarkup = asyncStates.map((state) => `<button id="trigger-${state}">Open ${state}</button><output id="value-${state}">${state}</output>`).join("");
  const html = writeFixture(workspace, "index.html", `<!doctype html><html><head><meta charset="utf-8">
<style>body{margin:0;background:#fff;color:#111}button{width:100px;height:44px}</style></head>
<body>${stateMarkup}</body></html>`);
  const outDir = path.join(workspace, "report");
  const groupArgs = asyncStates.flatMap((state) => {
    const actionFile = writeFixture(workspace, `${state}.json`, JSON.stringify({
      actions: [{ type: "click", selector: `#trigger-${state}` }],
      assertions: [{ type: "text", selector: `#value-${state}`, equals: state }],
    }));
    return ["--action-group", `${state}=${actionFile}`];
  });

  const result = runReview([
    "--url", fileUrl(html),
    ...groupArgs,
    "--async-ui",
    "--viewport", "320x240",
    "--settle-ms", "0",
    "--p2-policy", "none",
    "--out", outDir,
    "--strict",
  ]);

  assert.equal(result.status, 0, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.evidenceCoverage.asyncStates.status, "captured");
  assert.deepEqual(review.evidenceCoverage.asyncStates.covered, asyncStates);
  assert.equal(review.runtime.results.length, asyncStates.length);
  assert.ok(review.runtime.results.every((runtimeResult) => runtimeResult.ok && runtimeResult.artifacts.viewport && runtimeResult.artifacts.fullPage));
});

test("renaming one generic async probe seven times is blocked as duplicate evidence", () => {
  const workspace = makeWorkspace("improve-ui-async-duplicates-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const groupArgs = asyncStates.flatMap((state) => {
    const generic = writeFixture(workspace, `${state}.json`, JSON.stringify({
      actions: [{ type: "wait", ms: 0 }],
      assertions: [{ type: "visible", selector: "main" }],
    }));
    return ["--action-group", `${state}=${generic}`];
  });
  const outDir = path.join(workspace, "report");

  const result = runReview(["--path", target, ...groupArgs, "--async-ui", "--out", outDir, "--strict"]);

  assert.equal(result.status, 1, result.stdout || result.stderr);
  const coverage = readReview(outDir).evidenceCoverage.asyncStates;
  assert.equal(coverage.status, "blocked");
  assert.ok(coverage.invalid.every((entry) => entry.reasons.some((reason) => /duplicate action\/assertion signature/i.test(reason))));
});
