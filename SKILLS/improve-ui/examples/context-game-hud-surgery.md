# Context example: existing web game HUD surgery

## Target

HTML/CSS HUD and menu layer around a cooperative browser-game canvas. Renderer, shaders, camera, and gameplay systems are outside scope.

## Context read

`game UI + act/respond + world/combat focal area + continuous mixed input + viewport overlay + noisy-play/input-switch proof`

## Wrong diagnosis

Treating the HUD as a dashboard yields floating cards, a web-app sidebar, tiny outline icons, blur over gameplay, and scrollable live status. A clean Figma frame can still fail the moment the scene becomes bright, fast, localized, or controller-driven.

## Preserve

- Gameplay focal area, subtitle space, and safe zones.
- Existing semantic player/objective states and pause behavior.
- Controller focus model, input glyph switching, and accessibility settings.
- Renderer/gameplay boundaries.

## Systemic cut order

1. Classify live play, pause, inventory, map, dialogue, results, and settings separately.
2. Move persistent status to stable safe-area zones and remove nonessential occupancy.
3. Tie salience to urgency, threat, depletion, objective, and player intent.
4. Repair readability against bright, dark, noisy, and moving scenes.
5. Fix controller focus, input switching, localization, aspect ratios, and overlay collisions.
6. Replace weak bespoke glyphs, accidental gradients, native scrollbars in menus, and misaligned HUD rows.

## Proof matrix

- States: calm traversal, combat, critical health, objective update, full squad, pause, inventory, error/reconnect.
- Interactions: controller and keyboard navigation, input switch, pause/resume, menu scroll, focus return.
- Viewports: common 16:9, ultrawide, narrow/mobile when supported, and safe-area variants.
- Detail evidence: real gameplay backgrounds, controller focus, glyphs at rendered size, localization, and reduced motion.

## Claim limit

This example covers existing web UI integration only. Renderer fidelity, gameplay balance, camera behavior, and engine systems require their specialist workflows.
