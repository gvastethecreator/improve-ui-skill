#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";
import { designReportManifestFromReview, writeDesignReport } from "./generate-design-report.mjs";

const require = createRequire(import.meta.url);
const severityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
const assessmentVerdicts = new Set(["blocked", "incomplete"]);
const dimensionNames = ["accessibility", "performance", "themingDesignSystem", "responsiveContent", "visualTrustFit"];
const asyncStateNames = ["empty", "loading", "error", "permission", "long-content", "slow-network", "rapid-click"];
const harnessVersion = "2.2.0";
const root = findRepoRoot();
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const detectorPath = path.join(scriptDir, "detect-ui-antipatterns.mjs");
const cliArgs = process.argv.slice(2);
if (cliArgs.includes("--help") || cliArgs.includes("-h")) {
  usage(process.stdout);
  process.exit(0);
}
const options = parseArgs(cliArgs);

if (!options.path && !options.url) {
  usage();
  process.exit(2);
}

const slug = options.slug || slugify(options.url || options.path || "review");
const outputMode = options.out ? "explicit" : "temporary";
const outDir = outputMode === "explicit"
  ? path.resolve(options.out)
  : fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), `improve-ui-review-${slug}-`)));
const screenshotsDir = path.join(outDir, "screenshots");
const reportAssetsDir = path.join(outDir, "report-assets");
const ownershipMarkerPath = path.join(outDir, ".improve-ui-owned.json");
try {
  validateOutputPreflight();
  const priorOwnership = readOwnershipMarker(outDir, ownershipMarkerPath);
  validateOutputCollisions(priorOwnership);
  prepareOwnedOutput(outDir, ownershipMarkerPath, priorOwnership);
} catch (error) {
  console.error(`Unsafe output path: ${error.message}`);
  process.exit(2);
}
const ownedOutputFiles = new Map();
fs.mkdirSync(outDir, { recursive: true });

const review = {
  schemaVersion: 2,
  reviewedAt: new Date().toISOString(),
  metadata: buildMetadata(),
  target: {
    path: options.path ? displayPath(path.resolve(options.path)) : null,
    url: options.url || null,
  },
  ledger: {
    context: {
      register: options.register || "unknown",
      surface: options.surface || "unknown",
      viewports: options.viewports,
      states: options.states.length ? options.states : options.actionGroups.map((group) => group.name),
      waitUntil: options.waitUntil,
      settleMs: options.settleMs,
      deviceScaleFactor: options.deviceScaleFactor,
      proofManifest: options.proofManifest ? displayPath(path.resolve(options.proofManifest)) : null,
      strictPolicy: {
        enabled: options.strict,
        p0P1: "unresolved objective findings fail",
        p2: options.p2Policy,
        systemicThreshold: options.systemicP2Count,
        includeAdvisory: options.includeAdvisory,
      },
    },
    evidence: [],
    changeAmbition: options.ambition || "unknown",
    blockers: [],
  },
  proof: null,
  static: null,
  runtime: null,
  findings: [],
  assessment: null,
  evidenceCoverage: null,
  gates: [],
  expectations: [],
};

const validation = validateTargets(review);
if (options.path && validation.static) runStaticReview(review);
if (options.url && validation.runtime) review.runtime = await runRuntimeReview(review);
if (options.proofManifest) review.proof = loadProofManifest(review, options.proofManifest);

refreshReviewDerivedState(review);

const jsonPath = path.join(outDir, "review.json");
const markdownPath = path.join(outDir, "README.md");
const reportManifestPath = path.join(outDir, "report-manifest.json");
const reportHtmlPath = path.join(outDir, "report.html");
const reportMarkdownPath = path.join(outDir, "report.md");
fs.writeFileSync(jsonPath, `${JSON.stringify(review, null, 2)}\n`);
fs.writeFileSync(markdownPath, renderMarkdown(review, jsonPath));
if (review.proof && !revalidateProofAtEnd(review, options.proofManifest)) {
  refreshReviewDerivedState(review);
  fs.writeFileSync(jsonPath, `${JSON.stringify(review, null, 2)}\n`);
  fs.writeFileSync(markdownPath, renderMarkdown(review, jsonPath));
}
const reportManifest = designReportManifestFromReview(review, { baseDir: root });
const dossier = writeDesignReport({
  manifest: reportManifest,
  outPath: reportHtmlPath,
  markdownOutPath: reportMarkdownPath,
  baseDir: root,
  embedImages: true,
  strictAssets: false,
});
const portableReportManifest = {
  ...reportManifest,
  screenshots: reportManifest.screenshots.map((item) => ({
    ...item,
    src: `report-assets/${item.id}.png`,
  })),
};
fs.writeFileSync(reportManifestPath, `${JSON.stringify(portableReportManifest, null, 2)}\n`);
recordOwnedOutput(jsonPath);
recordOwnedOutput(markdownPath);
recordOwnedOutput(reportManifestPath);
recordOwnedOutput(reportHtmlPath);
recordOwnedOutput(reportMarkdownPath);
if (dossier.markdownAssetsDir && fs.existsSync(dossier.markdownAssetsDir)) {
  for (const entry of fs.readdirSync(dossier.markdownAssetsDir, { withFileTypes: true })) {
    if (entry.isFile()) recordOwnedOutput(path.join(dossier.markdownAssetsDir, entry.name));
  }
}
writeOwnershipMarker();

const summary = {
  outDir: outputMode === "temporary" ? outDir : path.relative(root, outDir),
  outputMode,
  findings: review.findings.length,
  bySeverity: summarizeSeverity(review.findings),
  assessment: review.assessment,
  evidenceCoverage: review.evidenceCoverage,
  gates: review.gates,
  expectations: review.expectations,
  blockers: review.ledger.blockers,
  dossier: {
    manifest: displayPath(reportManifestPath),
    markdown: displayPath(reportMarkdownPath),
    html: displayPath(reportHtmlPath),
    assets: dossier.markdownAssets,
    warnings: dossier.warnings,
  },
};
console.log(JSON.stringify(summary, null, 2));

if (validation.fatal || review.ledger.blockers.some((blocker) => blocker.fatal)) {
  setExitCode(2);
}
if (review.assessment.verdict === "blocked") {
  setExitCode(1);
}
if (options.proofManifest && !review.proof) {
  setExitCode(1);
}
if (options.failOn && gateableFindings(review.findings).some((finding) => severityRank[finding.severity] <= severityRank[options.failOn])) {
  setExitCode(1);
}
if (options.fail && (review.gates.some((gate) => gate.status === "fail") || review.ledger.blockers.length)) {
  setExitCode(1);
}
if (options.strict && strictFailed(review)) {
  setExitCode(1);
}
if (review.expectations.some((expectation) => expectation.status === "fail")) {
  setExitCode(1);
}

function validateTargets(targetReview) {
  const result = { static: true, runtime: true, fatal: false };
  if (options.path) {
    const targetPath = path.resolve(options.path);
    if (!fs.existsSync(targetPath)) {
      addBlocker(targetReview, "static-target", `Static target does not exist: ${targetPath}`, true);
      result.static = false;
      result.fatal = true;
    }
  }
  if (options.url) {
    try {
      const parsedUrl = new URL(options.url);
      if (!new Set(["http:", "https:", "file:"]).has(parsedUrl.protocol)) {
        throw new Error(`unsupported protocol ${parsedUrl.protocol}`);
      }
    } catch (error) {
      addBlocker(targetReview, "runtime-target", `Runtime URL is invalid: ${error.message}`, true);
      result.runtime = false;
      result.fatal = true;
    }
  }
  if (options.requireRuntime && !options.url) {
    addBlocker(targetReview, "runtime-target", "Runtime evidence is required but --url was not provided.");
    result.runtime = false;
  }
  return result;
}

function buildMetadata() {
  const targetGitStart = options.path ? gitStartForTarget(options.path) : process.cwd();
  const normalizedConfig = {
    outputMode,
    targetPath: options.path ? path.resolve(options.path) : null,
    targetUrl: options.url,
    viewports: options.viewports,
    states: options.states,
    actionGroups: options.actionGroups.map((group) => ({
      name: group.name,
      source: group.source ? displayPath(group.source) : null,
      sourceSha256: group.sourceSha256 || null,
      actions: group.actions.map(sanitizeAction),
      assertions: group.assertions.map(sanitizeAssertion),
    })),
    actionGroupsSha256: hashText(stableStringify(options.actionGroups)),
    waitUntil: options.waitUntil,
    settleMs: options.settleMs,
    deviceScaleFactor: options.deviceScaleFactor,
    timeout: options.timeout,
    strict: options.strict,
    p2Policy: options.p2Policy,
    systemicP2Count: options.systemicP2Count,
    asyncUi: options.asyncUi,
    requireRuntime: options.requireRuntime,
    requireChangeProof: options.requireChangeProof,
    proofManifest: options.proofManifest ? path.resolve(options.proofManifest) : null,
    proofManifestSha256: options.proofManifest ? fileSha256OrNull(path.resolve(options.proofManifest)) : null,
  };
  return {
    harness: { version: harnessVersion, schemaVersion: 2 },
    skill: loadSkillMetadata(),
    output: { mode: outputMode, directory: outDir },
    actionGroups: normalizedConfig.actionGroups,
    reproducibility: {
      configurationSha256: hashText(stableStringify(normalizedConfig)),
      harnessSha256: hashFile(fileURLToPath(import.meta.url)),
      detectorSha256: fileSha256OrNull(detectorPath),
      targetGit: readGitMetadata(targetGitStart, options.path ? "path" : "cwd-fallback"),
      harnessGit: readGitMetadata(scriptDir, "harness-source"),
    },
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    runtime: null,
  };
}

function gitStartForTarget(target) {
  const absolute = path.resolve(target);
  try {
    return fs.statSync(absolute).isDirectory() ? absolute : path.dirname(absolute);
  } catch {
    return path.dirname(absolute);
  }
}

function readGitMetadata(start, source) {
  const gitRoot = runGitAt(start, ["rev-parse", "--show-toplevel"]);
  if (gitRoot === null) return { source, root: null, commit: null, dirty: null };
  const commit = runGitAt(gitRoot, ["rev-parse", "HEAD"]);
  const status = runGitAt(gitRoot, ["status", "--porcelain"]);
  return {
    source,
    root: path.resolve(gitRoot),
    commit,
    dirty: status === null ? null : status.length > 0,
  };
}

function loadSkillMetadata() {
  const manifestPath = path.resolve(scriptDir, "..", "skill-manifest.json");
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (typeof manifest.name !== "string" || typeof manifest.version !== "string") return null;
    return {
      name: manifest.name,
      version: manifest.version,
      manifestSha256: hashFile(manifestPath),
    };
  } catch {
    return null;
  }
}

function loadProofManifest(targetReview, manifestFile) {
  const absoluteManifest = path.resolve(manifestFile);
  let manifest;
  let manifestBytes;
  try {
    if (!fs.statSync(absoluteManifest).isFile()) throw new Error("manifest is not a file");
    manifestBytes = fs.readFileSync(absoluteManifest);
    manifest = JSON.parse(manifestBytes.toString("utf8"));
  } catch (error) {
    addBlocker(targetReview, "change-proof", `Proof manifest could not be loaded: ${error.message}`);
    return null;
  }

  try {
    if (manifest.version !== 1) throw new Error("version must be exactly 1");
    if (typeof manifest.claim !== "string" || !manifest.claim.trim()) throw new Error("claim must be a non-empty string");
    const before = validateProofArtifact(manifest.before, "before", absoluteManifest);
    const after = validateProofArtifact(manifest.after, "after", absoluteManifest);
    if (before.state !== after.state) throw new Error(`before/after states differ (${before.state} vs ${after.state})`);
    if (before.viewport !== after.viewport) throw new Error(`before/after viewports differ (${before.viewport} vs ${after.viewport})`);
    if (before.kind !== after.kind) throw new Error(`before/after kinds differ (${before.kind} vs ${after.kind})`);
    if (before.deviceScaleFactor !== after.deviceScaleFactor) {
      throw new Error(`before/after deviceScaleFactor differs (${before.deviceScaleFactor} vs ${after.deviceScaleFactor})`);
    }
    if (before.sha256 === after.sha256) {
      throw new Error("before/after artifacts are byte-identical and do not evidence a change");
    }
    if (before.pixelSha256 === after.pixelSha256) {
      throw new Error("before/after decoded pixels are visually identical and do not evidence a change");
    }
    const proof = {
      version: manifest.version ?? 1,
      manifest: displayPath(absoluteManifest),
      manifestSha256: hashText(manifestBytes),
      claim: manifest.claim.trim(),
      before,
      after,
    };
    if (targetReview.metadata?.reproducibility) {
      targetReview.metadata.reproducibility.proofManifestSha256 = proof.manifestSha256;
    }
    targetReview.ledger.evidence.push({
      type: "change-proof",
      path: proof.manifest,
      state: before.state,
      viewport: before.viewport,
      kind: before.kind,
      deviceScaleFactor: before.deviceScaleFactor,
      artifacts: [before.artifact, after.artifact],
    });
    return proof;
  } catch (error) {
    addBlocker(targetReview, "change-proof", `Proof manifest is invalid: ${error.message}`);
    return null;
  }
}

function revalidateProofAtEnd(targetReview, manifestFile) {
  const scratchReview = { ledger: { evidence: [], blockers: [] } };
  const refreshed = loadProofManifest(scratchReview, manifestFile);
  if (refreshed && stableStringify(refreshed) === stableStringify(targetReview.proof)) return true;

  const reason = scratchReview.ledger.blockers.map((blocker) => blocker.reason).join(" ")
    || "proof manifest or artifact metadata changed after initial validation";
  targetReview.proof = null;
  targetReview.ledger.evidence = targetReview.ledger.evidence.filter((item) => item.type !== "change-proof");
  addBlocker(targetReview, "change-proof", `Final proof revalidation failed: ${reason}`);
  return false;
}

function validateProofArtifact(entry, label, manifestFile) {
  if (!entry || typeof entry !== "object") throw new Error(`${label} must be an object`);
  if (typeof entry.artifact !== "string" || !entry.artifact.trim()) throw new Error(`${label}.artifact is required`);
  if (typeof entry.state !== "string" || !entry.state.trim()) throw new Error(`${label}.state is required`);
  const kind = normalizeProofKind(entry.kind, `${label}.kind`);
  const deviceScaleFactor = normalizeDeviceScaleFactor(entry.deviceScaleFactor, `${label}.deviceScaleFactor`);
  const viewport = normalizeProofViewport(entry.viewport, `${label}.viewport`);
  const expectedHash = String(entry.sha256 || "").toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(expectedHash)) throw new Error(`${label}.sha256 must be a 64-character SHA-256`);
  const absoluteArtifact = path.resolve(path.dirname(manifestFile), entry.artifact);
  if (isReservedOutputPath(absoluteArtifact)) {
    throw new Error(`${label}.artifact overlaps or aliases a reserved output path for the current review run`);
  }
  if (isCurrentOwnedOutputPath(absoluteArtifact)) {
    throw new Error(`${label}.artifact overlaps or aliases an output file owned by the current review run`);
  }
  if (!fs.existsSync(absoluteArtifact) || !fs.statSync(absoluteArtifact).isFile()) {
    throw new Error(`${label}.artifact does not exist: ${absoluteArtifact}`);
  }
  const image = inspectProofImage(absoluteArtifact, label);
  validateProofPixelContract(image, viewport, kind, deviceScaleFactor, label);
  const actualHash = hashText(image.bytes);
  if (actualHash !== expectedHash) throw new Error(`${label}.sha256 does not match artifact content`);
  return {
    artifact: displayPath(absoluteArtifact),
    state: entry.state.trim(),
    viewport,
    kind,
    deviceScaleFactor,
    sha256: actualHash,
    pixelSha256: image.pixelSha256,
    mediaType: image.mediaType,
    byteLength: image.bytes.length,
    pixelWidth: image.pixelWidth,
    pixelHeight: image.pixelHeight,
  };
}

function normalizeProofKind(value, field) {
  const kind = String(value || "").toLowerCase();
  if (!new Set(["viewport", "full-page", "element"]).has(kind)) {
    throw new Error(`${field} must be viewport, full-page, or element`);
  }
  return kind;
}

function normalizeDeviceScaleFactor(value, field) {
  const deviceScaleFactor = value === undefined ? 1 : value;
  if (typeof deviceScaleFactor !== "number" || !Number.isFinite(deviceScaleFactor) || deviceScaleFactor <= 0 || deviceScaleFactor > 8) {
    throw new Error(`${field} must be a number greater than 0 and at most 8`);
  }
  return deviceScaleFactor;
}

function validateProofPixelContract(image, viewport, kind, deviceScaleFactor, label) {
  const match = viewport.match(/^(\d+)x(\d+)$/);
  const expectedWidth = Math.round(Number(match[1]) * deviceScaleFactor);
  const expectedHeight = Math.round(Number(match[2]) * deviceScaleFactor);
  if (kind === "viewport" && (image.pixelWidth !== expectedWidth || image.pixelHeight !== expectedHeight)) {
    throw new Error(`${label}.artifact viewport pixels must be ${expectedWidth}x${expectedHeight}; got ${image.pixelWidth}x${image.pixelHeight}`);
  }
  if (kind === "full-page" && (image.pixelWidth < expectedWidth || image.pixelHeight < expectedHeight)) {
    throw new Error(`${label}.artifact full-page pixels must be at least ${expectedWidth}x${expectedHeight}; got ${image.pixelWidth}x${image.pixelHeight}`);
  }
}

function inspectProofImage(file, label) {
  const image = inspectPng(file, `${label}.artifact`);
  return validateProofImageDimensions(image.bytes, image.mediaType, image.pixelWidth, image.pixelHeight, image.pixelSha256, label);
}

function validateProofImageDimensions(bytes, mediaType, pixelWidth, pixelHeight, pixelSha256, label) {
  if (!Number.isInteger(pixelWidth) || !Number.isInteger(pixelHeight) || pixelWidth < 32 || pixelHeight < 32) {
    throw new Error(`${label}.artifact must be at least 32x32 pixels; got ${pixelWidth}x${pixelHeight}`);
  }
  return { bytes, mediaType, pixelWidth, pixelHeight, pixelSha256 };
}

function inspectPng(file, label) {
  const bytes = fs.readFileSync(file);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (bytes.length < 57 || !bytes.subarray(0, 8).equals(signature)) throw new Error(`${label} must be a structurally valid PNG image`);
  let offset = 8;
  let header = null;
  let sawIdat = false;
  let idatEnded = false;
  let sawIend = false;
  const idatChunks = [];
  while (offset < bytes.length) {
    if (offset + 12 > bytes.length) throw new Error(`${label} has a truncated PNG chunk`);
    const length = bytes.readUInt32BE(offset);
    const typeStart = offset + 4;
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const chunkEnd = dataEnd + 4;
    if (chunkEnd > bytes.length) throw new Error(`${label} has an invalid PNG chunk length`);
    const typeBytes = bytes.subarray(typeStart, dataStart);
    const type = typeBytes.toString("ascii");
    if (!/^[A-Za-z]{4}$/.test(type)) throw new Error(`${label} has an invalid PNG chunk type`);
    const expectedCrc = bytes.readUInt32BE(dataEnd);
    const actualCrc = pngCrc32(Buffer.concat([typeBytes, bytes.subarray(dataStart, dataEnd)]));
    if (actualCrc !== expectedCrc) throw new Error(`${label} has a PNG CRC mismatch in ${type}`);
    if (!header && type !== "IHDR") throw new Error(`${label} PNG must start with IHDR`);
    if (type === "IHDR") {
      if (header || length !== 13) throw new Error(`${label} has an invalid or duplicate IHDR`);
      header = {
        width: bytes.readUInt32BE(dataStart),
        height: bytes.readUInt32BE(dataStart + 4),
        bitDepth: bytes[dataStart + 8],
        colorType: bytes[dataStart + 9],
        compression: bytes[dataStart + 10],
        filter: bytes[dataStart + 11],
        interlace: bytes[dataStart + 12],
      };
      if (!header.width || !header.height || header.bitDepth !== 8 || ![2, 6].includes(header.colorType)
        || header.compression !== 0 || header.filter !== 0 || header.interlace !== 0) {
        throw new Error(`${label} PNG must be non-interlaced 8-bit RGB or RGBA`);
      }
    } else if (type === "IDAT") {
      if (!header || idatEnded) throw new Error(`${label} has non-consecutive or misplaced IDAT chunks`);
      sawIdat = true;
      idatChunks.push(bytes.subarray(dataStart, dataEnd));
    } else {
      if (sawIdat && type !== "IEND") idatEnded = true;
      if (type === "IEND") {
        if (length !== 0 || !sawIdat) throw new Error(`${label} has an invalid IEND`);
        sawIend = true;
        if (chunkEnd !== bytes.length) throw new Error(`${label} has trailing data after IEND`);
      } else if (type[0] === type[0].toUpperCase() && !new Set(["PLTE"]).has(type)) {
        throw new Error(`${label} has unsupported critical PNG chunk ${type}`);
      }
    }
    offset = chunkEnd;
    if (sawIend) break;
  }
  if (!header || !sawIdat || !sawIend || offset !== bytes.length) throw new Error(`${label} is missing required PNG chunks`);
  const channels = header.colorType === 6 ? 4 : 3;
  const expectedInflatedLength = header.height * (1 + header.width * channels);
  if (!Number.isSafeInteger(expectedInflatedLength) || expectedInflatedLength > 512 * 1024 * 1024) {
    throw new Error(`${label} PNG dimensions exceed the validation budget`);
  }
  let inflated;
  try {
    inflated = inflateSync(Buffer.concat(idatChunks), { maxOutputLength: expectedInflatedLength });
  } catch (error) {
    throw new Error(`${label} has invalid PNG image data: ${error.message}`);
  }
  if (inflated.length !== expectedInflatedLength) throw new Error(`${label} PNG image data length does not match IHDR`);
  const stride = 1 + header.width * channels;
  for (let row = 0; row < header.height; row += 1) {
    if (inflated[row * stride] > 4) throw new Error(`${label} has an invalid PNG row filter`);
  }
  const decodedPixels = decodePngPixels(inflated, header, channels);
  const canonicalPixels = canonicalRgbaPixels(decodedPixels, header.width, header.height, channels);
  const dimensions = Buffer.alloc(8);
  dimensions.writeUInt32BE(header.width, 0);
  dimensions.writeUInt32BE(header.height, 4);
  return {
    bytes,
    mediaType: "image/png",
    pixelWidth: header.width,
    pixelHeight: header.height,
    pixelSha256: hashText(Buffer.concat([dimensions, canonicalPixels])),
  };
}

function decodePngPixels(inflated, header, channels) {
  const rowBytes = header.width * channels;
  const stride = rowBytes + 1;
  const decoded = Buffer.alloc(rowBytes * header.height);
  const paeth = (left, above, upperLeft) => {
    const estimate = left + above - upperLeft;
    const leftDistance = Math.abs(estimate - left);
    const aboveDistance = Math.abs(estimate - above);
    const upperLeftDistance = Math.abs(estimate - upperLeft);
    if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
    return aboveDistance <= upperLeftDistance ? above : upperLeft;
  };
  for (let row = 0; row < header.height; row += 1) {
    const filter = inflated[row * stride];
    const sourceOffset = row * stride + 1;
    const targetOffset = row * rowBytes;
    for (let column = 0; column < rowBytes; column += 1) {
      const raw = inflated[sourceOffset + column];
      const left = column >= channels ? decoded[targetOffset + column - channels] : 0;
      const above = row > 0 ? decoded[targetOffset - rowBytes + column] : 0;
      const upperLeft = row > 0 && column >= channels ? decoded[targetOffset - rowBytes + column - channels] : 0;
      const predictor = filter === 0 ? 0
        : filter === 1 ? left
          : filter === 2 ? above
            : filter === 3 ? Math.floor((left + above) / 2)
              : paeth(left, above, upperLeft);
      decoded[targetOffset + column] = (raw + predictor) & 0xff;
    }
  }
  return decoded;
}

function canonicalRgbaPixels(decoded, width, height, channels) {
  const canonical = Buffer.alloc(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const source = pixel * channels;
    const target = pixel * 4;
    const alpha = channels === 4 ? decoded[source + 3] : 255;
    canonical[target] = alpha === 0 ? 0 : decoded[source];
    canonical[target + 1] = alpha === 0 ? 0 : decoded[source + 1];
    canonical[target + 2] = alpha === 0 ? 0 : decoded[source + 2];
    canonical[target + 3] = alpha;
  }
  return canonical;
}

function pngCrc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function normalizeProofViewport(value, field) {
  if (typeof value === "string") {
    const match = value.match(/^(\d+)x(\d+)$/);
    if (match && Number(match[1]) > 0 && Number(match[2]) > 0) return `${Number(match[1])}x${Number(match[2])}`;
  }
  if (value && Number.isInteger(value.width) && Number.isInteger(value.height) && value.width > 0 && value.height > 0) {
    return `${value.width}x${value.height}`;
  }
  throw new Error(`${field} must be WIDTHxHEIGHT or {width,height}`);
}

function runStaticReview(targetReview) {
  const staticPath = path.join(outDir, "static-findings.json");
  const args = [detectorPath, "--json", "--out", staticPath, path.resolve(options.path)];
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: "utf8",
  });
  if (fs.existsSync(staticPath)) recordOwnedOutput(staticPath);
  if (result.status !== 0) {
    addBlocker(targetReview, "static-detector", compactProcessError(result, `detector exited ${result.status}`), result.status === 2);
    return;
  }
  try {
    targetReview.static = JSON.parse(fs.readFileSync(staticPath, "utf8"));
  } catch (error) {
    addBlocker(targetReview, "static-detector", `Detector output could not be read: ${error.message}`);
    return;
  }
  if (!Number.isFinite(targetReview.static.files) || targetReview.static.files <= 0) {
    addBlocker(targetReview, "static-detector", "Static target contains zero supported UI source files.", true);
    targetReview.static = null;
    return;
  }
  targetReview.ledger.evidence.push({
    type: "static-detector",
    path: displayPath(staticPath),
    findings: targetReview.static.findings.length,
    files: targetReview.static.files,
  });
  targetReview.metadata.reproducibility.staticEvidenceSha256 = hashFile(staticPath);
}

async function runRuntimeReview(targetReview) {
  const playwright = loadPlaywright();
  if (!playwright) {
    const tempPackage = path.join(os.tmpdir(), "improve-ui-playwright", "node_modules", "playwright");
    addBlocker(targetReview, "runtime-visual", `Playwright not found. Install it in the target project, set PLAYWRIGHT_PATH, or place the package at ${tempPackage}.`);
    return null;
  }
  fs.mkdirSync(screenshotsDir, { recursive: true });

  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true });
    targetReview.metadata.runtime = {
      adapter: "playwright",
      browser: "chromium",
      version: typeof browser.version === "function" ? browser.version() : "unknown",
    };
  } catch (error) {
    addBlocker(targetReview, "runtime-launch", `Browser launch failed: ${error.message}`);
    return null;
  }
  const results = [];
  try {
    for (const actionGroup of options.actionGroups) {
      for (const viewport of options.viewports) {
        try {
          results.push(await inspectViewport(browser, viewport, actionGroup));
        } catch (error) {
          results.push(runtimeFailureResult(viewport, actionGroup.name, "context", error));
        }
      }
    }
  } finally {
    await browser.close().catch((error) => addBlocker(targetReview, "runtime-close", `Browser close failed: ${error.message}`));
  }

  const runtimePath = path.join(outDir, "runtime-findings.json");
  const runtime = {
    url: options.url,
    waitUntil: options.waitUntil,
    settleMs: options.settleMs,
    actionGroups: options.actionGroups.map((group) => ({
      name: group.name,
      source: group.source ? displayPath(group.source) : null,
      sourceSha256: group.sourceSha256 || null,
      actions: group.actions.map((action) => sanitizeAction(action)),
      assertions: group.assertions.map((assertion) => sanitizeAssertion(assertion)),
    })),
    results,
  };
  fs.writeFileSync(runtimePath, `${JSON.stringify(runtime, null, 2)}\n`);
  recordOwnedOutput(runtimePath);
  targetReview.metadata.reproducibility.runtimeEvidenceSha256 = hashFile(runtimePath);
  targetReview.ledger.evidence.push({
    type: "runtime-visual",
    path: displayPath(runtimePath),
    artifacts: results.flatMap((result) => Object.values(result.artifacts || {}).map((artifact) => artifact.path)),
  });
  const failures = results.filter((result) => !result.ok);
  if (failures.length) {
    const phases = [...new Set(failures.map((result) => result.phase || "runtime"))].join(", ");
    addBlocker(targetReview, "runtime-visual", `${failures.length} required runtime result(s) failed during ${phases}.`);
  }
  return runtime;
}

async function inspectViewport(browser, viewport, actionGroup) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: options.deviceScaleFactor });
  const consoleErrors = [];
  const requestFailures = [];
  const badResponses = [];
  let transferredBytes = 0;

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    const url = request.url();
    const failureText = request.failure()?.errorText ?? "";
    if (!/favicon\.ico$/.test(url)) requestFailures.push(`${url} ${failureText}`.trim());
  });
  page.on("response", async (response) => {
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
    const length = Number(response.headers()["content-length"]);
    if (Number.isFinite(length)) transferredBytes += length;
  });

  await page.addInitScript(() => {
    window.__uiAudit = { longTasks: [], layoutShifts: [], frames: [] };
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__uiAudit.longTasks.push({ duration: entry.duration, name: entry.name, startTime: entry.startTime });
        }
      }).observe({ type: "longtask", buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__uiAudit.layoutShifts.push({
            value: entry.value,
            hadRecentInput: entry.hadRecentInput,
            startTime: entry.startTime,
          });
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {}
    let last = performance.now();
    const tick = (now) => {
      window.__uiAudit.frames.push(now - last);
      last = now;
      if (window.__uiAudit.frames.length < 240) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  let phase = "navigation";
  try {
    const navigationResponse = await page.goto(options.url, { waitUntil: options.waitUntil, timeout: options.timeout });
    const navigationStatus = typeof navigationResponse?.status === "function" ? navigationResponse.status() : null;
    if (Number.isInteger(navigationStatus) && navigationStatus >= 400) {
      const error = new Error(`Main document responded with HTTP ${navigationStatus}: ${navigationResponse.url?.() || options.url}`);
      error.code = "MAIN_DOCUMENT_HTTP_ERROR";
      throw error;
    }
    await page.waitForTimeout(options.settleMs);
    phase = "action";
    for (const action of actionGroup.actions) await applyAction(page, action);
    phase = "settle";
    await page.waitForTimeout(options.settleMs);
    phase = "assertion";
    for (const assertion of actionGroup.assertions) await applyAssertion(page, assertion);

    phase = "artifact";
    const suffix = `${safeFilePart(actionGroup.name)}-${viewport.width}x${viewport.height}`;
    const viewportScreenshotPath = path.join(screenshotsDir, `${suffix}-viewport.png`);
    const fullPageScreenshotPath = path.join(screenshotsDir, `${suffix}-full-page.png`);
    await page.screenshot({ path: viewportScreenshotPath, fullPage: false });
    recordOwnedOutput(viewportScreenshotPath);
    await page.screenshot({ path: fullPageScreenshotPath, fullPage: true });
    recordOwnedOutput(fullPageScreenshotPath);
    const artifacts = {
      viewport: describeRuntimeArtifact(viewportScreenshotPath, "viewport", actionGroup.name, viewport),
      fullPage: describeRuntimeArtifact(fullPageScreenshotPath, "full-page", actionGroup.name, viewport),
    };
    phase = "measurement";
    const buttonAccessibility = await inspectButtonAccessibility(page);
    const metrics = await page.evaluate(() => {
      const parseColor = (value) => {
        if (!value || value === "transparent") return null;
        const match = String(value).match(/rgba?\(([^)]+)\)/i);
        if (!match) return null;
        const parts = match[1].split(",").map((part) => Number(part.trim()));
        if (parts.length < 3 || parts.some((part, index) => index < 3 && !Number.isFinite(part))) return null;
        return {
          r: parts[0],
          g: parts[1],
          b: parts[2],
          a: Number.isFinite(parts[3]) ? parts[3] : 1,
        };
      };
      const blend = (fg, bg) => {
        const alpha = Math.max(0, Math.min(1, fg.a));
        return {
          r: fg.r * alpha + bg.r * (1 - alpha),
          g: fg.g * alpha + bg.g * (1 - alpha),
          b: fg.b * alpha + bg.b * (1 - alpha),
          a: 1,
        };
      };
      const channel = (value) => {
        const normalized = value / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      };
      const luminance = (color) => 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
      const contrast = (a, b) => {
        const la = luminance(a);
        const lb = luminance(b);
        const lighter = Math.max(la, lb);
        const darker = Math.min(la, lb);
        return (lighter + 0.05) / (darker + 0.05);
      };
      const visible = (node) => {
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return rect.width > 1 && rect.height > 1 && style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
      };
      const backgroundFor = (node) => {
        let current = node;
        let color = { r: 255, g: 255, b: 255, a: 1 };
        while (current && current.nodeType === Node.ELEMENT_NODE) {
          const parsed = parseColor(getComputedStyle(current).backgroundColor);
          if (parsed && parsed.a > 0) color = parsed.a >= 1 ? parsed : blend(parsed, color);
          current = current.parentElement;
        }
        return color;
      };
      const directText = (node) => [...node.childNodes]
        .filter((child) => child.nodeType === Node.TEXT_NODE)
        .map((child) => child.textContent.trim())
        .filter(Boolean)
        .join(" ")
        .trim();
      const contrastIssues = [...document.querySelectorAll("body *")]
        .filter(visible)
        .map((node) => {
          const text = directText(node);
          if (!text) return null;
          const style = getComputedStyle(node);
          const color = parseColor(style.color);
          if (!color || color.a === 0) return null;
          const bg = backgroundFor(node);
          const ratio = contrast(blend(color, bg), bg);
          const fontSize = Number.parseFloat(style.fontSize || "0");
          const fontWeight = Number.parseInt(style.fontWeight || "400", 10);
          const threshold = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700) ? 3 : 4.5;
          if (ratio >= threshold) return null;
          return {
            tag: node.tagName.toLowerCase(),
            text: text.slice(0, 100),
            ratio: Number(ratio.toFixed(2)),
            threshold,
            color: style.color,
            background: getComputedStyle(node).backgroundColor,
          };
        })
        .filter(Boolean)
        .slice(0, 12);
      const interactive = [...document.querySelectorAll("button, a, input, select, textarea, [role='button'], [tabindex]:not([tabindex='-1'])")].filter(visible);
      const smallHitAreas = interactive
        .map((node) => {
          const rect = node.getBoundingClientRect();
          const name = node.getAttribute("aria-label") || node.textContent?.trim() || node.getAttribute("title") || node.getAttribute("name") || node.id || node.tagName.toLowerCase();
          return { name: String(name).slice(0, 80), width: Math.round(rect.width), height: Math.round(rect.height) };
        })
        .filter((item) => item.width < 24 || item.height < 24)
        .slice(0, 12);
      const clippedText = [...document.querySelectorAll("body *")]
        .filter(visible)
        .filter((node) => {
          const style = getComputedStyle(node);
          if (style.overflowX === "visible" && style.textOverflow !== "ellipsis") return false;
          return node.scrollWidth > node.clientWidth + 1 && node.textContent?.trim();
        })
        .slice(0, 12)
        .map((node) => ({
          tag: node.tagName.toLowerCase(),
          text: node.textContent.trim().slice(0, 100),
          scrollWidth: node.scrollWidth,
          clientWidth: node.clientWidth,
        }));
      const imageIssues = [...document.images]
        .filter(visible)
        .map((img) => {
          const rect = img.getBoundingClientRect();
          return {
            src: img.currentSrc || img.src,
            alt: img.getAttribute("alt"),
            widthAttr: img.getAttribute("width"),
            heightAttr: img.getAttribute("height"),
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            renderedWidth: Math.round(rect.width),
            renderedHeight: Math.round(rect.height),
            loading: img.getAttribute("loading"),
          };
        })
        .filter((img) => !img.widthAttr || !img.heightAttr || img.alt === null || img.naturalWidth === 0)
        .slice(0, 12);
      const labelFor = (node) => {
        const id = node.id ? `#${node.id}` : "";
        const classes = typeof node.className === "string" ? node.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((name) => `.${name}`).join("") : "";
        return `${node.tagName.toLowerCase()}${id}${classes}`.slice(0, 120);
      };
      const styleRules = [];
      const collectRules = (rules) => {
        for (const rule of rules || []) {
          if (rule.cssRules) collectRules(rule.cssRules);
          else if (rule.selectorText && rule.style) styleRules.push(rule);
        }
      };
      for (const sheet of document.styleSheets) {
        try { collectRules(sheet.cssRules); } catch {}
      }
      const matchesScrollbarRule = (node) => styleRules.some((rule) => String(rule.selectorText).split(",").some((selector) => {
        const base = selector.split("::")[0].trim();
        const mentionsScrollbar = /::-(?:webkit-)?scrollbar/i.test(selector) || rule.style.getPropertyValue("scrollbar-width") || rule.style.getPropertyValue("scrollbar-color");
        if (!mentionsScrollbar) return false;
        try { return !base || base === "*" || node.matches(base); } catch { return false; }
      }));
      const scrollCandidates = [...new Set([document.scrollingElement, ...document.querySelectorAll("body *")].filter(Boolean))];
      const nativeScrollbarRisks = scrollCandidates
        .filter((node) => {
          const style = getComputedStyle(node);
          const rootScrollable = node === document.scrollingElement && (document.documentElement.scrollHeight > window.innerHeight + 1 || document.documentElement.scrollWidth > window.innerWidth + 1);
          const y = node.scrollHeight > node.clientHeight + 1 && ["auto", "scroll"].includes(style.overflowY);
          const x = node.scrollWidth > node.clientWidth + 1 && ["auto", "scroll"].includes(style.overflowX);
          return visible(node) && (rootScrollable || y || x);
        })
        .filter((node) => {
          const style = getComputedStyle(node);
          const standardCustom = (style.scrollbarWidth && style.scrollbarWidth !== "auto") || (style.scrollbarColor && style.scrollbarColor !== "auto");
          return !standardCustom && !matchesScrollbarRule(node);
        })
        .slice(0, 12)
        .map((node) => ({
          node: labelFor(node),
          scrollWidth: node.scrollWidth,
          clientWidth: node.clientWidth,
          scrollHeight: node.scrollHeight,
          clientHeight: node.clientHeight,
        }));
      const textRect = (node) => {
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        const rects = [];
        while (walker.nextNode()) {
          const textNode = walker.currentNode;
          if (!textNode.textContent.trim() || textNode.parentElement?.closest("svg")) continue;
          const range = document.createRange();
          range.selectNodeContents(textNode);
          for (const rect of range.getClientRects()) if (rect.width > 0 && rect.height > 0) rects.push(rect);
        }
        if (!rects.length) return null;
        return {
          top: Math.min(...rects.map((rect) => rect.top)),
          bottom: Math.max(...rects.map((rect) => rect.bottom)),
        };
      };
      const iconAlignmentIssues = [...document.querySelectorAll("button, a, [role='button'], [role='menuitem']")]
        .filter(visible)
        .map((control) => {
          const icon = control.querySelector("svg, [data-icon], img.icon");
          const text = textRect(control);
          if (!icon || !text || !visible(icon)) return null;
          const iconBox = icon.getBoundingClientRect();
          if (iconBox.width > 64 || iconBox.height > 64) return null;
          const delta = Math.abs((iconBox.top + iconBox.bottom) / 2 - (text.top + text.bottom) / 2);
          return delta > 4 ? { control: labelFor(control), deltaY: Number(delta.toFixed(2)), iconSize: `${Math.round(iconBox.width)}x${Math.round(iconBox.height)}` } : null;
        })
        .filter(Boolean)
        .slice(0, 12);
      const repeatedSpacingIssues = [...document.querySelectorAll("ul, ol, [role='list'], [data-ui-list]")]
        .filter(visible)
        .map((container) => {
          const items = [...container.children].filter(visible);
          if (items.length < 3) return null;
          const boxes = items.map((item) => item.getBoundingClientRect()).sort((a, b) => a.top - b.top);
          if (boxes.some((box, index) => index > 0 && box.top < boxes[index - 1].bottom - 1)) return null;
          const gaps = boxes.slice(1).map((box, index) => Number((box.top - boxes[index].bottom).toFixed(2)));
          const spread = Math.max(...gaps) - Math.min(...gaps);
          return spread > 3 ? { container: labelFor(container), gaps, spread: Number(spread.toFixed(2)) } : null;
        })
        .filter(Boolean)
        .slice(0, 12);
      const gradientSurfaces = [...document.querySelectorAll("body *")]
        .filter(visible)
        .filter((node) => {
          const style = getComputedStyle(node);
          return /gradient\(/i.test(style.backgroundImage) || style.backgroundClip === "text" || style.webkitBackgroundClip === "text";
        })
        .slice(0, 20)
        .map((node) => labelFor(node));
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const isInViewport = (node) => {
        if (!node || typeof node.getBoundingClientRect !== "function") return true;
        const rect = node.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < viewportHeight && rect.right > 0 && rect.left < viewportWidth;
      };
      const animations = document.getAnimations ? document.getAnimations().map((animation) => {
        const target = animation.effect && animation.effect.target ? animation.effect.target : null;
        const rect = target && target.getBoundingClientRect ? target.getBoundingClientRect() : null;
        return {
          name: animation.animationName || "",
          playState: animation.playState,
          visible: target ? isInViewport(target) : true,
          tag: target && target.tagName ? target.tagName.toLowerCase() : "",
          classes: target && target.className ? String(target.className).slice(0, 140) : "",
          top: rect ? Math.round(rect.top) : null,
          bottom: rect ? Math.round(rect.bottom) : null,
        };
      }) : [];
      const runningAnimations = animations.filter((animation) => animation.playState === "running");
      const offscreenRunningAnimations = runningAnimations.filter((animation) => !animation.visible);
      const canvasDetails = [...document.querySelectorAll("canvas")].map((canvas) => {
        const rect = canvas.getBoundingClientRect();
        return {
          classes: String(canvas.className || "").slice(0, 140),
          width: canvas.width || 0,
          height: canvas.height || 0,
          renderedWidth: Math.round(rect.width),
          renderedHeight: Math.round(rect.height),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          visible: isInViewport(canvas),
          animationActive: canvas.dataset.animationActive || canvas.dataset.active || canvas.dataset.running || "",
        };
      });
      const frames = window.__uiAudit?.frames || [];
      const sorted = [...frames].sort((a, b) => a - b);
      const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 0;
      const max = sorted.length ? sorted[sorted.length - 1] : 0;
      const layoutShifts = (window.__uiAudit?.layoutShifts || []).filter((entry) => !entry.hadRecentInput);
      const cls = layoutShifts.reduce((sum, entry) => sum + entry.value, 0);
      return {
        title: document.title,
        width: window.innerWidth,
        height: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        smallHitAreas,
        clippedText,
        imageIssues,
        contrastIssues,
        nativeScrollbarRisks,
        iconAlignmentIssues,
        repeatedSpacingIssues,
        gradientSurfaces,
        animationAudit: {
          total: animations.length,
          running: runningAnimations.length,
          offscreenRunningCount: offscreenRunningAnimations.length,
          offscreenRunning: offscreenRunningAnimations.slice(0, 12),
        },
        canvasDetails: canvasDetails.slice(0, 20),
        longTasks: window.__uiAudit?.longTasks || [],
        layoutShifts,
        cls,
        frameStats: {
          samples: frames.length,
          p95: Number(p95.toFixed(2)),
          max: Number(max.toFixed(2)),
        },
      };
    });
    metrics.unnamedButtons = buttonAccessibility.unnamedButtons;
    metrics.unnamedButtonsExact = buttonAccessibility.exact;
    metrics.accessibleNameAuditSource = buttonAccessibility.source;

    return {
      viewport,
      state: actionGroup.name,
      phase: "complete",
      artifacts,
      ok: true,
      transferredBytes,
      consoleErrors,
      requestFailures,
      badResponses,
      metrics,
      findings: runtimeFindings(viewport, actionGroup.name, metrics, consoleErrors, requestFailures, badResponses),
    };
  } catch (error) {
    const suffix = `${safeFilePart(actionGroup.name)}-${viewport.width}x${viewport.height}-error`;
    const screenshotPath = path.join(screenshotsDir, `${suffix}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
    if (fs.existsSync(screenshotPath)) recordOwnedOutput(screenshotPath);
    let errorArtifacts = {};
    if (fs.existsSync(screenshotPath)) {
      try {
        errorArtifacts = { error: describeRuntimeArtifact(screenshotPath, "error", actionGroup.name, viewport) };
      } catch {}
    }
    return {
      viewport,
      state: actionGroup.name,
      phase,
      artifacts: errorArtifacts,
      ok: false,
      transferredBytes,
      consoleErrors,
      requestFailures,
      badResponses,
      metrics: null,
      findings: [
        {
          id: error.code === "MAIN_DOCUMENT_HTTP_ERROR" ? "main-document-http-error" : "runtime-audit-error",
          category: "runtime",
          severity: "P1",
          classification: "objective",
          confidence: "high",
          message: error.code === "MAIN_DOCUMENT_HTTP_ERROR"
            ? error.message
            : `Runtime audit failed during ${phase}: ${error.message}`,
          file: `${options.url} @ ${viewport.width}x${viewport.height} ${actionGroup.name}`,
          line: 0,
          snippet: error.message,
        },
      ],
    };
  } finally {
    await page.close();
  }
}

async function inspectButtonAccessibility(page) {
  const context = typeof page.context === "function" ? page.context() : null;
  if (!context || typeof context.newCDPSession !== "function") {
    return { exact: false, unnamedButtons: 0, source: "unavailable" };
  }

  let session;
  try {
    session = await context.newCDPSession(page);
    const tree = await session.send("Accessibility.getFullAXTree");
    const unnamedButtons = (tree.nodes || []).filter((node) => (
      !node.ignored
      && node.role?.value === "button"
      && !String(node.name?.value || "").trim()
    )).length;
    return { exact: true, unnamedButtons, source: "chromium-accessibility-tree" };
  } catch {
    return { exact: false, unnamedButtons: 0, source: "unavailable" };
  } finally {
    if (session && typeof session.detach === "function") await session.detach().catch(() => {});
  }
}

function runtimeFailureResult(viewport, state, phase, error) {
  return {
    viewport,
    state,
    phase,
    artifacts: {},
    ok: false,
    transferredBytes: 0,
    consoleErrors: [],
    requestFailures: [],
    badResponses: [],
    metrics: null,
    findings: [
      {
        id: "runtime-audit-error",
        category: "runtime",
        severity: "P1",
        classification: "objective",
        confidence: "high",
        message: `Runtime audit failed during ${phase}: ${error.message}`,
        file: `${options.url} @ ${viewport.width}x${viewport.height} ${state}`,
        line: 0,
        snippet: error.message,
      },
    ],
  };
}

function describeRuntimeArtifact(file, kind, state, viewport) {
  const image = inspectPng(file, `runtime ${kind} artifact`);
  if (["viewport", "full-page"].includes(kind)) {
    validateProofPixelContract(image, `${viewport.width}x${viewport.height}`, kind, options.deviceScaleFactor, "runtime");
  }
  return {
    kind,
    path: displayPath(file),
    sha256: hashText(image.bytes),
    pixelSha256: image.pixelSha256,
    mediaType: image.mediaType,
    byteLength: image.bytes.length,
    pixelWidth: image.pixelWidth,
    pixelHeight: image.pixelHeight,
    deviceScaleFactor: options.deviceScaleFactor,
    state,
    viewport: `${viewport.width}x${viewport.height}`,
  };
}

function runtimeFindings(viewport, state, metrics, consoleErrors, requestFailures, badResponses) {
  const file = `${options.url} @ ${viewport.width}x${viewport.height} ${state}`;
  const findings = [];
  const push = (id, severity, category, message, snippet, classification = "advisory", confidence = "medium") => {
    findings.push({ id, severity, category, classification, confidence, message, file, line: 0, snippet: String(snippet).slice(0, 180) });
  };

  if (consoleErrors.length) push("console-errors", "P2", "runtime", "Console errors appeared; triage whether they affect the audited state.", consoleErrors[0], "advisory", "medium");
  if (requestFailures.length) push("request-failures", "P2", "runtime", "Network requests failed; triage expected, third-party, and user-visible failures.", requestFailures[0], "advisory", "medium");
  if (badResponses.length) push("bad-http-responses", "P2", "runtime", "HTTP error responses appeared; confirm whether they affect the audited state.", badResponses[0], "advisory", "medium");
  if (metrics.horizontalOverflow) push("horizontal-overflow", "P2", "resilience", "Viewport has horizontal overflow; confirm whether it is an intentional scroll region.", `scrollWidth ${metrics.scrollWidth} > innerWidth ${metrics.width}`, "advisory", "medium");
  if (metrics.contrastIssues.length) push("low-contrast-text-lead", "P2", "accessibility", "The simple color sampler found potential low contrast; verify with a standards-aware tool and rendered context.", JSON.stringify(metrics.contrastIssues[0]), "advisory", "low");
  if (metrics.unnamedButtonsExact && metrics.unnamedButtons) {
    push("unnamed-buttons", "P1", "accessibility", "Visible buttons without accessible names in Chromium's accessibility tree.", `${metrics.unnamedButtons} unnamed button(s)`, "objective", "high");
  }
  if (metrics.smallHitAreas.length) push("small-hit-area", "P2", "accessibility", "Visible controls are below the 24px WCAG size lead; verify spacing exceptions and product touch requirements (44px is enhanced/preference, not this gate).", JSON.stringify(metrics.smallHitAreas[0]), "advisory", "medium");
  if (metrics.clippedText.length) push("clipped-text", "P2", "resilience", "Text may be clipped or horizontally overflowing; inspect whether truncation is intentional and recoverable.", JSON.stringify(metrics.clippedText[0]), "advisory", "medium");
  if (metrics.nativeScrollbarRisks?.length) push("native-scrollbar-runtime", "P2", "quality", "A rendered scroll region still relies on an uncustomized native scrollbar; style it minimally without hiding or breaking the affordance.", JSON.stringify(metrics.nativeScrollbarRisks[0]), "advisory", "medium");
  if (metrics.iconAlignmentIssues?.length) push("icon-text-misalignment", "P2", "quality", "A rendered control icon is vertically misaligned with its text; confirm the detail crop and repair the shared control/icon primitive.", JSON.stringify(metrics.iconAlignmentIssues[0]), "advisory", "medium");
  if (metrics.repeatedSpacingIssues?.length) push("inconsistent-repeated-spacing", "P2", "quality", "A repeated rendered list has materially inconsistent sibling gaps; confirm intentional grouping or repair the spacing source.", JSON.stringify(metrics.repeatedSpacingIssues[0]), "advisory", "medium");
  if (metrics.gradientSurfaces?.length) push("gradient-finish-review", "P3", "quality", "Rendered gradients are present. Inspect their role, stops, contrast, banding, clipping, and fallback; their presence alone is not a failure.", JSON.stringify(metrics.gradientSurfaces.slice(0, 3)), "advisory", "low");
  const missingAlt = metrics.imageIssues.find((image) => image.alt === null);
  const brokenImage = metrics.imageIssues.find((image) => image.naturalWidth === 0);
  const missingDimensions = metrics.imageIssues.find((image) => !image.widthAttr || !image.heightAttr);
  if (missingAlt) push("runtime-missing-img-alt", "P1", "accessibility", "A visible image is missing the alt attribute; use meaningful text or alt=\"\" for decoration.", JSON.stringify(missingAlt), "objective", "high");
  if (brokenImage) push("runtime-broken-image", "P1", "runtime", "A visible image did not decode to a natural size.", JSON.stringify(brokenImage), "objective", "high");
  if (missingDimensions) push("runtime-missing-img-dimensions", "P2", "performance", "A visible image lacks intrinsic width/height attributes; verify that layout space is reserved by an equivalent mechanism.", JSON.stringify(missingDimensions), "advisory", "medium");
  if (metrics.animationAudit?.offscreenRunningCount) push("offscreen-running-animation", "P2", "performance", "Animations are running outside the viewport; pause offscreen decorative motion.", JSON.stringify(metrics.animationAudit.offscreenRunning[0]));
  const activeOffscreenCanvas = (metrics.canvasDetails || []).find((canvas) => !canvas.visible && /^(true|1|running|active)$/i.test(String(canvas.animationActive || "")));
  if (activeOffscreenCanvas) push("offscreen-active-canvas", "P2", "performance", "Canvas/WebGL region is marked active outside the viewport; pause or lower work offscreen.", JSON.stringify(activeOffscreenCanvas));
  if (metrics.longTasks.length) push("long-task-diagnostic", "P2", "performance", "Long tasks occurred in this lab sample; measure the named interaction against an explicit budget.", `${metrics.longTasks.length} long task(s)`, "advisory", "medium");
  if (metrics.frameStats.p95 > 20) push("frame-p95-budget", "P2", "performance", "Frame p95 exceeds the generic 20ms diagnostic threshold; compare with a declared interaction budget.", `${metrics.frameStats.p95}ms`, "advisory", "medium");
  if (metrics.frameStats.max > 50) push("frame-max-budget", "P2", "performance", "Frame max exceeds the generic 50ms diagnostic threshold; compare with a declared interaction budget.", `${metrics.frameStats.max}ms`, "advisory", "medium");
  if (metrics.cls > 0) push("layout-shift-diagnostic", "P2", "performance", "Layout shift was sampled; calculate session-window CLS and compare with an explicit budget before gating.", `sampled shift ${metrics.cls.toFixed(4)}`, "advisory", "medium");

  return findings;
}

async function applyAction(page, action) {
  const timeout = action.timeout ?? 5000;
  if (action.type === "click") await page.click(action.selector, { timeout });
  else if (action.type === "hover") await page.hover(action.selector, { timeout });
  else if (action.type === "type") await page.fill(action.selector, action.value, { timeout });
  else if (action.type === "press") await page.press(action.selector ?? "body", action.key, { timeout });
  else if (action.type === "scroll") await page.mouse.wheel(action.x ?? 0, action.y ?? 600);
  else if (action.type === "wait") await page.waitForTimeout(action.ms ?? 250);
  else throw new Error(`Unsupported action type: ${action.type}`);
}

async function applyAssertion(page, assertion) {
  const timeout = assertion.timeout ?? 5000;
  if (assertion.type === "visible") {
    await page.locator(assertion.selector).waitFor({ state: "visible", timeout });
    return;
  }
  if (assertion.type === "hidden") {
    await page.locator(assertion.selector).waitFor({ state: "hidden", timeout });
    return;
  }
  if (assertion.type === "text") {
    const actual = String(await page.locator(assertion.selector).textContent({ timeout }) || "");
    assertValue(actual, assertion, "text");
    return;
  }
  if (assertion.type === "url") {
    assertValue(page.url(), assertion, "url");
    return;
  }
  if (assertion.type === "attribute") {
    if (!assertion.name) throw new Error("attribute assertion requires name");
    const actual = String(await page.locator(assertion.selector).getAttribute(assertion.name, { timeout }) ?? "");
    assertValue(actual, assertion, `attribute ${assertion.name}`);
    return;
  }
  if (assertion.type === "focused") {
    const focused = await page.evaluate((selector) => document.activeElement?.matches(selector) === true, assertion.selector);
    if (!focused) throw new Error(`Expected ${assertion.selector} to be focused`);
    return;
  }
  if (assertion.type === "count") {
    const actual = await page.locator(assertion.selector).count();
    if (!Number.isInteger(assertion.equals) || actual !== assertion.equals) {
      throw new Error(`Expected count ${assertion.equals}, got ${actual}`);
    }
    return;
  }
  throw new Error(`Unsupported assertion type: ${assertion.type}`);
}

function assertValue(actual, assertion, label) {
  if (Object.hasOwn(assertion, "equals") && actual !== String(assertion.equals)) {
    throw new Error(`Expected ${label} to equal ${JSON.stringify(String(assertion.equals))}, got ${JSON.stringify(actual)}`);
  }
  if (Object.hasOwn(assertion, "contains") && !actual.includes(String(assertion.contains))) {
    throw new Error(`Expected ${label} to contain ${JSON.stringify(String(assertion.contains))}, got ${JSON.stringify(actual)}`);
  }
  if (Object.hasOwn(assertion, "matches")) {
    const expression = new RegExp(String(assertion.matches), assertion.flags || "");
    if (!expression.test(actual)) throw new Error(`Expected ${label} to match ${expression}, got ${JSON.stringify(actual)}`);
  }
  if (!["equals", "contains", "matches"].some((key) => Object.hasOwn(assertion, key))) {
    throw new Error(`${label} assertion requires equals, contains, or matches`);
  }
}

function refreshReviewDerivedState(targetReview) {
  targetReview.findings = collectFindings(targetReview);
  targetReview.evidenceCoverage = evaluateEvidenceCoverage(targetReview);
  targetReview.gates = evaluateGates(targetReview);
  targetReview.assessment = assessReview(targetReview);
  targetReview.expectations = evaluateExpectations(targetReview);
}

function collectFindings(targetReview) {
  const findings = [];
  if (targetReview.static?.findings) findings.push(...targetReview.static.findings);
  for (const result of targetReview.runtime?.results || []) findings.push(...(result.findings || []));
  return findings.sort(
    (a, b) =>
      severityRank[a.severity] - severityRank[b.severity] ||
      String(a.file).localeCompare(String(b.file)) ||
      String(a.id).localeCompare(String(b.id)),
  );
}

function evaluateEvidenceCoverage(targetReview) {
  const staticCoverage = options.path
    ? targetReview.static
      ? { status: "captured", required: true, files: targetReview.static.files, artifact: evidencePath(targetReview, "static-detector") }
      : { status: "blocked", required: true, files: 0, artifact: null }
    : { status: "not-requested", required: false, files: 0, artifact: null };

  const runtimeRequested = Boolean(options.url || options.requireRuntime);
  const expectedResults = options.url ? options.actionGroups.length * options.viewports.length : 0;
  const runtimeResults = targetReview.runtime?.results || [];
  const validResults = runtimeResults.filter(runtimeResultHasRequiredEvidence);
  const runtimeCaptured = runtimeRequested && expectedResults > 0 && runtimeResults.length === expectedResults && validResults.length === expectedResults;
  const runtimeCoverage = runtimeRequested
    ? {
        status: runtimeCaptured ? "captured" : "blocked",
        required: true,
        expectedResults,
        passedResults: validResults.length,
        failedResults: Math.max(expectedResults - validResults.length, runtimeResults.filter((result) => !result.ok).length),
        artifact: evidencePath(targetReview, "runtime-visual"),
        results: runtimeResults.map((result) => {
          const group = options.actionGroups.find((candidate) => candidate.name === result.state);
          return {
            state: result.state,
            viewport: `${result.viewport.width}x${result.viewport.height}`,
            status: runtimeResultHasRequiredEvidence(result) ? "captured" : "blocked",
            phase: result.phase,
            actionCount: group?.actions.length || 0,
            assertionCount: group?.assertions.length || 0,
            artifacts: Object.values(result.artifacts || {}).map((artifact) => ({
              kind: artifact.kind,
              path: artifact.path,
              sha256: artifact.sha256,
              mediaType: artifact.mediaType,
              byteLength: artifact.byteLength,
              pixelWidth: artifact.pixelWidth,
              pixelHeight: artifact.pixelHeight,
              deviceScaleFactor: artifact.deviceScaleFactor,
            })),
          };
        }),
      }
    : { status: "not-requested", required: false, expectedResults: 0, passedResults: 0, failedResults: 0, artifact: null, results: [] };

  const proofRequested = Boolean(options.proofManifest || options.requireChangeProof);
  const proofCoverage = proofRequested
    ? {
        status: targetReview.proof ? "captured" : "blocked",
        required: true,
        manifest: targetReview.proof?.manifest || null,
        state: targetReview.proof?.before.state || null,
        viewport: targetReview.proof?.before.viewport || null,
        kind: targetReview.proof?.before.kind || null,
        deviceScaleFactor: targetReview.proof?.before.deviceScaleFactor || null,
      }
    : { status: "not-requested", required: false, manifest: null, state: null, viewport: null, kind: null, deviceScaleFactor: null };

  const asyncCoverage = evaluateAsyncStateCoverage(targetReview);
  return {
    static: staticCoverage,
    runtime: runtimeCoverage,
    changeProof: proofCoverage,
    asyncStates: asyncCoverage,
  };
}

function evaluateAsyncStateCoverage(targetReview) {
  if (!options.asyncUi) return { status: "not-requested", required: false, expected: [], covered: [], missing: [], invalid: [] };
  const covered = [];
  const missing = [];
  const invalid = [];
  const signatureStates = new Map();
  for (const state of asyncStateNames) {
    const group = options.actionGroups.find((candidate) => candidate.name === state);
    if (!group) continue;
    const signature = hashText(stableStringify({
      actions: group.actions.map(sanitizeAction),
      assertions: group.assertions.map(sanitizeAssertion),
    }));
    const states = signatureStates.get(signature) || [];
    states.push(state);
    signatureStates.set(signature, states);
    group.stateEvidenceSignature = signature;
  }
  for (const state of asyncStateNames) {
    const group = options.actionGroups.find((candidate) => candidate.name === state);
    if (!group) {
      missing.push(state);
      continue;
    }
    const reasons = [];
    if (!group.actions.length) reasons.push("no action");
    if (!group.assertions.length) reasons.push("no assertion");
    const duplicateStates = signatureStates.get(group.stateEvidenceSignature) || [];
    if (duplicateStates.length > 1) reasons.push(`duplicate action/assertion signature with ${duplicateStates.filter((name) => name !== state).join(", ")}`);
    const results = (targetReview.runtime?.results || []).filter((result) => result.state === state);
    if (results.length !== options.viewports.length) reasons.push("runtime result missing");
    if (results.some((result) => !runtimeResultHasRequiredEvidence(result))) reasons.push("assertion or artifact failed");
    if (reasons.length) invalid.push({ state, reasons });
    else covered.push(state);
  }
  return {
    status: !missing.length && !invalid.length ? "captured" : "blocked",
    required: true,
    expected: asyncStateNames,
    covered,
    missing,
    invalid,
  };
}

function runtimeResultHasRequiredEvidence(result) {
  if (!result?.ok) return false;
  const group = options.actionGroups.find((candidate) => candidate.name === result.state);
  if (options.strict && !group?.assertions.length) return false;
  const viewport = result.artifacts?.viewport;
  const fullPage = result.artifacts?.fullPage;
  return runtimeArtifactValid(viewport, "viewport", result) && runtimeArtifactValid(fullPage, "full-page", result);
}

function runtimeArtifactValid(artifact, kind, result) {
  if (!artifact || artifact.kind !== kind || artifact.state !== result.state) return false;
  if (artifact.viewport !== `${result.viewport.width}x${result.viewport.height}`) return false;
  if (artifact.deviceScaleFactor !== options.deviceScaleFactor) return false;
  const artifactPath = resolveEvidencePath(artifact.path);
  if (!fs.existsSync(artifactPath)) return false;
  try {
    const image = inspectPng(artifactPath, `runtime ${kind} artifact`);
    validateProofPixelContract(image, artifact.viewport, kind, artifact.deviceScaleFactor, "runtime");
    return hashText(image.bytes) === artifact.sha256
      && image.pixelSha256 === artifact.pixelSha256
      && image.mediaType === artifact.mediaType
      && image.bytes.length === artifact.byteLength
      && image.pixelWidth === artifact.pixelWidth
      && image.pixelHeight === artifact.pixelHeight;
  } catch {
    return false;
  }
}

function assessReview(targetReview) {
  const dimensions = Object.fromEntries(dimensionNames.map((name) => [name, { status: "unknown", score: null, evidence: [] }]));
  for (const finding of targetReview.findings) {
    const dimensionName = dimensionForFinding(finding);
    if (!dimensionName) continue;
    const dimension = dimensions[dimensionName];
    const evidence = `finding:${finding.id}`;
    if (!dimension.evidence.includes(evidence)) dimension.evidence.push(evidence);
  }

  const unknownDimensions = [...dimensionNames];
  const blockedEvidence = Object.entries(targetReview.evidenceCoverage)
    .filter(([, coverage]) => coverage.status === "blocked")
    .map(([name]) => name);
  const verdict = targetReview.ledger.blockers.length || blockedEvidence.length
    ? "blocked"
    : "incomplete";
  return {
    dimensions,
    total: null,
    maximum: null,
    verdict,
    unknownDimensions,
    blockedEvidence,
    note: "Automated findings and coverage do not assign quality scores; apply the evidence rubric manually for an observed score.",
  };
}

function dimensionForFinding(finding) {
  if (finding.category === "accessibility") return "accessibility";
  if (["performance", "runtime", "motion"].includes(finding.category)) return "performance";
  if (["design-system", "quality"].includes(finding.category)) return "themingDesignSystem";
  if (finding.category === "resilience") return "responsiveContent";
  if (["visual-trust", "visual-fit"].includes(finding.category)) return "visualTrustFit";
  return null;
}

function evaluateGates(targetReview) {
  const findings = gateableFindings(targetReview.findings);
  const p0P1 = findings.filter((finding) => severityRank[finding.severity] <= severityRank.P1);
  const systemicP2 = systemicP2Findings(findings);
  const gateLabel = options.includeAdvisory ? "selected objective/advisory" : "objective";
  const gates = [
    {
      gate: "p0-p1-unresolved",
      status: p0P1.length ? "fail" : "pass",
      detail: p0P1.length ? `${p0P1.length} ${gateLabel} P0/P1 finding(s)` : `no ${gateLabel} P0/P1 findings`,
    },
    {
      gate: "systemic-p2-unresolved",
      status: systemicP2.length ? "fail" : "pass",
      detail: systemicP2.length ? `${systemicP2.length} P2 finding(s) match ${options.p2Policy} policy` : `no P2 findings match ${options.p2Policy} policy`,
    },
    coverageGate("static-detector", targetReview.evidenceCoverage.static),
    coverageGate("runtime-visual", targetReview.evidenceCoverage.runtime),
    coverageGate("change-proof", targetReview.evidenceCoverage.changeProof),
    coverageGate("async-state-coverage", targetReview.evidenceCoverage.asyncStates),
  ];
  return gates;
}

function coverageGate(name, coverage) {
  const status = coverage.status === "captured" ? "pass" : coverage.status === "blocked" ? "fail" : "skip";
  return { gate: name, status, detail: coverage.status };
}

function gateableFindings(findings) {
  return findings.filter((finding) => options.includeAdvisory || (finding.classification || "objective") === "objective");
}

function systemicP2Findings(findings) {
  const p2 = findings.filter((finding) => finding.severity === "P2");
  if (options.p2Policy === "none") return [];
  if (options.p2Policy === "all") return p2;
  const counts = new Map();
  for (const finding of p2) counts.set(finding.id, (counts.get(finding.id) || 0) + 1);
  return p2.filter((finding) => finding.systemic === true || finding.scope === "systemic" || counts.get(finding.id) >= options.systemicP2Count);
}

function strictFailed(targetReview) {
  return targetReview.ledger.blockers.length > 0 || targetReview.gates.some((gate) => gate.status === "fail");
}

function evaluateExpectations(targetReview) {
  const gates = [];
  for (const expectedId of options.expectFindings) {
    const matched = targetReview.findings.some((finding) => finding.id === expectedId);
    gates.push({
      gate: "expect-finding",
      status: matched ? "pass" : "fail",
      detail: matched ? `${expectedId} present` : `${expectedId} missing`,
    });
  }
  if (options.expectVerdict) {
    gates.push({
      gate: "expect-verdict",
      status: targetReview.assessment.verdict === options.expectVerdict ? "pass" : "fail",
      detail: `expected ${options.expectVerdict}, got ${targetReview.assessment.verdict}`,
    });
  }
  return gates;
}

function renderMarkdown(targetReview, jsonPath) {
  const screenshotPaths = (targetReview.runtime?.results || []).flatMap((result) => Object.values(result.artifacts || {}).map((artifact) => artifact.path));
  const forensicReference = displayPath(path.join(scriptDir, "..", "forensic-roast.md"));
  const dimensionSummary = dimensionNames.map((name) => {
    const dimension = targetReview.assessment.dimensions[name];
    return `${name}=${dimension.status === "unknown" ? "unknown" : `${dimension.score}/4`}`;
  }).join(", ");
  const lines = [
    "# Interface Review",
    "",
    `Generated: ${targetReview.reviewedAt}`,
    `Target path: ${targetReview.target.path || "n/a"}`,
    `Target URL: ${targetReview.target.url || "n/a"}`,
    `Review JSON: ${path.relative(root, jsonPath)}`,
    `Design dossier Markdown: ${path.relative(root, path.join(outDir, "report.md"))}`,
    `Design dossier HTML: ${path.relative(root, path.join(outDir, "report.html"))}`,
    "",
    `Assessment: ${dimensionSummary}`,
    `Total: ${targetReview.assessment.total === null ? "unknown" : `${targetReview.assessment.total}/20`}`,
    `Verdict: ${targetReview.assessment.verdict}`,
    "",
    "Ledger:",
    `- register: ${targetReview.ledger.context.register}`,
    `- surface: ${targetReview.ledger.context.surface}`,
    `- ambition: ${targetReview.ledger.changeAmbition}`,
    `- states: ${targetReview.ledger.context.states.join(", ")}`,
    `- wait: ${targetReview.ledger.context.waitUntil} + ${targetReview.ledger.context.settleMs}ms`,
    `- change proof: ${targetReview.ledger.context.proofManifest || "none"}`,
    `- evidence: ${targetReview.ledger.evidence.map((item) => item.path || item.type).join(", ") || "none"}`,
    `- blockers: ${targetReview.ledger.blockers.map((item) => `${item.gate}: ${item.reason}`).join("; ") || "none"}`,
    "",
    "Gates:",
    ...targetReview.gates.map((gate) => `- ${gate.gate}: ${gate.status} - ${gate.detail}`),
    "",
    "Expectations:",
    ...(targetReview.expectations.length ? targetReview.expectations.map((gate) => `- ${gate.status} - ${gate.detail}`) : ["- none"]),
    "",
    "Evidence coverage:",
    ...Object.entries(targetReview.evidenceCoverage).map(([name, coverage]) => `- ${name}: ${coverage.status}`),
    "",
    "Relentless improvement gate:",
    "- Treat this report as red until P1 and repeated/systemic P2 issues in scope are fixed, blocked, or explicitly deferred.",
    "- If the user asked to improve the interface and source files are editable, convert the top in-scope finding into a patch and rerun evidence before finalizing.",
    "- Do not use detector-only output as visual judgment; inspect the rendered state or name runtime proof as blocked.",
    "",
    "Forensic design pass:",
    "- This harness is an evidence pack, not the final design critique.",
    `- For design analysis, screenshot critique, UI audit, or roast, complete the bundled reference \`${forensicReference}\` before writing the final verdict.`,
    `- Cross-reference: screenshots=${screenshotPaths.length ? screenshotPaths.join(", ") : "none"}; source=${targetReview.target.path || "none"}; blockers=${targetReview.ledger.blockers.length ? "see ledger" : "none"}`,
    "- Required read: product intent, main user task, intended hierarchy, accidental priority, visual problem, source/code cause, concrete fix, first five cuts.",
    "",
    "Findings:",
  ];

  if (!targetReview.findings.length) {
    lines.push("- no findings");
  } else {
    for (const finding of targetReview.findings.slice(0, 40)) {
      const classification = finding.classification || "objective";
      const confidence = finding.confidence || "unknown";
      const category = finding.category || "uncategorized";
      lines.push(`- [${finding.severity}][${classification}/${confidence}][${category}] ${finding.id} ${finding.file}:${finding.line} - ${finding.message}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_PATH,
    process.env.PLAYWRIGHT_NODE_MODULES ? path.join(process.env.PLAYWRIGHT_NODE_MODULES, "playwright") : null,
    path.join(root, "node_modules", "playwright"),
    path.join(process.cwd(), "node_modules", "playwright"),
    path.join(os.tmpdir(), "improve-ui-playwright", "node_modules", "playwright"),
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    try {
      return require(candidate);
    } catch {}
  }
  return null;
}

function loadActionGroups(actionGroupArgs, actionsFile) {
  const groups = [];
  if (actionsFile) {
    groups.push(loadActionGroup("default", actionsFile));
  }
  for (const value of actionGroupArgs) {
    const { name, file } = parseNamedFile(value);
    groups.push(loadActionGroup(name, file));
  }
  if (!groups.length) groups.push({ name: "default", actions: [], assertions: [], source: null, sourceSha256: null });
  validateActionGroupNames(groups);
  return groups;
}

function loadActionGroup(name, file) {
  const source = path.resolve(file);
  const data = JSON.parse(fs.readFileSync(source, "utf8"));
  const sourceSha256 = hashFile(source);
  if (Array.isArray(data)) {
    return {
      name: validateActionGroupName(name, source),
      actions: data.map((action, index) => validateAction(action, index, source)),
      assertions: [],
      source,
      sourceSha256,
    };
  }
  if (!data || typeof data !== "object") throw new Error(`Action group ${file} must be an array or an object with actions[]`);
  if (Array.isArray(data.actions)) {
    if (data.assertions !== undefined && !Array.isArray(data.assertions)) throw new Error(`Action group ${file} assertions must be an array`);
    const effectiveName = data.name ?? name;
    return {
      name: validateActionGroupName(effectiveName, source),
      actions: data.actions.map((action, index) => validateAction(action, index, source)),
      assertions: (data.assertions || []).map((assertion, index) => validateAssertion(assertion, index, source)),
      source,
      sourceSha256,
    };
  }
  throw new Error(`Action group ${file} must be an array or an object with actions[]`);
}

function validateActionGroupNames(groups) {
  const names = new Map();
  const stems = new Map();
  for (const group of groups) {
    const normalizedName = group.name.toLowerCase();
    if (names.has(normalizedName)) throw new Error(`Action group name must be unique: ${group.name}`);
    names.set(normalizedName, group.name);
    const stem = safeFilePart(group.name).toLowerCase();
    if (stems.has(stem)) throw new Error(`Action group artifact-name collision: ${stems.get(stem)} and ${group.name}`);
    stems.set(stem, group.name);
  }
}

function validateActionGroupName(value, source) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`Action group ${source} name must be a non-empty string`);
  if (value.trim().length > 80) throw new Error(`Action group ${source} name must be at most 80 characters`);
  return value.trim();
}

function validateAction(action, index, source) {
  const label = `Action ${index} in ${source}`;
  requireRecord(action, label);
  const allowed = new Set(["click", "hover", "type", "press", "scroll", "wait"]);
  if (typeof action.type !== "string" || !allowed.has(action.type)) throw new Error(`${label} has unsupported type ${JSON.stringify(action.type)}`);
  validateOptionalTimeout(action.timeout, `${label}.timeout`);
  if (["click", "hover", "type"].includes(action.type)) requireString(action.selector, `${label}.selector`);
  if (action.type === "type" && typeof action.value !== "string") throw new Error(`${label}.value must be a string`);
  if (action.type === "press") {
    requireString(action.key, `${label}.key`);
    if (action.selector !== undefined) requireString(action.selector, `${label}.selector`);
  }
  if (action.type === "scroll") {
    validateOptionalFinite(action.x, `${label}.x`);
    validateOptionalFinite(action.y, `${label}.y`);
  }
  if (action.type === "wait" && action.ms !== undefined) validateMilliseconds(action.ms, `${label}.ms`, true);
  return action;
}

function validateAssertion(assertion, index, source) {
  const label = `Assertion ${index} in ${source}`;
  requireRecord(assertion, label);
  const allowed = new Set(["visible", "hidden", "text", "url", "attribute", "focused", "count"]);
  if (typeof assertion.type !== "string" || !allowed.has(assertion.type)) throw new Error(`${label} has unsupported type ${JSON.stringify(assertion.type)}`);
  validateOptionalTimeout(assertion.timeout, `${label}.timeout`);
  if (assertion.type !== "url") requireString(assertion.selector, `${label}.selector`);
  if (["text", "url", "attribute"].includes(assertion.type)) validateMatchers(assertion, label);
  if (assertion.type === "attribute") requireString(assertion.name, `${label}.name`);
  if (assertion.type === "count" && (!Number.isInteger(assertion.equals) || assertion.equals < 0)) {
    throw new Error(`${label}.equals must be a non-negative integer`);
  }
  return assertion;
}

function validateMatchers(assertion, label) {
  const present = ["equals", "contains", "matches"].filter((key) => Object.hasOwn(assertion, key));
  if (!present.length) throw new Error(`${label} requires equals, contains, or matches`);
  for (const key of present) {
    if (typeof assertion[key] !== "string") throw new Error(`${label}.${key} must be a string`);
    if (key !== "equals" && !assertion[key]) throw new Error(`${label}.${key} must not be empty`);
  }
  if (assertion.flags !== undefined && typeof assertion.flags !== "string") throw new Error(`${label}.flags must be a string`);
  if (Object.hasOwn(assertion, "matches")) {
    try {
      new RegExp(assertion.matches, assertion.flags ?? "");
    } catch (error) {
      throw new Error(`${label}.matches is not a valid regular expression: ${error.message}`);
    }
  } else if (assertion.flags !== undefined) {
    throw new Error(`${label}.flags requires matches`);
  }
}

function requireRecord(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
}

function requireString(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be a non-empty string`);
}

function validateOptionalTimeout(value, label) {
  if (value !== undefined) validateMilliseconds(value, label, false);
}

function validateMilliseconds(value, label, allowZero) {
  const minimum = allowZero ? 0 : 1;
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < minimum || value > 60_000) {
    throw new Error(`${label} must be an integer from ${minimum} to 60000`);
  }
}

function validateOptionalFinite(value, label) {
  if (value !== undefined && (typeof value !== "number" || !Number.isFinite(value))) throw new Error(`${label} must be a finite number`);
}

function parseNamedFile(value) {
  const raw = String(value || "");
  const index = raw.indexOf("=");
  if (index === -1) {
    const file = raw;
    return { name: path.basename(file, path.extname(file)) || "state", file };
  }
  return { name: raw.slice(0, index) || "state", file: raw.slice(index + 1) };
}

function sanitizeAction(action) {
  const sanitized = {
    type: action.type,
    selector: action.selector,
    key: action.key,
    ms: action.ms,
    x: action.x,
    y: action.y,
    timeout: action.timeout,
  };
  if (action.type === "type") {
    sanitized.value = "[redacted]";
    sanitized.valueLength = action.value.length;
    sanitized.valueSha256 = hashText(action.value);
  }
  return sanitized;
}

function sanitizeAssertion(assertion) {
  return {
    type: assertion.type,
    selector: assertion.selector,
    name: assertion.name,
    equals: assertion.equals,
    contains: assertion.contains,
    matches: assertion.matches,
    flags: assertion.flags,
    timeout: assertion.timeout,
  };
}

function parseArgs(args) {
  const parsed = {
    path: null,
    url: null,
    out: null,
    slug: null,
    actions: null,
    actionGroupArgs: [],
    failOn: null,
    fail: false,
    strict: false,
    p2Policy: "systemic",
    systemicP2Count: 2,
    includeAdvisory: false,
    expectFindings: [],
    expectVerdict: null,
    requireRuntime: false,
    requireChangeProof: false,
    proofManifest: null,
    timeout: 15000,
    waitUntil: "domcontentloaded",
    settleMs: 500,
    deviceScaleFactor: 1,
    register: null,
    surface: null,
    ambition: null,
    asyncUi: false,
    states: [],
    viewports: [],
    customViewports: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const equalsIndex = arg.indexOf("=");
    const name = equalsIndex === -1 ? arg : arg.slice(0, equalsIndex);
    const inlineValue = equalsIndex === -1 ? undefined : arg.slice(equalsIndex + 1);
    const nextValue = () => {
      const value = inlineValue ?? args[++i];
      if (value === undefined || value === "" || String(value).startsWith("--")) {
        console.error(`Missing value for ${name}`);
        process.exit(2);
      }
      return value;
    };

    if (name === "--path") parsed.path = nextValue();
    else if (name === "--url") parsed.url = nextValue();
    else if (name === "--out") parsed.out = nextValue();
    else if (name === "--slug") parsed.slug = nextValue();
    else if (name === "--actions") parsed.actions = nextValue();
    else if (name === "--action-group") parsed.actionGroupArgs.push(nextValue());
    else if (name === "--fail-on") parsed.failOn = normalizeSeverity(nextValue(), "--fail-on");
    else if (arg === "--fail") parsed.fail = true;
    else if (arg === "--strict") parsed.strict = true;
    else if (name === "--p2-policy") parsed.p2Policy = normalizeP2Policy(nextValue());
    else if (name === "--systemic-p2-count") parsed.systemicP2Count = Number(nextValue());
    else if (arg === "--include-advisory") parsed.includeAdvisory = true;
    else if (name === "--expect-finding") parsed.expectFindings.push(nextValue());
    else if (name === "--expect-verdict") parsed.expectVerdict = normalizeExpectedVerdict(nextValue(), "--expect-verdict");
    else if (arg === "--require-runtime") parsed.requireRuntime = true;
    else if (arg === "--require-change-proof") parsed.requireChangeProof = true;
    else if (name === "--proof-manifest" || name === "--change-proof") parsed.proofManifest = nextValue();
    else if (name === "--timeout") parsed.timeout = Number(nextValue());
    else if (name === "--wait-until") parsed.waitUntil = normalizeWaitUntil(nextValue());
    else if (name === "--settle-ms") parsed.settleMs = Number(nextValue());
    else if (arg === "--detail-capture") parsed.deviceScaleFactor = 2;
    else if (name === "--register") parsed.register = nextValue();
    else if (name === "--surface") parsed.surface = nextValue();
    else if (name === "--ambition") parsed.ambition = nextValue();
    else if (arg === "--async-ui") parsed.asyncUi = true;
    else if (name === "--states") parsed.states = nextValue().split(",").map((state) => state.trim()).filter(Boolean);
    else if (name === "--viewport") {
      if (!parsed.customViewports) {
        parsed.viewports = [];
        parsed.customViewports = true;
      }
      parsed.viewports.push(parseViewport(nextValue()));
    }
    else if (arg.startsWith("--")) {
      console.error(`Unknown option: ${arg}`);
      process.exit(2);
    } else if (!parsed.path) {
      parsed.path = arg;
    } else {
      console.error(`Unexpected positional argument: ${arg}`);
      process.exit(2);
    }
  }

  if (!parsed.viewports.length) {
    parsed.viewports = [
      { width: 1280, height: 800 },
      { width: 390, height: 844 },
    ];
  }
  const viewportKeys = parsed.viewports.map((viewport) => `${viewport.width}x${viewport.height}`);
  if (new Set(viewportKeys).size !== viewportKeys.length) {
    console.error("Duplicate viewport values are not allowed");
    process.exit(2);
  }
  if (!Number.isFinite(parsed.timeout) || parsed.timeout <= 0) {
    console.error("Invalid --timeout; expected positive milliseconds");
    process.exit(2);
  }
  if (!Number.isFinite(parsed.settleMs) || parsed.settleMs < 0) {
    console.error("Invalid --settle-ms; expected non-negative milliseconds");
    process.exit(2);
  }
  if (!Number.isFinite(parsed.deviceScaleFactor) || parsed.deviceScaleFactor < 1 || parsed.deviceScaleFactor > 4) {
    console.error("Invalid device scale factor; expected a number from 1 to 4");
    process.exit(2);
  }
  if (!Number.isInteger(parsed.systemicP2Count) || parsed.systemicP2Count < 2) {
    console.error("Invalid --systemic-p2-count; expected an integer of at least 2");
    process.exit(2);
  }

  try {
    parsed.actionGroups = loadActionGroups(parsed.actionGroupArgs, parsed.actions);
  } catch (error) {
    console.error(`Invalid action group: ${error.message}`);
    process.exit(2);
  }
  delete parsed.customViewports;
  delete parsed.actionGroupArgs;
  return parsed;
}

function parseViewport(value) {
  const match = String(value).match(/^(\d+)x(\d+)$/);
  if (!match) {
    console.error(`Invalid --viewport ${value}; expected WIDTHxHEIGHT`);
    process.exit(2);
  }
  return { width: Number(match[1]), height: Number(match[2]) };
}

function normalizeSeverity(value, flagName) {
  const severity = String(value || "").toUpperCase();
  if (!Object.hasOwn(severityRank, severity)) {
    console.error(`Invalid ${flagName} ${value}; expected P0, P1, P2, or P3`);
    process.exit(2);
  }
  return severity;
}

function normalizeExpectedVerdict(value, flagName) {
  const verdict = String(value || "").toLowerCase();
  if (!assessmentVerdicts.has(verdict)) {
    console.error(`Invalid ${flagName} ${value}; expected blocked or incomplete`);
    process.exit(2);
  }
  return verdict;
}

function normalizeWaitUntil(value) {
  const waitUntil = String(value || "").toLowerCase();
  const allowed = new Set(["load", "domcontentloaded", "networkidle", "commit"]);
  if (!allowed.has(waitUntil)) {
    console.error(`Invalid --wait-until ${value}; expected load, domcontentloaded, networkidle, or commit`);
    process.exit(2);
  }
  return waitUntil;
}

function normalizeP2Policy(value) {
  const policy = String(value || "").toLowerCase();
  if (!new Set(["systemic", "all", "none"]).has(policy)) {
    console.error(`Invalid --p2-policy ${value}; expected systemic, all, or none`);
    process.exit(2);
  }
  return policy;
}

function addBlocker(targetReview, gate, reason, fatal = false) {
  targetReview.ledger.blockers.push({ gate, reason: String(reason).trim(), fatal });
}

function setExitCode(code) {
  process.exitCode = Math.max(process.exitCode || 0, code);
}

function evidencePath(targetReview, type) {
  return targetReview.ledger.evidence.find((item) => item.type === type)?.path || null;
}

function compactProcessError(result, fallback) {
  return String(result.stderr || result.stdout || fallback).trim().slice(0, 2000);
}

function runGitAt(directory, args) {
  const result = spawnSync("git", ["-C", directory, ...args], { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
}

function hashText(value) {
  return createHash("sha256").update(value).digest("hex");
}

function hashFile(file) {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function fileSha256OrNull(file) {
  try {
    return fs.statSync(file).isFile() ? hashFile(file) : null;
  } catch {
    return null;
  }
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function displayPath(file) {
  const absolute = path.resolve(file);
  const relative = path.relative(root, absolute);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative) ? relative : absolute;
}

function resolveEvidencePath(file) {
  return path.isAbsolute(file) ? file : path.resolve(root, file);
}

function safeFilePart(value) {
  return String(value || "state")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "state";
}

function summarizeSeverity(findings) {
  return findings.reduce((acc, finding) => {
    acc[finding.severity] = (acc[finding.severity] || 0) + 1;
    return acc;
  }, {});
}

function readOwnershipMarker(directory, markerPath) {
  let markerStat;
  try {
    markerStat = fs.lstatSync(markerPath);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
  if (!markerStat.isFile()) throw new Error(`${markerPath} must be a regular ownership marker file`);

  let marker;
  try {
    marker = JSON.parse(fs.readFileSync(markerPath, "utf8"));
  } catch (error) {
    throw new Error(`${markerPath} is not a valid ownership marker: ${error.message}`);
  }
  if (marker?.schemaVersion !== 2 || marker.owner !== "improve-ui-review" || !Array.isArray(marker.files)) {
    throw new Error(`${markerPath} is not a valid improve-ui ownership marker`);
  }

  const ownershipTargets = new Set();
  const files = marker.files.map((entry, index) => {
    const relativeFile = entry?.path;
    if (typeof relativeFile !== "string" || !relativeFile.trim() || path.isAbsolute(relativeFile)) {
      throw new Error(`${markerPath} files[${index}].path must be a non-empty relative path`);
    }
    if (typeof entry.sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(entry.sha256)) {
      throw new Error(`${markerPath} files[${index}].sha256 must be a SHA-256 digest`);
    }
    if (!isHarnessOwnedRelativePath(relativeFile)) {
      throw new Error(`${markerPath} files[${index}].path is not a recognized improve-ui review artifact`);
    }
    const target = path.resolve(directory, relativeFile.replaceAll("/", path.sep));
    if (!isPathInside(directory, target) || comparablePathKey(target) === comparablePathKey(markerPath)) {
      throw new Error(`${markerPath} files[${index}].path escapes the review output directory`);
    }
    const targetKey = comparablePathKey(target);
    if (ownershipTargets.has(targetKey)) {
      throw new Error(`${markerPath} files[${index}].path is a duplicate ownership path`);
    }
    ownershipTargets.add(targetKey);
    return { path: relativeFile, target, sha256: entry.sha256.toLowerCase() };
  });
  return { ...marker, files };
}

function validateOutputCollisions(priorOwnership) {
  const previouslyOwned = new Map((priorOwnership?.files || []).map((entry) => [comparablePathKey(entry.target), entry]));
  for (const candidate of plannedOwnedOutputPaths()) {
    let stat;
    try {
      stat = fs.lstatSync(candidate);
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    if (!stat.isFile()) throw new Error(`${candidate} collides with a non-file output entry`);
    const ownership = previouslyOwned.get(comparablePathKey(candidate));
    if (!ownership) {
      throw new Error(`${candidate} is an existing output collision not owned by a prior improve-ui review`);
    }
    assertRecordedContentUnchanged(candidate, ownership);
  }
}

function prepareOwnedOutput(directory, markerPath, marker) {
  if (!marker) return;
  const existingOwnedFiles = [];
  for (const ownership of marker.files) {
    const target = ownership.target;
    assertSafePathWithin(directory, target, "file");
    let stat;
    try {
      stat = fs.lstatSync(target);
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    if (!stat.isFile()) throw new Error(`${target} is not a regular owned output file`);
    assertRecordedContentUnchanged(target, ownership);
    existingOwnedFiles.push(target);
  }

  for (const target of existingOwnedFiles) {
    fs.unlinkSync(target);
  }

  const priorScreenshotsDir = path.join(directory, "screenshots");
  assertSafePathWithin(directory, priorScreenshotsDir, "directory");
  try {
    fs.rmdirSync(priorScreenshotsDir);
  } catch (error) {
    if (error.code !== "ENOENT" && error.code !== "ENOTEMPTY" && error.code !== "EEXIST") throw error;
  }
  fs.unlinkSync(markerPath);
}

function validateOutputPreflight() {
  assertSafeOutputPath(outDir, "directory");
  assertSafeOutputPath(screenshotsDir, "directory");
  assertSafeOutputPath(reportAssetsDir, "directory");
  assertSafeOutputPath(ownershipMarkerPath, "file");
  for (const file of plannedOwnedOutputPaths()) assertSafeOutputPath(file, "file");
}

function plannedOwnedOutputPaths() {
  const files = [
    path.join(outDir, "review.json"),
    path.join(outDir, "README.md"),
    path.join(outDir, "report-manifest.json"),
    path.join(outDir, "report.html"),
    path.join(outDir, "report.md"),
    path.join(outDir, "static-findings.json"),
    path.join(outDir, "runtime-findings.json"),
  ];
  if (options.proofManifest) {
    files.push(
      path.join(reportAssetsDir, "proof-before.png"),
      path.join(reportAssetsDir, "proof-after.png"),
    );
  }
  let runtimeIndex = 0;
  for (const group of options.actionGroups) {
    for (const viewport of options.viewports) {
      runtimeIndex += 1;
      const suffix = `${safeFilePart(group.name)}-${viewport.width}x${viewport.height}`;
      files.push(
        path.join(screenshotsDir, `${suffix}-viewport.png`),
        path.join(screenshotsDir, `${suffix}-full-page.png`),
        path.join(screenshotsDir, `${suffix}-error.png`),
        path.join(reportAssetsDir, `runtime-${runtimeIndex}.png`),
      );
    }
  }
  return files;
}

function isReservedOutputPath(candidate) {
  return [ownershipMarkerPath, ...plannedOwnedOutputPaths()].some((file) => pathsShareIdentity(candidate, file));
}

function isCurrentOwnedOutputPath(candidate) {
  return [...ownedOutputFiles.keys()].some((relative) => pathsShareIdentity(candidate, path.join(outDir, relative)));
}

function pathsShareIdentity(left, right) {
  if (comparablePathKey(left) === comparablePathKey(right)) return true;
  const leftReal = realPathOrNull(left);
  const rightReal = realPathOrNull(right);
  if (leftReal && rightReal && comparablePathKey(leftReal) === comparablePathKey(rightReal)) return true;
  const leftIdentity = physicalFileIdentityOrNull(left);
  const rightIdentity = physicalFileIdentityOrNull(right);
  return Boolean(leftIdentity && rightIdentity && leftIdentity === rightIdentity);
}

function realPathOrNull(file) {
  try {
    return fs.realpathSync(file);
  } catch {
    return null;
  }
}

function physicalFileIdentityOrNull(file) {
  try {
    const stat = fs.statSync(file, { bigint: true });
    if (!stat.isFile() || stat.ino === 0n) return null;
    return `${stat.dev}:${stat.ino}`;
  } catch {
    return null;
  }
}

function assertSafeOutputPath(candidate, expectedKind) {
  assertSafePathWithin(outDir, candidate, expectedKind);
}

function assertSafePathWithin(directory, candidate, expectedKind) {
  const absolute = path.resolve(candidate);
  if (comparablePathKey(absolute) !== comparablePathKey(directory) && !isPathInside(directory, absolute)) {
    throw new Error(`${absolute} escapes the review output directory`);
  }
  const parsed = path.parse(absolute);
  const segments = absolute.slice(parsed.root.length).split(path.sep).filter(Boolean);
  let current = parsed.root;
  for (let index = 0; index < segments.length; index += 1) {
    current = path.join(current, segments[index]);
    let stat;
    try {
      stat = fs.lstatSync(current);
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    if (stat.isSymbolicLink()) throw new Error(`${current} is a symbolic link or reparse point`);
    const leaf = index === segments.length - 1;
    if (!leaf && !stat.isDirectory()) throw new Error(`${current} is not a directory`);
    if (leaf && expectedKind === "directory" && !stat.isDirectory()) throw new Error(`${current} must be a directory`);
    if (leaf && expectedKind === "file" && stat.isDirectory()) throw new Error(`${current} must be a file`);
  }
}

function recordOwnedOutput(file) {
  const relative = ownedRelativePath(file);
  if (!relative || comparablePathKey(file) === comparablePathKey(ownershipMarkerPath)) {
    throw new Error(`Refusing to record output outside review directory: ${file}`);
  }
  if (!isHarnessOwnedRelativePath(relative)) {
    throw new Error(`Refusing to record an unrecognized improve-ui review artifact: ${file}`);
  }
  ownedOutputFiles.set(relative, hashFile(file));
}

function isHarnessOwnedRelativePath(relativeFile) {
  if (["review.json", "README.md", "report-manifest.json", "report.html", "report.md", "static-findings.json", "runtime-findings.json"].includes(relativeFile)) return true;
  if (/^report-assets\/(?:proof-(?:before|after)|runtime-[1-9]\d*)\.(?:png|jpg|gif|webp|avif)$/.test(relativeFile)) return true;
  return /^screenshots\/[a-zA-Z0-9._-]{1,80}-[1-9]\d*x[1-9]\d*-(?:viewport|full-page|error)\.png$/.test(relativeFile);
}

function ownedRelativePath(file) {
  const absolute = path.resolve(file);
  if (!isPathInside(outDir, absolute)) return null;
  return path.relative(outDir, absolute).split(path.sep).join("/");
}

function isPathInside(directory, candidate) {
  const relative = path.relative(path.resolve(directory), path.resolve(candidate));
  return Boolean(relative)
    && relative !== ".."
    && !relative.startsWith(`..${path.sep}`)
    && !path.isAbsolute(relative);
}

function comparablePathKey(file) {
  const absolute = path.resolve(file);
  return process.platform === "win32" ? absolute.toLowerCase() : absolute;
}

function writeOwnershipMarker() {
  fs.writeFileSync(ownershipMarkerPath, `${JSON.stringify({
    schemaVersion: 2,
    owner: "improve-ui-review",
    files: [...ownedOutputFiles]
      .map(([filePath, sha256]) => ({ path: filePath, sha256 }))
      .sort((left, right) => left.path.localeCompare(right.path)),
  }, null, 2)}\n`);
}

function assertRecordedContentUnchanged(target, ownership) {
  if (hashFile(target) !== ownership.sha256) {
    throw new Error(`${target} changed since it was recorded; refusing to delete or overwrite content with a different content hash`);
  }
}

function findRepoRoot() {
  let current = process.cwd();
  while (current && current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, ".git"))) return current;
    current = path.dirname(current);
  }
  return process.cwd();
}

function slugify(value) {
  return String(value)
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "review";
}

function usage(stream = process.stderr) {
  stream.write("Usage: node run-interface-review.mjs --path <file-or-dir> [--url <local-url>] [--out <dir>] [--actions actions.json] [--action-group name=actions.json] [--viewport 1280x800] [--detail-capture] [--strict] [--p2-policy systemic|all|none] [--systemic-p2-count 2] [--include-advisory] [--fail-on=P0|P1|P2|P3] [--expect-finding id] [--expect-verdict blocked|incomplete] [--require-runtime] [--require-change-proof --proof-manifest proof.json] [--async-ui] [--wait-until domcontentloaded|load|networkidle|commit] [--settle-ms 500] [--fail]\n");
  stream.write("Omit --out for a unique operating-system temporary directory; explicit --out selects durable report output.\n");
}
