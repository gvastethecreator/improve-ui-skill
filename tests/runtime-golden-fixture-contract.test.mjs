import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { tempDir, writeFile } from "./helpers/cli.mjs";
import { fileUrl, readReview, runReview } from "./review-helpers.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const casesRoot = path.join(repoRoot, "SKILLS", "improve-ui", "fixtures", "cases");

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
