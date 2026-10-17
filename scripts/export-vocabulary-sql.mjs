import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateUnit } from '../content/vocabulary/schema.js';

const sqlText = value => `'${String(value ?? '').replaceAll("'", "''")}'`;
const sqlJson = value => `${sqlText(JSON.stringify(value ?? null))}::jsonb`;
const sqlNullable = value => value == null ? 'null' : sqlText(value);

function itemSql(item) {
  return `(${[
    sqlText(item.vocabularyId), sqlText(item.term), sqlText(item.partOfSpeech), sqlText(item.coreMeaning),
    sqlJson(item.senses ?? []), sqlJson(item.wordFamily ?? []), sqlJson(item.collocations ?? []), sqlText(item.status)
  ].join(',')})`;
}

function occurrenceSql(row) {
  return `(${[
    sqlText(row.occurrenceId), sqlText(row.vocabularyId), Number(row.unitNumber), sqlText(row.unitTitle),
    Number(row.setNumber), Number(row.positionInUnit), sqlText(row.senseId), sqlText(row.status), 'true'
  ].join(',')})`;
}

function contextSql(row) {
  return `(${[
    sqlText(row.contextId), sqlText(row.vocabularyId), sqlText(row.occurrenceId), sqlText(row.senseId),
    sqlText(row.type), sqlText(row.text), sqlNullable(row.targetRewrite), sqlJson(row.acceptedAnswers ?? []),
    sqlNullable(row.misconceptionCategory), sqlText(row.status)
  ].join(',')})`;
}

function chunkSql(unit, occurrenceChunk) {
  const occurrenceIds = new Set(occurrenceChunk.map(row => row.occurrenceId));
  const vocabularyIds = new Set(occurrenceChunk.map(row => row.vocabularyId));
  const items = unit.items.filter(row => vocabularyIds.has(row.vocabularyId));
  const contexts = unit.contexts.filter(row => occurrenceIds.has(row.occurrenceId));

  return `begin;
insert into public.vocabulary_items
(vocabulary_id,term,part_of_speech,core_meaning,senses,word_family,collocations,status)
values
${items.map(itemSql).join(',\n')}
on conflict (vocabulary_id) do update set
  term=excluded.term,
  part_of_speech=excluded.part_of_speech,
  core_meaning=excluded.core_meaning,
  senses=excluded.senses,
  word_family=excluded.word_family,
  collocations=excluded.collocations,
  status=excluded.status,
  updated_at=now();

insert into public.vocabulary_unit_occurrences
(occurrence_id,vocabulary_id,unit_number,unit_title,set_number,position_in_unit,sense_id,status,active)
values
${occurrenceChunk.map(occurrenceSql).join(',\n')}
on conflict (occurrence_id) do update set
  vocabulary_id=excluded.vocabulary_id,
  unit_number=excluded.unit_number,
  unit_title=excluded.unit_title,
  set_number=excluded.set_number,
  position_in_unit=excluded.position_in_unit,
  sense_id=excluded.sense_id,
  status=excluded.status,
  active=excluded.active,
  updated_at=now();

insert into public.vocabulary_contexts
(context_id,vocabulary_id,occurrence_id,sense_id,context_type,prompt_text,target_rewrite,accepted_answers,misconception_category,status)
values
${contexts.map(contextSql).join(',\n')}
on conflict (context_id) do update set
  vocabulary_id=excluded.vocabulary_id,
  occurrence_id=excluded.occurrence_id,
  sense_id=excluded.sense_id,
  context_type=excluded.context_type,
  prompt_text=excluded.prompt_text,
  target_rewrite=excluded.target_rewrite,
  accepted_answers=excluded.accepted_answers,
  misconception_category=excluded.misconception_category,
  status=excluded.status,
  updated_at=now();
commit;`;
}

async function main() {
  const modulePath = process.argv[2];
  if (!modulePath) throw new Error('Pass a live vocabulary release module path.');
  const unit = (await import(pathToFileURL(path.resolve(modulePath)).href)).default;
  if (unit?.status !== 'live') throw new Error('SQL export requires a live release unit.');
  const validation = validateUnit(unit);
  if (!validation.ok) throw new Error(validation.errors.join('\n'));

  for (let offset = 0; offset < unit.occurrences.length; offset += 10) {
    const number = Math.floor(offset / 10) + 1;
    console.log(`---BEGIN VOCAB SQL CHUNK ${number}---`);
    console.log(chunkSql(unit, unit.occurrences.slice(offset, offset + 10)));
    console.log(`---END VOCAB SQL CHUNK ${number}---`);
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
