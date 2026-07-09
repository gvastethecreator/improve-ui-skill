#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const skillDir = path.resolve(process.argv[2] || "SKILLS/improve-ui");
const skillPath = path.join(skillDir, "SKILL.md");

const errors = [];

if (!fs.existsSync(skillPath)) {
  fail(`Missing ${path.relative(root, skillPath)}`);
}

const body = fs.readFileSync(skillPath, "utf8");

for (const heading of ["Mandatory Entry Frame", "Process", "Context Router", "Deep Review Harness", "Output Contract", "Reference Files"]) {
  if (!body.includes(`## ${heading}`)) errors.push(`SKILL.md missing section: ${heading}`);
}

for (const required of ["relentless-mode.md", "core-moves.md", "interface-surgery.md", "surgical-patterns.md", "checklist.md", "proof-recipes.md"]) {
  if (!body.includes(required)) errors.push(`SKILL.md missing required reference: ${required}`);
}

const topLevelMd = fs.readdirSync(skillDir)
  .filter((name) => name.endsWith(".md") && name !== "SKILL.md")
  .sort();

for (const file of topLevelMd) {
  if (!body.includes(`](${file})`) && !body.includes(`\`${file}\``)) {
    errors.push(`Top-level reference not discoverable from SKILL.md: ${file}`);
  }
}

const linkedPaths = [...body.matchAll(/\]\(([^)#]+)(?:#[^)]+)?\)/g)]
  .map((match) => match[1])
  .filter((target) => !/^[a-z]+:/i.test(target));

for (const linkedPath of linkedPaths) {
  const absolute = path.resolve(skillDir, linkedPath);
  if (!fs.existsSync(absolute)) errors.push(`Broken SKILL.md link: ${linkedPath}`);
}

for (const requiredPath of [
  "scripts/detect-ui-antipatterns.mjs",
  "scripts/run-interface-review.mjs",
  "fixtures/deep-review-bad.tsx",
  "templates/surgical-read.md",
  "templates/surgery-log.md",
  "templates/evidence-ledger.md",
  "templates/final-checklist.md",
  "examples/golden-dashboard-surgery.md",
  "examples/golden-component-polish.md",
  "examples/golden-landing-repair.md",
]) {
  if (!fs.existsSync(path.join(skillDir, requiredPath))) {
    errors.push(`Missing required skill asset: ${requiredPath}`);
  }
}

if (errors.length) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Skill validation passed: ${path.relative(root, skillDir)}`);

function fail(message) {
  console.error(message);
  process.exit(1);
}
