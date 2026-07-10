import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import path from "node:path";
import test from "node:test";
import { makeWorkspace, readReview, runReview, sha256, writeFixture } from "./review-helpers.mjs";

function targetFixture(prefix = "improve-ui-action-schema-") {
  const workspace = makeWorkspace(prefix);
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main />;");
  return { workspace, target };
}

test("malformed actions and assertions fail as controlled schema errors", () => {
  const fixture = targetFixture();
  const invalidGroups = [
    { actions: [null] },
    { actions: [], assertions: [null] },
    { actions: [{ type: "launch" }] },
    { actions: [{ type: "click" }] },
    { actions: [{ type: "type", selector: "#field" }] },
    { actions: [{ type: "press", key: 3 }] },
    { actions: [{ type: "wait", ms: -1 }] },
    { actions: [{ type: "scroll", x: "0" }] },
    { actions: [{ type: "click", selector: "#go", timeout: 0 }] },
    { actions: [], assertions: [{ type: "visible" }] },
    { actions: [], assertions: [{ type: "text", selector: "p", matches: "[" }] },
    { actions: [], assertions: [{ type: "count", selector: "li", equals: -1 }] },
    { actions: [], assertions: [{ type: "url" }] },
  ];

  for (const [index, group] of invalidGroups.entries()) {
    const actionFile = writeFixture(fixture.workspace, `invalid-${index}.json`, JSON.stringify(group));
    const result = runReview(["--path", fixture.target, "--actions", actionFile]);
    assert.equal(result.status, 2, `${JSON.stringify(group)}\n${result.stdout}\n${result.stderr}`);
    assert.match(result.stderr, /Invalid action group:/i);
    assert.doesNotMatch(result.stderr, /\n\s*at\s|file:\/\//i);
  }
});

test("effective action-group names and normalized artifact stems must be unique", () => {
  for (const names of [["same", "same"], ["menu open", "menu-open"]]) {
    const fixture = targetFixture("improve-ui-action-names-");
    const first = writeFixture(fixture.workspace, "first.json", JSON.stringify({ name: names[0], actions: [] }));
    const second = writeFixture(fixture.workspace, "second.json", JSON.stringify({ name: names[1], actions: [] }));

    const result = runReview([
      "--path", fixture.target,
      "--action-group", `first=${first}`,
      "--action-group", `second=${second}`,
    ]);

    assert.equal(result.status, 2, result.stdout || result.stderr);
    assert.match(result.stderr, /action group.*(unique|collision|duplicate)/i);
  }
});

test("action metadata locates its source and fingerprints redacted typed values", () => {
  const fixture = targetFixture("improve-ui-action-metadata-");
  const secret = "not-for-report-output";
  const actions = writeFixture(fixture.workspace, "actions.json", JSON.stringify({
    name: "typed",
    actions: [{ type: "type", selector: "#field", value: secret, timeout: 250 }],
    assertions: [],
  }));
  const outDir = path.join(fixture.workspace, "report");

  const result = runReview(["--path", fixture.target, "--actions", actions, "--out", outDir]);

  assert.equal(result.status, 0, result.stdout || result.stderr);
  assert.equal(result.stdout.includes(secret), false);
  const metadata = readReview(outDir).metadata.actionGroups[0];
  assert.equal(metadata.source, path.resolve(actions));
  assert.equal(metadata.sourceSha256, sha256(actions));
  assert.equal(metadata.actions[0].value, "[redacted]");
  assert.equal(metadata.actions[0].valueLength, secret.length);
  assert.equal(metadata.actions[0].valueSha256, createHash("sha256").update(secret).digest("hex"));
  assert.equal(JSON.stringify(metadata).includes(secret), false);
});
