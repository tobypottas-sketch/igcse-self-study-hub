import { escapeHtml } from './html.js';

const featureIcons = [
  '<path fill="currentColor" stroke="none" d="M2 17h5v6H2zm7-6h5v12H9zm7-7h5v19h-5z"/>',
  '<path d="M7 3h10v5c0 5-2 7-5 7s-5-2-5-7zm0 2H3v2a5 5 0 0 0 5 5m9-7h4v2a5 5 0 0 1-5 5m-4 3v5m-4 1h8"/>',
  '<circle cx="12" cy="7" r="4"/><path d="M5 22v-2a7 7 0 0 1 14 0v2zM5 7a3 3 0 1 0 0 6m14-6a3 3 0 1 1 0 6M4 15a4 4 0 0 0-3 4v1h2m17-5a4 4 0 0 1 3 4v1h-2"/>',
  '<path d="M12 2a10 10 0 1 0 0 20c2 0 3-2 2-3s-1-3 1-3h3c3 0 4-2 4-4A10 10 0 0 0 12 2Z"/><path stroke-width="3" d="M6 13h.01M8 8h.01M13 6h.01M17 9h.01"/>'
];
const features = [
  ['Track', 'progress'],
  ['Earn', 'XP &amp; merits'],
  ['Customise', 'your avatar'],
  ['Personalise', 'your Hub']
];

export function renderLogin(root, message = '') {
  root.innerHTML = `
    <section class="adventure-login" aria-labelledby="adventure-login-title">
      <picture class="adventure-login__art">
        <source media="(max-width: 800px)" srcset="./assets/login/adventure-640.webp" width="640" height="542">
        <img src="./assets/login/adventure.webp" width="1536" height="864" alt="" fetchpriority="high">
      </picture>
      <div class="adventure-login__panel">
        <h1 id="adventure-login-title" class="adventure-login__brand">
          <span class="adventure-login__wordmark"><svg aria-hidden="true" viewBox="0 0 64 47">
            <path fill="currentColor" d="M0 15 32 2l32 13v3L32 31 0 18zm13 12 19 8 19-8v12l-19 8-19-8zM4 18h3v16H4zm0 15h3l3 11H1z"/>
          </svg>iGCSE</span>
          <span class="adventure-login__subtitle">Self-Study Hub</span>
        </h1>
        <div class="adventure-login__controls">
          <a class="adventure-login__microsoft" href="./microsoft-sign-in.html?mode=standalone"
             aria-describedby="adventure-login-pilot">
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 22 22"><path fill="#f25022" d="M0 0h10v10H0z"/><path fill="#7fba00" d="M12 0h10v10H12z"/><path fill="#00a4ef" d="M0 12h10v10H0z"/><path fill="#ffb900" d="M12 12h10v10H12z"/></svg>
            Sign in with Microsoft
          </a>
          <p id="adventure-login-pilot">Approved pilot accounts only</p>
          ${message ? `<div class="notice" role="alert">${escapeHtml(message)}</div>` : ''}
          <details class="adventure-login__password"${message ? ' open' : ''}>
            <summary>Use your Hub password</summary>
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
          </details>
        </div>
        <ul class="adventure-login__features" aria-label="Hub features">
          ${features.map(([first, second], index) => `
            <li>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${featureIcons[index]}</svg>
              <span>${first}<br>${second}</span>
            </li>`).join('')}
        </ul>
        <svg class="adventure-login__waves" aria-hidden="true" viewBox="0 0 660 140" preserveAspectRatio="none">
          <path fill="#8fdfec" d="M0 71C235-80 327 238 660 27v113H0Z"/>
          <path fill="#47cbbb" opacity=".55" d="M0 112C260 252 434 5 660 29v111H0Z"/>
          <path fill="#009fb1" opacity=".87" d="M0 108C165-39 386 313 660 0v140H0Z"/>
        </svg>
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
