import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { runNode, tempDir, writeFile } from "./helpers/cli.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const validator = path.join(repoRoot, "scripts", "validate-evals.mjs");
const suite = path.join(repoRoot, "evals", "scenarios.json");
const existingUiImplementationContracts = [
  "focused-boundary",
  "mixed-audit-fix",
  "existing-web-hud-overlay-positive",
  "existing-prototype-positive",
];

test("contract scenario suite covers routing, permissions, profiles, and evidence integrity", () => {
  const result = runNode(validator, [suite], { cwd: repoRoot });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /evaluation scenarios passed structural validation/i);
  assert.doesNotMatch(result.stdout, /agent (?:execution|run).*passed/i);
});

test("eval validator rejects a suite that cannot test negative routing", () => {
  const directory = tempDir("improve-ui-evals-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  payload.scenarios = payload.scenarios.filter(({ expected }) => expected.trigger);
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /negative routing/i);
});

test("eval validator rejects evidence outside the public vocabulary", () => {
  const directory = tempDir("improve-ui-evals-evidence-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  payload.scenarios[0].expected.evidence.push("invented-proof-layer");
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /unknown evidence.*invented-proof-layer/i);
});

test("eval validator rejects ambiguous runtime-if-available evidence", () => {
  const directory = tempDir("improve-ui-evals-runtime-ambiguity-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  const scenario = payload.scenarios.find(({ contract }) => contract === "pure-verify-read-only");
  scenario.expected.evidence.push("runtime-if-available");
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /unknown evidence.*runtime-if-available/i);
});

test("eval validator requires a pure diagnose read-only contract", () => {
  const directory = tempDir("improve-ui-evals-diagnose-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  payload.scenarios = payload.scenarios.filter(({ contract }) => contract !== "pure-diagnose-read-only");
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /pure diagnose read-only/i);
});

test("eval validator requires a pure verify read-only contract", () => {
  const directory = tempDir("improve-ui-evals-verify-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  payload.scenarios = payload.scenarios.filter(({ contract }) => contract !== "pure-verify-read-only");
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /pure verify read-only/i);
});

test("eval validator requires a mixed audit and fix contract", () => {
  const directory = tempDir("improve-ui-evals-mixed-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  payload.scenarios = payload.scenarios.filter(({ contract }) => contract !== "mixed-audit-fix");
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /mixed audit.*fix/i);
});

test("eval validator requires a native UI negative routing contract", () => {
  const directory = tempDir("improve-ui-evals-native-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  payload.scenarios = payload.scenarios.filter(({ contract }) => contract !== "native-ui-negative");
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /native UI negative/i);
});

test("eval validator requires a specialist renderer game or 3D negative contract", () => {
  const directory = tempDir("improve-ui-evals-renderer-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  payload.scenarios = payload.scenarios.filter(({ contract }) => contract !== "specialist-renderer-game-3d-negative");
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /specialist renderer.*game.*3D negative/i);
});

for (const contract of ["native-ui-negative", "specialist-renderer-game-3d-negative"]) {
  test(`${contract} remains a specialist-routed negative`, () => {
    const directory = tempDir(`improve-ui-evals-${contract}-semantics-`);
    const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
    const scenario = payload.scenarios.find((item) => item.contract === contract);
    scenario.expected.trigger = true;
    scenario.expected.profile = "focused";
    scenario.expected.mutation = "required";
    const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

    const result = runNode(validator, [invalid], { cwd: repoRoot });
    assert.equal(result.status, 1);
    assert.match(result.stderr, new RegExp(`${contract}.*trigger false.*profile none.*mutation forbidden.*recommend-specialist-route`, "i"));
  });
}

test("eval validator requires an existing web HUD or overlay positive contract", () => {
  const directory = tempDir("improve-ui-evals-hud-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  payload.scenarios = payload.scenarios.filter(({ contract }) => contract !== "existing-web-hud-overlay-positive");
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /existing web HUD.*overlay positive/i);
});

test("eval validator requires an existing prototype positive contract", () => {
  const directory = tempDir("improve-ui-evals-prototype-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  payload.scenarios = payload.scenarios.filter(({ contract }) => contract !== "existing-prototype-positive");
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /existing prototype positive/i);
});

test("eval validator requires a reference-led existing UI contract", () => {
  const directory = tempDir("improve-ui-evals-reference-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  payload.scenarios = payload.scenarios.filter(({ contract }) => contract !== "reference-led-existing-ui");
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /reference-led existing UI/i);
});

test("reference-led existing UI supplies both editable source and an image reference", () => {
  const directory = tempDir("improve-ui-evals-reference-fixtures-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  const scenario = payload.scenarios.find(({ contract }) => contract === "reference-led-existing-ui");
  scenario.fixtures = ["SKILLS/improve-ui/fixtures/cases/landing-repair/before"];
  delete scenario.fixture;
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /reference-led-existing-ui.*editable source.*image reference/i);
});

test("screenshot-only review supplies an inspectable image fixture", () => {
  const directory = tempDir("improve-ui-evals-screenshot-fixture-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  const scenario = payload.scenarios.find(({ contract }) => contract === "screenshot-only-review");
  delete scenario.fixture;
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /screenshot-only-review.*image fixture/i);
});

for (const contract of [
  "existing-web-hud-overlay-positive",
  "existing-prototype-positive",
  "reference-led-existing-ui",
]) {
  test(`${contract} remains a focused implementation route`, () => {
    const directory = tempDir(`improve-ui-evals-${contract}-semantics-`);
    const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
    const scenario = payload.scenarios.find((item) => item.contract === contract);
    scenario.expected.trigger = false;
    scenario.expected.profile = "none";
    scenario.expected.mutation = "forbidden";
    const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

    const result = runNode(validator, [invalid], { cwd: repoRoot });
    assert.equal(result.status, 1);
    assert.match(result.stderr, new RegExp(`${contract}.*trigger true.*profile focused.*mutation required`, "i"));
  });
}

for (const contract of existingUiImplementationContracts) {
  test(`${contract} declares runtime evidence or explicit unknowns`, () => {
    const directory = tempDir(`improve-ui-evals-${contract}-runtime-evidence-`);
    const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
    const scenario = payload.scenarios.find((item) => item.contract === contract);
    scenario.expected.evidence = ["static", "visual-or-explicit-unknowns", "change-proof"];
    const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

    const result = runNode(validator, [invalid], { cwd: repoRoot });
    assert.equal(result.status, 1);
    assert.match(result.stderr, new RegExp(`${contract}.*runtime.*unknown`, "i"));
  });
}

for (const contract of existingUiImplementationContracts) {
  test(`${contract} declares visual evidence or explicit unknowns`, () => {
    const directory = tempDir(`improve-ui-evals-${contract}-visual-evidence-`);
    const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
    const scenario = payload.scenarios.find((item) => item.contract === contract);
    scenario.expected.evidence = ["static", "runtime-or-explicit-unknowns", "change-proof"];
    const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

    const result = runNode(validator, [invalid], { cwd: repoRoot });
    assert.equal(result.status, 1);
    assert.match(result.stderr, new RegExp(`${contract}.*visual.*unknown`, "i"));
  });
}

for (const contract of existingUiImplementationContracts) {
  test(`${contract} requires structured change proof`, () => {
    const directory = tempDir(`improve-ui-evals-${contract}-change-proof-`);
    const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
    const scenario = payload.scenarios.find((item) => item.contract === contract);
    scenario.expected.evidence = ["static", "runtime-or-explicit-unknowns", "visual-or-explicit-unknowns"];
    const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

    const result = runNode(validator, [invalid], { cwd: repoRoot });
    assert.equal(result.status, 1);
    assert.match(result.stderr, new RegExp(`${contract}.*change-proof`, "i"));
  });
}

for (const [name, evidence, message] of [
  ["visual comparison", ["static", "runtime-or-explicit-unknowns", "change-proof"], /reference-led-existing-ui.*visual evidence/i],
  ["runtime or unknowns", ["static", "visual", "change-proof"], /reference-led-existing-ui.*runtime.*unknown/i],
  ["change proof or an explicit blocker", ["static", "runtime-or-explicit-unknowns", "visual"], /reference-led-existing-ui.*change-proof.*blocker/i],
]) {
  test(`reference-led existing UI requires ${name}`, () => {
    const directory = tempDir("improve-ui-evals-reference-evidence-");
    const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
    const scenario = payload.scenarios.find(({ contract }) => contract === "reference-led-existing-ui");
    scenario.expected.evidence = evidence;
    const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

    const result = runNode(validator, [invalid], { cwd: repoRoot });
    assert.equal(result.status, 1);
    assert.match(result.stderr, message);
  });
}

test("reference-led existing UI accepts an explicit change-proof blocker without a runnable target", () => {
  const directory = tempDir("improve-ui-evals-reference-proof-blocker-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  const scenario = payload.scenarios.find(({ contract }) => contract === "reference-led-existing-ui");
  scenario.expected.evidence = [
    "static",
    "runtime-or-explicit-unknowns",
    "visual",
    "change-proof-or-explicit-blocker",
  ];
  const valid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [valid], { cwd: repoRoot });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("eval validator requires an explicit focused boundary contract", () => {
  const directory = tempDir("improve-ui-evals-focused-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  payload.scenarios = payload.scenarios.filter(({ contract }) => contract !== "focused-boundary");
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /focused boundary/i);
});

test("eval validator requires an explicit deep boundary contract", () => {
  const directory = tempDir("improve-ui-evals-deep-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  payload.scenarios = payload.scenarios.filter(({ contract }) => contract !== "deep-boundary");
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /deep boundary/i);
});

for (const [contract, invalidProfile, requiredProfile] of [
  ["focused-boundary", "micro", "focused"],
  ["deep-boundary", "focused", "deep"],
]) {
  test(`${contract} selects the ${requiredProfile} profile`, () => {
    const directory = tempDir(`improve-ui-evals-${contract}-profile-`);
    const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
    const scenario = payload.scenarios.find((item) => item.contract === contract);
    scenario.expected.profile = invalidProfile;
    const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

    const result = runNode(validator, [invalid], { cwd: repoRoot });
    assert.equal(result.status, 1);
    assert.match(result.stderr, new RegExp(`${contract}.*profile ${requiredProfile}`, "i"));
  });
}

test("tiny repair remains a micro implementation route", () => {
  const directory = tempDir("improve-ui-evals-tiny-route-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  const scenario = payload.scenarios.find(({ contract }) => contract === "tiny-repair");
  scenario.expected.trigger = false;
  scenario.expected.profile = "none";
  scenario.expected.mutation = "forbidden";
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /tiny-repair.*trigger true.*profile micro.*mutation required/i);
});

test("tiny repair requires runtime-or-unknown evidence and structured change proof", () => {
  const directory = tempDir("improve-ui-evals-tiny-evidence-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  const scenario = payload.scenarios.find(({ contract }) => contract === "tiny-repair");
  scenario.expected.evidence = ["static"];
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /tiny-repair.*runtime.*unknown/i);
  assert.match(result.stderr, /tiny-repair.*change-proof/i);
});

test("deep boundary remains an implementation route with runtime, visual, state, and change proof", () => {
  const directory = tempDir("improve-ui-evals-deep-semantics-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  const scenario = payload.scenarios.find(({ contract }) => contract === "deep-boundary");
  scenario.expected.mutation = "forbidden";
  scenario.expected.evidence = ["static", "runtime", "async-states", "change-proof"];
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /deep-boundary.*mutation required/i);
  assert.match(result.stderr, /deep-boundary.*visual/i);
});

test("deep boundary declares a concrete state-family, viewport, and dimension policy", () => {
  const directory = tempDir("improve-ui-evals-deep-coverage-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  const scenario = payload.scenarios.find(({ contract }) => contract === "deep-boundary");
  scenario.expected.coverage = {
    stateFamilies: ["loading", "error"],
    viewports: ["desktop"],
    dimensionPolicy: "assume-passing",
  };
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /stateFamilies.*at least 3/i);
  assert.match(result.stderr, /viewports.*at least 2/i);
  assert.match(result.stderr, /dimensionPolicy.*applicable-or-explicit-unknowns/i);
});

test("deep boundary with unavailable state fixtures requires explicit state and change-proof blockers", () => {
  const directory = tempDir("improve-ui-evals-deep-blockers-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  const scenario = payload.scenarios.find(({ contract }) => contract === "deep-boundary");
  scenario.expected.coverage.stateFixture = "unavailable";
  scenario.expected.evidence = ["static", "runtime-or-explicit-unknowns", "visual-or-explicit-unknowns", "async-states", "change-proof"];
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /stateFixture.*unavailable.*blocked-on-missing-state-fixtures/i);
  assert.match(result.stderr, /stateFixture.*unavailable.*change-proof-or-explicit-blocker/i);
});

test("pure diagnose remains read-only", () => {
  const directory = tempDir("improve-ui-evals-diagnose-mode-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  const scenario = payload.scenarios.find(({ contract }) => contract === "pure-diagnose-read-only");
  scenario.expected.mutation = "required";
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /pure-diagnose-read-only.*mutation.*forbidden/i);
});

test("pure diagnose declares visual evidence or explicit unknowns", () => {
  const directory = tempDir("improve-ui-evals-diagnose-evidence-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  const scenario = payload.scenarios.find(({ contract }) => contract === "pure-diagnose-read-only");
  scenario.expected.evidence = ["static"];
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /pure-diagnose-read-only.*visual.*unknown/i);
});

test("roast declares visual evidence or explicit unknowns", () => {
  const directory = tempDir("improve-ui-evals-roast-evidence-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  const scenario = payload.scenarios.find(({ contract }) => contract === "roast-opt-in");
  scenario.expected.evidence = ["static"];
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /roast-opt-in.*visual.*unknown/i);
});

test("pure verify remains read-only", () => {
  const directory = tempDir("improve-ui-evals-verify-mode-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  const scenario = payload.scenarios.find(({ contract }) => contract === "pure-verify-read-only");
  scenario.expected.mutation = "allowed";
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /pure-verify-read-only.*mutation.*forbidden/i);
});

test("pure verify declares runtime or visual evidence or explicit unknowns", () => {
  const directory = tempDir("improve-ui-evals-verify-evidence-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  const scenario = payload.scenarios.find(({ contract }) => contract === "pure-verify-read-only");
  scenario.expected.evidence = ["static"];
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /pure-verify-read-only.*runtime.*visual.*unknown/i);
});

test("mixed audit and fix requires implementation authority", () => {
  const directory = tempDir("improve-ui-evals-mixed-mode-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  const scenario = payload.scenarios.find(({ contract }) => contract === "mixed-audit-fix");
  scenario.expected.mutation = "forbidden";
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /mixed-audit-fix.*mutation.*required/i);
});

test("context-aware routes declare archetype, primary artifact, and costly states", () => {
  const directory = tempDir("improve-ui-evals-context-shape-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  const scenario = payload.scenarios.find(({ contract }) => contract === "context-aware-existing-ui");
  scenario.expected.context = {
    archetype: "generic-app",
    userMode: "",
    primaryArtifact: "",
    costlyStates: ["loading"],
  };
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /context\.archetype.*product-context vocabulary/i);
  assert.match(result.stderr, /context\.userMode.*non-empty/i);
  assert.match(result.stderr, /context\.primaryArtifact.*non-empty/i);
  assert.match(result.stderr, /context\.costlyStates.*at least 3/i);
});

test("the eval suite covers materially different product contexts", () => {
  const directory = tempDir("improve-ui-evals-context-coverage-");
  const payload = JSON.parse(fs.readFileSync(suite, "utf8"));
  payload.scenarios = payload.scenarios.filter(({ expected }) => expected?.context?.archetype !== "command-center");
  const invalid = writeFile(directory, "scenarios.json", `${JSON.stringify(payload, null, 2)}\n`);

  const result = runNode(validator, [invalid], { cwd: repoRoot });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /product-context coverage for command-center/i);
});
