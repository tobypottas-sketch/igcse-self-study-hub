function parseCsvRecords(text) {
  const records = [];
  let row = [];
  let field = '';
  let quoted = false;
  const input = String(text ?? '').replace(/^\uFEFF/, '');

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
      continue;
    }
    if (ch === '"' && field === '') { quoted = true; continue; }
    if (ch === ',') { row.push(field); field = ''; continue; }
    if (ch === '\n') {
      row.push(field.replace(/\r$/, ''));
      records.push(row);
      row = [];
      field = '';
      continue;
    }
    field += ch;
  }
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ''));
    records.push(row);
  }
  return records;
}

const normalizeHeader = value => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
const normalizeEmail = value => String(value ?? '').trim().toLowerCase();
const validEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function parseStudentCsv(text) {
  const records = parseCsvRecords(text);
  if (!records.length) throw new Error('CSV is empty.');
  const headers = records[0].map(normalizeHeader);
  const nameIndex = headers.indexOf('student name');
  const emailIndex = headers.indexOf('school email');
  if (nameIndex < 0 || emailIndex < 0) throw new Error('CSV must include Student name and School email headers.');

  const rows = [];
  for (let i = 1; i < records.length; i += 1) {
    const displayName = String(records[i][nameIndex] ?? '').trim();
    const email = String(records[i][emailIndex] ?? '').trim();
    if (!displayName && !email) continue;
    rows.push({ displayName, email, sourceRow: i + 1 });
  }
  return rows;
}

export function validateStudentImport(rows, existingEmails = new Set()) {
  const normalizedExisting = new Set(Array.from(existingEmails, normalizeEmail));
  const frequencies = new Map();
  for (const row of rows) {
    const email = normalizeEmail(row.email);
    if (email) frequencies.set(email, (frequencies.get(email) ?? 0) + 1);
  }

  const validRows = [];
  const errors = [];
  for (const row of rows) {
    const displayName = String(row.displayName ?? '').trim();
    const email = normalizeEmail(row.email);
    let reason = '';
    if (!displayName) reason = 'Student name is required.';
    else if (!email || !validEmail(email)) reason = 'A valid school email is required.';
    else if ((frequencies.get(email) ?? 0) > 1) reason = 'Duplicate email in import file.';
    else if (normalizedExisting.has(email)) reason = 'Email already exists.';

    if (reason) errors.push({ ...row, email, reason });
    else validRows.push({ displayName, email, sourceRow: row.sourceRow });
  }
  return { validRows, errors };
}

export async function bulkProvisionStudents(client, classId, rows) {
  const body = {
    action: 'bulk_provision_students',
    classId,
    rows: rows.map(row => ({ displayName: String(row.displayName ?? '').trim(), email: normalizeEmail(row.email) }))
  };
  const { data, error } = await client.functions.invoke('admin-provision-user', { body });
  if (error) throw error;
  return data;
}
