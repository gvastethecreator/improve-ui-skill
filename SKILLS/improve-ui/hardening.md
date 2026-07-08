# Hardening

Use this file when a UI needs to become production-ready: real data, errors, empty states, translations, slow networks, permissions, and odd devices.

## Text And Content

Test:

- Empty strings.
- Very short labels.
- Names and titles over `100` characters.
- Long unbroken words, URLs, IDs, and email addresses.
- Emoji and mixed-width characters.
- CJK text when the product may be global.
- RTL text when the product supports RTL locales.

Fix:

- Use `min-w-0` in flex rows that truncate.
- Use `overflow-wrap: anywhere` or `break-words` where unbroken content can appear.
- Use `line-clamp` only when truncation is acceptable and the full content remains reachable.
- Reserve `30-40%` extra width for translated labels.
- Avoid fixed text container widths unless the content is constrained by design.
- Keep button labels action-specific and resilient when translated.

## Loading, Empty, And Error States

Every async region needs:

- Initial loading state.
- Refresh/loading-more state when data already exists.
- Empty state with a next action.
- Error state with what happened and what to do next.
- Permission-denied state when access can fail.
- Retry path when retry makes sense.

Prefer skeletons for content-shaped loading. Use spinners only for short, isolated waits where the surrounding content is stable.

Error copy:

- Be specific.
- Preserve user input.
- Avoid blaming the user.
- Provide retry, edit, contact, or fallback actions.
- Announce important async errors through live regions.

## Forms And Submission

Harden:

- Required, format, length, and server-side errors.
- Paste, autofill, password managers, and mobile keyboards.
- Double-submit protection.
- Pending state after submit starts.
- First-error focus after validation.
- Disabled state that does not hide why action is unavailable.
- Optimistic updates with rollback when the operation can fail.
- Unsaved-change warning for costly edits.

Never trust client validation alone. UI validation improves feedback; server validation owns correctness.

## Data Volume

Test:

- No items.
- One item.
- Typical count.
- Hundreds or thousands of items.
- Large media or rich rows.

Fix:

- Paginate, virtualize, or use `content-visibility: auto` when DOM size causes real cost.
- Keep search and filters reachable.
- Avoid loading all records only to hide most of them.
- Keep table headers, row actions, and selection state stable during updates.

## Network And Concurrency

Test:

- Slow connection.
- Offline.
- Timeout.
- Request cancellation.
- Rapid repeated clicks.
- Two tabs changing the same data.
- Stale data after refresh.

Fix:

- Abort pending requests on unmount or route change.
- Disable or debounce only when repeated action would be harmful.
- Show stale/refresh status when data can be outdated.
- Prefer optimistic UI only with clear rollback.
- Keep partial failures local; do not blank the entire interface when one panel fails.

## Accessibility Resilience

Check:

- Keyboard-only operation.
- Logical tab order.
- Focus management inside modal/drawer flows.
- High contrast mode when Windows users matter.
- Screen reader labels for icon-only controls.
- Live regions for async status.
- Reduced motion and hover-gated interactions.
- Zoom to `200%`.

Fix the interaction path, not just the visual layer.

## Browser And Feature Support

- Use feature detection, not browser detection.
- Provide fallback for unsupported CSS when the feature carries core meaning.
- Treat decorative enhancements as optional.
- Keep core content usable without JavaScript when the product surface requires progressive enhancement.

## Quick Audit

- Can the user understand and recover from every failed async state?
- Does long translated content fit or degrade gracefully?
- Can the core flow survive slow network and repeated actions?
- Does each empty state teach the next action?
- Are errors, loading, and permission states visually consistent with the design system?

For deep review on apps, dashboards, forms, and async UI, treat these as required gates. If a state cannot be reached locally, mark it blocked with the missing dependency or route. Do not call the screen production-ready when empty, loading, error, permission, long-content, slow-network, or rapid-click behavior was not inspected.
