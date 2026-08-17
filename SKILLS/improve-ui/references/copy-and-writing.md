# Copy And Writing Quality

Use this route when a task changes text users see in an existing interface. It also governs prose in a material audit, critique, proposal, or report. Treat these checks as `practice` and `heuristic` unless project policy sets a stricter copy standard.

## Authority And Scope

- In a read-only run, quote the exact weak text, name the pattern, explain its effect, and propose a short fix. Keep product files unchanged.
- In an implementation run, edit only the copy covered by the request and verify it in the real state.
- Preserve approved brand, legal, compliance, support, route, analytics, search, and accessibility text. Escalate a needed change when the request does not grant authority.
- Name observable writing patterns. Never guess whether AI wrote the text and never use an AI-authorship score as evidence.

## Edit From The Job And Voice

1. Read the full copy set for the surface and state before editing isolated strings.
2. Identify the audience, user task, needed action or result, and three to five voice signals such as vocabulary, pace, bluntness, humor, uncertainty, or formality.
3. Make the minimum useful edit. Preserve meaning, product terms, strong lines, useful structure, and the traits that make the voice distinct. Record why a report or interface flow was reordered.
4. Front-load the point when it improves clarity. Keep setup that adds needed context, trust, or character, and vary structure with the content.
5. Prefer concrete nouns, direct verbs, active voice, stable terms, and exact facts. Repeat the correct product term instead of rotating synonyms. Split tangled sentences while keeping clear changes in pace and useful fragments. Address the reader as `you` when the product voice allows it, not as “the user.” Omit unneeded gender, use people-first language about disability, and prefer plain wording over culture-bound idioms.
6. Keep every claim within the evidence. Name the source for metrics, quotes, awards, customer proof, or research. Remove, flag, or label unsupported and synthetic material.
7. Preserve variables, ICU tokens, markup, keyboard hints, accessible names, and translation keys. Keep visible labels aligned with accessible names.

Done when the copy states the task, state, consequence, or next action in the product's voice without changing facts or contracts.

## Repair Named Patterns

| Signal | Required move |
|---|---|
| Binary contrast or negative list | State the positive claim directly. |
| Throat-clearing opener | Start with the useful fact or action. |
| Faux-insight or lone-expert setup | Remove the setup and support the claim with evidence. |
| Rhetorical question with its own answer | Write the answer as a plain statement. |
| Dramatic colon reveal | Use a normal sentence; reserve colons for labels, lists, and quoted material. |
| Trailing clause that claims vague meaning | Name the real cause, effect, or user result. |
| Importance claim with no proof | State the concrete event or change and let the reader judge its importance from evidence. |
| Vague source such as unnamed experts or studies | Cite the source, remove the claim, or mark it for follow-up. |
| Inflated verb phrase | Use `is`, `has`, `can`, or the exact action when each says more with fewer words. |
| Synonym cycling | Repeat the stable product term. |
| Stacked fragments or repeated sentence shape | Use complete, clear sentences and vary pace only when it helps meaning. |
| Final slogan, broad metaphor, or recap | End with the last concrete result, risk, decision, or next action. |
| Decorative format | Use headings, lists, bold text, emoji, and dashes only when structure or product voice needs them. |
| Dash clusters | Use commas, periods, or parentheses; keep a dash when it makes the sentence clearer. |
| Empty modifier, filler phrase, or broad jargon | Cut it when the sentence keeps the same meaning. Keep a domain term when users need it. |

Common filler candidates include `utilize`, `facilitate`, `robust`, `transformative`, `crucially`, `at its core`, and `it is worth noting`. Review each use in context; a word list does not establish product meaning.

## Write State Copy

| State | Copy requirement |
|---|---|
| Control or navigation | Name the immediate action or destination with the same term everywhere. |
| Loading or pending | Name the work under way when known. Do not invent progress, duration, or certainty. |
| Empty | Distinguish first use, cleared content, unavailable data, and missing setup; offer the relevant next action. |
| No results | Name the active filter or query and provide a clear reset or edit path. |
| Permission | Name the missing access, affected action, and available request or recovery path. A purpose string is one active sentence that says what is collected and why; reject “for a better experience.” |
| Error | Name the failed scope, retained work, safe retry, and support or reference path when available. |
| Success | Confirm the completed action and object once; expose the next useful action only when needed. |
| Destructive choice | Name the object, consequence, reversibility, and clear cancel path. |

Keep status text compatible with live-region behavior. Avoid repeated announcements, fake reassurance, blame, and dead-end messages.

## Write Reports And Critiques

- Lead with the result or the highest-severity finding.
- Tie each finding to a source location or rendered state, user harm, cause, and exact move.
- Separate observed facts, inference, rules, and taste. Use plain severity labels.
- Keep process detail only when it helps reproduce evidence or explains a limit.
- End with the unresolved risk, decision, or next action. Remove a recap that only repeats prior sections.
- Preserve the user's tone request. Critique interface choices and their effect on users.

## Final Read

- [ ] Meaning, facts, product terms, and voice stayed intact.
- [ ] Every added claim has a source or a clear synthetic label.
- [ ] Named writing patterns were removed or kept for a recorded product reason.
- [ ] Variables, markup, translation keys, legal text, and accessible-name contracts stayed intact.
- [ ] Loading, empty, no-result, permission, error, success, and recovery copy covers each state in scope.
- [ ] The rendered copy fits narrow and wide layouts, zoom, long content, and relevant locales.
- [ ] A screen-reader or accessibility-tree check confirms changed names and status messages when applicable.
- [ ] Before/after proof uses the same route, state, data, locale, theme, and viewport.

Record source and license details in [Sources And Provenance](sources-and-provenance.md). For permission timing, modality, and inclusion beyond named writing patterns, use [human-interface-craft.md](human-interface-craft.md).
