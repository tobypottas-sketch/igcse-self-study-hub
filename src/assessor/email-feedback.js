import { mountWritingSubmission } from '../writing/submissions.js';
// Informal Email Writing → shared student feedback. Loaded by email-writing-app.html after its own authentication check.
import { getSupabaseClient } from '../supabase.js';
import { getCurrentProfile } from '../auth.js';
import { mountStudentFeedback } from './student-feedback.js';
import { STUDENT_FEEDBACK_UI_ENABLED } from './student-feedback-flag.js';
import { emailTaskText, emailResponseText } from './writing-app-adapters.js';
try {
  const client = await getSupabaseClient();
  const profile = await getCurrentProfile(client);
  const host = document.getElementById('studentFeedbackHost');
  // Students only: teachers and admins use the separate teacher assessor in the Hub.
  if (host && profile.role === 'student' && profile.active === true && !profile.must_change_password) {
    const submissionHost = document.createElement('div');
    host.after(submissionHost);
    const submission = mountWritingSubmission(submissionHost,{client,appKey:'email_writing',getTask:()=>emailTaskText(window.getConfig()),getResponse:()=>Object.values(window.getDraftSections()).map(v=>String(v??'').trim()).filter(Boolean).join('\n\n'),allowed:()=>true});
    client.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){submission.dispose();submissionHost.remove();}});
    
    if (!STUDENT_FEEDBACK_UI_ENABLED) { host.hidden=true; } else {
    const feedback = mountStudentFeedback(host, {
      app: 'email', getClient: () => client,
      getTask: () => emailTaskText(window.getConfig()),
      getResponse: () => emailResponseText(window.getDraftSections()),
      onRevise: () => window.switchTab('draft')
    });
    client.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') feedback.dispose(); });
    }
  }
} catch { /* the app's own authentication gate handles signed-out users; feedback simply stays hidden */ }
