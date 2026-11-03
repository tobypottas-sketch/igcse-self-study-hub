# Vocabulary Teacher Visual Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the teacher analytics page's sterile, wall-of-data feel without changing any metrics, actions, or backend contracts.

**Architecture:** Add presentation-only semantic classes to the existing teacher overview and layer a dedicated polish stylesheet on top of the established teacher styles. Keep the monthly chart, pathways matrix, actions, and all analytics logic unchanged.

**Tech Stack:** JavaScript view templates, CSS, Node test runner.

**Spec:** Approved in conversation on 2026-11-03: stronger hierarchy, softer borders, more breathing room, less dominant pathways table, and subtle variation in the diagnostic cards.

## Global Constraints
- No Supabase or data changes.
- No changes to mastery, progression, Evidence Hub, or analytics calculations.
- Preserve every existing action and navigation target.
- Avoid decorative overload or bright edtech styling.

## Review Focus
- Pathways table remains readable and horizontally scrollable.
- Empty states remain calm and legible.
- Existing buttons and links retain their interaction contracts.
- Mobile layout remains single-column and readable.
- New styles remain scoped to teacher analytics.

---

### Task 1: Add semantic presentation hooks
**Files:**
- Modify: `src/vocabulary/teacher-views.js`
- Create: `tests/vocabulary-teacher-visual-hierarchy.test.js`

- [ ] Write contract tests for overview section classes.
- [ ] Add presentation-only classes to attention, pathways, and diagnostic sections.

### Task 2: Add scoped visual hierarchy styles
**Files:**
- Create: `vocabulary-teacher-polish.css`
- Modify: `vocabulary.html`
- Test: `tests/vocabulary-teacher-visual-hierarchy.test.js`

- [ ] Add softer section treatments and reduced table emphasis.
- [ ] Add responsive rules.
- [ ] Link stylesheet with a versioned URL.
- [ ] Run full repository CI and inspect diff before merge.
