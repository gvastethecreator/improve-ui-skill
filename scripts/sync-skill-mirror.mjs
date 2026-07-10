#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const options = parseArgs(process.argv.slice(2));
const source = path.resolve(options.source || "SKILLS/improve-ui");
const target = path.resolve(options.target || path.join(process.cwd(), "..", "agents-matrix", "skills", "improve-ui"));

validatePaths(source, target, options.mode);

const sourceFiles = fileMap(source);
const targetFiles = fs.existsSync(target) ? fileMap(target) : new Map();
const diff = compare(sourceFiles, targetFiles);

if (options.mode === "write") {
  fs.mkdirSync(target, { recursive: true });
  if (process.platform === "win32") alignTargetPathCasing(target, sourceFiles.keys());
  let operationDiff = compare(sourceFiles, fileMap(target));
  removeBlockingTypeConflicts(target, sourceFiles.keys(), new Set(operationDiff.stale));
  operationDiff = compare(sourceFiles, fileMap(target));
  for (const relative of [...operationDiff.created, ...operationDiff.changed]) {
    const from = path.join(source, relative);
    const to = path.join(target, relative);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    installFreshFile(target, from, to);
  }
  for (const relative of operationDiff.stale) {
    unlinkStaleFile(target, relative);
  }
  pruneEmptyDirectories(target);
}

const finalTargetFiles = fs.existsSync(target) ? fileMap(target) : new Map();
const finalDiff = compare(sourceFiles, finalTargetFiles);
const payload = {
  mode: options.mode,
  source,
  target,
  created: diff.created,
  changed: diff.changed,
  stale: diff.stale,
  sourceHash: treeHash(sourceFiles),
  targetHash: treeHash(finalTargetFiles),
  match: finalDiff.created.length === 0 && finalDiff.changed.length === 0 && finalDiff.stale.length === 0,
};

if (options.json) {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
} else {
  console.log(`Improve UI mirror ${options.mode}: ${payload.match ? "match" : "drift"}`);
  console.log(`source: ${source}`);
  console.log(`target: ${target}`);
  console.log(`created=${diff.created.length} changed=${diff.changed.length} stale=${diff.stale.length}`);
  console.log(`sourceHash=${payload.sourceHash}`);
  console.log(`targetHash=${payload.targetHash}`);
}

if (!payload.match) process.exitCode = 1;

function parseArgs(args) {
  const parsed = { source: null, target: null, mode: null, json: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const [name, inline] = arg.split("=", 2);
    const next = () => {
      if (inline !== undefined && inline !== "") return inline;
      const candidate = args[index + 1];
      if (!candidate || candidate.startsWith("--")) die(`${name} requires a value.`);
      index += 1;
      return candidate;
    };
    if (name === "--source") parsed.source = next();
    else if (name === "--target") parsed.target = next();
    else if (arg === "--check") parsed.mode = selectMode(parsed.mode, "check");
    else if (arg === "--write") parsed.mode = selectMode(parsed.mode, "write");
    else if (arg === "--json") parsed.json = true;
    else die(`Unknown option: ${arg}`);
  }
  parsed.mode ||= "check";
  return parsed;
}

function selectMode(current, next) {
  if (current && current !== next) die("Choose exactly one of --check or --write.");
  return next;
}

function validatePaths(sourcePath, targetPath, mode) {
  assertNoLinkedAncestors(sourcePath, "source");
  assertNoLinkedAncestors(targetPath, "target");
  if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isDirectory()) {
    die(`Source skill directory does not exist: ${sourcePath}`);
  }
  if (path.basename(sourcePath).toLowerCase() !== "improve-ui") {
    die(`Source basename must be improve-ui: ${sourcePath}`);
  }
  if (path.basename(targetPath).toLowerCase() !== "improve-ui") {
    die(`Target basename must be improve-ui: ${targetPath}`);
  }
  if (path.resolve(sourcePath) === path.resolve(targetPath)) die("Source and target must be different directories.");
  if (isInside(sourcePath, targetPath) || isInside(targetPath, sourcePath)) {
    die("Source and target cannot contain one another.");
  }
  if (fs.existsSync(targetPath) && !fs.statSync(targetPath).isDirectory()) {
    die(`Target exists but is not a directory: ${targetPath}`);
  }
  for (const [label, root] of [["source", sourcePath], ["target", targetPath]]) {
    if (fs.existsSync(root) && fs.lstatSync(root).isSymbolicLink()) {
      die(`Refusing ${label} symbolic link, junction, or reparse-point root: ${root}`);
    }
    if (fs.existsSync(path.join(root, ".git"))) {
      die(`Refusing ${label} Git worktree: skill mirror roots must not contain .git metadata.`);
    }
  }
  const canonicalSource = canonicalPath(sourcePath);
  const canonicalTarget = canonicalPath(targetPath);
  if (path.basename(canonicalSource).toLowerCase() !== "improve-ui") {
    die(`Canonical source basename must be improve-ui: ${canonicalSource}`);
  }
  if (path.basename(canonicalTarget).toLowerCase() !== "improve-ui") {
    die(`Canonical target basename must be improve-ui: ${canonicalTarget}`);
  }
  if (comparablePath(canonicalSource) === comparablePath(canonicalTarget)) {
    die("Source and target resolve to the same directory.");
  }
  if (isInside(canonicalSource, canonicalTarget) || isInside(canonicalTarget, canonicalSource)) {
    die("Canonical source and target cannot contain one another.");
  }
}

function assertNoLinkedAncestors(value, label) {
  let current = path.resolve(value);
  while (true) {
    try {
      if (fs.lstatSync(current).isSymbolicLink()) {
        die(`Refusing ${label} path: symbolic link, junction, or reparse-point ancestor: ${current}`);
      }
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
    const parent = path.dirname(current);
    if (parent === current) return;
    current = parent;
  }
}

function canonicalPath(value) {
  let existing = path.resolve(value);
  const missing = [];
  while (!fs.existsSync(existing)) {
    const parent = path.dirname(existing);
    if (parent === existing) die(`Cannot resolve canonical path: ${value}`);
    missing.unshift(path.basename(existing));
    existing = parent;
  }
  const real = fs.realpathSync.native(existing);
  return path.resolve(real, ...missing);
}

function comparablePath(value) {
  const normalized = path.resolve(value);
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

function fileMap(root) {
  const map = new Map();
  if (!fs.existsSync(root)) return map;
  walk(root, "", map);
  return map;
}

function walk(root, relativeDir, out) {
  const absoluteDir = path.join(root, relativeDir);
  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    if ([".git", ".hg", ".svn"].includes(entry.name.toLowerCase())) {
      die(`Refusing VCS metadata inside skill payload: ${path.join(absoluteDir, entry.name)}`);
    }
    const relative = normalize(path.join(relativeDir, entry.name));
    const absolute = path.join(root, relative);
    if (entry.isDirectory()) walk(root, relative, out);
    else if (entry.isFile()) out.set(relative, fs.readFileSync(absolute));
    else die(`Unsupported link or special file in skill payload: ${absolute}`);
  }
}

function compare(sourceMap, targetMap) {
  const created = [];
  const changed = [];
  const stale = [];
  for (const [relative, content] of sourceMap) {
    if (!targetMap.has(relative)) created.push(relative);
    else if (!content.equals(targetMap.get(relative))) changed.push(relative);
  }
  for (const relative of targetMap.keys()) {
    if (!sourceMap.has(relative)) stale.push(relative);
  }
  return { created: created.sort(), changed: changed.sort(), stale: stale.sort() };
}

function treeHash(files) {
  const hash = crypto.createHash("sha256");
  for (const [relative, content] of [...files.entries()].sort(([a], [b]) => compareCodeUnits(a, b))) {
    hash.update(relative);
    hash.update("\0");
    hash.update(content);
    hash.update("\0");
  }
  return hash.digest("hex");
}

function pruneEmptyDirectories(root) {
  const dirs = [];
  collectDirectories(root, dirs);
  for (const dir of dirs.sort((a, b) => b.length - a.length)) {
    if (dir !== root && fs.existsSync(dir) && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
  }
}

function collectDirectories(dir, out) {
  out.push(dir);
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) collectDirectories(path.join(dir, entry.name), out);
  }
}

function alignTargetPathCasing(root, sourceRelatives) {
  let sequence = 0;
  const ordered = [...sourceRelatives].sort(
    (a, b) => a.split("/").length - b.split("/").length || compareCodeUnits(a, b),
  );
  for (const relative of ordered) {
    let parent = root;
    for (const desiredName of relative.split("/")) {
      if (!fs.existsSync(parent) || !fs.statSync(parent).isDirectory()) break;
      const matchingName = fs
        .readdirSync(parent)
        .find((entry) => entry.toLowerCase() === desiredName.toLowerCase());
      if (!matchingName) break;
      if (matchingName !== desiredName) {
        const existing = path.join(parent, matchingName);
        const desired = path.join(parent, desiredName);
        let temporary;
        do {
          sequence += 1;
          temporary = path.join(parent, `.improve-ui-case-sync-${process.pid}-${sequence}`);
        } while (fs.existsSync(temporary));
        if (![existing, desired, temporary].every((candidate) => isInside(root, candidate))) {
          die(`Refusing unsafe case-only rename outside target: ${existing}`);
        }
        fs.renameSync(existing, temporary);
        try {
          fs.renameSync(temporary, desired);
        } catch (error) {
          fs.renameSync(temporary, existing);
          throw error;
        }
      }
      parent = path.join(parent, desiredName);
    }
  }
}

function removeBlockingTypeConflicts(root, sourceRelatives, staleRelatives) {
  const ordered = [...sourceRelatives].sort(
    (a, b) => a.split("/").length - b.split("/").length || compareCodeUnits(a, b),
  );
  for (const relative of ordered) {
    const segments = relative.split("/");
    for (let index = 1; index < segments.length; index += 1) {
      const ancestorRelative = segments.slice(0, index).join("/");
      const ancestor = path.join(root, ancestorRelative);
      if (fs.existsSync(ancestor) && fs.statSync(ancestor).isFile()) {
        if (!staleRelatives.has(ancestorRelative)) {
          die(`Refusing to replace non-stale target file with a directory: ${ancestor}`);
        }
        unlinkStaleFile(root, ancestorRelative);
      }
    }

    const destination = path.join(root, relative);
    if (!fs.existsSync(destination) || !fs.statSync(destination).isDirectory()) continue;
    for (const nestedRelative of fileMap(destination).keys()) {
      const targetRelative = normalize(path.join(relative, nestedRelative));
      if (!staleRelatives.has(targetRelative)) {
        die(`Refusing to replace a target directory containing non-stale files: ${destination}`);
      }
      unlinkStaleFile(root, targetRelative);
    }
    pruneEmptyDirectories(destination);
    if (fs.existsSync(destination) && fs.readdirSync(destination).length === 0) fs.rmdirSync(destination);
  }
  pruneEmptyDirectories(root);
}

function unlinkStaleFile(root, relative) {
  const stale = path.join(root, relative);
  if (!isInside(root, stale) || !fs.existsSync(stale) || !fs.statSync(stale).isFile()) {
    die(`Refusing to delete unsafe stale path: ${stale}`);
  }
  fs.unlinkSync(stale);
}

function installFreshFile(root, sourceFile, destination) {
  if (!isInside(root, destination)) {
    die(`Refusing to install a mirror file outside target: ${destination}`);
  }
  const parent = path.dirname(destination);
  const staging = path.join(
    parent,
    `.improve-ui-mirror-stage-${process.pid}-${crypto.randomUUID()}`,
  );
  if (!isInside(root, staging)) {
    die(`Refusing unsafe mirror staging path outside target: ${staging}`);
  }
  try {
    fs.copyFileSync(sourceFile, staging, fs.constants.COPYFILE_EXCL);
    fs.renameSync(staging, destination);
  } finally {
    if (fs.existsSync(staging)) fs.unlinkSync(staging);
  }
}

function compareCodeUnits(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function isInside(parent, child) {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return (
    relative !== "" &&
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
}

function normalize(value) {
  return value.replaceAll("\\", "/");
}

function die(message) {
  console.error(message);
  process.exit(2);
}
