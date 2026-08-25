import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("copy work routes through one progressive quality reference", () => {
  const skill = read("SKILLS/improve-ui/SKILL.md");
  const index = read("SKILLS/improve-ui/reference-index.md");
  const finish = read("SKILLS/improve-ui/finish-quality.md");
  const checklist = read("SKILLS/improve-ui/checklist.md");

  assert.match(skill, /Product copy, labels, state messages, or report prose/);
  assert.match(skill, /references\/copy-and-writing\.md/);
  assert.match(index, /copy-and-writing\.md/);
  assert.match(finish, /copy and prose: passed \| failed \| n\/a \| blocked/i);
  assert.match(checklist, /Changed UI copy preserves facts[^.]+product voice[^.]+translation tokens/i);
});

test("copy quality preserves voice and facts while repairing named patterns", () => {
  const copy = read("SKILLS/improve-ui/references/copy-and-writing.md");

  assert.match(copy, /Minimum useful edit/i);
  assert.match(copy, /Preserve meaning[^.]+distinct voice/i);
  assert.match(copy, /Never guess AI authorship/i);
  assert.match(copy, /Binary contrast, negative list/);
  assert.match(copy, /Synonym cycling/);
  assert.match(copy, /Dash clusters/);
  assert.match(copy, /Loading(?: or|,) pending[\s\S]+Empty[\s\S]+Permission[\s\S]+Error[\s\S]+Success/);
  assert.match(copy, /variables, ICU tokens, markup[^.]+accessible names[^.]+translation keys/i);
  assert.match(copy, /practice.*heuristic/i);
});

test("adapted guidance pins its source and carries the MIT notice", () => {
  const sources = read("SKILLS/improve-ui/references/sources-and-provenance.md");
  const notice = read("SKILLS/improve-ui/THIRD_PARTY_NOTICES.md");

  assert.match(sources, /petergyang\/no-ai-slop/);
  assert.match(sources, /61c21c351da4dcb40946a11fead978f2078a2c65/);
  assert.match(sources, /Third-Party Notices/);
  assert.match(notice, /Copyright \(c\) 2026 Peter Yang/);
  assert.match(notice, /Permission is hereby granted, free of charge/);
});

test("the structural eval suite covers copy repair", () => {
  const suite = JSON.parse(read("evals/scenarios.json"));
  const scenario = suite.scenarios.find(({ id }) => id === "copy-state-repair-preserves-voice-and-facts");

  assert.ok(scenario, "missing copy repair scenario");
  assert.equal(scenario.expected.trigger, true);
  assert.equal(scenario.expected.mutation, "required");
  assert.deepEqual(scenario.expected.evidence, [
    "static",
    "runtime-or-explicit-unknowns",
    "visual-or-explicit-unknowns",
    "change-proof",
  ]);
});
