# Email Writing — authenticated integration branch

## Implemented on this branch
- `email-writing.html` authenticates the Hub user and redirects to `email-writing-app.html`.
- `email-writing-app.html` contains the **complete 20-task tablet-polished standalone writing application**, including sentence trainer, language challenges, error clinic, independent exam practice, floating references and Review & Improve.
- The full app independently checks the authenticated Hub profile before revealing or initialising the editor. A signed-out session is redirected to the Hub.
- Existing local autosave and named drafts are retained. Keys are **scoped by authenticated user ID**: `email-writer:<user-id>:igcse0511email...`. No legacy unscoped drafts are silently imported.
- Local teacher mode is hidden from student profiles; teacher/admin profiles can use the existing local task authoring controls.
- Added a return-to-hub link.
- **Nothing registered in the database-backed launcher; no merge or deployment.**

## Privacy limitations
- Drafts remain in browser localStorage, not Supabase. This is suitable for personally owned student devices, but browser data can be lost and same-origin scripts have access to localStorage. User-ID namespacing prevents accidental cross-account display, **not malicious same-origin access**.
- No writing is sent to the Hub API by this integration. Export is explicitly user-initiated.
- Scripts and the static HTML are publicly readable, even though the app itself checks login. Never put secrets or private model answers in its source.
- Local teacher tools should not be considered server-authorised; before enabling teacher-specific persistent actions, they need server-side role enforcement.

## Outstanding gates before release
1. Automated desktop and mobile interaction tests on the authenticated deployment, including browser refresh, sign-out, account changes, 20 tasks and saved-draft recovery.
2. Security audit of all interpolated student writing and custom task HTML; the transplanted app has significant legacy DOM insertion code.
3. Verify teacher-mode restrictions and account-expiration behaviour.
4. Run repo's complete `npm test` suite and review CI.
5. Resolve whether local browser-only saving meets classroom durability needs.
6. Final hub-consistent visual polish and accessibility review.
7. Only after approval: register `https://<approved-host>/email-writing.html` in the `apps` table, merge and deploy.

Source: `iGCSE_0511_EMAIL_WRITER_TABLET_POLISHED.html` uploaded in the conversation.
