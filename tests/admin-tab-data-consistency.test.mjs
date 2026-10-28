import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

test('Accounts, Classes and Bulk Import load admin data when switching from Activity', () => {
  const navBlock = app.match(/else if \(action\?\.startsWith\?\.\('admin-section-'\)\) \{[\s\S]*?\n    \} else if \(action === 'activity-student'\)/)?.[0] ?? '';
  assert.match(navBlock, /await renderAdminSection\(section/);
  assert.doesNotMatch(navBlock, /renderCachedAdminSection\(section/);
});
