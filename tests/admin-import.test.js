import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStudentCsv, validateStudentImport, bulkProvisionStudents } from '../src/admin/import.js';

test('CSV parser handles BOM, CRLF, quoted commas and blank trailing rows', () => {
  const text = '\ufeffStudent name,School email\r\n"Smith, Ana",ana@school.edu\r\nBen,ben@school.edu\r\n\r\n';
  assert.deepEqual(parseStudentCsv(text), [
    { displayName:'Smith, Ana', email:'ana@school.edu', sourceRow:2 },
    { displayName:'Ben', email:'ben@school.edu', sourceRow:3 }
  ]);
});

test('CSV parser accepts trimmed case-insensitive launch headers', () => {
  const rows = parseStudentCsv(' student NAME , school EMAIL \nA,a@school.edu');
  assert.equal(rows[0].displayName, 'A');
});

test('CSV parser rejects missing required headers', () => {
  assert.throws(() => parseStudentCsv('Name,Email\nA,a@school.edu'), /Student name.*School email/i);
});

test('import validation reports missing malformed duplicate and existing emails without silent skips', () => {
  const rows = [
    { displayName:'', email:'missing@school.edu', sourceRow:2 },
    { displayName:'Bad', email:'bad', sourceRow:3 },
    { displayName:'First', email:'dup@school.edu', sourceRow:4 },
    { displayName:'Second', email:'DUP@school.edu', sourceRow:5 },
    { displayName:'Exists', email:'exists@school.edu', sourceRow:6 },
    { displayName:'Good', email:'good@school.edu', sourceRow:7 }
  ];
  const result = validateStudentImport(rows, new Set(['exists@school.edu']));
  assert.deepEqual(result.validRows, [{ displayName:'Good', email:'good@school.edu', sourceRow:7 }]);
  assert.equal(result.errors.length, 5);
  assert.match(result.errors.map(e => e.reason).join(' | '), /name|required|email|duplicate|already exists/i);
});

test('bulkProvisionStudents sends selected class once with validated rows', async () => {
  const calls = [];
  const client = { functions:{ invoke: async (name, options) => { calls.push([name, options]); return { data:{ created:[], failed:[] }, error:null }; } } };
  const rows = [{ displayName:'A', email:'a@school.edu', sourceRow:2 }];
  await bulkProvisionStudents(client, 'class-1', rows);
  assert.deepEqual(calls[0], ['admin-provision-user', { body:{ action:'bulk_provision_students', classId:'class-1', rows:[{ displayName:'A', email:'a@school.edu' }] } }]);
});
