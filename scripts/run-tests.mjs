#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const testsDir = path.join(root, "tests");
const { match, exclude } = parseArgs(process.argv.slice(2));

if (!fs.existsSync(testsDir)) {
  console.error("Missing tests directory.");
  process.exit(1);
}

const tests = collectTests(testsDir)
  .filter((file) => !match || normalize(file).includes(match))
  .filter((file) => !exclude || !normalize(file).includes(exclude))
  .sort();

if (!tests.length) {
  console.error(`No tests matched${match ? ` --match ${match}` : ""}${exclude ? ` --exclude ${exclude}` : ""}.`);
  process.exit(1);
}

const result = spawnSync(process.execPath, ["--test", ...tests], {
  cwd: root,
  encoding: "utf8",
  stdio: "inherit",
});

process.exit(result.status ?? 1);

function collectTests(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectTests(absolute));
    else if (entry.isFile() && /\.test\.mjs$/i.test(entry.name)) out.push(absolute);
  }
  return out;
}

function parseArgs(args) {
  const parsed = { match: null, exclude: null };
  for (let index = 0; index < args.length; index += 1) {
    const [name, inline] = args[index].split("=", 2);
    const next = () => inline ?? args[++index];
    if (name === "--match") parsed.match = next();
    else if (name === "--exclude") parsed.exclude = next();
    else {
      console.error(`Unknown option: ${args[index]}`);
      process.exit(2);
    }
  }
  return parsed;
}

function normalize(value) {
  return value.replaceAll("\\", "/").toLowerCase();
}
