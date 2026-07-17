import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { deflateSync } from "node:zlib";
import { makeWorkspace, readReview, runReview, sha256, writeFixture } from "./review-helpers.mjs";

function proofFixture({
  version = 1,
  claim = "The primary state is clearer after the change.",
  kind = "viewport",
  afterKind = kind,
  omitKind = false,
  deviceScaleFactor = 1,
  afterDeviceScaleFactor = deviceScaleFactor,
  afterViewport = "64x48",
  afterState = "default",
  corruptHash = false,
  missingAfter = false,
  invalidAfterImage = false,
  tinyAfterImage = false,
  differentAfterDimensions = false,
  identicalAfterImage = false,
  fakeAfterPng = false,
  corruptAfterCrc = false,
  fullPageHeight = 96,
} = {}) {
  const workspace = makeWorkspace("improve-ui-proof-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main>proof</main>;");
  const baseWidth = Math.round(64 * deviceScaleFactor);
  const baseHeight = kind === "full-page" ? Math.round(fullPageHeight * deviceScaleFactor) : Math.round(48 * deviceScaleFactor);
  const beforeImage = pngBuffer(baseWidth, baseHeight, [32, 64, 96, 255]);
  const before = writeFixture(workspace, "before.png", beforeImage);
  const after = writeFixture(
    workspace,
    "after.png",
    invalidAfterImage
      ? Buffer.from("this is not an image even though the filename says png")
      : tinyAfterImage
        ? pngBuffer(1, 1, [0, 0, 0, 255])
        : fakeAfterPng
          ? fakePngHeader(64, 48)
        : identicalAfterImage
          ? beforeImage
          : pngBuffer(
              differentAfterDimensions ? baseWidth + 1 : Math.round(64 * afterDeviceScaleFactor),
              afterKind === "full-page" ? Math.round(fullPageHeight * afterDeviceScaleFactor) : Math.round(48 * afterDeviceScaleFactor),
              [48, 96, 144, 255],
            ),
  );
  if (corruptAfterCrc) {
    const bytes = fs.readFileSync(after);
    bytes[bytes.length - 1] ^= 0xff;
    fs.writeFileSync(after, bytes);
  }
  const beforeEntry = {
    artifact: "before.png", state: "default", viewport: "64x48", kind, deviceScaleFactor, sha256: sha256(before),
  };
  const afterEntry = {
    artifact: "after.png", state: afterState, viewport: afterViewport, kind: afterKind, deviceScaleFactor: afterDeviceScaleFactor,
    sha256: corruptHash ? "0".repeat(64) : sha256(after),
  };
  if (omitKind) delete afterEntry.kind;
  const manifest = writeFixture(workspace, "proof.json", JSON.stringify({
    version,
    claim,
    before: beforeEntry,
    after: afterEntry,
  }, null, 2));
  if (missingAfter) fs.rmSync(after);
  return { workspace, target, manifest };
}

test("free-form change proof is rejected instead of self-attesting", () => {
  const fixture = proofFixture();
  const outDir = path.join(fixture.workspace, "report");

  const result = runReview(["--path", fixture.target, "--out", outDir, "--strict", "--require-change-proof", "--change-proof", "looks good"]);

  assert.equal(result.status, 1, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.evidenceCoverage.changeProof.status, "blocked");
  assert.match(review.ledger.blockers.map((item) => item.reason).join(" "), /manifest could not be loaded/i);
});

test("a directory cannot masquerade as a proof manifest and still produces a blocked report", () => {
  const fixture = proofFixture();
  const outDir = path.join(fixture.workspace, "report-directory");

  const result = runReview(["--path", fixture.target, "--out", outDir, "--strict", "--proof-manifest", fixture.workspace]);

  assert.equal(result.status, 1, result.stdout || result.stderr);
  assert.equal(readReview(outDir).evidenceCoverage.changeProof.status, "blocked");
});

test("a valid manifest proves existing same-state same-viewport artifacts by hash", () => {
  const fixture = proofFixture();
  const outDir = path.join(fixture.workspace, "report");

  const result = runReview(["--path", fixture.target, "--out", outDir, "--strict", "--require-change-proof", "--proof-manifest", fixture.manifest]);

  assert.equal(result.status, 0, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.evidenceCoverage.changeProof.status, "captured");
  assert.equal(review.proof.before.viewport, "64x48");
  assert.equal(review.proof.before.state, review.proof.after.state);
  assert.equal(review.proof.before.kind, "viewport");
  assert.equal(review.proof.before.deviceScaleFactor, 1);
  assert.match(review.proof.before.sha256, /^[a-f0-9]{64}$/);
  assert.equal(review.proof.before.mediaType, "image/png");
  assert.ok(review.proof.before.byteLength >= 32);
  assert.equal(review.proof.before.pixelWidth, 64);
  assert.equal(review.proof.before.pixelHeight, 48);
});

test("different PNG compression cannot prove a visual change when decoded pixels are identical", () => {
  const workspace = makeWorkspace("improve-ui-proof-pixel-identity-");
  const target = writeFixture(workspace, "target.tsx", "export const Target = () => <main>proof</main>;");
  const pixels = [32, 64, 96, 255];
  const before = writeFixture(workspace, "before.png", pngBuffer(64, 48, pixels, 1));
  const after = writeFixture(workspace, "after.png", pngBuffer(64, 48, pixels, 9));
  assert.notEqual(sha256(before), sha256(after), "fixture PNG containers must differ");
  const manifest = writeFixture(workspace, "proof.json", JSON.stringify({
    version: 1,
    claim: "The primary state changed.",
    before: { artifact: "before.png", state: "default", viewport: "64x48", kind: "viewport", sha256: sha256(before) },
    after: { artifact: "after.png", state: "default", viewport: "64x48", kind: "viewport", sha256: sha256(after) },
  }));
  const outDir = path.join(workspace, "report");

  const result = runReview(["--path", target, "--out", outDir, "--strict", "--require-change-proof", "--proof-manifest", manifest]);

  assert.equal(result.status, 1, result.stdout || result.stderr);
  const review = readReview(outDir);
  assert.equal(review.evidenceCoverage.changeProof.status, "blocked");
  assert.match(review.ledger.blockers.map((blocker) => blocker.reason).join(" "), /pixel|visual|identical/i);
});

test("proof supports DPR-aware viewport and full-page evidence with explicit kinds", () => {
  for (const variant of [{ deviceScaleFactor: 2 }, { kind: "full-page", fullPageHeight: 96 }]) {
    const fixture = proofFixture(variant);
    const outDir = path.join(fixture.workspace, "report");
    const result = runReview(["--path", fixture.target, "--out", outDir, "--strict", "--proof-manifest", fixture.manifest]);

    assert.equal(result.status, 0, result.stdout || result.stderr);
    const proof = readReview(outDir).proof;
    assert.equal(proof.before.kind, variant.kind || "viewport");
    assert.equal(proof.before.deviceScaleFactor, variant.deviceScaleFactor || 1);
    assert.equal(proof.before.pixelWidth, 64 * (variant.deviceScaleFactor || 1));
    assert.ok(proof.before.pixelHeight >= 48 * (variant.deviceScaleFactor || 1));
  }
});

test("proof rejects unsupported versions, empty claims, placeholders, and mismatched evidence", () => {
  for (const variant of [
    { version: 2 },
    { claim: "  " },
    { invalidAfterImage: true },
    { tinyAfterImage: true },
    { differentAfterDimensions: true },
    { identicalAfterImage: true },
    { fakeAfterPng: true },
    { corruptAfterCrc: true },
    { omitKind: true },
    { afterKind: "full-page" },
    { afterDeviceScaleFactor: 2 },
    { missingAfter: true },
    { afterState: "error" },
    { afterViewport: "390x844" },
    { corruptHash: true },
  ]) {
    const fixture = proofFixture(variant);
    const outDir = path.join(fixture.workspace, "report");

    const result = runReview(["--path", fixture.target, "--out", outDir, "--strict", "--proof-manifest", fixture.manifest]);

    assert.equal(result.status, 1, result.stdout || result.stderr);
    const review = readReview(outDir);
    assert.equal(review.evidenceCoverage.changeProof.status, "blocked");
  }
});

test("reproducibility metadata is deterministic for the same review inputs", () => {
  const fixture = proofFixture();
  const outA = path.join(fixture.workspace, "report-a");
  const outB = path.join(fixture.workspace, "report-b");
  const args = ["--path", fixture.target, "--proof-manifest", fixture.manifest, "--viewport", "64x48"];

  const first = runReview([...args, "--out", outA]);
  const second = runReview([...args, "--out", outB]);

  assert.equal(first.status, 0, first.stdout || first.stderr);
  assert.equal(second.status, 0, second.stdout || second.stderr);
  const metadataA = readReview(outA).metadata;
  const metadataB = readReview(outB).metadata;
  assert.equal(metadataA.reproducibility.configurationSha256, metadataB.reproducibility.configurationSha256);
  assert.equal(metadataA.reproducibility.harnessSha256, metadataB.reproducibility.harnessSha256);
  assert.match(metadataA.reproducibility.configurationSha256, /^[a-f0-9]{64}$/);
  assert.deepEqual(metadataA.reproducibility.targetGit, metadataB.reproducibility.targetGit);
  assert.deepEqual(metadataA.reproducibility.harnessGit, metadataB.reproducibility.harnessGit);
  assert.deepEqual(metadataA.skill, metadataB.skill);
  assert.equal(metadataA.skill.name, "improve-ui");
  assert.equal(metadataA.skill.version, "0.3.0");
  assert.match(metadataA.skill.manifestSha256, /^[a-f0-9]{64}$/);
});

function pngBuffer(width, height, rgba, compressionLevel = 6) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const stride = width * 4 + 1;
  const pixels = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * stride;
    pixels[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const offset = row + 1 + x * 4;
      pixels.set(rgba, offset);
    }
  }
  return Buffer.concat([
    signature,
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(pixels, { level: compressionLevel })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function fakePngHeader(width, height) {
  const bytes = Buffer.alloc(64);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bytes, 0);
  Buffer.from("IHDR").copy(bytes, 12);
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  Buffer.from("IEND").copy(bytes, 52);
  return bytes;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([length, typeBytes, data, checksum]);
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
