# Existing Product Contexts

Use this reference for every nontrivial visual repair, audit, redesign, or quality verdict. Diagnose the product context before importing a layout, density, motion, or polish rule. The same dark shell can be a studio, command center, game menu, or decorative landing; the correct repair changes with the user's loop.

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

Build this card from repository structure, route names, product copy, screenshots, runtime behavior, keyboard bindings, state models, and fixtures:

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

Classify from behavior, not appearance. A canvas plus inspector usually signals a studio; live alert ownership and recovery signal a command center; charts used for a periodic question signal a dashboard; controller-driven information over a moving scene signals a game HUD.

If two classifications imply incompatible repairs and the evidence cannot resolve them, ask one question. Otherwise state the assumption and continue. Do not return generic UI advice while the primary context remains unknown.

## Evidence And Hybrid Boundaries

Prefer evidence in this order:

1. Actual user actions, route/state behavior, and domain language.
2. Persistent product objects and state transitions.
3. Input model, frequency, time pressure, and failure consequence.
4. Existing layout and visual style.

Visual style is last because weak UI often wears the wrong costume already.

Decompose hybrids by region and moment:

- A public product page with a live preview is landing context around a bounded product artifact.
- A level editor is a studio even though it creates a game; play-test mode may temporarily become game context.
- A browser game with HTML/CSS HUD and menus stays in scope here; renderer, shader, camera, and gameplay-system implementation routes to a specialist.
- Analytics inside a studio form a dashboard region but must not demote the canvas or timeline.
- A command center may contain charts, but incident lifecycle and response govern the shell.

Record the boundary. Do not average brand, product, operational, and game rules into one vague hybrid register.

## Creative Studio Or Editor

Evidence cues: canvas, scene, document, timeline, layers, selection, inspector, tools, zoom, history, autosave, export, direct manipulation, and keyboard commands.

Expected contract:

- Artifact, timeline, or selected object owns visual weight.
- Mode, selection scope, time/zoom, save state, and active tool stay legible.
- Inspector controls group by affected object and intent.
- Changes are immediate, reversible, and attributable.
- Panels have explicit scroll ownership and do not form nested scroll traps.

Repair order:

1. Restore artifact sovereignty and stable workspace geometry.
2. Repair mode, selection, save, undo, conflict, and destructive-action clarity.
3. Consolidate inspector hierarchy and repeated control spacing.
4. Fix panel overflow, icon family, optical alignment, and compact-detail craft.
5. Add expression from the artifact or interaction—not from dashboard chrome.

Do not transplant KPI cards, marketing typography, orchestrated page-load motion, or modal-first flow. A studio is not improved by looking more like enterprise analytics.

Prove new/blank, loaded, selected and multi-selected, unsaved/saving/saved, conflicting or invalid edit, undo/redo, collapsed panels, long names, minimum workspace, export success/failure, and real-size icon rows. See [studio surgery](../examples/context-studio-surgery.md).

## Dashboard Or Analytics Surface

Evidence cues: periodic scanning, filters, time range, cohorts, metrics, charts, comparison, drill-down, export, and a decision derived from evidence.

Expected contract:

- One question or decision governs hierarchy.
- Comparison, denominator, unit, threshold, freshness, and uncertainty remain visible.
- Filters and scope stay attached to affected data.
- Overview leads to stable exact evidence.
- Zero, missing, stale, suppressed, and uncertain are distinct.

Repair order:

1. Name the first decision and remove evidence that does not serve it.
2. Fix data meaning, scale, labels, freshness, and comparison.
3. Replace equal KPI-card soup with question-led grouping.
4. Stabilize filter, selection, drill-down, loading, and update behavior.
5. Finish alignment, tabular numerals, chart/table detail, and responsive structure.

Do not use chart variety as visual interest or promote every number into a card. Prove typical, zero, missing, stale, partial, uncertain, filtered, long-label, high-volume, and narrow states.

## Command Center Or Operations Console

Evidence cues: continuous monitoring, live feeds, incidents, alerts, acknowledgement, ownership, escalation, handoff, audit trail, partial subsystem failure, and recovery actions.

Expected contract:

- Normal, degraded, incident, acknowledged, assigned, recovering, and resolved states are distinct.
- Freshness, source health, confidence, scope, owner, and next safe action remain connected.
- Critical items stay spatially stable under updates.
- Salience reflects operational consequence, not brand drama.
- Wallboard observation and operator action are separated when both exist.

Repair order:

1. Restore the alert-to-evidence-to-action-to-recovery chain.
2. Fix freshness, source failure, ownership, acknowledgement, and audit visibility.
3. Stabilize sorting, focus, keyboard triage, and handoff.
4. Collapse ambient diagnostics and remove equal panel priority.
5. Eliminate sci-fi glow, fake terminals, constant pulsing, and decorative danger color.

Prove normal baseline, one incident, alert flood, stale/offline feed, partial failure, acknowledgement, assignment, recovery, resolution, drill-down, keyboard path, and handoff. See [command-center surgery](../examples/context-command-center-surgery.md).

## Game UI Or Existing Web HUD

Evidence cues: a live scene, player state, objective, inventory, dialogue, map, pause, matchmaking, results, controller focus, input glyphs, safe areas, and information read under time pressure.

First classify the moment: live play, pause, inventory, map, dialogue, loadout, tutorial, results, or settings. Then classify presentation as diegetic, spatial, meta, or non-diegetic.

Expected contract:

- Gameplay focal area remains clear and persistent elements earn their footprint.
- Hierarchy follows urgency, depletion, threat, objective, team state, and player intent.
- Text and indicators survive bright, dark, noisy, and moving scenes.
- Controller, keyboard, touch, glyph switching, safe areas, localization, and stream overlays are respected.
- Menus and inventory use explicit navigation/focus rather than live-HUD minimalism.

Repair order:

1. Protect gameplay visibility and safe zones.
2. Repair glance hierarchy, scene contrast, state exclusivity, and temporal feedback.
3. Fix controller focus, input changes, pause/menu boundaries, and localization pressure.
4. Remove admin cards, native app sidebars, nested scroll, decorative blur, and weak bespoke glyphs.
5. Verify motion and transitions during representative play, not only on a static mockup.

Prove calm and noisy play, critical state, objective update, input switch, pause/menu focus, long localization, common aspect ratios, bright/dark scenes, reduced motion, and overlay collisions. See [game HUD surgery](../examples/context-game-hud-surgery.md).

## Interactive Prototype, Lab, Or Simulator

Evidence cues: the output or playable mechanism is the product, with parameters, presets, reset, randomization, export, debug information, and capability/performance limits.

Keep the actual output in the first viewport. Tether controls to visible effects, express presets as intent, subordinate diagnostics, and preserve reproducibility, reset, fallback, and export. Repair blank output, confusing parameter mapping, control overflow, and unsupported capability before styling the shell.

Prove nonblank output, meaningful change, extremes, reset, export failure, unsupported capability, narrow control access, offscreen behavior, reduced motion, and representative performance.

## Transactional App, Admin, Or Workflow Tool

Evidence cues: forms, records, tables, approvals, settings, schedules, queues, permissions, bulk actions, and known process steps.

Prioritize active record, scope, next safe action, familiar controls, stable navigation, validation, pending/retry behavior, URL state, permissions, and recovery. Density may be correct. Repair shared primitives and state models before decorative polish.

Prove empty, loading, error, permission, validation, double-submit, unsaved work, large data, long content, translation, and narrow layouts. Do not import brand typography, bespoke standard controls, or decorative empty-state theater.

## Landing, Commerce, Or Editorial Surface

Evidence cues: the user chooses, trusts, buys, understands, or explores rather than repeatedly operating a tool.

- Landing: preserve offer, proof, objection, action, SEO, analytics, and real asset provenance.
- Commerce: preserve variant, availability, price, delivery, returns, media inspection, and commitment consequence.
- Editorial/cultural: preserve reading rhythm, orientation, direct access, rights, and earned discovery.

Repair the decision path and content structure before applying effects. Do not inject dashboard density into persuasion, force SaaS funnels onto cultural work, or use product chrome as brand identity. Prove first viewport, decisive proof/detail, commitment or form state, mobile rhythm, media fallback, and relevant legal/analytics behavior.

## Context Delta And Failure Gate

For audits and repairs, state:

```text
expected for this context: the hierarchy, interaction, state, and proof contract
observed: screenshot/runtime/source evidence
delta: the specific mismatch and user consequence
root: primitive | token | layout shell | state model | local implementation
repair: smallest systemic move that restores the context
proof: archetype-specific state and viewport evidence
```

Treat the run as incomplete when:

- the same generic card-grid, hero, or sidebar prescription would be offered to another archetype;
- the primary artifact or action remains subordinate to borrowed chrome;
- the scrolling, density, motion, or navigation model belongs to another context;
- the proof matrix covers generic breakpoints but misses the product's costly moments;
- a hybrid silently mixes incompatible rules;
- a surface-specific criticism is made from code or an unreadable screenshot without rendered context.

After one failed correction, revisit the context card before changing spacing, colors, or effects again.

## Calibration Examples

Use these as reasoning checks, not visual templates:

- [Creative studio surgery](../examples/context-studio-surgery.md)
- [Command-center surgery](../examples/context-command-center-surgery.md)
- [Game HUD surgery](../examples/context-game-hud-surgery.md)

Each example names the wrong cross-context transplant, preservation contract, systemic cut order, and proof matrix. It does not replace evidence from the target product.
