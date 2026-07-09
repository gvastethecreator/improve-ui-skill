#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const VALID_EXT = new Set([
  ".astro",
  ".css",
  ".html",
  ".js",
  ".jsx",
  ".mdx",
  ".svelte",
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
const { options, targets } = parseArgs(process.argv.slice(2));

if (!targets.length && !options.changedOnly) {
  usage();
  process.exit(2);
}

const allowlist = loadFindingSet(options.allowlist);
const baseline = loadFindingSet(options.baseline);
const changedFiles = options.changedOnly ? new Set(gitChangedFiles()) : null;
const files = [];

for (const target of targets.length ? targets : [process.cwd()]) {
  collectFiles(path.resolve(target), files, changedFiles);
}

const findings = [];
for (const file of [...new Set(files)].sort()) {
  const text = fs.readFileSync(file, "utf8");
  findings.push(...runPatternRules(file, text));
  findings.push(...runFileRules(file, text));
}

const filtered = uniqueFindings(findings)
  .filter((finding) => !options.category || finding.category === options.category || finding.id === options.category)
  .filter((finding) => !allowlist.has(fingerprint(finding)))
  .filter((finding) => !baseline.has(fingerprint(finding)));

const payload = {
  scannedAt: new Date().toISOString(),
  cwd: process.cwd(),
  files: files.length,
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

if (options.failOn && filtered.some((finding) => severityRank[finding.severity] <= severityRank[options.failOn])) {
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
      message: "Broad transitions hide bugs and animate unintended properties. Name exact properties.",
      patterns: [/\btransition-all\b|transition\s*:\s*all\b/gi],
    },
    {
      id: "layout-transition",
      category: "performance",
      severity: "P1",
      message: "Layout-property transitions can cause jank. Prefer transform/opacity or a deliberate layout technique.",
      patterns: [
        /transition(?:-property)?\s*:\s*[^;\n]*(?:width|height|padding|margin|top|left|right|bottom)/gi,
        /\btransition-\[(?:width|height|padding|margin|top|left|right|bottom)[^\]]*\]/gi,
      ],
    },
    {
      id: "ease-in-ui-motion",
      category: "motion",
      severity: "P1",
      message: "ease-in on UI entry/opening feels delayed. Prefer ease-out or a strong custom curve.",
      patterns: [
        /(?:transition(?:-timing-function)?|animation(?:-timing-function)?)\s*:[^;\n]*(?<![\w-])ease-in(?!-out|\w)/gi,
        /\bease-in(?!-out)\b/gi,
      ],
    },
    {
      id: "scale-zero-entry",
      category: "motion",
      severity: "P1",
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
      message: "will-change must name sparse exact properties. Broad or layout-heavy hints cost memory and can hurt performance.",
      patterns: [
        /will-change\s*:\s*(?:all|auto|width|height|top|left|right|bottom|padding|margin)/gi,
        /\bwill-change-\[(?:all|auto|width|height|top|left|right|bottom|padding|margin)[^\]]*\]/gi,
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
      message: "Meaningful images need alt text; decorative images need empty alt.",
      patterns: [/<img\b(?![^>]*\balt=)[^>]*>/gi],
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
      message: "Empty or placeholder image sources ship broken visuals. Use real assets or remove the tag.",
      patterns: [/<img\b[^>]*\bsrc=["'](?:|#|placeholder|TODO|\/?placeholder[^"']*)["'][^>]*>/gi],
    },
    {
      id: "button-name-risk",
      category: "accessibility",
      severity: "P1",
      message: "Icon-only or empty buttons need accessible names through visible text, aria-label, aria-labelledby, or title.",
      patterns: [
        /<button\b(?![^>]*(?:aria-label|aria-labelledby|title)=)[^>]*>\s*(?:<svg[\s\S]*?<\/svg>|<Icon\b[\s\S]*?\/?>|{?\s*}?)\s*<\/button>/gi,
      ],
    },
    {
      id: "interactive-div",
      category: "accessibility",
      severity: "P1",
      message: "Clickable div/span needs semantic button/link or full keyboard role handling.",
      patterns: [
        /<(?:div|span)\b(?=[^>]*\bon(?:Click|PointerDown|MouseDown|KeyDown)=)(?![^>]*\brole=)[^>]*>/g,
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
    {
      id: "gpt-thin-border-wide-shadow",
      category: "slop",
      severity: "P3",
      provider: "gpt",
      message: "Hairline border plus diffuse shadow is a common generated-card signature.",
      patterns: [/\bborder\b[^"\n]{0,80}\bbox-shadow\b|\bbox-shadow\b[^"\n]{0,80}\bborder\b/gi],
    },
    {
      id: "gpt-repeating-stripes",
      category: "slop",
      severity: "P3",
      provider: "gpt",
      message: "Repeating stripe decoration is a common generated UI filler pattern.",
      patterns: [/repeating-linear-gradient\(/gi],
    },
    {
      id: "gemini-image-hover-transform",
      category: "slop",
      severity: "P3",
      provider: "gemini",
      message: "Image hover scale/rotate can be a generated default. Verify it helps inspection.",
      patterns: [/(?:img|image|photo)[^;\n]{0,160}:hover[^;\n]*(?:scale|rotate)|hover:[^\s"']*(?:scale|rotate)[^\s"']*(?:img|image|photo)/gi],
    },
  ];
}

function runPatternRules(file, text) {
  const out = [];
  for (const rule of rules()) {
    if (rule.provider === "gpt" && !options.gpt) continue;
    if (rule.provider === "gemini" && !options.gemini) continue;
    for (const pattern of rule.patterns) {
      pattern.lastIndex = 0;
      let count = 0;
      let match;
      while ((match = pattern.exec(text)) && count < 8) {
        out.push(toFinding(rule, file, text, match.index, match[0]));
        count += 1;
        if (match.index === pattern.lastIndex) pattern.lastIndex += 1;
      }
    }
  }
  return out;
}

function runFileRules(file, text) {
  const out = [];
  const hasMotion =
    /@keyframes\b|animation(?:-name)?\s*:|\banimate-[\w-]+\b|\btransition(?:-\[|:|-property)?/.test(text);
  const hasReducedMotion = /prefers-reduced-motion/.test(text);
  if (hasMotion && !hasReducedMotion) {
    out.push(
      toFinding(
        {
          id: "missing-reduced-motion-guard",
          category: "accessibility",
          severity: "P2",
          message: "Motion-heavy files need a reduced-motion path or a documented reason it is not required.",
        },
        file,
        text,
        Math.max(0, text.search(/@keyframes\b|animation(?:-name)?\s*:|\banimate-[\w-]+\b|\btransition(?:-\[|:|-property)?/)),
        "motion without prefers-reduced-motion",
      ),
    );
  }

  const hasTranslucentMaterial = /\bbackdrop-blur\b|backdrop-filter\s*:\s*blur\(|backdropFilter\s*:?\s*["']?[^;"'\n]*blur\(/i.test(text);
  const hasTransparencyFallback = /prefers-reduced-transparency|prefers-contrast|forced-colors/i.test(text);
  if (hasTranslucentMaterial && !hasTransparencyFallback) {
    out.push(
      toFinding(
        {
          id: "missing-reduced-transparency-fallback",
          category: "accessibility",
          severity: "P2",
          message: "Blurred/translucent chrome needs a solid or higher-contrast fallback when it carries structure or text.",
        },
        file,
        text,
        Math.max(0, text.search(/\bbackdrop-blur\b|backdrop-filter\s*:\s*blur\(|backdropFilter\s*:?\s*["']?[^;"'\n]*blur\(/i)),
        "translucent material without prefers-reduced-transparency, prefers-contrast, or forced-colors fallback",
      ),
    );
  }

  const willChangeMatches = [...text.matchAll(/will-change\s*:|will-change-\[/gi)];
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

  const hasHoverMotion = /(?::hover|hover:)[\s\S]{0,220}(?:transform|scale|translate|rotate|animation|transition)/i.test(text);
  const hasHoverGate = /@media\s*\(\s*hover\s*:\s*hover\s*\)\s*and\s*\(\s*pointer\s*:\s*fine\s*\)/i.test(text);
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
        Math.max(0, text.search(/(?::hover|hover:)[\s\S]{0,220}(?:transform|scale|translate|rotate|animation|transition)/i)),
        "hover motion without @media (hover: hover) and (pointer: fine)",
      ),
    );
  }

  const hasPointerGesture =
    /\bonPointer(?:Down|Move|Up|Cancel)\b|addEventListener\(\s*["']pointer(?:down|move|up|cancel)["']|PointerEvent/i.test(text) &&
    /\b(?:client[XY]|page[XY]|screen[XY]|movement[XY]|translate[XY]?|transform|drag|swipe|velocity)\b/i.test(text);
  if (hasPointerGesture && !/setPointerCapture\b/i.test(text)) {
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
        Math.max(0, text.search(/\bonPointer(?:Down|Move|Up|Cancel)\b|addEventListener\(\s*["']pointer(?:down|move|up|cancel)["']|PointerEvent/i)),
        "pointer gesture without setPointerCapture",
      ),
    );
  }

  return out;
}

function uniqueFindings(value) {
  const seen = new Set();
  const out = [];
  for (const finding of value) {
    const key = `${finding.id}|${finding.file}|${finding.line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(finding);
  }
  return out;
}

function toFinding(rule, file, text, index, snippet) {
  return {
    id: rule.id,
    category: rule.category,
    severity: rule.severity,
    message: rule.message,
    file: path.relative(process.cwd(), file),
    line: lineForIndex(text, index),
    snippet: cleanSnippet(snippet),
  };
}

function parseArgs(args) {
  const options = {
    format: "text",
    gpt: false,
    gemini: false,
    failOn: null,
    out: null,
    allowlist: null,
    baseline: null,
    changedOnly: false,
    category: null,
  };
  const targets = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const [name, inlineValue] = arg.split("=", 2);
    const nextValue = () => inlineValue ?? args[++i];

    if (arg === "--json") options.format = "json";
    else if (arg === "--gpt") options.gpt = true;
    else if (arg === "--gemini") options.gemini = true;
    else if (arg === "--changed-only") options.changedOnly = true;
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

function collectFiles(target, out, changedFiles) {
  if (!fs.existsSync(target)) return;
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    const name = path.basename(target);
    if (SKIP_DIRS.has(name)) return;
    for (const entry of fs.readdirSync(target)) collectFiles(path.join(target, entry), out, changedFiles);
    return;
  }
  if (!stat.isFile()) return;
  if (!VALID_EXT.has(path.extname(target))) return;

  const rel = path.relative(process.cwd(), target).replaceAll("\\", "/");
  if (changedFiles && !changedFiles.has(rel)) return;
  out.push(target);
}

function gitChangedFiles() {
  try {
    const output = execSync("git diff --name-only --diff-filter=ACMRTUXB HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return output
      .split(/\r?\n/)
      .map((line) => line.trim().replaceAll("\\", "/"))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function loadFindingSet(file) {
  const set = new Set();
  if (!file) return set;
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const findings = Array.isArray(data) ? data : data.findings || [];
  for (const item of findings) {
    if (typeof item === "string") set.add(item);
    else set.add(fingerprint(item));
  }
  return set;
}

function fingerprint(finding) {
  return [
    finding.id,
    normalizePath(finding.file || ""),
    finding.line || "",
    cleanSnippet(finding.snippet || ""),
  ].join("|");
}

function normalizePath(value) {
  return String(value).replaceAll("\\", "/");
}

function lineForIndex(text, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (text.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function cleanSnippet(value) {
  return String(value).replace(/\s+/g, " ").trim().slice(0, 180);
}

function summarize(findings) {
  const bySeverity = {};
  const byCategory = {};
  for (const finding of findings) {
    bySeverity[finding.severity] = (bySeverity[finding.severity] || 0) + 1;
    byCategory[finding.category] = (byCategory[finding.category] || 0) + 1;
  }
  return {
    total: findings.length,
    bySeverity,
    byCategory,
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
    lines.push(`[${finding.severity}] ${finding.id} ${finding.file}:${finding.line} - ${finding.message}`);
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
      lines.push(`- [${finding.severity}] ${finding.id} ${finding.file}:${finding.line} - ${finding.message}`);
    }
  } else {
    lines.push("No findings.");
  }
  return `${lines.join("\n")}\n`;
}

function publicOptions(value) {
  return {
    format: value.format,
    gpt: value.gpt,
    gemini: value.gemini,
    failOn: value.failOn,
    changedOnly: value.changedOnly,
    category: value.category,
    allowlist: Boolean(value.allowlist),
    baseline: Boolean(value.baseline),
  };
}

function usage() {
  console.error("Usage: node detect-ui-antipatterns.mjs [--json|--format=text|md|json] [--fail-on=P1|P2|P3] [--out file] [--allowlist file] [--baseline file] [--changed-only] [--category name] [--gpt] [--gemini] <file-or-directory>...");
}
