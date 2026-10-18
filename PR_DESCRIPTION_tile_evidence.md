## Tile assembly is scaffolded paraphrasing evidence, not independent production

### Problem
`build_paraphrase` and `build_same_idea` were `strong` + `productive:true`, and `build_same_idea` also carried the `production` strand. In `applyEvidence`, `productive = evidence.productive === true || strands.includes('production')`, so a first-attempt tile success incremented `successfulProductions`, production activity/context diversity **and** `unscaffoldedProductions`: the exact `deriveStatus` gates for `mastered`.

Reproduced with the real engine and the real client/server contract:
- **4 first-try successes (2 multiple-choice + 2 tile clicks, nothing typed) reached `mastered`** (`unscaffoldedProductions = 2`).
- A **single** tile click moved a fresh target to `secure` (strong = 3 on paraphrasing, recognition and meaning).
- The teacher skill profile credited tile clicks to **"Lexical production"** and counted them in `independentStrongCount`.

### Fix (client, server and engine kept identical)
| Where | Change |
|---|---|
| `activity-catalogue.js` (client) | both tile rows: `strands:['paraphrasing']`, `evidenceStrength:'medium'`, `productive:false` |
| `vocabulary-attempt-action/index.ts` `ACTIVITY_EVIDENCE` (server) | same two rows |
| `_shared/vocabulary-engine.js` `defaultStrandsForQuestionType` | tiles are `['paraphrasing']` (only `complete_paraphrase` stays paraphrasing+production) |
| `skill-profile.js` (teacher) | tiles no longer credit `lexical_production`; legacy stored `strong` tile rows are *read* as at most `medium` |

**Result:** tile success is still positive paraphrasing/recognition/meaning evidence (paraphrasing +2 first try; +less with support). It can no longer touch `successfulProductions`, `unscaffoldedProductions`, production diversity or the `production` strand, so it cannot satisfy any "independent production" requirement. Typed activities are unchanged.

### Historical data: nothing rewritten
No migration, no backfill, no change to stored attempt metadata or mastery rows. The write path still records exactly what it is given. The only read-side reinterpretation is in the teacher skill profile (legacy `strong` tile events are weighted as `medium` and no longer count as Lexical production / independent strong). Existing mastery rows are untouched, so a student who already reached `secure`/`mastered` via tiles keeps that status until normal evidence/review moves it.

### Not changed (as scoped)
Planner (adaptive `secure` ladder still serves typed production, covered by a test), retry/support evidence, Correct Usage, scaffolding, migrations, `collocation_builder` (retired; its server row is still strong/productive but unreachable).

### Tests
14 new in `tests/vocabulary-tile-evidence.test.js`; 4 string labels swapped in `tests/vocabulary-mastery.test.js` (a hand-built evidence fixture used `build_paraphrase` as its example production type; mechanics unchanged). Full suite **373 -> 387 pass, 0 fail**; content validator passes. Eight targeted mutations (server flag, client drift, re-adding the production strand, engine defaults, skill-profile credit, legacy cap, trusting client-supplied `productive`, preview altering evidence) each fail a specific test.

Covers your list: tile success is positive evidence; cannot increment unscaffolded production; tile-only (even from a state meeting every other requirement, 50 clicks) never reaches `mastered`; typed activities still do; preview and student share one evidence contract (single `evidenceFor`, preview only affects `review`; server takes strands/strength/productive from its own table, never the request); plus client/server table parity for **all 18** activities.

### Behaviour change to be aware of
Tile success is now `medium` (2) instead of `strong` (3), so a fresh target needs **two** successful tile tasks (not one) to reach `secure`. Intentional, but it slows progress through tile-heavy sessions.

### Deploy
The server table change takes effect when the `vocabulary-attempt-action` edge function is redeployed; the client change is live on merge. Until both are deployed the client and server tables would differ (the parity test guards this in CI), so deploy them together.

### Follow-ups (separate PRs, not done here)
1. **Identify already-inflated targets (read-only).** Mastery rows persist `production_activity_types` (jsonb). Rows with `status = 'mastered'` whose types are a subset of `{build_paraphrase, build_same_idea}` got there on tile credit. Not run against the DB; table name not verified here.
2. `complete_paraphrase` is typed but only the final chunk is typed (everything else is given as the stem) and still counts `strong` + `productive` + unscaffolded. Same class of issue, smaller; left as-is and pinned by a test.
