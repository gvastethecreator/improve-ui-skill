#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const root = process.cwd();
const testsDir = path.join(root, "tests");
const { profile, match, exclude } = parseArgs(process.argv.slice(2));

if (!fs.existsSync(testsDir)) {
  console.error("Missing tests directory.");
  process.exit(1);
}

const tests = collectTests(testsDir)
  .filter((file) => matchesProfile(file, profile))
  .filter((file) => !match || normalize(file).includes(match))
  .filter((file) => !exclude || !normalize(file).includes(exclude))
  .sort();

if (!tests.length) {
  console.error(`No ${profile} tests matched${match ? ` --match ${match}` : ""}${exclude ? ` --exclude ${exclude}` : ""}.`);
  process.exit(1);
}

if (profile === "browser" || (profile === "all" && tests.some(isBrowserTest))) requireChromium();

console.log(`Test profile: ${profile} (${tests.length} file${tests.length === 1 ? "" : "s"}).`);
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
  const parsed = { profile: "all", match: null, exclude: null };
  for (let index = 0; index < args.length; index += 1) {
    const [name, inline] = args[index].split("=", 2);
    const next = () => {
      const value = inline ?? args[++index];
      if (!value || value.startsWith("--")) {
        console.error(`Option ${name} requires a value.`);
        process.exit(2);
      }
      return value;
    };
    if (name === "--profile") parsed.profile = next();
    else if (name === "--match") parsed.match = next();
    else if (name === "--exclude") parsed.exclude = next();
    else {
      console.error(`Unknown option: ${args[index]}`);
      process.exit(2);
    }
  }
  if (!new Set(["all", "core", "browser"]).has(parsed.profile)) {
    console.error(`Unknown test profile: ${parsed.profile}. Use all, core, or browser.`);
    process.exit(2);
  }
  return parsed;
}

function normalize(value) {
  return value.replaceAll("\\", "/").toLowerCase();
}

function matchesProfile(file, profile) {
  if (profile === "all") return true;
  return profile === "browser" ? isBrowserTest(file) : !isBrowserTest(file);
}

function isBrowserTest(file) {
  return /(^|\/)runtime-[^/]+\.test\.mjs$/i.test(normalize(path.relative(testsDir, file)));
}

function requireChromium() {
  const packageDir = playwrightPackageDir();
  if (!packageDir) {
    failBrowserPreflight("Playwright package not found.");
  }

  try {
    const requireFromPackage = createRequire(path.join(packageDir, "package.json"));
    const playwright = requireFromPackage(packageDir);
    const executable = playwright.chromium?.executablePath?.();
    if (!executable || !fs.existsSync(executable)) {
      failBrowserPreflight("Chromium executable not found for the installed Playwright package.");
    }
  } catch (error) {
    failBrowserPreflight(`Playwright could not load: ${error.message}`);
  }
}

function playwrightPackageDir() {
  const candidates = [
    process.env.PLAYWRIGHT_PATH,
    process.env.PLAYWRIGHT_NODE_MODULES ? path.join(process.env.PLAYWRIGHT_NODE_MODULES, "playwright") : null,
    path.join(root, "node_modules", "playwright"),
    path.join(os.tmpdir(), "improve-ui-playwright", "node_modules", "playwright"),
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(path.join(candidate, "package.json"))) ?? null;
}

function failBrowserPreflight(reason) {
  console.error(`Browser test profile unavailable: ${reason}`);
  console.error("Install the declared browser dependency with `npm ci` and `npx playwright install chromium`, then rerun `npm run test:browser`.");
  console.error("`npm run test:core` remains a complete non-browser gate.");
  process.exit(2);
}
