import { escapeHtml } from './html.js';

export function renderLogin(root, message = '') {
  root.innerHTML = `
    <section class="auth-shell">
      <div class="auth-card">
        <p class="eyebrow">iGCSE Self-Study</p>
        <h1>Sign in</h1>
        <p class="muted">Use the account your teacher gave you.</p>
        ${message ? `<div class="notice" role="alert">${escapeHtml(message)}</div>` : ''}
        <form data-form="login" class="form-stack">
          <label>Email
            <input name="email" type="email" autocomplete="username" required>
          </label>
          <label>Password
            <input name="password" type="password" autocomplete="current-password" required>
          </label>
          <button class="button button--primary" type="submit">Sign in</button>
          <button class="button button--ghost" type="button" data-action="forgot-password">Forgot password?</button>
        </form>
      </div>
    </section>`;
}

export function renderForgotPassword(root, message = '', email = '') {
  root.innerHTML = `
    <section class="auth-shell">
      <div class="auth-card">
        <p class="eyebrow">iGCSE Self-Study</p>
        <h1>Reset password</h1>
        <p class="muted">Enter your school email and we’ll send you a secure password-reset link.</p>
        ${message ? `<div class="notice" role="status">${escapeHtml(message)}</div>` : ''}
        <form data-form="forgot-password" class="form-stack">
          <label>Email
            <input name="email" type="email" autocomplete="email" value="${escapeHtml(email)}" required>
          </label>
          <button class="button button--primary" type="submit">Send reset email</button>
          <button class="button button--ghost" type="button" data-action="back-to-login">Back to sign in</button>
        </form>
      </div>
    </section>`;
}

export function renderRecoveryPassword(root, message = '') {
  root.innerHTML = `
    <section class="auth-shell">
      <div class="auth-card">
        <p class="eyebrow">iGCSE Self-Study</p>
        <h1>Choose a new password</h1>
        <p class="muted">Set a new password for your Self-Study Hub account.</p>
        ${message ? `<div class="notice" role="alert">${escapeHtml(message)}</div>` : ''}
        <form data-form="recovery-password" class="form-stack">
          <label>New password
            <input name="password" type="password" autocomplete="new-password" minlength="10" required>
          </label>
          <label>Confirm new password
            <input name="confirmPassword" type="password" autocomplete="new-password" minlength="10" required>
          </label>
          <button class="button button--primary" type="submit">Save new password</button>
        </form>
      </div>
    </section>`;
}
