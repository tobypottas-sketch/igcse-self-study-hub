# Writing Academy architecture — v1
Status: foundation proposal and initial catalogue implementation. Review first; Email and Essay migration later.

## Product direction
A modern creative studio for high-school students (roughly 14–17): confident editorial typography, navy and teal with electric-blue/warm accents, distinct pathway illustrations and purposeful interactions. Academic but not stuffy. Prioritise writing, mastery, reflection and personal improvement. No competitive writing leaderboards, battles, countdown games or excessive effects. Shared identity/cosmetics may appear discreetly, and any later XP is modest and tied to meaningful verified achievement. Do not import the Vocabulary Builder stylesheet stack.

## Baseline and preservation
Review Writing is currently an approximately 83 KB standalone HTML file containing CSS, scripts, 20 original prompts across four categories, task-specific planning and drafting guidance, sectioned editor, word count, self-checks, AI feedback, teacher submission and print/export. Drafts are sessionStorage-only. The initial catalogue extracts the existing prompts and planning definitions without changing the live page. Preserve the existing URL, submissions, teacher reports, feedback consent and account access. Email's entry router redirects to email-writing-app.html. Essay is an external repository embedded in an iframe; migration needs a separate compatibility audit. Existing shared components: src/writing/submissions.js, src/assessor/student-feedback.js and writing-app-adapters.js. Reuse these rather than duplicate. Existing feedback service is optional and quota-limited, not a source of authoritative marks.

## Architecture and ownership
- src/writing/content/: text-type configs, immutable published content versions, stable IDs, original practice material. New versions never silently overwrite historical task snapshots.
- src/writing/engine/: pure validation, activity evaluation, progression and recommendation functions with no DOM or network dependencies.
- src/writing/ui/: accessible, responsive rendering, shared components and one scoped stylesheet; use Hub design tokens, not duplicated cosmetic CSS. UI depends on engine contracts rather than reverse.
- src/writing/services/: persistence adapters, auth, submissions, feedback and later XP. Reuse existing verified Hub auth and submission APIs. Separate server trust boundaries from presentation.
- Entry router: authenticated user, approved role and password-change gate; error/retry states and sign-out cleanup. Staff preview is read-only or isolated, never student progress or XP.
- Keep Review Writing legacy page operational while the next version is built in a separate gated preview. No route replacement before acceptance.

## Content and activity contracts
Each catalogue has stable text-type ID, version, word-range configuration, sections, categories, tasks and pathway definitions. Tasks have stable IDs, category, version, prompt and optional planning/drafting overrides. Activity definitions will add stable activity ID, version, pathway, difficulty, activity type, instructions, item data, feedback rationale and mastery eligibility. Initial activity types: selection, ordering, matching, editing and constructed responses. Deterministically scored exercises use explicit authored solutions and rationales; open writing uses self-check/teacher feedback and optional AI, never a fabricated objective score. Accessibility: keyboard equivalents for drag/drop, no colour-only feedback, reduced motion. Author content outside view code.

## Progress and persistence (proposed; not yet deployed)
Audit live Supabase schema and RLS before migrations. Separate mutable drafts, immutable submitted/revision snapshots and activity attempts. Each student-owned record scoped to authenticated user ID, text type, task/activity ID and content version. Drafts support optimistic concurrency (revision number), explicit save state, retry, and account-scoped recovery; no cross-account local storage leaks. Do not overwrite an existing remote draft silently. Preserve existing student_writing_submissions table and teacher visibility; teachers see assigned students' submitted work, not private drafts by default. Add migrations only after validating current policies, constraints and server APIs. Never expose service-role credentials. Versioned activity attempts support idempotency and prevent duplicate mastery/XP credits. Keep teacher-authorised custom prompts separate from published catalogue, with immutable task snapshot. Provide deletion/retention policy before storing additional personal writing. Avoid storing AI feedback unless explicitly designed and disclosed.

## Learning and progress
Six review pathways: Structure & Organisation; Vocabulary & Expression; Idea Development; Grammar & Cohesion; Editing & Improvement; Exam Mastery. Bronze/Silver/Gold can describe challenge level rather than rank. Mastery must reflect verified learning evidence, not opening pages or repeating the same item. Show progress denominators and distinguish not started from insufficient evidence. Recommendations are explainable: next uncompleted prerequisite, then recent weak skills; no fabricated scores. Writing Studio, Model Answer Library, Exam Practice and Portfolio are separate destinations. Exam requirements configurable per text type; current review range 120–160 words preserved from legacy, confirm syllabus before content release.

## Design and testing
Normal document scrolling by default; no forced fullscreen. Responsive layout based on content width; visible reachable primary actions on short screens and at 200% zoom; comfortable touch targets, focus indicators, readable text, semantic HTML. Use 1440, 768 and 390 px browser checks plus short landscape tablet. Verify keyboard operation, sign-out, failed save, reload/resume, no cross-account leakage, empty/loading/error states, accurate task version and submission. No fake live progress. Add visual regression checks for artwork and layout. Avoid per-theme overrides: scope and reuse semantic tokens, test contrast in all supported appearances. Core activities work without an AI request; feedback errors never erase work. Use Node unit tests and browser fixtures without real student data.

## Delivery gates
1. Catalogue foundation and parity tests (this PR).
2. Gated Review homepage and navigation prototype, with no invented progress.
3. Activity schema, engine and reviewed initial content; add skill pathways incrementally.
4. Modern Studio migration preserving all 20 tasks, guidance, custom question, feedback, submissions and export.
5. Live schema/security audit, additive draft/attempt migrations, portfolio, teacher reporting.
6. Optional shared identity and server-verified XP after wallet trust-boundary audit.
7. Full regression, tablet verification, controlled rollout; retain fallback until verified.
8. Extend engine to Email, then Essay without rebuilding it.
Rollback: leave current entry route unchanged until release; revert feature route separately from additive storage migrations. No destructive database changes.

## Open items
Live Supabase/RLS, existing automated coverage, Email implementation, external Essay implementation and reward wallet eligibility are not fully audited. No database change, production routing change or new student-facing feature in foundation PR. The six pathways are definitions only, not completed lessons. No actual artwork yet.
