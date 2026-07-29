import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { runNode } from "./helpers/cli.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const detector = path.join(repoRoot, "SKILLS", "improve-ui", "scripts", "detect-ui-antipatterns.mjs");
const casesRoot = path.join(repoRoot, "SKILLS", "improve-ui", "fixtures", "cases");

for (const caseName of fs.readdirSync(casesRoot).sort()) {
  const caseRoot = path.join(casesRoot, caseName);
  const manifestPath = path.join(caseRoot, "case.json");
  if (!fs.statSync(caseRoot).isDirectory() || !fs.existsSync(manifestPath)) continue;

  test(`${caseName} is an executable before/after calibration case`, () => {
    const fixture = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    assert.equal(fixture.name, caseName);
    assert.ok(fixture.surface);
    assert.ok(fixture.expectedBefore.length >= 3, "A golden case must exercise several distinct weaknesses.");
    assert.deepEqual(fixture.expectedAfterAbsent, fixture.expectedBefore);

    const before = scan(path.join(caseRoot, "before"));
    const after = scan(path.join(caseRoot, "after"));
    const beforeIds = new Set(before.findings.map(({ id }) => id));
    const afterIds = new Set(after.findings.map(({ id }) => id));

    for (const finding of fixture.expectedBefore) {
      assert.equal(beforeIds.has(finding), true, `Expected ${finding} in ${caseName}/before.`);
    }
    for (const finding of fixture.expectedAfterAbsent) {
      assert.equal(afterIds.has(finding), false, `Expected ${finding} to be removed from ${caseName}/after.`);
    }

    const beforeStrict = runNode(detector, ["--strict", path.join(caseRoot, "before")], { cwd: repoRoot });
    const afterStrict = runNode(detector, ["--strict", path.join(caseRoot, "after")], { cwd: repoRoot });
    assert.equal(beforeStrict.status, 1, beforeStrict.stderr || beforeStrict.stdout);
    assert.equal(afterStrict.status, 0, afterStrict.stderr || afterStrict.stdout);
  });
}

function scan(target) {
  const result = runNode(detector, ["--json", target], { cwd: repoRoot });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}
