# Experience Quality

Use when a proposed improvement changes decision load, expert density, interruption and return, partial results, AI-assisted actions, or a claimed UX outcome. Select the relevant section. These are contextual practices and hypotheses, not standards or a second mandatory workflow.

## Find Where The Work Went

A cleaner screen can move effort into memory, navigation, repeated entry, or error recovery. Before hiding a control or collapsing information, trace one representative decision:

- What must remain visible while choosing?
- What must be remembered, compared, inferred, or reopened?
- Which work does the system remove, and which work does it merely hide?
- What changes for a first-time user versus an expert returning to a familiar task?

| Suspected cost | Concrete probe | Candidate repair |
|---|---|---|
| Recall replaces comparison | A value, unit, source, or selected scope disappears before it is used | Keep the deciding facts together; use stable columns or a relevant summary |
| Minimalism adds navigation | A frequent action or comparison now requires opening several panels | Keep frequent work direct; disclose infrequent detail where it is needed |
| Interruption erases context | Return loses draft, place, selection, mode, or completion status | Restore the supported task context within the correct project/account |
| Automation hides a decision | A default or inferred value silently chooses scope or consequence | Expose the deciding parameter and allow correction |
| Apparent speed hides waiting | Feedback appears sooner but useful output or completion does not | Measure acknowledgement, first useful result, completion, and recovery separately |

Do not assert cognitive overload from item count. Working-memory experiments concern a specific recall task; they do not prescribe a maximum number of visible controls. [Cowan, 2010](https://pubmed.ncbi.nlm.nih.gov/20445769/)

Likewise, Hick's law needs its task conditions: practice and stimulus-response compatibility affect the relationship. A menu cap is an unsupported extrapolation. Test labels, grouping, comparison, and relevance before removing choices. [Proctor and Schneider, 2018](https://web.ics.purdue.edu/~dws/pubs/ProctorSchneider_2018_QJEP.pdf)

## Follow The Effect Beyond The Click

For a costly transition, connect the visible action to its actual scope and lasting effects. Use the applicable rows; do not invent unsupported capabilities to complete the table.

| Moment | Contract to inspect |
|---|---|
| Before execution | Object IDs, action, affected scope, current state, and consequence agree with the user's choice |
| Pending | Acknowledgement does not claim completion; the operation's scope remains clear if browsing or selection changes |
| Partial result | Completed, failed, unstarted, and unknown items remain identifiable; one status does not erase their differences |
| Cancel | The UI distinguishes stopping future work from reversing effects that already happened |
| Retry | Reconcile uncertain results before repeating effects; repeat only the work that is safe under the real operation contract |
| Return | Reopening shows supported persisted results and remaining work without relying on a vanished toast |

Example: an asset export created A, failed B, and has no confirmed result for C when Cancel was pressed. Do not call all three canceled or offer a blind retry of all three. Show A's result, B's recovery, and C's uncertainty. Check what cancellation and repetition actually guarantee. A disabled button or reassuring label cannot supply a missing backend guarantee.

For recoverable mistakes, verify the promised undo. For costly decisions, preserve the useful review step. Fewer clicks alone cannot justify removing it, and a trivial action does not need a new confirmation ritual.

## Check AI Decisions, Not Just Persuasion

Apply only when the product suggests, generates, or executes with AI.

Keep proposed content, approved scope, tool execution, and verified results distinguishable. Generated confidence or a fluent explanation is not evidence that an action happened. Show uncertainty, source, and correction controls where they change the decision; do not invent calibrated percentages.

In the studied task, cognitive forcing reduced overreliance but received worse subjective ratings. Treat this as a reason to compare correctness and perceived ease separately, not to slow every workflow. [Buçinca, Malaya, and Gajos, 2021](https://arxiv.org/abs/2102.09692)

Probe a plausible wrong suggestion as well as a correct one. Can the person inspect the deciding evidence, reject or correct it, and recover control? Preserve a review step when it prevents a demonstrated costly error. A higher acceptance rate can include more accepted mistakes.

## Define What Improvement Would Mean

When measuring an outcome, start with a goal, a signal of success or failure, and a measure of that signal. Select only what the decision needs. [Rodden, Hutchinson, and Fu, 2010](https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/)

An original example: goal = export the intended assets; signal = the output matches the chosen IDs; measure = correct exports / attempted export tasks. Check lost work and duplicate exports as failure outcomes.

Before comparing, name the task, baseline, audience or segment, unit of analysis, primary outcome, harm check, and decision criterion. Keep conditions comparable. Record denominators, help, exclusions, and uncertainty. Separate experts from first-time users when their needs differ. Do not choose a favorable metric after seeing results.

- Source, render, and browser automation support implementation, appearance, and exercised behavior respectively. They cannot show that people will discover or understand the path.
- An LLM reviewer is an independent critique, not a participant study. Real participants support bounded observations about the described sample.
- A small qualitative session can expose a failure; it cannot establish a population-wide gain. Raw acceptance, engagement, click count, or satisfaction cannot stand in for the task outcome without a justified link.

If participants, traffic, or instrumentation are unavailable, deliver the decision and its acceptance protocol with human outcomes unmeasured. Do not recruit, add telemetry, or run an A/B test merely because this reference describes them. Ordinary UI fixes do not require a research program.

## Adaptation And Reading Limits

Adapted on 2026-09-07 from the local `experience-design` candidate, research-check 2026-09-05: `MEM-03/04`, `DEC-01/07`, `INT-02`, `AI-02/05`, `PERF-01`, and `RES-01`; with its interaction, evidence, AI, and validation references. This package contains the needed guidance and does not require that skill to be installed.

Adopted task-cost and effect-contract probes; adapted measurement to bounded interface work; retained this skill's visual craft and execution rules. Excluded the full principle catalog, workbench, report schema, and unverified empirical claims.

External sources were checked on 2026-09-07. Reading scope: Cowan abstract; Proctor and Schneider abstract and compatibility/practice discussion; Buçinca et al. abstract; Rodden et al. abstract and Goals-Signals-Metrics section. The research motivates questions. The UI applications above are our hypotheses and practices, not effects measured in the current product.
