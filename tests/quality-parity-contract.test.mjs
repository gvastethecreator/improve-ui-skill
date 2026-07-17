import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("material design handoffs require synchronized Markdown and HTML dossiers", () => {
  const skill = read("SKILLS/improve-ui/SKILL.md");
  const reporting = read("SKILLS/improve-ui/references/reporting.md");
  const manifest = JSON.parse(read("SKILLS/improve-ui/skill-manifest.json"));

  assert.match(skill, /references\/reporting\.md/);
  for (const artifact of ["report-manifest.json", "report.md", "report-assets/", "report.html"]) {
    assert.match(reporting, new RegExp(artifact.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(reporting, /subject.*literal element or region/is);
  assert.match(reporting, /exact same coordinates and image source/i);
  assert.ok(manifest.entrypoints.includes("scripts/generate-design-report.mjs"));
});

test("durable design ledgers keep ingestion-first Markdown companions", () => {
  const execution = read("SKILLS/improve-ui/execution-contract.md");
  const checklist = read("SKILLS/improve-ui/checklist.md");
  const templates = ["context-card.md", "finish-ledger.md", "motion-plan.md", "geometry-ledger.md"];

  assert.match(execution, /Every durable JSON record must have a sibling Markdown companion/);
  assert.match(checklist, /same-facts `\.md` companion/);
  for (const template of templates) {
    assert.equal(fs.existsSync(path.join(root, "SKILLS/improve-ui/templates", template)), true, `missing ${template}`);
  }
});

test("complex surfaces route through geometry, authorship, and causal motion contracts", () => {
  const skill = read("SKILLS/improve-ui/SKILL.md");
  const geometry = read("SKILLS/improve-ui/references/geometry-and-rhythm.md");
  const authorship = read("SKILLS/improve-ui/references/authorship-and-specificity.md");
  const motion = read("SKILLS/improve-ui/references/motion.md");
  const traps = read("SKILLS/improve-ui/references/motion-implementation.md");

  assert.match(skill, /geometry-and-rhythm\.md/);
  assert.match(skill, /authorship-and-specificity\.md/);
  assert.match(geometry, /within < between < section/);
  assert.match(authorship, /Could a competitor reuse it after a noun swap/);
  assert.match(motion, /motion-plan\.json/);
  assert.match(traps, /Do not coordinate a state change with a timeout/);
});
