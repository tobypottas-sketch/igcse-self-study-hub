// Review Writing → shared student feedback. Loaded by review-writing.html after its login gate.
import { getSupabaseClient } from '../supabase.js';
import { getCurrentProfile } from '../auth.js';
import { mountStudentFeedback } from './student-feedback.js';
import { STUDENT_FEEDBACK_UI_ENABLED } from './student-feedback-flag.js';
import { reviewTaskText, reviewResponseText } from './writing-app-adapters.js';
try {
  if (!STUDENT_FEEDBACK_UI_ENABLED) throw new Error('student feedback panel is switched off');
  const client = await getSupabaseClient();
  const profile = await getCurrentProfile(client);
  const host = document.getElementById('studentFeedbackHost');
  if (host && profile.role === 'student' && profile.active === true && !profile.must_change_password) {
    const feedback = mountStudentFeedback(host, {
      app: 'review', getClient: () => client,
      getTask: () => { const s = window.reviewWritingFeedbackSource(); return reviewTaskText(s.task); },
      getResponse: () => reviewResponseText(window.reviewWritingFeedbackSource().sections),
      onRevise: () => document.querySelector('[data-tab="write"]')?.click()
    });
    client.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') feedback.dispose(); });
  }
} catch { /* the login gate in the page handles signed-out users */ }
