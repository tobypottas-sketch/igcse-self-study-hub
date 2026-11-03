# Vocabulary Monthly Usage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an IXL-style current-month class usage chart to the Vocabulary teacher analytics screen using real daily active-student counts.

**Architecture:** Add a pure cohort aggregator that converts existing `question_attempt` activity timestamps into one daily active-student count per calendar day. Feed that aggregate through the existing practice-habits object and render a full-width, accessible CSS bar chart on the class overview. The aggregator accepts arbitrary students/activity so Grade and Whole School views can reuse it later.

**Tech Stack:** JavaScript ES modules, HTML/CSS, Node test runner.

**Spec:** Approved in conversation: class cohort first; current calendar month; main metric is number of students active each day; preserve separation between engagement and mastery.

## Global Constraints

- No Supabase schema/data changes.
- Use existing Vocabulary `activity_events` already loaded for teachers.
- Count a student once per day regardless of number of attempts.
- Only `question_attempt` events count as usage.
- Show dates from the first day of the current month through today.
- Keep usage explicitly labelled as activity, not mastery evidence.
- Do not expose student IDs, answers, notes, emails, or raw event payloads.

## Review Focus

- Multiple attempts from one student on one day count once.
- Events outside the current month or after `now` are excluded.
- Invalid timestamps are ignored safely.
- Empty activity renders a zero-valued month without breaking the chart.
- Chart remains readable on narrow screens and is accessible without hover.

---

### Task 1: Reusable monthly cohort aggregation

**Files:**
- Create: `src/vocabulary/monthly-usage.js`
- Create: `tests/vocabulary-monthly-usage.test.js`
- Modify: `src/vocabulary/practice-habits.js`

**Interfaces:**
- Produces: `buildMonthlyUsage({ students, activity, now })` returning `{ monthLabel, studentCount, activeStudents, activeDays, days }`.
- `days` contains `{ date, day, activeStudents }` for each calendar day from month start through `now`.

- [ ] Write failing tests for deduplication, date boundaries, invalid timestamps, and empty activity.
- [ ] Implement the pure aggregator.
- [ ] Add `monthlyUsage` to `buildPracticeHabits()` without changing existing habit metrics.
- [ ] Run focused and broader tests.

### Task 2: Teacher overview chart

**Files:**
- Modify: `src/vocabulary/teacher-views.js`
- Modify: `vocabulary-teacher.css`
- Create: `tests/vocabulary-monthly-usage-view.test.js`

**Interfaces:**
- Consumes: `habits.monthlyUsage` from Task 1.
- Produces: a full-width `Monthly usage` panel between the summary/merit area and the existing two-column teacher grid.

- [ ] Write a failing view contract test for heading, summary copy, bars, accessible labels, and engagement-only note.
- [ ] Render daily bars scaled to the busiest day, with zero days retained.
- [ ] Add responsive chart styling scoped to teacher analytics.
- [ ] Run the full test suite, inspect the diff, and open an unmerged PR.
