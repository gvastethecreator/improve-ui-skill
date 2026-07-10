import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { readJson, runNode, tempDir, writeFile } from "./helpers/cli.mjs";

const syncScript = "scripts/sync-skill-mirror.mjs";

test("mirror check reports created, changed, and stale files without writing", () => {
  const { source, target } = makeMirrors();
  const result = runNode(syncScript, ["--source", source, "--target", target, "--check", "--json"]);

  assert.equal(result.status, 1);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.created, ["nested/new.txt"]);
  assert.deepEqual(payload.changed, ["keep.txt"]);
  assert.deepEqual(payload.stale, ["stale.txt"]);
  assert.equal(fs.readFileSync(path.join(target, "keep.txt"), "utf8"), "old\n");
});

test("mirror write converges target and a second check is clean", () => {
  const { source, target } = makeMirrors();
  const write = runNode(syncScript, ["--source", source, "--target", target, "--write", "--json"]);
  assert.equal(write.status, 0, write.stderr || write.stdout);
  assert.equal(fs.readFileSync(path.join(target, "keep.txt"), "utf8"), "new\n");
  assert.equal(fs.readFileSync(path.join(target, "nested", "new.txt"), "utf8"), "created\n");
  assert.equal(fs.existsSync(path.join(target, "stale.txt")), false);

  const check = runNode(syncScript, ["--source", source, "--target", target, "--check", "--json"]);
  assert.equal(check.status, 0, check.stderr || check.stdout);
  const payload = JSON.parse(check.stdout);
  assert.deepEqual(payload.created, []);
  assert.deepEqual(payload.changed, []);
  assert.deepEqual(payload.stale, []);
  assert.equal(payload.match, true);
  assert.match(payload.sourceHash, /^[0-9a-f]{64}$/);
  assert.equal(payload.sourceHash, payload.targetHash);
});

test("mirror write replaces a changed hard link without mutating the external file", (t) => {
  const root = tempDir("improve-ui-mirror-hard-link");
  const source = path.join(root, "source", "improve-ui");
  const target = path.join(root, "target", "improve-ui");
  const external = writeFile(root, "external/sentinel.txt", "external bytes must survive\n");
  const destination = path.join(target, "keep.txt");
  writeFile(source, "keep.txt", "canonical mirror bytes\n");
  fs.mkdirSync(target, { recursive: true });
  try {
    fs.linkSync(external, destination);
  } catch {
    return t.skip("hard-link creation unavailable");
  }
  const externalBefore = fs.readFileSync(external);

  const result = runNode(syncScript, ["--source", source, "--target", target, "--write", "--json"]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.deepEqual(fs.readFileSync(external), externalBefore);
  assert.equal(fs.readFileSync(destination, "utf8"), "canonical mirror bytes\n");
  assert.equal(JSON.parse(result.stdout).match, true);
  assert.deepEqual(
    fs.readdirSync(target).filter((entry) => entry.startsWith(".improve-ui-mirror-stage-")),
    [],
  );
});

test("mirror writer refuses an ambiguously named target", () => {
  const root = tempDir("improve-ui-mirror-safety");
  const source = path.join(root, "source", "improve-ui");
  const target = path.join(root, "not-the-skill");
  writeFile(source, "SKILL.md", "demo\n");
  fs.mkdirSync(target, { recursive: true });

  const result = runNode(syncScript, ["--source", source, "--target", target, "--write"]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /target basename.*improve-ui/i);
});

test("mirror check rejects a target that is a file with a controlled CLI error", () => {
  const root = tempDir("improve-ui-mirror-file-target");
  const source = path.join(root, "source", "improve-ui");
  const target = path.join(root, "target", "improve-ui");
  writeFile(source, "SKILL.md", "demo\n");
  writeFile(path.dirname(target), "improve-ui", "not a directory\n");

  const result = runNode(syncScript, ["--source", source, "--target", target, "--check"]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /target exists but is not a directory/i);
  assert.doesNotMatch(result.stderr, /at fileMap|node:fs/i);
});

test("mirror CLI rejects options without values", () => {
  const result = runNode(syncScript, ["--source"]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /--source requires a value/i);
});

test("mirror write handles case-only path drift without deleting the converged file", { skip: process.platform !== "win32" }, () => {
  const root = tempDir("improve-ui-mirror-case");
  const source = path.join(root, "source", "improve-ui");
  const target = path.join(root, "target", "improve-ui");
  writeFile(source, "Docs/Guide.md", "canonical\n");
  writeFile(target, "docs/guide.md", "stale\n");

  const result = runNode(syncScript, ["--source", source, "--target", target, "--write", "--json"]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.readFileSync(path.join(target, "Docs", "Guide.md"), "utf8"), "canonical\n");
  assert.deepEqual(fs.readdirSync(target), ["Docs"]);
  assert.deepEqual(fs.readdirSync(path.join(target, "Docs")), ["Guide.md"]);
  assert.equal(JSON.parse(result.stdout).match, true);
});

test("mirror writer refuses a target that is itself a Git worktree", () => {
  const root = tempDir("improve-ui-mirror-git-safety");
  const source = path.join(root, "source", "improve-ui");
  const target = path.join(root, "target", "improve-ui");
  writeFile(source, "SKILL.md", "canonical\n");
  writeFile(target, "SKILL.md", "existing\n");
  const gitConfig = writeFile(target, ".git/config", "[core]\nrepositoryformatversion = 0\n");

  const result = runNode(syncScript, ["--source", source, "--target", target, "--write"]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /refusing.*git.*target|target.*git worktree/i);
  assert.equal(fs.readFileSync(gitConfig, "utf8"), "[core]\nrepositoryformatversion = 0\n");
  assert.equal(fs.readFileSync(path.join(target, "SKILL.md"), "utf8"), "existing\n");
});

test("mirror write converges when a source file replaces a stale target directory", () => {
  const root = tempDir("improve-ui-mirror-file-over-dir");
  const source = path.join(root, "source", "improve-ui");
  const target = path.join(root, "target", "improve-ui");
  writeFile(source, "entry", "canonical file\n");
  writeFile(target, "entry/old.txt", "stale child\n");

  const result = runNode(syncScript, ["--source", source, "--target", target, "--write", "--json"]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.statSync(path.join(target, "entry")).isFile(), true);
  assert.equal(fs.readFileSync(path.join(target, "entry"), "utf8"), "canonical file\n");
});

test("mirror write converges when a source directory replaces a stale target file", () => {
  const root = tempDir("improve-ui-mirror-dir-over-file");
  const source = path.join(root, "source", "improve-ui");
  const target = path.join(root, "target", "improve-ui");
  writeFile(source, "entry/new.txt", "canonical child\n");
  writeFile(target, "entry", "stale file\n");

  const result = runNode(syncScript, ["--source", source, "--target", target, "--write", "--json"]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.statSync(path.join(target, "entry")).isDirectory(), true);
  assert.equal(fs.readFileSync(path.join(target, "entry", "new.txt"), "utf8"), "canonical child\n");
});

test("mirror writer refuses a symlink or junction used as the target root", (t) => {
  const root = tempDir("improve-ui-mirror-root-link");
  const source = path.join(root, "source", "improve-ui");
  const target = path.join(root, "links", "improve-ui");
  const external = path.join(root, "external-target");
  writeFile(source, "SKILL.md", "canonical\n");
  const sentinel = writeFile(external, "sentinel.txt", "preserve external\n");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  try {
    fs.symlinkSync(external, target, process.platform === "win32" ? "junction" : "dir");
  } catch {
    return t.skip("symlink/junction creation unavailable");
  }

  const result = runNode(syncScript, ["--source", source, "--target", target, "--write"]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /target.*(symbolic|junction|reparse)|refusing.*target/i);
  assert.equal(fs.readFileSync(sentinel, "utf8"), "preserve external\n");
  assert.equal(fs.existsSync(path.join(external, "SKILL.md")), false);
});

test("mirror writer refuses a target below a symlink or junction ancestor", (t) => {
  const root = tempDir("improve-ui-mirror-ancestor-link");
  const source = path.join(root, "source", "improve-ui");
  const linkedParent = path.join(root, "linked-parent");
  const externalParent = path.join(root, "external-parent");
  const target = path.join(linkedParent, "improve-ui");
  writeFile(source, "SKILL.md", "canonical\n");
  const sentinel = writeFile(externalParent, "sentinel.txt", "preserve external\n");
  try {
    fs.symlinkSync(externalParent, linkedParent, process.platform === "win32" ? "junction" : "dir");
  } catch {
    return t.skip("symlink/junction creation unavailable");
  }

  const result = runNode(syncScript, ["--source", source, "--target", target, "--write"]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /target.*ancestor.*(symbolic|junction|reparse)|refusing.*target/i);
  assert.equal(fs.readFileSync(sentinel, "utf8"), "preserve external\n");
  assert.equal(fs.existsSync(path.join(externalParent, "improve-ui")), false);
});

test("mirror writer rejects a target nested under source through a dot-dot-prefixed directory", () => {
  const root = tempDir("improve-ui-mirror-dotdot-prefix");
  const source = path.join(root, "source", "improve-ui");
  const target = path.join(source, "..target", "improve-ui");
  writeFile(source, "SKILL.md", "canonical\n");
  const sentinel = writeFile(target, "sentinel.txt", "preserve nested target\n");

  const result = runNode(syncScript, ["--source", source, "--target", target, "--write"]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /contain one another|inside|nested/i);
  assert.equal(fs.readFileSync(sentinel, "utf8"), "preserve nested target\n");
});

function makeMirrors() {
  const root = tempDir("improve-ui-mirror");
  const source = path.join(root, "source", "improve-ui");
  const target = path.join(root, "target", "improve-ui");
  writeFile(source, "keep.txt", "new\n");
  writeFile(source, "nested/new.txt", "created\n");
  writeFile(target, "keep.txt", "old\n");
  writeFile(target, "stale.txt", "remove\n");
  return { source, target };
}
