import { requestPasswordReset, updateRecoveredPassword } from './auth.js';
import { getSupabaseClient } from './supabase.js';
import { renderForgotPassword, renderLogin, renderRecoveryPassword } from './views/login.js';

function recoveryRedirectUrl() {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}`;
}

function hasRecoveryIntent() {
  if (typeof window === 'undefined') return false;
  return /(?:^|[&#])type=recovery(?:&|$)/.test(window.location.hash) || /(?:^|[?&])type=recovery(?:&|$)/.test(window.location.search);
}

async function startPasswordRecovery() {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('app');
  if (!root) return;

  const client = await getSupabaseClient();
  let recoveryActive = hasRecoveryIntent();

  const ensureRecoveryView = () => {
    if (!recoveryActive) return;
    if (!root.querySelector?.('[data-form="recovery-password"]')) renderRecoveryPassword(root);
  };

  const observer = typeof MutationObserver !== 'undefined'
    ? new MutationObserver(() => ensureRecoveryView())
    : null;
  observer?.observe(root, { childList:true, subtree:true });

  client.auth.onAuthStateChange?.((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      recoveryActive = true;
      renderRecoveryPassword(root);
    }
  });

  if (recoveryActive) queueMicrotask(ensureRecoveryView);

  document.addEventListener('click', (event) => {
    const target = event.target?.closest?.('[data-action]');
    const action = target?.dataset?.action;
    if (action === 'forgot-password') {
      event.preventDefault();
      recoveryActive = false;
      renderForgotPassword(root);
    } else if (action === 'back-to-login') {
      event.preventDefault();
      recoveryActive = false;
      renderLogin(root);
    }
  });

  document.addEventListener('submit', async (event) => {
    const form = event.target;
    const kind = form?.dataset?.form;
    if (kind !== 'forgot-password' && kind !== 'recovery-password') return;
    event.preventDefault();

    const data = new FormData(form);
    const button = form.querySelector?.('button[type="submit"]');
    if (button) button.disabled = true;

    if (kind === 'forgot-password') {
      const email = String(data.get('email') ?? '').trim();
      try {
        await requestPasswordReset(client, email, recoveryRedirectUrl());
        renderForgotPassword(root, 'If that email belongs to a Hub account, a password-reset link has been sent. Check your inbox and junk folder.', email);
      } catch (error) {
        renderForgotPassword(root, error instanceof Error ? error.message : 'Unable to send a password reset email right now. Please try again.', email);
      }
      return;
    }

    const password = String(data.get('password') ?? '');
    const confirmPassword = String(data.get('confirmPassword') ?? '');
    if (password.length < 10) {
      renderRecoveryPassword(root, 'Use at least 10 characters for your new password.');
      return;
    }
    if (password !== confirmPassword) {
      renderRecoveryPassword(root, 'The two passwords do not match.');
      return;
    }

    try {
      await updateRecoveredPassword(client, password);
      recoveryActive = false;
      observer?.disconnect();
      window.location.replace(recoveryRedirectUrl());
    } catch (error) {
      renderRecoveryPassword(root, error instanceof Error ? error.message : 'Unable to change your password. Please request a new reset link and try again.');
    }
  });
}

startPasswordRecovery().catch(() => {});
