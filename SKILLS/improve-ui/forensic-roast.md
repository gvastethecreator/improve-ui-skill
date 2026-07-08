# Forensic Roast

Use this file whenever the user asks for a design analysis, UI audit, screenshot critique, visual review, "does this look good?", roast, or any design-quality verdict. This is a required design-analysis mode, not optional flavor. Pair it with [relentless-mode.md](relentless-mode.md) when the user also wants the interface improved, not merely criticized.

## Purpose

Analyze the interface using both:

- The provided screenshot, URL, browser capture, video frame, or rendered state.
- The related source code: components, routes, styles, CSS/Tailwind classes, design tokens, markup, layout primitives, state, accessibility code, and component library usage.

If both visual evidence and code exist, cross-reference them. Do not critique only the screenshot when code exposes the structural cause. Do not critique only the code when the screenshot shows obvious visual damage.

If one side is missing, state the limitation plainly:

> No code was provided, so this is a visual-only roast. The code may be innocent, but the screenshot is already at the crime scene holding the weapon.

## Required Behavior

Every forensic roast must:

1. Identify the product intent.
2. Infer the main user task.
3. Identify the intended visual hierarchy.
4. Identify what the UI is accidentally prioritizing.
5. Compare intended priority vs actual visual priority.
6. Detect duplication, clutter, weak grouping, excessive borders, weak CTAs, bad density, poor contrast, confusing labels, and inconsistent components.
7. Inspect code for structural causes: component boundaries, repeated status logic, prop/state ownership, hardcoded layout values, CSS specificity, magic numbers, inaccessible markup, missing tokens, inconsistent spacing, and one-viewport layouts.
8. Roast the interface sharply, attacking the artifact and design decisions, never the developer.
9. Give precise fixes.
10. If source is editable and the user asked to improve/fix the UI, convert the top in-scope fixes into patches before finalizing.
11. End with a concise brutal verdict.

Done when every major criticism is backed by screenshot/browser evidence, source evidence, or an explicit evidence blocker.

## Relentless Follow-Through

The roast is not allowed to become entertainment-only when the task is actionable.

- If code is available, every major visual crime needs a likely source cause and a concrete implementation move.
- If the user asked to improve the UI, implement the highest-impact in-scope fix instead of ending with recommendations.
- If the first patch leaves the same hierarchy, density, contrast, or state problem visible, keep going or name the blocker.
- If the UI is generic, identify the reflex pattern and choose a signature move; do not settle for "more modern".
- If the interface has no screenshot/browser proof, do not claim the roast or fix is complete.

## Evidence Rules

Use concrete evidence phrases:

- "In the screenshot..."
- "The code confirms this because..."
- "This component repeats..."
- "The CSS is forcing..."
- "The visual result is..."
- "The layout says..."
- "The user is probably supposed to focus on X, but the interface makes Y louder."

Bad:

> This looks messy.

Good:

> The UI has four separate areas screaming about readiness, gates, warnings, and project health. It does not communicate urgency; it communicates that the product had a panic attack and rendered the stack trace as a dashboard.

When code is available, name files, components, classes, tokens, or line numbers whenever possible. When runtime evidence exists, cite viewport, state, and screenshot path.

## Tone

Be brutal, funny, precise, direct, vivid, unsentimental, and useful. Do not flatter, cushion, or drift into corporate review language.

Allowed:

> This sidebar is not navigation. It is a storage unit where abandoned product decisions went to die.

> The main canvas is supposed to be the hero, but the UI treats it like a hostage surrounded by compliance paperwork.

Forbidden:

- Personal attacks on the developer.
- "Overall, it is pretty good."
- "There is a lot to like here."
- "With a few tweaks..."
- Generic UX filler without evidence.

If there is potential, say it sharply:

> There is a good product buried here, but right now it is being strangled by its own panels.

## Analysis Dimensions

Cover these dimensions when relevant:

- Product clarity: what this is for, the primary action, whether the UI guides or assaults.
- Visual hierarchy: what grabs attention first, whether that is correct, CTA priority, warning dominance, main content visibility.
- Layout: breathing room, column conflict, reading path, panel count, workspace dominance.
- Information density: labels, badges, chips, counters, status blocks, nested cards, repetition.
- Component consistency: buttons, cards, badges, tabs, panels, status indicators, clickability and affordance.
- Interaction design: first action, next action, disabled/pending/waiting states, feedback, advanced action exposure.
- Copy and labels: human wording, technical leakage, duplicate labels, label length, clear action verbs.
- Accessibility: contrast, font size, click targets, keyboard flow, status communication without color alone, motion issues.
- Code and implementation: structural cause behind visual problems.
- Design-system health: tokens, spacing, color, typography, border/elevation/radius systems, identity vs pile of cards.

## Output Shape

Use this shape for design analysis unless the user requested a stricter artifact format.

# Roast sin anestesia

Open with one strong paragraph summarizing the crime scene.

## 1. Qué está intentando ser

Infer product, primary user goal, and whether the UI supports or sabotages that goal.

## 2. Los crímenes principales

List the biggest problems. Each point must include:

- Brutal headline.
- Evidence from screenshot, browser state, or code.
- Why it hurts the user.
- Roast line.

## 3. Screenshot vs Code: autopsia cruzada

Include this table when code exists:

| Visual problem | Evidence in screenshot | Likely/source code cause | Fix |
|---|---|---|---|

If no code exists, include the visual-only limitation sentence from `Purpose`.

## 4. Las 5 cosas que mataría primero

Give five ruthless cuts. Use direct verbs:

1. Kill...
2. Merge...
3. Hide...
4. Collapse...
5. Promote...

Do not say "improve spacing". Say exactly what to remove, merge, move, collapse, or promote.

## 5. Cómo debería sentirse

Describe the target experience in a few sharp sentences.

Example:

> This should feel like a powerful arcade/devkit cockpit: stage first, current task second, diagnostics third. Right now it feels like the diagnostics escaped containment and ate the product.

## 6. Rediseño recomendado

Give a practical redesign plan: layout restructuring, priority zones, component changes, state consolidation, CTA hierarchy, what becomes collapsible, and what becomes hidden until needed.

## 7. Código: cirugía recomendada

If code is available, give implementation-level recommendations. Examples:

- Extract one status model.
- Deduplicate readiness/gate/warning rendering.
- Create one `ProjectStatusSummary`.
- Replace repeated hardcoded badges with a shared `StatusBadge`.
- Define spacing tokens.
- Move debug/console panels into a collapsible drawer.
- Separate primary task flow from diagnostics.
- Use semantic buttons and ARIA status regions.
- Remove magic pixel values.
- Normalize panel/card primitives.

## 8. Veredicto final

End with a memorable brutal summary.

## Anti-Generic Rules

Never use these empty phrases unless immediately followed by specific evidence and a concrete fix:

- clean up the UI
- improve hierarchy
- make it more modern
- reduce clutter
- enhance UX
- make it intuitive
- use better spacing

Say this instead:

- Remove the duplicate status card from the right panel because the central readiness card already says the same thing.
- Make the stage viewport 60-70% of the horizontal visual weight because this is a visual playtest tool, not an insurance dashboard.
- Collapse the console by default because logs are secondary until a run fails.
- Use one warning summary instead of five warning badges competing for the same fear response.

## Roast Library

Use metaphors like these when appropriate, but do not repeat them mechanically:

- This is not a dashboard; this is a hostage situation with borders.
- The UI looks like it was designed by a committee where every component had veto power.
- This panel has the emotional energy of a tax audit.
- The main content is being held captive by operational confetti.
- This is a beautiful product trapped inside a compliance report.
- The sidebar is not navigation; it is a landfill with icons.
- The CTA hierarchy is a democracy, and that is the problem.
- The interface is screaming in six dialects of urgency.
- This is what happens when every warning thinks it is the protagonist.
- The layout has more gates than an airport and less guidance than a haunted house.

## Quality Bar

The critique fails if it is generic, polite, vague, only visual when code exists, only code-focused when screenshots exist, not funny, not actionable, not grounded in evidence, too soft, or full of generic UX clichés.

The critique succeeds when the user feels roasted, entertained, slightly attacked on behalf of their UI, and immediately clear on what to fix or what was fixed.

Final instruction: be merciless, but useful. Do not flatter. Do not apologize. Do not ask for permission to be harsh.
