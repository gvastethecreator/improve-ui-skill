import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const detector = path.join(repoRoot, "SKILLS", "improve-ui", "scripts", "detect-ui-antipatterns.mjs");
const fixtures = path.join(import.meta.dirname, "detector-fixtures");

function runDetector(args, options = {}) {
  return spawnSync(process.execPath, [detector, ...args], {
    cwd: options.cwd ?? repoRoot,
    encoding: "utf8",
  });
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, `${command} ${args.join(" ")} failed:\n${result.stderr}`);
  return result;
}

test("rejects a missing scan target instead of reporting a clean scan", () => {
  const result = runDetector(["--json", "does-not-exist"]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /target does not exist/i);
  assert.equal(result.stdout, "");
});

test("rejects a target with zero supported files instead of reporting a clean scan", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-empty-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  fs.writeFileSync(path.join(target, "README.txt"), "not a web source");

  const result = runDetector(["--json", target]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /no supported files/i);
  assert.equal(result.stdout, "");
});

test("refuses to write detector output over a scanned source file", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-output-collision-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const source = path.join(target, "Victim.tsx");
  const original = 'export const Victim = () => <img src="" />;';
  fs.writeFileSync(source, original);

  const result = runDetector(["--json", "--out", source, source]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /output.*scan|refusing.*output|same file/i);
  assert.equal(fs.readFileSync(source, "utf8"), original);
});

test("refuses to write detector output over its baseline input", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-baseline-collision-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const source = path.join(target, "Source.tsx");
  const baseline = path.join(target, "baseline.json");
  const original = "not valid JSON";
  fs.writeFileSync(source, 'export const Source = () => <img src="" />;');
  fs.writeFileSync(baseline, original);

  const result = runDetector(["--json", "--baseline", baseline, "--out", baseline, source]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /output.*baseline|baseline.*output|refusing.*baseline/i);
  assert.equal(result.stdout, "");
  assert.equal(fs.readFileSync(baseline, "utf8"), original);
});

test("refuses to write detector output over its allowlist input", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-allowlist-collision-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const source = path.join(target, "Source.tsx");
  const allowlist = path.join(target, "allowlist.json");
  const original = JSON.stringify([]);
  fs.writeFileSync(source, 'export const Source = () => <img src="" />;');
  fs.writeFileSync(allowlist, original);

  const result = runDetector(["--json", "--allowlist", allowlist, "--out", allowlist, source]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /output.*allowlist|allowlist.*output|refusing.*allowlist/i);
  assert.equal(result.stdout, "");
  assert.equal(fs.readFileSync(allowlist, "utf8"), original);
});

test("refuses a hard-linked output alias of its baseline input", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-baseline-hardlink-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const source = path.join(target, "Source.tsx");
  const baseline = path.join(target, "baseline.json");
  const output = path.join(target, "report.json");
  const original = JSON.stringify({ findings: [] });
  fs.writeFileSync(source, 'export const Source = () => <img src="" />;');
  fs.writeFileSync(baseline, original);
  try {
    fs.linkSync(baseline, output);
  } catch (error) {
    if (["EACCES", "ENOSYS", "EPERM", "EXDEV"].includes(error.code)) {
      t.skip(`hard links unavailable: ${error.code}`);
      return;
    }
    throw error;
  }

  const result = runDetector(["--json", "--baseline", baseline, "--out", output, source]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /output.*baseline|baseline.*output|refusing.*baseline/i);
  assert.equal(result.stdout, "");
  assert.equal(fs.readFileSync(baseline, "utf8"), original);
});

test("refuses a hard-linked output alias of its allowlist input", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-allowlist-hardlink-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const source = path.join(target, "Source.tsx");
  const allowlist = path.join(target, "allowlist.json");
  const output = path.join(target, "report.json");
  const original = JSON.stringify([]);
  fs.writeFileSync(source, 'export const Source = () => <img src="" />;');
  fs.writeFileSync(allowlist, original);
  try {
    fs.linkSync(allowlist, output);
  } catch (error) {
    if (["EACCES", "ENOSYS", "EPERM", "EXDEV"].includes(error.code)) {
      t.skip(`hard links unavailable: ${error.code}`);
      return;
    }
    throw error;
  }

  const result = runDetector(["--json", "--allowlist", allowlist, "--out", output, source]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /output.*allowlist|allowlist.*output|refusing.*allowlist/i);
  assert.equal(result.stdout, "");
  assert.equal(fs.readFileSync(allowlist, "utf8"), original);
});

test("refuses detector output through a symlink to a scanned source", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-output-link-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const source = path.join(target, "Victim.tsx");
  const linkedOutput = path.join(target, "report.json");
  const original = 'export const Victim = () => <img src="" />;';
  fs.writeFileSync(source, original);
  try {
    fs.symlinkSync(source, linkedOutput, "file");
  } catch {
    return t.skip("file symlink creation unavailable");
  }

  const result = runDetector(["--json", "--out", linkedOutput, source]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /output.*(symbolic|reparse)|refusing.*output/i);
  assert.equal(fs.readFileSync(source, "utf8"), original);
});

test("scans modern web modules, stylesheet preprocessors, and SVG", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-ext-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const extensions = [".mjs", ".cjs", ".mts", ".cts", ".scss", ".sass", ".less", ".svg", ".tsx"];
  for (const [index, extension] of extensions.entries()) {
    fs.writeFileSync(path.join(target, `source-${index}${extension}`), ".button { transition: all 120ms; }");
  }

  const result = runDetector(["--json", target]);
  const payload = JSON.parse(result.stdout);

  assert.equal(result.status, 0);
  assert.equal(payload.files, extensions.length);
  assert.equal(payload.findings.filter(({ id }) => id === "transition-all").length, extensions.length);
});

test("reports whether a finding is objective or advisory and its confidence", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-classification-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  fs.writeFileSync(
    path.join(target, "card.tsx"),
    '<img src="hero.png"><div className="from-purple-500 to-blue-500">Brand</div>',
  );

  const result = runDetector(["--json", target]);
  const payload = JSON.parse(result.stdout);
  const missingAlt = payload.findings.find(({ id }) => id === "missing-img-alt");
  const palette = payload.findings.find(({ id }) => id === "purple-blue-gradient");

  assert.deepEqual(
    { classification: missingAlt.classification, confidence: missingAlt.confidence },
    { classification: "objective", confidence: "high" },
  );
  assert.deepEqual(
    { classification: palette.classification, confidence: palette.confidence },
    { classification: "advisory", confidence: "low" },
  );
});

test("advisory taste findings do not fail a scan unless explicitly included", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-advisory-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  fs.writeFileSync(path.join(target, "brand.tsx"), '<div className="from-purple-500 to-blue-500">Brand</div>');

  const defaultGate = runDetector(["--fail-on=P3", target]);
  const advisoryGate = runDetector(["--fail-on=P3", "--include-advisory", target]);

  assert.equal(defaultGate.status, 0);
  assert.equal(advisoryGate.status, 1);
});

test("scroll regions and hand-drawn interactive SVGs produce contextual finish leads", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-finish-craft-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const unfinished = path.join(target, "unfinished.tsx");
  const treated = path.join(target, "treated.css");
  const gutterOnly = path.join(target, "gutter-only.css");
  fs.writeFileSync(
    unfinished,
    'export const Panel = () => <div className="overflow-y-auto"><button aria-label="Close"><svg viewBox="0 0 24 24"><path d="M4 4l16 16" /></svg></button></div>;\n',
  );
  fs.writeFileSync(
    treated,
    '.panel { overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--thumb) transparent; }\n.panel::-webkit-scrollbar { width: 8px; }\n',
  );
  fs.writeFileSync(gutterOnly, ".panel { overflow-y: auto; scrollbar-gutter: stable; }\n");

  const unfinishedResult = runDetector(["--json", unfinished]);
  const treatedResult = runDetector(["--json", treated]);
  const gutterOnlyResult = runDetector(["--json", gutterOnly]);
  assert.equal(unfinishedResult.status, 0, unfinishedResult.stderr);
  assert.equal(treatedResult.status, 0, treatedResult.stderr);
  assert.equal(gutterOnlyResult.status, 0, gutterOnlyResult.stderr);
  const unfinishedFindings = JSON.parse(unfinishedResult.stdout).findings;
  assert.ok(unfinishedFindings.some((finding) => finding.id === "native-scrollbar-risk"));
  assert.ok(unfinishedFindings.some((finding) => finding.id === "improvised-inline-svg-icon"));
  assert.equal(JSON.parse(treatedResult.stdout).findings.some((finding) => finding.id === "native-scrollbar-risk"), false);
  assert.equal(JSON.parse(gutterOnlyResult.stdout).findings.some((finding) => finding.id === "native-scrollbar-risk"), true);
});

test("strict fails high-confidence objective P1 findings but not contextual motion advice", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-strict-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const objectiveFile = path.join(target, "objective.tsx");
  const advisoryFile = path.join(target, "advisory.css");
  fs.writeFileSync(objectiveFile, '<img src="hero.png">');
  fs.writeFileSync(advisoryFile, ".menu { transition: opacity 120ms ease-in; transform: scale(0); }");

  const objectiveGate = runDetector(["--strict", objectiveFile]);
  const advisoryGate = runDetector(["--strict", "--json", advisoryFile]);
  const advisoryPayload = JSON.parse(advisoryGate.stdout);

  assert.equal(objectiveGate.status, 1);
  assert.equal(advisoryGate.status, 0);
  assert.deepEqual(
    advisoryPayload.findings
      .filter(({ id }) => ["ease-in-ui-motion", "scale-zero-entry"].includes(id))
      .map(({ id, severity, classification, confidence }) => ({ id, severity, classification, confidence })),
    [
      { id: "ease-in-ui-motion", severity: "P2", classification: "advisory", confidence: "medium" },
      { id: "scale-zero-entry", severity: "P2", classification: "advisory", confidence: "medium" },
    ],
  );
});

test("does not expose uncalibrated provider stereotype modes", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-provider-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  fs.writeFileSync(path.join(target, "card.css"), ".card { border: 1px solid; box-shadow: 0 20px 40px #0003; }");

  const result = runDetector(["--gpt", target]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /unknown option: --gpt/i);
});

test("baseline fingerprints remain stable when unchanged code moves to another line", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-fingerprint-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const source = path.join(target, "image.tsx");
  const baseline = path.join(target, "baseline.json");
  fs.writeFileSync(source, '<img src="hero.png">');

  const first = JSON.parse(runDetector(["--json", source]).stdout);
  fs.writeFileSync(baseline, JSON.stringify({ findings: first.findings }));
  fs.writeFileSync(source, '\n\n\n<img src="hero.png">');
  const shifted = JSON.parse(runDetector(["--json", "--baseline", baseline, source]).stdout);

  assert.equal(first.findings.some(({ id }) => id === "missing-img-alt"), true);
  assert.equal(shifted.findings.some(({ id }) => id === "missing-img-alt"), false);
});

test("baseline paths remain stable across caller working directories", (t) => {
  const repository = fs.mkdtempSync(path.join(os.tmpdir(), "detector-path-base-"));
  t.after(() => fs.rmSync(repository, { force: true, recursive: true }));
  const ui = path.join(repository, "ui");
  const source = path.join(ui, "image.tsx");
  const baseline = path.join(repository, "baseline.json");
  fs.mkdirSync(ui);
  fs.writeFileSync(source, '<img src="hero.png">');
  run("git", ["init", "--quiet"], repository);

  const first = JSON.parse(runDetector(["--json", source], { cwd: repoRoot }).stdout);
  fs.writeFileSync(baseline, JSON.stringify({ findings: first.findings }));
  const second = JSON.parse(runDetector(["--json", "--baseline", baseline, "image.tsx"], { cwd: ui }).stdout);

  assert.deepEqual(first.pathBase, {
    kind: "git-root",
    path: fs.realpathSync.native(repository).replaceAll("\\", "/"),
  });
  assert.equal(first.findings.find(({ id }) => id === "missing-img-alt").file, "ui/image.tsx");
  assert.equal(second.findings.some(({ id }) => id === "missing-img-alt"), false);
});

test("a baseline consumes only its recorded count of identical findings", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-multiset-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const source = path.join(target, "images.tsx");
  const baseline = path.join(target, "baseline.json");
  fs.writeFileSync(source, '<img src="hero.png">');

  const first = JSON.parse(runDetector(["--json", source]).stdout);
  fs.writeFileSync(baseline, JSON.stringify({ findings: first.findings }));
  fs.writeFileSync(source, '\n\n<img src="hero.png"><img src="hero.png">');
  const result = runDetector(["--strict", "--json", "--baseline", baseline, source]);
  const payload = JSON.parse(result.stdout);
  const remaining = payload.findings.filter(({ id }) => id === "missing-img-alt");

  assert.equal(result.status, 1);
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].occurrence, 2);
  assert.match(remaining[0].fingerprint, /^v3\|missing-img-alt\|.*\|occurrence=2$/);
});

test("baseline comparison detects findings beyond the former per-rule cap", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-cap-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const source = path.join(target, "gallery.tsx");
  const baseline = path.join(target, "baseline.json");
  const images = Array.from({ length: 8 }, (_, index) => `<img src="hero-${index + 1}.png">`);
  fs.writeFileSync(source, images.join("\n"));

  const first = JSON.parse(runDetector(["--json", source]).stdout);
  fs.writeFileSync(baseline, JSON.stringify({ findings: first.findings }));
  fs.writeFileSync(source, [...images, '<img src="hero-9.png">'].join("\n"));
  const result = runDetector(["--strict", "--json", "--baseline", baseline, source]);
  const payload = JSON.parse(result.stdout);
  const remaining = payload.findings.filter(({ id }) => id === "missing-img-alt");

  assert.equal(result.status, 1);
  assert.equal(remaining.length, 1);
  assert.match(remaining[0].snippet, /hero-9\.png/);
});

test("publishes stable fingerprints while accepting v1 and v2 allowlists", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-legacy-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const source = path.join(target, "image.tsx");
  const allowlistV1 = path.join(target, "allowlist-v1.json");
  const allowlistV2 = path.join(target, "allowlist-v2.json");
  fs.writeFileSync(source, '<img src="hero.png">');

  const first = JSON.parse(runDetector(["--json", source]).stdout);
  const finding = first.findings.find(({ id }) => id === "missing-img-alt");
  const legacyFingerprint = [finding.id, finding.file, finding.line, finding.snippet].join("|");
  const v2Fingerprint = ["v2", finding.id, finding.file, finding.snippet].join("|");
  fs.writeFileSync(allowlistV1, JSON.stringify([legacyFingerprint]));
  fs.writeFileSync(allowlistV2, JSON.stringify([v2Fingerprint]));
  fs.writeFileSync(source, '\n\n<img src="hero.png">');
  const filteredV1 = JSON.parse(runDetector(["--json", "--allowlist", allowlistV1, source]).stdout);
  const filteredV2 = JSON.parse(runDetector(["--json", "--allowlist", allowlistV2, source]).stdout);

  assert.match(finding.fingerprint, /^v3\|missing-img-alt\|.*\|occurrence=1$/);
  assert.equal(filteredV1.findings.some(({ id }) => id === "missing-img-alt"), false);
  assert.equal(filteredV2.findings.some(({ id }) => id === "missing-img-alt"), false);
});

test("changed-only scans staged, unstaged, and untracked web files from a nested cwd", (t) => {
  const repository = fs.mkdtempSync(path.join(os.tmpdir(), "detector-git-"));
  t.after(() => fs.rmSync(repository, { force: true, recursive: true }));
  const ui = path.join(repository, "ui");
  fs.mkdirSync(ui);
  fs.writeFileSync(path.join(ui, "tracked.tsx"), "export const clean = true;\n");
  run("git", ["init", "--quiet"], repository);
  run("git", ["config", "user.email", "detector@example.test"], repository);
  run("git", ["config", "user.name", "Detector Test"], repository);
  run("git", ["add", "."], repository);
  run("git", ["commit", "--quiet", "-m", "fixture"], repository);

  fs.writeFileSync(path.join(ui, "tracked.tsx"), "export const style = 'transition-all';\n");
  fs.writeFileSync(path.join(ui, "staged.mjs"), "export const style = 'transition-all';\n");
  run("git", ["add", "ui/staged.mjs"], repository);
  fs.writeFileSync(path.join(ui, "untracked.scss"), ".button { transition: all 100ms; }\n");

  const result = runDetector(["--changed-only", "--json", "."], { cwd: ui });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const payload = JSON.parse(result.stdout);
  const fromOutside = runDetector(["--changed-only", "--json", ui], { cwd: repoRoot });
  assert.equal(fromOutside.status, 0, fromOutside.stderr || fromOutside.stdout);
  const outsidePayload = JSON.parse(fromOutside.stdout);

  assert.equal(payload.files, 3);
  assert.deepEqual(
    [...new Set(payload.findings.map(({ file }) => file))].sort(),
    ["ui/staged.mjs", "ui/tracked.tsx", "ui/untracked.scss"],
  );
  assert.equal(outsidePayload.files, 3);
  assert.deepEqual(payload.pathBase, outsidePayload.pathBase);
  assert.equal(payload.pathBase.kind, "git-root");
});

test("changed-only preserves Unicode paths from staged and untracked Git output", (t) => {
  const repository = fs.mkdtempSync(path.join(os.tmpdir(), "detector-git-unicode-"));
  t.after(() => fs.rmSync(repository, { force: true, recursive: true }));
  fs.writeFileSync(path.join(repository, "base.tsx"), "export const clean = true;\n");
  run("git", ["init", "--quiet"], repository);
  run("git", ["config", "user.email", "detector@example.test"], repository);
  run("git", ["config", "user.name", "Detector Test"], repository);
  run("git", ["add", "base.tsx"], repository);
  run("git", ["commit", "--quiet", "-m", "fixture"], repository);
  fs.writeFileSync(path.join(repository, "café.tsx"), '<img src="cafe.png">');
  fs.writeFileSync(path.join(repository, "niño.tsx"), '<img src="nino.png">');
  run("git", ["add", "café.tsx"], repository);

  const result = runDetector(["--changed-only", "--strict", "--json", "."], { cwd: repository });
  assert.equal(result.status, 1, result.stderr || result.stdout);
  const payload = JSON.parse(result.stdout);
  const files = payload.findings.filter(({ id }) => id === "missing-img-alt").map(({ file }) => file).sort();

  assert.equal(payload.files, 2);
  assert.deepEqual(files, ["café.tsx", "niño.tsx"]);
});

test("comments and test fixtures do not create misleading P1 findings", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-comments-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  fs.writeFileSync(
    path.join(target, "component.tsx"),
    [
      'const sparkle = "✨"; // <img src="comment.png">',
      "// animation: fake 500ms ease-in;",
      '/* <button><svg /></button> */',
      '{/* <div onClick={noop}>comment</div> */}',
      '<!-- <img src=""> -->',
      "export const clean = true;",
    ].join("\n"),
  );
  fs.writeFileSync(
    path.join(target, "component.test.tsx"),
    'const intentionallyInvalidFixture = <><img src=""><div onClick={noop}>fixture</div></>;',
  );

  const result = runDetector(["--json", target]);
  const payload = JSON.parse(result.stdout);

  assert.equal(result.status, 0);
  assert.deepEqual(payload.findings.filter(({ severity }) => severity === "P1"), []);
  assert.equal(payload.findings.some(({ id }) => id === "missing-reduced-motion-guard"), false);
});

test("slashes inside a regex literal do not mask later findings on the line", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-regex-comment-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const source = path.join(target, "component.tsx");
  fs.writeFileSync(source, String.raw`const re = /https?:\/\//; export const bad = <img src="" />;`);

  const result = runDetector(["--strict", "--json", source]);
  const payload = JSON.parse(result.stdout);
  const ids = payload.findings.map(({ id }) => id);

  assert.equal(result.status, 1);
  assert.equal(ids.includes("missing-img-alt"), true);
  assert.equal(ids.includes("empty-img-src"), true);
});

test("positive, negative, and valid-exception fixtures calibrate objective P1 rules", () => {
  const positive = JSON.parse(
    runDetector(["--include-test-fixtures", "--json", path.join(fixtures, "positive.tsx")]).stdout,
  );
  const negative = JSON.parse(
    runDetector(["--include-test-fixtures", "--json", path.join(fixtures, "negative.tsx")]).stdout,
  );
  const exceptions = JSON.parse(
    runDetector(["--include-test-fixtures", "--json", path.join(fixtures, "exceptions.tsx")]).stdout,
  );

  assert.deepEqual(
    [...new Set(positive.findings.filter(({ severity }) => severity === "P1").map(({ id }) => id))].sort(),
    ["interactive-role-contract", "missing-img-alt"],
  );
  assert.equal(positive.findings.filter(({ id }) => id === "interactive-div").length, 1);
  assert.equal(
    positive.findings
      .filter(({ id }) => ["button-name-risk", "interactive-div"].includes(id))
      .every(({ severity, classification }) => severity === "P2" && classification === "advisory"),
    true,
  );
  assert.deepEqual(negative.findings.filter(({ severity }) => severity === "P1"), []);
  assert.deepEqual(exceptions.findings.filter(({ severity }) => severity === "P1"), []);
});

test("generic delegated handlers are advisory while incomplete explicit interactive roles are P1", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-interaction-role-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const delegated = path.join(target, "delegated.tsx");
  const incomplete = path.join(target, "incomplete.tsx");
  const complete = path.join(target, "complete.tsx");
  fs.writeFileSync(delegated, '<div onClick={track}><button type="button">Save</button></div>');
  fs.writeFileSync(incomplete, '<div role="button" onClick={save}>Save</div>');
  fs.writeFileSync(complete, '<div role="button" tabIndex={0} onClick={save} onKeyDown={onSaveKey}>Save</div>');

  const delegatedResult = runDetector(["--strict", "--json", delegated]);
  const delegatedPayload = JSON.parse(delegatedResult.stdout);
  const incompleteResult = runDetector(["--strict", "--json", incomplete]);
  const incompletePayload = JSON.parse(incompleteResult.stdout);
  const completePayload = JSON.parse(runDetector(["--json", complete]).stdout);
  const delegatedFinding = delegatedPayload.findings.find(({ id }) => id === "interactive-div");
  const incompleteFinding = incompletePayload.findings.find(({ id }) => id === "interactive-role-contract");

  assert.equal(delegatedResult.status, 0);
  assert.deepEqual(
    { severity: delegatedFinding.severity, classification: delegatedFinding.classification, confidence: delegatedFinding.confidence },
    { severity: "P2", classification: "advisory", confidence: "medium" },
  );
  assert.equal(incompleteResult.status, 1);
  assert.deepEqual(
    { severity: incompleteFinding.severity, classification: incompleteFinding.classification, confidence: incompleteFinding.confidence },
    { severity: "P1", classification: "objective", confidence: "high" },
  );
  assert.equal(
    completePayload.findings.some(({ id }) => ["interactive-div", "interactive-role-contract"].includes(id)),
    false,
  );
});

test("fail-on distinguishes exact technical defects from file-local heuristics", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-technical-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const source = path.join(target, "motion.css");
  fs.writeFileSync(source, ".button { transition: all 120ms; animation: enter 120ms; }");

  const exact = runDetector(["--json", "--category", "transition-all", "--fail-on=P2", source]);
  const heuristic = runDetector([
    "--json",
    "--category",
    "missing-reduced-motion-guard",
    "--fail-on=P2",
    source,
  ]);
  const exactFinding = JSON.parse(exact.stdout).findings[0];
  const heuristicFinding = JSON.parse(heuristic.stdout).findings[0];

  assert.equal(exact.status, 1);
  assert.deepEqual(
    { classification: exactFinding.classification, confidence: exactFinding.confidence },
    { classification: "objective", confidence: "high" },
  );
  assert.equal(heuristic.status, 0);
  assert.deepEqual(
    { classification: heuristicFinding.classification, confidence: heuristicFinding.confidence },
    { classification: "advisory", confidence: "low" },
  );
});

test("will-change auto is neutral while all and layout-heavy hints remain objective", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-will-change-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const source = path.join(target, "layers.tsx");
  fs.writeFileSync(
    source,
    [
      ".auto { will-change: auto; }",
      ".all { will-change: all; }",
      ".layout { will-change: width; }",
      'export const classes = "will-change-[auto] will-change-[all] will-change-[height]";',
    ].join("\n"),
  );

  const result = runDetector(["--json", "--category", "will-change-broad", source]);
  const payload = JSON.parse(result.stdout);

  assert.equal(result.status, 0);
  assert.equal(payload.findings.length, 4);
  assert.equal(payload.findings.some(({ snippet }) => /auto/i.test(snippet)), false);
  assert.equal(
    payload.findings.every(
      ({ severity, classification, confidence }) =>
        severity === "P2" && classification === "objective" && confidence === "high",
    ),
    true,
  );
});

test("P1 empty-image detection does not treat a named placeholder asset as a broken URL", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-image-src-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const validDraft = path.join(target, "valid.tsx");
  const broken = path.join(target, "broken.tsx");
  fs.writeFileSync(validDraft, '<img src="placeholder.png" alt="Draft preview" width="40" height="40">');
  fs.writeFileSync(broken, '<img src="#" alt="Broken" width="40" height="40">');

  const validPayload = JSON.parse(runDetector(["--json", validDraft]).stdout);
  const brokenPayload = JSON.parse(runDetector(["--json", broken]).stdout);

  assert.equal(validPayload.findings.some(({ id }) => id === "empty-img-src"), false);
  assert.equal(brokenPayload.findings.some(({ id }) => id === "empty-img-src"), true);
});

test("image spread attributes are unknown alt evidence, not an objective P1", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-img-spread-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const spread = path.join(target, "spread.tsx");
  const inlineSpread = path.join(target, "inline-spread.tsx");
  const explicit = path.join(target, "explicit.tsx");
  const missing = path.join(target, "missing.tsx");
  fs.writeFileSync(spread, "<img {...decorative} />");
  fs.writeFileSync(inlineSpread, '<img {...{ alt: "" }} />');
  fs.writeFileSync(explicit, '<img {...decorative} alt="" />');
  fs.writeFileSync(missing, '<img src="hero.png" />');

  const spreadResult = runDetector(["--strict", "--json", spread]);
  const spreadPayload = JSON.parse(spreadResult.stdout);
  const inlinePayload = JSON.parse(runDetector(["--json", inlineSpread]).stdout);
  const explicitPayload = JSON.parse(runDetector(["--json", explicit]).stdout);
  const missingPayload = JSON.parse(runDetector(["--json", missing]).stdout);
  const unknown = spreadPayload.findings.find(({ id }) => id === "img-alt-spread-unknown");

  assert.equal(spreadResult.status, 0);
  assert.equal(spreadPayload.findings.some(({ id }) => id === "missing-img-alt"), false);
  assert.deepEqual(
    { classification: unknown.classification, confidence: unknown.confidence, severity: unknown.severity },
    { classification: "advisory", confidence: "low", severity: "P2" },
  );
  assert.equal(inlinePayload.findings.some(({ id }) => id === "missing-img-alt"), false);
  assert.equal(inlinePayload.findings.some(({ id }) => id === "img-alt-spread-unknown"), true);
  assert.equal(explicitPayload.findings.some(({ id }) => ["missing-img-alt", "img-alt-spread-unknown"].includes(id)), false);
  assert.equal(missingPayload.findings.some(({ id }) => id === "missing-img-alt"), true);
});

test("inline arrow callbacks do not hide unnamed icon buttons", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-arrow-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const broken = path.join(target, "broken.tsx");
  const named = path.join(target, "named.tsx");
  fs.writeFileSync(broken, "<button onClick={() => close()}><Icon /></button>");
  fs.writeFileSync(named, '<button aria-label="Close" onClick={() => close()}><Icon /></button>');

  const brokenPayload = JSON.parse(runDetector(["--json", broken]).stdout);
  const namedPayload = JSON.parse(runDetector(["--json", named]).stdout);

  assert.equal(brokenPayload.findings.some(({ id }) => id === "button-name-risk"), true);
  assert.equal(namedPayload.findings.some(({ id }) => id === "button-name-risk"), false);
});

test("empty buttons are P1 while icon-derived names remain advisory or accepted", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-button-name-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const empty = path.join(target, "empty.tsx");
  const titledSvg = path.join(target, "titled-svg.tsx");
  const labelledSvg = path.join(target, "labelled-svg.tsx");
  const customIcon = path.join(target, "custom-icon.tsx");
  const spreadOnly = path.join(target, "spread-only.tsx");
  fs.writeFileSync(empty, "<button> </button>");
  fs.writeFileSync(titledSvg, "<button><svg><title>Close</title><path /></svg></button>");
  fs.writeFileSync(labelledSvg, '<button><svg aria-label="Close"><path /></svg></button>');
  fs.writeFileSync(customIcon, "<button><CloseIcon /></button>");
  fs.writeFileSync(spreadOnly, "<button {...props}></button>");

  const emptyResult = runDetector(["--strict", "--json", empty]);
  const emptyPayload = JSON.parse(emptyResult.stdout);
  const titledResult = runDetector(["--strict", "--json", titledSvg]);
  const titledPayload = JSON.parse(titledResult.stdout);
  const labelledPayload = JSON.parse(runDetector(["--json", labelledSvg]).stdout);
  const customResult = runDetector(["--strict", "--json", customIcon]);
  const customPayload = JSON.parse(customResult.stdout);
  const unknown = customPayload.findings.find(({ id }) => id === "button-name-risk");
  const spreadResult = runDetector(["--strict", "--json", spreadOnly]);
  const spreadPayload = JSON.parse(spreadResult.stdout);
  const spreadUnknown = spreadPayload.findings.find(({ id }) => id === "button-name-spread-unknown");

  assert.equal(emptyResult.status, 1);
  assert.equal(emptyPayload.findings.some(({ id }) => id === "empty-button-name"), true);
  assert.equal(titledResult.status, 0);
  assert.equal(titledPayload.findings.some(({ id }) => ["empty-button-name", "button-name-risk"].includes(id)), false);
  assert.equal(labelledPayload.findings.some(({ id }) => ["empty-button-name", "button-name-risk"].includes(id)), false);
  assert.equal(customResult.status, 0);
  assert.deepEqual(
    { severity: unknown.severity, classification: unknown.classification, confidence: unknown.confidence },
    { severity: "P2", classification: "advisory", confidence: "medium" },
  );
  assert.equal(spreadResult.status, 0);
  assert.equal(spreadPayload.findings.some(({ id }) => id === "empty-button-name"), false);
  assert.deepEqual(
    {
      severity: spreadUnknown.severity,
      classification: spreadUnknown.classification,
      confidence: spreadUnknown.confidence,
    },
    { severity: "P2", classification: "advisory", confidence: "low" },
  );
});

test("greater-than characters inside JSX attributes do not terminate tag analysis", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-jsx-tag-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const source = path.join(target, "button.tsx");
  fs.writeFileSync(
    source,
    '<button data-label="Next > step" onClick={() => count > 0 && close()}><Icon /></button>',
  );

  const payload = JSON.parse(runDetector(["--json", source]).stdout);

  assert.equal(payload.findings.some(({ id }) => id === "button-name-risk"), true);
});

test("strict is an unambiguous P1 objective gate", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-strict-contract-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const source = path.join(target, "style.css");
  fs.writeFileSync(source, ".button { transition: all 120ms; }");

  const strict = runDetector(["--strict", source]);
  const conflicting = runDetector(["--strict", "--fail-on=P3", source]);

  assert.equal(strict.status, 0);
  assert.equal(conflicting.status, 2);
  assert.match(conflicting.stderr, /choose either --strict or --fail-on/i);
});

test("overlapping targets scan each physical source once", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-overlap-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const source = path.join(target, "button.css");
  fs.writeFileSync(source, ".button { transition: all 120ms; }");

  const payload = JSON.parse(runDetector(["--json", target, source]).stdout);

  assert.equal(payload.files, 1);
  assert.equal(payload.findings.filter(({ id }) => id === "transition-all").length, 1);
});

test("help is a successful public CLI action while missing arguments remain an error", () => {
  const help = runDetector(["--help"]);
  const missing = runDetector([]);

  assert.equal(help.status, 0);
  assert.match(help.stdout, /^Usage:/);
  assert.equal(help.stderr, "");
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /^Usage:/);
});

test("value-taking options reject missing values without consuming the next flag", () => {
  for (const option of ["--out", "--baseline", "--allowlist", "--category", "--format", "--fail-on"]) {
    for (const args of [[option], [option, "--json", path.join(fixtures, "negative.tsx")]]) {
      const result = runDetector(args);
      assert.equal(result.status, 2, `${args.join(" ")} should be a usage error`);
      assert.match(result.stderr, new RegExp(`${option} requires a value`, "i"));
      assert.equal(result.stdout, "");
    }
  }
});

test("directory symlinks and junctions are not followed during collection", (t) => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "detector-link-"));
  t.after(() => fs.rmSync(base, { force: true, recursive: true }));
  const target = path.join(base, "target");
  const external = path.join(base, "external");
  fs.mkdirSync(target);
  fs.mkdirSync(external);
  fs.writeFileSync(path.join(target, "local.css"), ".local { transition: all 120ms; }");
  fs.writeFileSync(path.join(external, "external.css"), ".external { transition: all 120ms; }");
  try {
    fs.symlinkSync(external, path.join(target, "linked"), process.platform === "win32" ? "junction" : "dir");
    fs.symlinkSync(target, path.join(target, "cycle"), process.platform === "win32" ? "junction" : "dir");
  } catch (error) {
    if (["EPERM", "EACCES", "ENOSYS"].includes(error.code)) {
      t.skip(`links unavailable: ${error.code}`);
      return;
    }
    throw error;
  }

  const payload = JSON.parse(runDetector(["--json", target]).stdout);

  assert.equal(payload.files, 1);
  assert.deepEqual([...new Set(payload.findings.map(({ file }) => path.basename(file)))], ["local.css"]);
});

test("inline option values preserve embedded equals characters", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "detector-inline-"));
  t.after(() => fs.rmSync(target, { force: true, recursive: true }));
  const source = path.join(target, "source.css");
  const output = path.join(target, "report=detector.json");
  fs.writeFileSync(source, ".button { transition: all 120ms; }");

  const result = runDetector(["--json", `--out=${output}`, source]);

  assert.equal(result.status, 0);
  assert.equal(result.stdout, "");
  assert.equal(fs.existsSync(output), true);
  assert.equal(JSON.parse(fs.readFileSync(output, "utf8")).files, 1);
});
