#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const suitePath = path.resolve(process.argv[2] || "evals/scenarios.json");
const errors = [];
const contractVocabulary = new Set([
  "advisory-needs-confirmation",
  "blank-canvas-negative",
  "change-proof-integrity",
  "context-aware-existing-ui",
  "deep-boundary",
  "existing-prototype-positive",
  "existing-web-hud-overlay-positive",
  "focused-boundary",
  "formal-compliance-negative",
  "mixed-audit-fix",
  "named-state-execution",
  "native-ui-negative",
  "pure-diagnose-read-only",
  "pure-verify-read-only",
  "reference-led-existing-ui",
  "roast-opt-in",
  "runtime-failure-blocks",
  "screenshot-only-review",
  "specialist-renderer-game-3d-negative",
  "tiny-repair",
]);
const evidenceVocabulary = new Set([
  "advisory-only",
  "async-states",
  "blocked-on-runtime-failure",
  "blocked-on-missing-state-fixtures",
  "change-proof",
  "change-proof-or-explicit-blocker",
  "explicit-unknowns",
  "recommend-specialist-audit",
  "recommend-specialist-route",
  "reject-formal-certification",
  "reject-named-only-states",
  "reject-unstructured-change-proof",
  "requires-human-confirmation",
  "runtime",
  "runtime-or-explicit-unknowns",
  "runtime-required",
  "static",
  "visual",
  "visual-or-explicit-unknowns",
]);
const requiredProfileByContract = new Map([
  ["tiny-repair", "micro"],
  ["focused-boundary", "focused"],
  ["deep-boundary", "deep"],
]);
const existingUiImplementationContracts = new Set([
  "context-aware-existing-ui",
  "focused-boundary",
  "mixed-audit-fix",
  "existing-web-hud-overlay-positive",
  "existing-prototype-positive",
]);
const contextArchetypes = new Set([
  "command-center",
  "dashboard-analytics",
  "game-hud",
  "interactive-prototype",
  "studio-editor",
]);

if (!fs.existsSync(suitePath)) fail(`Evaluation suite does not exist: ${suitePath}`);

let suite;
try {
  suite = JSON.parse(fs.readFileSync(suitePath, "utf8"));
} catch (error) {
  fail(`Evaluation suite is not valid JSON: ${error.message}`);
}

if (suite.schemaVersion !== 1) errors.push("schemaVersion must be 1.");
if (suite.skill !== "improve-ui") errors.push("skill must be improve-ui.");
if (!Array.isArray(suite.scenarios) || suite.scenarios.length < 10) {
  errors.push("The suite must contain at least 10 evaluation scenarios.");
}

const ids = new Set();
const scenarios = Array.isArray(suite.scenarios) ? suite.scenarios : [];
for (const [index, scenario] of scenarios.entries()) {
  const label = scenario?.id || `scenario[${index}]`;
  if (!/^[a-z0-9-]+$/.test(String(scenario?.id || ""))) errors.push(`${label}: id must use kebab-case.`);
  if (ids.has(scenario?.id)) errors.push(`${label}: duplicate id.`);
  ids.add(scenario?.id);

  if (!contractVocabulary.has(scenario?.contract)) {
    errors.push(`${label}: contract must use the public contract vocabulary.`);
  }

  if (!["routing", "workflow", "integrity"].includes(scenario?.kind)) {
    errors.push(`${label}: kind must be routing, workflow, or integrity.`);
  }
  if (typeof scenario?.prompt !== "string" || scenario.prompt.trim().length < 24) {
    errors.push(`${label}: prompt must be a realistic task with at least 24 characters.`);
  }
  const expected = scenario?.expected;
  if (!expected || typeof expected.trigger !== "boolean") errors.push(`${label}: expected.trigger must be boolean.`);
  if (!["none", "micro", "focused", "deep"].includes(expected?.profile)) {
    errors.push(`${label}: expected.profile is invalid.`);
  }
  if (!["forbidden", "allowed", "required"].includes(expected?.mutation)) {
    errors.push(`${label}: expected.mutation is invalid.`);
  }
  if (!["off", "on"].includes(expected?.roast)) errors.push(`${label}: expected.roast must be off or on.`);
  if (!Array.isArray(expected?.evidence)) {
    errors.push(`${label}: expected.evidence must be an array.`);
  } else {
    for (const evidence of expected.evidence) {
      if (!evidenceVocabulary.has(evidence)) errors.push(`${label}: unknown evidence ${JSON.stringify(evidence)}.`);
    }
  }
  if (expected?.trigger === false && expected?.profile !== "none") {
    errors.push(`${label}: non-triggering scenarios must use profile none.`);
  }
  if (expected?.trigger === true && expected?.profile === "none") {
    errors.push(`${label}: triggering scenarios must select a work profile.`);
  }
  const requiredProfile = requiredProfileByContract.get(scenario?.contract);
  if (requiredProfile && expected?.profile !== requiredProfile) {
    errors.push(`${label}: ${scenario.contract} requires profile ${requiredProfile}.`);
  }
  if (
    scenario?.contract === "tiny-repair" &&
    (expected?.trigger !== true || expected?.profile !== "micro" || expected?.mutation !== "required")
  ) {
    errors.push(`${label}: tiny-repair requires trigger true, profile micro, and mutation required.`);
  }
  if (
    scenario?.contract === "tiny-repair" &&
    !hasAnyEvidence(expected, ["runtime", "runtime-required", "runtime-or-explicit-unknowns", "explicit-unknowns"])
  ) {
    errors.push(`${label}: tiny-repair requires runtime evidence or explicit unknowns.`);
  }
  if (scenario?.contract === "tiny-repair" && !hasAnyEvidence(expected, ["change-proof"])) {
    errors.push(`${label}: tiny-repair requires change-proof evidence.`);
  }
  if (
    scenario?.contract === "context-aware-existing-ui" &&
    (expected?.trigger !== true || !["focused", "deep"].includes(expected?.profile) || expected?.mutation !== "required")
  ) {
    errors.push(`${label}: context-aware-existing-ui requires trigger true, profile focused or deep, and mutation required.`);
  }
  if (scenario?.contract === "deep-boundary" && (expected?.trigger !== true || expected?.mutation !== "required")) {
    errors.push(`${label}: deep-boundary requires trigger true, profile deep, and mutation required.`);
  }
  if (
    scenario?.contract === "deep-boundary" &&
    !hasAnyEvidence(expected, ["runtime", "runtime-required", "runtime-or-explicit-unknowns"])
  ) {
    errors.push(`${label}: deep-boundary requires runtime evidence.`);
  }
  if (
    scenario?.contract === "deep-boundary" &&
    !hasAnyEvidence(expected, ["visual", "visual-or-explicit-unknowns"])
  ) {
    errors.push(`${label}: deep-boundary requires visual evidence.`);
  }
  if (scenario?.contract === "deep-boundary") {
    const coverage = expected?.coverage;
    const allowedCoverageKeys = new Set(["stateFamilies", "viewports", "dimensionPolicy", "stateFixture"]);
    if (!coverage || typeof coverage !== "object" || Array.isArray(coverage)) {
      errors.push(`${label}: deep-boundary requires a coverage object.`);
    } else {
      for (const key of Object.keys(coverage)) {
        if (!allowedCoverageKeys.has(key)) errors.push(`${label}: coverage contains unknown key ${JSON.stringify(key)}.`);
      }
      if (!isUniqueStringSet(coverage.stateFamilies, 3)) {
        errors.push(`${label}: coverage.stateFamilies must contain at least 3 unique non-empty names.`);
      }
      if (!isUniqueStringSet(coverage.viewports, 2)) {
        errors.push(`${label}: coverage.viewports must contain at least 2 unique non-empty names.`);
      }
      if (coverage.dimensionPolicy !== "applicable-or-explicit-unknowns") {
        errors.push(`${label}: coverage.dimensionPolicy must be applicable-or-explicit-unknowns.`);
      }
      if (coverage.stateFixture !== "unavailable" && !isExistingFixture(coverage.stateFixture)) {
        errors.push(`${label}: coverage.stateFixture must be unavailable or an existing fixture path.`);
      }
      if (coverage.stateFixture === "unavailable") {
        if (!hasAnyEvidence(expected, ["blocked-on-missing-state-fixtures"])) {
          errors.push(`${label}: stateFixture unavailable requires blocked-on-missing-state-fixtures evidence.`);
        }
        if (!hasAnyEvidence(expected, ["change-proof-or-explicit-blocker"])) {
          errors.push(`${label}: stateFixture unavailable requires change-proof-or-explicit-blocker evidence.`);
        }
      } else {
        if (!hasAnyEvidence(expected, ["async-states"])) {
          errors.push(`${label}: a supplied deep stateFixture requires async-states evidence.`);
        }
        if (!hasAnyEvidence(expected, ["change-proof"])) {
          errors.push(`${label}: a supplied deep stateFixture requires change-proof evidence.`);
        }
      }
    }
  } else if (expected?.coverage !== undefined) {
    errors.push(`${label}: coverage is reserved for the deep-boundary contract.`);
  }
  if (
    ["native-ui-negative", "specialist-renderer-game-3d-negative"].includes(scenario?.contract) &&
    (expected?.trigger !== false ||
      expected?.profile !== "none" ||
      expected?.mutation !== "forbidden" ||
      !hasAnyEvidence(expected, ["recommend-specialist-route"]))
  ) {
    errors.push(
      `${label}: ${scenario.contract} requires trigger false, profile none, mutation forbidden, ` +
      "and recommend-specialist-route evidence.",
    );
  }
  if (
    ["existing-web-hud-overlay-positive", "existing-prototype-positive", "reference-led-existing-ui"].includes(
      scenario?.contract,
    ) &&
    (expected?.trigger !== true || expected?.profile !== "focused" || expected?.mutation !== "required")
  ) {
    errors.push(`${label}: ${scenario.contract} requires trigger true, profile focused, and mutation required.`);
  }
  if (["pure-diagnose-read-only", "pure-verify-read-only"].includes(scenario?.contract) && expected?.mutation !== "forbidden") {
    errors.push(`${label}: ${scenario.contract} requires mutation forbidden.`);
  }
  if (
    scenario?.contract === "pure-diagnose-read-only" &&
    !hasAnyEvidence(expected, ["visual", "visual-or-explicit-unknowns", "explicit-unknowns"])
  ) {
    errors.push(`${label}: pure-diagnose-read-only requires visual evidence or explicit unknowns.`);
  }
  if (
    scenario?.contract === "roast-opt-in" &&
    !hasAnyEvidence(expected, ["visual", "visual-or-explicit-unknowns", "explicit-unknowns"])
  ) {
    errors.push(`${label}: roast-opt-in requires visual evidence or explicit unknowns.`);
  }
  if (
    scenario?.contract === "pure-verify-read-only" &&
    !hasAnyEvidence(expected, [
      "runtime",
      "runtime-required",
      "runtime-or-explicit-unknowns",
      "visual",
      "visual-or-explicit-unknowns",
      "explicit-unknowns",
    ])
  ) {
    errors.push(`${label}: pure-verify-read-only requires runtime or visual evidence or explicit unknowns.`);
  }
  if (scenario?.contract === "mixed-audit-fix" && expected?.mutation !== "required") {
    errors.push(`${label}: mixed-audit-fix requires mutation required.`);
  }
  if (
    existingUiImplementationContracts.has(scenario?.contract) &&
    !hasAnyEvidence(expected, ["runtime", "runtime-required", "runtime-or-explicit-unknowns", "explicit-unknowns"])
  ) {
    errors.push(`${label}: ${scenario.contract} requires runtime evidence or explicit unknowns.`);
  }
  if (
    existingUiImplementationContracts.has(scenario?.contract) &&
    !hasAnyEvidence(expected, ["visual", "visual-or-explicit-unknowns", "explicit-unknowns"])
  ) {
    errors.push(`${label}: ${scenario.contract} requires visual evidence or explicit unknowns.`);
  }
  if (existingUiImplementationContracts.has(scenario?.contract) && !hasAnyEvidence(expected, ["change-proof"])) {
    errors.push(`${label}: ${scenario.contract} requires change-proof evidence.`);
  }
  if (scenario?.contract === "reference-led-existing-ui" && !hasAnyEvidence(expected, ["visual"])) {
    errors.push(`${label}: reference-led-existing-ui requires visual evidence.`);
  }

  if (expected?.context !== undefined) {
    const context = expected.context;
    const allowedContextKeys = new Set(["archetype", "userMode", "primaryArtifact", "costlyStates"]);
    if (!context || typeof context !== "object" || Array.isArray(context)) {
      errors.push(`${label}: expected.context must be an object.`);
    } else {
      for (const key of Object.keys(context)) {
        if (!allowedContextKeys.has(key)) errors.push(`${label}: expected.context contains unknown key ${JSON.stringify(key)}.`);
      }
      if (!contextArchetypes.has(context.archetype)) {
        errors.push(`${label}: expected.context.archetype must use the product-context vocabulary.`);
      }
      if (typeof context.userMode !== "string" || !context.userMode.trim()) {
        errors.push(`${label}: expected.context.userMode must be a non-empty string.`);
      }
      if (typeof context.primaryArtifact !== "string" || !context.primaryArtifact.trim()) {
        errors.push(`${label}: expected.context.primaryArtifact must be a non-empty string.`);
      }
      if (!isUniqueStringSet(context.costlyStates, 3)) {
        errors.push(`${label}: expected.context.costlyStates must contain at least 3 unique states.`);
      }
    }
  } else if (["context-aware-existing-ui", "existing-web-hud-overlay-positive", "existing-prototype-positive"].includes(scenario?.contract)) {
    errors.push(`${label}: ${scenario.contract} requires an explicit product context.`);
  }

  if (scenario?.contract === "existing-web-hud-overlay-positive" && expected?.context?.archetype !== "game-hud") {
    errors.push(`${label}: existing-web-hud-overlay-positive must classify as game-hud.`);
  }
  if (scenario?.contract === "existing-prototype-positive" && expected?.context?.archetype !== "interactive-prototype") {
    errors.push(`${label}: existing-prototype-positive must classify as interactive-prototype.`);
  }
  if (
    scenario?.contract === "reference-led-existing-ui" &&
    !hasAnyEvidence(expected, ["runtime", "runtime-required", "runtime-or-explicit-unknowns", "explicit-unknowns"])
  ) {
    errors.push(`${label}: reference-led-existing-ui requires runtime evidence or explicit unknowns.`);
  }
  if (
    scenario?.contract === "reference-led-existing-ui" &&
    !hasAnyEvidence(expected, ["change-proof", "change-proof-or-explicit-blocker"])
  ) {
    errors.push(`${label}: reference-led-existing-ui requires change-proof evidence or an explicit blocker.`);
  }

  if (scenario?.fixture !== undefined && scenario?.fixtures !== undefined) {
    errors.push(`${label}: use fixture or fixtures, not both.`);
  }
  const declaredFixtures = scenario?.fixtures ?? (scenario?.fixture ? [scenario.fixture] : []);
  if (!Array.isArray(declaredFixtures) || declaredFixtures.some((fixture) => typeof fixture !== "string" || !fixture.trim())) {
    errors.push(`${label}: fixtures must be non-empty path strings.`);
  } else {
    for (const fixture of declaredFixtures) {
      if (!isExistingFixture(fixture)) errors.push(`${label}: fixture does not exist: ${fixture}`);
    }
    if (scenario?.contract === "reference-led-existing-ui") {
      const hasImage = declaredFixtures.some(isImageFixture);
      const hasEditableSource = declaredFixtures.some((fixture) => !isImageFixture(fixture));
      if (!hasImage || !hasEditableSource) {
        errors.push(`${label}: reference-led-existing-ui requires editable source and an image reference fixture.`);
      }
    }
    if (scenario?.contract === "screenshot-only-review" && !declaredFixtures.some(isImageFixture)) {
      errors.push(`${label}: screenshot-only-review requires an image fixture.`);
    }
  }
}

requireCoverage(scenarios.some(({ expected }) => expected?.trigger === false), "The suite needs a negative routing scenario.");
requireCoverage(
  scenarios.some(({ contract }) => contract === "pure-diagnose-read-only"),
  "The suite needs a pure diagnose read-only contract.",
);
requireCoverage(
  scenarios.some(({ contract }) => contract === "pure-verify-read-only"),
  "The suite needs a pure verify read-only contract.",
);
requireCoverage(
  scenarios.some(({ contract }) => contract === "mixed-audit-fix"),
  "The suite needs a mixed audit and fix contract.",
);
requireCoverage(
  scenarios.some(({ contract }) => contract === "native-ui-negative"),
  "The suite needs a native UI negative routing contract.",
);
requireCoverage(
  scenarios.some(({ contract }) => contract === "specialist-renderer-game-3d-negative"),
  "The suite needs a specialist renderer, game, or 3D negative routing contract.",
);
requireCoverage(
  scenarios.some(({ contract }) => contract === "existing-web-hud-overlay-positive"),
  "The suite needs an existing web HUD or overlay positive routing contract.",
);
requireCoverage(
  scenarios.some(({ contract }) => contract === "existing-prototype-positive"),
  "The suite needs an existing prototype positive routing contract.",
);
requireCoverage(
  scenarios.some(({ contract }) => contract === "reference-led-existing-ui"),
  "The suite needs a reference-led existing UI contract.",
);
for (const archetype of contextArchetypes) {
  requireCoverage(
    scenarios.some(({ expected }) => expected?.context?.archetype === archetype),
    `The suite needs explicit product-context coverage for ${archetype}.`,
  );
}
requireCoverage(
  scenarios.some(({ contract }) => contract === "focused-boundary"),
  "The suite needs an explicit focused boundary contract.",
);
requireCoverage(
  scenarios.some(({ contract }) => contract === "deep-boundary"),
  "The suite needs an explicit deep boundary contract.",
);
for (const profile of ["micro", "focused", "deep"]) {
  requireCoverage(
    scenarios.some(({ expected }) => expected?.trigger && expected.profile === profile),
    `The suite does not cover the ${profile} profile.`,
  );
}
requireCoverage(
  scenarios.some(({ expected }) => expected?.mutation === "forbidden"),
  "The suite needs a read-only or mutation-forbidden scenario.",
);
requireCoverage(
  scenarios.some(({ expected }) => expected?.mutation === "required"),
  "The suite needs an implementation-required scenario.",
);
requireCoverage(
  scenarios.some(({ expected }) => expected?.roast === "on"),
  "The suite needs an explicit roast opt-in scenario.",
);
requireCoverage(
  scenarios.some(({ kind }) => kind === "integrity"),
  "The suite needs evidence-integrity scenarios.",
);

if (errors.length) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const counts = Object.fromEntries(
  ["routing", "workflow", "integrity"].map((kind) => [kind, scenarios.filter((item) => item.kind === kind).length]),
);
console.log(
  `${scenarios.length} evaluation scenarios passed structural validation ` +
    `(routing ${counts.routing}, workflow ${counts.workflow}, integrity ${counts.integrity}).`,
);

function requireCoverage(condition, message) {
  if (!condition) errors.push(message);
}

function hasAnyEvidence(expected, accepted) {
  return Array.isArray(expected?.evidence) && expected.evidence.some((item) => accepted.includes(item));
}

function isUniqueStringSet(value, minimum) {
  return (
    Array.isArray(value) &&
    value.length >= minimum &&
    value.every((item) => typeof item === "string" && item.trim().length > 0) &&
    new Set(value).size === value.length
  );
}

function isExistingFixture(value) {
  return typeof value === "string" && value.trim().length > 0 && fs.existsSync(path.resolve(process.cwd(), value));
}

function isImageFixture(value) {
  return typeof value === "string" && /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(value);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
