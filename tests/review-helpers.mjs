import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { deflateSync } from "node:zlib";
import { tempDir } from "./helpers/cli.mjs";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const reviewScript = path.join(repoRoot, "SKILLS", "improve-ui", "scripts", "run-interface-review.mjs");

export function makeWorkspace(prefix = "improve-ui-review-") {
  return tempDir(prefix.replace(/-+$/, ""));
}

export function writeFixture(directory, relativePath, content) {
  const target = path.join(directory, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
  return target;
}

export function fileUrl(file) {
  return pathToFileURL(file).href;
}

export function sha256(file) {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

export function pngBuffer(width, height, rgba = [32, 64, 96, 255]) {
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
    for (let x = 0; x < width; x += 1) pixels.set(rgba, row + 1 + x * 4);
  }
  return Buffer.concat([
    signature,
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(pixels)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
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

export function runReview(args, { env = {}, cwd = repoRoot } = {}) {
  return runReviewScript(reviewScript, args, { env, cwd });
}

export function runReviewScript(script, args, { env = {}, cwd = repoRoot } = {}) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd,
    env: { ...process.env, ...env },
    encoding: "utf8",
    timeout: 60_000,
  });
  if (result.error) throw result.error;
  return result;
}

export function readReview(outDir) {
  const reportPath = path.join(outDir, "review.json");
  assert.equal(fs.existsSync(reportPath), true, `Expected report at ${reportPath}`);
  return JSON.parse(fs.readFileSync(reportPath, "utf8"));
}
