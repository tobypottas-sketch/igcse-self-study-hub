# Vocabulary & Paraphrase Builder — Coursebook Source Audit

Date: 2026-10-17
Course: Cambridge IGCSE English as a Second Language 0511
Expected source depth: 50 distinct target words/phrases per unit

## Source-ready units

The supplied source lists contain 50 distinct numbered targets for Units 1, 2, 4, 7, 8, 9, 11, 12, 13, 18, 19 and 20.

These units may proceed through enrichment and QA. Source-ready does **not** mean live: every target still needs its approved meaning, sense/paraphrase data and at least three curated contexts before the unit may be published.

## Blocked units

- Unit 3 — Food: 45 numbered entries, with `inexpensive` duplicated at positions 11 and 27. 44 distinct targets; 6 additional approved targets required.
- Unit 5 — Holidays: 49 numbered entries. 1 additional approved target required.
- Unit 6 — Learning and Study Skills: 50 numbered entries but only 46 distinct targets. `confidence`, `revise`, `equivalent` and `overload` each appear twice. 4 approved replacement targets required.
- Unit 10 — Education: 48 numbered entries. 2 additional approved targets required.
- Unit 14 — Medical Care: 46 numbered entries. 4 additional approved targets required.
- Unit 15 — Healthy Lifestyles: 50 numbered entries but `fatigue` appears twice (positions 8 and 26). 49 distinct targets; 1 approved replacement required.
- Unit 16 — Animal Life: 47 numbered entries. 3 additional approved targets required.
- Unit 17 — The Environment: 50 numbered entries but only 43 distinct targets. `transmission` appears three times; `emissions`, `prosperity`, `restricted`, `affect` and `vulnerable` each repeat. 7 approved replacement targets required.

## Release rule

The application must not invent missing coursebook vocabulary to make a unit reach 50. A blocked unit stays non-live until the teacher approves corrected/replacement targets. The machine-readable gate is `content/vocabulary/source-status.json`, and the content validator independently enforces 50 distinct targets before a unit can become `live`.
