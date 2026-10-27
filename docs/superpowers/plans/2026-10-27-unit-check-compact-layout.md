# Unit Check Compact Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Unit Vocabulary Check feel like a compact exam workspace: selected answers visibly fill passage gaps, navigation is minimal, and the assessment header remains visible without excessive vertical height.

**Architecture:** Keep the existing Unit Check model/persistence untouched. Change only the Unit Check view/controller/CSS and the focused flow regression test. Continue using the existing two-column desktop layout and responsive single-column mobile layout.

**Tech Stack:** Vanilla JS, HTML string renderers, CSS, Node test runner.

**Spec:** Approved in chat on 2026-10-27: compact two-panel layout, live-filled gaps, tiny 1–10 navigation, compressed top bar.

## Global Constraints
- Do not change pathway progression, Sets, mastery, scoring, attempts, Stage Contract, games, sounds, or persistence.
- No correctness feedback before whole-check submission.
- Reading text remains visible while answering.
- Q1–6 selections immediately populate their passage gaps.

## Review Focus
- Selecting/changing Q1–6 updates only the visible chosen word, never correctness state.
- Compact navigator shows only numbers/states, no Done/Open labels.
- Header/status remain visible at normal laptop viewport heights.
- Previous/Next/jump navigation preserves answers.
- Mobile passage remains available and collapsible.

---

### Task 1: Pin compact UX behavior
**Files:** Modify `tests/vocabulary-unit-check-flow.test.js`
- [ ] Assert live-filled gap rendering.
- [ ] Assert navigator contains numbers only and no `Done`/`Open` labels.
- [ ] Assert compact header/status CSS and bounded workspace height.

### Task 2: Simplify view/controller
**Files:** Modify `src/vocabulary/unit-check-view.js`, `src/vocabulary/unit-check-controller.js`
- [ ] Render selected Q1–6 answers into passage gaps.
- [ ] Render compact 1–10 number buttons only.
- [ ] Preserve answer updates and jump navigation without correctness feedback.

### Task 3: Rebalance viewport layout
**Files:** Modify `vocabulary-unit-check.css`, `vocabulary.html`
- [ ] Compress top bar/status spacing.
- [ ] Reduce oversized panel heights/padding while keeping reading text clear.
- [ ] Keep passage and question area within a practical viewport height on desktop.
- [ ] Version Unit Check assets so preview browsers load the updated UI.

### Task 4: Verify and preview
- [ ] Run focused Unit Check tests / Vocabulary CI.
- [ ] Confirm PR #239 remains unmerged.
- [ ] Deploy exact branch head to `igcse-self-study-preview`.
