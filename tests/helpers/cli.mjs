import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

export const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const ownedTempDirs = new Set();
let cleanupRegistered = false;

export function runNode(script, args = [], options = {}) {
  return spawnSync(process.execPath, [path.resolve(repoRoot, script), ...args], {
    cwd: options.cwd || repoRoot,
    encoding: "utf8",
    env: { ...process.env, ...options.env },
    timeout: options.timeout || 30_000,
  });
}

export function tempDir(prefix) {
  const directory = path.resolve(fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`)));
  ownedTempDirs.add(directory);
  if (!cleanupRegistered) {
    cleanupRegistered = true;
    process.once("exit", cleanupOwnedTempDirs);
  }
  return directory;
}

export function writeFile(root, relative, content) {
  const absolute = path.join(root, relative);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, content);
  return absolute;
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function cleanupOwnedTempDirs() {
  const tempRoot = path.resolve(os.tmpdir());
  for (const directory of ownedTempDirs) {
    if (path.dirname(directory) !== tempRoot) continue;
    if (!path.basename(directory).toLowerCase().includes("improve-ui")) continue;
    try {
      fs.rmSync(directory, { force: true, recursive: true });
    } catch {
      // Best-effort cleanup must not mask the test result when Windows still holds a transient handle.
    }
  }
}
