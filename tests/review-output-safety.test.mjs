import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileUrl, makeWorkspace, runReview, sha256, writeFixture } from "./review-helpers.mjs";

function trySymlink(target, link, type) {
  try {
    fs.symlinkSync(target, link, type);
    return true;
  } catch {
    return false;
  }
}

test("temporary output accepts a symlinked operating-system temp ancestor", (t) => {
  const workspace = makeWorkspace("improve-ui-temp-ancestor-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const realTemp = path.join(workspace, "real-temp");
  const linkedTemp = path.join(workspace, "linked-temp");
  fs.mkdirSync(realTemp);
  const type = process.platform === "win32" ? "junction" : "dir";
  if (!trySymlink(realTemp, linkedTemp, type)) return t.skip("directory symlink creation unavailable");
  const env = process.platform === "win32"
    ? { TEMP: linkedTemp, TMP: linkedTemp }
    : { TMPDIR: linkedTemp, TMP: linkedTemp, TEMP: linkedTemp };

  const result = runReview(["--path", target], { env });

  assert.equal(result.status, 0, result.stdout || result.stderr);
  const summary = JSON.parse(result.stdout);
  assert.equal(summary.outputMode, "temporary");
  assert.ok(fs.existsSync(path.join(summary.outDir, "review.json")));
});

test("explicit output still rejects a symlinked ancestor", (t) => {
  const workspace = makeWorkspace("improve-ui-explicit-ancestor-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const realParent = path.join(workspace, "real-parent");
  const linkedParent = path.join(workspace, "linked-parent");
  fs.mkdirSync(realParent);
  const type = process.platform === "win32" ? "junction" : "dir";
  if (!trySymlink(realParent, linkedParent, type)) return t.skip("directory symlink creation unavailable");

  const result = runReview(["--path", target, "--out", path.join(linkedParent, "report")]);

  assert.equal(result.status, 2, result.stdout || result.stderr);
  assert.match(result.stderr, /symbolic link|junction|reparse/i);
  assert.deepEqual(fs.readdirSync(realParent), []);
});

test("a symlinked ownership marker is rejected without touching its external target", (t) => {
  const workspace = makeWorkspace("improve-ui-marker-symlink-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const outside = writeFixture(workspace, "outside.txt", "outside marker sentinel");
  const outDir = path.join(workspace, "report");
  fs.mkdirSync(outDir);
  if (!trySymlink(outside, path.join(outDir, ".improve-ui-owned.json"), "file")) return t.skip("symlink creation unavailable");

  const result = runReview(["--path", target, "--out", outDir]);

  assert.equal(result.status, 2, result.stdout || result.stderr);
  assert.match(result.stderr, /unsafe output.*symbolic link|symlink|reparse/i);
  assert.equal(fs.readFileSync(outside, "utf8"), "outside marker sentinel");
});

test("a planned screenshot symlink is rejected without overwriting the external file", (t) => {
  const workspace = makeWorkspace("improve-ui-screenshot-symlink-");
  const html = writeFixture(workspace, "index.html", '<!doctype html><button id="ready">Ready</button>');
  const actions = writeFixture(workspace, "actions.json", JSON.stringify({
    name: "state", actions: [{ type: "click", selector: "#ready" }], assertions: [{ type: "visible", selector: "#ready" }],
  }));
  const outside = writeFixture(workspace, "outside.png", "outside screenshot sentinel");
  const outDir = path.join(workspace, "report");
  fs.mkdirSync(path.join(outDir, "screenshots"), { recursive: true });
  const planned = path.join(outDir, "screenshots", "state-320x240-viewport.png");
  if (!trySymlink(outside, planned, "file")) return t.skip("symlink creation unavailable");

  const result = runReview([
    "--url", fileUrl(html), "--actions", actions, "--viewport", "320x240", "--out", outDir, "--strict",
  ]);

  assert.equal(result.status, 2, result.stdout || result.stderr);
  assert.equal(fs.readFileSync(outside, "utf8"), "outside screenshot sentinel");
});

test("a screenshots junction is rejected without writing into the external directory", (t) => {
  const workspace = makeWorkspace("improve-ui-screenshot-junction-");
  const html = writeFixture(workspace, "index.html", '<!doctype html><button id="ready">Ready</button>');
  const outsideDir = path.join(workspace, "outside");
  fs.mkdirSync(outsideDir);
  const sentinel = writeFixture(outsideDir, "sentinel.txt", "outside directory sentinel");
  const outDir = path.join(workspace, "report");
  fs.mkdirSync(outDir);
  const type = process.platform === "win32" ? "junction" : "dir";
  if (!trySymlink(outsideDir, path.join(outDir, "screenshots"), type)) return t.skip("directory symlink creation unavailable");

  const result = runReview(["--url", fileUrl(html), "--out", outDir]);

  assert.equal(result.status, 2, result.stdout || result.stderr);
  assert.equal(fs.readFileSync(sentinel, "utf8"), "outside directory sentinel");
  assert.equal(fs.readdirSync(outsideDir).length, 1);
});

test("owned-output cleanup rejects a junction ancestor without deleting its external file", (t) => {
  const workspace = makeWorkspace("improve-ui-owned-junction-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const outsideDir = path.join(workspace, "outside");
  fs.mkdirSync(outsideDir);
  const victim = writeFixture(outsideDir, "default-1280x800-viewport.png", "external victim sentinel");
  const outDir = path.join(workspace, "report");
  fs.mkdirSync(outDir);
  const type = process.platform === "win32" ? "junction" : "dir";
  if (!trySymlink(outsideDir, path.join(outDir, "screenshots"), type)) return t.skip("directory symlink creation unavailable");
  fs.writeFileSync(path.join(outDir, ".improve-ui-owned.json"), JSON.stringify({
    schemaVersion: 2,
    owner: "improve-ui-review",
    files: [{ path: "screenshots/default-1280x800-viewport.png", sha256: sha256(victim) }],
  }));

  const result = runReview(["--path", target, "--out", outDir]);

  assert.equal(result.status, 2, result.stdout || result.stderr);
  assert.match(result.stderr, /unsafe output.*symbolic link|junction|reparse/i);
  assert.equal(fs.readFileSync(victim, "utf8"), "external victim sentinel");
});

test("an unowned report collision fails closed and preserves the existing file", () => {
  const workspace = makeWorkspace("improve-ui-unowned-collision-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const outDir = path.join(workspace, "report");
  fs.mkdirSync(outDir);
  const existingReadme = writeFixture(outDir, "README.md", "unrelated user report");

  const result = runReview(["--path", target, "--out", outDir]);

  assert.equal(result.status, 2, result.stdout || result.stderr);
  assert.match(result.stderr, /unsafe output.*collision|not owned|refus/i);
  assert.equal(fs.readFileSync(existingReadme, "utf8"), "unrelated user report");
});

test("an output directory with only non-colliding user files is preserved and accepted", () => {
  const workspace = makeWorkspace("improve-ui-noncollision-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  const outDir = path.join(workspace, "report");
  fs.mkdirSync(outDir);
  const userNote = writeFixture(outDir, "notes.txt", "keep this user note");

  const result = runReview(["--path", target, "--out", outDir]);

  assert.equal(result.status, 0, result.stdout || result.stderr);
  assert.equal(fs.readFileSync(userNote, "utf8"), "keep this user note");
  assert.ok(fs.existsSync(path.join(outDir, ".improve-ui-owned.json")));
});
