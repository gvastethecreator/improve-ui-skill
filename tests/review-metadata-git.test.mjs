import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { makeWorkspace, readReview, runReview, writeFixture } from "./review-helpers.mjs";

function git(workspace, args) {
  const result = spawnSync("git", ["-C", workspace, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim();
}

test("reproducibility metadata follows the absolute path target repository, not caller cwd", () => {
  const workspace = makeWorkspace("improve-ui-target-git-");
  git(workspace, ["init", "--quiet"]);
  git(workspace, ["config", "user.email", "test@example.invalid"]);
  git(workspace, ["config", "user.name", "Harness Test"]);
  const target = writeFixture(workspace, "src/target.tsx", "export const Target = () => <main />;\n");
  git(workspace, ["add", "."]);
  git(workspace, ["commit", "--quiet", "-m", "target fixture"]);
  const targetCommit = git(workspace, ["rev-parse", "HEAD"]);
  const outDir = path.join(workspace, "report");

  const result = runReview(["--path", target, "--out", outDir]);

  assert.equal(result.status, 0, result.stdout || result.stderr);
  const reproducibility = readReview(outDir).metadata.reproducibility;
  assert.equal(reproducibility.targetGit.source, "path");
  assert.equal(fs.realpathSync.native(reproducibility.targetGit.root), fs.realpathSync.native(workspace));
  assert.equal(reproducibility.targetGit.commit, targetCommit);
  assert.equal(reproducibility.targetGit.dirty, false);
  assert.notEqual(reproducibility.harnessGit.commit, targetCommit);
});
