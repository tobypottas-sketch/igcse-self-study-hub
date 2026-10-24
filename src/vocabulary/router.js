import { getSupabaseClient } from '../supabase.js';
import { renderVocabularyError } from './views.js';
import './foundational-interactions.js';

const root = document.getElementById('vocabularyApp');

async function routeVocabulary() {
  if (!root) return;
  try {
    const client = await getSupabaseClient();
    const { data:userData, error:userError } = await client.auth.getUser();
    if (userError || !userData?.user) { window.location.replace('./'); return; }
    const { data:profile, error:profileError } = await client.from('profiles').select('id, role, display_name, active').eq('id', userData.user.id).single();
    if (profileError || !profile?.active) { window.location.replace('./'); return; }
    const previewRequested = new URLSearchParams(window.location.search).get('preview') === '1';
    const staff = profile.role === 'teacher' || profile.role === 'admin';
    if (staff && previewRequested) {
      await import('./app.js');
      return;
    }
    if (staff) {
      const { initialiseVocabularyTeacher } = await import('./teacher-app.js');
      await initialiseVocabularyTeacher({ root, client, profile });
      return;
    }
    if (profile.role === 'student') {
      await import('./app.js');
      return;
    }
    window.location.replace('./');
  } catch (error) {
    renderVocabularyError(root, error instanceof Error ? error.message : 'Vocabulary practice is unavailable right now.');
  }
}

void routeVocabulary();