# Responsive and state hardening

Responsive layout, real content, localization, async states, network behavior, production resilience.

## Build a state matrix

List only states that apply to the changed surface; then run them.

- viewports or containers: narrow, mobile, small laptop, desktop, wide/dense
- content: empty, short, typical, long, unbroken, multiline, rich/media
- async: initial loading, refresh, loading more, success, empty, partial error, total error, permission denied, stale, retry
- interaction: default, focus, selected, disabled, pending, destructive, repeated action
- environment: slow, offline, timeout, canceled request, locale, RTL, theme, reduced motion
- data: zero, one, typical, large, and rapidly updating

Each named state needs setup, action, assertion, and artifact where visual proof matters. A list of state names is a plan, not coverage.

## Responsive structure

- If shrinking the layout makes the task worse, change navigation, column order, panel behavior, and data presentation.
- Let grid/flex/container queries express available space before measuring with JavaScript.
- Fix the overflowing child. Do not hide page overflow globally to mask defects.
- Use logical properties where direction or writing mode can change.
- Account for safe areas on fixed, full-bleed mobile surfaces.
- Contain scroll on purpose in dialogs, drawers, sheets, code, and wide data. Do not contain scroll on arbitrary wrappers.
- Keep primary actions and recovery reachable without precision scrolling.
- Decide how tables transform: scroll with context, reflow to rows/cards, hide optional columns, or offer a detail view. Preserve headers and relationships.

Test layout at actual supported breakpoints plus boundary widths where structure changes. Add a narrow-container test for embeddable components.

## Content resilience

Test content that exposes assumptions:

- empty values and missing optional metadata
- one-character and very long names/titles
- URLs, IDs, email addresses, tokens, and uninterrupted strings
- emoji, combining marks, mixed-width characters, CJK, and RTL when relevant
- multiline labels, validation messages, and user-generated formatting
- missing, portrait, landscape, slow, and failed media

Use `min-width: 0`/`min-inline-size: 0` where flex or grid children need to shrink. Use wrapping or `overflow-wrap` for unbroken content. If the complete value remains reachable and truncation is acceptable, clamp.

Do not reserve a universal translation percentage. `30–40%` expansion can be a planning heuristic for some short labels; languages, words, and layouts vary. Test representative translations or pseudo-localization.

## Async regions

- Initial loading must communicate shape or progress without implying data exists.
- Refresh and loading-more must preserve usable existing content when possible.
- Empty must distinguish "no results yet," "filters removed everything," and "access prevents data."
- Error must explain what failed, preserve user work, and offer a valid recovery.
- Permission denied must explain access and the next action. Do not present it as empty.
- If wrong freshness affects decisions, stale data must expose age or refresh state.
- Partial failure must stay local. One broken panel must not erase the whole page.

Skeletons useful when they approximate stable content geometry. Spinners fit short isolated waits. Neither is mandatory.

Use live regions selectively for important async changes. Coordinate with `accessibility.md`.

## Forms and concurrency

- client and server validation, pending, success, failure, and retry
- preserved input on error and unsaved-change behavior where loss is costly
- double-click and repeated-submit behavior
- cancellation/unmount of obsolete work
- out-of-order responses and stale closures
- optimistic updates with rollback or reconciliation
- two tabs or clients changing the same record when the product supports it
- disabled controls with an understandable reason and recovery

If repetition is harmful, disable or debounce. Do not trade duplicate protection for an unresponsive UI.

## Navigation and durable state

Use links for navigation so new-tab, copy-link, status preview, history, and browser behavior work.

If users reasonably expect refresh, back/forward, sharing, or support links to keep current values, persist them in the URL: filters, tabs, search, pagination, expanded detail. Keep transient local state local.

- direct load and refresh
- back/forward after changes
- deep link with invalid or outdated values
- route transition during pending work
- return from modal/detail to the prior meaningful state

## Locale, direction, and hydration

- Format dates, times, numbers, percentages, lists, and currency with `Intl.*` or the project's localization layer.
- Do not infer a user's language from IP. Prefer explicit user preference, account setting, or standards-based locale negotiation.
- Avoid concatenating translated fragments that require English word order.
- Mark brand names, code, and identifiers as non-translatable only when needed.
- Test direction-sensitive icons, logical spacing, table order, and mixed LTR/RTL content.
- Keep server and client rendering deterministic for locale, time, random, and browser-only values.
- After you understand the mismatch, use hydration suppression only for intentionally unstable content.
- Keep controlled inputs paired with updates. Otherwise, use the framework's uncontrolled/default contract.

## Browser and feature resilience

- Use feature detection instead of browser detection.
- If the feature carries core meaning, provide a fallback for unsupported CSS. Decorative enhancements can disappear.
- Progressive enhancement in the product contract: keep core content and the primary task usable without JavaScript.
- Test the supported browser matrix at the feature boundary. Do not infer compatibility from source.

## Data volume and long sessions

Test zero, one, typical, and realistically large data. Diagnose actual cost before choosing pagination, virtualization, progressive loading, or `content-visibility`.

- Keep headers, selection, filters, and row actions stable as data changes.
- If the dataset can grow, do not fetch all records only to hide most of them locally.
- Prevent monotonic DOM, listener, timer, observer, media, or canvas growth across route cycles.
- If refresh behavior requires it, preserve scroll and selection.
- Keep long-running updates from constantly stealing focus or announcements.

Do not use an arbitrary item-count threshold as a performance standard.

## Verification

Focused pass: main state plus the edge most likely to reveal the defect. Deep production readiness: every applicable state in the matrix.

- viewport and device emulation for deterministic layout coverage
- If input behavior is central, use real device/touch checks
- fixtures, request interception, route parameters, or state controls for async conditions
- assertions that check the desired state before capturing screenshots
- same-content comparisons across breakpoints
- console/network checks and focused unit/e2e tests
- a proof manifest that records state setup, action, assertion, and artifact

Report unexecuted states as `unknown`, `scoped`, or `blocked`. Never call a screen production-ready because its default state looks polished.

See [sources-and-provenance.md](sources-and-provenance.md) for WCAG reflow and Playwright emulation references.
