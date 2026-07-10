import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const skillRoot = path.join(repoRoot, "SKILLS", "improve-ui");

test("mandatory skill context stays compact and progressively routed", () => {
  const skill = read("SKILLS/improve-ui/SKILL.md");
  const lines = skill.split(/\r?\n/).length;
  const words = skill.replace(/^---[\s\S]*?---/, "").trim().split(/\s+/).filter(Boolean).length;

  assert.ok(lines <= 120, `SKILL.md grew to ${lines} lines; move detail to a routed reference.`);
  assert.ok(words <= 1_600, `SKILL.md grew to ${words} words; move detail to a routed reference.`);
  assert.match(skill, /## Context Router/);
  assert.match(skill, /`micro`/);
  assert.match(skill, /`focused`/);
  assert.match(skill, /`deep`/);
});

test("pure diagnosis and verification are explicitly read-only", () => {
  const skill = read("SKILLS/improve-ui/SKILL.md");
  const readOnlyRule = skill
    .split(/\r?\n/)
    .find((line) => line.includes("remain read-only"));

  assert.ok(readOnlyRule, "SKILL.md must publish a read-only authority rule.");
  assert.match(readOnlyRule, /`diagnose`/);
  assert.match(readOnlyRule, /`verify`/);
  assert.match(readOnlyRule, /do not edit product source/i);
});

test("proof obligations remain proportional to the selected profile", () => {
  const skill = read("SKILLS/improve-ui/SKILL.md");
  const verificationStep = skill
    .split(/\r?\n/)
    .find((line) => /^6\. Verify/.test(line));

  assert.ok(verificationStep, "SKILL.md must publish the verification step.");
  assert.match(verificationStep, /`micro`[^;]+exact (?:defect )?state and viewport/i);
  assert.match(verificationStep, /`focused`[^;]+edge\/recovery/i);
  assert.match(
    verificationStep,
    /`deep`[^.]+declared[^.]+state-family[^.]+viewport matrix[^.]+applicable dimensions[^.]+unknown/i,
  );
  assert.doesNotMatch(verificationStep, /`focused`\/`deep`/i);
});

test("work profiles set scope and proof without granting mutation authority", () => {
  const skill = read("SKILLS/improve-ui/SKILL.md");
  const micro = skill.split(/\r?\n/).find((line) => line.includes("`micro`")) ?? "";

  assert.match(skill, /profiles?[^.]+scope[^.]+proof[^.]+do not grant mutation authority/i);
  assert.match(micro, /authorized implementation[^.]+patch locally/i);
  assert.match(skill, /read-only request[^.]+edited product source/i);
});

test("the workflow separates read-only findings from implementation fixes", () => {
  const skill = read("SKILLS/improve-ui/SKILL.md");
  const priorityStep = skill
    .split(/\r?\n/)
    .find((line) => /^5\./.test(line));

  assert.ok(priorityStep, "SKILL.md must publish the P0/P1 priority step.");
  assert.match(priorityStep, /implementation[^.]+fix/i);
  assert.match(priorityStep, /diagnos|audit|verif/i);
  assert.match(priorityStep, /report[^.]+without editing/i);
});

test("trigger metadata keeps existing web HUD integration in scope and specialist 3D work out", () => {
  const skill = read("SKILLS/improve-ui/SKILL.md");
  const readme = read("README.md");
  const description = skill.match(/^description:\s*"([^"]+)"$/m)?.[1] ?? "";

  assert.match(description, /existing web (?:UI, )?HUD|HUD.*overlay/i);
  assert.match(description, /specialist (?:renderer|game|3D)/i);
  assert.match(description, /do not use/i);
  assert.match(readme, /existing web HUD[^.]+overlay[^.]+integration/i);
  assert.match(readme, /specialist renderer\/game\/3D-system implementation/i);
});

test("the closeout checklist carries the full read-only and output-persistence contract", () => {
  const checklist = read("SKILLS/improve-ui/checklist.md");

  assert.match(checklist, /Diagnose\/verify\/audit\/review[^.]+did not edit source/i);
  assert.match(checklist, /Temporary diagnostics[^.]+outside the project/i);
  assert.match(checklist, /durable report output[^.]+explicitly requested/i);
});

test("every secondary router reference is a validated Markdown link", () => {
  const skill = read("SKILLS/improve-ui/SKILL.md");
  const router = skill.match(/## Context Router([\s\S]*?)## Deep Review Harness/)?.[1] ?? "";
  assert.notEqual(router, "", "SKILL.md must publish the Context Router table.");
  const rows = new Map(
    router
      .split(/\r?\n/)
      .filter((line) => line.startsWith("| "))
      .map((line) => [line.split("|")[1].trim(), line]),
  );
  const expectedByRow = new Map([
    ["Landing or pricing page", ["references/visual-quality.md"]],
    ["Canvas/WebGL/3D already present", ["references/performance.md"]],
    ["Broad production-readiness pass", [
      "references/accessibility.md",
      "references/responsive-hardening.md",
      "references/evidence-and-scoring.md",
    ]],
  ]);
  for (const [rowName, references] of expectedByRow) {
    const row = rows.get(rowName) ?? "";
    assert.notEqual(row, "", `Missing router row: ${rowName}`);
    for (const relative of references) {
      assert.match(row, new RegExp(`\\]\\(${escapeRegExp(relative)}\\)`), `Missing linked ${relative} in ${rowName}`);
    }
  }
});

test("destructive actions retain the undo-versus-confirmation decision", () => {
  const foundation = read("SKILLS/improve-ui/references/foundation.md");

  assert.match(foundation, /undo[^.]+reversible/i);
  assert.match(foundation, /confirm[^.]+irreversible[^.]+costly|confirm[^.]+costly[^.]+irreversible/i);
});

test("production hardening retains feature detection and meaningful fallbacks", () => {
  const hardening = read("SKILLS/improve-ui/references/responsive-hardening.md");

  assert.match(hardening, /feature detection[^.]+browser detection/i);
  assert.match(hardening, /unsupported (?:CSS|features?)[^.]+fallback[^.]+core meaning|fallback[^.]+unsupported (?:CSS|features?)[^.]+core meaning/i);
  assert.match(hardening, /core content[^.]+without JavaScript[^.]+progressive enhancement/i);
});

test("complex references retain reliable capture fallbacks", () => {
  const visual = read("SKILLS/improve-ui/references/visual-quality.md");

  assert.match(visual, /lazy loading[^.]+scroll[^.]+canvas|canvas[^.]+full-page/i);
  assert.match(visual, /viewport slices|section crops/i);
  assert.match(visual, /video[^.]+beats[^.]+motion[^.]+interaction/i);
});

test("accessibility guidance retains sticky-anchor, spellcheck, and touch intent", () => {
  const accessibility = read("SKILLS/improve-ui/references/accessibility.md");

  assert.match(accessibility, /scroll-margin-top/i);
  assert.match(accessibility, /spellcheck[^.]+email[^.]+codes?[^.]+tokens?/i);
  assert.match(accessibility, /touch-action:\s*manipulation/i);
  assert.match(accessibility, /tap highlight[^.]+deliberate/i);
  assert.match(accessibility, /(?:do not|never) disable[^.]+browser zoom/i);
});

test("eval documentation names structural contract checks without claiming agent behavior", () => {
  const readme = read("README.md");
  const evalReadme = read("evals/README.md");
  const combined = `${readme}\n${evalReadme}`;

  assert.doesNotMatch(combined, /behavior suite|behavior evaluations/i);
  assert.match(combined, /structural validator|structural validation/i);
  assert.match(combined, /forward test/i);
});

test("locale guidance rejects IP-derived language assumptions", () => {
  const hardening = read("SKILLS/improve-ui/references/responsive-hardening.md");

  assert.match(hardening, /(?:do not|never) infer[^.]+language[^.]+IP/i);
  assert.match(hardening, /explicit[^.]+preference|locale negotiation/i);
});

test("layout and asset guidance retain stable gutters and selective preconnect", () => {
  const visual = read("SKILLS/improve-ui/references/visual-quality.md");
  const performance = read("SKILLS/improve-ui/references/performance.md");

  assert.match(visual, /scrollbar-gutter:\s*stable[^.]+scann|scann[^.]+scrollbar-gutter:\s*stable/i);
  assert.match(performance, /preconnect[^.]+external origins?[^.]+actually used/i);
});

test("published review recipes distinguish temporary diagnostics from durable reports", () => {
  const readme = read("README.md");
  const recipes = read("SKILLS/improve-ui/proof-recipes.md");
  const combined = `${readme}\n${recipes}`;

  assert.match(combined, /omit `--out`|without `--out`/i);
  assert.match(combined, /operating-system temp|OS temp|temporary directory/i);
  assert.match(combined, /explicit `--out`[^.]+durable|durable[^.]+explicit `--out`/i);
  assert.match(recipes, /ownership marker[^.]+SHA-256[^.]+modified[^.]+refus/i);
  assert.doesNotMatch(
    readme,
    /Produce a static review report[^`]+```text\s+[^`]*run-interface-review[^`]*--out/im,
  );
});

test("package, skill manifest, and public README publish the same version", () => {
  const packageJson = JSON.parse(read("package.json"));
  const manifest = JSON.parse(read("SKILLS/improve-ui/skill-manifest.json"));
  const readme = read("README.md");

  assert.equal(packageJson.version, manifest.version);
  assert.match(readme, new RegExp(`version-${escapeRegExp(manifest.version)}`));
});

test("published Markdown cannot reintroduce prose-only change proof", () => {
  const markdown = collectMarkdown(repoRoot)
    .filter((file) => !file.includes(`${path.sep}node_modules${path.sep}`))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");

  assert.doesNotMatch(markdown, /--change-proof\s+["'][^"'\r\n]+["']/i);
  assert.match(markdown, /--change-proof[^\r\n]+path-only alias|--change-proof[^\r\n]+strict alias/i);
});

test("all local links in the public README resolve", () => {
  const readmePath = path.join(repoRoot, "README.md");
  const markdown = fs.readFileSync(readmePath, "utf8");
  for (const match of markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const raw = match[1].trim().replace(/^<|>$/g, "");
    if (!raw || raw.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(raw)) continue;
    const linked = path.resolve(path.dirname(readmePath), decodeURIComponent(raw.split("#", 1)[0]));
    assert.equal(fs.existsSync(linked), true, `Broken README link: ${raw}`);
  }
});

test("published Node commands use cross-platform path separators", () => {
  const markdown = collectMarkdown(repoRoot)
    .filter((file) => !file.includes(`${path.sep}node_modules${path.sep}`))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");
  assert.doesNotMatch(markdown, /^node\s+[^\r\n]*\\/m);
});

function read(relative) {
  return fs.readFileSync(path.join(repoRoot, relative), "utf8");
}

function collectMarkdown(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if ([".git", ".scratch", "node_modules"].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectMarkdown(absolute));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(absolute);
  }
  return files;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
