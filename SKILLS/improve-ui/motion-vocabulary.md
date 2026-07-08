# Motion Vocabulary

Use this file when a user describes an animation vaguely, when a review finding needs a precise name, or when a prompt/design note would be clearer with shared motion language.

Keep this as a compact local naming map for interface motion.

## How To Use

- Lead with the term, then one short definition.
- If two terms fit, list the best match first and explain the difference.
- Use terms to diagnose and route work, not to decorate the answer.
- Pair the term with a fix path: transition recipe, Motion/spring, CSS transition, WAAPI, or deletion.

## Term Groups

Entrances and exits:

- Fade: opacity-only appearance or disappearance.
- Slide: element enters or exits from an edge.
- Scale: element grows or shrinks around a transform origin.
- Pop: scale plus slight overshoot; reserve for playful or rare feedback.
- Reveal: content is uncovered by clipping or masking.
- Enter/exit: lifecycle motion when something mounts or unmounts.

Sequencing and timing:

- Keyframes: fixed timeline. Good for one-shot sequences, weak for rapid toggles.
- Tween/interpolation: generated in-between frames between two values.
- Stagger: several elements enter in sequence; use `30ms-80ms` gaps.
- Orchestration: multiple animations timed as one intentional moment.
- Delay/duration/fill mode: start time, length, and whether first/last frame persists.
- Stepped animation: discrete frame jumps, useful for counters or sprite-like effects.

Transforms and physicality:

- Translate: move on X/Y.
- Scale: resize visually; children scale too.
- Rotate/skew: angular or sheared motion.
- 3D tilt/flip: rotateX/rotateY with perspective.
- Perspective: depth strength for 3D transforms.
- Transform origin: anchor point for scale/rotation.
- Origin-aware animation: anchored surface appears from its trigger instead of center.

State transitions:

- Crossfade: one state fades out while another fades in in the same place.
- Continuity transition: before/after stay visually connected.
- Morph: shape or surface changes identity smoothly.
- Shared element transition: one logical object travels/transforms between views.
- Layout animation: position or size change animates instead of snapping.
- Accordion/collapse: height or grid-row reveal for a section.
- Direction-aware transition: forward/back navigation moves in opposite directions.

Scroll and navigation:

- Scroll reveal: content appears as it enters the viewport.
- Scroll-driven animation: progress tied directly to scroll position.
- Parallax: depth from layers moving at different scroll speeds.
- Page transition: route/view navigation animation.
- View transition: browser-level shared transition between states or pages.

Feedback and interaction:

- Hover effect: pointer-over feedback; gate to fine hover pointers.
- Press/tap feedback: small scale or visual acknowledgement on press.
- Hold to confirm: progress fills while the user keeps pressing.
- Drag/swipe: pointer-driven movement, usually spring or direct transform.
- Drag to reorder: list items move to make space.
- Swipe to dismiss: card/toast/drawer leaves by drag distance or velocity.
- Rubber-banding: resistance past a natural boundary, then snap back.
- Shake/wiggle: short rejection or error feedback.
- Ripple: point-origin tap confirmation; use sparingly in systems that own it.

Easing and springs:

- Ease-out: responsive default for enters, exits, opens, and closes.
- Ease-in: avoid for UI entry/opening.
- Ease-in-out: movement between two visible positions.
- Linear: loops and constant progress only.
- Cubic-bezier: custom easing curve.
- Asymmetric easing: different acceleration and deceleration for a livelier feel.
- Spring: physics-driven motion with velocity retention.
- Stiffness/tension, damping, mass, bounce: spring feel controls.
- Perceptual duration: how long a spring feels active, not when math fully settles.
- Momentum/velocity: carried motion after a drag or interruption.
- Interruptible animation: motion can retarget mid-flight.

Looping and ambient motion:

- Marquee: continuous scrolling content.
- Loop/alternate: repeating timeline, optionally reversing each cycle.
- Orbit: continuous circular motion.
- Pulse/float/idle animation: ambient attention cues; rare in product UI.

Polish and effects:

- Blur: softens a crossfade or hides tiny transition mismatch.
- Clip-path: hard-edged clipping for reveals, progress, active tabs, comparisons.
- Mask: soft reveal using shape/gradient alpha.
- Before/after slider: draggable comparison wipe.
- Line drawing: SVG path reveal.
- Text morph: character-level text change.
- Skeleton/shimmer: content-shaped loading placeholder with sheen.
- Number ticker: digit roll/count motion.
- Tabular numbers: fixed-width digits that prevent numeric shift.
- Typewriter: character-by-character reveal; use rarely.

Performance terms:

- FPS/frame rate: visual smoothness target.
- Jank/dropped frame: missed frame deadline visible as stutter.
- Compositing: GPU layer motion without layout/paint.
- `will-change`: sparse hint before compositor-friendly motion.
- Layout thrashing: repeated layout reads/writes that force recalculation.

## Review Language

Use these terms in findings:

- "This is a layout animation, not a transform animation."
- "This popover needs origin-aware animation."
- "This is a crossfade that needs blur or a continuity transition."
- "This stagger is decorative and slows a dense product workflow."
- "This spring is useful because the gesture is interruptible."
- "This should be deleted: high-frequency action with no state-clarity job."
