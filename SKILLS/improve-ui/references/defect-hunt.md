# Find The Defect That Matters

Use for focused or deep diagnosis, audits, and open improvement requests. For one reproduced defect, use only the relevant probe. This is a way to find and challenge causes, not a quota of findings or a mandatory report.

## Establish The Task

Name the user's immediate decision, the information needed to make it, the action, and the observable result. Inspect real content and state before judging layout. Record what must survive: learned controls, useful density, brand assets, accessible behavior, and product contracts.

Read the first viewport without consulting source. Name the three elements with the most visual weight and compare that order with the task. This is an attention hypothesis, not an eye-tracking or comprehension result. Then inspect the whole task: entry, decision, action, pending, result, and recovery. A good default screenshot can conceal a bad transition.

## Hunt By Failure Mechanism

Select probes that can change the verdict. Inspect broad structure first, then repeated components and optical detail. Do not stop at the first visible CSS defect.

| Mechanism | Probe | Evidence to seek |
|---|---|---|
| Attention competition | Which decoration, summary, warning, or secondary action wins over the current object or next decision? | Actual viewport; competing regions; what the user must search for or scroll past |
| Broken grouping | Do proximity, enclosure, headings, and alignment imply the same relationships? Can comparable values be scanned without zigzagging? | Repeated rows, column anchors, one boundary where unrelated items look related |
| Information debt | What must the user remember, infer, calculate, or open elsewhere to act? | Missing units, time range, ownership, selected scope, consequence, or decision evidence |
| Action ambiguity | Before committing, can the user tell what will happen, to which object, and whether it can be reversed? | Literal label, target, selected items, action rank, recovery affordance |
| State contradiction | Do visible content, enabled controls, status, and actual data agree during change? | Action and assertion through pending, failure, stale data, retry, or out-of-order completion |
| Fragile fit | What realistic content or container change breaks this structure? | Long names, nonzero counts, missing media, zoom, dense rows, supported narrow layout |
| Interaction exclusion | Can the same job be completed with the applicable input methods? | Names, focus order/return, keyboard action, scroll ownership, non-color state cues |
| Weak visual system | Which repeated mismatch makes the surface harder to read or visibly unfinished? | Type roles, contrast roles, control heights, baselines, spacing relationships, asset crops, icon family |
| Product mismatch | Is the interface organized around its actual object and workflow, or around generic feature boxes? | Space given to artifact versus chrome, order of decisions, context-specific costly state |

When a repair hides decision information, changes interruption/recovery, or automates a choice, use [experience quality](experience-quality.md) to trace shifted effort and lasting effects. A smaller screen, faster acknowledgement, or higher acceptance rate can conceal a worse task outcome.

Use reversible fixtures for failure states. Do not create destructive actions, production errors, or new infrastructure just to complete a checklist. Unsupported states stay unknown.

## Build A Finding That Can Survive Rebuttal

For each material finding, keep these facts together in working notes; expose only what helps the user assess it:

- Observation: exact element, state, and evidence location. Separate observed behavior, source-confirmed implementation, and inference.
- Consequence: the extra search, wrong decision, lost work, inaccessible action, or specific failure of the requested visual direction. Do not invent conversion loss, user research, or performance measurements.
- Cause: trace to the smallest responsible layout, primitive, token, content rule, or state owner. Search for other consumers before calling it systemic. If source is missing, label the cause as a hypothesis.
- Counterargument: the strongest plausible reason this choice might be correct. Check brand intent, expert density, platform behavior, task frequency, and supplied constraints. Drop or narrow the finding when that evidence defeats it.
- Move: name what changes, where, and how it removes the cause. Specify the relationship or state rule before selecting token values.
- Acceptance: one observable result that would show the repair worked, plus the valuable behavior it must preserve.

Example: after a failed save, the form still displays "Saved" while retaining edited fields. The defect is a false success state, not weak toast styling. Inspect who sets the status. Keep the draft, show failure beside the save action, offer retry, and assert that success appears only after acknowledgement. Preserve keyboard submission and field values. Do not claim this happened from an idle screenshot.

## Rank Without Hiding Craft

Use severity from [evidence and scoring](evidence-and-scoring.md). Confidence is separate from severity: a plausible severe failure needs a focused check, not a confident accusation.

Prioritize task failure, misleading outcomes, exclusion, and unrecoverable work. Then address repeated comprehension costs and the largest visible mismatch with the brief. Use frequency, reach, and reversibility to break ties; avoid arithmetic scores with invented inputs. Group symptoms that share a cause into one repair. Cheap cosmetic wins must not displace an unresolved major cause.

Keep craft opportunities visible even when the task functions. A monotonous composition, weak type hierarchy, poor crop, or incoherent visual language can fail an explicit design brief. State which visual relationship fails and what better composition would accomplish. Do not mislabel that failure as a standard violation.

No finding quota. A clean dimension can stay clean. Native scrollbars, familiar controls, dense tables, gradients, and existing typefaces are not defects by category. Judge their actual fit and behavior.

## Choose A Repair With A Visible Payoff

State the before-to-after change in one sentence: which object gains priority, which competitors lose weight, which comparison becomes direct, or which state becomes truthful. "More modern" and a list of CSS edits are not outcomes.

For a structural issue with competing solutions, compare a small repair with a materially different composition. Prefer the least disruptive option that removes the whole cause and meets the requested visual ambition. A tiny diff is not a virtue when it leaves the failure intact. Do not produce alternatives for an obvious local bug.

## Try To Disprove The Improvement

At the task's verification boundary, compare matched before/after evidence without reading the implementation explanation first. Identify the intended gain and any regression in information, density, legibility, brand character, focus, recovery, or access to secondary actions. Inspect the nearest affected sibling when a shared rule changed.

Call the comparison better, flat, worse, or inconclusive and explain the observable difference. If flat, trace the surviving cause instead of adding another layer of styling. If evidence is invalid, repair the evidence. Stop when the scoped outcome is demonstrated and no material regression remains; state exact blockers for missing proof. A completed checklist or successful build cannot answer whether the interface improved.
