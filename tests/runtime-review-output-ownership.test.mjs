import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileUrl, makeWorkspace, readReview, runReview, writeFixture } from "./review-helpers.mjs";

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
