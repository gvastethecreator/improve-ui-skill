import assert from "node:assert/strict";
import path from "node:path";
import { once } from "node:events";
import { spawn } from "node:child_process";
import test from "node:test";
import { makeWorkspace, readReview, runReview, writeFixture } from "./review-helpers.mjs";

async function startFixtureServer(workspace) {
  const serverFile = writeFixture(workspace, "server.mjs", `
import http from "node:http";
const pages = {
  "/main-404": [404, '<!doctype html><button id="ready">Rendered error document</button>'],
  "/main-200": [200, '<!doctype html><script src="/missing.js"></script><button id="ready">Healthy document</button>'],
  "/ephemeral": [200, '<!doctype html><button id="show">Show</button><div id="panel" hidden>Panel</div><script>show.onclick=()=>{panel.hidden=false;setTimeout(()=>panel.hidden=true,50)}</script>'],
};
const server = http.createServer((request, response) => {
  const page = pages[request.url];
  if (page) {
    response.writeHead(page[0], { "content-type": "text/html; charset=utf-8" });
    response.end(page[1]);
    return;
  }
  response.writeHead(404, { "content-type": "application/javascript" });
  response.end("throw new Error('missing subresource')");
});
server.listen(0, "127.0.0.1", () => process.stdout.write(String(server.address().port) + "\\n"));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
`);
  const child = spawn(process.execPath, [serverFile], { cwd: workspace, stdio: ["ignore", "pipe", "pipe"] });
  let stderr = "";
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  child.stdout.setEncoding("utf8");
  const port = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`fixture server timeout: ${stderr}`)), 5_000);
    child.once("error", reject);
    child.stdout.once("data", (chunk) => {
      clearTimeout(timeout);
      resolve(Number(String(chunk).trim()));
    });
  });
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    async close() {
      if (child.exitCode !== null) return;
      child.kill();
      await once(child, "exit");
    },
  };
}

function visibleAction(workspace, selector = "#ready") {
  return writeFixture(workspace, "actions.json", JSON.stringify({
    name: "state",
    actions: [{ type: "click", selector }],
    assertions: [{ type: "visible", selector }],
  }));
}

test("a 404 main document is blocked even when its HTML renders and assertions pass", async () => {
  const workspace = makeWorkspace("improve-ui-main-http-");
  const server = await startFixtureServer(workspace);
  try {
    const outDir = path.join(workspace, "report");
    const result = runReview([
      "--url", `${server.baseUrl}/main-404`,
      "--actions", visibleAction(workspace),
      "--viewport", "320x240",
      "--settle-ms", "0",
      "--out", outDir,
      "--strict",
    ]);

    assert.equal(result.status, 1, result.stdout || result.stderr);
    const review = readReview(outDir);
    assert.equal(review.assessment.verdict, "blocked");
    assert.equal(review.evidenceCoverage.runtime.status, "blocked");
    assert.equal(review.runtime.results[0].ok, false);
    assert.equal(review.runtime.results[0].phase, "navigation");
    const finding = review.findings.find((candidate) => candidate.id === "main-document-http-error");
    assert.equal(finding.classification, "objective");
    assert.equal(finding.severity, "P1");
  } finally {
    await server.close();
  }
});

test("a 200 main document can pass while a subresource 404 remains advisory", async () => {
  const workspace = makeWorkspace("improve-ui-subresource-http-");
  const server = await startFixtureServer(workspace);
  try {
    const outDir = path.join(workspace, "report");
    const result = runReview([
      "--url", `${server.baseUrl}/main-200`,
      "--actions", visibleAction(workspace),
      "--viewport", "320x240",
      "--settle-ms", "0",
      "--out", outDir,
      "--strict",
    ]);

    assert.equal(result.status, 0, result.stdout || result.stderr);
    const review = readReview(outDir);
    assert.equal(review.evidenceCoverage.runtime.status, "captured");
    assert.equal(review.runtime.results[0].ok, true);
    const finding = review.findings.find((candidate) => candidate.id === "bad-http-responses");
    assert.equal(finding.classification, "advisory");
    assert.match(finding.snippet, /404.*missing\.js/);
  } finally {
    await server.close();
  }
});

test("settle happens before the final assertion so an ephemeral state cannot pass", async () => {
  const workspace = makeWorkspace("improve-ui-ephemeral-state-");
  const server = await startFixtureServer(workspace);
  try {
    const actions = writeFixture(workspace, "ephemeral.json", JSON.stringify({
      name: "ephemeral",
      actions: [{ type: "click", selector: "#show" }],
      assertions: [{ type: "visible", selector: "#panel", timeout: 100 }],
    }));
    const outDir = path.join(workspace, "report");
    const result = runReview([
      "--url", `${server.baseUrl}/ephemeral`,
      "--actions", actions,
      "--viewport", "320x240",
      "--settle-ms", "150",
      "--out", outDir,
      "--strict",
    ]);

    assert.equal(result.status, 1, result.stdout || result.stderr);
    const review = readReview(outDir);
    assert.equal(review.runtime.results[0].ok, false);
    assert.equal(review.runtime.results[0].phase, "assertion");
    assert.equal(review.evidenceCoverage.runtime.status, "blocked");
  } finally {
    await server.close();
  }
});
