import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

test('admin section tabs render from cached admin state instead of refetching Supabase data', () => {
  assert.match(source, /const renderCachedAdminSection\s*=/);
  const handler = source.match(/else if \(action\?\.startsWith\?\.\('admin-section-'\)\) \{([\s\S]*?)\n\s*\} else if \(action === 'admin-reset-password'\)/)?.[1] ?? '';
  assert.match(handler, /renderCachedAdminSection\(section/);
  assert.doesNotMatch(handler, /renderAdminSection\(section/);
});

test('CSV preview renders from cached admin state because validation is local', () => {
  const previewBranch = source.match(/else if \(kind === 'admin-preview-import'\) \{([\s\S]*?)\n\s*\}\n\s*\} catch/)?.[1] ?? '';
  assert.match(previewBranch, /renderCachedAdminSection\('import'/);
  assert.doesNotMatch(previewBranch, /renderAdminSection\('import'/);
});
