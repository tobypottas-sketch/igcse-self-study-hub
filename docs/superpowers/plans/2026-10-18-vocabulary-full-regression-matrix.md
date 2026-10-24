# Vocabulary Full Regression Matrix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a permanent regression suite that proves every Vocabulary Builder practice mode can sustain Q1→Q10 at every mastery stage without selecting retired or unbuildable activities.

**Architecture:** Exercise the same `selectEligiblePriorityTargets` and `buildTargetPracticeQuestion` path used by student sessions and Staff Preview. Run a deterministic Unit 1 matrix across all seven practice modes and all four mastery stages, carrying recent activity history and used content IDs forward between questions. Keep this as test-only hardening unless the matrix exposes a real product defect.

**Tech Stack:** Node.js `node:test`, existing Vocabulary Builder ES modules, GitHub Actions Vocabulary Builder CI.

**Spec:** User-approved full mode × stage × Q1→Q10 regression matrix in this project conversation.

## Global Constraints

- Work only in `tobypottas-sketch/igcse-self-study-hub`.
- Do not change historical mastery or private student data.
- Do not re-enable retired `correct_usage` or `collocation_builder` activities.
- Use the existing planner → builder path; do not create a parallel test-only generator.
- No production behavior changes unless the matrix exposes a verified defect.

## Review Focus

- Focused modes must never leak activities from another practice mode.
- `secure` and `mastered` stages must still have ten buildable questions rather than exhausting eligible targets.
- Sequential recent-activity history must not cause planner dead ends by Q10.
- Used-content avoidance must not make later questions unbuildable.
- Retired activities must never appear even when their catalogue definitions remain available for history.

---

### Task 1: Add the full session regression matrix

**Files:**
- Create: `tests/vocabulary-full-regression-matrix.test.js`

**Interfaces:**
- Consumes: `selectEligiblePriorityTargets(args)` and `buildTargetPracticeQuestion(args)` from `src/vocabulary/session-targets.js`.
- Produces: permanent deterministic coverage for 7 modes × 4 stages × Q1→Q10.

- [ ] **Step 1: Add the matrix test**

For each practice mode (`learn`, `context`, `question_text`, `phrase_paraphrase`, `idea_paraphrase`, `writing`, `adaptive`) and each stage (`new`, `building`, `secure`, `mastered`): select at least ten eligible targets, build ten sequential questions, carry recent activity history and used content IDs forward, and assert each question is live, mode-compatible, non-retired, non-empty, and buildable.

- [ ] **Step 2: Run Vocabulary Builder CI**

Expected: the new matrix either passes cleanly or identifies a concrete mode/stage/question defect.

- [ ] **Step 3: If RED, fix only the verified defect and rerun**

Do not broaden scope. Add a focused regression assertion for any discovered failure before modifying production code.

### Task 2: Final verification and merge

**Files:**
- No additional product files unless Task 1 exposes a defect.

- [ ] **Step 1: Verify full CI**

Require `npm test`, vocabulary content validation, and Unit 1 publish-scope verification to pass.

- [ ] **Step 2: Open and review PR**

Confirm the diff is test-only unless a matrix-discovered defect required a minimal product fix.

- [ ] **Step 3: Merge and verify production workflows**

Require System Audit, Runtime Smoke, and Pages deployment to pass on the merge commit.
