# Accessibility

Improve or audit a web path against named accessibility requirements. Do not describe this as WCAG conformance or certification.

## Contents

- [Evidence boundary](#evidence-boundary)
- [Semantics and names](#semantics-and-names)
- [Keyboard and focus](#keyboard-and-focus)
- [Forms and status](#forms-and-status)
- [Images and media](#images-and-media)
- [Contrast, color, and text](#contrast-color-and-text)
- [Pointer, touch, and gestures](#pointer-touch-and-gestures)
- [Dialogs and composite widgets](#dialogs-and-composite-widgets)
- [Motion and material preferences](#motion-and-material-preferences)
- [Verification matrix](#verification-matrix)

## Evidence boundary

Name the target standard and level when compliance language matters. Default: relevant WCAG 2.2 A/AA criteria, project contracts, and platform practices. Do not imply complete coverage.

Separate: automatically detected violations; manual checks completed; user flows and states inspected; criteria not applicable; criteria untested or blocked.

Automated tools find only a subset of accessibility problems. Never convert a clean scanner run into an accessibility pass.

## Semantics and names

Native HTML before ARIA: `button` for actions; links for navigation. Associate controls with visible labels; accessible name must match visible text so voice users can invoke it. Icon-only controls: concise accessible name. Preserve headings, landmarks, lists, tables, and structure-communicating relationships. ARIA only if native semantics cannot express the interaction; keep roles, states, properties in sync. Avoid clickable `div`/`span` repairs that add only `role` — keyboard, focusability, name, and state must also work. If adjacent text already names the action, hide decorative icons from assistive technology.

Do not reason only from JSX. Inspect the computed accessibility tree for complex components.

## Keyboard and focus

Every core action without a pointer: logical tab order; expected keys; visible distinguishable focus; no positive `tabindex` or extra tab stops. Context change: move focus deliberately, then return it. No focus traps except correctly implemented modals. Sticky headers, banners, drawers, overlays must not fully obscure the focused component. Anchored targets: enough `scroll-margin-top` to clear sticky headers and banners. Repeating layouts: skip/navigation when needed.

Test forward and reverse traversal. Check focus in every theme the path uses.

## Forms and status

Persistent label per field — placeholder is not a label. Appropriate `type`, `name`, `autocomplete`, input mode, required/invalid semantics. Disable `spellcheck` only if correction is harmful — email addresses, usernames, codes, tokens. Keep paste, autofill, password managers, and mobile keyboards functional. Associate instructions and errors with the field; keep entered values after failure. Submission failure: focus or summarize the first error; no confusing jump. Expose pending and disabled reasons; prevent harmful duplicate submission; do not hide recovery. Announce important async status and validation changes with an appropriate live region; avoid verbose or constantly updating announcements. Visible text and accessible names must stay consistent. If a compliant alternative is required, avoid authentication that depends only on memory, transcription, or cognitive puzzles.

Server validation owns correctness. Client validation owns timely, accessible feedback.

## Images and media

Alternative text by purpose, not file type:

- Informative: concise alternative text for its contribution in context
- Functional: name the action or destination through the enclosing control
- Decorative or redundant `<img>`: `alt=""`. Do not report as missing alt
- Complex chart, diagram, or map: equivalent explanation or data representation appropriate to the task
- CSS decoration: no information only in the background image

Missing `alt` differs from empty `alt`. Do not add descriptive text to decorative imagery because a detector complained.

Audio/video in scope: captions, transcripts or descriptions, controls, autoplay, and keyboard access for the content and applicable criteria.

## Contrast, color, and text

Evaluate actual rendered colors and the applicable WCAG criterion. Test normal text, large text, icons/control boundaries, focus indicators, selected/disabled states, and text over images or gradients. Do not rely on color alone for status, errors, required fields, or selection. If audience or platform requires it, check forced-colors and high-contrast. If opacity, blending, backdrop, gradients, images, pseudo-elements, or overlays affect the result, do not declare contrast from source tokens alone.

Preserve user text spacing overrides. Line height, paragraph spacing, letter spacing, and word spacing must not cause loss of content or functionality. Do not disable browser zoom through viewport metadata, event handlers, or gesture suppression. Check text at 200% zoom. If applicable, check reflow at the WCAG 1.4.10 equivalent of 320 CSS px/400%.

User-controlled text size is a layout problem: stack icon-plus-label rows; drop optional columns; stop truncating essential names, errors, and primary actions at the largest supported size. Default type scale is not coverage.

Do not override user contrast, transparency, motion, or forced-colors settings to preserve a mock. Custom palettes that claim those modes need matching variants, including a higher-contrast pair.

Treat browser/runtime contrast sampling as a lead; check complex backgrounds by hand.

## Pointer, touch, and gestures

WCAG 2.2 AA target size: actual `24×24 CSS px` minimum or a documented exception, including sufficient spacing. Do not present `44×44` as the AA requirement.

Frequent, risky, coarse-pointer, or edge-positioned controls: `44×44 CSS px` as enhanced AAA or product preference. Dense toolbars can be smaller if the applicable minimum, spacing, and product ergonomics are satisfied.

Also check: target regions do not overlap or trigger adjacent actions; down events do not commit irreversible actions before cancellation is possible; multipoint/path gestures have a simpler alternative when required; drag functionality has a single-pointer non-drag alternative unless essential; hover-only content is also reachable by keyboard and is not the only touch affordance; visible labels remain part of accessible names for speech input.

Use `touch-action: manipulation` only if it fits the gesture contract. Set tap highlight deliberately ? not an accidental mobile artifact.

## Dialogs and composite widgets

Prefer proven project primitives. Modal: move focus inside on open according to content and task; keep the modal's tab sequence contained while active; if dismissing is permitted, support `Escape`; obvious close/cancel control; background content inert and visually subordinate; accessible name; on close, restore focus to the trigger or a logical next element.

Menus, listboxes, tabs, trees, grids, toolbars, comboboxes: expected keyboard model and state exposure. Do not invent composite-key behavior casually. WAI-ARIA APG as implementation pattern; then test with the actual framework and assistive technology relevant to the product.

## Motion and material preferences

Honor `prefers-reduced-motion` for non-essential movement. If travel, scale, parallax, or ambient loops are removed, preserve state comprehension. Keep flashing/blinking within applicable safety limits. Treat `prefers-reduced-transparency` as progressive enhancement; if translucent material carries text or structure, also consider `prefers-contrast` and `forced-colors`. Avoid blanket rules that disable every transition and remove essential feedback. For modality, permission prompts, large-text reflow, and inclusion language beyond named WCAG criteria, use [human-interface-craft.md](human-interface-craft.md).

Read `motion.md` for implementation patterns.

## Verification matrix

Smallest matrix that supports the claim: Source (semantics, names, labels, state ownership, DOM order, ARIA use); Keyboard (core path, reverse traversal, focus movement/return, escape and recovery); Visual (focus, contrast, zoom, reflow, text spacing, high contrast/theme states); Pointer (coarse pointer, target size/spacing, cancellation, drag alternative); Screen reader (names, roles, values, instructions, status, reading order when available); Automation (axe or equivalent against each reached state, not only initial load); Content/state (loading, error, permission, validation, long text, and dynamic updates).

Report the matrix and gaps. If only source and automation ran, say so.

See [sources-and-provenance.md](sources-and-provenance.md) for WCAG 2.2, WAI image guidance, ARIA APG, and Playwright/axe limitations verified for this material.
