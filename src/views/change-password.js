import { escapeHtml } from './html.js';

export function renderChangePassword(root, profile, message = '') {
  root.innerHTML = `
    <section class="auth-shell">
      <div class="auth-card">
        <p class="eyebrow">First sign-in</p>
        <h1>Change your password</h1>
        <p class="muted">Hi ${escapeHtml(profile.display_name)}. Choose a new password before continuing.</p>
        ${message ? `<div class="notice" role="alert">${escapeHtml(message)}</div>` : ''}
        <form data-form="change-password" class="form-stack">
          <label>New password
            <input name="password" type="password" minlength="10" autocomplete="new-password" required>
          </label>
          <label>Confirm new password
            <input name="confirmPassword" type="password" minlength="10" autocomplete="new-password" required>
          </label>
          <button class="button button--primary" type="submit">Save new password</button>
        </form>
      </div>
    </section>`;
}
