# Vocabulary Question Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make instruction, stimulus, target language and answer area immediately distinguishable.
**Architecture:** Reuse the shared question view and existing answer controls. Add presentation-only extraction for known embedded prompt patterns, escaped text emphasis and noninteractive gap styling; load one narrowly scoped CSS layer before the final accessibility layer.
**Tech Stack:** JavaScript ES modules, CSS, node:test, Playwright/Chromium.
**Spec:** docs/superpowers/specs/2026-10-29-vocabulary-question-hierarchy-design.md

## Global Constraints
No answer/key/scoring/progression/mastery/pathway/level/merit/content-bank changes. No Supabase, authentication, admin or other apps. Synthetic test fixtures only. Preserve hidden-target rules and original text; do not inspect marking keys for presentation.

## Review Focus
- Hidden recall targets must remain hidden.
- Unrecognised/quoted/HTML-like text must stay visible and escaped.
- Context-free and matching questions need a meaningful reading focus.
- Long mobile text and gaps must wrap without overflow.
- Retry/correct states and drag/keyboard/form controls must retain their hooks.

### Task 1: Shared rendering hierarchy
Files: src/vocabulary/views.js; tests/vocabulary-question-hierarchy.test.js.
Consumes existing question/source/term fields; produces instruction followed by source/template/target and unchanged response controls.
- [x] Add synthetic tests for all six pathways, embedded paraphrase original/template, quoted spelling definition, visible target emphasis, hidden targets, escaped/unrecognised content, typed and interactive gaps, object immutability.
- [x] Run node --test tests/vocabulary-question-hierarchy.test.js; verify expected missing-feature failures.
- [x] Implement minimal presentation helpers using visible fields only; retain existing target exclusions, matching deduplication and answer hooks.
- [x] Re-run new tests and existing source/fidelity/leak/quiz tests; resolve only introduced regressions.

### Task 2: Scoped hierarchy styling and browser verification
Files: vocabulary-question-hierarchy.css; vocabulary.html; tests/vocabulary-question-hierarchy-browser.test.js.
Consumes renderer classes and existing control hooks; produces smaller instruction, larger calm stimulus, teal emphasis and clear slots.
- [x] Add browser assertions for all six pathways at 1280, 768, 390, 320px; instruction smaller than stimulus, target emphasis, spacing, overflow, gap/input interaction, retry/correct states.
- [x] Run on unchanged styles and confirm hierarchy assertion fails.
- [x] Implement stylesheet scoped to question sessions and load before the final accessibility layer; preserve focus and correct/hover states.
- [x] Run focused Vocabulary tests and browser checks, inspect screenshots, then full npm test. Compare failure names/assertions against main at 474ab9ec0abef4e12885539476ed11f246167433.
- [ ] Review full diff, commit, create PR, merge if no feature regressions, verify merged SHA.

## Verification result

Node 22.23.0. Renderer regression tests: 11 pass (initial RED: 7 failures/2 existing safeguards pass; later spelling and matching additions each failed before implementation). Browser hierarchy RED: 24 failures/2 interaction passes before CSS; final browser checks plus existing wrapping check: 29 pass, no skips. Focused rendering/source/response/leak/fidelity/wrapping checks: 98 pass, 0 fail, 35 browser-dependent skips covered by the explicit browser run.

Full suite command on both branch and base: `npm test -- --test-timeout=45000 --test-concurrency=4 --test-reporter=tap`. Ran from isolated copies under /tmp because the existing content-generator test uses URL.pathname without decoding workspace spaces. Branch: 1949 pass, 7 fail, 5 cancelled, 123 skipped, 5 todo. Current main 474ab9ec0abef4e12885539476ed11f246167433: 1938 pass, 7 fail, 5 cancelled, 96 skipped, 5 todo. All 12 failure/cancellation diagnostic blocks are identical after normalizing paths and removing duration fields.

Pre-existing failures: Activity RPC pagination; earned-but-unawarded merit alerts; handout-only login card content; partial credential failure warning; cached Admin tab rendering; login-card identity-only content; vocabulary-merits.test.js imports the absent countPassedStages export. Pre-existing cancellations: duplicate bulk import; bounded bulk provisioning; class candidate loading; two class rename tests. These were left unchanged.

Visual inspection used published content examples from all six pathways. Browser assertions use synthetic data at 1280, 768, 390 and 320px, including real Recognise/Apply/Recall stages, keyboard gap filling, typed retry, correct answer, matching cue and multi-slot controls. Review found and verified the Meaning Recognise spacing fix; no remaining findings. Accessibility stylesheet stays last.
