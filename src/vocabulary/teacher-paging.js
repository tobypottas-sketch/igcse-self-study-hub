// Teacher analytics must never rely on one request returning more than the Data API's 1,000-row cap. Every broad read goes
// through here: explicit pages in a stable order, an exact row count to prove nothing was cut, and an error (never a
// shorter list) when completeness cannot be shown.
export const PAGE_SIZE = 1000;
export const MAX_PAGES = 200;
export const ID_CHUNK = 100;

export class IncompleteDataError extends Error {
  constructor(label) { super(`Unable to load every ${label} record. Please refresh.`); this.name = 'IncompleteDataError'; }
}

function chunk(values, size) {
  const output = [];
  for (let index = 0; index < values.length; index += size) output.push(values.slice(index, index + size));
  return output;
}

// `makeQuery()` returns a fresh builder: select(columns, { count:'exact' }), filters, and a deterministic order that ends in a
// unique key. Returns every row, or throws.
export async function fetchAllRows(makeQuery, { label = 'data', pageSize = PAGE_SIZE, maxPages = MAX_PAGES } = {}) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const rows = [];
    let total = null;
    let finished = false;
    for (let page = 0; page < maxPages; page += 1) {
      const from = page * pageSize;
      const result = await makeQuery().range(from, from + pageSize - 1);
      if (result?.error) throw new Error(`Unable to load ${label}.`);
      const data = Array.isArray(result?.data) ? result.data : [];
      if (typeof result?.count === 'number') total = result.count;
      rows.push(...data);
      if (data.length < pageSize) { finished = true; break; }
    }
    if (!finished) throw new IncompleteDataError(label);
    if (total == null || rows.length === total) return rows;
    // The table changed between pages (or a page was short). Try once more, then refuse rather than show partial analytics.
  }
  throw new IncompleteDataError(label);
}

// The same, for a filter on a long list of ids: the ids go in chunks so no request line grows with the class size.
export async function fetchAllRowsForIds(ids, makeQuery, options) {
  const unique = [...new Set(ids)];
  if (!unique.length) return [];
  const rows = [];
  for (const part of chunk(unique, ID_CHUNK)) rows.push(...await fetchAllRows(() => makeQuery(part), options));
  return rows;
}
