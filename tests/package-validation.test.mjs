import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { repoRoot, runNode, tempDir, writeFile } from "./helpers/cli.mjs";

const validator = "scripts/validate-skill.mjs";

test("canonical improve-ui payload passes package validation", () => {
  const result = runNode(validator, ["SKILLS/improve-ui"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Skill validation passed/);
});

test("validator rejects frontmatter fields outside name and description", () => {
  const skill = makeSkill();
  fs.writeFileSync(
    path.join(skill, "SKILL.md"),
    "---\nname: demo-skill\ndescription: Demo.\nmetadata: forbidden\n---\n\n# Demo\n\nSee [Foundation](references/foundation.md).\n",
  );

  const result = runNode(validator, [skill]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /unsupported frontmatter field: metadata/i);
});

test("validator checks links in nested references, not only SKILL.md", () => {
  const skill = makeSkill();
  fs.appendFileSync(path.join(skill, "references", "foundation.md"), "\nSee [Missing](missing.md).\n");

  const result = runNode(validator, [skill]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /broken markdown link.*references[\\/]missing\.md/i);
});

test("validator requires Codex agent metadata and a matching manifest", () => {
  const skill = makeSkill();
  fs.rmSync(path.join(skill, "agents", "openai.yaml"));
  const missingAgent = runNode(validator, [skill]);
  assert.equal(missingAgent.status, 1);
  assert.match(missingAgent.stderr, /agents[\\/]openai\.yaml/i);

  writeFile(
    skill,
    "agents/openai.yaml",
    'interface:\n  display_name: "Wrong"\n  short_description: "Wrong manifest."\n  default_prompt: "Use $demo-skill."\n',
  );
  const manifest = JSON.parse(fs.readFileSync(path.join(skill, "skill-manifest.json"), "utf8"));
  manifest.name = "other-skill";
  fs.writeFileSync(path.join(skill, "skill-manifest.json"), JSON.stringify(manifest));
  const wrongManifest = runNode(validator, [skill]);
  assert.equal(wrongManifest.status, 1);
  assert.match(wrongManifest.stderr, /manifest name.*other-skill.*demo-skill/i);
});

test("validator rejects undocumented executable entrypoints", () => {
  const skill = makeSkill();
  writeFile(skill, "scripts/hidden.mjs", "console.log('hidden');\n");

  const result = runNode(validator, [skill]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /script not discoverable from SKILL\.md or references/i);
});

test("validator rejects references that escape the packaged skill", () => {
  const skill = makeSkill();
  fs.writeFileSync(path.join(skill, "outside.md"), "# Outside\n");
  fs.appendFileSync(path.join(skill, "references", "foundation.md"), "\n[Escape](../../outside.md)\n");

  const result = runNode(validator, [skill]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /link escapes the skill package/i);
});

test("validator rejects duplicate frontmatter keys and oversized descriptions", () => {
  const skill = makeSkill();
  const description = "x".repeat(1_025);
  fs.writeFileSync(
    path.join(skill, "SKILL.md"),
    `---\nname: demo-skill\nname: conflicting-skill\ndescription: ${description}\n---\n\n# Demo\n`,
  );

  const result = runNode(validator, [skill]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /duplicate frontmatter field: name/i);
  assert.match(result.stderr, /description.*1024/i);
});

test("validator reports malformed link encoding without an uncaught exception", () => {
  const skill = makeSkill();
  fs.appendFileSync(path.join(skill, "references", "foundation.md"), "\n[Malformed](bad%ZZ.md)\n");

  const result = runNode(validator, [skill]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /invalid URL encoding/i);
  assert.doesNotMatch(result.stderr, /URIError|decodeURIComponent/i);
});

function makeSkill() {
  const root = path.join(tempDir("improve-ui-valid-skill"), "demo-skill");
  fs.mkdirSync(root, { recursive: true });
  writeFile(
    root,
    "SKILL.md",
    "---\nname: demo-skill\ndescription: Demo existing web UI improvement.\n---\n\n# Demo\n\nRead [Foundation](references/foundation.md).\nUse `scripts/check.mjs`.\n",
  );
  writeFile(root, "references/foundation.md", "# Foundation\n\nA compact reference.\n");
  writeFile(root, "scripts/check.mjs", "console.log('ok');\n");
  writeFile(
    root,
    "agents/openai.yaml",
    'interface:\n  display_name: "Demo Skill"\n  short_description: "Improve an existing web interface."\n  default_prompt: "Use $demo-skill to improve this existing web UI."\n',
  );
  writeFile(
    root,
    "skill-manifest.json",
    JSON.stringify({
      schemaVersion: 1,
      name: "demo-skill",
      version: "0.1.0",
      entrypoints: ["scripts/check.mjs"],
    }),
  );
  return root;
}
