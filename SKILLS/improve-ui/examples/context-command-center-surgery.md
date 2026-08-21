# Context example: command-center surgery

## Target

Implemented regional fleet console. Operators continuously acknowledge incidents, assign owners, inspect live feeds, coordinate shift handoff, recover failed actions.

## Context read

`command center + monitor/respond + active incident + continuous high-consequence use + multi-panel shell + alert-flood/handoff/recovery proof`

## Wrong diagnosis

Treating it as a dark analytics dashboard yields equal cards, decorative maps, pulsing red accents, summary metrics — not who owns the incident, whether the feed is stale, or what recovery is safe.

## Preserve

- Keyboard triage, stable selection.
- Timestamp precision, source identity, audit trail.
- Acknowledgement, assignment, escalation, handoff.
- Partial subsystem visibility, reversible actions.

## Systemic cut order

1. One stable incident spine: summary, freshness, scope, owner, evidence, action, recovery.
2. Distinguish normal, degraded, incident, acknowledged, assigned, recovering, resolved.
3. Stop auto-updates from moving focused or selected items.
4. Demote ambient feeds. Reserve motion and danger color for response-worthy change.
5. Remove fake terminal texture, glow, radar decoration, equal panel priority.
6. Finish density, aligned timestamps, scrolling, focus, icons, handoff readability.

## Proof matrix

- States: normal, one incident, alert flood, stale/offline source, partial failure, assigned, recovering, resolved.
- Interactions: acknowledge, assign, drill down, retry, undo when safe, keyboard triage, handoff.
- Viewports: operator desktop; wallboard/large display when supported.
- Detail evidence: freshness, ownership, state transitions, stable rows, alert contrast, scroll regions.

## Claim limit

Cannot prove operational correctness, alert policy, or recovery safety — those need the target's domain rules, state fixtures, runtime, and human verification.
