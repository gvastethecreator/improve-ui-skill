# Interface Contracts

These checks are not visual taste. They are the floor that keeps polished UI usable, accessible, resilient, and browser-native.

## Accessibility

- Use semantic HTML before ARIA: `button` for actions, `a`/`Link` for navigation, `label` for controls, `table` for tabular data.
- Icon-only buttons need `aria-label` or visible text.
- Decorative icons use `aria-hidden="true"`.
- Images need `alt`; decorative images use `alt=""`.
- Async validation, save status, and toasts need an appropriate live region.
- Heading order should be hierarchical.
- Pages with repeated nav/chrome should expose a skip link to main content.
- Heading anchors need `scroll-margin-top` when sticky headers can cover them.

Avoid:

- `div`/`span` click targets for real controls.
- ARIA replacing native controls when native HTML works.
- Disabling browser zoom.

## Focus

- Every interactive element needs a visible focus state.
- Prefer `:focus-visible` so pointer clicks do not show noisy rings.
- Never remove outlines without a replacement.
- Use `:focus-within` for compound controls such as search boxes, selects, and grouped inputs.

## Forms

- Every control needs a label or accessible name.
- Labels should be clickable via `htmlFor` or by wrapping the control.
- Inputs need meaningful `name`, useful `autocomplete`, and correct `type`/`inputmode`.
- Do not block paste.
- Disable spellcheck for emails, codes, usernames, and tokens.
- Submit stays enabled until the request starts; show pending state during the request.
- Errors render inline near fields and submit should focus the first error.
- Checkboxes/radios should make label plus control one target, with no dead zone.
- Warn before losing unsaved changes.

Contextual, not blanket:

- `autocomplete="off"` only when browser/password-manager behavior is actively wrong.
- Placeholder examples are fine, but not a substitute for labels.
- `autoFocus` only for one clear primary field and after checking mobile behavior.

## Content Resilience

- Handle empty arrays, empty strings, loading, and error states.
- Test short, average, and very long user-generated content.
- Use `min-w-0` on flex children that need truncation.
- Use `truncate`, `line-clamp`, or `break-words` where overflow would break layout.
- Error copy should include the next step when space allows.
- Button labels should name the action, not only say "Continue".
- Async regions need loading, refresh/loading-more, empty, error, permission-denied, and retry states when those states can occur.
- Preserve user input on validation or submission errors.
- Prevent harmful double submission while keeping the reason for disabled actions visible.

House-style rules such as Title Case, curly quotes, and ellipsis glyphs belong to the product copy system. Do not force them across repos unless the project already uses that style.

## Images

- Images need explicit `width` and `height` when dimensions are knowable.
- Below-fold images can use `loading="lazy"`.
- Above-fold critical images can use `fetchpriority="high"` or the framework's priority image primitive.
- Avoid priority on many images; one hero can be priority, a grid cannot.

## Navigation and State

- Navigation uses links so Cmd/Ctrl-click, middle-click, copy link, and browser status work.
- Put filters, tabs, pagination, search, and expanded panels in the URL when users expect refresh, back/forward, sharing, or support links to preserve state.
- Do not sync every local `useState` to the URL. Ephemeral UI can stay local.
- Destructive actions need undo when reversible, confirmation when irreversible or costly.

## Touch and Layout

- Use `touch-action: manipulation` on tappable controls when it fits the interaction.
- Set tap highlight intentionally; do not leave accidental mobile artifacts.
- Modals, drawers, and sheets usually need `overscroll-behavior: contain`.
- Full-bleed fixed layouts should account for `env(safe-area-inset-*)`.
- Prefer flex/grid/CSS containment over JS measurement.
- Do not blanket `overflow-x-hidden` on the page to hide layout bugs; fix the overflowing child when practical.

## Locale and Hydration

- Use `Intl.DateTimeFormat` for dates/times.
- Use `Intl.NumberFormat` for numbers, percentages, and currency.
- Do not infer language from IP.
- Mark brand names, code tokens, and identifiers with `translate="no"` when auto-translation would corrupt them.
- Controlled inputs need `value` plus `onChange`; otherwise use `defaultValue`.
- Date/time rendering must not mismatch between server and client.
- Use `suppressHydrationWarning` only for deliberately unstable text.

## Production Hardening

- Budget `30-40%` extra space for translated labels when the app may localize.
- Test long unbroken content: URLs, IDs, emails, tokens, and long names.
- Check CJK and RTL text when the target audience requires it.
- Abort or ignore stale requests when routes/components unmount.
- Keep partial failures local; one broken panel should not blank an entire page.
- Show stale/refresh status when data can age.
- Handle large datasets with pagination, virtualization, or progressive loading when DOM size hurts.

## Quick Audit

- Controls: semantic element, label/name, keyboard, focus.
- Forms: label, autocomplete/name/type, paste, errors, pending state.
- Content: empty, long, flex truncation.
- Hardening: loading, empty, error, permission, retry, slow network, rapid clicks, long translations.
- Images: alt, dimensions, loading priority.
- Navigation: links and durable URL state.
- Locale/hydration: `Intl.*`, stable server/client rendering.

See [hardening.md](hardening.md).
