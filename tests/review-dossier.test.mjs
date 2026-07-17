import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { makeWorkspace, runReview, writeFixture } from "./review-helpers.mjs";

test("review harness publishes a synchronized Markdown and HTML dossier inside safe ownership", () => {
  const workspace = makeWorkspace("improve-ui-dossier-");
  const target = writeFixture(workspace, "App.tsx", "export const App = () => <main><h1>Interface</h1></main>;");
  const outDir = path.join(workspace, "report");

  const first = runReview(["--path", target, "--out", outDir]);

  assert.equal(first.status, 0, first.stderr || first.stdout);
  const summary = JSON.parse(first.stdout);
  const expected = ["review.json", "README.md", "report-manifest.json", "report.md", "report.html"];
  for (const name of expected) assert.equal(fs.existsSync(path.join(outDir, name)), true, `missing ${name}`);
  assert.equal(summary.dossier.assets, 0);
  assert.match(summary.dossier.markdown, /report\.md$/);
  assert.match(summary.dossier.html, /report\.html$/);

  const manifest = JSON.parse(fs.readFileSync(path.join(outDir, "report-manifest.json"), "utf8"));
  const markdown = fs.readFileSync(path.join(outDir, "report.md"), "utf8");
  const html = fs.readFileSync(path.join(outDir, "report.html"), "utf8");
  const readme = fs.readFileSync(path.join(outDir, "README.md"), "utf8");
  const ownership = JSON.parse(fs.readFileSync(path.join(outDir, ".improve-ui-owned.json"), "utf8"));
  assert.equal(manifest.title, "Interface evidence review");
  assert.match(markdown, /^# Interface evidence review$/m);
  assert.match(html, /Improve UI evidence dossier/);
  assert.match(readme, /Design dossier Markdown:/);
  assert.ok(ownership.files.some((entry) => entry.path === "report.md"));
  assert.ok(ownership.files.some((entry) => entry.path === "report.html"));

  const rerun = runReview(["--path", target, "--out", outDir]);
  assert.equal(rerun.status, 0, rerun.stderr || rerun.stdout);
});
