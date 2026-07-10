#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const skillDir = path.resolve(process.argv[2] || "SKILLS/improve-ui");
const skillPath = path.join(skillDir, "SKILL.md");
const errors = [];
const warnings = [];

if (!fs.existsSync(skillDir) || !fs.statSync(skillDir).isDirectory()) {
  fail(`Missing skill directory: ${skillDir}`);
}
if (!fs.existsSync(skillPath)) fail(`Missing ${path.relative(root, skillPath)}`);

const skillText = fs.readFileSync(skillPath, "utf8");
const frontmatter = parseFrontmatter(skillText);
if (!frontmatter) {
  errors.push("SKILL.md must start with YAML frontmatter.");
} else {
  const allowed = new Set(["name", "description"]);
  for (const key of Object.keys(frontmatter)) {
    if (!allowed.has(key)) errors.push(`Unsupported frontmatter field: ${key}`);
  }
  if (!frontmatter.name) errors.push("SKILL.md frontmatter missing name.");
  if (!frontmatter.description) errors.push("SKILL.md frontmatter missing description.");
  if (frontmatter.description && frontmatter.description.length > 1024) {
    errors.push("SKILL.md frontmatter description must not exceed 1024 characters.");
  }
  if (frontmatter.name && !/^[a-z0-9-]{1,64}$/.test(frontmatter.name)) {
    errors.push("Skill name must use lowercase letters, digits, and hyphens and stay under 64 characters.");
  }
  if (frontmatter.name && path.basename(skillDir) !== frontmatter.name) {
    errors.push(`Skill folder ${path.basename(skillDir)} does not match frontmatter name ${frontmatter.name}.`);
  }
}

const markdownFiles = collectFiles(skillDir, (file) => file.endsWith(".md"));
const markdownByPath = new Map(markdownFiles.map((file) => [normalize(file), fs.readFileSync(file, "utf8")]));
const graph = new Map();

for (const file of markdownFiles) {
  const text = markdownByPath.get(normalize(file));
  const links = localMarkdownLinks(file, text);
  graph.set(normalize(file), links.filter((link) => link.toLowerCase().endsWith(".md")));

  for (const linkedPath of links) {
    if (!isInside(skillDir, linkedPath) && path.resolve(linkedPath) !== path.resolve(skillDir)) {
      errors.push(`Local link escapes the skill package in ${relative(file)}: ${linkedPath}`);
      continue;
    }
    if (!fs.existsSync(linkedPath)) {
      errors.push(`Broken Markdown link in ${relative(file)}: ${relative(linkedPath)}`);
    }
  }

  const lines = text.split(/\r?\n/);
  if (lines.length > 100 && !/^## (?:Contents|Table of Contents|Contenido|Navigation)\s*$/im.test(text)) {
    errors.push(`${relative(file)} has ${lines.length} lines but no table of contents.`);
  }
}

const reachable = walkMarkdownGraph(normalize(skillPath), graph);
for (const file of markdownFiles) {
  if (!reachable.has(normalize(file))) errors.push(`Markdown file is not discoverable from SKILL.md: ${relative(file)}`);
}

const agentPath = path.join(skillDir, "agents", "openai.yaml");
if (!fs.existsSync(agentPath)) {
  errors.push("Missing required Codex metadata: agents/openai.yaml");
} else {
  const agentText = fs.readFileSync(agentPath, "utf8");
  for (const key of ["display_name", "short_description", "default_prompt"]) {
    if (!new RegExp(`^\\s*${key}:\\s*.+$`, "m").test(agentText)) {
      errors.push(`agents/openai.yaml missing interface field: ${key}`);
    }
  }
  if (frontmatter?.name && !agentText.includes(frontmatter.name)) {
    errors.push(`agents/openai.yaml default metadata does not mention skill name ${frontmatter.name}.`);
  }
}

const manifestPath = path.join(skillDir, "skill-manifest.json");
let manifest = null;
if (!fs.existsSync(manifestPath)) {
  errors.push("Missing skill-manifest.json");
} else {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    errors.push(`Invalid skill-manifest.json: ${error.message}`);
  }
}

if (manifest) {
  if (manifest.schemaVersion !== 1) errors.push("skill-manifest.json schemaVersion must be 1.");
  if (manifest.name !== frontmatter?.name) {
    errors.push(`Manifest name ${manifest.name || "<missing>"} does not match skill name ${frontmatter?.name || "<missing>"}.`);
  }
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(String(manifest.version || ""))) {
    errors.push("skill-manifest.json version must be semantic versioning.");
  }
  if (!Array.isArray(manifest.entrypoints) || !manifest.entrypoints.length) {
    errors.push("skill-manifest.json entrypoints must be a non-empty array.");
  } else {
    for (const entrypoint of manifest.entrypoints) {
      const absolute = path.resolve(skillDir, entrypoint);
      if (!isInside(skillDir, absolute) || !fs.existsSync(absolute)) {
        errors.push(`Manifest entrypoint does not exist inside the skill: ${entrypoint}`);
        continue;
      }
      if (/\.[cm]?js$/i.test(absolute)) checkJavaScriptSyntax(absolute);
    }
  }
}

const scriptFiles = collectFiles(path.join(skillDir, "scripts"), (file) => /\.(?:[cm]?js|mjs|py|ps1)$/i.test(file));
const discoverableText = markdownFiles.map((file) => markdownByPath.get(normalize(file))).join("\n");
const entrypoints = new Set((manifest?.entrypoints || []).map((value) => normalize(path.resolve(skillDir, value))));
for (const file of scriptFiles) {
  const relativeFromSkill = normalize(path.relative(skillDir, file));
  if (!entrypoints.has(normalize(file)) && !discoverableText.includes(relativeFromSkill) && !discoverableText.includes(path.basename(file))) {
    errors.push(`Script not discoverable from SKILL.md or references: ${relativeFromSkill}`);
  }
}

if (errors.length) {
  for (const error of [...new Set(errors)]) console.error(`- ${error}`);
  for (const warning of [...new Set(warnings)]) console.warn(`! ${warning}`);
  process.exit(1);
}

for (const warning of [...new Set(warnings)]) console.warn(`! ${warning}`);
console.log(`Skill validation passed: ${path.relative(root, skillDir) || "."} (${markdownFiles.length} Markdown files)`);

function parseFrontmatter(text) {
  const match = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if (!match) return null;
  const data = {};
  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf(":");
    if (separator === -1) {
      errors.push(`Invalid frontmatter line: ${rawLine}`);
      continue;
    }
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (Object.hasOwn(data, key)) errors.push(`Duplicate frontmatter field: ${key}`);
    data[key] = value;
  }
  return data;
}

function collectFiles(dir, predicate) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(absolute, predicate));
    else if (entry.isFile() && predicate(absolute)) out.push(absolute);
  }
  return out;
}

function localMarkdownLinks(sourceFile, text) {
  const out = [];
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const raw = match[1].trim().replace(/^<|>$/g, "");
    if (!raw || raw.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(raw)) continue;
    let withoutAnchor;
    try {
      withoutAnchor = decodeURIComponent(raw.split("#", 1)[0]);
    } catch {
      errors.push(`Invalid URL encoding in Markdown link in ${relative(sourceFile)}: ${raw}`);
      continue;
    }
    if (!withoutAnchor) continue;
    out.push(path.resolve(path.dirname(sourceFile), withoutAnchor));
  }
  return out;
}

function walkMarkdownGraph(start, graph) {
  const seen = new Set();
  const queue = [start];
  while (queue.length) {
    const current = queue.shift();
    if (seen.has(current)) continue;
    seen.add(current);
    for (const linked of graph.get(current) || []) {
      const normalized = normalize(linked);
      if (graph.has(normalized) && !seen.has(normalized)) queue.push(normalized);
    }
  }
  return seen;
}

function checkJavaScriptSyntax(file) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) errors.push(`JavaScript syntax check failed for ${relative(file)}: ${result.stderr || result.stdout}`);
}

function isInside(parent, child) {
  const relativePath = path.relative(path.resolve(parent), path.resolve(child));
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

function relative(file) {
  return path.relative(skillDir, file).replaceAll("\\", "/");
}

function normalize(file) {
  return path.resolve(file).replaceAll("\\", "/").toLowerCase();
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
