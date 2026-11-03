import { changePassword, getCurrentProfile } from './auth.js';
import { getSupabaseClient } from './supabase.js';
import { renderChangePassword } from './views/change-password.js';

function isActiveStudent(profile) {
  return profile?.role === 'student' && profile?.active !== false;
}

async function verifiedStudentContext() {
  const client = await getSupabaseClient();
  const profile = await getCurrentProfile(client);
  if (!isActiveStudent(profile)) throw new Error('Student password settings are unavailable for this account.');
  return { client, profile };
}

function appRoot() {
  return document.getElementById('app');
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', async event => {
    const target = event.target?.closest?.('[data-student-password-change][data-action]');
    if (!target) return;
    const action = target.dataset.action;
    if (!['change-password','cancel-change-password'].includes(action)) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if (action === 'cancel-change-password') {
      globalThis.location.reload();
      return;
    }

    const root = appRoot();
    if (!root) return;
    try {
      const { profile } = await verifiedStudentContext();
      renderChangePassword(root, profile);
    } catch {
      globalThis.location.reload();
    }
  }, true);

  document.addEventListener('submit', async event => {
    const form = event.target;
    if (!form?.matches?.('form[data-form="change-password"][data-student-password-change]')) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const root = appRoot();
    if (!root) return;
    let profile = null;
    try {
      const context = await verifiedStudentContext();
      const client = context.client;
      profile = context.profile;
      const data = new FormData(form);
      const password = String(data.get('password') ?? '');
      if (password !== String(data.get('confirmPassword') ?? '')) {
        renderChangePassword(root, profile, 'The two passwords do not match.');
        return;
      }
      await changePassword(client, password);
      globalThis.location.reload();
    } catch (error) {
      if (profile) {
        renderChangePassword(root, profile, error instanceof Error ? error.message : 'Unable to change password.');
      } else {
        globalThis.location.reload();
      }
    }
  }, true);
}
