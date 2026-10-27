# Unit Vocabulary Check V1 — Design

## Intent
Add a formal, student-facing Cambridge iGCSE ESL 0511 vocabulary assessment layer to each unit without changing the existing six Vocabulary Builder pathways or their mastery/progression architecture.

## V1 scope
- Unit 1 pilot only.
- One formal Unit Vocabulary Check per unit.
- Three fixed equivalent forms: A, B, C.
- Maximum three attempts, one form per attempt.
- Ten questions per form: Q1–6 passage-based multiple choice, Q7–8 paraphrase/closest meaning, Q9 typed word-form, Q10 precision/collocation multiple choice.
- No feedback until the whole form is submitted.
- Attempts 1–2: score + short diagnostic feedback for wrong answers only; no correct answers revealed.
- Attempt 3: full answer review unlocked, then assessment locks.
- Latest score and best score are shown separately from pathway mastery.
- Reading passage remains visible while students answer Q1–6. Desktop/tablet: sticky left passage panel and right question panel. Small screens: sticky/expandable passage panel above the question, never fully unavailable.

## Placement
On the existing unit screen, after the six pathway cards and before the current “Beyond the pathways / Extra Practice & Reference” section. It must not appear as a seventh pathway.

## Content
Three curated Unit 1 forms are stored in repo content, not randomly generated. Forms use approved Unit 1 vocabulary only and are matched for difficulty and skill balance.

## Persistence
Create a dedicated student-owned Supabase table for formal check attempts. Persist only assessment metadata needed for progress: student, unit, form, attempt number, score, maximum score and completion time. Do not store individual student responses in V1.

## Boundaries
Do not change Stage Contract v2, pathway order, pathway progression, Sets, mastery/evidence, missions, XP, existing vocabulary attempts, scoring, retry logic, games, or sound behavior. Formal Unit Checks do not submit through the existing vocabulary attempt engine and do not update mastery.

## UX behavior
- Assessment card shows status, attempts remaining, latest score and best score.
- Start/resume entry is clear and separate from practice.
- Students answer all ten questions before submission.
- Submission is confirmed once and consumes the current form/attempt.
- Wrong-answer feedback is diagnostic and non-revealing on attempts 1–2.
- Attempt 3 review includes student answer, correct answer and concise explanation.
- Assessment locks after attempt 3.

## Non-goals for V1
- Teacher dashboard/reporting.
- Random/generated assessment variants.
- Changes to unit mastery.
- More than one formal check per unit.
- Storing raw student answers server-side.
