# Vocabulary Ladder — Single Source of Truth Design

## Intent

Restore the Vocabulary Builder ladder so students can genuinely progress through the fixed sequence:

Recognise → Match → Apply → Recall → Mastery

The ladder must be driven by the existing per-word/per-pathway evidence engine. Unit-level UI may summarise that evidence, but must not maintain or enforce a second progression system.

## Current Failure

The codebase currently contains two competing progression models:

1. **Per-word/per-pathway evidence progression** in `supabase/functions/_shared/vocabulary-pathway-progress.js`.
   - Recognise: 2 clean successes on different content/questions.
   - Match: 2 clean successes.
   - Apply: 2 clean successes, with context diversity where required.
   - Recall: 2 clean unassisted successes.
   - Mastery: 3 successes, including at least 2 clean unassisted successes and prompt diversity.

2. **Unit-level pathway journey progression** in `vocabulary_unit_pathway_journey` / `vocabulary-pathway-journey.js`.
   - Counts a 10-question block.
   - Requires 8 clean successes to move the entire pathway to the next rung.
   - `buildUnitPathwayStates()` prioritises this journey when present.
   - `startPathwaySession()` then uses that unit-level stage to choose the activity rung.

The second model masks the first and can keep a pathway on Recognise even while individual words have earned higher-stage evidence. This is why the student-facing ladder is effectively unusable.

## Decision

The **per-word/per-pathway evidence model is the only authoritative progression model**.

The unit-level `vocabulary_unit_pathway_journey` layer will be retired as an authority for student progression.

No student evidence will be deleted or reset.

## Required Behaviour

### Word-level progression

Each vocabulary occurrence keeps its own pathway state for each of the six pathways.

Existing thresholds remain unchanged.

A word that completes Recognise can move to Match even if other words in the unit are still at Recognise.

### Unit pathway card

The unit card is a summary and launch point, not a second mastery system.

For each pathway it should:

- show the current teaching/practice rung derived from the serviceable word states;
- launch a session that selects words currently needing that rung;
- allow later-stage question types to appear as soon as there are eligible words at those stages;
- never require all 50 words to finish one rung before the student can experience the next rung.

The unit summary must not be based on a persistent 10-question / 8-success journey record.

### Session planning

A fixed-pathway session must select targets from real word-level pathway states.

The planner must not force every selected target to use a single global unit stage if those words have different earned stages.

Question type remains fixed by the target word's current pathway rung using the existing authoritative pathway activity map.

A session may therefore contain multiple rung types when the selected words are genuinely at different points in the same pathway, unless the UI intentionally filters to a selected rung.

For the first implementation, prefer the simplest coherent behaviour:

- the pathway card chooses the lowest currently actionable rung that has eligible serviceable targets;
- the session serves only words currently at that rung;
- once enough of those words complete that rung, the card can move to the next actionable rung even if some other words remain behind and are handled through review/adaptive targeting.

### Persistence

Authoritative word-level pathway evidence remains stored inside the existing unit mastery contextual evidence and updated by `vocabulary-attempt-action`.

Do not add another progression table.

The existing `vocabulary_unit_pathway_journey` table may remain temporarily for backward compatibility, but:

- client code must stop reading it as the authority;
- new attempts must not depend on it for stage selection;
- its trigger must not influence visible ladder state;
- a later cleanup migration may remove it once compatibility is confirmed.

### UI

The ladder must visibly reflect real word-level progression.

At minimum:

- the pathway card's highlighted rung comes from aggregated word-level state;
- opening a pathway launches the corresponding rung's activity types;
- after qualifying evidence is saved, returning to the unit view immediately recalculates the ladder from word-level evidence;
- students can actually reach Match, Apply, Recall and Mastery question types.

The progress UI must not show the retired 10-question / 8-clean-success journey as if it were the ladder.

## Aggregation Rule

For a given pathway:

1. Exclude unavailable/non-serviceable targets using existing pathway coverage.
2. Build each word's pathway state using `buildWordPathwayStates()`.
3. Group words by their current rung.
4. Choose the **lowest rung that currently has eligible words requiring practice** as the unit card's current rung.
5. Do not let one permanently weak/untouched word block later-rung practice forever. Adaptive selection should prioritise lagging words, but later-stage words must remain reachable.

Implementation may refine the exact launch heuristic if tests show a better deterministic rule, but it must remain a summary of word-level evidence rather than a separate progression counter.

## Data Preservation

Do not change:

- existing vocabulary item IDs;
- occurrence IDs;
- historical mastery/evidence;
- per-word pathway evidence already stored;
- retry/support evidence semantics;
- mastery thresholds;
- activity type mapping;
- canonical vocabulary content.

Existing `vocabulary_unit_pathway_journey` rows are ignored for progression after this change; they are not migrated into word evidence because they represent a different model.

## Code Areas Expected to Change

- `src/vocabulary/pathway-view-model.js`
  - stop prioritising registered unit journey state;
  - aggregate directly from word pathway states.

- `src/vocabulary/app.js`
  - stop deriving `state.pathwayStage` from the unit journey;
  - launch fixed-pathway practice from aggregated word states;
  - ensure target selection is based on each word's actual pathway state.

- `src/vocabulary/data.js`
  - stop loading/registering journey rows for normal student progression;
  - stop mirroring journey attempts client-side.

- `src/vocabulary/pathway-journey-store.js` / `src/vocabulary/pathway-journey.js`
  - retire from live student progression; keep only if temporary compatibility/tests require them.

- `supabase/migrations/20261018140000_vocabulary_pathway_journey.sql`
  - do not rewrite historical migration;
  - add a new migration only if needed to disable/drop the trigger safely.

- relevant tests
  - replace journey-authority tests with end-to-end word-level ladder tests.

## Required Tests

1. A word progresses Recognise → Match after satisfying existing Recognise evidence rules.
2. Match activities are then selected for that word.
3. The same word can progress Match → Apply → Recall → Mastery under existing thresholds.
4. Another untouched word remaining on Recognise does not erase or regress the progressed word.
5. Unit pathway summary is derived from word-level states, not journey rows.
6. A stale `vocabulary_unit_pathway_journey` row cannot force the unit card back to Recognise.
7. Session planner selects only targets eligible for the displayed/actionable rung.
8. Returning to the unit page after saved evidence recalculates the rung correctly.
9. Refresh preserves ladder state through persisted unit mastery evidence.
10. Retry/support attempts retain current evidence semantics.
11. No historical evidence is deleted/reset.
12. Existing pathway activity mappings remain unchanged.
13. Browser smoke proves a student can encounter at least one Match activity after completing Recognise evidence.

## Success Criteria

The fix is complete only when a real student account can:

- open a pathway;
- complete enough qualifying evidence for a word at Recognise;
- return to the unit/pathway view and see that progression reflected;
- launch the pathway again and receive a Match-type activity;
- continue eventually into Apply, Recall and Mastery;
- refresh/sign back in without losing that word-level pathway state.

The ladder must be demonstrably usable end-to-end before merge.
