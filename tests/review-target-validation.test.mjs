import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { makeWorkspace, readReview, runReview } from "./review-helpers.mjs";

test("a missing static target is blocked and exits non-zero", () => {
  const workspace = makeWorkspace();
  const outDir = path.join(workspace, "report");
  const missing = path.join(workspace, "does-not-exist");

  const result = runReview(["--path", missing, "--out", outDir, "--strict"]);

  assert.equal(result.status, 2, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.assessment.verdict, "blocked");
  assert.equal(review.evidenceCoverage.static.status, "blocked");
  assert.match(review.ledger.blockers[0].reason, /does not exist/i);
});

test("an existing target with zero supported files is blocked", () => {
  const workspace = makeWorkspace();
  fs.writeFileSync(path.join(workspace, "README.txt"), "not a supported UI source");
  const outDir = path.join(workspace, "report");

  const result = runReview(["--path", workspace, "--out", outDir]);

  assert.equal(result.status, 2, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.assessment.verdict, "blocked");
  assert.match(review.ledger.blockers.map((item) => item.reason).join(" "), /zero supported|no supported/i);
});

test("a relative target remains relative to the caller when invoked below a repository root", () => {
  const workspace = makeWorkspace();
  fs.mkdirSync(path.join(workspace, ".git"));
  const nested = path.join(workspace, "packages", "web");
  fs.mkdirSync(nested, { recursive: true });
  fs.writeFileSync(path.join(nested, "target.tsx"), "export const Target = () => <main />;");
  const outDir = path.join(workspace, "report");

  const result = runReview(["--path", "target.tsx", "--out", outDir, "--strict"], { cwd: nested });

  assert.equal(result.status, 0, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.evidenceCoverage.static.status, "captured");
  assert.equal(review.static.files, 1);
});
