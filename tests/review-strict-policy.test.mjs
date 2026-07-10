import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { makeWorkspace, readReview, reviewScript, runReviewScript, writeFixture } from "./review-helpers.mjs";

function isolatedHarness(findings) {
  const workspace = makeWorkspace("improve-ui-policy-");
  const scriptDir = path.join(workspace, "scripts");
  fs.mkdirSync(scriptDir, { recursive: true });
  const harness = path.join(scriptDir, "run-interface-review.mjs");
  fs.copyFileSync(reviewScript, harness);
  const detector = path.join(scriptDir, "detect-ui-antipatterns.mjs");
  fs.writeFileSync(detector, [
    'import fs from "node:fs";',
    'const args = process.argv.slice(2);',
    'const out = args[args.indexOf("--out") + 1];',
    `fs.writeFileSync(out, JSON.stringify({ files: 1, findings: ${JSON.stringify(findings)}, summary: {} }, null, 2));`,
  ].join("\n"));
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  return { workspace, harness, target };
}

function finding(severity, classification = "objective", id = `finding-${severity}`) {
  return {
    id,
    severity,
    classification,
    confidence: "high",
    category: "quality",
    message: `${severity} fixture`,
    file: "target.tsx",
    line: 1,
    snippet: "fixture",
  };
}

test("strict blocks objective P0 without manufacturing a dimension quality score", () => {
  const fixture = isolatedHarness([finding("P0")]);
  const outDir = path.join(fixture.workspace, "report");

  const result = runReviewScript(fixture.harness, ["--path", fixture.target, "--out", outDir, "--strict"]);

  assert.equal(result.status, 1, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.findings[0].severity, "P0");
  assert.equal(review.assessment.dimensions.themingDesignSystem.status, "unknown");
  assert.equal(review.assessment.dimensions.themingDesignSystem.score, null);
  assert.deepEqual(review.assessment.dimensions.themingDesignSystem.evidence, ["finding:finding-P0"]);
  assert.equal(review.gates.find((gate) => gate.gate === "p0-p1-unresolved").status, "fail");
  assert.match(fs.readFileSync(path.join(outDir, "README.md"), "utf8"), /\[P0\]\[objective\/high\]\[quality\] finding-P0/);
});

test("strict blocks objective P1 but does not gate advisory P1 by default", () => {
  const objective = isolatedHarness([finding("P1", "objective")]);
  const advisory = isolatedHarness([finding("P1", "advisory")]);

  const objectiveResult = runReviewScript(objective.harness, ["--path", objective.target, "--out", path.join(objective.workspace, "report"), "--strict"]);
  const advisoryResult = runReviewScript(advisory.harness, ["--path", advisory.target, "--out", path.join(advisory.workspace, "report"), "--strict"]);

  assert.equal(objectiveResult.status, 1, objectiveResult.stdout || objectiveResult.stderr);
  assert.equal(advisoryResult.status, 0, advisoryResult.stdout || advisoryResult.stderr);
});

test("strict systemic policy blocks repeated objective P2, not an isolated P2", () => {
  const repeated = isolatedHarness([finding("P2", "objective", "repeat"), finding("P2", "objective", "repeat")]);
  const isolated = isolatedHarness([finding("P2", "objective", "isolated")]);

  const repeatedResult = runReviewScript(repeated.harness, ["--path", repeated.target, "--out", path.join(repeated.workspace, "report"), "--strict"]);
  const isolatedResult = runReviewScript(isolated.harness, ["--path", isolated.target, "--out", path.join(isolated.workspace, "report"), "--strict"]);

  assert.equal(repeatedResult.status, 1, repeatedResult.stdout || repeatedResult.stderr);
  assert.equal(isolatedResult.status, 0, isolatedResult.stdout || isolatedResult.stderr);
});

test("include-advisory and p2-policy all are explicit stricter policies", () => {
  const fixture = isolatedHarness([finding("P2", "advisory", "taste")]);
  const outDir = path.join(fixture.workspace, "report");

  const result = runReviewScript(fixture.harness, [
    "--path", fixture.target,
    "--out", outDir,
    "--strict",
    "--p2-policy", "all",
    "--include-advisory",
  ]);

  assert.equal(result.status, 1, result.stdout || result.stderr);
});
