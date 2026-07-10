import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { makeWorkspace, readReview, runReview, writeFixture } from "./review-helpers.mjs";

test("required runtime and change proof fail without needing strict or fail flags", () => {
  for (const requiredFlag of ["--require-runtime", "--require-change-proof"]) {
    const workspace = makeWorkspace("improve-ui-required-");
    const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
    const outDir = path.join(workspace, "report");

    const result = runReview(["--path", target, requiredFlag, "--out", outDir]);

    assert.equal(result.status, 1, result.stdout || result.stderr);
    const review = readReview(outDir);
    assert.equal(review.assessment.verdict, "blocked");
    const coverage = requiredFlag === "--require-runtime" ? review.evidenceCoverage.runtime : review.evidenceCoverage.changeProof;
    assert.equal(coverage.status, "blocked");
  }
});

test("a blocked URL exits non-zero without an additional failure flag", () => {
  const workspace = makeWorkspace("improve-ui-required-url-");
  const adapter = path.join(workspace, "playwright");
  fs.mkdirSync(adapter, { recursive: true });
  fs.writeFileSync(path.join(adapter, "package.json"), JSON.stringify({ main: "index.cjs" }));
  fs.writeFileSync(path.join(adapter, "index.cjs"), "module.exports={chromium:{launch:async()=>{throw new Error('browser unavailable')}}};");
  const outDir = path.join(workspace, "report");

  const result = runReview(["--url", "https://example.test", "--out", outDir], {
    env: { PLAYWRIGHT_PATH: adapter },
  });

  assert.equal(result.status, 1, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.assessment.verdict, "blocked");
  assert.equal(review.evidenceCoverage.runtime.status, "blocked");
});
