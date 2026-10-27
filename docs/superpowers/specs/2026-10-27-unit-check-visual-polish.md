# Unit Vocabulary Check Visual Polish

## Intent
Give the Unit Vocabulary Check a distinct assessment-mode identity that feels formal during the test and rewarding at completion, while remaining clearly part of the existing Vocabulary Builder.

## Goals
- Keep the active test restrained, readable and exam-like.
- Use navy/teal assessment styling with clearer hierarchy between passage and question panels.
- Make selected answers and question navigation feel intentionally designed without adding correctness cues.
- Redesign the completion screen around a strong score badge, result message and 3-attempt journey indicator.
- Add a light celebratory motion treatment for strong/perfect results, respecting reduced-motion preferences.

## Non-goals
- No scoring, attempt, persistence, pathway, mastery, Set, Stage Contract, mission, XP, game or sound changes.
- No new external assets or dependencies.
- No teacher-dashboard work.

## Chosen direction
Hybrid formal + celebratory. The active assessment stays calm and academic; the completion screen provides the visual payoff. Avoid childish/game-like decoration.

## Active-test treatment
- Compact formal-check chip in the sticky assessment header.
- Stronger but subtle separation between reading source and response area.
- Refined selected-choice states, navigator states and base-word target marker.
- Preserve the compact viewport-focused layout and live-filled passage gaps.

## Completion treatment
- Central result card with tone based on score.
- Large circular/medallion-style score badge.
- Clear result title/message.
- Attempt journey: Attempt 1 / Attempt 2 / Attempt 3 with completed/current/locked states.
- Diagnostic/full-review content presented as designed review cards rather than flat grey boxes.
- Light CSS-only celebration for strong/perfect results; disabled under prefers-reduced-motion.

## Constraints
- Existing Unit Check functionality remains unchanged.
- No correctness feedback before submission.
- Attempts 1–2 still hide correct answers; Attempt 3 still unlocks full review.
- PR #239 remains unmerged for review.
