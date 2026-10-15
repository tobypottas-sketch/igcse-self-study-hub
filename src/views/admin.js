import { escapeHtml } from './html.js';

const sections = [
  ['accounts', 'Accounts'],
  ['classes', 'Classes'],
  ['import', 'Bulk Import']
];

export function renderAdmin(root, model) {
  const profile = model?.profile ?? {};
  const section = sections.some(([key]) => key === model?.section) ? model.section : 'accounts';
  const tabs = sections.map(([key, label]) => `
    <button class="admin-tab" data-action="admin-section-${key}"${section === key ? ' aria-current="page"' : ''}>${label}</button>`).join('');

  root.innerHTML = `
    <section class="shell admin-shell">
      <header class="admin-header">
        <div>
          <p class="eyebrow">iGCSE Self-Study Hub</p>
          <h1>Admin</h1>
          <p class="admin-subtitle">Signed in as ${escapeHtml(profile.display_name ?? 'Administrator')}</p>
        </div>
        <button class="button button--ghost" data-action="admin-back">Back to Hub</button>
      </header>
      <nav class="admin-tabs" aria-label="Admin sections">${tabs}</nav>
      <section class="admin-panel" data-admin-section="${escapeHtml(section)}">
        <p class="eyebrow">${escapeHtml(sections.find(([key]) => key === section)?.[1] ?? 'Accounts')}</p>
        <h2>${escapeHtml(sections.find(([key]) => key === section)?.[1] ?? 'Accounts')}</h2>
        <p class="muted">Admin tools for this section will appear here.</p>
      </section>
    </section>`;
}
