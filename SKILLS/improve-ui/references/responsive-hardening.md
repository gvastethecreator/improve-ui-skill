# Responsive And State Hardening

Use this reference for responsive layout, real content, localization, async states, network behavior, and production resilience.

## Contents

- [Build a state matrix](#build-a-state-matrix)
- [Responsive structure](#responsive-structure)
- [Content resilience](#content-resilience)
- [Async regions](#async-regions)
- [Forms and concurrency](#forms-and-concurrency)
- [Navigation and durable state](#navigation-and-durable-state)
- [Locale, direction, and hydration](#locale-direction-and-hydration)
- [Browser and feature resilience](#browser-and-feature-resilience)
- [Data volume and long sessions](#data-volume-and-long-sessions)
- [Verification](#verification)

## Build A State Matrix

List only states applicable to the changed surface, then execute them:

- viewports or containers: narrow, mobile, small laptop, desktop, wide/dense;
- content: empty, short, typical, long, unbroken, multiline, rich/media;
- async: initial loading, refresh, loading more, success, empty, partial error, total error, permission denied, stale, retry;
- interaction: default, focus, selected, disabled, pending, destructive, repeated action;
- environment: slow, offline, timeout, canceled request, locale, RTL, theme, reduced motion;
- data: zero, one, typical, large, and rapidly updating.

Each named state needs setup, action, assertion, and artifact where visual proof matters. A list of state names is a plan, not coverage.

## Responsive Structure

Solve the layout structurally:

- Change navigation, column order, panel behavior, and data presentation when simply shrinking would make the task worse.
- Let grid/flex/container queries express available space before measuring with JavaScript.
- Fix the overflowing child; do not hide page overflow globally to mask defects.
- Use logical properties where direction or writing mode can change.
- Account for safe areas on fixed, full-bleed mobile surfaces.
- Contain scroll intentionally in dialogs, drawers, sheets, code, and wide data—not on arbitrary wrappers.
- Keep primary actions and recovery reachable without precision scrolling.
- Decide how tables transform: scroll with context, reflow to rows/cards, hide optional columns, or offer a detail view. Preserve headers and relationships.

Test layout at the actual supported breakpoints plus boundary widths where the structure changes. Add a narrow-container test for embeddable components.

## Content Resilience

Test content that exposes assumptions:

- empty values and missing optional metadata;
- one-character and very long names/titles;
- URLs, IDs, email addresses, tokens, and uninterrupted strings;
- emoji, combining marks, mixed-width characters, CJK, and RTL when relevant;
- multiline labels, validation messages, and user-generated formatting;
- missing, portrait, landscape, slow, and failed media.

Use `min-width: 0`/`min-inline-size: 0` where flex or grid children need to shrink. Use wrapping or `overflow-wrap` for unbroken content. Clamp only when the complete value remains reachable and truncation is acceptable.

Do not reserve a universal percentage for translation. `30–40%` expansion can be a planning heuristic for some short labels, but actual languages, words, and layouts vary. Test representative translations or pseudo-localization.

## Async Regions

Give each independent async region a coherent state model:

- Initial loading should communicate shape or progress without implying data exists.
- Refresh/loading-more should preserve usable existing content when possible.
- Empty should distinguish “no results yet,” “filters removed everything,” and “access prevents data.”
- Error should explain what failed, preserve user work, and offer a valid recovery.
- Permission denied should explain access and next action without masquerading as empty.
- Stale data should expose age or refresh state when wrong freshness affects decisions.
- Partial failure should remain local; one broken panel should not erase the whole page.

Skeletons are useful when they approximate stable content geometry. Spinners fit short isolated waits. Neither is mandatory.

Use live regions selectively for important async changes; coordinate with `accessibility.md`.

## Forms And Concurrency

Verify:

- client and server validation, pending, success, failure, and retry;
- preserved input on error and unsaved-change behavior where loss is costly;
- double-click and repeated-submit behavior;
- cancellation/unmount of obsolete work;
- out-of-order responses and stale closures;
- optimistic updates with rollback or reconciliation;
- two tabs or clients changing the same record when the product supports it;
- disabled controls with an understandable reason and recovery.

Disable or debounce only when repetition is harmful. Do not trade duplicate protection for an unresponsive interface.

## Navigation And Durable State

Use links for navigation so new-tab, copy-link, status preview, history, and browser behavior work.

Persist filters, tabs, search, pagination, and expanded detail in the URL when users reasonably expect refresh, back/forward, sharing, or support links to preserve them. Keep transient local state local.

Verify:

- direct load and refresh;
- back/forward after changes;
- deep link with invalid or outdated values;
- route transition during pending work;
- return from modal/detail to the prior meaningful state.

## Locale, Direction, And Hydration

- Format dates, times, numbers, percentages, lists, and currency with `Intl.*` or the project's localization layer.
- Do not infer a user's language from IP; prefer explicit user preference, account setting, or standards-based locale negotiation.
- Avoid concatenating translated fragments that require English word order.
- Mark brand names, code, and identifiers as non-translatable only when needed.
- Test direction-sensitive icons, logical spacing, table order, and mixed LTR/RTL content.
- Keep server and client rendering deterministic for locale, time, random, and browser-only values.
- Use hydration suppression only for intentionally unstable content after the mismatch is understood.
- Keep controlled inputs paired with updates; otherwise use the framework's uncontrolled/default contract.

## Browser And Feature Resilience

- Use feature detection instead of browser detection.
- For unsupported CSS, provide a fallback whenever the feature carries core meaning; decorative enhancements may disappear.
- Keep core content and the primary task usable without JavaScript when the product contract calls for progressive enhancement.
- Test the supported browser matrix at the feature boundary instead of inferring compatibility from source.

## Data Volume And Long Sessions

Test zero, one, typical, and realistically large data. Diagnose actual cost before choosing pagination, virtualization, progressive loading, or `content-visibility`.

- Keep headers, selection, filters, and row actions stable as data changes.
- Avoid fetching all records only to hide most locally when the dataset can grow.
- Prevent monotonic DOM, listener, timer, observer, media, or canvas growth across route cycles.
- Preserve scroll and selection when refresh behavior requires it.
- Keep long-running updates from constantly stealing focus or announcements.

Do not use an arbitrary item-count threshold as a performance standard.

## Verification

For a focused pass, prove the main state plus the edge state most likely to reveal the defect. For deep production readiness, execute every applicable state in the matrix.

Use:

- viewport and device emulation for deterministic layout coverage;
- real device/touch checks when input behavior is central;
- fixtures, request interception, route parameters, or state controls for async conditions;
- assertions that confirm the desired state before screenshotting;
- same-content comparisons across breakpoints;
- console/network checks and focused unit/e2e tests;
- a proof manifest that records state setup, action, assertion, and artifact.

Report unexecuted states as `unknown`, `scoped`, or `blocked`. Never call a screen production-ready because its default state looks polished.

See [sources-and-provenance.md](sources-and-provenance.md) for WCAG reflow and Playwright emulation references.
