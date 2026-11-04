# Email Writer integration — staging only

This branch adds an **authenticated staging entry point** at `email-writing.html`.
It deliberately does **not** expose, register, embed or deploy the standalone writing app.

## What is wired

- Reuses the existing Supabase client and `getCurrentProfile`, including active profile checks.
- Provides a separate URL and scoped stylesheet; the existing Vocabulary/Reading/Listening application code is unchanged.
- Leaves the database-backed `apps` launcher registry untouched.
- Does not send, store, or collect student writing.

## Required before enabling students

1. Transplant the **latest tablet-polished standalone build**, keeping the 20 tasks,
   models, floating phrase bank, supported and independent modes, reviews,
   sentence trainer, language upgrade and error clinic.
2. Remove the standalone local teacher tools (they are **not authenticated**).
   Any future teacher functionality must use the existing Hub roles.
3. Fix draft privacy **before** mounting editor code. Standalone storage uses
   `igcse0511email*` keys in origin-wide localStorage; that is unsafe on shared
   school devices. Merely prefixing keys with the user ID does **not** create
   secure isolation: any later same-origin session can read them.
4. Proposed initial safe choice: **in-memory editor only** with explicit
   download/export, no autosave or saved drafts; data is cleared on sign-out.
   Persistence requires a separately reviewed secure solution and informed
   product decision. Do not silently import legacy localStorage drafts.
5. Review the app's use of `innerHTML`, dynamic template strings, custom task
   entry, clipboard access, export and student supplied text for XSS.
6. Add tests for account status, sign-out, switching users on one device,
   refresh/recovery, teacher access boundaries, and responsive behaviour.
7. Register the app in the `apps` table **only after** the full integration
   passes security and classroom acceptance. Launcher uses an HTTPS URL.
8. Run existing regression suite and review all changes in a PR; do not merge
   or deploy without explicit approval.

## Privacy boundary

A client-side auth gate improves navigation, but **does not secure static
assets**. Do not place private content or secrets in publicly accessible
HTML/JS, and do not assume blocking a page's UI is access control.

## Reference source

Local development source: `iGCSE_0511_EMAIL_WRITER_TABLET_POLISHED.html`
(standalone build supplied in the conversation). This file is not yet part of
the repository; avoid claiming that the writer has been integrated.
