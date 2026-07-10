import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileUrl, makeWorkspace, readReview, runReview, writeFixture } from "./review-helpers.mjs";

test("24px is the automated hit-area boundary while 23px remains an advisory lead", () => {
  const workspace = makeWorkspace("improve-ui-hit-area-");
  const html = writeFixture(workspace, "index.html", `<!doctype html><html><head><meta charset="utf-8">
<style>button{box-sizing:border-box;padding:0}.small{width:23px;height:23px}.boundary{width:24px;height:24px}</style></head>
<body><button class="small" id="small">S</button><button class="boundary" id="boundary">B</button></body></html>`);
  const actions = writeFixture(workspace, "actions.json", JSON.stringify({
    name: "sizes",
    actions: [{ type: "click", selector: "#small" }],
    assertions: [{ type: "visible", selector: "#boundary" }],
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
  const areas = review.runtime.results[0].metrics.smallHitAreas;
  assert.equal(areas.some((area) => area.width === 23 || area.height === 23), true);
  assert.equal(areas.some((area) => area.width === 24 && area.height === 24), false);
  const finding = review.findings.find((candidate) => candidate.id === "small-hit-area");
  assert.equal(finding.classification, "advisory");
  assert.match(finding.message, /24px WCAG.*44px is enhanced/i);
});
