import test from 'node:test';
import assert from 'node:assert/strict';
import { renameClass } from '../src/admin/classes.js';
import { validateClassAction } from '../supabase/functions/admin-class-action/validation.js';

const CLASS_ID = '11111111-1111-4111-8111-111111111111';

test('rename class client action sends the class id and trimmed name', async () => {
  let body;
  const client = {
    functions: {
      invoke: async (_name, options) => {
        body = options.body;
        return { data:{ ok:true }, error:null };
      }
    }
  };

  await renameClass(client, CLASS_ID, '  Grade 9 ESL  ');
  assert.deepEqual(body, { action:'rename_class', classId:CLASS_ID, className:'Grade 9 ESL' });
});

test('rename class validation accepts a valid id and trimmed name', () => {
  assert.deepEqual(
    validateClassAction({ action:'rename_class', classId:CLASS_ID, className:'  Grade 9 ESL  ' }),
    { action:'rename_class', classId:CLASS_ID, className:'Grade 9 ESL' }
  );
});

test('rename class validation rejects an empty name', () => {
  assert.throws(
    () => validateClassAction({ action:'rename_class', classId:CLASS_ID, className:'   ' }),
    /Class name is required/
  );
});
