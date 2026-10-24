-- Unit 1 quality fixes: corrected sentences (racquet, threaten, generation, craftspeople, reputation)
-- and cue-strengthened gap-fill sentences (minimum, significant, historic, reasonable, produce).
-- Idempotent upserts; safe to run once in the Supabase SQL editor.
begin;

insert into public.vocabulary_items
(vocabulary_id,term,part_of_speech,core_meaning,senses,word_family,collocations,status)
values
('vocab_racquet','racquet','noun','a sports implement with a handle and strung frame used to hit a ball or shuttlecock','[{"senseId":"racquet_1","meaning":"a sports implement with a handle and strung frame used to hit a ball or shuttlecock","acceptedParaphrases":["bat with strings","strung bat"],"masteryContexts":[{"contextId":"u1_15_racquet_meaning","text":"She replaced the broken strings on her tennis racquet before the final.","meaning":"strung hand-held equipment for hitting"},{"contextId":"u1_15_racquet_paraphrase","text":"In badminton, players hit the shuttlecock over the net with a light racquet.","meaning":"handled sports frame with strings"}],"contextDependentParaphrases":[],"misleadingDistractors":["helmet","whistle","net"]}]'::jsonb,'[]'::jsonb,'[]'::jsonb,'live')
on conflict (vocabulary_id) do update set
  term=excluded.term,
  part_of_speech=excluded.part_of_speech,
  core_meaning=excluded.core_meaning,
  senses=excluded.senses,
  word_family=excluded.word_family,
  collocations=excluded.collocations,
  status=excluded.status,
  updated_at=now();

insert into public.vocabulary_contexts
(context_id,vocabulary_id,occurrence_id,sense_id,context_type,prompt_text,target_rewrite,accepted_answers,misconception_category,status)
values
('u1_11_threaten_paraphrase','vocab_threaten','u1_11_threaten','threaten_1','paraphrase_context','A serious injury endangered her place in the championship.','endanger','["threaten"]'::jsonb,null,'live'),
('u1_11_threaten_production','vocab_threaten','u1_11_threaten','threaten_1','production_context','Poor funding could endanger the future of the community club.','endanger','["threaten"]'::jsonb,null,'live'),
('u1_15_racquet_meaning','vocab_racquet','u1_15_racquet','racquet_1','meaning_context','She replaced the strings on her tennis racquet before the match.',null,'["bat with strings"]'::jsonb,null,'live'),
('u1_15_racquet_paraphrase','vocab_racquet','u1_15_racquet','racquet_1','paraphrase_context','She took her bat with strings to be repaired before the match.','bat with strings','["racquet"]'::jsonb,null,'live'),
('u1_15_racquet_production','vocab_racquet','u1_15_racquet','racquet_1','production_context','Players must bring a suitable bat with strings for badminton.','bat with strings','["racquet"]'::jsonb,null,'live')
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

insert into public.vocabulary_contexts
(context_id,vocabulary_id,occurrence_id,sense_id,context_type,prompt_text,target_rewrite,accepted_answers,misconception_category,status)
values
('u1_25_generation_production','vocab_generation','u1_25_generation','generation_1','production_context','Each age group in the club has its own coach.','age group','["generation"]'::jsonb,null,'live')
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

insert into public.vocabulary_contexts
(context_id,vocabulary_id,occurrence_id,sense_id,context_type,prompt_text,target_rewrite,accepted_answers,misconception_category,status)
values
('u1_34_minimum_gap_x1','vocab_minimum','u1_34_minimum','minimum_1','gap_fill','Children below the minimum height of one metre cannot go on the ride.','minimum','["minimum"]'::jsonb,null,'live')
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

insert into public.vocabulary_items
(vocabulary_id,term,part_of_speech,core_meaning,senses,word_family,collocations,status)
values
('vocab_historic','historic','adjective','important in history or likely to be remembered for a long time','[{"senseId":"historic_1","meaning":"important in history or likely to be remembered for a long time","acceptedParaphrases":["historically important","momentous"],"masteryContexts":[{"contextId":"u1_42_historic_meaning","text":"The victory was a historic moment for the small club, and fans still talk about it.","meaning":"important enough to matter in history"},{"contextId":"u1_42_historic_paraphrase","text":"The team’s first international victory was historic.","meaning":"likely to be remembered historically"}],"contextDependentParaphrases":[],"misleadingDistractors":["old-fashioned","ordinary","recent"],"teacherNote":"Means important in history, not simply old or related to history."}]'::jsonb,'[]'::jsonb,'["historic victory","historic moment"]'::jsonb,'live'),
('vocab_produce','produce','verb','to make, create, or cause something to exist','[{"senseId":"produce_1","meaning":"to make, create, or cause something to exist","acceptedParaphrases":["make","create"],"masteryContexts":[{"contextId":"u1_44_produce_meaning","text":"Local craftspeople produce new bats from wood, one at a time.","meaning":"bring something into existence"},{"contextId":"u1_44_produce_paraphrase","text":"The workshop produces specialist equipment for local teams.","meaning":"create or manufacture something"}],"contextDependentParaphrases":[],"misleadingDistractors":["destroy","borrow","select"],"grammarForms":{"base":"produce","thirdPerson":"produces","past":"produced","pastParticiple":"produced","ing":"producing"},"grammarPatterns":["produce + noun","be produced + passive"],"teacherNote":"Use the verb sense make/create in this unit."}]'::jsonb,'["production","producer"]'::jsonb,'[]'::jsonb,'live'),
('vocab_significant','significant','adjective','important or large enough to be noticed or have an effect','[{"senseId":"significant_1","meaning":"important or large enough to be noticed or have an effect","acceptedParaphrases":["important","notable"],"masteryContexts":[{"contextId":"u1_46_significant_meaning","text":"The new training programme led to a significant improvement in results, much bigger than anyone expected.","meaning":"important enough to have an effect"},{"contextId":"u1_46_significant_paraphrase","text":"Regular exercise can have an significant effect on mental wellbeing.","meaning":"meaningful enough to make a difference"}],"contextDependentParaphrases":[],"misleadingDistractors":["famous","ordinary","tiny"],"teacherNote":"Do not accept big automatically. The unit sense is important/notable or large enough to have an effect."}]'::jsonb,'["significance","significantly"]'::jsonb,'["significant increase","significant difference","significant impact"]'::jsonb,'live'),
('vocab_reasonable','reasonable','adjective','fair, sensible, or not too expensive or extreme','[{"senseId":"reasonable_1","meaning":"fair, sensible, or not too expensive or extreme","acceptedParaphrases":["fair","sensible"],"masteryContexts":[{"contextId":"u1_49_reasonable_meaning","text":"The entry fee is reasonable for a full day of activities, so most families are happy to pay.","meaning":"fair or sensible, not excessive"},{"contextId":"u1_49_reasonable_paraphrase","text":"Most students thought the membership fee was reasonable.","meaning":"within an acceptable moderate limit"}],"contextDependentParaphrases":[],"misleadingDistractors":["excessive","impossible","historic"],"teacherNote":"Use the fair/sensible/not excessive sense in this unit."}]'::jsonb,'["reasonably","unreasonable"]'::jsonb,'["reasonable price","reasonable explanation"]'::jsonb,'live')
on conflict (vocabulary_id) do update set
  term=excluded.term,
  part_of_speech=excluded.part_of_speech,
  core_meaning=excluded.core_meaning,
  senses=excluded.senses,
  word_family=excluded.word_family,
  collocations=excluded.collocations,
  status=excluded.status,
  updated_at=now();

insert into public.vocabulary_contexts
(context_id,vocabulary_id,occurrence_id,sense_id,context_type,prompt_text,target_rewrite,accepted_answers,misconception_category,status)
values
('u1_42_historic_meaning','vocab_historic','u1_42_historic','historic_1','meaning_context','The victory was a historic moment for the small club, and fans still talk about it.',null,'["historically important"]'::jsonb,null,'live'),
('u1_42_historic_paraphrase','vocab_historic','u1_42_historic','historic_1','paraphrase_context','The victory was a historically important moment for the small club, and fans still talk about it.','historically important','["historic"]'::jsonb,null,'live'),
('u1_42_historic_gap_meaning_sentence','vocab_historic','u1_42_historic','historic_1','gap_fill','The victory was a historic moment for the small club, and fans still talk about it.','historic','["historic"]'::jsonb,null,'live'),
('u1_44_produce_meaning','vocab_produce','u1_44_produce','produce_1','meaning_context','Local craftspeople produce new bats from wood, one at a time.',null,'["make"]'::jsonb,null,'live'),
('u1_44_produce_paraphrase','vocab_produce','u1_44_produce','produce_1','paraphrase_context','Local craftspeople make new bats from wood, one at a time.','make','["produce"]'::jsonb,null,'live'),
('u1_44_produce_gap_base_noun','vocab_produce','u1_44_produce','produce_1','gap_fill','Local craftspeople produce new bats from wood, one at a time.','produce','["produce"]'::jsonb,null,'live'),
('u1_45_craftspeople_paraphrase','vocab_craftspeople','u1_45_craftspeople','craftspeople_1','paraphrase_context','Local skilled makers shape the wooden equipment using traditional methods.','skilled makers','["craftspeople"]'::jsonb,null,'live'),
('u1_46_significant_meaning','vocab_significant','u1_46_significant','significant_1','meaning_context','The new training programme led to a significant improvement in results, much bigger than anyone expected.',null,'["important"]'::jsonb,null,'live'),
('u1_46_significant_paraphrase','vocab_significant','u1_46_significant','significant_1','paraphrase_context','The new training programme led to an important improvement in results, much bigger than anyone expected.','important','["significant"]'::jsonb,null,'live'),
('u1_46_significant_gap_meaning_sentence','vocab_significant','u1_46_significant','significant_1','gap_fill','The new training programme led to a significant improvement in results, much bigger than anyone expected.','significant','["significant"]'::jsonb,null,'live'),
('u1_46_significant_gap_x1','vocab_significant','u1_46_significant','significant_1','gap_fill','There was a significant drop in attendance after prices rose, with half the usual crowd staying away.','significant','["significant"]'::jsonb,null,'live'),
('u1_46_significant_gap_x2','vocab_significant','u1_46_significant','significant_1','gap_fill','Studies show that regular exercise has a significant effect on mood, so doctors recommend it.','significant','["significant"]'::jsonb,null,'live'),
('u1_48_reputation_production','vocab_reputation','u1_48_reputation','reputation_1','production_context','The public image of the club improved after the campaign.','public image','["reputation"]'::jsonb,null,'live'),
('u1_49_reasonable_meaning','vocab_reasonable','u1_49_reasonable','reasonable_1','meaning_context','The entry fee is reasonable for a full day of activities, so most families are happy to pay.',null,'["fair"]'::jsonb,null,'live'),
('u1_49_reasonable_paraphrase','vocab_reasonable','u1_49_reasonable','reasonable_1','paraphrase_context','The entry fee is fair for a full day of activities, so most families are happy to pay.','fair','["reasonable"]'::jsonb,null,'live'),
('u1_49_reasonable_gap_meaning_sentence','vocab_reasonable','u1_49_reasonable','reasonable_1','gap_fill','The entry fee is reasonable for a full day of activities, so most families are happy to pay.','reasonable','["reasonable"]'::jsonb,null,'live'),
('u1_49_reasonable_gap_x1','vocab_reasonable','u1_49_reasonable','reasonable_1','gap_fill','The gym membership is a reasonable price for students, who pay less than ten dollars a month.','reasonable','["reasonable"]'::jsonb,null,'live'),
('u1_49_reasonable_gap_x2','vocab_reasonable','u1_49_reasonable','reasonable_1','gap_fill','It is reasonable to expect athletes to rest after a long race, because tired bodies need time to recover.','reasonable','["reasonable"]'::jsonb,null,'live')
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
commit;
