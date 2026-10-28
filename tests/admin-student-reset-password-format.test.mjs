import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../supabase/functions/admin-provision-user/index.ts', import.meta.url), 'utf8');

test('student password resets use readable student passwords', () => {
  const resetBlock = source.match(/if \(input\.action === 'reset_password'\) \{[\s\S]*?return jsonResponse\(\{ ok:true, userId:input\.userId, temporaryPassword \}\);\n    \}/)?.[0] ?? '';
  assert.match(resetBlock, /select\('role'/);
  assert.match(resetBlock, /target\?\.role === 'student' \? generateStudentPassword\(\) : generateTemporaryPassword\(\)/);
});
