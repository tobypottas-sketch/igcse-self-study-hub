import { escapeHtml } from './html.js';

export function renderLogin(root, message = '') {
  root.innerHTML = `
    <section class="auth-shell">
      <div class="auth-card">
        <p class="eyebrow">iGCSE Self-Study</p>
        <h1>Sign in</h1>
        <p class="muted">Use the account your teacher gave you.</p>
        ${message ? `<div class="notice" role="alert">${escapeHtml(message)}</div>` : ''}
        <div class="form-stack" style="margin-bottom:1rem">
          <a class="button button--ghost" href="./microsoft-sign-in.html?mode=standalone" style="display:flex;align-items:center;justify-content:center;gap:.65rem;border:1px solid #8b9da6;text-decoration:none;background:#fff;color:#17354b;min-height:44px">
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 22 22"><path fill="#f25022" d="M0 0h10v10H0z"/><path fill="#7fba00" d="M12 0h10v10H12z"/><path fill="#00a4ef" d="M0 12h10v10H0z"/><path fill="#ffb900" d="M12 12h10v10H12z"/></svg>
            Sign in with Microsoft
          </a>
          <p class="muted" style="text-align:center;margin:0;font-size:.85rem">Approved administrator pilot only</p>
          <p class="muted" style="text-align:center;margin:0">or use your Hub account</p>
        </div>
        <form data-form="login" class="form-stack">
          <label>Email
            <input name="email" type="email" autocomplete="username" required>
          </label>
          <div class="auth-password-field">
            <label for="hub-login-password">Password</label>
            <div class="auth-password-control">
              <input id="hub-login-password" name="password" type="password" autocomplete="current-password" required>
              <button type="button" class="auth-password-toggle" data-action="toggle-login-password" aria-label="Show password" aria-controls="hub-login-password" aria-pressed="false">Show</button>
            </div>
          </div>
          <button class="button button--primary" type="submit">Sign in</button>
          <p class="muted">Lost your login details? Ask your teacher.</p>
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
