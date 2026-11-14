import { getSupabaseClient } from '../supabase.js';
import { renderVocabularyError } from './views.js';
import './foundational-interactions.js';
import { redirectToHubSignIn, getSessionStorage } from '../return-target.js';
import { DIAGNOSTIC_BASELINE_GATE_ENABLED, decideVocabularyEntry, DIAGNOSTIC_ENTRY_STATES } from './diagnostic-entry-gate.js?v=baseline-gate-v1';

const root = document.getElementById('vocabularyApp');

async function routeVocabulary() {
  if (!root) return;
  try {
    const client = await getSupabaseClient();
    const { data:userData, error:userError } = await client.auth.getUser();
    if (userError || !userData?.user) { redirectToHubSignIn(getSessionStorage(), window.location); return; }
    const { data:profile, error:profileError } = await client.from('profiles').select('id, role, display_name, active').eq('id', userData.user.id).single();
    if (profileError || !profile?.active) { window.location.replace('./'); return; }
    const previewRequested = new URLSearchParams(window.location.search).get('preview') === '1';
    const staff = profile.role === 'teacher' || profile.role === 'admin';
    if (staff && previewRequested) {
      const status=root.querySelector('[data-vocab-loading-status]');
      if(status) status.textContent='Opening student preview…';
      await import('./app.js?v=meaning-recognise-v1');
      await import('./unit-check-controller.js?v=workspace-v5');
      return;
    }
    if (staff) {
      const status=root.querySelector('[data-vocab-loading-status]');
      if(status) status.textContent='Opening teacher analytics…';
      const { initialiseVocabularyTeacher } = await import('./teacher-app.js?v=diagnostic-review-v1');
      await initialiseVocabularyTeacher({ root, client, profile });
      return;
    }
    if (profile.role === 'student') {
      // Intentionally dormant until the bank, student assessment UI, rollout
      // and server-side practice enforcement are verified and approved.
      if (DIAGNOSTIC_BASELINE_GATE_ENABLED) {
        let decision=DIAGNOSTIC_ENTRY_STATES.STATUS_ERROR;
        try {
          const {data,error}=await client.functions.invoke('vocabulary-diagnostic',{
            body:{action:'status',payload:{}}
          });
          if (!error && data && typeof data.baselineCompleted==='boolean') {
            decision=decideVocabularyEntry({
              enabled:true,
              baselineCompleted:data.baselineCompleted,
              baselineSessionState:data.baselineSessionState??null,
              baselineAssignmentId:data.baselineAssignmentId??null,
              statusAvailable:true
            });
          }
        } catch { /* A failed check never unlocks practice. */ }
        if (decision!==DIAGNOSTIC_ENTRY_STATES.PRACTICE) {
          const {renderVocabularyBaselineGate}=await import('./diagnostic-gate-view.js?v=baseline-gate-v1');
          renderVocabularyBaselineGate(root,decision);
          return;
        }
      }
      const status=root.querySelector('[data-vocab-loading-status]');
      if(status) status.textContent='Opening your vocabulary…';
      await import('./app.js?v=meaning-recognise-v1');
      await import('./unit-check-controller.js?v=workspace-v5');
      return;
    }
    window.location.replace('./');
  } catch (error) {
    renderVocabularyError(root, error instanceof Error ? error.message : 'Vocabulary practice is unavailable right now.');
  }
}

void routeVocabulary();
