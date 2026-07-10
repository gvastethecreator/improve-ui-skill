import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileUrl, makeWorkspace, readReview, runReview, writeFixture } from "./review-helpers.mjs";

test("horizontal overflow remains captured advisory evidence when full-page pixels exceed the viewport", () => {
  const workspace = makeWorkspace("improve-ui-overflow-");
  const html = writeFixture(workspace, "index.html", `<!doctype html><html><head><meta charset="utf-8">
<style>body{margin:0}.wide{width:500px;height:100px}</style></head><body><button class="wide" id="wide">Wide</button></body></html>`);
  const actions = writeFixture(workspace, "actions.json", JSON.stringify({
    name: "overflow",
    actions: [{ type: "click", selector: "#wide" }],
    assertions: [{ type: "visible", selector: "#wide" }],
  }));
  const outDir = path.join(workspace, "report");

  const result = runReview([
    "--url", fileUrl(html),
    "--actions", actions,
    "--viewport", "320x240",
    "--settle-ms", "0",
    "--out", outDir,
    "--strict",
  ]);

  assert.equal(result.status, 0, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.evidenceCoverage.runtime.status, "captured");
  const runtime = review.runtime.results[0];
  assert.equal(runtime.artifacts.viewport.pixelWidth, 320);
  assert.ok(runtime.artifacts.fullPage.pixelWidth >= 500);
  const overflow = review.findings.find((finding) => finding.id === "horizontal-overflow");
  assert.equal(overflow.classification, "advisory");
});
