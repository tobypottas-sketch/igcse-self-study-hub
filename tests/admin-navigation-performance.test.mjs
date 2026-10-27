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

test('admin data is prefetched for an active admin while the hub is visible', () => {
  assert.match(source, /let adminLoadPromise = null/);
  assert.match(source, /const preloadAdminData = \(force = false\)/);
  assert.match(source, /profile\?\.role === 'admin'[\s\S]*?preloadAdminData\(\)\.catch/);
});

test('Back to Hub restores cached home state instead of refetching auth, profile and apps', () => {
  assert.match(source, /let cachedHomeState = null/);
  const handler = source.match(/else if \(action === 'admin-back'\) \{([\s\S]*?)\n\s*\}\n\s*else if \(action\?\.startsWith/)?.[1] ?? '';
  assert.match(handler, /if \(cachedHomeState\)/);
  assert.match(
    handler,
    /renderHome\(root, currentState\.profile, currentState\.apps, currentState\.activityDashboard\)/
  );
});
