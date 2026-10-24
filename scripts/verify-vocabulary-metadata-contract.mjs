import fs from 'node:fs';
import { buildStoredAttemptMetadata } from '../supabase/functions/vocabulary-attempt-action/validation.js';
const migration = fs.readFileSync(new URL('../supabase/migrations/20261020002918_vocabulary_attempt_metadata_contract.sql', import.meta.url),'utf8');
const original = fs.readFileSync(new URL('../supabase/migrations/20261016090000_ninth_audit_privacy_hardening.sql', import.meta.url),'utf8').match(/create or replace function[\s\S]*?\$\$;/i)[0];
const quote = value => `'${JSON.stringify(value).replaceAll("'","''")}'::jsonb`;
const metadata = buildStoredAttemptMetadata({ unitNumber:1, questionType:'choose_word_sentence', vocabularyId:'vocab_leisure', occurrenceId:'u1_01_leisure', correct:true, pathwayId:'context', pathwayStage:'recognise', servedPathwayStage:'recognise', evidenceStrength:'medium', supportLevel:'none' });
const cases = [
  ['actual_context_answer', metadata, true],
  ['section_use', {unit_number:1,practice_focus:'context'}, true],
  ['retry', {...metadata,first_attempt:false}, false],
  ['supported_retry', {...metadata, retry_used:true, support_level:'light'}, true],
  ['raw_answer', {...metadata,raw_answer:'leisure'}, false],
  ['email', {...metadata,email:'student@example.test'}, false],
  ['free_text_id', {...metadata,target_id:'my private sentence'}, false],
  ['unknown_stage', {...metadata,pathway_stage:'skip-ahead'}, false],
  ['invalid_unit', {...metadata,unit_number:21}, false],
  ['null_stage', {...metadata,pathway_stage:null}, false],
  ['invalid_boolean', {...metadata,retry_used:'yes'}, false],
  ['unknown_type', {...metadata,question_type:'arbitrary prose'}, false],
  ['array', [], false], ['null', null, false], ['scalar', 'private text', false]
];
const rows = cases.map(([name,value,expected]) => `('${name}',${quote(value)},${expected})`).join(',\n');
const expression = migration.match(/as \$\$\s*select ([\s\S]*?);\s*\$\$;/i)[1];
const query = `with input(name,value,expected) as (values ${rows})\nselect name, expected, (${expression}) as actual from input;`;
if (process.argv.includes('--live-read')) {
  console.log(query);
} else {
  console.log(`begin;
create schema if not exists private;
do $$ begin
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role; end if;
end $$;
create table public.activity_events(app_key text,metadata jsonb);
${original}
alter table public.activity_events add constraint activity_events_metadata_privacy_check check(private.activity_metadata_is_safe(metadata));
${migration}
`);
  for(const [name,value,expected] of cases) {
    const insert = `insert into public.activity_events values ('vocabulary_paraphrase',${quote(value)});`;
    console.log(expected ? insert : `do $test$ begin begin ${insert} raise exception 'Accepted invalid metadata: ${name}'; exception when check_violation then null; end; end $test$;`);
  }
  console.log(`do $test$ begin begin insert into public.activity_events values ('reading',${quote(metadata)}); raise exception 'Vocabulary exception leaked to reading'; exception when check_violation then null; end; end $test$;
insert into public.activity_events values ('reading','{"question_type":"mcq","outcome":"correct"}'::jsonb);
rollback;`);
}
