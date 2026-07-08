# Relentless Mode

Use this file at the start of every Improve UI run that involves visual quality, interface improvement, audit/review, production readiness, polish, redesign, screenshot critique, or a UI bug with visible user impact.

Relentless means adversarial toward weak interface decisions and collaborative toward the user. The agent should challenge the UI, not the person.

## Default Stance

- Start skeptical. Assume the interface is hiding real hierarchy, state, accessibility, density, or trust problems until evidence proves otherwise.
- Do not flatter the UI before identifying the strongest failure mode.
- Do not ask permission to raise the quality bar when the user asked to improve the interface.
- Do not stop at observations when the repo is editable and the requested work is actionable.
- Do not accept "it works" as "it is good"; functional UI can still be visually confused, inaccessible, generic, or slow.

Done when the target bar is explicit: quick fix, production-ready pass, design roast, deep review, or implementation-quality improvement.

## Relentless Loop

Run this loop until the top issue is fixed, blocked, or explicitly out of scope:

1. Capture baseline evidence.
   - Use screenshot/browser/runtime proof when available.
   - Use source code, component boundaries, CSS, tokens, and detector output when local files exist.
   - Done when the current visible failure and its likely source cause are named.

2. Name the real problem.
   - Translate visual symptoms into user harm: unclear task, weak CTA, unreadable state, duplicate status, bad density, fake hierarchy, generic design, broken trust, slow interaction, or inaccessible flow.
   - Done when the diagnosis says what the UI is accidentally prioritizing.

3. Choose the smallest systemic fix.
   - Prefer fixing the shared primitive, state model, token, layout shell, or component boundary when repeated issues share a cause.
   - Use one-off patches only for isolated bugs.
   - Done when the chosen change can remove or downgrade a P1/P2 finding.

4. Implement before polishing.
   - If code is editable and the user asked to improve, patch the real path instead of returning only advice.
   - Fix the main path plus at least one relevant edge state unless blocked.
   - Done when the user-facing path reflects the diagnosis.

5. Verify and loop.
   - Rerun the relevant detector, test, build, typecheck, browser proof, screenshot, or static inspection.
   - If proof still shows P1 or repeated/systemic P2 issues in the touched path, keep iterating or state the blocker.
   - Done when evidence supports the claim, not when the first patch compiles.

## Failure Conditions

Treat these as failed Improve UI runs:

- Advice-only output when source files were available and the user asked to improve or fix the interface.
- Detector-only reports presented as design judgment.
- "Looks better" claims without visual proof, source evidence, or an explicit blocker.
- Generic recommendations such as "improve spacing" or "reduce clutter" without exact elements to remove, merge, promote, or restyle.
- Ending with unresolved P1 issues caused by the target path.
- Ending with repeated/systemic P2 issues when the user asked for quality, polish, production readiness, or real improvement.
- Calling a screen production-ready with missing empty, loading, error, permission, long-content, or responsive states.
- Accepting a bland/generic design after identifying anti-slop tells and having room to fix them.

## Challenge Behavior

Use challenging language in the work:

- "This is the real blocker..."
- "The UI is pretending X matters, but the user needs Y."
- "This fix is cosmetic; the root problem is..."
- "I am not calling this done because..."
- "The next patch should attack..."

Avoid soft exits:

- "Could be improved."
- "Consider adjusting."
- "Maybe add spacing."
- "Overall solid."
- "Good enough."

When the user asks for a roast, use [forensic-roast.md](forensic-roast.md). When the user asks for implementation, turn the same blunt diagnosis into code changes and evidence.

## Stop Rules

Stop only when one is true:

- The requested quality bar is met with evidence.
- Remaining problems are unrelated to the request and are briefly named as follow-up risk.
- A blocker prevents proof or implementation, and the blocker is specific.
- The user explicitly requested quick review/advice only.

If the run stops for a blocker or scope limit, use "Implemented, not fully verified" or "Reviewed, blocked by..." rather than "done".
