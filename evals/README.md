# Improve UI contract scenario evaluations

`scenarios.json` is a structural contract set and a source of prompts for leakage-free forward tests. It deliberately includes positive routing, negative routing, read-only audits, mutation requests, opt-in roast behavior, all three profiles, unavailable runtime, named-only async states, unstructured change proof, advisory taste signals, and the formal-compliance boundary. Deep scenarios also declare the concrete state-family and viewport sets plus the applicable-dimension/unknown policy expected from the run.

The repository validator checks the suite's structure and coverage. It does not pretend to grade an agent's prose. For an actual forward test, give a reviewer only one scenario's `prompt` and optional `fixture`/`fixtures`, capture its actions and output, then compare them with `expected`. When a state fixture is explicitly unavailable, the expected result requires named blockers rather than fabricated runtime or change proof. Do not expose `expected` before the run.

Run the structural check with:

```powershell
npm run validate:evals
```
