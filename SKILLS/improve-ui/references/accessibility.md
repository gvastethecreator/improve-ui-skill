# Accessibility

Use this reference to improve or audit an existing web path against named accessibility requirements. Do not describe the result as formal WCAG conformance or certification.

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

## Evidence Boundary

Name the target standard and level when compliance language matters. Default an engineering audit to relevant WCAG 2.2 A/AA criteria, project contracts, and platform practices; do not imply complete coverage.

Separate:

- automatically detected violations;
- manual checks completed;
- user flows and states inspected;
- criteria not applicable;
- criteria untested or blocked.

Automated tools find only a subset of accessibility problems. Never convert a clean scanner run into an accessibility pass.

## Semantics And Names

Use native HTML before ARIA:

- Use `button` for actions and links for navigation.
- Associate controls with visible labels; keep the accessible name aligned with visible text so voice users can invoke it.
- Give icon-only controls a concise accessible name.
- Preserve headings, landmarks, lists, tables, and relationships that communicate structure.
- Use ARIA only when native semantics cannot express the interaction; keep roles, states, and properties synchronized.
- Avoid clickable `div`/`span` repairs that add only `role`; keyboard behavior, focusability, name, and state must also work.
- Hide decorative icons from assistive technology when adjacent text already names the action.

Inspect the computed accessibility tree for complex components rather than reasoning only from JSX.

## Keyboard And Focus

Verify every core action without a pointer:

- Reach controls in a logical order.
- Operate them with the expected keys.
- Keep focus visible and sufficiently distinguishable.
- Avoid positive `tabindex` and accidental extra tab stops.
- Move focus deliberately when content context changes, then return it to a logical location.
- Prevent focus traps except inside correctly implemented modal dialogs.
- Ensure sticky headers, banners, drawers, and overlays do not fully obscure the focused component.
- Give anchored targets enough `scroll-margin-top` to clear sticky headers and banners.
- Keep skip/navigation mechanisms available on repeated layouts when needed.

Test both forward and reverse traversal. Verify the focus state visually in every theme used by the path.

## Forms And Status

- Provide a persistent label for each field; placeholder text is not a label.
- Use appropriate `type`, `name`, `autocomplete`, input mode, and required/invalid semantics.
- Disable `spellcheck` only where correction is harmful, such as email addresses, usernames, codes, and tokens.
- Keep paste, autofill, password managers, and mobile keyboards functional.
- Associate instructions and errors with the field; keep entered values after failure.
- Focus or summarize the first error when submission fails, without causing a confusing jump.
- Expose pending and disabled reasons; prevent harmful duplicate submission without hiding recovery.
- Announce important async status and validation changes with an appropriate live region; avoid verbose or constantly updating announcements.
- Keep visible text and accessible names consistent.
- Avoid authentication tasks that depend only on memory, transcription, or cognitive puzzles when a compliant alternative is required.

Server validation owns correctness; client validation owns timely, accessible feedback.

## Images And Media

Choose alternative text by purpose, not file type:

- Informative image: write concise alternative text that conveys its contribution in context.
- Functional image: name the action or destination through the enclosing control.
- Decorative or redundant `<img>`: use `alt=""`; this is correct and must not be reported as missing alt.
- Complex chart, diagram, or map: provide an equivalent explanation or data representation appropriate to the task.
- CSS decoration: ensure no information exists only in the background image.

Missing `alt` is different from empty `alt`. Do not add descriptive text to decorative imagery because a detector complained.

For audio/video in scope, verify captions, transcripts or descriptions, controls, autoplay behavior, and keyboard access according to the content and applicable criteria.

## Contrast, Color, And Text

Evaluate the actual rendered colors and applicable WCAG criterion:

- Test normal text, large text, icons/control boundaries, focus indicators, selected/disabled states, and text over images or gradients.
- Do not rely on color alone for status, errors, required fields, or selection.
- Check forced-colors and high-contrast behavior where the audience/platform requires it.
- Avoid declaring contrast from source tokens alone when opacity, blending, backdrop, gradients, images, pseudo-elements, or overlays affect the result.
- Preserve user text spacing overrides: line height, paragraph spacing, letter spacing, and word spacing must not cause loss of content or functionality.
- Do not disable browser zoom through viewport metadata, event handlers, or gesture suppression.
- Verify text at 200% zoom and reflow at the WCAG 1.4.10 equivalent of 320 CSS px/400% where applicable.

Treat browser/runtime contrast sampling as a lead. Confirm complex backgrounds manually.

## Pointer, Touch, And Gestures

For WCAG 2.2 AA target size, use the actual `24×24 CSS px` minimum or one of its documented exceptions, including sufficient spacing. Do not present `44×44` as the AA requirement.

Use `44×44 CSS px` as an enhanced AAA target or product usability preference when appropriate for frequent, risky, coarse-pointer, or edge-positioned controls. Dense toolbars can use smaller targets only when the applicable minimum/spacing and product ergonomics are satisfied.

Also verify:

- target regions do not overlap or trigger adjacent actions;
- down events do not commit irreversible actions before cancellation is possible;
- multipoint/path gestures have a simpler alternative when required;
- functionality requiring drag has a single-pointer non-drag alternative unless essential;
- hover-only content is also reachable by keyboard and does not become the only touch affordance;
- visible labels remain part of accessible names for speech input.

Use `touch-action: manipulation` only when it fits the gesture contract, and set the tap highlight deliberately rather than leaving an accidental mobile artifact.

## Dialogs And Composite Widgets

Prefer proven project primitives. When implementing or auditing a modal dialog:

- move focus inside on open according to content and task;
- keep the modal's tab sequence contained while it is active;
- support `Escape` when dismissing is permitted;
- provide an obvious close/cancel control;
- make background content inert and visually subordinate;
- provide an accessible name;
- restore focus to the trigger or a logical next element on close.

For menus, listboxes, tabs, trees, grids, toolbars, and comboboxes, follow the expected keyboard model and state exposure. Do not invent composite-key behavior casually. Use the WAI-ARIA APG as an implementation pattern, then test with the actual framework and assistive technology support relevant to the product.

## Motion And Material Preferences

- Honor `prefers-reduced-motion` for non-essential movement; preserve state comprehension when travel, scale, parallax, or ambient loops are removed.
- Keep flashing/blinking within applicable safety limits.
- Treat `prefers-reduced-transparency` as progressive enhancement; also consider `prefers-contrast` and `forced-colors` where translucent material carries text or structure.
- Avoid blanket rules that disable every transition and remove essential feedback.

Read `motion.md` for implementation patterns.

## Verification Matrix

Run the smallest matrix that supports the claim:

- Source: semantics, names, labels, state ownership, DOM order, ARIA use.
- Keyboard: core path, reverse traversal, focus movement/return, escape and recovery.
- Visual: focus, contrast, zoom, reflow, text spacing, high contrast/theme states.
- Pointer: coarse pointer, target size/spacing, cancellation, drag alternative.
- Screen reader: important names, roles, values, instructions, status, and reading order when available.
- Automation: axe or equivalent against each reached state, not only initial load.
- Content/state: loading, error, permission, validation, long text, and dynamic updates.

Report the matrix and gaps. If only source and automation ran, say exactly that.

See [sources-and-provenance.md](sources-and-provenance.md) for WCAG 2.2, WAI image guidance, ARIA APG, and Playwright/axe limitations verified for this material.
