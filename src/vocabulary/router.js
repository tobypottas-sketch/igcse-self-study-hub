import { getSupabaseClient } from '../supabase.js';
import { renderVocabularyError } from './views.js?v=arena-owner-20261121';
import './foundational-interactions.js';
import { redirectToHubSignIn, getSessionStorage } from '../return-target.js';
import {NGSL_BASELINE_GATE_ENABLED} from './ngsl-entry-policy.js?v=compulsory-ngsl-v1';

const root = document.getElementById('vocabularyApp');

async function routeVocabulary() {
  if (!root) return;
  try {
    const client = await getSupabaseClient();
    const { data:userData, error:userError } = await client.auth.getUser();
    if (userError || !userData?.user) { redirectToHubSignIn(getSessionStorage(), window.location); return; }
    const { data:profile, error:profileError } = await client.from('profiles').select('id, role, display_name, active').eq('id', userData.user.id).single();
    if (profileError || !profile?.active) { window.location.replace('./'); return; }
    const diagnosticWalkthroughRequested = new URLSearchParams(window.location.search).get('diagnostic-preview') === '1';
    if ((profile.role === 'teacher' || profile.role === 'admin') && diagnosticWalkthroughRequested) {
      const { startDiagnosticTeacherPreview } = await import('./diagnostic-teacher-walkthrough.js?v=ngsl-only-v2');
      await startDiagnosticTeacherPreview(root,client);
      return;
    }
    const cohortAuditRequested = new URLSearchParams(window.location.search).get('xp-cohort-audit') === '1';
    if (cohortAuditRequested && profile.role === 'admin') {
      const {startVocabularyCohortAudit}=await import('./cohort-xp-audit-screen.js');
      await startVocabularyCohortAudit({root,client,profile});
      return;
    }
    if (cohortAuditRequested && profile.role !== 'admin') {
      renderVocabularyError(root,'This XP reconciliation report is only available to administrators.');
      return;
    }
    const previewRequested = new URLSearchParams(window.location.search).get('preview') === '1';
    const staff = profile.role === 'teacher' || profile.role === 'admin';
    if (staff && previewRequested) {
      const status=root.querySelector('[data-vocab-loading-status]');
      if(status) status.textContent='Opening student preview…';
      await import('./app.js?v=arena-owner-20261121');
      await import('./unit-check-controller.js?v=workspace-v5');
      return;
    }
    if (staff) {
      const status=root.querySelector('[data-vocab-loading-status]');
      if(status) status.textContent='Opening teacher analytics…';
      const { initialiseVocabularyTeacher } = await import('./teacher-app.js?v=ngsl-unsure-v3');
      await initialiseVocabularyTeacher({ root, client, profile });
      return;
    }
    if (profile.role === 'student') {
      const ngslRequested=new URLSearchParams(window.location.search).get('ngsl')==='1';
      if(NGSL_BASELINE_GATE_ENABLED||ngslRequested){
        let status;
        try{
          const {data,error}=await client.functions.invoke('vocabulary-diagnostic',{
            body:{action:'ngsl-status',payload:{}}
          });
          if(error||!data||typeof data.completed!=='boolean')
            throw new Error('NGSL status unavailable.');
          status=data;
        }catch{
          renderVocabularyError(root,'Your vocabulary assessment cannot be checked right now. Please try again.');
          return;
        }
        if(ngslRequested||!status.completed){
          const {startNGSLDiagnostic}=await import('./ngsl-student.js?v=ngsl-unsure-v3');
          await startNGSLDiagnostic({root,client,onComplete:()=>window.location.replace('./vocabulary.html')});
          return;
        }
      }
      const status=root.querySelector('[data-vocab-loading-status]');
      if(status) status.textContent='Opening your vocabulary…';
      await import('./app.js?v=arena-owner-20261121');
      await import('./unit-check-controller.js?v=workspace-v5');
      return;
    }
    window.location.replace('./');
  } catch (error) {
    renderVocabularyError(root, error instanceof Error ? error.message : 'Vocabulary practice is unavailable right now.');
  }
}

void routeVocabulary();
