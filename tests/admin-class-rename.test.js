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
        return { data:{ ok:true, class:{ id:CLASS_ID, class_name:'Grade 9 ESL', active:true } }, error:null };
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

test('rename surfaces the backend error explaining an unsupported deployed action', async () => {
  const error = Object.assign(new Error('Edge Function returned a non-2xx status code'), {
    context:new Response(JSON.stringify({ error:'Unsupported class action.' }), { status:400 })
  });
  await assert.rejects(renameClass({ functions:{ invoke:async () => ({ data:null, error }) } }, CLASS_ID, 'New class'), /Unsupported class action\./);
});

test('rename requires the saved class row rather than accepting an unrelated success response', async () => {
  for (const data of [{ ok:true }, { ok:true, class:{ id:CLASS_ID, class_name:'Old class', active:true } }]) {
    await assert.rejects(renameClass({ functions:{ invoke:async () => ({ data, error:null }) } }, CLASS_ID, 'New class'), /not confirmed/);
  }
});
