# Unit Vocabulary Check Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the Unit Vocabulary Check into a distinct formal-assessment mode with a celebratory completion experience.

**Architecture:** Reuse the existing Unit Check view/controller and keep all logic untouched. Add presentation-only markup classes/helpers in `unit-check-view.js`, extend `vocabulary-unit-check.css`, and pin the visual contract in the existing flow test.

**Tech Stack:** Existing vanilla JS, HTML strings, CSS, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-27-unit-check-visual-polish.md`

## Global Constraints
- No changes to scoring, attempts, persistence, pathways, mastery, Sets, Stage Contract, missions, XP, games or sound.
- No external assets or dependencies.
- No correctness feedback before submission.
- Respect `prefers-reduced-motion`.

## Review Focus
- Perfect/strong/lower scores all render a coherent result state.
- Attempt 1/2/3 journey states are correct.
- Attempts 1–2 do not reveal answers.
- Attempt 3 full review remains intact.
- Reduced-motion removes celebratory animation.

---

### Task 1: Pin the assessment-mode visual contract
**Files:**
- Modify: `tests/vocabulary-unit-check-flow.test.js`

- [ ] Add assertions for formal-check theme hooks, result score badge, attempt journey and reduced-motion CSS.
- [ ] Verify the new assertions fail before implementation.

### Task 2: Add visual-state markup
**Files:**
- Modify: `src/vocabulary/unit-check-view.js`

- [ ] Add formal-assessment theme hooks to the active screen without changing behavior.
- [ ] Add result tone, score badge, result headline/message and attempt journey markup to completion review.
- [ ] Keep diagnostic/full-review visibility rules unchanged.

### Task 3: Apply assessment and completion styling
**Files:**
- Modify: `vocabulary-unit-check.css`

- [ ] Add navy/teal active-assessment treatment and refined selected/navigation states.
- [ ] Add designed result card, score medallion, journey strip and review-card styling.
- [ ] Add CSS-only celebration for strong/perfect scores and disable it under `prefers-reduced-motion`.

### Task 4: Verify and preview
**Files:**
- Modify only if needed for cache busting: `vocabulary.html`, `src/vocabulary/router.js`, `src/vocabulary/unit-check-controller.js`

- [ ] Run Vocabulary Builder CI on the exact PR head using the existing temporary `fix/**` verification ref.
- [ ] Point the existing Render preview branch at the verified PR head.
- [ ] Confirm PR #239 remains open and unmerged.
