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
        </form>
      </div>
    </section>`;
}
