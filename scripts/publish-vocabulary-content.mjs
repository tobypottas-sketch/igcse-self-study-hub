import { pathToFileURL } from 'node:url';
import { validateUnit } from '../content/vocabulary/schema.js';

export const CONTENT_TABLES = Object.freeze(['vocabulary_items', 'vocabulary_unit_occurrences', 'vocabulary_contexts']);

export function buildPublicationBatch(units = []) {
  const itemMap = new Map();
  const occurrences = [];
  const contexts = [];

  for (const unit of units) {
    if (unit?.status !== 'live') throw new Error(`Only live units may be published (Unit ${unit?.unitNumber ?? '?'}).`);
    const validation = validateUnit(unit);
    if (!validation.ok) throw new Error(`Vocabulary validation failed: ${validation.errors.join(' ')}`);
    for (const item of unit.items ?? []) {
      if (!itemMap.has(item.vocabularyId)) itemMap.set(item.vocabularyId, item);
    }
    occurrences.push(...(unit.occurrences ?? []));
    contexts.push(...(unit.contexts ?? []));
  }

  return { items:[...itemMap.values()], occurrences, contexts };
}

function dbItem(item) {
  return {
    vocabulary_id:item.vocabularyId,
    term:item.term,
    part_of_speech:item.partOfSpeech,
    core_meaning:item.coreMeaning,
    senses:item.senses ?? [],
    word_family:item.wordFamily ?? [],
    collocations:item.collocations ?? [],
    status:item.status
  };
}

function dbOccurrence(occurrence) {
  return {
    occurrence_id:occurrence.occurrenceId,
    vocabulary_id:occurrence.vocabularyId,
    unit_number:occurrence.unitNumber,
    unit_title:occurrence.unitTitle,
    set_number:occurrence.setNumber,
    position_in_unit:occurrence.positionInUnit,
    sense_id:occurrence.senseId,
    status:occurrence.status,
    active:true
  };
}

function dbContext(context) {
  return {
    context_id:context.contextId,
    vocabulary_id:context.vocabularyId,
    occurrence_id:context.occurrenceId ?? null,
    sense_id:context.senseId,
    context_type:context.type,
    prompt_text:context.text,
    target_rewrite:context.targetRewrite ?? null,
    accepted_answers:context.acceptedAnswers ?? [],
    misconception_category:context.misconceptionCategory ?? null,
    status:'live'
  };
}

async function upsertRows(url, key, table, rows, onConflict) {
  if (!rows.length) return;
  const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
    method:'POST',
    headers:{
      apikey:key,
      Authorization:`Bearer ${key}`,
      'Content-Type':'application/json',
      Prefer:'resolution=merge-duplicates,return=minimal'
    },
    body:JSON.stringify(rows)
  });
  if (!response.ok) throw new Error(`Publishing ${table} failed: ${response.status} ${await response.text()}`);
}

export async function publishBatch(batch, env = process.env) {
  const url = String(env.SUPABASE_URL ?? '').trim();
  const key = String(env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  if (!url || !key) throw new Error('Server-side Supabase publishing credentials are required.');
  await upsertRows(url, key, 'vocabulary_items', batch.items.map(dbItem), 'vocabulary_id');
  await upsertRows(url, key, 'vocabulary_unit_occurrences', batch.occurrences.map(dbOccurrence), 'occurrence_id');
  await upsertRows(url, key, 'vocabulary_contexts', batch.contexts.map(dbContext), 'context_id');
}

async function main() {
  const paths = process.argv.slice(2);
  if (!paths.length) throw new Error('Pass one or more live unit JSON module paths to publish.');
  const units = [];
  for (const path of paths) {
    const fileUrl = pathToFileURL(path).href;
    const module = await import(fileUrl, { with: { type: 'json' } });
    units.push(module.default);
  }
  const batch = buildPublicationBatch(units);
  await publishBatch(batch);
  console.log(`Published ${batch.items.length} vocabulary items, ${batch.occurrences.length} occurrences and ${batch.contexts.length} contexts.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
