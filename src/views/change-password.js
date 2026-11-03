import { escapeHtml } from './html.js';

export function renderChangePassword(root, profile, message = '') {
  const optional = ['student','teacher','admin'].includes(profile.role) && profile.active !== false && !profile.must_change_password;
  const studentOptional = optional && profile.role === 'student';
  root.innerHTML = `
    <section class="auth-shell">
      <div class="auth-card">
        <p class="eyebrow">${optional ? 'Account settings' : 'First sign-in'}</p>
        <h1>Change your password</h1>
        <p class="muted">Hi ${escapeHtml(profile.display_name)}. ${optional ? 'You can choose a new password here.' : 'Choose a new password before continuing.'}</p>
        ${message ? `<div class="notice" role="alert">${escapeHtml(message)}</div>` : ''}
        <form data-form="change-password" class="form-stack"${studentOptional ? ' data-student-password-change' : ''}>
          <label>New password
            <input name="password" type="password" minlength="10" autocomplete="new-password" required>
          </label>
          <label>Confirm new password
            <input name="confirmPassword" type="password" minlength="10" autocomplete="new-password" required>
          </label>
          <button class="button button--primary" type="submit">Save new password</button>
          ${optional ? `<button class="button button--ghost" type="button" data-action="cancel-change-password"${studentOptional ? ' data-student-password-change' : ''}>Cancel</button>` : ''}
        </form>
      </div>
    </section>`;
}
