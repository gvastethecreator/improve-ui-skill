# Reference Capture

Use this when the user supplies or asks for a URL, HTML export, screenshot, image, video, screen recording, inspiration page, or visual direction that should guide the UI. The goal is evidence-backed extraction, not longer prompting.

Keep this local, portable, and focused on evidence-backed extraction.

## When To Use

- Open-ended brand, marketing, portfolio, prototype, hero, or visual-redesign work where guessing would produce generic UI.
- A supplied page/video/screenshot contains useful layout, typography, spacing, motion, copy rhythm, media treatment, or interaction details.
- The user asks to recreate, remix, study, capture, or prompt from a reference.

Skip for tiny bug fixes, dense product controls, or strict design-system work unless the reference directly shows the target state.

## Capture Route

Pick the narrowest capture:

- Screenshot/image: inspect the visible system. Extract hierarchy, grid, type scale, palette roles, radius logic, shadows, media edges, icons, copy density, and one or two signature details.
- URL/page: capture the relevant viewport and any sections that affect the change. If lazy loading, scroll animation, canvas, or WebGL makes full-page screenshots unreliable, use viewport slices and section crops instead of trusting a blank or sparse full-page capture.
- HTML export: run or open the page, capture screenshots, then extract reusable interaction prompts or implementation notes per section/state.
- Video/screen recording: analyze in beats. For each beat, capture purpose, layout, visual detail, animation, scroll behavior, interaction, timing/easing, and implementation risk.
- Inspiration sweep: collect a small set with a reason for each reference. Prefer one strong reference per section/state over a broad mood board.

Done when the reference evidence can point to a concrete implementation decision.

## Extraction Contract

Record only facts that will change the work:

- Source: path/URL, viewport, timestamp/frame, or crop name.
- Role: exact recreation, visual inspiration, motion inspiration, structure inspiration, or anti-reference.
- System: typography, color roles, spacing, grid, surface rules, imagery/media treatment, icon/logo style, motion vocabulary.
- Constraints: what not to copy, what must survive responsive layout, and what the existing product system overrides.
- Proof gaps: missing assets, unavailable video frames, blocked URL, unclear text, low-resolution crop, or inaccessible state.

Do not paste a long visual description into the final implementation. Convert it into tokens, components, layout rules, and proof targets.

## Prompt Pack Shape

Use this shape only when the deliverable is a reusable prompt or a reference-led implementation brief:

```text
Build: <surface/section/state>
Reference role: <recreate/remix/inspiration>
Audience and register:
Layout and hierarchy:
Typography:
Color and surface system:
Media/image treatment:
Motion and interaction:
Responsive constraints:
Accessibility/performance constraints:
Must preserve:
Must avoid:
Success check:
```

For video, repeat layout, visual detail, motion, interaction, and implementation notes for every visible beat in order.

## Guardrails

- References beat paragraphs, but references do not beat the product's existing system.
- Extract the reason a detail works before copying the detail.
- Avoid cloning a full page when the task is a component or one section.
- Avoid importing heavy motion/WebGL stacks just because the reference uses them.
- Keep visual proof attached: before/after screenshot, crop, frame note, or explicit blocker.

## Done

- The selected references are few, named, and relevant.
- The extracted system maps to concrete code decisions.
- The implementation or report states what was copied, adapted, rejected, and why.
- Visual proof confirms the intended hierarchy, spacing, surface, motion, or state.
