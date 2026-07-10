import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { runNode, tempDir, writeFile } from "./helpers/cli.mjs";
import { fileUrl, readReview, runReview } from "./review-helpers.mjs";

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

test("component-polish after publishes a runnable open, closed, focus, and command contract", () => {
  const caseRoot = path.join(casesRoot, "component-polish");
  const fixture = JSON.parse(fs.readFileSync(path.join(caseRoot, "case.json"), "utf8"));
  assert.equal(fixture.runtimeAfter, "after/fixture.html");
  assert.equal(fixture.runtimeSource, "after/CommandMenu.js");
  const runtimeSource = path.join(caseRoot, fixture.runtimeSource);
  assert.equal(fs.existsSync(runtimeSource), true, `Missing runtime source: ${runtimeSource}`);
  const runtimeFixture = path.join(caseRoot, fixture.runtimeAfter);
  assert.equal(fs.existsSync(runtimeFixture), true, `Missing runtime fixture: ${runtimeFixture}`);
  assert.match(fs.readFileSync(runtimeFixture, "utf8"), /<script src="\.\/CommandMenu\.js"><\/script>/);

  const workspace = tempDir("improve-ui-component-polish-runtime");
  const closed = writeFile(workspace, "closed.json", JSON.stringify({
    name: "closed",
    actions: [],
    assertions: [{ type: "hidden", selector: "#commands" }],
  }));
  const open = writeFile(workspace, "open.json", JSON.stringify({
    name: "open",
    actions: [{ type: "click", selector: "#command-menu-trigger" }],
    assertions: [
      { type: "visible", selector: "#commands" },
      { type: "attribute", selector: "#command-menu-trigger", name: "aria-expanded", equals: "true" },
      { type: "focused", selector: "#recent-project" },
    ],
  }));
  const command = writeFile(workspace, "command.json", JSON.stringify({
    name: "command",
    actions: [
      { type: "click", selector: "#command-menu-trigger" },
      { type: "click", selector: "#recent-project" },
    ],
    assertions: [{ type: "attribute", selector: "body", name: "data-command", equals: "recent-project" }],
  }));
  const outDir = path.join(workspace, "report");
  const result = runReview([
    "--url", fileUrl(runtimeFixture),
    "--action-group", `closed=${closed}`,
    "--action-group", `open=${open}`,
    "--action-group", `command=${command}`,
    "--viewport", "640x480",
    "--settle-ms", "0",
    "--out", outDir,
    "--require-runtime",
    "--strict",
  ]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const review = readReview(outDir);
  assert.equal(review.runtime.results.length, 3);
  assert.equal(review.runtime.results.every(({ ok }) => ok), true);
});

function scan(target) {
  const result = runNode(detector, ["--json", target], { cwd: repoRoot });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}
