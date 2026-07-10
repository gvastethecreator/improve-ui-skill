#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const VALID_EXT = new Set([
  ".astro",
  ".cjs",
  ".cts",
  ".css",
  ".html",
  ".js",
  ".jsx",
  ".less",
  ".mdx",
  ".mjs",
  ".mts",
  ".sass",
  ".scss",
  ".svelte",
  ".svg",
  ".ts",
  ".tsx",
  ".vue",
]);

const SKIP_DIRS = new Set([
  ".git",
  ".next",
  ".nuxt",
  ".output",
  ".svelte-kit",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "vendor",
]);

const severityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
const classifications = new Set(["objective", "advisory"]);
const confidenceLevels = new Set(["high", "medium", "low"]);
let cachedLineSource = null;
let cachedLineStarts = [0];
const RULES = rules();
validateRuleCatalog(RULES);
const rawArgs = process.argv.slice(2);
if (rawArgs.includes("--help") || rawArgs.includes("-h")) {
  usage(process.stdout);
  process.exit(0);
}
const { options, targets } = parseArgs(rawArgs);

if (!targets.length && !options.changedOnly) {
  usage();
  process.exit(2);
}

for (const target of targets) {
  const resolvedTarget = path.resolve(target);
  if (!fs.existsSync(resolvedTarget)) {
    console.error(`Scan target does not exist: ${target}`);
    process.exit(2);
  }
}

const scanTargets = targets.length ? targets.map((target) => path.resolve(target)) : [process.cwd()];
const pathBase = determinePathBase(scanTargets);
validateProtectedOutputInput(options.out, options.baseline, "--baseline");
validateProtectedOutputInput(options.out, options.allowlist, "--allowlist");
const allowlist = loadFindingMultiset(options.allowlist);
const baseline = loadFindingMultiset(options.baseline);
const changedFiles = options.changedOnly ? new Set(gitChangedFiles(scanTargets)) : null;
const files = [];
const visitedDirectories = new Set();

for (const target of scanTargets) {
  collectFiles(target, files, changedFiles, visitedDirectories);
}

const scanFiles = [...new Map(files.map((file) => [normalizeAbsolutePath(file), file])).values()].sort();

if (!scanFiles.length) {
  console.error("No supported files found in the requested scan targets.");
  process.exit(2);
}

validateOutputPath(options.out, scanFiles);

const findings = [];
for (const file of scanFiles) {
  const text = fs.readFileSync(file, "utf8");
  findings.push(...runPatternRules(file, text));
  findings.push(...runFileRules(file, text));
}

const filtered = assignFingerprints(uniqueFindings(findings))
  .filter((finding) => !options.category || finding.category === options.category || finding.id === options.category)
  .filter((finding) => !consumeFinding(allowlist, finding))
  .filter((finding) => !consumeFinding(baseline, finding));

const payload = {
  scannedAt: new Date().toISOString(),
  cwd: process.cwd(),
  pathBase: { kind: pathBase.kind, path: pathBase.path ? normalizePath(pathBase.path) : null },
  files: scanFiles.length,
  targets,
  options: publicOptions(options),
  findings: filtered,
  summary: summarize(filtered),
};

const rendered = render(payload, options.format);
if (options.out) {
  fs.mkdirSync(path.dirname(path.resolve(options.out)), { recursive: true });
  fs.writeFileSync(options.out, rendered);
} else {
  process.stdout.write(rendered);
}

if (
  options.failOn &&
  filtered.some(
    (finding) =>
      (finding.classification === "objective" || options.includeAdvisory) &&
      severityRank[finding.severity] <= severityRank[options.failOn],
  )
) {
  process.exitCode = 1;
}

function rules() {
  return [
    {
      id: "gradient-text",
      category: "slop",
      severity: "P2",
      message: "Gradient text is usually decorative; use solid text color unless the brand system requires it.",
      patterns: [
        /\bbg-clip-text\b[\s\S]{0,180}\bbg-gradient-to-/gi,
        /background-clip\s*:\s*text[\s\S]{0,180}(?:linear|radial)-gradient/gi,
      ],
    },
    {
      id: "side-stripe-border",
      category: "slop",
      severity: "P2",
      message: "Thick one-sided accent borders read as generated UI. Prefer full borders, tints, icons, or simpler structure.",
      patterns: [
        /border-(?:left|right)(?:-width)?\s*:\s*(?:[2-9]|\d{2,})px/gi,
        /\bborder-[lr]-(?:2|4|8|\[(?:[2-9]|\d{2,})px\])/gi,
      ],
    },
    {
      id: "purple-blue-gradient",
      category: "slop",
      severity: "P2",
      message: "Purple/blue/cyan gradients are a common generated palette reflex. Pick a palette from the brand or scene.",
      patterns: [
        /\bfrom-(?:purple|violet|indigo)-\d+\b[\s\S]{0,160}\bto-(?:blue|cyan|sky|pink|fuchsia|purple|violet|indigo)-\d+\b/gi,
        /linear-gradient\([^;\n]*(?:purple|violet|indigo)[^;\n]*(?:blue|cyan|pink|fuchsia)/gi,
      ],
    },
    {
      id: "cream-surface",
      category: "slop",
      severity: "P2",
      message: "Cream/beige/paper surfaces are a common safe default. Confirm the palette is intentional.",
      patterns: [
        /--(?:paper|cream|sand|bone|flour|linen|parchment|wheat|biscuit|ivory)\b/gi,
        /\b(?:bg|background(?:-color)?)\s*[:=][^;\n]*(?:cream|sand|beige|linen|ivory|parchment)/gi,
        /oklch\(\s*(?:0\.(?:8[4-9]|9\d)|(?:8[4-9]|9\d)%)[,\s]+0\.0[0-6][,\s]+(?:[4-9]\d|100)/gi,
      ],
    },
    {
      id: "nested-card-copy",
      category: "slop",
      severity: "P3",
      message: "Likely card nesting. Verify whether hierarchy can be flattened with spacing, dividers, or typography.",
      patterns: [
        /class(?:Name)?=["'][^"']*(?:card|panel|surface)[^"']*["'][\s\S]{0,900}class(?:Name)?=["'][^"']*(?:card|panel|surface)[^"']*["']/gi,
      ],
    },
    {
      id: "icon-tile-stack",
      category: "slop",
      severity: "P2",
      message: "Rounded icon tile above heading is a generated feature-card template. Use a more specific layout.",
      patterns: [
        /(?:rounded-(?:xl|2xl|3xl)|border-radius\s*:\s*(?:1[2-9]|[2-9]\d)px)[\s\S]{0,260}(?:<svg|\bIcon\b)[\s\S]{0,360}<h[1-4]\b/gi,
      ],
    },
    {
      id: "oversized-radius",
      category: "slop",
      severity: "P2",
      message: "Very large radii on cards/panels/inputs often look soft and generic. Keep big radii for pills only.",
      patterns: [
        /border-radius\s*:\s*(?:3[2-9]|[4-9]\d)px/gi,
        /\brounded-\[(?:3[2-9]|[4-9]\d)px\]|\brounded-3xl\b|\brounded-\[2rem\]/gi,
      ],
    },
    {
      id: "wide-shadow-border",
      category: "slop",
      severity: "P3",
      message: "Hairline border plus wide shadow is a common generated-card recipe. Prefer one elevation model.",
      patterns: [
        /border\s*:\s*1px[^;\n]*;[\s\S]{0,220}box-shadow\s*:[^;\n]*(?:1[6-9]|[2-9]\d)px/gi,
        /box-shadow\s*:[^;\n]*(?:1[6-9]|[2-9]\d)px[^;\n]*;[\s\S]{0,220}border\s*:\s*1px/gi,
      ],
    },
    {
      id: "repeating-stripes",
      category: "slop",
      severity: "P3",
      message: "Repeating stripe gradients are usually decorative filler. Use a real texture or simplify.",
      patterns: [/repeating-linear-gradient\(/gi],
    },
    {
      id: "glass-default",
      category: "slop",
      severity: "P2",
      message: "Glass blur should be rare and purposeful, not the default surface treatment.",
      patterns: [/\bbackdrop-blur\b|backdrop-filter\s*:\s*blur\(/gi],
    },
    {
      id: "heavy-blur-effect",
      category: "performance",
      severity: "P2",
      message: "20px+ blur is expensive and should be a functional material/crossfade choice with runtime proof.",
      patterns: [
        /(?:filter|backdrop-filter|backdropFilter)\s*:?\s*["']?[^;"'\n]*blur\(\s*(?:2\d|[3-9]\d|\d{3,})px\s*\)/gi,
        /\b(?:blur|backdrop-blur)-\[(?:2\d|[3-9]\d|\d{3,})px\]/gi,
      ],
    },
    {
      id: "hero-eyebrow",
      category: "slop",
      severity: "P3",
      message: "Tiny uppercase/tracked eyebrow labels above heroes or every section can read as scaffolded.",
      patterns: [
        /(?:uppercase|text-transform\s*:\s*uppercase)[\s\S]{0,160}(?:tracking-(?:wide|wider|widest)|letter-spacing\s*:\s*(?:[2-9]px|0\.[1-9]em))/gi,
      ],
    },
    {
      id: "bounce-easing",
      category: "slop",
      severity: "P2",
      message: "Bounce, wobble, elastic, or strong overshoot easing should be rare and context-specific.",
      patterns: [
        /\banimate-bounce\b|\b(?:bounce|elastic|wobble|jiggle)\b/gi,
        /cubic-bezier\(\s*[-\d.]+\s*,\s*(?:-\d|1\.[1-9]|[2-9])[^)]*\)/gi,
      ],
    },
    {
      id: "marketing-buzzword",
      category: "slop",
      severity: "P3",
      message: "Generic marketing copy weakens trust. Replace with the literal product action or outcome.",
      patterns: [/\b(?:streamline|empower|supercharge|world-class|enterprise-grade|next-generation|cutting-edge|seamless|revolutionary)\b/gi],
    },
    {
      id: "scaffold-label",
      category: "slop",
      severity: "P3",
      message: "Section/step labels used as visible scaffolding usually read as generated structure. Let the actual content label the sequence.",
      patterns: [/\b(?:SECTION|QUESTION|STAGE|PHASE|STEP|PASS)\s*(?:0?\d+|[IVX]+)\b/gi],
    },
    {
      id: "generic-placeholder-data",
      category: "slop",
      severity: "P2",
      message: "Default names, companies, or lorem ipsum make the interface feel fake. Use domain-specific draft content or real fixtures.",
      patterns: [/\b(?:John Doe|Jane Doe|Jane Smith|Acme Corp|Lorem ipsum|Foo Bar|Example Inc\.?|Nexus Platform|SmartFlow)\b/gi],
    },
    {
      id: "fake-product-preview",
      category: "slop",
      severity: "P2",
      message: "Div-based mock browser/dashboard/terminal previews are weak evidence. Use a real screenshot, live component state, generated bitmap, or no preview.",
      patterns: [
        /\b(?:fake|mock|placeholder)[-_ ]*(?:dashboard|terminal|browser|screenshot|preview)\b/gi,
        /class(?:Name)?=["'][^"']*(?:browser|terminal|dashboard|screenshot|preview)[^"']*["'][\s\S]{0,900}class(?:Name)?=["'][^"']*(?:skeleton|line|bar|dot|row)[^"']*["']/gi,
      ],
    },
    {
      id: "fake-version-metadata",
      category: "slop",
      severity: "P3",
      message: "Decorative version, branch, sync, or build metadata adds fake specificity. Keep only operational metadata users need.",
      patterns: [
        /\b(?:last\s+sync|synced|branch|commit|build|main)\b[\s\S]{0,80}\b(?:v?\d+\.\d+(?:\.\d+)?(?:[-.][\w.]+)?|[0-9a-f]{7,})\b/gi,
      ],
    },
    {
      id: "transition-all",
      category: "performance",
      severity: "P2",
      classification: "objective",
      confidence: "high",
      message: "Broad transitions hide bugs and animate unintended properties. Name exact properties.",
      patterns: [/\btransition-all\b|transition\s*:\s*all\b/gi],
    },
    {
      id: "layout-transition",
      category: "performance",
      severity: "P2",
      classification: "advisory",
      confidence: "medium",
      message: "Layout-property transitions can cause jank. Prefer transform/opacity or a deliberate layout technique.",
      patterns: [
        /transition(?:-property)?\s*:\s*[^;\n]*(?:width|height|padding|margin|top|left|right|bottom)/gi,
        /\btransition-\[(?:width|height|padding|margin|top|left|right|bottom)[^\]]*\]/gi,
      ],
    },
    {
      id: "ease-in-ui-motion",
      category: "motion",
      severity: "P2",
      classification: "advisory",
      confidence: "medium",
      message: "ease-in on UI entry/opening feels delayed. Prefer ease-out or a strong custom curve.",
      patterns: [
        /(?:transition(?:-timing-function)?|animation(?:-timing-function)?)\s*:[^;\n]*(?<![\w-])ease-in(?!-out|\w)/gi,
        /\bease-in(?!-out)\b/gi,
      ],
    },
    {
      id: "scale-zero-entry",
      category: "motion",
      severity: "P2",
      classification: "advisory",
      confidence: "medium",
      message: "scale(0) makes elements appear from nowhere. Start around scale(0.9-0.97) plus opacity.",
      patterns: [
        /scale(?:3d|X|Y)?\(\s*0(?:\.0+)?(?:\s|,|\))/gi,
        /\bscale-0\b|\bscale-\[0(?:\.0+)?\]/gi,
      ],
    },
    {
      id: "center-origin-anchored-motion",
      category: "motion",
      severity: "P2",
      message: "Anchored popovers, dropdowns, menus, and tooltips should scale from the trigger, not center.",
      patterns: [
        /(?:popover|dropdown|tooltip|menu)[\s\S]{0,260}(?:transform-origin|transformOrigin)\s*:?\s*["']?center/gi,
        /(?:transform-origin|transformOrigin)\s*:?\s*["']?center[\s\S]{0,260}(?:popover|dropdown|tooltip|menu)/gi,
      ],
    },
    {
      id: "keyframes-dynamic-ui",
      category: "motion",
      severity: "P2",
      message: "Keyframes restart from zero. Rapidly triggered UI such as toasts, toggles, menus, and drawers should usually retarget through transitions or springs.",
      patterns: [
        /@keyframes[\s\S]{0,1200}(?:toast|toggle|switch|drawer|popover|dropdown|menu)/gi,
        /(?:toast|toggle|switch|drawer|popover|dropdown|menu)[\s\S]{0,1200}@keyframes/gi,
      ],
    },
    {
      id: "long-ui-duration",
      category: "motion",
      severity: "P2",
      message: "UI motion over 300ms needs a spatial, deliberate-action, or rare-feedback reason.",
      patterns: [
        /(?:transition-duration|animation-duration)\s*:\s*(?:3[1-9]\d|[4-9]\d{2,}|\d{4,})ms/gi,
        /\bduration-(?:3[1-9]\d|[4-9]\d{2,}|\d{4,})\b/gi,
      ],
    },
    {
      id: "framer-motion-shorthand-risk",
      category: "motion",
      severity: "P2",
      message: "Framer Motion x/y/scale shorthand can drop frames under load. Use full transform strings for busy-page motion.",
      patterns: [
        /<motion\.[\w.]+[\s\S]{0,500}(?:animate|initial|exit)=\{\{[\s\S]{0,220}\b(?:x|y|scale)\s*:/gi,
      ],
    },
    {
      id: "parent-css-var-transform-risk",
      category: "motion",
      severity: "P2",
      message: "Driving many child transforms through parent CSS variables can cause style recalculation. Prefer direct transform writes on the moving element.",
      patterns: [
        /(?:document\.documentElement|document\.body|parentElement|container|root)\.style\.setProperty\(\s*["']--(?:(?:x|y|translate|transform|drag|swipe|motion|offset)(?:[-_][\w-]+)?|[\w-]+[-_](?:x|y|translate|transform|drag|swipe|motion|offset)(?:[-_][\w-]+)?)/gi,
      ],
    },
    {
      id: "layout-read-write-risk",
      category: "performance",
      severity: "P2",
      message: "Layout reads near DOM writes can force sync layout. Batch reads before writes or move work out of hot handlers.",
      patterns: [
        /(?:getBoundingClientRect|offset(?:Height|Width|Top|Left)|scroll(?:Top|Left|Height|Width)|client(?:Height|Width))[\s\S]{0,360}(?:style\.|classList\.|set[A-Z]\w*\(|setState\()/gi,
        /(?:style\.|classList\.|set[A-Z]\w*\(|setState\()[\s\S]{0,360}(?:getBoundingClientRect|offset(?:Height|Width|Top|Left)|scroll(?:Top|Left|Height|Width)|client(?:Height|Width))/gi,
      ],
    },
    {
      id: "will-change-broad",
      category: "performance",
      severity: "P2",
      classification: "objective",
      confidence: "high",
      message: "will-change must name sparse exact properties. Broad or layout-heavy hints cost memory and can hurt performance.",
      patterns: [
        /will-change\s*:\s*(?:all|width|height|top|left|right|bottom|padding|margin)/gi,
        /\bwill-change-\[(?:all|width|height|top|left|right|bottom|padding|margin)[^\]]*\]/gi,
      ],
    },
    {
      id: "expensive-effect-list-risk",
      category: "performance",
      severity: "P3",
      message: "Filters, backdrop blur, and large shadows inside repeated rows/cards can become expensive. Verify runtime cost.",
      patterns: [
        /(?:map\(|v-for|each\s*\(|For\s+each)[\s\S]{0,900}(?:backdrop-filter|backdrop-blur|filter\s*:|drop-shadow|box-shadow\s*:[^;\n]*(?:2[4-9]|[3-9]\d)px)/gi,
      ],
    },
    {
      id: "missing-img-alt",
      category: "accessibility",
      severity: "P1",
      classification: "objective",
      confidence: "high",
      message: "Meaningful images need alt text; decorative images need empty alt.",
      patterns: [/<img\b(?![^>]*\balt\s*=)(?![^>]*\{\s*\.\.\.)[^>]*>/gi],
    },
    {
      id: "img-alt-spread-unknown",
      category: "accessibility",
      severity: "P2",
      classification: "advisory",
      confidence: "low",
      message: "Image props are spread without an explicit alt, so static analysis cannot prove the accessible name contract.",
      patterns: [/<img\b(?![^>]*\balt\s*=)(?=[^>]*\{\s*\.\.\.)[^>]*>/gi],
    },
    {
      id: "missing-img-dimensions",
      category: "performance",
      severity: "P2",
      message: "Images without width/height or intrinsic sizing can cause layout shift. Reserve space or use framework image primitives.",
      patterns: [/<img\b(?![^>]*\bwidth=)(?![^>]*\bheight=)[^>]*\bsrc=/gi],
    },
    {
      id: "empty-img-src",
      category: "quality",
      severity: "P1",
      classification: "objective",
      confidence: "high",
      message: "Empty image sources ship broken visuals. Use a real asset or remove the tag.",
      patterns: [/<img\b[^>]*\bsrc=["']#?["'][^>]*>/gi],
    },
    {
      id: "placeholder-img-src",
      category: "quality",
      severity: "P2",
      classification: "advisory",
      confidence: "medium",
      message: "Placeholder-named image sources need verification before release.",
      patterns: [/<img\b[^>]*\bsrc=["'](?:TODO|\/?placeholder(?:[^"']*)?)["'][^>]*>/gi],
    },
    {
      id: "empty-button-name",
      category: "accessibility",
      severity: "P1",
      classification: "objective",
      confidence: "high",
      message: "A truly empty button has no accessible name. Add visible text or an explicit accessible-name attribute.",
      patterns: [/<button\b(?![^>]*(?:aria-label|aria-labelledby|title)\s*=)(?![^>]*\{\s*\.\.\.)[^>]*>\s*<\/button>/gi],
    },
    {
      id: "button-name-spread-unknown",
      category: "accessibility",
      severity: "P2",
      classification: "advisory",
      confidence: "low",
      message: "Button props are spread without visible content or an explicit name, so static analysis cannot prove the accessible-name contract.",
      patterns: [/<button\b(?![^>]*(?:aria-label|aria-labelledby|title)\s*=)(?=[^>]*\{\s*\.\.\.)[^>]*>\s*<\/button>/gi],
    },
    {
      id: "button-name-risk",
      category: "accessibility",
      severity: "P2",
      classification: "advisory",
      confidence: "medium",
      message: "An icon-only button may derive its name from rendered icon content. Confirm the computed accessible name at runtime.",
      patterns: [
        /<button\b(?![^>]*(?:aria-label|aria-labelledby|title)\s*=)[^>]*>\s*(?:<svg\b[^>]*\/>|<svg\b[\s\S]*?<\/svg>|<(?:Icon|[A-Z][\w.]*Icon)\b[^>]*\/?>)\s*<\/button>/gi,
      ],
      matchFilter: (snippet) =>
        !/<title\b/i.test(snippet) &&
        !/<(?:svg|Icon|[A-Z][\w.]*Icon)\b[^>]*\b(?:aria-label|aria-labelledby)\s*=/i.test(snippet),
    },
    {
      id: "interactive-div",
      category: "accessibility",
      severity: "P2",
      classification: "advisory",
      confidence: "medium",
      message: "A div/span handler may be a custom control or event delegation. Confirm semantics, focus, and keyboard behavior in context.",
      patterns: [
        /<(?:div|span)\b(?=[^>]*\bon(?:Click|PointerDown|MouseDown)=)(?![^>]*\brole\s*=\s*["'](?:button|link|checkbox|radio|switch|menuitem(?:checkbox|radio)?|option|tab)["'])[^>]*>/gi,
      ],
    },
    {
      id: "interactive-role-contract",
      category: "accessibility",
      severity: "P1",
      classification: "objective",
      confidence: "high",
      message: "An explicit interactive role with a pointer handler needs both focusability and keyboard activation.",
      patterns: [
        /<(?:div|span)\b(?=[^>]*\bon(?:Click|PointerDown|MouseDown)=)(?=[^>]*\brole\s*=\s*["'](?:button|link|checkbox|radio|switch|menuitem(?:checkbox|radio)?|option|tab)["'])(?![^>]*\{\s*\.\.\.)(?![^>]*\btabIndex\s*=)[^>]*>/gi,
        /<(?:div|span)\b(?=[^>]*\bon(?:Click|PointerDown|MouseDown)=)(?=[^>]*\brole\s*=\s*["'](?:button|link|checkbox|radio|switch|menuitem(?:checkbox|radio)?|option|tab)["'])(?![^>]*\{\s*\.\.\.)(?![^>]*\bonKey(?:Down|Up)\s*=)[^>]*>/gi,
      ],
    },
    {
      id: "nowrap-risk",
      category: "resilience",
      severity: "P2",
      message: "No-wrap text can overflow. Confirm truncation, wrapping, or scroll affordance exists.",
      patterns: [/\bwhitespace-nowrap\b|white-space\s*:\s*nowrap/gi],
    },
    {
      id: "fixed-width-mobile-risk",
      category: "resilience",
      severity: "P2",
      message: "Large fixed widths can break small viewports. Use responsive constraints or overflow affordances.",
      patterns: [
        /\bwidth\s*:\s*(?:[4-9]\d{2,}|\d{4,})px/gi,
        /\b(?:w|min-w|max-w)-\[(?:[4-9]\d{2,}|\d{4,})px\]/gi,
      ],
    },
    {
      id: "tiny-text",
      category: "quality",
      severity: "P2",
      message: "Body text below 12px is hard to read. Reserve tiny text for nonessential metadata.",
      patterns: [/font-size\s*:\s*(?:[0-9]|1[01])px|\btext-\[(?:[0-9]|1[01])px\]/gi],
    },
    {
      id: "all-caps-body",
      category: "quality",
      severity: "P3",
      message: "All-caps text is only for short labels. Verify it is not used on body copy.",
      patterns: [/text-transform\s*:\s*uppercase|\buppercase\b/gi],
    },
    {
      id: "z-index-overlay-risk",
      category: "quality",
      severity: "P3",
      message: "Very high z-index values can signal overlay wars. Check stacking context and focus/fixed layers.",
      patterns: [/z-index\s*:\s*(?:[1-9]\d{3,}|999)|\bz-\[(?:[1-9]\d{3,}|999)\]/gi],
    },
    {
      id: "hardcoded-color-drift",
      category: "design-system",
      severity: "P3",
      message: "Repeated literal colors can drift from tokens. Prefer semantic tokens when a design system exists.",
      patterns: [/(?:color|background|border(?:-color)?)\s*:\s*#[0-9a-f]{3,8}\b/gi],
    },
  ];
}

function runPatternRules(file, text) {
  const out = [];
  const source = maskEmbeddedTagAngles(maskComments(text));
  const suppressTestP1 = isTestFixture(file) && !options.includeTestFixtures;
  for (const rule of RULES) {
    if (suppressTestP1 && rule.severity === "P1" && ruleClassification(rule) === "objective") continue;
    for (const pattern of rule.patterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(source))) {
        const snippet = text.slice(match.index, match.index + match[0].length);
        if (rule.matchFilter && !rule.matchFilter(snippet)) continue;
        out.push(toFinding(rule, file, text, match.index, snippet));
        if (match.index === pattern.lastIndex) pattern.lastIndex += 1;
      }
    }
  }
  return out;
}

function runFileRules(file, text) {
  const out = [];
  const source = maskComments(text);
  const hasMotion =
    /@keyframes\b|animation(?:-name)?\s*:|\banimate-[\w-]+\b|\btransition(?:-\[|:|-property)?/.test(source);
  const hasReducedMotion = /prefers-reduced-motion/.test(source);
  if (hasMotion && !hasReducedMotion) {
    out.push(
      toFinding(
        {
          id: "missing-reduced-motion-guard",
          category: "accessibility",
          severity: "P2",
          classification: "advisory",
          confidence: "low",
          message: "Motion-heavy files need a reduced-motion path or a documented reason it is not required.",
        },
        file,
        text,
        Math.max(0, source.search(/@keyframes\b|animation(?:-name)?\s*:|\banimate-[\w-]+\b|\btransition(?:-\[|:|-property)?/)),
        "motion without prefers-reduced-motion",
      ),
    );
  }

  const hasTranslucentMaterial = /\bbackdrop-blur\b|backdrop-filter\s*:\s*blur\(|backdropFilter\s*:?\s*["']?[^;"'\n]*blur\(/i.test(source);
  const hasTransparencyFallback = /prefers-reduced-transparency|prefers-contrast|forced-colors/i.test(source);
  if (hasTranslucentMaterial && !hasTransparencyFallback) {
    out.push(
      toFinding(
        {
          id: "missing-reduced-transparency-fallback",
          category: "accessibility",
          severity: "P2",
          classification: "advisory",
          confidence: "low",
          message: "Blurred/translucent chrome needs a solid or higher-contrast fallback when it carries structure or text.",
        },
        file,
        text,
        Math.max(0, source.search(/\bbackdrop-blur\b|backdrop-filter\s*:\s*blur\(|backdropFilter\s*:?\s*["']?[^;"'\n]*blur\(/i)),
        "translucent material without prefers-reduced-transparency, prefers-contrast, or forced-colors fallback",
      ),
    );
  }

  const willChangeMatches = [...source.matchAll(/will-change\s*:|will-change-\[/gi)];
  if (willChangeMatches.length >= 5) {
    out.push(
      toFinding(
        {
          id: "will-change-mass-layering",
          category: "performance",
          severity: "P2",
          message: "Many will-change hints in one file can create excessive layers. Keep hints sparse and justified.",
        },
        file,
        text,
        willChangeMatches[0].index ?? 0,
        `${willChangeMatches.length} will-change hints`,
      ),
    );
  }

  const hasHoverMotion = /(?::hover|hover:)[\s\S]{0,220}(?:transform|scale|translate|rotate|animation|transition)/i.test(source);
  const hasHoverGate = /@media\s*\(\s*hover\s*:\s*hover\s*\)\s*and\s*\(\s*pointer\s*:\s*fine\s*\)/i.test(source);
  if (hasHoverMotion && !hasHoverGate) {
    out.push(
      toFinding(
        {
          id: "ungated-hover-motion",
          category: "motion",
          severity: "P2",
          message: "Hover motion should be gated to hover-capable fine pointers so touch users do not get hidden or accidental affordances.",
        },
        file,
        text,
        Math.max(0, source.search(/(?::hover|hover:)[\s\S]{0,220}(?:transform|scale|translate|rotate|animation|transition)/i)),
        "hover motion without @media (hover: hover) and (pointer: fine)",
      ),
    );
  }

  const hasPointerGesture =
    /\bonPointer(?:Down|Move|Up|Cancel)\b|addEventListener\(\s*["']pointer(?:down|move|up|cancel)["']|PointerEvent/i.test(source) &&
    /\b(?:client[XY]|page[XY]|screen[XY]|movement[XY]|translate[XY]?|transform|drag|swipe|velocity)\b/i.test(source);
  if (hasPointerGesture && !/setPointerCapture\b/i.test(source)) {
    out.push(
      toFinding(
        {
          id: "gesture-missing-pointer-capture",
          category: "motion",
          severity: "P3",
          message: "Pointer-driven drag/swipe code should usually capture the pointer after drag intent so motion survives leaving bounds.",
        },
        file,
        text,
        Math.max(0, source.search(/\bonPointer(?:Down|Move|Up|Cancel)\b|addEventListener\(\s*["']pointer(?:down|move|up|cancel)["']|PointerEvent/i)),
        "pointer gesture without setPointerCapture",
      ),
    );
  }

  return out;
}

function uniqueFindings(value) {
  const rangesByRuleAndFile = new Map();
  const out = [];
  for (const finding of value) {
    const key = `${finding.id}|${finding.file}`;
    const ranges = rangesByRuleAndFile.get(key) || [];
    if (!insertNonOverlappingRange(ranges, finding._offset, finding._end)) continue;
    rangesByRuleAndFile.set(key, ranges);
    out.push(finding);
  }
  return out;
}

function insertNonOverlappingRange(ranges, start, end) {
  let low = 0;
  let high = ranges.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (ranges[middle].start < start) low = middle + 1;
    else high = middle;
  }
  const previous = ranges[low - 1];
  const next = ranges[low];
  if (previous && start < previous.end) return false;
  if (next && next.start < end) return false;
  ranges.splice(low, 0, { start, end });
  return true;
}

function toFinding(rule, file, text, index, snippet) {
  const classification = ruleClassification(rule);
  const confidence = rule.confidence ?? (rule.category === "slop" ? "low" : "medium");
  if (rule.severity === "P1" && (classification !== "objective" || confidence !== "high")) {
    throw new Error(`P1 detector rule ${rule.id} must be objective and high confidence`);
  }
  const finding = {
    id: rule.id,
    category: rule.category,
    severity: rule.severity,
    classification,
    confidence,
    message: rule.message,
    file: reportPath(file),
    line: lineForIndex(text, index),
    snippet: cleanSnippet(snippet),
  };
  Object.defineProperties(finding, {
    _offset: { value: index, enumerable: false },
    _end: { value: index + Math.max(1, String(snippet).length), enumerable: false },
  });
  return finding;
}

function assignFingerprints(findings) {
  const occurrences = new Map();
  for (const finding of findings) {
    const base = fingerprintBase(finding);
    const occurrence = (occurrences.get(base) || 0) + 1;
    occurrences.set(base, occurrence);
    finding.occurrence = occurrence;
    finding.fingerprint = `${base}|occurrence=${occurrence}`;
  }
  return findings;
}

function ruleClassification(rule) {
  return rule.classification ?? "advisory";
}

function validateRuleCatalog(catalog) {
  const ids = new Set();
  for (const rule of catalog) {
    const classification = ruleClassification(rule);
    const confidence = rule.confidence ?? (rule.category === "slop" ? "low" : "medium");
    if (!rule.id || ids.has(rule.id)) throw new Error(`Detector rule id must be unique: ${rule.id || "<missing>"}`);
    if (!Object.hasOwn(severityRank, rule.severity)) throw new Error(`Invalid severity for detector rule ${rule.id}`);
    if (!classifications.has(classification)) throw new Error(`Invalid classification for detector rule ${rule.id}`);
    if (!confidenceLevels.has(confidence)) throw new Error(`Invalid confidence for detector rule ${rule.id}`);
    if (!Array.isArray(rule.patterns) || !rule.patterns.length) throw new Error(`Detector rule ${rule.id} needs a pattern`);
    if (rule.provider) throw new Error(`Provider stereotypes require a calibrated corpus: ${rule.id}`);
    if (rule.category === "slop" && classification !== "advisory") {
      throw new Error(`Taste rule ${rule.id} must remain advisory`);
    }
    if (rule.severity === "P1" && (classification !== "objective" || confidence !== "high")) {
      throw new Error(`P1 detector rule ${rule.id} must be objective and high confidence`);
    }
    ids.add(rule.id);
  }
}

function isTestFixture(file) {
  const normalized = normalizePath(file).toLowerCase();
  const basename = path.basename(normalized);
  return (
    /(?:^|\/)(?:__tests__|__fixtures__|tests?|snapshots?)(?:\/|$)/.test(normalized) ||
    /\.(?:test|spec|stories?|fixture|snap)\.[^.]+$/.test(basename)
  );
}

function maskComments(text) {
  const chars = text.split("");
  let quote = null;
  let escaped = false;

  const isEscapedAt = (position) => {
    let slashCount = 0;
    for (let cursor = position - 1; cursor >= 0 && text[cursor] === "\\"; cursor -= 1) slashCount += 1;
    return slashCount % 2 === 1;
  };

  const blank = (start, end) => {
    for (let index = start; index < end; index += 1) {
      if (chars[index] !== "\n" && chars[index] !== "\r") chars[index] = " ";
    }
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "/" && next === "/" && !isEscapedAt(index)) {
      const end = text.indexOf("\n", index + 2);
      const stop = end === -1 ? text.length : end;
      blank(index, stop);
      index = stop - 1;
      continue;
    }

    if (char === "/" && next === "*" && !isEscapedAt(index)) {
      const end = text.indexOf("*/", index + 2);
      const stop = end === -1 ? text.length : end + 2;
      blank(index, stop);
      index = stop - 1;
      continue;
    }

    if (text.startsWith("<!--", index)) {
      const end = text.indexOf("-->", index + 4);
      const stop = end === -1 ? text.length : end + 3;
      blank(index, stop);
      index = stop - 1;
    }
  }

  return chars.join("");
}

function maskEmbeddedTagAngles(text) {
  const chars = text.split("");
  let inTag = false;
  let quote = null;
  let escaped = false;
  let braceDepth = 0;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (!inTag) {
      if (char === "<" && /[A-Za-z]/.test(text[index + 1] || "")) {
        inTag = true;
        braceDepth = 0;
      }
      continue;
    }

    if (quote) {
      if (char === ">") chars[index] = " ";
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") {
      braceDepth += 1;
      continue;
    }
    if (char === "}" && braceDepth > 0) {
      braceDepth -= 1;
      continue;
    }
    if (char === ">") {
      if (braceDepth > 0) chars[index] = " ";
      else inTag = false;
    }
  }

  return chars.join("");
}

function parseArgs(args) {
  const options = {
    format: "text",
    failOn: null,
    out: null,
    allowlist: null,
    baseline: null,
    changedOnly: false,
    category: null,
    includeAdvisory: false,
    strict: false,
    includeTestFixtures: false,
  };
  const targets = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const equalsIndex = arg.indexOf("=");
    const name = equalsIndex === -1 ? arg : arg.slice(0, equalsIndex);
    const inlineValue = equalsIndex === -1 ? undefined : arg.slice(equalsIndex + 1);
    const nextValue = () => {
      const value = inlineValue ?? args[i + 1];
      if (typeof value !== "string" || !value.trim() || (inlineValue === undefined && value.startsWith("--"))) {
        console.error(`${name} requires a value.`);
        process.exit(2);
      }
      if (inlineValue === undefined) i += 1;
      return value;
    };

    if (arg === "--json") options.format = "json";
    else if (arg === "--changed-only") options.changedOnly = true;
    else if (arg === "--include-advisory") options.includeAdvisory = true;
    else if (arg === "--strict") options.strict = true;
    else if (arg === "--include-test-fixtures") options.includeTestFixtures = true;
    else if (name === "--format") options.format = normalizeFormat(nextValue());
    else if (name === "--fail-on") options.failOn = normalizeSeverity(nextValue());
    else if (name === "--out") options.out = nextValue();
    else if (name === "--allowlist") options.allowlist = nextValue();
    else if (name === "--baseline") options.baseline = nextValue();
    else if (name === "--category") options.category = nextValue();
    else if (arg.startsWith("--")) {
      console.error(`Unknown option: ${arg}`);
      process.exit(2);
    } else {
      targets.push(arg);
    }
  }

  if (options.strict && options.failOn) {
    console.error("Choose either --strict or --fail-on, not both.");
    process.exit(2);
  }
  if (options.strict) options.failOn = "P1";

  return { options, targets };
}

function normalizeFormat(value) {
  if (!["json", "md", "markdown", "text"].includes(value)) {
    console.error(`Invalid --format ${value}`);
    process.exit(2);
  }
  return value === "markdown" ? "md" : value;
}

function normalizeSeverity(value) {
  const severity = String(value || "").toUpperCase();
  if (!Object.hasOwn(severityRank, severity)) {
    console.error(`Invalid --fail-on ${value}; expected P0, P1, P2, or P3`);
    process.exit(2);
  }
  return severity;
}

function collectFiles(target, out, changedFiles, visitedDirectories) {
  if (!fs.existsSync(target)) return;
  const stat = fs.lstatSync(target);
  if (stat.isSymbolicLink()) return;
  if (stat.isDirectory()) {
    const name = path.basename(target);
    if (SKIP_DIRS.has(name)) return;
    const directoryKey = normalizeAbsolutePath(fs.realpathSync.native(target));
    if (visitedDirectories.has(directoryKey)) return;
    visitedDirectories.add(directoryKey);
    for (const entry of fs.readdirSync(target)) {
      collectFiles(path.join(target, entry), out, changedFiles, visitedDirectories);
    }
    return;
  }
  if (!stat.isFile()) return;
  if (!VALID_EXT.has(path.extname(target).toLowerCase())) return;

  if (changedFiles && !changedFiles.has(normalizeAbsolutePath(target))) return;
  out.push(target);
}

function gitChangedFiles(scanTargets) {
  try {
    const git = (args, cwd = process.cwd()) =>
      execFileSync("git", args, {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
    const anchors = scanTargets.length ? scanTargets.map((target) => path.resolve(target)) : [process.cwd()];
    const roots = new Set(
      anchors.map((anchor) => {
        const cwd = fs.statSync(anchor).isDirectory() ? anchor : path.dirname(anchor);
        return git(["rev-parse", "--show-toplevel"], cwd).trim();
      }),
    );
    const names = new Set();
    for (const root of roots) {
      for (const args of [
        ["diff", "--name-only", "--diff-filter=ACMRTUXB", "-z"],
        ["diff", "--cached", "--name-only", "--diff-filter=ACMRTUXB", "-z"],
        ["ls-files", "--others", "--exclude-standard", "-z"],
      ]) {
        for (const name of git(args, root).split("\0")) {
          if (name) names.add(normalizeAbsolutePath(path.resolve(root, name)));
        }
      }
    }
    return [...names];
  } catch {
    console.error("--changed-only requires a readable Git worktree.");
    process.exit(2);
  }
}

function normalizeAbsolutePath(value) {
  const normalized = path.resolve(value).replaceAll("\\", "/");
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

function validateProtectedOutputInput(output, input, label) {
  if (!output || !input) return;
  const outputPath = path.resolve(output);
  const inputPath = path.resolve(input);
  const sameCanonicalPath =
    normalizeAbsolutePath(canonicalPlannedPath(outputPath)) ===
    normalizeAbsolutePath(canonicalPlannedPath(inputPath));
  if (sameCanonicalPath || samePhysicalFile(outputPath, inputPath)) {
    console.error(`Refusing detector output that resolves to its ${label} input: ${outputPath}`);
    process.exit(2);
  }
}

function samePhysicalFile(left, right) {
  if (!fs.existsSync(left) || !fs.existsSync(right)) return false;
  const leftStat = fs.statSync(left, { bigint: true });
  const rightStat = fs.statSync(right, { bigint: true });
  return leftStat.dev === rightStat.dev && leftStat.ino === rightStat.ino;
}

function validateOutputPath(output, inputFiles) {
  if (!output) return;
  const outputPath = path.resolve(output);
  let current = outputPath;
  while (true) {
    try {
      const stat = fs.lstatSync(current);
      if (stat.isSymbolicLink()) {
        console.error(`Refusing detector output through a symbolic link, junction, or reparse point: ${current}`);
        process.exit(2);
      }
      if (current === outputPath && stat.isDirectory()) {
        console.error(`Detector output must be a file, not a directory: ${outputPath}`);
        process.exit(2);
      }
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  const canonicalOutput = canonicalPlannedPath(outputPath);
  const overlapsInput = inputFiles.some((input) => {
    if (normalizeAbsolutePath(fs.realpathSync.native(input)) === normalizeAbsolutePath(canonicalOutput)) return true;
    return samePhysicalFile(outputPath, input);
  });
  if (overlapsInput) {
    console.error(`Refusing detector output that resolves to a scanned source file: ${outputPath}`);
    process.exit(2);
  }
}

function canonicalPlannedPath(value) {
  let existing = path.resolve(value);
  const missing = [];
  while (!fs.existsSync(existing)) {
    const parent = path.dirname(existing);
    if (parent === existing) return path.resolve(value);
    missing.unshift(path.basename(existing));
    existing = parent;
  }
  return path.resolve(fs.realpathSync.native(existing), ...missing);
}

function determinePathBase(scanTargets) {
  const directories = scanTargets.map((target) => (fs.statSync(target).isDirectory() ? target : path.dirname(target)));
  const gitRoots = directories.map((directory) => tryGitRoot(directory));
  if (
    gitRoots.every(Boolean) &&
    gitRoots.every((root) => normalizeAbsolutePath(root) === normalizeAbsolutePath(gitRoots[0]))
  ) {
    return { kind: "git-root", path: path.resolve(gitRoots[0]) };
  }
  const common = commonDirectory(directories);
  return common ? { kind: "scan-root", path: common } : { kind: "absolute", path: null };
}

function tryGitRoot(directory) {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: directory,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function commonDirectory(directories) {
  let common = path.resolve(directories[0]);
  for (const directory of directories.slice(1)) {
    const candidate = path.resolve(directory);
    while (!isWithin(common, candidate)) {
      const parent = path.dirname(common);
      if (parent === common) return null;
      common = parent;
    }
  }
  return common;
}

function isWithin(base, candidate) {
  const relative = path.relative(base, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function reportPath(file) {
  if (pathBase.path && isWithin(pathBase.path, file)) return normalizePath(path.relative(pathBase.path, file));
  return normalizePath(path.resolve(file));
}

function loadFindingMultiset(file) {
  const counts = new Map();
  if (!file) return counts;
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const findings = Array.isArray(data) ? data : data.findings || [];
  for (const item of findings) {
    const base = fingerprintBaseFromStoredItem(item);
    if (base) counts.set(base, (counts.get(base) || 0) + 1);
  }
  return counts;
}

function fingerprintBaseFromStoredItem(item) {
  if (typeof item === "string") return fingerprintBaseFromString(item);
  if (!item || typeof item !== "object") return null;
  if (item.id && item.file !== undefined && item.snippet !== undefined) return fingerprintBase(item);
  return typeof item.fingerprint === "string" ? fingerprintBaseFromString(item.fingerprint) : null;
}

function fingerprintBaseFromString(value) {
  if (value.startsWith("v3|")) return value.replace(/\|occurrence=\d+$/, "");
  if (value.startsWith("v2|")) {
    const [, id, file, ...snippet] = value.split("|");
    if (!id || file === undefined || !snippet.length) return null;
    return fingerprintBase({ id, file, snippet: snippet.join("|") });
  }
  const legacy = parseLegacyFingerprint(value);
  return legacy ? fingerprintBase(legacy) : null;
}

function parseLegacyFingerprint(value) {
  const [id, file, line, ...snippet] = value.split("|");
  if (!id || !file || !/^\d+$/.test(line || "") || !snippet.length) return null;
  return { id, file, snippet: snippet.join("|") };
}

function fingerprintBase(finding) {
  return [
    "v3",
    finding.id,
    normalizePath(finding.file || ""),
    cleanSnippet(finding.snippet || ""),
  ].join("|");
}

function consumeFinding(multiset, finding) {
  const base = fingerprintBase(finding);
  const remaining = multiset.get(base) || 0;
  if (!remaining) return false;
  if (remaining === 1) multiset.delete(base);
  else multiset.set(base, remaining - 1);
  return true;
}

function normalizePath(value) {
  return String(value).replaceAll("\\", "/");
}

function lineForIndex(text, index) {
  if (text !== cachedLineSource) {
    cachedLineSource = text;
    cachedLineStarts = [0];
    for (let offset = 0; offset < text.length; offset += 1) {
      if (text.charCodeAt(offset) === 10) cachedLineStarts.push(offset + 1);
    }
  }
  let low = 0;
  let high = cachedLineStarts.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (cachedLineStarts[middle] <= index) low = middle + 1;
    else high = middle;
  }
  return low;
}

function cleanSnippet(value) {
  return String(value).replace(/\s+/g, " ").trim().slice(0, 180);
}

function summarize(findings) {
  const bySeverity = {};
  const byCategory = {};
  const byClassification = {};
  for (const finding of findings) {
    bySeverity[finding.severity] = (bySeverity[finding.severity] || 0) + 1;
    byCategory[finding.category] = (byCategory[finding.category] || 0) + 1;
    byClassification[finding.classification] = (byClassification[finding.classification] || 0) + 1;
  }
  return {
    total: findings.length,
    bySeverity,
    byCategory,
    byClassification,
  };
}

function render(payload, format) {
  if (format === "json") return `${JSON.stringify(payload, null, 2)}\n`;
  if (format === "md") return renderMarkdown(payload);
  return renderText(payload);
}

function renderText(payload) {
  if (!payload.findings.length) return `Scanned ${payload.files} file(s). No findings.\n`;
  const lines = [`Scanned ${payload.files} file(s). ${payload.findings.length} finding(s).`];
  for (const finding of payload.findings) {
    lines.push(
      `[${finding.severity}][${finding.classification}/${finding.confidence}] ${finding.id} ${finding.file}:${finding.line} - ${finding.message}`,
    );
    lines.push(`  ${finding.snippet}`);
  }
  return `${lines.join("\n")}\n`;
}

function renderMarkdown(payload) {
  const lines = [
    "# UI Anti-Pattern Scan",
    "",
    `Scanned: ${payload.files} file(s)`,
    `Findings: ${payload.findings.length}`,
    "",
  ];
  if (payload.findings.length) {
    lines.push("Findings:");
    for (const finding of payload.findings) {
      lines.push(
        `- [${finding.severity}][${finding.classification}/${finding.confidence}] ${finding.id} ${finding.file}:${finding.line} - ${finding.message}`,
      );
    }
  } else {
    lines.push("No findings.");
  }
  return `${lines.join("\n")}\n`;
}

function publicOptions(value) {
  return {
    format: value.format,
    failOn: value.failOn,
    changedOnly: value.changedOnly,
    category: value.category,
    allowlist: Boolean(value.allowlist),
    baseline: Boolean(value.baseline),
    includeAdvisory: value.includeAdvisory,
    strict: value.strict,
    includeTestFixtures: value.includeTestFixtures,
  };
}

function usage(stream = process.stderr) {
  stream.write(
    "Usage: node detect-ui-antipatterns.mjs [--json|--format=text|md|json] [--strict|--fail-on=P0|P1|P2|P3] [--include-advisory] [--include-test-fixtures] [--out file] [--allowlist file] [--baseline file] [--changed-only] [--category name] <file-or-directory>...\n",
  );
}
