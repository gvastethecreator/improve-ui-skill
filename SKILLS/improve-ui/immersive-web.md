# Immersive Web

Use this for canvas, WebGL, Three.js, particle systems, globes, 3D objects, physics, no-code embeds, shader-like backgrounds, and cinematic hero layers. These effects are high-risk polish: they must earn their cost.

Keep immersive effects evidence-first: they must earn their runtime, visual, and accessibility cost.

## Use When

- The visual is a real product artifact, brand artifact, data object, place, instrument, map, game/tool state, or hero proof.
- The user explicitly asks for immersive motion, 3D, particles, physics, scroll storytelling, or a specific library.
- The page is brand/marketing/prototype work where static layout cannot carry the intended distinction.

Skip when a static image, CSS surface, or screenshot would communicate the idea with less cost.

## Stack Choice

Prefer the repo's existing stack. Add a dependency only when the effect needs it.

- Three.js: real 3D, product object, custom camera/material/lighting, particles, shaders.
- Cobe or Globe.gl: globe visualization; choose Cobe for lightweight decorative/marker globes, Globe.gl for richer data layers.
- Canvas/WebGL custom: procedural background, dither, laser, grid, particles when DOM/CSS would be fake or heavy.
- Matter.js: playful 2D physics with collision/drag where the behavior is the feature.
- Vanta/Unicorn/embed tools: only when the project already uses them or the user supplies the embed/project. Treat as external runtime with performance and fallback risk.
- GSAP/Lenis/ScrollTrigger: only for scroll storytelling that requires timeline control; otherwise use native CSS/IntersectionObserver.

## Required Gates

Every immersive effect needs:

- Foreground readability: text, controls, and focus states remain clear above the effect.
- Reduced motion: still frame, disabled scroll scrub, slower/no ambient loops, or equivalent.
- Offscreen behavior: RAF/canvas/WebGL/physics loops pause when hidden or outside the viewport.
- Density caps: clamp device pixel ratio, particle count, object count, shadow quality, and texture resolution.
- Cleanup: dispose renderers, geometries, materials, textures, listeners, observers, timers, and physics worlds on unmount/route change.
- Mobile fallback: lower density or static image when device/pointer/viewport makes the effect fragile.
- Proof: screenshot plus runtime check; for motion/performance, inspect frames, console errors, and offscreen animation findings.

## Recipe Notes

- 3D object: use real geometry, perspective camera, physically plausible material, simple lighting, subtle rotation/floating, and a static poster fallback.
- Background grid: keep lines thin, motion slow, particles sparse, and parallax damped. Avoid loud neon floors unless the brief asks for them.
- Particle globe: use it for geography, network, orbital, or system metaphor. Keep it connected to foreground content.
- Dither or laser background: use as a restrained brand texture, not a full-page readability tax.
- Physics: constrain bounds, pause when offscreen, keep collision count low, and never block navigation or text selection.
- Scroll story: pin only the sections that need story progression. Refresh layout after images/fonts and provide non-scrub reduced motion.

## Review Findings

Escalate as P1/P2 when:

- The effect hides text, controls, focus, or first viewport CTA.
- It runs offscreen, in a hidden tab, or after route change.
- It causes console/WebGL context errors, long tasks, frame spikes, or layout shifts.
- It lacks reduced-motion behavior.
- It adds a heavy dependency for a decorative effect that CSS/static media could cover.
- It is disconnected from product, brand, data, or proof.

## Done

- The effect's purpose is named.
- The stack choice is justified by the repo and the visual job.
- Reduced motion, fallback, offscreen pause, density caps, and cleanup are implemented or explicitly blocked.
- Browser/screenshot proof shows the effect is visible, readable, and not blank.
