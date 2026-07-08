#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const severityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
const root = findRepoRoot();
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const detectorPath = path.join(scriptDir, "detect-ui-antipatterns.mjs");
const options = parseArgs(process.argv.slice(2));

if (!options.path && !options.url) {
  usage();
  process.exit(2);
}

const slug = options.slug || slugify(options.url || options.path || "review");
const outDir = path.resolve(options.out || path.join(root, "output", "improve-ui", slug));
const screenshotsDir = path.join(outDir, "screenshots");
fs.mkdirSync(screenshotsDir, { recursive: true });

const review = {
  reviewedAt: new Date().toISOString(),
  cwd: process.cwd(),
  target: {
    path: options.path ? path.relative(root, path.resolve(options.path)) : null,
    url: options.url || null,
  },
  ledger: {
    context: {
      register: options.register || "unknown",
      surface: options.surface || "unknown",
      viewports: options.viewports,
      states: options.states.length ? options.states : ["default"],
    },
    evidence: [],
    changeAmbition: options.ambition || "unknown",
    blockers: [],
  },
  static: null,
  runtime: null,
  findings: [],
  score: null,
  gates: [],
};

if (options.path) runStaticReview(review);
if (options.url) review.runtime = await runRuntimeReview(review);

review.findings = collectFindings(review);
review.gates = evaluateGates(review);
review.score = scoreReview(review);

const jsonPath = path.join(outDir, "review.json");
const markdownPath = path.join(outDir, "README.md");
fs.writeFileSync(jsonPath, `${JSON.stringify(review, null, 2)}\n`);
fs.writeFileSync(markdownPath, renderMarkdown(review, jsonPath));

const summary = {
  outDir: path.relative(root, outDir),
  findings: review.findings.length,
  bySeverity: summarizeSeverity(review.findings),
  score: review.score,
  gates: review.gates,
  blockers: review.ledger.blockers,
};
console.log(JSON.stringify(summary, null, 2));

if (options.failOn && review.findings.some((finding) => severityRank[finding.severity] <= severityRank[options.failOn])) {
  process.exitCode = 1;
}
if (options.fail && review.gates.some((gate) => gate.status === "fail")) {
  process.exitCode = 1;
}

function runStaticReview(targetReview) {
  const staticPath = path.join(outDir, "static-findings.json");
  const args = [detectorPath, "--json", "--out", staticPath, options.path];
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    targetReview.ledger.blockers.push({
      gate: "static-detector",
      reason: result.stderr || result.stdout || `detector exited ${result.status}`,
    });
    return;
  }
  targetReview.static = JSON.parse(fs.readFileSync(staticPath, "utf8"));
  targetReview.ledger.evidence.push({
    type: "static-detector",
    path: path.relative(root, staticPath),
    findings: targetReview.static.findings.length,
  });
}

async function runRuntimeReview(targetReview) {
  const playwright = loadPlaywright();
  if (!playwright) {
    targetReview.ledger.blockers.push({
      gate: "runtime-visual",
      reason: "Playwright not found. Install Playwright in the target project, set PLAYWRIGHT_PATH, or use temp runtime at %TEMP%/improve-ui-playwright.",
    });
    return null;
  }

  const actions = loadActions(options.actions);
  const browser = await playwright.chromium.launch({ headless: true });
  const results = [];
  try {
    for (const viewport of options.viewports) {
      results.push(await inspectViewport(browser, viewport, actions));
    }
  } finally {
    await browser.close();
  }

  const runtimePath = path.join(outDir, "runtime-findings.json");
  const runtime = {
    url: options.url,
    actions: actions.map((action) => sanitizeAction(action)),
    results,
  };
  fs.writeFileSync(runtimePath, `${JSON.stringify(runtime, null, 2)}\n`);
  targetReview.ledger.evidence.push({
    type: "runtime-visual",
    path: path.relative(root, runtimePath),
    screenshots: results.map((result) => result.screenshot).filter(Boolean),
  });
  return runtime;
}

async function inspectViewport(browser, viewport, actions) {
  const page = await browser.newPage({ viewport });
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

  try {
    await page.goto(options.url, { waitUntil: "networkidle", timeout: options.timeout });
    await page.waitForTimeout(250);
    for (const action of actions) await applyAction(page, action);
    await page.waitForTimeout(250);

    const suffix = `${viewport.width}x${viewport.height}`;
    const screenshotPath = path.join(screenshotsDir, `${suffix}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    const metrics = await page.evaluate(() => {
      const visible = (node) => {
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return rect.width > 1 && rect.height > 1 && style.display !== "none" && style.visibility !== "hidden";
      };
      const interactive = [...document.querySelectorAll("button, a, input, select, textarea, [role='button'], [tabindex]:not([tabindex='-1'])")].filter(visible);
      const smallHitAreas = interactive
        .map((node) => {
          const rect = node.getBoundingClientRect();
          const name = node.getAttribute("aria-label") || node.textContent?.trim() || node.getAttribute("title") || node.getAttribute("name") || node.id || node.tagName.toLowerCase();
          return { name: String(name).slice(0, 80), width: Math.round(rect.width), height: Math.round(rect.height) };
        })
        .filter((item) => item.width < 40 || item.height < 40)
        .slice(0, 12);
      const unnamedButtons = [...document.querySelectorAll("button")]
        .filter(visible)
        .filter((button) => {
          const name = button.getAttribute("aria-label") || button.getAttribute("aria-labelledby") || button.getAttribute("title") || button.textContent?.trim();
          return !name;
        })
        .length;
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
        .filter((img) => !img.widthAttr || !img.heightAttr || !img.alt || img.naturalWidth === 0)
        .slice(0, 12);
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
        unnamedButtons,
        clippedText,
        imageIssues,
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

    return {
      viewport,
      screenshot: path.relative(root, screenshotPath),
      ok: true,
      transferredBytes,
      consoleErrors,
      requestFailures,
      badResponses,
      metrics,
      findings: runtimeFindings(viewport, metrics, consoleErrors, requestFailures, badResponses),
    };
  } catch (error) {
    const suffix = `${viewport.width}x${viewport.height}-error`;
    const screenshotPath = path.join(screenshotsDir, `${suffix}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
    return {
      viewport,
      screenshot: fs.existsSync(screenshotPath) ? path.relative(root, screenshotPath) : null,
      ok: false,
      transferredBytes,
      consoleErrors,
      requestFailures,
      badResponses,
      metrics: null,
      findings: [
        {
          id: "runtime-audit-error",
          category: "runtime",
          severity: "P1",
          message: `Runtime audit failed: ${error.message}`,
          file: options.url,
          line: 0,
          snippet: error.message,
        },
      ],
    };
  } finally {
    await page.close();
  }
}

function runtimeFindings(viewport, metrics, consoleErrors, requestFailures, badResponses) {
  const file = `${options.url} @ ${viewport.width}x${viewport.height}`;
  const findings = [];
  const push = (id, severity, category, message, snippet) => {
    findings.push({ id, severity, category, message, file, line: 0, snippet: String(snippet).slice(0, 180) });
  };

  if (consoleErrors.length) push("console-errors", "P1", "runtime", "Console errors appeared in audited state.", consoleErrors[0]);
  if (requestFailures.length) push("request-failures", "P1", "runtime", "Network requests failed in audited state.", requestFailures[0]);
  if (badResponses.length) push("bad-http-responses", "P1", "runtime", "HTTP error responses appeared in audited state.", badResponses[0]);
  if (metrics.horizontalOverflow) push("horizontal-overflow", "P1", "resilience", "Viewport has horizontal overflow.", `scrollWidth ${metrics.scrollWidth} > innerWidth ${metrics.width}`);
  if (metrics.unnamedButtons) push("unnamed-buttons", "P1", "accessibility", "Visible buttons without accessible names.", `${metrics.unnamedButtons} unnamed button(s)`);
  if (metrics.smallHitAreas.length) push("small-hit-area", "P2", "accessibility", "Visible controls below 40px hit-area floor.", JSON.stringify(metrics.smallHitAreas[0]));
  if (metrics.clippedText.length) push("clipped-text", "P2", "resilience", "Text appears clipped or horizontally overflowing.", JSON.stringify(metrics.clippedText[0]));
  if (metrics.imageIssues.length) push("runtime-image-issues", "P2", "performance", "Visible images have missing alt/dimensions or broken natural size.", JSON.stringify(metrics.imageIssues[0]));
  if (metrics.animationAudit?.offscreenRunningCount) push("offscreen-running-animation", "P2", "performance", "Animations are running outside the viewport; pause offscreen decorative motion.", JSON.stringify(metrics.animationAudit.offscreenRunning[0]));
  const activeOffscreenCanvas = (metrics.canvasDetails || []).find((canvas) => !canvas.visible && /^(true|1|running|active)$/i.test(String(canvas.animationActive || "")));
  if (activeOffscreenCanvas) push("offscreen-active-canvas", "P2", "performance", "Canvas/WebGL region is marked active outside the viewport; pause or lower work offscreen.", JSON.stringify(activeOffscreenCanvas));
  if (metrics.longTasks.length) push("long-task", "P1", "performance", "Long tasks occurred during audited state.", `${metrics.longTasks.length} long task(s)`);
  if (metrics.frameStats.p95 > 20) push("frame-p95-budget", "P2", "performance", "Frame p95 exceeds 20ms budget.", `${metrics.frameStats.p95}ms`);
  if (metrics.frameStats.max > 50) push("frame-max-budget", "P2", "performance", "Frame max exceeds 50ms budget.", `${metrics.frameStats.max}ms`);
  if (metrics.cls > 0) push("layout-shift", "P1", "performance", "Unexpected layout shift occurred.", `CLS ${metrics.cls.toFixed(4)}`);

  return findings;
}

async function applyAction(page, action) {
  const timeout = action.timeout || 5000;
  if (action.type === "click") await page.click(action.selector, { timeout });
  else if (action.type === "hover") await page.hover(action.selector, { timeout });
  else if (action.type === "type") await page.fill(action.selector, action.value || "", { timeout });
  else if (action.type === "press") await page.press(action.selector || "body", action.key, { timeout });
  else if (action.type === "scroll") await page.mouse.wheel(action.x || 0, action.y || 600);
  else if (action.type === "wait") await page.waitForTimeout(action.ms || 250);
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

function scoreReview(targetReview) {
  const dimensions = {
    accessibility: 4,
    performance: 4,
    themingDesignSystem: 4,
    responsiveContent: 4,
    antiSlop: 4,
  };

  for (const finding of targetReview.findings) {
    const cap = finding.severity === "P1" ? 1 : finding.severity === "P2" ? 2 : 3;
    if (finding.category === "accessibility") dimensions.accessibility = Math.min(dimensions.accessibility, cap);
    if (finding.category === "performance" || finding.category === "runtime" || finding.category === "motion") dimensions.performance = Math.min(dimensions.performance, cap);
    if (finding.category === "design-system" || finding.category === "quality") dimensions.themingDesignSystem = Math.min(dimensions.themingDesignSystem, cap);
    if (finding.category === "resilience") dimensions.responsiveContent = Math.min(dimensions.responsiveContent, cap);
    if (finding.category === "slop") dimensions.antiSlop = Math.min(dimensions.antiSlop, cap);
  }

  const failedGates = (targetReview.gates || []).filter((gate) => gate.status === "fail");
  const blockedEvidenceGates = failedGates.filter((gate) => gate.gate !== "p1-unresolved");
  for (const gate of failedGates) {
    if (gate.gate === "static-detector") {
      dimensions.performance = Math.min(dimensions.performance, 2);
      dimensions.themingDesignSystem = Math.min(dimensions.themingDesignSystem, 2);
      dimensions.responsiveContent = Math.min(dimensions.responsiveContent, 2);
      dimensions.antiSlop = Math.min(dimensions.antiSlop, 2);
    }
    if (gate.gate === "runtime-visual") {
      dimensions.accessibility = Math.min(dimensions.accessibility, 2);
      dimensions.performance = Math.min(dimensions.performance, 2);
      dimensions.responsiveContent = Math.min(dimensions.responsiveContent, 2);
      dimensions.antiSlop = Math.min(dimensions.antiSlop, 2);
    }
    if (gate.gate === "async-state-coverage") {
      dimensions.responsiveContent = Math.min(dimensions.responsiveContent, 1);
    }
  }

  const total = Object.values(dimensions).reduce((sum, value) => sum + value, 0);
  return {
    dimensions,
    total,
    verdict: blockedEvidenceGates.length
      ? "blocked"
      : total >= 18
        ? "excellent"
        : total >= 14
          ? "good"
          : total >= 10
            ? "acceptable"
            : total >= 6
              ? "poor"
              : "critical",
    blockedGates: blockedEvidenceGates.map((gate) => gate.gate),
  };
}

function evaluateGates(targetReview) {
  const gates = [];
  const p1 = targetReview.findings.filter((finding) => finding.severity === "P1");
  gates.push({
    gate: "p1-unresolved",
    status: p1.length ? "fail" : "pass",
    detail: p1.length ? `${p1.length} P1 finding(s)` : "no P1 findings",
  });
  gates.push({
    gate: "static-detector",
    status: options.path ? (targetReview.static ? "pass" : "fail") : "skip",
    detail: options.path ? (targetReview.static ? "detector output captured" : "detector blocked") : "no local path",
  });
  gates.push({
    gate: "runtime-visual",
    status: options.url ? (targetReview.runtime ? "pass" : "fail") : "skip",
    detail: options.url ? (targetReview.runtime ? "screenshots/runtime captured" : "runtime blocked") : "no URL",
  });
  if (options.asyncUi) {
    const expected = ["empty", "loading", "error", "permission", "long-content", "slow-network", "rapid-click"];
    const missing = expected.filter((state) => !options.states.includes(state));
    gates.push({
      gate: "async-state-coverage",
      status: missing.length ? "fail" : "pass",
      detail: missing.length ? `missing ${missing.join(", ")}` : "all async states listed",
    });
  }
  return gates;
}

function renderMarkdown(targetReview, jsonPath) {
  const lines = [
    "# Interface Review",
    "",
    `Generated: ${targetReview.reviewedAt}`,
    `Target path: ${targetReview.target.path || "n/a"}`,
    `Target URL: ${targetReview.target.url || "n/a"}`,
    `Review JSON: ${path.relative(root, jsonPath)}`,
    "",
    `Score: accessibility/performance/theming/responsive/anti-slop = ${targetReview.score.dimensions.accessibility}/${targetReview.score.dimensions.performance}/${targetReview.score.dimensions.themingDesignSystem}/${targetReview.score.dimensions.responsiveContent}/${targetReview.score.dimensions.antiSlop}, total ${targetReview.score.total}/20`,
    `Verdict: ${targetReview.score.verdict}`,
    "",
    "Ledger:",
    `- register: ${targetReview.ledger.context.register}`,
    `- surface: ${targetReview.ledger.context.surface}`,
    `- ambition: ${targetReview.ledger.changeAmbition}`,
    `- evidence: ${targetReview.ledger.evidence.map((item) => item.path || item.type).join(", ") || "none"}`,
    `- blockers: ${targetReview.ledger.blockers.map((item) => `${item.gate}: ${item.reason}`).join("; ") || "none"}`,
    "",
    "Gates:",
    ...targetReview.gates.map((gate) => `- ${gate.gate}: ${gate.status} - ${gate.detail}`),
    "",
    "Findings:",
  ];

  if (!targetReview.findings.length) {
    lines.push("- no findings");
  } else {
    for (const finding of targetReview.findings.slice(0, 40)) {
      lines.push(`- [${finding.severity}] ${finding.id} ${finding.file}:${finding.line} - ${finding.message}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function loadPlaywright() {
  const candidates = [
    path.join(root, "node_modules", "playwright"),
    path.join(process.cwd(), "node_modules", "playwright"),
    process.env.PLAYWRIGHT_PATH,
    process.env.PLAYWRIGHT_NODE_MODULES ? path.join(process.env.PLAYWRIGHT_NODE_MODULES, "playwright") : null,
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

function loadActions(file) {
  if (!file) return [];
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  return Array.isArray(data) ? data : data.actions || [];
}

function sanitizeAction(action) {
  return {
    type: action.type,
    selector: action.selector,
    key: action.key,
    ms: action.ms,
    x: action.x,
    y: action.y,
  };
}

function parseArgs(args) {
  const options = {
    path: null,
    url: null,
    out: null,
    slug: null,
    actions: null,
    failOn: null,
    fail: false,
    timeout: 15000,
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
    const [name, inlineValue] = arg.split("=", 2);
    const nextValue = () => inlineValue ?? args[++i];

    if (name === "--path") options.path = nextValue();
    else if (name === "--url") options.url = nextValue();
    else if (name === "--out") options.out = nextValue();
    else if (name === "--slug") options.slug = nextValue();
    else if (name === "--actions") options.actions = nextValue();
    else if (name === "--fail-on") options.failOn = normalizeSeverity(nextValue());
    else if (arg === "--fail") options.fail = true;
    else if (name === "--timeout") options.timeout = Number(nextValue());
    else if (name === "--register") options.register = nextValue();
    else if (name === "--surface") options.surface = nextValue();
    else if (name === "--ambition") options.ambition = nextValue();
    else if (arg === "--async-ui") options.asyncUi = true;
    else if (name === "--states") options.states = nextValue().split(",").map((state) => state.trim()).filter(Boolean);
    else if (name === "--viewport") {
      if (!options.customViewports) {
        options.viewports = [];
        options.customViewports = true;
      }
      options.viewports.push(parseViewport(nextValue()));
    }
    else if (arg.startsWith("--")) {
      console.error(`Unknown option: ${arg}`);
      process.exit(2);
    } else if (!options.path) {
      options.path = arg;
    }
  }

  if (!options.viewports.length) {
    options.viewports = [
      { width: 1280, height: 800 },
      { width: 390, height: 844 },
    ];
  }

  delete options.customViewports;
  return options;
}

function parseViewport(value) {
  const match = String(value).match(/^(\d+)x(\d+)$/);
  if (!match) {
    console.error(`Invalid --viewport ${value}; expected WIDTHxHEIGHT`);
    process.exit(2);
  }
  return { width: Number(match[1]), height: Number(match[2]) };
}

function normalizeSeverity(value) {
  const severity = String(value || "").toUpperCase();
  if (!Object.hasOwn(severityRank, severity)) {
    console.error(`Invalid --fail-on ${value}; expected P0, P1, P2, or P3`);
    process.exit(2);
  }
  return severity;
}

function summarizeSeverity(findings) {
  return findings.reduce((acc, finding) => {
    acc[finding.severity] = (acc[finding.severity] || 0) + 1;
    return acc;
  }, {});
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

function usage() {
  console.error("Usage: node run-interface-review.mjs --path <file-or-dir> [--url <local-url>] [--out <dir>] [--actions actions.json] [--viewport 1280x800] [--fail-on=P1|P2|P3] [--fail]");
}
