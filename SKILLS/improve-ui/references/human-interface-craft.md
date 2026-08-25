# Human interface craft

Use this route when the defect is human behavior, not tokens: interruption, permission, first-run, progress, search, undo, large text, or copy that excludes. Every rule here is `practice`. If a named WCAG criterion or a project contract promotes it, treat it at that higher authority.

Sources: Apple's [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines) and [Principles of great design (WWDC26)](https://developer.apple.com/videos/play/wwdc2026/250/). Transferable tests in original prose. Copies no HIG text, SF metrics, system colors, or material specs. Route native Apple-feel work to the platform skill.

## Contents

- [Anti-costume](#anti-costume)
- [Principle tests](#principle-tests)
- [Chrome versus content](#chrome-versus-content)
- [Modality, destruction, and undo](#modality-destruction-and-undo)
- [Large text and display settings](#large-text-and-display-settings)
- [Permissions](#permissions)
- [Onboarding, progress, and search](#onboarding-progress-and-search)
- [Inclusion](#inclusion)
- [Proof](#proof)
- [Sources](#sources)

## Anti-costume

Label each finding `practice` or `heuristic`. Never gate CI on taste from this file.

Do not ship SF Pro, SF Symbols, a five-item tab bar, Liquid Glass, or iOS Settings chrome as a web default. If a logo swap makes the surface pass for a system Settings clone, the repair failed authorship. Keep the project's type, icons, density, and component library.

Familiarity is interaction grammar. Buttons act like buttons. Back works. Delete means delete. Distinction lives in the product artifact, composition, voice, and data. Do not invent a novel checkbox to look original.

## Principle tests

One question per principle before changing structure. A failed test names the user damage and the smallest move.

| Test | Fails when | Smallest move |
|---|---|---|
| Purpose | A control, prompt, or panel costs time without serving the current task | Remove, delay, or demote it |
| Agency | The path is forced, irreversible, or blocks interruption | Restore choice, undo, or a quieter interruption |
| Responsibility | Data or device access is requested before the feature starts, or the reason is vague | Ask in context with a specific reason. Keep denied states usable |
| Familiarity | Identical-looking controls behave differently, or a standard metaphor is redefined | Restore expected behavior and placement |
| Flexibility | Large text, zoom, locale, or a second input mode breaks the task | Reflow, stack, or give a real alternative |
| Simplicity | Chrome was hidden to look minimal, or a decision lacks the fact that makes it easy | Show the next action. Add the missing fact |
| Craft | Press feedback, alignment, or a state change is unfinished | Fix the shared primitive, not the flourish |
| Delight | Confetti or a mascot compensates for a broken path | Repair the path. Delight is a result, not a layer |

## Chrome versus content

Keep navigation, toolbars, tabs, and persistent controls as one functional layer. Put brand, media, and expression in the content they serve.

- Keep chrome quieter than the current object.
- Translucent chrome only if the same spatial object stays visible behind it and text stays legible.
- Honor `prefers-reduced-transparency` with a solid or higher-contrast fallback.
- Do not paint glass or vibrancy recipes onto cards, tables, or marketing sections.

Repair by demoting the chrome, not by frosting the content.

## Modality, destruction, and undo

Least interruption that still protects the task:

`inline disclosure → popover/menu → sheet/drawer → modal dialog → blocking alert`

- Surrounding context still needed: keep edits, filters, and status on the page.
- Sheet or drawer: bounded task the user can abandon without losing the parent.
- User must finish or cancel before continuing: modal.
- Alert only for a critical, time-sensitive decision. Never for validation, empty states, or marketing.

Destructive actions:

- Name the object, the consequence, and the reversibility.
- Recoverable mistake: give undo. Keep undo reachable after the toast expires.
- Hard to reverse: confirm. Style the confirming control as destructive. Keep Cancel equally easy.
- Never commit irreversible work on pointer-down. Cancellation stays possible until the action is explicit.

## Large text and display settings

User text size is a layout problem, not a zoom afterthought. Prefer `rem` and wrapping over fixed pixels on labels, rows, and chrome. At large sizes, stack icon-plus-label rows and drop optional columns. Do not truncate essential names, errors, or primary actions. Check the largest supported text size or 200% zoom, not only the default scale. Do not override user contrast, transparency, motion, or forced-colors to preserve a mock.

If the product claims light, dark, or high-contrast modes, the custom palette needs a variant for each. Do not choose a material by the tint it produces.

## Permissions

If the user starts the feature that needs access, request it then. A launch-time permission wall is a defect — unless the product cannot function without that access.

- Purpose string: one active sentence — what is collected and why. Reject "for a better experience."
- Required pre-prompt: one Continue that opens the real prompt. No fake Allow, no hostage Skip.
- Denied: keep the rest of the product usable. Name the blocked action and the recovery path.
- Ask only for the data the feature needs. Confirm or block high-risk generated actions instead of trusting the model.

## Onboarding, progress, and search

Onboarding: skippable; do not replay on later launches; keep it findable in help or settings. Teach with the first real action, not a feature carousel. Postpone account, theme, and permission setup until it unblocks work.

Progress: known duration or proportion → determinate indicator. Unknown or background work → local spinner, not a full-app blocker. Name the work under way. Do not invent remaining time.

Search: if it is a primary way in, give it one obvious home. Recents or suggestions only when they are real. No results: repeat the query and give edit or reset.

## Inclusion

Product voice allows it: address the reader as `you`. Do not write "the user" in UI copy. Omit gender unless the product needs it; if required, give inclusive options. People-first language about disability — never use a disability as a negative metaphor. Replace culture-specific jokes, idioms, and security questions with plain language. If people are depicted, show a range; avoid occupational and family stereotypes. Keep a non-color cue for status. Check locale meaning when color carries a claim.

Named writing-pattern repairs: [copy-and-writing.md](copy-and-writing.md). WCAG criteria: [accessibility.md](accessibility.md).

## Proof

A claim about a pattern here requires its costly state, not the happy path.

| Pattern | State to verify |
|---|---|
| Modality | Open, complete, cancel, Escape, focus return |
| Destructive | Confirm and cancel. Undo if claimed |
| Large text | Largest supported size or 200% zoom. Essential text untruncated |
| Permission | Denied and unavailable. Product still usable |
| Onboarding | Skip, first real action, later-launch absence |
| Progress | One known-duration and one unknown-duration operation |
| Search | No-results with reset. Recents if offered |
| Transparency | `prefers-reduced-transparency` or solid fallback on frosted chrome |
| Inclusion | The actual string, not a paraphrase |

Leave unexercised patterns `unknown`. This reference is not a standard.

## Sources

Linked as `practice`, not copied. Authority model, page list, and adaptation record: [sources-and-provenance.md](sources-and-provenance.md).
