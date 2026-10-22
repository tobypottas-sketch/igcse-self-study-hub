-- Unit 1: "leisure time" is now the vocabulary term (it was "leisure"). The vocabulary_id vocab_leisure and all ids are unchanged,
-- so student progress is kept. Upserts only (insert ... on conflict do update); nothing is deleted. Safe to run more than once.
-- Rows touched: the leisure item, its contexts, and its six reviewed language-bank gap-fill activities.
begin;
insert into public.vocabulary_items
(vocabulary_id,term,part_of_speech,core_meaning,senses,word_family,collocations,status)
values
('vocab_leisure','leisure time','noun','time when you are not working or studying and can relax or enjoy activities','[{"senseId":"leisure_1","meaning":"time when you are not working or studying and can relax or enjoy activities","acceptedParaphrases":["free time","spare time"],"masteryContexts":[{"contextId":"u1_01_leisure_meaning","text":"Many students use their leisure time to play sport or meet friends.","meaning":"time free for enjoyable activities"},{"contextId":"u1_01_leisure_paraphrase","text":"Longer working hours leave families with less leisure time than they had ten years ago.","meaning":"recreation time outside normal duties"}],"contextDependentParaphrases":[],"misleadingDistractors":["salary","training","deadline"]}]'::jsonb,'[]'::jsonb,'["leisure activity","leisure facilities"]'::jsonb,'live')
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
('u1_01_leisure','vocab_leisure',1,'Sports and Free Time',1,1,'leisure_1','live',true)
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
('u1_01_leisure_meaning','vocab_leisure','u1_01_leisure','leisure_1','meaning_context','Many students use their leisure time to play sport or meet friends.',null,'["free time"]'::jsonb,null,'live'),
('u1_01_leisure_paraphrase','vocab_leisure','u1_01_leisure','leisure_1','paraphrase_context','Many students use their free time to play sport or meet friends.','free time','["leisure time"]'::jsonb,null,'live'),
('u1_01_leisure_production','vocab_leisure','u1_01_leisure','leisure_1','production_context','The survey found that teenagers spend much of their spare time online.','spare time','["leisure time"]'::jsonb,null,'live'),
('u1_01_leisure_gap_meaning_sentence','vocab_leisure','u1_01_leisure','leisure_1','gap_fill','Many students use their leisure time to play sport or meet friends.','leisure time','["leisure time"]'::jsonb,null,'live'),
('u1_01_leisure_gap_x1','vocab_leisure','u1_01_leisure','leisure_1','gap_fill','Many people spend their leisure time at the swimming pool or in the park.','leisure time','["leisure time"]'::jsonb,null,'live'),
('u1_01_leisure_gap_x2','vocab_leisure','u1_01_leisure','leisure_1','gap_fill','Longer working hours leave families with less leisure time than they had ten years ago.','leisure time','["leisure time"]'::jsonb,null,'live')
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
insert into public.vocabulary_unit_activities
(activity_content_id,unit_number,content_type,activity_data,status)
values
('language-bank:leisure_ctx_1',1,'writing_set','{"taskType":"language_bank_context","prompt":"Complete the sentence with the best word or phrase.","sourceText":"Many students use their ____ to play sport or meet friends.","acceptedAnswers":["leisure time"],"distractors":[{"text":"study time","reason":"Fits grammatically, but the sentence describes time used for recreation rather than study."},{"text":"working hours","reason":"Fits grammatically, but the sentence describes time away from work."},{"text":"lesson time","reason":"Fits grammatically, but the activities happen outside lessons."}],"linkedVocabularyIds":["vocab_leisure"],"primaryEvidenceTargetId":"vocab_leisure","languageBankContextId":"leisure_ctx_1"}'::jsonb,'live'),
('language-bank:leisure_ctx_2',1,'writing_set','{"taskType":"language_bank_context","prompt":"Complete the sentence with the best word or phrase.","sourceText":"Longer working hours leave families with less ____ than they had ten years ago.","acceptedAnswers":["leisure time"],"distractors":[{"text":"office space","reason":"Fits grammatically, but longer working hours reduce time for relaxing, not space."},{"text":"travel costs","reason":"Fits grammatically, but the sentence is about time left after work."},{"text":"free money","reason":"Fits grammatically, but the sentence is about time, not money."}],"linkedVocabularyIds":["vocab_leisure"],"primaryEvidenceTargetId":"vocab_leisure","languageBankContextId":"leisure_ctx_2"}'::jsonb,'live'),
('language-bank:leisure_ctx_3',1,'writing_set','{"taskType":"language_bank_context","prompt":"Complete the sentence with the best word or phrase.","sourceText":"Reading and gardening are popular ways for retired people to spend their ____.","acceptedAnswers":["leisure time"],"distractors":[{"text":"working hours","reason":"Fits grammatically, but retired people no longer have working hours."},{"text":"school days","reason":"Fits grammatically, but the sentence concerns retired people."},{"text":"waiting time","reason":"Fits grammatically, but reading and gardening are chosen enjoyable activities, not time spent waiting."}],"linkedVocabularyIds":["vocab_leisure"],"primaryEvidenceTargetId":"vocab_leisure","languageBankContextId":"leisure_ctx_3"}'::jsonb,'live'),
('language-bank:leisure_ctx_4',1,'writing_set','{"taskType":"language_bank_context","prompt":"Complete the sentence with the best word or phrase.","sourceText":"The report examines how families spend their ____ at weekends.","acceptedAnswers":["leisure time"],"distractors":[{"text":"working hours","reason":"Fits grammatically, but weekends are being discussed as time away from work."},{"text":"lesson time","reason":"Fits grammatically, but the sentence concerns family recreation rather than lessons."},{"text":"office time","reason":"Fits grammatically, but the report is about time away from employment."}],"linkedVocabularyIds":["vocab_leisure"],"primaryEvidenceTargetId":"vocab_leisure","languageBankContextId":"leisure_ctx_4"}'::jsonb,'live'),
('language-bank:leisure_ctx_5',1,'writing_set','{"taskType":"language_bank_context","prompt":"Complete the sentence with the best word or phrase.","sourceText":"Guests at the hotel can spend their ____ at the pool, the gym or the tennis court.","acceptedAnswers":["leisure time"],"distractors":[{"text":"working time","reason":"Fits grammatically, but a pool, gym and tennis court are for recreation, not work."},{"text":"meeting time","reason":"Fits grammatically, but the places named are for recreation rather than meetings."},{"text":"study time","reason":"Fits grammatically, but the places named are for recreation rather than study."}],"linkedVocabularyIds":["vocab_leisure"],"primaryEvidenceTargetId":"vocab_leisure","languageBankContextId":"leisure_ctx_5"}'::jsonb,'live'),
('language-bank:leisure_ctx_6',1,'writing_set','{"taskType":"language_bank_context","prompt":"Complete the sentence with the best word or phrase.","sourceText":"She cycled in her ____ for years before turning professional.","acceptedAnswers":["leisure time"],"distractors":[{"text":"working hours","reason":"Fits grammatically, but she was not yet a professional, so cycling was not her job."},{"text":"training camp","reason":"Fits grammatically, but the sentence contrasts casual cycling with turning professional later."},{"text":"exam period","reason":"Fits grammatically, but nothing in the sentence connects cycling to exams."}],"linkedVocabularyIds":["vocab_leisure"],"primaryEvidenceTargetId":"vocab_leisure","languageBankContextId":"leisure_ctx_6"}'::jsonb,'live')
on conflict (activity_content_id) do update set
  unit_number=excluded.unit_number,
  content_type=excluded.content_type,
  activity_data=excluded.activity_data,
  status=excluded.status,
  updated_at=now();
commit;
