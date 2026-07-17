# Context Example: Command-Center Surgery

## Target

An implemented regional fleet console used continuously by operators who acknowledge incidents, assign owners, inspect live feeds, coordinate shift handoff, and recover failed actions.

## Context Read

`command center + monitor/respond + active incident + continuous high-consequence use + multi-panel shell + alert-flood/handoff/recovery proof`

## Wrong Diagnosis

Treating it as a dark analytics dashboard produces equal cards, decorative maps, pulsing red accents, and summary metrics. It does not expose who owns the incident, whether the feed is stale, or what recovery is safe.

## Preserve

- Keyboard triage and stable selection.
- Timestamp precision, source identity, and audit trail.
- Acknowledgement, assignment, escalation, and handoff.
- Partial subsystem visibility and reversible actions.

## Systemic Cut Order

1. Build one stable incident spine: summary, freshness, scope, owner, evidence, action, recovery.
2. Distinguish normal, degraded, incident, acknowledged, assigned, recovering, and resolved.
3. Stop auto-updates from moving focused or selected items.
4. Demote ambient feeds; reserve motion and danger color for response-worthy change.
5. Remove fake terminal texture, glow, radar decoration, and equal panel priority.
6. Finish density, aligned timestamps, scrolling, focus, icons, and handoff readability.

## Proof Matrix

- States: normal, one incident, alert flood, stale/offline source, partial failure, assigned, recovering, resolved.
- Interactions: acknowledge, assign, drill down, retry, undo when safe, keyboard triage, handoff.
- Viewports: operator desktop and wallboard/large display when supported.
- Detail evidence: freshness, ownership, state transitions, stable rows, alert contrast, and scroll regions.

## Claim Limit

This example cannot prove operational correctness, alert policy, or recovery safety. Those require the target's domain rules, state fixtures, runtime, and human confirmation.
