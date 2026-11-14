# Diagnostic Staff Review Queue

**Status:** Supabase review backend deployed; GitHub Pages staff UI awaits merge/deployment. The secure review backend was added to Edge Function `vocabulary-diagnostic` **version 3**, with JWT verification enabled.

## Navigation

For an active teacher or admin, open **Vocabulary Builder → Choose a class → Review diagnostic questions**. This links to `vocabulary-diagnostic-review.html`, a separate staff workspace. Student accounts are rejected both by page routing and by the independently authenticated backend.

The reviewer can:
- Browse 10 candidate questions at a time; filter by provisional A1–C1 band.
- Inspect full question, four options, correct answer, distractor rationales, tested sense, source note and provisional CEFR-level reference.
- Flag/reject a problematic item with written notes.
- Approve language quality; a **different** staff reviewer may subsequently approve assessment quality.
- Record CEFR-level evidence separately, with a meaningful explanation/reference; this is **not calibration** or approval to deliver a student assessment.
- See an append-only review history.

The UI intentionally does **not** offer direct editing of private scored items: revisions will require a new version and fresh approval. A flag or rejection makes a question ineligible for further approval on its current version. There is deliberately **no button to publish pilot items**.

## Backend

- `private.vocabulary_diagnostic_reviews`: append-only review decisions; RLS enabled; direct anonymous/authenticated access revoked.
- `public.vocabulary_diagnostic_review_api`: `SECURITY DEFINER`, `search_path=''`, `service_role` EXECUTE only. Verifies the supplied **server-verified** actor is an active teacher/admin.
- Existing Edge Function `vocabulary-diagnostic` now supports `review-list`, `review-detail`, `review-decision`; the Edge Function obtains actor identity from `auth.getUser(token)` and does not accept `p_actor` from the client.
- Page content is HTML-escaped, and only the staff-only detail endpoint returns keyed options and rationales. Student diagnostic payloads remain keyed-answer-free.
- This capability is isolated from Vocabulary practice, merit and student diagnostic sessions.

## Verification (14 November 2026)

- Managed migration `vocabulary_diagnostic_staff_review_queue` succeeded.
- Edge Function **v3** deployed with `verify_jwt=true`.
- SQL integration smoke test passed: teacher list and keyed detail, student denied, language approval, same-reviewer assessment denial, second-reviewer assessment approval, flag, and later verification denial; **transaction rolled back**.
- **5/5 focused source-level regression tests passed**; teacher UI JavaScript parsed.
- Database permissions: `anon_exec=false`, `authenticated_exec=false`, `service_role_exec=true`; review table RLS enabled and direct SELECT denied to `anon` and `authenticated`.
- Audit after smoke test: **0 saved reviews**, **80 draft questions**, **0 forms/assignments/sessions**.

## Still to verify / develop

1. Browser-level interaction testing after merging the staff page: correct auth routing, paging, filtering, long answer options, and error responses with a real staff JWT. This has **not** been completed.
2. Independent, source-specific CEFR-level checks and detailed language/assessment review by humans. The 80 items remain unverified.
3. Versioned revision workflow for flagged items, plus more candidate items and alternate forms.
4. Real browser-level negative student tests and assessment concurrency tests before any pilot students are assigned.
5. No CEFR proficiency estimate must be inferred from these draft item tags or raw scores.

## PR dependencies

This change was branched from **PR #447** (secure pilot backend), not directly from `main`. Merge #447 first, then retarget this PR to `main` and merge after review. PR #448 (progress report) is independent documentation.

No scored item bank, answer keys or raw student data are committed to GitHub.
