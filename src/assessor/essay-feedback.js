// Essay Writing → shared student feedback. Loaded INSIDE the Essay Writing page (the separate igcse-essay-writing app) by a guarded import;
// that page supplies window.getEssayFeedbackContext() and keeps the panel's host hidden in Exam Mode. Students only, same panel switch as the other apps.
import { getSupabaseClient } from '../supabase.js';
import { getCurrentProfile } from '../auth.js';
import { mountStudentFeedback } from './student-feedback.js';
import { STUDENT_FEEDBACK_UI_ENABLED } from './student-feedback-flag.js';
import { essayTaskText, essayResponseText } from './writing-app-adapters.js';
// Feedback is only ever available in Practice Mode (including a teacher's Practice task). In Exam Mode nothing is read, so nothing could be sent.
const practiceContext = () => { try { const c = window.getEssayFeedbackContext?.(); return c && c.allowed === true ? c : null; } catch { return null; } };
try {
  if (!STUDENT_FEEDBACK_UI_ENABLED) throw new Error('student feedback panel is switched off');
  const host = document.getElementById('studentFeedbackHost');
  if (!host || typeof window.getEssayFeedbackContext !== 'function') throw new Error('this page does not offer essay feedback');
  const client = await getSupabaseClient();
  const profile = await getCurrentProfile(client);
  // Students only: teachers and admins use the separate teacher assessor in the Hub.
  if (profile.role === 'student' && profile.active === true && !profile.must_change_password) {
    for (const name of ['assessment-progress.css', 'student-feedback.css?v=3']) {
      const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = new URL('../../' + name, import.meta.url).href; document.head.append(link);
    }
    const feedback = mountStudentFeedback(host, {
      app: 'essay', getClient: () => client,
      getTask: () => { const c = practiceContext(); return c ? essayTaskText(c.task) : ''; },
      getResponse: () => { const c = practiceContext(); return c ? essayResponseText(c.sections) : ''; },
      onRevise: () => window.essayFeedbackRevise?.()
    });
    // A new question, task or mode means any feedback on screen is about something else.
    window.addEventListener('essay-feedback-reset', () => feedback.clear());
    client.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') feedback.dispose(); });
    host.dispatchEvent(new CustomEvent('essay-feedback-ready', { bubbles: true }));
  }
} catch { /* the Hub wrapper's own sign-in check handles signed-out users; feedback simply stays hidden */ }
