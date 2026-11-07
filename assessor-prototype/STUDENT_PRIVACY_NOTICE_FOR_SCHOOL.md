# Student AI writing feedback: privacy notice for school review (DRAFT)

**For students (shown in the app, plain wording is in `src/assessor/student-privacy-notice.js`)**
When you ask for feedback, the task and the writing in the box are sent securely to an AI service (Cloudflare Workers AI) that returns suggestions. Your name, class and account details are not sent, and please do not type personal details in your writing. The feedback service does not save your writing or the feedback, and the feedback disappears when you leave or refresh the page. No marks are shown, nothing is added to your records, and your teacher cannot see the feedback. AI can make mistakes: treat it as advice and check it with your teacher.
Your draft is kept in this browser by the writing app's own autosave (as before) until you clear it or your browser data.
You can use only 3 feedback requests a day, one at a time.

**Facts for the school to verify (technical, accurate at commit `6b27ded`)**
- Sent to Cloudflare Workers AI: the task text and the student's writing only, over HTTPS. The student's identity, token and quota ticket are never sent to the AI (tested).
- The Worker checks the Supabase login and role. It does not store, log or return the writing; the code has no storage, analytics or logging of submissions (source-checked by a test). Worker log settings should be re-verified when the version is saved (a step in the release order).
- Supabase stores, for quota only: student ID, request count, refund count and timestamps. No writing, feedback or task text.
- Cloudflare is a processor outside China. The school should confirm whether sending student writing there is acceptable under its data-protection and cross-border rules, whether parents or students need to be informed or consent, and the minimum age/year groups included. Cloudflare's own terms on retention and model training should be checked by the school against current Cloudflare documentation, which I have not verified here.
- Pilot students should be told the feature is a trial and optional.

**Decisions needed from the school:** approve the wording; approve Cloudflare Workers AI as a processor; confirm consent/notification route; name the pilot class.
