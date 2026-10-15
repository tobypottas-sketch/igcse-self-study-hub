import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const accountsSource = readFileSync(new URL('../src/admin/accounts.js', import.meta.url), 'utf8');
const classesSource = readFileSync(new URL('../src/admin/classes.js', import.meta.url), 'utf8');
const viewSource = readFileSync(new URL('../src/views/admin.js', import.meta.url), 'utf8');
const validationSource = readFileSync(new URL('../supabase/functions/admin-provision-user/validation.js', import.meta.url), 'utf8');
const provisionSource = readFileSync(new URL('../supabase/functions/admin-provision-user/index.ts', import.meta.url), 'utf8');
const classActionSource = readFileSync(new URL('../supabase/functions/admin-class-action/index.ts', import.meta.url), 'utf8');

function branchBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  assert.notEqual(startIndex, -1, `missing start marker: ${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test('account API exposes permanent delete through protected Edge Function', () => {
  assert.match(accountsSource, /export async function deleteAccount\(client, userId\)/);
  assert.match(accountsSource, /action:\s*'delete_account'/);
  assert.match(validationSource, /action === 'delete_account'/);
  assert.match(provisionSource, /input\.action === 'delete_account'/);
  assert.match(provisionSource, /callerData\.user\.id === input\.userId/);
  assert.match(provisionSource, /auth\.admin\.deleteUser\(input\.userId\)/);
});

test('account directory renders role-specific destructive delete buttons', () => {
  assert.match(viewSource, /data-action="admin-delete-account"/);
  assert.match(viewSource, /Delete student/);
  assert.match(viewSource, /Delete teacher/);
});

test('deactivate and delete account update cached UI without a blocking full admin reload', () => {
  const deactivateBranch = branchBetween(appSource, "action === 'admin-set-active'", "action === 'admin-unassign-teacher'");
  assert.doesNotMatch(deactivateBranch, /renderAdminSection\('accounts',[\s\S]*?true\)/);
  assert.match(deactivateBranch, /renderCachedAdminSection\('accounts'/);

  const deleteBranch = branchBetween(appSource, "action === 'admin-delete-account'", "action === 'admin-unassign-teacher'");
  assert.doesNotMatch(deleteBranch, /renderAdminSection\('accounts',[\s\S]*?true\)/);
  assert.match(deleteBranch, /renderCachedAdminSection\('accounts'/);
});

test('class deletion updates cached UI without a blocking full admin reload', () => {
  const deleteClassBranch = branchBetween(appSource, "action === 'admin-delete-class'", "action === 'admin-run-import'");
  assert.doesNotMatch(deleteClassBranch, /renderAdminSection\('classes',[\s\S]*?true\)/);
  assert.match(deleteClassBranch, /renderCachedAdminSection\('classes'/);
});

test('admin preload fetches the shared read model once instead of loading accounts and classes separately', () => {
  assert.match(appSource, /loadAdminData/);
  assert.doesNotMatch(appSource, /Promise\.all\(\[loadAdminAccounts\(client\), loadAdminClasses\(client\)\]\)/);
});

test('class retirement uses one atomic database RPC', () => {
  const retireBranch = branchBetween(classActionSource, "input.action === 'retire_class'", "const { data, error } = await adminClient.rpc('admin_transfer_student'");
  assert.match(retireBranch, /rpc\('admin_retire_class'/);
  assert.doesNotMatch(retireBranch, /from\('student_class_memberships'\)/);
  assert.doesNotMatch(retireBranch, /from\('teacher_classes'\)/);
  assert.doesNotMatch(retireBranch, /from\('classes'\)/);
});

test('account deletion migration preserves analytics and membership history by anonymising deleted identities', () => {
  const migrationUrl = new URL('../supabase/migrations/20261015140000_safe_account_deletion.sql', import.meta.url);
  assert.equal(existsSync(migrationUrl), true, 'safe account deletion migration must exist');
  const sql = readFileSync(migrationUrl, 'utf8');
  assert.match(sql, /activity_events[\s\S]*user_id[\s\S]*on delete set null/i);
  assert.match(sql, /student_class_memberships[\s\S]*student_id[\s\S]*on delete set null/i);
  assert.match(sql, /admin_retire_class/i);
});
