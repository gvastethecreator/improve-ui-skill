# Existing Product Contexts

Nontrivial visual repair, audit, redesign, or quality verdict: diagnose context before importing layout, density, motion, or polish rules. Same dark shell can be a studio, command center, game menu, or decorative landing — repair follows the user loop.

## Contents

- [Context Read](#context-read)
- [Evidence And Hybrid Boundaries](#evidence-and-hybrid-boundaries)
- [Creative Studio Or Editor](#creative-studio-or-editor)
- [Dashboard Or Analytics Surface](#dashboard-or-analytics-surface)
- [Command Center Or Operations Console](#command-center-or-operations-console)
- [Game UI Or Existing Web HUD](#game-ui-or-existing-web-hud)
- [Interactive Prototype, Lab, Or Simulator](#interactive-prototype-lab-or-simulator)
- [Transactional App, Admin, Or Workflow Tool](#transactional-app-admin-or-workflow-tool)
- [Landing, Commerce, Or Editorial Surface](#landing-commerce-or-editorial-surface)
- [Context Delta And Failure Gate](#context-delta-and-failure-gate)
- [Calibration Examples](#calibration-examples)

## Context Read

Build from repo structure, route names, product copy, screenshots, runtime, keyboard bindings, state models, fixtures:

```text
primary archetype: the context that governs the main surface
secondary regions: bounded contexts inside it
user mode: observe | decide | act | create | monitor | respond | explore | choose
primary artifact: the object that should dominate
frequency: once | occasional | repeated | continuous
pressure: time, consequence, expertise, environment
input: pointer | keyboard | touch | controller | mixed
spatial model: document | workspace | viewport overlay | multi-panel shell | full-screen scene
costly states: failures, transitions, content extremes, and updates that change the design
proof matrix: representative states x viewports x interactions x detail crops
```

Classify from behavior, not appearance. Canvas plus inspector → studio. Live alert ownership and recovery → command center. Charts for a periodic question → dashboard. Controller-driven info over a moving scene → game HUD.

If two classifications imply incompatible repairs and evidence cannot resolve them, ask one question. Else state the assumption and continue. No generic UI advice while primary context is unknown.

## Evidence And Hybrid Boundaries

Evidence order:

1. User actions, route/state behavior, and domain language.
2. Persistent product objects and state transitions.
3. Input model, frequency, time pressure, and failure consequence.
4. Existing layout and visual style.

Visual style is last — weak UI often wears the wrong costume.

Decompose hybrids by region and moment:

- Product page with a live preview: landing around a bounded product artifact.
- Level editor is a studio even though it creates a game; play-test can become game context.
- Browser game with HTML/CSS HUD and menus stays in scope. Renderer, shader, camera, and gameplay-system implementation routes to a specialist.
- Analytics inside a studio form a dashboard region but must not demote canvas or timeline.
- Command center can contain charts, but incident lifecycle and response govern the shell.

Record the boundary. Do not average brand, product, operational, and game rules into one hybrid register.

## Creative Studio Or Editor

Cues: canvas, scene, document, timeline, layers, selection, inspector, tools, zoom, history, autosave, export, direct manipulation, keyboard commands.

Contract:

- Artifact, timeline, or selected object owns visual weight; mode, selection, time/zoom, save, and active tool stay legible.
- Inspector groups by affected object and intent. Changes are immediate, reversible, attributable.
- Panels have explicit scroll ownership; no nested scroll traps.

Repair:

1. Restore artifact sovereignty and stable workspace geometry.
2. Repair mode, selection, save, undo, conflict, and destructive-action clarity.
3. Consolidate inspector hierarchy and repeated control spacing.
4. Fix panel overflow, icon family, optical alignment, and compact-detail craft.
5. Add expression from the artifact or interaction, not dashboard chrome.

Do not transplant KPI cards, marketing typography, orchestrated page-load motion, modal-first flow, or an enterprise-analytics costume.

Prove: new/blank, loaded, selected/multi-selected, unsaved/saving/saved, conflicting or invalid edit, undo/redo, collapsed panels, long names, minimum workspace, export success/failure, real-size icon rows. [studio surgery](../examples/context-studio-surgery.md).

## Dashboard Or Analytics Surface

Cues: periodic scanning, filters, time range, cohorts, metrics, charts, comparison, drill-down, export, a decision derived from evidence.

Contract:

- One question or decision governs hierarchy.
- Comparison, denominator, unit, threshold, freshness, and uncertainty stay visible; filters/scope stay attached to affected data.
- Overview leads to stable exact evidence. Zero, missing, stale, suppressed, and uncertain are distinct.

Repair:

1. Name the first decision and remove evidence that does not serve it.
2. Fix data meaning, scale, labels, freshness, and comparison.
3. Replace equal KPI-card soup with question-led grouping.
4. Stabilize filter, selection, drill-down, loading, and update behavior.
5. Finish alignment, tabular numerals, chart/table detail, and responsive structure.

Do not use chart variety as visual interest or promote every number into a card. Prove: typical, zero, missing, stale, partial, uncertain, filtered, long-label, high-volume, narrow.

## Command Center Or Operations Console

Cues: continuous monitoring, live feeds, incidents, alerts, acknowledgement, ownership, escalation, handoff, audit trail, partial subsystem failure, recovery actions.

Contract:

- Normal, degraded, incident, acknowledged, assigned, recovering, and resolved are distinct.
- Freshness, source health, confidence, scope, owner, and next safe action stay connected.
- Critical items stay spatially stable under updates. Salience reflects operational consequence — not brand drama.
- Wallboard observation and operator action are separated when both exist.

Repair:

1. Restore the alert-to-evidence-to-action-to-recovery chain.
2. Fix freshness, source failure, ownership, acknowledgement, and audit visibility.
3. Stabilize sorting, focus, keyboard triage, and handoff.
4. Collapse ambient diagnostics and remove equal panel priority.
5. Eliminate sci-fi glow, fake terminals, constant pulsing, and decorative danger color.

Prove: normal baseline, one incident, alert flood, stale/offline feed, partial failure, acknowledgement, assignment, recovery, resolution, drill-down, keyboard path, handoff. [command-center surgery](../examples/context-command-center-surgery.md).

## Game UI Or Existing Web HUD

Cues: live scene, player state, objective, inventory, dialogue, map, pause, matchmaking, results, controller focus, input glyphs, safe areas, information read under time pressure.

Classify the moment first: live play, pause, inventory, map, dialogue, loadout, tutorial, results, or settings. Then presentation: diegetic, spatial, meta, or non-diegetic.

Contract:

- Gameplay focal area stays clear; persistent elements earn their footprint.
- Hierarchy follows urgency, depletion, threat, objective, team state, and player intent.
- Text and indicators survive bright, dark, noisy, and moving scenes.
- Respect controller, keyboard, touch, glyph switching, safe areas, localization, and stream overlays.
- Menus and inventory use explicit navigation/focus, not live-HUD minimalism.

Repair:

1. Protect gameplay visibility and safe zones.
2. Repair glance hierarchy, scene contrast, state exclusivity, and temporal feedback.
3. Fix controller focus, input changes, pause/menu boundaries, and localization pressure.
4. Remove admin cards, native app sidebars, nested scroll, decorative blur, and weak bespoke glyphs.
5. Check motion and transitions during representative play, not only on a static mockup.

Prove: calm and noisy play, critical state, objective update, input switch, pause/menu focus, long localization, common aspect ratios, bright/dark scenes, reduced motion, overlay collisions. [game HUD surgery](../examples/context-game-hud-surgery.md).

## Interactive Prototype, Lab, Or Simulator

Cues: output or playable mechanism is the product — parameters, presets, reset, randomization, export, debug info, capability/performance limits.

Keep output in the first viewport. Tether controls to visible effects. Express presets as intent. Subordinate diagnostics. Preserve reproducibility, reset, fallback, export. Repair blank output, confusing parameter mapping, control overflow, and unsupported capability before styling the shell.

Prove: nonblank output, meaningful change, extremes, reset, export failure, unsupported capability, narrow control access, offscreen behavior, reduced motion, representative performance.

## Transactional App, Admin, Or Workflow Tool

Cues: forms, records, tables, approvals, settings, schedules, queues, permissions, bulk actions, known process steps.

Prioritize active record, scope, next safe action, familiar controls, stable navigation, validation, pending/retry, URL state, permissions, recovery. Density can be correct. Repair shared primitives and state models before decorative polish.

Prove: empty, loading, error, permission, validation, double-submit, unsaved work, large data, long content, translation, narrow layouts. Do not import brand typography, bespoke standard controls, or decorative empty-state theater.

## Landing, Commerce, Or Editorial Surface

Cues: choose, trust, buy, understand, or explore — not repeatedly operate a tool.

- Landing: preserve offer, proof, objection, action, SEO, analytics, and real asset provenance.
- Commerce: preserve variant, availability, price, delivery, returns, media inspection, and commitment consequence.
- Editorial/cultural: preserve reading rhythm, orientation, direct access, rights, and earned discovery.

Repair decision path and content structure before effects. Do not inject dashboard density into persuasion, force SaaS funnels onto cultural work, or use product chrome as brand identity. Prove: first viewport, decisive proof/detail, commitment or form state, mobile rhythm, media fallback, relevant legal/analytics behavior.

## Context Delta And Failure Gate

For audits and repairs:

```text
expected for this context: the hierarchy, interaction, state, and proof contract
observed: screenshot/runtime/source evidence
delta: the specific mismatch and user consequence
root: primitive | token | layout shell | state model | local implementation
repair: smallest systemic move that restores the context
proof: archetype-specific state and viewport evidence
```

Incomplete when:

- same generic card-grid, hero, or sidebar prescription is offered to another archetype;
- primary artifact or action remains subordinate to borrowed chrome;
- scrolling, density, motion, or navigation model belongs to another context;
- proof matrix covers generic breakpoints but misses the product costly moments;
- a hybrid silently mixes incompatible rules;
- a surface-specific criticism comes from code or an unreadable screenshot without rendered context.

If one correction fails, revisit the context card before changing spacing, colors, or effects.

## Calibration Examples

Reasoning checks, not templates:

- [Creative studio surgery](../examples/context-studio-surgery.md)
- [Command-center surgery](../examples/context-command-center-surgery.md)
- [Game HUD surgery](../examples/context-game-hud-surgery.md)

Each example names the wrong cross-context transplant, preservation contract, systemic cut order, and proof matrix — not a substitute for target-product evidence.
