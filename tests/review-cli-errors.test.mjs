import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { makeWorkspace, readReview, runReview, writeFixture } from "./review-helpers.mjs";

test("help exits zero on stdout while missing or unknown arguments remain usage errors", () => {
  const help = runReview(["--help"]);
  const noArgs = runReview([]);
  const unknown = runReview(["--not-a-real-option"]);

  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /^Usage:/);
  assert.match(help.stdout, /omit --out[^.]+temporary directory/i);
  assert.match(help.stdout, /explicit --out[^.]+durable/i);
  assert.equal(help.stderr, "");
  assert.equal(noArgs.status, 2);
  assert.match(noArgs.stderr, /^Usage:/);
  assert.equal(unknown.status, 2);
  assert.match(unknown.stderr, /Unknown option/);
});

test("dead aggregate-score gates are rejected instead of implying automated quality scoring", () => {
  for (const args of [["--fail-verdict", "good"], ["--fail-under-score", "14"]]) {
    const result = runReview(args);
    assert.equal(result.status, 2, result.stdout || result.stderr);
    assert.match(result.stderr, /Unknown option/);
  }
});

test("expect-verdict accepts only verdicts the automated harness can produce", () => {
  const result = runReview(["--expect-verdict", "excellent"]);
  assert.equal(result.status, 2, result.stdout || result.stderr);
  assert.match(result.stderr, /expected blocked or incomplete/i);
});

test("duplicate viewports and extra positional targets are rejected", () => {
  const workspace = makeWorkspace("improve-ui-cli-collisions-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const extra = writeFixture(workspace, "extra.tsx", "export const Extra = () => <aside />;");
  const cases = [
    ["--path", target, "--viewport", "320x240", "--viewport", "320x240"],
    [target, extra],
  ];

  for (const args of cases) {
    const result = runReview(args);
    assert.equal(result.status, 2, result.stdout || result.stderr);
    assert.match(result.stderr, /duplicate viewport|unexpected positional/i);
  }
});

test("value-taking options reject a missing value with exit 2 and no stack trace", () => {
  const workspace = makeWorkspace("improve-ui-cli-values-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const cases = [
    { args: ["--path"], flag: "--path" },
    { args: ["--path", target, "--proof-manifest"], flag: "--proof-manifest" },
    { args: ["--path", target, "--action-group"], flag: "--action-group" },
  ];

  for (const entry of cases) {
    const result = runReview(entry.args);
    assert.equal(result.status, 2, result.stdout || result.stderr);
    assert.match(result.stderr, new RegExp(`Missing value for ${entry.flag}`));
    assert.doesNotMatch(result.stderr, /\n\s*at\s|file:\/\//i);
  }
});

test("invalid action JSON and schema fail as controlled CLI errors", () => {
  const workspace = makeWorkspace("improve-ui-cli-actions-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const invalidJson = writeFixture(workspace, "invalid.json", "{not json");
  const invalidSchema = writeFixture(workspace, "schema.json", JSON.stringify({ assertions: [] }));

  for (const actionFile of [invalidJson, invalidSchema]) {
    const result = runReview(["--path", target, "--actions", actionFile]);
    assert.equal(result.status, 2, result.stdout || result.stderr);
    assert.match(result.stderr, /Invalid action group:/i);
    assert.doesNotMatch(result.stderr, /\n\s*at\s|file:\/\//i);
  }
});

test("invalid proof JSON emits a legible blocked report and exits non-zero", () => {
  const workspace = makeWorkspace("improve-ui-cli-proof-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const proof = writeFixture(workspace, "proof.json", "{not json");
  const outDir = path.join(workspace, "report");

  const result = runReview(["--path", target, "--proof-manifest", proof, "--out", outDir]);

  assert.notEqual(result.status, 0, result.stdout || result.stderr);
  assert.doesNotMatch(result.stderr, /\n\s*at\s|file:\/\//i);
  const review = readReview(outDir);
  assert.equal(review.assessment.verdict, "blocked");
  assert.equal(review.evidenceCoverage.changeProof.status, "blocked");
  assert.match(review.ledger.blockers.map((blocker) => blocker.reason).join(" "), /could not be loaded.*json/i);
});

test("inline option values retain embedded equals characters", () => {
  const workspace = makeWorkspace("improve-ui-cli-equals-");
  const outDir = path.join(workspace, "report");
  const url = "https://example.invalid/path?mode=a=b";
  const adapter = path.join(workspace, "playwright");
  fs.mkdirSync(adapter, { recursive: true });
  fs.writeFileSync(path.join(adapter, "package.json"), JSON.stringify({ main: "index.cjs" }));
  fs.writeFileSync(path.join(adapter, "index.cjs"), "module.exports={chromium:{launch:async()=>{throw new Error('expected test stop')}}};");

  const result = runReview([`--url=${url}`, `--out=${outDir}`], {
    env: { PLAYWRIGHT_PATH: adapter },
  });

  // Runtime may be blocked, but parsing must preserve the complete URL in the report.
  const review = readReview(outDir);
  assert.equal(review.target.url, url);
  assert.notEqual(result.status, 2, result.stdout || result.stderr);
});
