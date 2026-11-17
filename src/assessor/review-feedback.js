// Review Writing → shared student feedback. Loaded by review-writing.html after its login gate.
import { getSupabaseClient } from '../supabase.js';
import { getCurrentProfile } from '../auth.js';
import { mountStudentFeedback } from './student-feedback.js?v=review-concise-v1';
import { STUDENT_FEEDBACK_UI_ENABLED } from './student-feedback-flag.js';
import { reviewTaskText, reviewResponseText } from './writing-app-adapters.js';
try {
  if (!STUDENT_FEEDBACK_UI_ENABLED) throw new Error('student feedback panel is switched off');
  const client = await getSupabaseClient();
  const profile = await getCurrentProfile(client);
  const host = document.getElementById('studentFeedbackHost');
  if (host && profile.role === 'student' && profile.active === true && !profile.must_change_password) {
    const feedback = mountStudentFeedback(host, {
      app: 'review', compact: true, getClient: () => client,
      // Task controls stay locked while a request is running, so it is never cancelled by a task change.
      onBusyChange: busy => window.dispatchEvent(new CustomEvent('review-feedback-busy', { detail: { busy } })),
      getTask: () => { const s = window.reviewWritingFeedbackSource(); return reviewTaskText(s.task); },
      getResponse: () => reviewResponseText(window.reviewWritingFeedbackSource().sections),
      onRevise: () => document.querySelector('[data-tab="write"]')?.click()
    });
    // A different task makes earlier feedback out of date.
    window.addEventListener('review-feedback-reset', () => feedback.clear());
    client.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') feedback.dispose(); });
  } else if (host && (profile.role === 'teacher' || profile.role === 'admin')) {
    // Staff may inspect the writing workflow, but the AI-feedback endpoint permits student accounts only.
    // Avoid a mysteriously missing panel when a teacher previews the Review tab.
    const note = document.createElement('p');
    note.className = 'review-feedback-staff-note';
    note.textContent = 'AI writing feedback is available to students. Sign in with a student account to try it. The self-checks below are still available to teachers.';
    host.replaceChildren(note);
  }
} catch (error) {
  // The writing page's login gate handles authentication; surface other integration failures.
  const host = document.getElementById('studentFeedbackHost');
  if (host && document.documentElement.classList.contains('review-auth-ready')) {
    const status = document.createElement('p');
    status.className = 'review-feedback-staff-note';
    status.setAttribute('role', 'status');
    status.textContent = 'AI feedback could not load. Refresh the page or ask your teacher.';
    host.replaceChildren(status);
    console.error('Review feedback failed to initialise', error);
  }
}
