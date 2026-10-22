-- Unit 1 meaning-match distractors: multi-word options for afford, deny, racquet, patience, leisure time, tournament, selection, reputation.
-- Idempotent upserts; run once in the Supabase SQL editor.
begin;

insert into public.vocabulary_items
(vocabulary_id,term,part_of_speech,core_meaning,senses,word_family,collocations,status)
values
('vocab_leisure','leisure time','noun','time when you are not working or studying and can relax or enjoy activities','[{"senseId":"leisure_1","meaning":"time when you are not working or studying and can relax or enjoy activities","acceptedParaphrases":["free time","spare time"],"masteryContexts":[{"contextId":"u1_01_leisure_meaning","text":"Many students use their leisure time to play sport or meet friends.","meaning":"time free for enjoyable activities"},{"contextId":"u1_01_leisure_paraphrase","text":"Longer working hours leave families with less leisure time than they had ten years ago.","meaning":"recreation time outside normal duties"}],"contextDependentParaphrases":[],"misleadingDistractors":["working hours","homework time","training time"]}]'::jsonb,'[]'::jsonb,'["leisure activity","leisure facilities"]'::jsonb,'live'),
('vocab_afford','afford','verb','to have enough money, time, or resources for something','[{"senseId":"afford_1","meaning":"to have enough money, time, or resources for something","acceptedParaphrases":["have enough money for","be able to pay for"],"masteryContexts":[{"contextId":"u1_04_afford_meaning","text":"The club had to cancel the trip because it could no longer afford the cost of the coach.","meaning":"have enough resources for a cost"},{"contextId":"u1_04_afford_paraphrase","text":"My parents would love a bigger house, but they simply cannot afford one on a teacher’s salary.","meaning":"be financially able to pay"}],"contextDependentParaphrases":[],"misleadingDistractors":["borrow money to buy","suggest to someone","calculate roughly"],"grammarForms":{"base":"afford","thirdPerson":"affords","past":"afforded","pastParticiple":"afforded","ing":"affording"},"grammarPatterns":["can/could afford + noun","can/could afford + to-infinitive"],"teacherNote":"Usually tests ability to pay for something; avoid treating it as a general synonym for buy."}]'::jsonb,'["affordable","unaffordable"]'::jsonb,'["afford the cost","cannot afford"]'::jsonb,'live'),
('vocab_deny','deny','verb','to say that something is not true','[{"senseId":"deny_1","meaning":"to say that something is not true","acceptedParaphrases":["say is not true","reject a claim"],"masteryContexts":[{"contextId":"u1_05_deny_meaning","text":"The company continues to deny any responsibility for the accident, despite the evidence.","meaning":"state that a claim is false"},{"contextId":"u1_05_deny_paraphrase","text":"Both players deny breaking the rules, but the video clearly shows that they did.","meaning":"declare an accusation to be untrue"}],"contextDependentParaphrases":[],"misleadingDistractors":["admit that it is true","feel sorry for","promise to do"],"grammarForms":{"base":"deny","thirdPerson":"denies","past":"denied","pastParticiple":"denied","ing":"denying"},"grammarPatterns":["deny + -ing","deny + that-clause"],"teacherNote":"Use the say-something-is-not-true sense here; the refusal sense is separate."}]'::jsonb,'["denial","undeniable"]'::jsonb,'[]'::jsonb,'live')
on conflict (vocabulary_id) do update set
  term=excluded.term,
  part_of_speech=excluded.part_of_speech,
  core_meaning=excluded.core_meaning,
  senses=excluded.senses,
  word_family=excluded.word_family,
  collocations=excluded.collocations,
  status=excluded.status,
  updated_at=now();

insert into public.vocabulary_items
(vocabulary_id,term,part_of_speech,core_meaning,senses,word_family,collocations,status)
values
('vocab_racquet','racquet','noun','a sports implement with a handle and strung frame used to hit a ball or shuttlecock','[{"senseId":"racquet_1","meaning":"a sports implement with a handle and strung frame used to hit a ball or shuttlecock","acceptedParaphrases":["bat with strings","strung bat"],"masteryContexts":[{"contextId":"u1_15_racquet_meaning","text":"She replaced the broken strings on her tennis racquet before the final.","meaning":"strung hand-held equipment for hitting"},{"contextId":"u1_15_racquet_paraphrase","text":"In badminton, players hit the shuttlecock over the net with a light racquet.","meaning":"handled sports frame with strings"}],"contextDependentParaphrases":[],"misleadingDistractors":["safety hat for the head","whistle used by a referee","net across a court"]}]'::jsonb,'[]'::jsonb,'[]'::jsonb,'live'),
('vocab_tournament','tournament','noun','a competition involving several players or teams over a series of matches','[{"senseId":"tournament_1","meaning":"a competition involving several players or teams over a series of matches","acceptedParaphrases":["competition","series of matches"],"masteryContexts":[{"contextId":"u1_18_tournament_meaning","text":"Sixteen schools entered the knockout tournament, and only the winners of each match went through to the next round.","meaning":"organised competition with several matches"},{"contextId":"u1_18_tournament_paraphrase","text":"He scored the winning goal in the semi-final of the tournament, which his team went on to win.","meaning":"multi-match event that determines a winner"}],"contextDependentParaphrases":[],"misleadingDistractors":["training session","team meeting","sports lesson"]}]'::jsonb,'[]'::jsonb,'["enter a tournament","tournament final"]'::jsonb,'live')
on conflict (vocabulary_id) do update set
  term=excluded.term,
  part_of_speech=excluded.part_of_speech,
  core_meaning=excluded.core_meaning,
  senses=excluded.senses,
  word_family=excluded.word_family,
  collocations=excluded.collocations,
  status=excluded.status,
  updated_at=now();

insert into public.vocabulary_items
(vocabulary_id,term,part_of_speech,core_meaning,senses,word_family,collocations,status)
values
('vocab_patience','patience','noun','the ability to remain calm while waiting or dealing with difficulty','[{"senseId":"patience_1","meaning":"the ability to remain calm while waiting or dealing with difficulty","acceptedParaphrases":["ability to wait calmly","calm persistence"],"masteryContexts":[{"contextId":"u1_38_patience_meaning","text":"Learning a difficult skill takes patience and regular practice.","meaning":"ability to stay calm while waiting"},{"contextId":"u1_38_patience_paraphrase","text":"Coaching young beginners requires patience.","meaning":"calm persistence despite difficulty"}],"contextDependentParaphrases":[],"misleadingDistractors":["strong dislike of waiting","fast speed of progress","physical strength to continue"]}]'::jsonb,'["patient","patiently"]'::jsonb,'["show patience","require patience"]'::jsonb,'live')
on conflict (vocabulary_id) do update set
  term=excluded.term,
  part_of_speech=excluded.part_of_speech,
  core_meaning=excluded.core_meaning,
  senses=excluded.senses,
  word_family=excluded.word_family,
  collocations=excluded.collocations,
  status=excluded.status,
  updated_at=now();

insert into public.vocabulary_items
(vocabulary_id,term,part_of_speech,core_meaning,senses,word_family,collocations,status)
values
('vocab_selection','selection','noun','a range of things available to choose from or the act of choosing','[{"senseId":"selection_1","meaning":"a range of things available to choose from or the act of choosing","acceptedParaphrases":["choice","range"],"masteryContexts":[{"contextId":"u1_43_selection_meaning","text":"The shop has a wide selection of equipment for different sports.","meaning":"range of available choices"},{"contextId":"u1_43_selection_paraphrase","text":"The centre offers a wide selection of after-school activities.","meaning":"set from which items are chosen"}],"contextDependentParaphrases":[],"misleadingDistractors":["lack of options","warning","payment"]}]'::jsonb,'["select","selective"]'::jsonb,'["wide selection","selection process"]'::jsonb,'live'),
('vocab_reputation','reputation','noun','the general opinion people have about someone or something','[{"senseId":"reputation_1","meaning":"the general opinion people have about someone or something","acceptedParaphrases":["public image","general opinion"],"masteryContexts":[{"contextId":"u1_48_reputation_meaning","text":"The academy has a strong reputation for developing young athletes.","meaning":"shared opinion others have formed"},{"contextId":"u1_48_reputation_paraphrase","text":"The reputation of the club improved after the campaign.","meaning":"public judgement built over time"}],"contextDependentParaphrases":[],"misleadingDistractors":["achievement","official rank","private opinion"]}]'::jsonb,'["reputable","disreputable"]'::jsonb,'["good reputation","build a reputation"]'::jsonb,'live')
on conflict (vocabulary_id) do update set
  term=excluded.term,
  part_of_speech=excluded.part_of_speech,
  core_meaning=excluded.core_meaning,
  senses=excluded.senses,
  word_family=excluded.word_family,
  collocations=excluded.collocations,
  status=excluded.status,
  updated_at=now();
commit;
