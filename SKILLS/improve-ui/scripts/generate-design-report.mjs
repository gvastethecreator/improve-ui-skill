#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const MODES = new Set(["critique", "proposal", "redesign"]);
const SEVERITIES = new Set(["blocker", "P1", "P2", "P3", "info"]);
const PROOF_STATES = new Set(["passed", "failed", "blocked", "n/a", "unknown"]);
const DIRECTION_STATES = new Set(["selected", "rejected", "explored"]);
const SCREENSHOT_STAGES = new Set(["before", "reference", "proposal", "after", "detail"]);
const ANNOTATION_TONES = new Set(["error", "warning", "proposal", "note"]);
const MAX_TEXT = 12000;
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const LABELS_EN = {
  skip: "Skip to report",
  verdict: "Verdict",
  caseIndex: "Case index",
  navNote: "Evidence before adjectives.\nDecisions before decoration.",
  footerTitle: "Improve UI evidence dossier",
  footerStandalone: "Standalone · printable · no external assets",
  footerLinked: "Linked or external assets disclosed",
  briefNav: "Brief",
  evidenceNav: "Evidence",
  findingsNav: "Findings",
  directionsNav: "Directions",
  movesNav: "Moves",
  preserveNav: "Do not break",
  proofNav: "Proof ledger",
  risksNav: "Risks",
  briefKicker: "Decision frame",
  briefTitle: "What this design must solve",
  evidenceKicker: "Observed states",
  evidenceTitle: "Evidence wall",
  unavailable: "Evidence unavailable",
  noAnnotations: "No annotation geometry supplied. Inspect at readable scale before claiming comparison.",
  annotationZoom: "Evidence zoom",
  annotations: "Annotations",
  claim: "Claim",
  geometry: "Geometry",
  asset: "Asset",
  summaryTitle: "Summary",
  metadataTitle: "Metadata",
  noneRecorded: "None recorded.",
  mode: "Mode",
  language: "Language",
  stage: "Stage",
  state: "State",
  viewport: "Viewport",
  caption: "Caption",
  artifactNote: "Artifact note",
  linkedEvidence: "Linked evidence",
  thesis: "Thesis",
  findingsKicker: "Systemic causes",
  findingsTitle: "Findings that force a move",
  seeEvidence: "See linked evidence ↗",
  evidence: "Evidence",
  userDamage: "User damage",
  structuralCause: "Structural cause",
  exactMove: "Exact move",
  earnedRoast: "Earned roast",
  directionsKicker: "Direction search",
  directionsTitle: "Incompatible bets, one decision",
  signature: "Signature",
  decision: "Decision",
  movesKicker: "Cut plan",
  movesTitle: "Next moves in damage order",
  proof: "Proof",
  preserveKicker: "Preservation contract",
  preserveTitle: "Do not flatten the parts that work",
  proofKicker: "Claim limits",
  proofTitle: "Proof ledger",
  gate: "Gate",
  status: "Status",
  artifact: "Artifact",
  risksKicker: "Unresolved",
  risksTitle: "What this report cannot hide",
  risks: "Risks",
  limitations: "Limitations",
  warnings: "Artifact warnings",
  modeCritique: "critique",
  modeProposal: "proposal",
  modeRedesign: "redesign",
  archetype: "Archetype",
  userMode: "User mode",
  primaryArtifact: "Primary artifact",
  pressure: "Pressure",
  spatialModel: "Spatial model",
  proofTarget: "Proof target",
  register: "Register",
  surface: "Surface",
  states: "States",
  generated: "Generated",
  source: "Source",
  target: "Target",
  selected: "selected",
  rejected: "rejected",
  explored: "explored",
  passed: "passed",
  failed: "failed",
  blocked: "blocked",
  notApplicable: "n/a",
  unknown: "unknown",
  stageBefore: "before",
  stageReference: "reference",
  stageProposal: "proposal",
  stageAfter: "after",
  stageDetail: "detail",
};
const LABELS_ES = {
  ...LABELS_EN,
  skip: "Ir al informe",
  verdict: "Veredicto",
  caseIndex: "Índice del caso",
  navNote: "Evidencia antes que adjetivos.\nDecisiones antes que decoración.",
  footerTitle: "Dossier de evidencia de Improve UI",
  footerStandalone: "Autónomo · imprimible · sin recursos externos",
  footerLinked: "Recursos vinculados o externos declarados",
  briefNav: "Brief",
  evidenceNav: "Evidencia",
  findingsNav: "Hallazgos",
  directionsNav: "Direcciones",
  movesNav: "Movimientos",
  preserveNav: "No romper",
  proofNav: "Pruebas",
  risksNav: "Riesgos",
  briefKicker: "Marco de decisión",
  briefTitle: "Qué debe resolver este diseño",
  evidenceKicker: "Estados observados",
  evidenceTitle: "Muro de evidencia",
  unavailable: "Evidencia no disponible",
  noAnnotations: "No se suministró geometría de anotación. Inspeccionar a escala legible antes de afirmar una comparación.",
  annotationZoom: "Zoom de evidencia",
  annotations: "Anotaciones",
  claim: "Afirmación",
  geometry: "Geometría",
  asset: "Recurso",
  summaryTitle: "Resumen",
  metadataTitle: "Metadatos",
  noneRecorded: "No se registraron elementos.",
  mode: "Modo",
  language: "Idioma",
  stage: "Etapa",
  state: "Estado",
  viewport: "Viewport",
  caption: "Descripción",
  artifactNote: "Nota del recurso",
  linkedEvidence: "Evidencia vinculada",
  thesis: "Tesis",
  findingsKicker: "Causas sistémicas",
  findingsTitle: "Hallazgos que obligan a actuar",
  seeEvidence: "Ver evidencia vinculada ↗",
  evidence: "Evidencia",
  userDamage: "Daño al usuario",
  structuralCause: "Causa estructural",
  exactMove: "Movimiento exacto",
  earnedRoast: "Roast ganado",
  directionsKicker: "Búsqueda de dirección",
  directionsTitle: "Apuestas incompatibles, una decisión",
  signature: "Firma",
  decision: "Decisión",
  movesKicker: "Plan de cortes",
  movesTitle: "Próximos movimientos por daño",
  proof: "Prueba",
  preserveKicker: "Contrato de preservación",
  preserveTitle: "No aplanar lo que ya funciona",
  proofKicker: "Límites de la afirmación",
  proofTitle: "Registro de pruebas",
  gate: "Puerta",
  status: "Estado",
  artifact: "Artefacto",
  risksKicker: "Sin resolver",
  risksTitle: "Lo que este informe no puede ocultar",
  risks: "Riesgos",
  limitations: "Limitaciones",
  warnings: "Advertencias del artefacto",
  modeCritique: "crítica",
  modeProposal: "propuesta",
  modeRedesign: "rediseño",
  archetype: "Arquetipo",
  userMode: "Modo de usuario",
  primaryArtifact: "Artefacto primario",
  pressure: "Presión",
  spatialModel: "Modelo espacial",
  proofTarget: "Objetivo de prueba",
  register: "Registro",
  surface: "Superficie",
  states: "Estados",
  generated: "Generado",
  source: "Fuente",
  target: "Objetivo",
  selected: "seleccionada",
  rejected: "rechazada",
  explored: "explorada",
  passed: "pasó",
  failed: "falló",
  blocked: "bloqueado",
  notApplicable: "n/a",
  unknown: "desconocido",
  stageBefore: "antes",
  stageReference: "referencia",
  stageProposal: "propuesta",
  stageAfter: "después",
  stageDetail: "detalle",
};

export function generateDesignReport({
  manifestPath,
  outPath,
  markdownOutPath,
  embedImages = true,
  strictAssets = false,
} = {}) {
  if (!manifestPath) throw new Error("Missing manifestPath");
  const absoluteManifest = path.resolve(manifestPath);
  if (!fs.existsSync(absoluteManifest)) throw new Error("Manifest does not exist: " + absoluteManifest);
  let input;
  try {
    input = JSON.parse(fs.readFileSync(absoluteManifest, "utf8"));
  } catch (error) {
    throw new Error("Manifest is not valid JSON: " + error.message);
  }
  const absoluteOut = path.resolve(outPath || path.join(path.dirname(absoluteManifest), "design-report.html"));
  return writeDesignReport({
    manifest: input,
    outPath: absoluteOut,
    markdownOutPath,
    baseDir: path.dirname(absoluteManifest),
    embedImages,
    strictAssets,
  });
}

export function writeDesignReport({
  manifest,
  outPath,
  markdownOutPath,
  baseDir = process.cwd(),
  embedImages = true,
  strictAssets = false,
} = {}) {
  if (!outPath) throw new Error("Missing outPath");
  const absoluteOut = path.resolve(outPath);
  const absoluteMarkdownOut = path.resolve(markdownOutPath || companionMarkdownPath(absoluteOut));
  if (path.extname(absoluteMarkdownOut).toLowerCase() !== ".md") throw new Error("Markdown output must use a .md extension");
  if (absoluteMarkdownOut === absoluteOut) throw new Error("Markdown output path must differ from the HTML output path");
  const normalized = normalizeManifest(manifest);
  const warnings = [];
  const screenshots = normalized.screenshots.map((item) =>
    resolveScreenshot(item, {
      baseDir: path.resolve(baseDir),
      outDir: path.dirname(absoluteOut),
      embedImages,
      strictAssets,
      warnings,
    }),
  );
  const markdownAssets = prepareMarkdownAssets(screenshots, absoluteMarkdownOut);
  const report = { ...normalized, screenshots: markdownAssets.screenshots };
  const html = renderDesignReport(report, warnings);
  const markdown = renderDesignReportMarkdown(report, warnings);
  fs.mkdirSync(path.dirname(absoluteOut), { recursive: true });
  fs.mkdirSync(path.dirname(absoluteMarkdownOut), { recursive: true });
  if (markdownAssets.files.length) fs.mkdirSync(markdownAssets.assetsDir, { recursive: true });
  for (const asset of markdownAssets.files) fs.writeFileSync(asset.path, asset.bytes);
  fs.writeFileSync(absoluteOut, html, "utf8");
  fs.writeFileSync(absoluteMarkdownOut, markdown, "utf8");
  return {
    outPath: absoluteOut,
    markdownPath: absoluteMarkdownOut,
    markdownAssets: markdownAssets.files.length,
    markdownAssetsDir: markdownAssets.files.length ? markdownAssets.assetsDir : null,
    mode: report.mode,
    findings: report.findings.length,
    screenshots: report.screenshots.length,
    embeddedImages: report.screenshots.filter((item) => item.embedded).length,
    missingImages: report.screenshots.filter((item) => !item.available).length,
    warnings,
  };
}

function companionMarkdownPath(htmlPath) {
  const extension = path.extname(htmlPath);
  return (extension ? htmlPath.slice(0, -extension.length) : htmlPath) + ".md";
}

function prepareMarkdownAssets(screenshots, markdownOutPath) {
  const assetsDir = path.join(path.dirname(markdownOutPath), "report-assets");
  const files = [];
  const prepared = screenshots.map((item) => {
    if (!item.available || !item.sourceBytes || !item.sourceMime) return { ...item, markdownSrc: "" };
    const extension = extensionForMime(item.sourceMime);
    const filename = item.id + extension;
    files.push({ path: path.join(assetsDir, filename), bytes: item.sourceBytes });
    return { ...item, markdownSrc: "report-assets/" + filename };
  });
  return { screenshots: prepared, files, assetsDir };
}

function extensionForMime(mime) {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/gif") return ".gif";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/avif") return ".avif";
  return ".png";
}

export function designReportManifestFromReview(review, { baseDir = process.cwd() } = {}) {
  if (!review || typeof review !== "object") throw new Error("Review must be an object");
  const results = Array.isArray(review.runtime?.results) ? review.runtime.results : [];
  const proofScreenshots = [
    review.proof?.before ? { ...review.proof.before, id: "proof-before", label: "Before · change proof", stage: "before" } : null,
    review.proof?.after ? { ...review.proof.after, id: "proof-after", label: "After · change proof", stage: "after" } : null,
  ].filter(Boolean).map((item) => ({
    id: item.id,
    src: absoluteEvidencePath(item.artifact, baseDir),
    alt: item.label + " for " + textOr(item.state, "recorded state"),
    label: item.label,
    stage: item.stage,
    state: textOr(item.state, "recorded"),
    viewport: formatReviewViewport(item.viewport),
    caption: "Hash-validated " + textOr(item.kind, "visual") + " artifact from the change-proof manifest.",
    annotations: [],
  }));
  const runtimeScreenshots = results
    .filter((result) => result?.artifacts?.viewport?.path)
    .map((result, index) => ({
      id: "runtime-" + (index + 1),
      src: absoluteEvidencePath(result.artifacts.viewport.path, baseDir),
      alt:
        "Runtime capture for " +
        textOr(result.state, "default") +
        " at " +
        textOr(result.viewport?.width, "?") +
        " by " +
        textOr(result.viewport?.height, "?"),
      label: textOr(result.state, "default") + " · " + textOr(result.viewport?.width, "?") + "×" + textOr(result.viewport?.height, "?"),
      stage: "detail",
      state: textOr(result.state, "default"),
      viewport: formatReviewViewport(result.viewport),
      caption: result.ok ? "Runtime state executed and captured; human visual comparison remains separate." : "Runtime capture from a failed state execution.",
      annotations: [],
    }));
  const screenshots = [...proofScreenshots, ...runtimeScreenshots];
  const findings = (Array.isArray(review.findings) ? review.findings : []).slice(0, 40).map((finding, index) => ({
    id: textOr(finding.id, "finding-" + (index + 1)),
    severity: normalizeReviewSeverity(finding.severity),
    title: textOr(finding.id, "Finding " + (index + 1)),
    evidence: [textOr(finding.message, "No message"), sourceLocation(finding)].filter(Boolean).join(" · "),
    damage: "The collected evidence indicates a production or finish risk. Human judgment is still required to establish user impact.",
    cause: textOr(finding.snippet, "The automated evidence pack did not establish a source cause."),
    solution: "Confirm this lead in the rendered context, repair the shared source or state contract, then recapture the same route, state, and viewport.",
    screenshotId: screenshots.length ? screenshots[index % screenshots.length].id : undefined,
  }));
  const context = review.ledger?.context || {};
  const assessment = textOr(review.assessment?.verdict, "blocked");
  const dimensions = Object.entries(review.assessment?.dimensions || {})
    .map(([name, value]) => name + "=" + textOr(value?.status, "unknown"))
    .join(", ");
  return {
    version: 1,
    mode: "critique",
    title: "Interface evidence review",
    eyebrow: "AUTOMATED EVIDENCE PACK",
    verdict: {
      severity: assessment === "blocked" ? "blocker" : normalizeReviewSeverity(review.findings?.[0]?.severity),
      label: assessment,
      summary: "Automated evidence coverage and gates produced " + assessment + ". Dimensions: " + (dimensions || "unobserved") + ".",
    },
    context: {
      register: textOr(context.register, "unknown"),
      surface: textOr(context.surface, "unknown"),
      states: Array.isArray(context.states) ? context.states.join(", ") : "default",
      viewportMatrix: Array.isArray(context.viewports) ? context.viewports.map(formatReviewViewport).join(", ") : "not recorded",
      proofTarget: "Static and runtime evidence; human visual comparison remains required.",
    },
    summary: [
      "This dossier translates the local review harness into a portable evidence artifact.",
      "Detector and runtime findings are leads, not a visual verdict. Annotations remain empty until a human maps literal screenshot subjects to claims.",
    ],
    screenshots,
    findings,
    directions: [],
    actions: findings.slice(0, 5).map((finding, index) => ({
      priority: "0" + (index + 1),
      title: finding.title,
      detail: finding.solution,
      proof: "Recapture the same state and resolve or explicitly defer the finding.",
    })),
    preserve: [],
    proof: (Array.isArray(review.gates) ? review.gates : []).map((gate) => ({
      label: textOr(gate.gate, "gate"),
      status: normalizeProofState(gate.status),
      detail: textOr(gate.detail, "No detail"),
    })),
    risks: (Array.isArray(review.ledger?.blockers) ? review.ledger.blockers : []).map(
      (item) => textOr(item.gate, "gate") + ": " + textOr(item.reason, "blocked"),
    ),
    limitations: [
      "This automated dossier cannot certify hierarchy, comprehension, task fit, or distinctiveness.",
      "Screenshot capture is evidence captured, not evidence compared.",
      "The harness does not invent annotation coordinates; add them only after native-size image inspection.",
    ],
    metadata: {
      generated: textOr(review.reviewedAt, new Date().toISOString()),
      target: textOr(review.target?.url || review.target?.pathInput || review.target?.path, "not recorded"),
    },
  };
}

function absoluteEvidencePath(value, baseDir) {
  if (!value) return "";
  return path.isAbsolute(value) ? value : path.resolve(baseDir, value);
}

function formatReviewViewport(value) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "not recorded";
  return textOr(value.width, "?") + "×" + textOr(value.height, "?");
}

export function renderDesignReport(report, warnings = []) {
  const copy = report.labels;
  const sections = [];
  const nav = [];
  const addSection = (id, label, body, className = "") => {
    if (!body) return;
    nav.push({ id, label });
    sections.push(
      '<section id="' +
        escapeAttr(id) +
        '" class="dossier-section ' +
        escapeAttr(className) +
        '"><div class="section-kicker">' +
        String(nav.length).padStart(2, "0") +
        "</div>" +
        body +
        "</section>",
    );
  };

  addSection("brief", copy.briefNav, renderBrief(report, copy));
  addSection("evidence", copy.evidenceNav, renderEvidence(report.screenshots, copy), "evidence-section");
  addSection("findings", copy.findingsNav, renderFindings(report.findings, copy));
  addSection("directions", copy.directionsNav, renderDirections(report.directions, copy));
  addSection("moves", copy.movesNav, renderActions(report.actions, copy));
  addSection("preserve", copy.preserveNav, renderStringCards(report.preserve, "preserve", copy));
  addSection("proof", copy.proofNav, renderProof(report.proof, copy));
  addSection("risks", copy.risksNav, renderRisks(report.risks, report.limitations, warnings, copy));

  const metadata = Object.entries(report.metadata)
    .map(([key, value]) => '<span><b>' + escapeHtml(localizedKey(key, copy)) + "</b> " + escapeHtml(value) + "</span>")
    .join("");
  const html = [
    "<!doctype html>",
    '<html lang="' + escapeAttr(report.language) + '">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="color-scheme" content="light">',
    "<title>" + escapeHtml(report.title) + "</title>",
    "<style>" + REPORT_CSS + "</style>",
    "</head>",
    '<body class="mode-' + escapeAttr(report.mode) + '">',
    '<a class="skip-link" href="#brief">' + escapeHtml(copy.skip) + "</a>",
    '<header class="report-header">',
    '<div class="masthead"><span class="mark">RD</span><span>' + escapeHtml(report.eyebrow) + "</span></div>",
    '<div class="header-grid">',
    '<div><p class="mode-label">' + escapeHtml(copy["mode" + report.mode[0].toUpperCase() + report.mode.slice(1)]) + '</p><h1>' + escapeHtml(report.title) + "</h1></div>",
    '<div class="verdict ' + severityClass(report.verdict.severity) + '"><span>' + escapeHtml(copy.verdict) + "</span><strong>" + escapeHtml(report.verdict.label) + "</strong><p>" + richText(report.verdict.summary) + "</p></div>",
    "</div>",
    metadata ? '<div class="metadata">' + metadata + "</div>" : "",
    "</header>",
    '<div class="report-shell">',
    '<aside class="report-nav" aria-label="' + escapeAttr(copy.caseIndex) + '"><div class="nav-sticky"><p>' + escapeHtml(copy.caseIndex) + "</p><ol>" +
      nav.map((item, index) => '<li><a href="#' + escapeAttr(item.id) + '"><span>' + String(index + 1).padStart(2, "0") + "</span>" + escapeHtml(item.label) + "</a></li>").join("") +
      '</ol><div class="nav-note">' + richText(copy.navNote) + "</div></div></aside>",
    '<main class="report-main">' + sections.join("") + "</main>",
    "</div>",
    "<footer><span>" + escapeHtml(copy.footerTitle) + "</span><span>" + escapeHtml(report.screenshots.every((item) => item.embedded || !item.available) ? copy.footerStandalone : copy.footerLinked) + "</span></footer>",
    "</body>",
    "</html>",
  ].join("\n");
  return html + "\n";
}

export function renderDesignReportMarkdown(report, warnings = []) {
  const copy = report.labels;
  const lines = [
    "# " + markdownInline(report.title),
    "",
    "## " + markdownInline(copy.verdict),
    "",
    "> **[" + markdownInline(report.verdict.severity) + "] " + markdownInline(report.verdict.label) + "**",
    "> " + markdownInline(report.verdict.summary),
    "",
    "- **" + markdownInline(copy.mode) + ":** " + markdownInline(copy["mode" + report.mode[0].toUpperCase() + report.mode.slice(1)]),
    "- **" + markdownInline(copy.language) + ":** " + markdownInline(report.language),
    "",
    "## " + markdownInline(copy.summaryTitle),
    "",
  ];

  appendMarkdownList(lines, report.summary, copy.noneRecorded);
  lines.push("", "## " + markdownInline(copy.briefKicker), "");
  appendMarkdownRecord(lines, report.context, copy);

  lines.push("", "## " + markdownInline(copy.evidenceTitle), "");
  if (!report.screenshots.length) {
    lines.push("- " + markdownInline(copy.noneRecorded));
  } else {
    report.screenshots.forEach((item, screenshotIndex) => {
      lines.push(
        "### E" + String(screenshotIndex + 1).padStart(2, "0") + " — " + markdownInline(item.label),
        "",
        "- **" + markdownInline(copy.stage) + ":** " + markdownInline(localizedScreenshotStage(item.stage, copy)),
      );
      if (item.state) lines.push("- **" + markdownInline(copy.state) + ":** " + markdownInline(item.state));
      if (item.viewport) lines.push("- **" + markdownInline(copy.viewport) + ":** " + markdownInline(item.viewport));
      if (item.caption) lines.push("- **" + markdownInline(copy.caption) + ":** " + markdownInline(item.caption));
      if (item.markdownSrc) {
        lines.push(
          "- **" + markdownInline(copy.asset) + ":** `" + item.markdownSrc + "`",
          "",
          "![" + markdownInline(item.alt) + "](" + item.markdownSrc + ")",
        );
      } else {
        lines.push(
          "- **" + markdownInline(copy.asset) + ":** " + markdownInline(copy.unavailable),
          "- **" + markdownInline(copy.artifactNote) + ":** " + markdownInline(item.assetNote),
        );
      }
      lines.push("", "#### " + markdownInline(copy.annotations), "");
      if (!item.annotations.length) {
        lines.push("- " + markdownInline(copy.noAnnotations));
      } else {
        item.annotations.forEach((annotation, annotationIndex) => {
          lines.push(
            String(annotationIndex + 1) + ". **" + markdownInline(annotation.subject) + "** (`" + annotation.tone + "`)",
            "   - **" + markdownInline(copy.claim) + ":** " + markdownInline(annotation.label),
            "   - **" + markdownInline(copy.geometry) + ":** `" + annotationGeometry(annotation) + "`",
          );
        });
      }
      lines.push("");
    });
  }

  lines.push("## " + markdownInline(copy.findingsNav), "");
  if (!report.findings.length) {
    lines.push("- " + markdownInline(copy.noneRecorded));
  } else {
    report.findings.forEach((item, index) => {
      lines.push(
        "### F" + String(index + 1).padStart(2, "0") + " · " + markdownInline(item.severity) + " — " + markdownInline(item.title),
        "",
        "- **" + markdownInline(copy.evidence) + ":** " + markdownInline(item.evidence),
        "- **" + markdownInline(copy.userDamage) + ":** " + markdownInline(item.damage),
        "- **" + markdownInline(copy.structuralCause) + ":** " + markdownInline(item.cause),
        "- **" + markdownInline(copy.exactMove) + ":** " + markdownInline(item.solution),
      );
      if (item.roast) lines.push("- **" + markdownInline(copy.earnedRoast) + ":** " + markdownInline(item.roast));
      if (item.screenshotId) {
        const evidenceIndex = report.screenshots.findIndex((screenshot) => screenshot.id === item.screenshotId);
        lines.push("- **" + markdownInline(copy.linkedEvidence) + ":** E" + String(evidenceIndex + 1).padStart(2, "0") + " (`" + item.screenshotId + "`)");
      }
      lines.push("");
    });
  }

  lines.push("## " + markdownInline(copy.directionsNav), "");
  if (!report.directions.length) {
    lines.push("- " + markdownInline(copy.noneRecorded));
  } else {
    report.directions.forEach((item, index) => {
      lines.push(
        "### D" + String(index + 1).padStart(2, "0") + " · " + markdownInline(localizedDirectionStatus(item.status, copy)) + " — " + markdownInline(item.name),
        "",
        "- **" + markdownInline(copy.thesis) + ":** " + markdownInline(item.thesis),
      );
      if (item.signature) lines.push("- **" + markdownInline(copy.signature) + ":** " + markdownInline(item.signature));
      lines.push("- **" + markdownInline(copy.decision) + ":** " + markdownInline(item.why), "");
    });
  }

  lines.push("## " + markdownInline(copy.movesNav), "");
  if (!report.actions.length) {
    lines.push("- " + markdownInline(copy.noneRecorded));
  } else {
    report.actions.forEach((item) => {
      lines.push(
        "### " + markdownInline(item.priority) + " — " + markdownInline(item.title),
        "",
        markdownInline(item.detail),
      );
      if (item.proof) lines.push("", "- **" + markdownInline(copy.proof) + ":** " + markdownInline(item.proof));
      lines.push("");
    });
  }

  lines.push("## " + markdownInline(copy.preserveNav), "");
  appendMarkdownList(lines, report.preserve, copy.noneRecorded);

  lines.push("", "## " + markdownInline(copy.proofTitle), "");
  if (!report.proof.length) {
    lines.push("- " + markdownInline(copy.noneRecorded));
  } else {
    report.proof.forEach((item, index) => {
      lines.push(
        String(index + 1) + ". **" + markdownInline(item.label) + "** — `" + markdownInline(localizedProofStatus(item.status, copy)) + "`",
        "   - " + markdownInline(item.detail),
      );
      if (item.artifact) lines.push("   - **" + markdownInline(copy.artifact) + ":** " + markdownInline(item.artifact));
    });
  }

  lines.push("", "## " + markdownInline(copy.risks), "");
  appendMarkdownList(lines, report.risks, copy.noneRecorded);
  lines.push("", "## " + markdownInline(copy.limitations), "");
  appendMarkdownList(lines, report.limitations, copy.noneRecorded);
  lines.push("", "## " + markdownInline(copy.warnings), "");
  appendMarkdownList(lines, warnings, copy.noneRecorded);
  lines.push("", "## " + markdownInline(copy.metadataTitle), "");
  appendMarkdownRecord(lines, report.metadata, copy);
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

function appendMarkdownList(lines, items, fallback) {
  if (!items.length) {
    lines.push("- " + markdownInline(fallback));
    return;
  }
  for (const item of items) lines.push("- " + markdownInline(item));
}

function appendMarkdownRecord(lines, record, copy) {
  const entries = Object.entries(record);
  if (!entries.length) {
    lines.push("- " + markdownInline(copy.noneRecorded));
    return;
  }
  for (const [key, value] of entries) {
    lines.push("- **" + markdownInline(localizedKey(key, copy)) + ":** " + markdownInline(value));
  }
}

function annotationGeometry(annotation) {
  const point = "x=" + annotation.x + "%, y=" + annotation.y + "%";
  return annotation.width === null ? point + ", point" : point + ", width=" + annotation.width + "%, height=" + annotation.height + "%";
}

function markdownInline(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\\/g, "\\\\")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/([`*_\[\]#|])/g, "\\$1");
}

function normalizeManifest(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Manifest root must be an object");
  const mode = requiredEnum(input.mode, "mode", MODES);
  const title = requiredText(input.title, "title", 240);
  const language = normalizeLanguage(input.language);
  const version = input.version === undefined ? 1 : Number(input.version);
  if (version !== 1) throw new Error("Unsupported manifest version: " + input.version);
  const screenshots = normalizeScreenshots(input.screenshots);
  const screenshotIds = new Set(screenshots.map((item) => item.id));
  return {
    version,
    mode,
    title,
    language,
    labels: { ...defaultLabels(language), ...normalizeRecord(input.labels, "labels") },
    eyebrow: optionalText(input.eyebrow, "IMPROVE UI DOSSIER", 120),
    verdict: normalizeVerdict(input.verdict),
    context: normalizeRecord(input.context, "context"),
    summary: normalizeTextList(input.summary, "summary"),
    screenshots,
    findings: normalizeFindings(input.findings, screenshotIds),
    directions: normalizeDirections(input.directions),
    actions: normalizeActions(input.actions),
    preserve: normalizeTextList(input.preserve, "preserve"),
    proof: normalizeProof(input.proof),
    risks: normalizeTextList(input.risks, "risks"),
    limitations: normalizeTextList(input.limitations, "limitations"),
    metadata: normalizeRecord(input.metadata, "metadata"),
  };
}

function normalizeVerdict(value) {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    severity: optionalEnum(input.severity, "verdict.severity", SEVERITIES, "info"),
    label: optionalText(input.label, "Evidence collected", 160),
    summary: optionalText(input.summary, "No verdict summary was provided.", MAX_TEXT),
  };
}

function normalizeLanguage(value) {
  const language = optionalText(value, "en", 35);
  if (!/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(language)) throw new Error("language must be a BCP 47-style tag");
  return language;
}

function defaultLabels(language) {
  return String(language).toLowerCase().startsWith("es") ? LABELS_ES : LABELS_EN;
}

function normalizeScreenshots(value) {
  const seen = new Set();
  return optionalArray(value, "screenshots").map((item, index) => {
    objectAt(item, "screenshots[" + index + "]");
    const id = requiredText(item.id, "screenshots[" + index + "].id", 100);
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(id)) throw new Error("Invalid screenshot id: " + id);
    if (seen.has(id)) throw new Error("Duplicate screenshot id: " + id);
    seen.add(id);
    return {
      id,
      src: requiredText(item.src, "screenshots[" + index + "].src", MAX_IMAGE_BYTES * 2),
      alt: requiredText(item.alt, "screenshots[" + index + "].alt", 500),
      label: optionalText(item.label, id, 240),
      stage: requiredEnum(item.stage, "screenshots[" + index + "].stage", SCREENSHOT_STAGES),
      caption: optionalText(item.caption, "", MAX_TEXT),
      state: optionalText(item.state, "", 160),
      viewport: optionalText(item.viewport, "", 160),
      annotations: normalizeAnnotations(item.annotations, index, item.stage),
    };
  });
}

function normalizeAnnotations(value, screenshotIndex, stage) {
  return optionalArray(value, "annotations").map((item, index) => {
    objectAt(item, "screenshots[" + screenshotIndex + "].annotations[" + index + "]");
    const x = percent(item.x, "annotation.x");
    const y = percent(item.y, "annotation.y");
    const width = item.width === undefined ? null : percent(item.width, "annotation.width");
    const height = item.height === undefined ? null : percent(item.height, "annotation.height");
    if ((width === null) !== (height === null)) throw new Error("Annotation width and height must be provided together");
    if (width !== null && (x + width > 100 || y + height > 100)) throw new Error("Annotation box exceeds screenshot bounds");
    const tone = optionalEnum(item.tone, "annotation.tone", ANNOTATION_TONES, "error");
    if ((stage === "before" || stage === "reference") && tone === "proposal") {
      throw new Error("Proposal annotations are not allowed on before or reference screenshots; put the proposal on a proposal/after screenshot or in directions/actions");
    }
    return {
      x,
      y,
      width,
      height,
      subject: requiredText(item.subject, "annotation.subject", 200),
      label: requiredText(item.label, "annotation.label", 500),
      tone,
    };
  });
}

function normalizeFindings(value, screenshotIds) {
  return optionalArray(value, "findings").map((item, index) => {
    objectAt(item, "findings[" + index + "]");
    const screenshotId = optionalText(item.screenshotId, "", 100);
    if (screenshotId && !screenshotIds.has(screenshotId)) throw new Error("Unknown screenshotId: " + screenshotId);
    return {
      id: optionalText(item.id, "finding-" + (index + 1), 100),
      severity: optionalEnum(item.severity, "finding.severity", SEVERITIES, "P2"),
      title: requiredText(item.title, "findings[" + index + "].title", 300),
      evidence: requiredText(item.evidence, "findings[" + index + "].evidence", MAX_TEXT),
      damage: requiredText(item.damage, "findings[" + index + "].damage", MAX_TEXT),
      cause: requiredText(item.cause, "findings[" + index + "].cause", MAX_TEXT),
      solution: requiredText(item.solution, "findings[" + index + "].solution", MAX_TEXT),
      roast: optionalText(item.roast, "", 2000),
      screenshotId,
    };
  });
}

function normalizeDirections(value) {
  return optionalArray(value, "directions").map((item, index) => {
    objectAt(item, "directions[" + index + "]");
    return {
      name: requiredText(item.name, "directions[" + index + "].name", 200),
      status: optionalEnum(item.status, "direction.status", DIRECTION_STATES, "explored"),
      thesis: requiredText(item.thesis, "directions[" + index + "].thesis", MAX_TEXT),
      signature: optionalText(item.signature, "", MAX_TEXT),
      why: requiredText(item.why, "directions[" + index + "].why", MAX_TEXT),
    };
  });
}

function normalizeActions(value) {
  return optionalArray(value, "actions").map((item, index) => {
    objectAt(item, "actions[" + index + "]");
    return {
      priority: optionalText(item.priority, String(index + 1).padStart(2, "0"), 20),
      title: requiredText(item.title, "actions[" + index + "].title", 300),
      detail: requiredText(item.detail, "actions[" + index + "].detail", MAX_TEXT),
      proof: optionalText(item.proof, "", MAX_TEXT),
    };
  });
}

function normalizeProof(value) {
  return optionalArray(value, "proof").map((item, index) => {
    objectAt(item, "proof[" + index + "]");
    return {
      label: requiredText(item.label, "proof[" + index + "].label", 300),
      status: optionalEnum(item.status, "proof.status", PROOF_STATES, "unknown"),
      detail: requiredText(item.detail, "proof[" + index + "].detail", MAX_TEXT),
      artifact: optionalText(item.artifact, "", 2000),
    };
  });
}

function normalizeRecord(value, field) {
  if (value === undefined || value === null) return {};
  objectAt(value, field);
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (!/^[A-Za-z0-9][A-Za-z0-9 _-]*$/.test(key)) throw new Error("Invalid " + field + " key: " + key);
    output[key] = requiredText(item, field + "." + key, MAX_TEXT);
  }
  return output;
}

function normalizeTextList(value, field) {
  return optionalArray(value, field).map((item, index) => requiredText(item, field + "[" + index + "]", MAX_TEXT));
}

function optionalArray(value, field) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new Error(field + " must be an array");
  if (value.length > 200) throw new Error(field + " exceeds 200 entries");
  return value;
}

function objectAt(value, field) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(field + " must be an object");
}

function requiredText(value, field, max = MAX_TEXT) {
  if ((typeof value !== "string" && typeof value !== "number") || !String(value).trim()) throw new Error(field + " must be non-empty text");
  const text = String(value).trim();
  if (text.length > max) throw new Error(field + " exceeds " + max + " characters");
  return text;
}

function optionalText(value, fallback = "", max = MAX_TEXT) {
  if (value === undefined || value === null || String(value).trim() === "") return fallback;
  return requiredText(value, "value", max);
}

function requiredEnum(value, field, values) {
  const text = requiredText(value, field, 100);
  if (!values.has(text)) throw new Error(field + " must be one of: " + [...values].join(", "));
  return text;
}

function optionalEnum(value, field, values, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  return requiredEnum(value, field, values);
}

function percent(value, field) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 100) throw new Error(field + " must be a number from 0 to 100");
  return number;
}

function resolveScreenshot(item, context) {
  const source = item.src;
  const sourceLabel = safeAssetLabel(source);
  const dataMatch = source.match(/^data:(image\/(?:png|jpeg|gif|webp|avif));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (dataMatch) {
    const bytes = Buffer.from(dataMatch[2].replace(/\s/g, ""), "base64");
    const detected = sniffImageMime(bytes);
    if (!detected || detected !== dataMatch[1].toLowerCase()) {
      return unavailableScreenshot(item, "Embedded screenshot data is corrupt or its MIME type is incorrect", context);
    }
    if (bytes.length > MAX_IMAGE_BYTES) return unavailableScreenshot(item, "Embedded screenshot exceeds the 25 MB limit", context);
    return resolvedScreenshot(item, {
      renderedSrc: source,
      embedded: true,
      assetNote: "embedded data",
      bytes,
      mime: detected,
    });
  }
  if (/^https?:\/\//i.test(source)) {
    const note = "External screenshot is not portable and was not loaded: " + sourceLabel;
    if (context.strictAssets) throw new Error(note);
    return unavailableScreenshot(item, note, context);
  }
  const absolute = path.isAbsolute(source) ? source : path.resolve(context.baseDir, source);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) return unavailableScreenshot(item, "Screenshot asset is missing: " + sourceLabel, context);
  const bytes = fs.readFileSync(absolute);
  if (bytes.length > MAX_IMAGE_BYTES) return unavailableScreenshot(item, "Screenshot exceeds the 25 MB limit: " + sourceLabel, context);
  const mime = sniffImageMime(bytes);
  if (!mime) return unavailableScreenshot(item, "Screenshot asset is corrupt or unsupported: " + sourceLabel, context);
  if (context.embedImages) {
    return resolvedScreenshot(item, {
      renderedSrc: "data:" + mime + ";base64," + bytes.toString("base64"),
      embedded: true,
      assetNote: path.basename(absolute) + " · embedded",
      bytes,
      mime,
    });
  }
  const relative = path.relative(context.outDir, absolute).replaceAll("\\", "/");
  context.warnings.push("Local screenshot was linked instead of embedded: " + sourceLabel);
  return resolvedScreenshot(item, {
    renderedSrc: encodeURI(relative),
    embedded: false,
    assetNote: path.basename(absolute) + " · linked",
    bytes,
    mime,
  });
}

function resolvedScreenshot(item, { renderedSrc, embedded, assetNote, bytes, mime }) {
  const dimensions = readImageDimensions(bytes, mime);
  return {
    ...item,
    renderedSrc,
    available: true,
    embedded,
    assetNote,
    sourceBytes: bytes,
    sourceMime: mime,
    pixelWidth: dimensions?.width || null,
    pixelHeight: dimensions?.height || null,
  };
}

function safeAssetLabel(source) {
  if (/^https?:\/\//i.test(source)) {
    try {
      const url = new URL(source);
      const name = path.posix.basename(url.pathname) || "remote-image";
      return url.hostname + "/" + name;
    } catch {
      return "remote-image";
    }
  }
  return path.basename(source) || "screenshot";
}

function unavailableScreenshot(item, message, context) {
  if (context.strictAssets) throw new Error(message);
  context.warnings.push(message);
  return {
    ...item,
    renderedSrc: "",
    available: false,
    embedded: false,
    assetNote: message,
    sourceBytes: null,
    sourceMime: null,
    pixelWidth: null,
    pixelHeight: null,
  };
}

function sniffImageMime(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  const six = bytes.subarray(0, 6).toString("ascii");
  if (six === "GIF87a" || six === "GIF89a") return "image/gif";
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (bytes.length >= 12 && bytes.subarray(4, 12).toString("ascii").startsWith("ftypavi")) return "image/avif";
  return null;
}

function readImageDimensions(bytes, mime) {
  try {
    if (mime === "image/png" && bytes.length >= 24) {
      return validImageDimensions(bytes.readUInt32BE(16), bytes.readUInt32BE(20));
    }
    if (mime === "image/gif" && bytes.length >= 10) {
      return validImageDimensions(bytes.readUInt16LE(6), bytes.readUInt16LE(8));
    }
    if (mime === "image/jpeg") return readJpegDimensions(bytes);
    if (mime === "image/webp") return readWebpDimensions(bytes);
    if (mime === "image/avif") return readAvifDimensions(bytes);
  } catch {}
  return null;
}

function readJpegDimensions(bytes) {
  const startOfFrame = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (offset + 2 > bytes.length) return null;
    const length = bytes.readUInt16BE(offset);
    if (length < 2 || offset + length > bytes.length) return null;
    if (startOfFrame.has(marker) && length >= 7) {
      return validImageDimensions(bytes.readUInt16BE(offset + 5), bytes.readUInt16BE(offset + 3));
    }
    offset += length;
  }
  return null;
}

function readWebpDimensions(bytes) {
  const chunk = bytes.subarray(12, 16).toString("ascii");
  if (chunk === "VP8X" && bytes.length >= 30) {
    return validImageDimensions(bytes.readUIntLE(24, 3) + 1, bytes.readUIntLE(27, 3) + 1);
  }
  if (chunk === "VP8 " && bytes.length >= 30 && bytes.subarray(23, 26).equals(Buffer.from([0x9d, 0x01, 0x2a]))) {
    return validImageDimensions(bytes.readUInt16LE(26) & 0x3fff, bytes.readUInt16LE(28) & 0x3fff);
  }
  if (chunk === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) {
    const width = 1 + (((bytes[22] & 0x3f) << 8) | bytes[21]);
    const height = 1 + (((bytes[24] & 0x0f) << 10) | (bytes[23] << 2) | (bytes[22] >> 6));
    return validImageDimensions(width, height);
  }
  return null;
}

function readAvifDimensions(bytes) {
  let offset = 0;
  while (offset + 20 <= bytes.length) {
    const index = bytes.indexOf("ispe", offset, "ascii");
    if (index === -1 || index + 16 > bytes.length) return null;
    const dimensions = validImageDimensions(bytes.readUInt32BE(index + 8), bytes.readUInt32BE(index + 12));
    if (dimensions) return dimensions;
    offset = index + 4;
  }
  return null;
}

function validImageDimensions(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || width > 100000 || height > 100000) return null;
  return { width, height };
}

function renderBrief(report, copy) {
  const context = Object.entries(report.context);
  const summary = report.summary.length
    ? '<div class="summary-stack">' + report.summary.map((item) => "<p>" + richText(item) + "</p>").join("") + "</div>"
    : "";
  const contextGrid = context.length
    ? '<div class="context-grid">' +
      context.map(([key, value]) => '<div><span>' + escapeHtml(localizedKey(key, copy)) + "</span><strong>" + richText(value) + "</strong></div>").join("") +
      "</div>"
    : "";
  if (!summary && !contextGrid) return "";
  return '<div class="section-heading"><p>' + escapeHtml(copy.briefKicker) + "</p><h2>" + escapeHtml(copy.briefTitle) + "</h2></div>" + summary + contextGrid;
}

function renderEvidence(screenshots, copy) {
  if (!screenshots.length) return "";
  return '<div class="section-heading"><p>' + escapeHtml(copy.evidenceKicker) + "</p><h2>" + escapeHtml(copy.evidenceTitle) + '</h2></div><div class="evidence-wall">' + screenshots.map((item, index) => renderScreenshot(item, index, copy)).join("") + "</div>";
}

function renderScreenshot(item, index, copy) {
  const labels = [localizedScreenshotStage(item.stage, copy), item.state, item.viewport]
    .filter(Boolean)
    .map((value) => "<span>" + escapeHtml(value) + "</span>")
    .join("");
  const media = item.available
    ? renderEvidenceSource(item)
    : '<div class="evidence-missing"><strong>' + escapeHtml(copy.unavailable) + "</strong><span>" + escapeHtml(item.assetNote) + "</span></div>";
  const annotations = (item.available ? item.annotations : [])
    .map((annotation, annotationIndex) => {
      const style =
        "left:" +
        annotation.x +
        "%;top:" +
        annotation.y +
        "%;" +
        (annotation.width === null ? "" : "width:" + annotation.width + "%;height:" + annotation.height + "%;");
      const shapeClass = annotation.width === null ? "annotation-pin" : "annotation-box";
      const edgeClasses = annotationEdgeClasses(annotation);
      return '<span class="' + shapeClass + " tone-" + escapeAttr(annotation.tone) + edgeClasses + '" style="' + style + '" aria-hidden="true"><b>' + (annotationIndex + 1) + "</b></span>";
    })
    .join("");
  const legend = item.annotations.length
    ? '<ol class="annotation-legend">' +
      item.annotations
        .map(
          (annotation, annotationIndex) =>
            '<li class="tone-' +
            escapeAttr(annotation.tone) +
            '"><b>' +
            (annotationIndex + 1) +
            "</b><div><strong>" +
            escapeHtml(annotation.subject) +
            "</strong><span>" +
            richText(annotation.label) +
            "</span>" +
            renderAnnotationLoupe(item, annotation, copy) +
            "</div></li>",
        )
        .join("") +
      "</ol>"
    : '<p class="no-annotations">' + escapeHtml(copy.noAnnotations) + "</p>";
  return (
    '<figure class="evidence-card" id="shot-' +
    escapeAttr(item.id) +
    '"><figcaption><div><span class="evidence-index">E' +
    String(index + 1).padStart(2, "0") +
    "</span><strong>" +
    escapeHtml(item.label) +
    "</strong></div><div class=\"evidence-tags\">" +
    labels +
    "</div></figcaption><div class=\"evidence-media\">" +
    media +
    annotations +
    "</div>" +
    (item.caption ? '<p class="evidence-caption">' + richText(item.caption) + "</p>" : "") +
    legend +
    '<p class="asset-note">' +
    escapeHtml(item.assetNote) +
    "</p></figure>"
  );
}

function annotationEdgeClasses(annotation) {
  const classes = [];
  if (annotation.x < 4) classes.push("label-inset-left");
  if (annotation.y < 4) classes.push("label-inset-top");
  if (annotation.width === null && annotation.x > 96) classes.push("label-inset-right");
  if (annotation.width === null && annotation.y > 96) classes.push("label-inset-bottom");
  return classes.length ? " " + classes.join(" ") : "";
}

function renderEvidenceSource(item) {
  if (!item.pixelWidth || !item.pixelHeight) {
    return '<img src="' + escapeAttr(item.renderedSrc) + '" alt="' + escapeAttr(item.alt) + '">';
  }
  return (
    '<svg class="evidence-source" viewBox="0 0 ' +
    item.pixelWidth +
    " " +
    item.pixelHeight +
    '" width="' +
    item.pixelWidth +
    '" height="' +
    item.pixelHeight +
    '" overflow="hidden" role="img" aria-label="' +
    escapeAttr(item.alt) +
    '"><image id="source-' +
    escapeAttr(item.id) +
    '" href="' +
    escapeAttr(item.renderedSrc) +
    '" width="' +
    item.pixelWidth +
    '" height="' +
    item.pixelHeight +
    '"></image></svg>'
  );
}

function renderAnnotationLoupe(item, annotation, copy) {
  if (!item.available || !item.pixelWidth || !item.pixelHeight) return "";
  const geometry = annotationLoupeGeometry(item, annotation);
  const label = copy.annotationZoom + ": " + annotation.subject;
  const target = annotation.width === null
    ? '<circle class="loupe-target" cx="' + formatSvgNumber(geometry.targetX) + '" cy="' + formatSvgNumber(geometry.targetY) + '" r="' + formatSvgNumber(geometry.radius) + '"></circle>'
    : '<rect class="loupe-target" x="' + formatSvgNumber(geometry.targetX) + '" y="' + formatSvgNumber(geometry.targetY) + '" width="' + formatSvgNumber(geometry.targetWidth) + '" height="' + formatSvgNumber(geometry.targetHeight) + '"></rect>';
  return (
    '<span class="loupe-label">' +
    escapeHtml(copy.annotationZoom) +
    '</span><svg class="annotation-loupe tone-' +
    escapeAttr(annotation.tone) +
    '" viewBox="' +
    [geometry.viewX, geometry.viewY, geometry.viewWidth, geometry.viewHeight].map(formatSvgNumber).join(" ") +
    '" overflow="hidden" role="img" aria-label="' +
    escapeAttr(label) +
    '"><title>' +
    escapeHtml(label) +
    '</title><use href="#source-' +
    escapeAttr(item.id) +
    '"></use>' +
    target +
    "</svg>"
  );
}

function annotationLoupeGeometry(item, annotation) {
  const imageWidth = item.pixelWidth;
  const imageHeight = item.pixelHeight;
  const targetX = (annotation.x / 100) * imageWidth;
  const targetY = (annotation.y / 100) * imageHeight;
  if (annotation.width === null) {
    const viewWidth = Math.min(imageWidth, imageWidth * 0.36);
    const viewHeight = Math.min(imageHeight, imageHeight * 0.36);
    const view = fitLoupeView(
      targetX - viewWidth / 2,
      targetY - viewHeight / 2,
      viewWidth,
      viewHeight,
      imageWidth,
      imageHeight,
    );
    return {
      ...view,
      targetX,
      targetY,
      radius: Math.max(Math.min(imageWidth, imageHeight) * 0.018, 0.02),
    };
  }
  const targetWidth = (annotation.width / 100) * imageWidth;
  const targetHeight = (annotation.height / 100) * imageHeight;
  const padX = Math.max(targetWidth * 0.22, imageWidth * 0.025);
  const padY = Math.max(targetHeight * 0.22, imageHeight * 0.025);
  const viewX = Math.max(0, targetX - padX);
  const viewY = Math.max(0, targetY - padY);
  const view = fitLoupeView(
    viewX,
    viewY,
    Math.min(imageWidth, targetX + targetWidth + padX) - viewX,
    Math.min(imageHeight, targetY + targetHeight + padY) - viewY,
    imageWidth,
    imageHeight,
  );
  return {
    ...view,
    targetX,
    targetY,
    targetWidth,
    targetHeight,
  };
}

function fitLoupeView(x, y, width, height, imageWidth, imageHeight) {
  const targetAspect = 16 / 9;
  let viewWidth = width;
  let viewHeight = height;
  if (viewWidth / viewHeight < targetAspect) viewWidth = Math.min(imageWidth, viewHeight * targetAspect);
  else viewHeight = Math.min(imageHeight, viewWidth / targetAspect);
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  return {
    viewX: clamp(centerX - viewWidth / 2, 0, imageWidth - viewWidth),
    viewY: clamp(centerY - viewHeight / 2, 0, imageHeight - viewHeight),
    viewWidth,
    viewHeight,
  };
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function formatSvgNumber(value) {
  return Number(value.toFixed(4)).toString();
}

function renderFindings(findings, copy) {
  if (!findings.length) return "";
  return (
    '<div class="section-heading"><p>' + escapeHtml(copy.findingsKicker) + "</p><h2>" + escapeHtml(copy.findingsTitle) + '</h2></div><div class="finding-list">' +
    findings
      .map((item, index) => {
        const screenshotLink = item.screenshotId ? '<a href="#shot-' + escapeAttr(item.screenshotId) + '">' + escapeHtml(copy.seeEvidence) + "</a>" : "";
        return (
          '<article class="finding ' +
          severityClass(item.severity) +
          '"><header><div><span>F' +
          String(index + 1).padStart(2, "0") +
          "</span><span>" +
          escapeHtml(item.severity) +
          "</span></div><h3>" +
          escapeHtml(item.title) +
          "</h3>" +
          screenshotLink +
          '</header><div class="finding-grid">' +
          findingCell(copy.evidence, item.evidence) +
          findingCell(copy.userDamage, item.damage) +
          findingCell(copy.structuralCause, item.cause) +
          findingCell(copy.exactMove, item.solution, "solution") +
          "</div>" +
          (item.roast ? '<p class="earned-roast"><span>' + escapeHtml(copy.earnedRoast) + "</span>" + richText(item.roast) + "</p>" : "") +
          "</article>"
        );
      })
      .join("") +
    "</div>"
  );
}

function findingCell(label, value, className = "") {
  return '<div class="' + escapeAttr(className) + '"><span>' + escapeHtml(label) + "</span><p>" + richText(value) + "</p></div>";
}

function renderDirections(directions, copy) {
  if (!directions.length) return "";
  return (
    '<div class="section-heading"><p>' + escapeHtml(copy.directionsKicker) + "</p><h2>" + escapeHtml(copy.directionsTitle) + '</h2></div><div class="direction-grid">' +
    directions
      .map(
        (item, index) =>
          '<article class="direction direction-' +
          escapeAttr(item.status) +
          '"><header><span>D' +
          String(index + 1).padStart(2, "0") +
          "</span><b>" +
          escapeHtml(localizedDirectionStatus(item.status, copy)) +
          "</b></header><h3>" +
          escapeHtml(item.name) +
          "</h3><p>" +
          richText(item.thesis) +
          "</p>" +
          (item.signature ? "<dl><dt>" + escapeHtml(copy.signature) + "</dt><dd>" + richText(item.signature) + "</dd></dl>" : "") +
          "<dl><dt>" + escapeHtml(copy.decision) + "</dt><dd>" +
          richText(item.why) +
          "</dd></dl></article>",
      )
      .join("") +
    "</div>"
  );
}

function renderActions(actions, copy) {
  if (!actions.length) return "";
  return (
    '<div class="section-heading"><p>' + escapeHtml(copy.movesKicker) + "</p><h2>" + escapeHtml(copy.movesTitle) + '</h2></div><ol class="action-list">' +
    actions
      .map(
        (item) =>
          '<li><span>' +
          escapeHtml(item.priority) +
          "</span><div><h3>" +
          escapeHtml(item.title) +
          "</h3><p>" +
          richText(item.detail) +
          "</p>" +
          (item.proof ? '<p class="proof-target"><b>' + escapeHtml(copy.proof) + "</b> " + richText(item.proof) + "</p>" : "") +
          "</div></li>",
      )
      .join("") +
    "</ol>"
  );
}

function renderStringCards(items, kind, copy) {
  if (!items.length) return "";
  return (
    '<div class="section-heading"><p>' + escapeHtml(copy.preserveKicker) + "</p><h2>" + escapeHtml(copy.preserveTitle) + '</h2></div><div class="string-cards ' +
    escapeAttr(kind) +
    '">' +
    items.map((item, index) => '<div><span>' + String(index + 1).padStart(2, "0") + "</span><p>" + richText(item) + "</p></div>").join("") +
    "</div>"
  );
}

function renderProof(items, copy) {
  if (!items.length) return "";
  return (
    '<div class="section-heading"><p>' + escapeHtml(copy.proofKicker) + "</p><h2>" + escapeHtml(copy.proofTitle) + '</h2></div><div class="table-wrap"><table><thead><tr><th>' + escapeHtml(copy.gate) + "</th><th>" + escapeHtml(copy.status) + "</th><th>" + escapeHtml(copy.evidence) + "</th><th>" + escapeHtml(copy.artifact) + "</th></tr></thead><tbody>" +
    items
      .map(
        (item) =>
          "<tr><th>" +
          escapeHtml(item.label) +
          '</th><td><span class="proof-state state-' +
          escapeAttr(item.status.replace("/", "-")) +
          '">' +
          escapeHtml(localizedProofStatus(item.status, copy)) +
          "</span></td><td>" +
          richText(item.detail) +
          "</td><td>" +
          (item.artifact ? escapeHtml(item.artifact) : "—") +
          "</td></tr>",
      )
      .join("") +
    "</tbody></table></div>"
  );
}

function renderRisks(risks, limitations, warnings, copy) {
  const groups = [
    { label: copy.risks, items: risks },
    { label: copy.limitations, items: limitations },
    { label: copy.warnings, items: warnings },
  ].filter((group) => group.items.length);
  if (!groups.length) return "";
  return (
    '<div class="section-heading"><p>' + escapeHtml(copy.risksKicker) + "</p><h2>" + escapeHtml(copy.risksTitle) + '</h2></div><div class="risk-grid">' +
    groups
      .map(
        (group) =>
          "<section><h3>" +
          escapeHtml(group.label) +
          "</h3><ul>" +
          group.items.map((item) => "<li>" + richText(item) + "</li>").join("") +
          "</ul></section>",
      )
      .join("") +
    "</div>"
  );
}

function sourceLocation(finding) {
  if (!finding?.file) return "";
  return textOr(finding.file, "") + (finding.line ? ":" + finding.line : "");
}

function normalizeReviewSeverity(value) {
  return SEVERITIES.has(value) ? value : value === "P0" ? "blocker" : "info";
}

function normalizeProofState(value) {
  if (value === "pass") return "passed";
  if (value === "fail") return "failed";
  if (value === "skip") return "n/a";
  return PROOF_STATES.has(value) ? value : "unknown";
}

function textOr(value, fallback) {
  if (value === undefined || value === null || String(value).trim() === "") return fallback;
  return String(value);
}

function localizedKey(value, copy) {
  const key = String(value).replace(/[\s_-]/g, "").toLowerCase();
  const known = {
    archetype: copy.archetype,
    usermode: copy.userMode,
    primaryartifact: copy.primaryArtifact,
    pressure: copy.pressure,
    spatialmodel: copy.spatialModel,
    prooftarget: copy.proofTarget,
    register: copy.register,
    surface: copy.surface,
    states: copy.states,
    generated: copy.generated,
    source: copy.source,
    target: copy.target,
    status: copy.status,
  };
  return known[key] || humanize(value);
}

function localizedDirectionStatus(value, copy) {
  return {
    selected: copy.selected,
    rejected: copy.rejected,
    explored: copy.explored,
  }[value] || value;
}

function localizedProofStatus(value, copy) {
  return {
    passed: copy.passed,
    failed: copy.failed,
    blocked: copy.blocked,
    "n/a": copy.notApplicable,
    unknown: copy.unknown,
  }[value] || value;
}

function localizedScreenshotStage(value, copy) {
  return {
    before: copy.stageBefore,
    reference: copy.stageReference,
    proposal: copy.stageProposal,
    after: copy.stageAfter,
    detail: copy.stageDetail,
  }[value] || value;
}

function humanize(value) {
  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function severityClass(value) {
  return "severity-" + String(value).toLowerCase();
}

function richText(value) {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function parseArgs(args) {
  const options = { manifestPath: null, outPath: null, markdownOutPath: null, embedImages: true, strictAssets: false };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const [name, inlineValue] = argument.split("=", 2);
    const next = () => inlineValue ?? args[++index];
    if (name === "--manifest") options.manifestPath = next();
    else if (name === "--out") options.outPath = next();
    else if (name === "--markdown-out") options.markdownOutPath = next();
    else if (argument === "--no-embed-images") options.embedImages = false;
    else if (argument === "--strict-assets") options.strictAssets = true;
    else if (argument === "--help" || argument === "-h") options.help = true;
    else if (argument.startsWith("--")) throw new Error("Unknown option: " + argument);
    else if (!options.manifestPath) options.manifestPath = argument;
    else throw new Error("Unexpected argument: " + argument);
  }
  return options;
}

function usage() {
  return [
    "Usage: node generate-design-report.mjs --manifest <report.json> [--out <report.html>] [--markdown-out <report.md>]",
    "",
    "Options:",
    "  --markdown-out      Override the automatic Markdown companion path.",
    "  --strict-assets      Fail when a screenshot is missing, corrupt, unsupported, or external.",
    "  --no-embed-images    Link local screenshots instead of embedding them. The report is no longer portable.",
  ].join("\n");
}

const REPORT_CSS = [
  ":root { color-scheme:light; --ink:#12130f; --paper:#f1efe7; --sheet:#fbfaf5; --muted:#696b62; --line:#c9c7bd; --acid:#d7ff4f; --danger:#ff5e49; --amber:#f0ad32; --blue:#3977f6; --green:#2e8a57; --rail:260px; }",
  "* { box-sizing:border-box; }",
  "html { scroll-behavior:smooth; background:var(--paper); }",
  "body { margin:0; color:var(--ink); background:var(--paper); font-family:Arial,Helvetica,sans-serif; font-size:16px; line-height:1.55; }",
  "body::before { content:\"\"; position:fixed; inset:0; pointer-events:none; opacity:.22; background-image:linear-gradient(rgba(18,19,15,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(18,19,15,.04) 1px,transparent 1px); background-size:32px 32px; }",
  "a { color:inherit; }",
  "a:focus-visible { outline:3px solid var(--blue); outline-offset:3px; }",
  ".skip-link { position:absolute; left:12px; top:-60px; z-index:30; padding:10px 14px; background:var(--ink); color:white; }",
  ".skip-link:focus { top:12px; }",
  ".report-header { position:relative; padding:24px 32px 34px; border-bottom:2px solid var(--ink); background:var(--sheet); }",
  ".masthead { display:flex; align-items:center; gap:12px; font-size:12px; font-weight:800; letter-spacing:.15em; text-transform:uppercase; }",
  ".mark { display:grid; place-items:center; width:38px; height:38px; background:var(--ink); color:var(--acid); letter-spacing:-.08em; }",
  ".header-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(320px,.48fr); gap:clamp(32px,7vw,120px); align-items:end; margin-top:56px; }",
  ".mode-label { margin:0 0 8px; color:var(--muted); font-size:13px; font-weight:800; letter-spacing:.13em; text-transform:uppercase; }",
  "h1 { max-width:980px; margin:0; font-family:Georgia,Times,serif; font-size:clamp(46px,7vw,106px); font-weight:500; letter-spacing:-.055em; line-height:.88; text-wrap:balance; }",
  ".verdict { border-top:8px solid var(--ink); padding:16px 0 0; }",
  ".verdict > span { display:block; color:var(--muted); font-size:11px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; }",
  ".verdict strong { display:block; margin:4px 0 10px; font-size:28px; line-height:1; text-transform:uppercase; }",
  ".verdict p { max-width:56ch; margin:0; }",
  ".verdict.severity-blocker,.verdict.severity-p1 { border-color:var(--danger); }",
  ".verdict.severity-p2 { border-color:var(--amber); }",
  ".verdict.severity-p3,.verdict.severity-info { border-color:var(--blue); }",
  ".metadata { display:flex; flex-wrap:wrap; gap:8px 22px; margin-top:32px; padding-top:16px; border-top:1px solid var(--line); color:var(--muted); font-size:12px; }",
  ".metadata b { margin-right:5px; color:var(--ink); text-transform:uppercase; letter-spacing:.08em; }",
  ".report-shell { position:relative; display:grid; grid-template-columns:var(--rail) minmax(0,1fr); }",
  ".report-nav { border-right:1px solid var(--line); }",
  ".nav-sticky { position:sticky; top:0; padding:30px 24px; }",
  ".nav-sticky > p { margin:0 0 18px; font-size:11px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; }",
  ".report-nav ol { margin:0; padding:0; list-style:none; border-top:1px solid var(--line); }",
  ".report-nav li { border-bottom:1px solid var(--line); }",
  ".report-nav a { display:grid; grid-template-columns:36px 1fr; gap:8px; padding:12px 0; text-decoration:none; font-weight:700; }",
  ".report-nav a:hover { color:var(--blue); }",
  ".report-nav a span { color:var(--muted); font:11px/1.7 ui-monospace,Consolas,monospace; }",
  ".nav-note { margin-top:34px; padding:14px; border-left:4px solid var(--acid); background:var(--ink); color:white; font:12px/1.55 ui-monospace,Consolas,monospace; }",
  ".report-main { min-width:0; }",
  ".dossier-section { position:relative; padding:56px clamp(24px,5vw,82px) 72px; border-bottom:1px solid var(--line); }",
  ".section-kicker { position:absolute; top:62px; right:clamp(24px,5vw,82px); color:var(--line); font:700 clamp(40px,7vw,96px)/.8 Georgia,serif; }",
  ".section-heading { max-width:880px; margin:0 0 38px; padding-right:100px; }",
  ".section-heading > p { margin:0 0 6px; color:var(--muted); font-size:11px; font-weight:800; letter-spacing:.15em; text-transform:uppercase; }",
  "h2 { margin:0; font-family:Georgia,Times,serif; font-size:clamp(32px,4.2vw,64px); font-weight:500; letter-spacing:-.04em; line-height:1; text-wrap:balance; }",
  ".summary-stack { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px; max-width:1120px; }",
  ".summary-stack p { margin:0; font-size:clamp(18px,2vw,27px); line-height:1.35; }",
  ".context-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1px; margin-top:42px; border:1px solid var(--line); background:var(--line); }",
  ".context-grid > div { min-height:130px; padding:20px; background:var(--sheet); }",
  ".context-grid span,.finding-grid span { display:block; margin-bottom:12px; color:var(--muted); font-size:11px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }",
  ".context-grid strong { display:block; max-width:32ch; font-size:17px; line-height:1.35; }",
  ".evidence-wall { display:grid; gap:42px; }",
  ".evidence-card { margin:0; border:1px solid var(--ink); background:var(--sheet); box-shadow:9px 9px 0 var(--ink); }",
  ".evidence-card figcaption { display:flex; align-items:center; justify-content:space-between; gap:18px; padding:14px 16px; border-bottom:1px solid var(--ink); }",
  ".evidence-card figcaption > div:first-child { display:flex; align-items:center; gap:12px; }",
  ".evidence-index { padding:4px 7px; background:var(--ink); color:var(--acid); font:700 11px ui-monospace,Consolas,monospace; }",
  ".evidence-tags { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:6px; }",
  ".evidence-tags span { padding:3px 7px; border:1px solid var(--line); color:var(--muted); font-size:11px; }",
  ".evidence-media { position:relative; overflow:hidden; background:#d9d7cf; }",
  ".evidence-media img,.evidence-source { display:block; width:100%; height:auto; }",
  ".evidence-missing { display:grid; place-items:center; align-content:center; min-height:340px; padding:28px; background:repeating-linear-gradient(135deg,#e8e5dc,#e8e5dc 12px,#dcd9cf 12px,#dcd9cf 24px); text-align:center; }",
  ".evidence-missing strong { font:500 34px Georgia,serif; }",
  ".evidence-missing span { max-width:60ch; margin-top:8px; color:var(--muted); }",
  ".annotation-pin,.annotation-box { position:absolute; z-index:2; border:3px solid var(--danger); color:white; }",
  ".annotation-pin { width:28px; height:28px; margin:-14px 0 0 -14px; border-radius:50%; background:var(--danger); box-shadow:0 0 0 4px rgba(255,255,255,.82); }",
  ".annotation-box { min-width:28px; min-height:28px; background:rgba(255,94,73,.035); box-shadow:0 0 0 2px rgba(255,255,255,.82); }",
  ".annotation-pin b,.annotation-box b { position:absolute; top:-14px; left:-14px; display:grid; place-items:center; width:28px; height:28px; border-radius:50%; background:var(--danger); font:800 12px Arial,sans-serif; }",
  ".annotation-box.label-inset-left b { left:3px; }",
  ".annotation-box.label-inset-top b { top:3px; }",
  ".annotation-pin.label-inset-left { margin-left:0; }",
  ".annotation-pin.label-inset-left b { left:0; }",
  ".annotation-pin.label-inset-top { margin-top:0; }",
  ".annotation-pin.label-inset-top b { top:0; }",
  ".annotation-pin.label-inset-right { margin-left:-28px; }",
  ".annotation-pin.label-inset-bottom { margin-top:-28px; }",
  ".tone-warning { border-color:var(--amber); }",
  ".annotation-box.tone-warning { background:rgba(240,173,50,.035); }",
  ".annotation-pin.tone-warning,.tone-warning b { background:var(--amber); color:var(--ink); }",
  ".tone-proposal { border-color:var(--blue); }",
  ".annotation-box.tone-proposal { background:rgba(57,119,246,.035); }",
  ".annotation-pin.tone-proposal,.tone-proposal b { background:var(--blue); }",
  ".tone-note { border-color:var(--ink); }",
  ".annotation-box.tone-note { background:rgba(18,19,15,.025); }",
  ".annotation-pin.tone-note,.tone-note b { background:var(--ink); }",
  ".annotation-legend { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1px; margin:0; padding:0; border-top:1px solid var(--line); list-style:none; background:var(--line); }",
  ".annotation-legend li { display:grid; grid-template-columns:30px 1fr; gap:12px; padding:15px; background:var(--sheet); }",
  ".annotation-legend li b { display:grid; place-items:center; width:26px; height:26px; border-radius:50%; background:var(--danger); color:white; font-size:11px; }",
  ".annotation-legend li strong { display:block; margin-bottom:3px; font-size:12px; letter-spacing:.08em; line-height:1.25; text-transform:uppercase; }",
  ".annotation-legend li span { display:block; }",
  ".annotation-legend li > div { min-width:0; }",
  ".annotation-legend li:last-child:nth-child(odd) { grid-column:1 / -1; }",
  ".annotation-legend li:last-child:nth-child(odd) > div { display:grid; grid-template-columns:minmax(230px,.42fr) minmax(0,1fr); grid-template-rows:auto auto 1fr; column-gap:20px; align-items:start; }",
  ".annotation-legend li:last-child:nth-child(odd) > div > strong { grid-column:1; grid-row:1; }",
  ".annotation-legend li:last-child:nth-child(odd) > div > span:not(.loupe-label) { grid-column:1; grid-row:2 / 4; }",
  ".annotation-legend li:last-child:nth-child(odd) > div > .loupe-label { grid-column:2; grid-row:1; margin-top:0; }",
  ".annotation-legend li:last-child:nth-child(odd) > div > .annotation-loupe { grid-column:2; grid-row:2 / 4; }",
  ".loupe-label { margin-top:12px; color:var(--muted); font:800 10px ui-monospace,Consolas,monospace; letter-spacing:.11em; text-transform:uppercase; }",
  ".annotation-loupe { display:block; width:100%; height:auto; margin-top:5px; overflow:hidden; border:1px solid currentColor; background:#d9d7cf; color:var(--danger); isolation:isolate; }",
  ".annotation-loupe .loupe-target { fill:rgba(255,255,255,.08); stroke:currentColor; stroke-width:3; vector-effect:non-scaling-stroke; }",
  ".annotation-loupe.tone-warning { color:var(--amber); }",
  ".annotation-loupe.tone-proposal { color:var(--blue); }",
  ".annotation-loupe.tone-note { color:var(--ink); }",
  ".annotation-legend li.tone-warning b { background:var(--amber); color:var(--ink); }",
  ".annotation-legend li.tone-proposal b { background:var(--blue); }",
  ".annotation-legend li.tone-note b { background:var(--ink); }",
  ".evidence-caption,.no-annotations,.asset-note { margin:0; padding:14px 16px; border-top:1px solid var(--line); }",
  ".no-annotations,.asset-note { color:var(--muted); font-size:12px; }",
  ".asset-note { padding-top:7px; padding-bottom:7px; font-family:ui-monospace,Consolas,monospace; }",
  ".finding-list { display:grid; gap:28px; }",
  ".finding { border:1px solid var(--ink); background:var(--sheet); }",
  ".finding > header { display:grid; grid-template-columns:105px minmax(0,1fr) auto; gap:18px; align-items:center; padding:16px; border-bottom:1px solid var(--ink); }",
  ".finding > header > div { display:flex; gap:6px; }",
  ".finding > header span { padding:3px 7px; border:1px solid var(--ink); font:700 11px ui-monospace,Consolas,monospace; text-transform:uppercase; }",
  ".finding > header h3 { margin:0; font-size:22px; line-height:1.15; }",
  ".finding > header a { font-size:12px; font-weight:700; }",
  ".finding.severity-blocker,.finding.severity-p1 { border-left:9px solid var(--danger); }",
  ".finding.severity-p2 { border-left:9px solid var(--amber); }",
  ".finding.severity-p3,.finding.severity-info { border-left:9px solid var(--blue); }",
  ".finding-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1px; background:var(--line); }",
  ".finding-grid > div { min-height:150px; padding:19px; background:var(--sheet); }",
  ".finding-grid p { margin:0; }",
  ".finding-grid .solution { background:var(--ink); color:white; }",
  ".finding-grid .solution span { color:var(--acid); }",
  ".earned-roast { margin:0; padding:16px 19px; border-top:1px solid var(--ink); font-family:Georgia,Times,serif; font-size:18px; font-style:italic; }",
  ".earned-roast span { margin-right:10px; color:var(--danger); font:800 10px Arial,sans-serif; letter-spacing:.12em; text-transform:uppercase; }",
  ".direction-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }",
  ".direction { min-height:360px; padding:20px; border:1px solid var(--ink); background:var(--sheet); }",
  ".direction-selected { box-shadow:8px 8px 0 var(--acid); }",
  ".direction-rejected { color:#55574f; border-color:var(--line); }",
  ".direction header { display:flex; justify-content:space-between; font:700 11px ui-monospace,Consolas,monospace; text-transform:uppercase; }",
  ".direction header b { padding:3px 7px; background:var(--ink); color:white; }",
  ".direction-selected header b { background:var(--acid); color:var(--ink); }",
  ".direction h3 { margin:44px 0 12px; font:500 31px/1 Georgia,serif; }",
  ".direction dl { margin:28px 0 0; padding-top:15px; border-top:1px solid var(--line); }",
  ".direction dt { color:var(--muted); font-size:10px; font-weight:800; letter-spacing:.13em; text-transform:uppercase; }",
  ".direction dd { margin:5px 0 0; }",
  ".action-list { margin:0; padding:0; list-style:none; border-top:2px solid var(--ink); }",
  ".action-list li { display:grid; grid-template-columns:90px minmax(0,1fr); gap:20px; padding:24px 0; border-bottom:1px solid var(--line); }",
  ".action-list li > span { font:500 42px/.9 Georgia,serif; }",
  ".action-list h3 { margin:0 0 7px; font-size:21px; }",
  ".action-list p { max-width:78ch; margin:0; }",
  ".proof-target { margin-top:11px !important; color:var(--muted); font-size:13px; }",
  ".proof-target b { color:var(--ink); text-transform:uppercase; letter-spacing:.08em; }",
  ".string-cards { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }",
  ".string-cards > div { display:grid; grid-template-columns:34px 1fr; gap:12px; min-height:120px; padding:18px; border:1px solid var(--ink); background:var(--sheet); }",
  ".string-cards span { color:var(--green); font:700 12px ui-monospace,Consolas,monospace; }",
  ".string-cards p { margin:0; }",
  ".table-wrap { overflow-x:auto; border:1px solid var(--ink); background:var(--sheet); }",
  "table { width:100%; border-collapse:collapse; min-width:760px; }",
  "th,td { padding:14px; border-bottom:1px solid var(--line); text-align:left; vertical-align:top; }",
  "thead th { background:var(--ink); color:white; font-size:11px; letter-spacing:.12em; text-transform:uppercase; }",
  "tbody th { width:22%; }",
  ".proof-state { display:inline-block; min-width:72px; padding:3px 7px; background:var(--muted); color:white; font-size:10px; font-weight:800; text-align:center; text-transform:uppercase; }",
  ".state-passed { background:var(--green); }",
  ".state-failed,.state-blocked { background:var(--danger); }",
  ".state-n-a { background:var(--muted); }",
  ".risk-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; }",
  ".risk-grid section { padding:19px; border-top:7px solid var(--danger); background:var(--sheet); }",
  ".risk-grid h3 { margin:0 0 16px; font-size:18px; }",
  ".risk-grid ul { margin:0; padding-left:18px; }",
  ".risk-grid li + li { margin-top:9px; }",
  "footer { display:flex; justify-content:space-between; gap:20px; padding:18px 32px; background:var(--ink); color:white; font-size:11px; letter-spacing:.09em; text-transform:uppercase; }",
  "@media (max-width:900px) { :root{--rail:0px;} .report-shell{display:block;} .report-nav{display:none;} .header-grid{grid-template-columns:1fr;margin-top:40px;} .context-grid,.direction-grid{grid-template-columns:repeat(2,minmax(0,1fr));} .risk-grid{grid-template-columns:1fr;} }",
  "@media (max-width:640px) { .report-header{padding:18px 18px 26px;} h1{font-size:50px;} .dossier-section{padding:44px 18px 56px;} .section-kicker{top:48px;right:18px;font-size:44px;} .section-heading{padding-right:62px;} .summary-stack,.context-grid,.finding-grid,.direction-grid,.string-cards,.annotation-legend{grid-template-columns:1fr;} .annotation-legend li:last-child:nth-child(odd)>div{display:block;} .evidence-card{box-shadow:5px 5px 0 var(--ink);} .evidence-card figcaption{align-items:flex-start;flex-direction:column;} .evidence-tags{justify-content:flex-start;} .finding>header{grid-template-columns:1fr;} .action-list li{grid-template-columns:52px 1fr;} footer{flex-direction:column;padding:18px;} }",
  "@media print { html{background:white;} body::before,.report-nav,.skip-link{display:none;} .report-shell{display:block;} .report-header,.dossier-section{break-inside:avoid;} .evidence-card,.finding,.direction,table{break-inside:avoid;} .report-header{padding:18mm 14mm;} .dossier-section{padding:12mm 14mm;} .section-kicker{right:14mm;} footer{background:white;color:var(--ink);border-top:1px solid var(--ink);} }",
  "@media (prefers-reduced-motion:reduce) { html{scroll-behavior:auto;} }",
].join("\n");

const directRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (directRun) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log(usage());
    } else {
      if (!options.manifestPath) throw new Error("Missing --manifest");
      const result = generateDesignReport(options);
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error("Design report failed: " + error.message);
    console.error(usage());
    process.exitCode = 2;
  }
}
