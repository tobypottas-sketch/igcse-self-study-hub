# Vocabulary Teacher Visual Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the teacher analytics page's sterile, wall-of-data feel without changing any metrics, actions, or backend contracts.

**Architecture:** Layer a dedicated, presentation-only stylesheet over the existing teacher analytics styles. Scope the polish to the class overview by the existing Monthly usage panel so no view markup or analytics logic needs to change.

**Tech Stack:** CSS, HTML stylesheet wiring, Node test runner.

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
- New styles remain scoped to the class overview.

---

### Task 1: Define presentation contracts
**Files:**
- Create: `tests/vocabulary-teacher-visual-hierarchy.test.js`

- [x] Add contract tests for overview-only scoping, pathway softening, diagnostic variation, responsive rules, and cache-safe stylesheet loading.

### Task 2: Add scoped visual hierarchy styles
**Files:**
- Create: `vocabulary-teacher-polish.css`
- Modify: `vocabulary.html`
- Test: `tests/vocabulary-teacher-visual-hierarchy.test.js`

- [x] Add softer panel treatments and reduced table emphasis.
- [x] Add restrained variation to the bottom diagnostic cards.
- [x] Add responsive rules.
- [x] Link stylesheet with a versioned URL.
- [ ] Run full repository CI and inspect diff before merge.
