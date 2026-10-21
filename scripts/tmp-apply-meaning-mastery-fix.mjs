import fs from 'node:fs';

function replaceOnce(path, from, to) {
  const source = fs.readFileSync(path, 'utf8');
  if (!source.includes(from)) throw new Error(`Expected source not found in ${path}`);
  fs.writeFileSync(path, source.replace(from, to));
}

fs.writeFileSync('content/vocabulary/units/unit-01-mastery-supplement.js', `const unit1MasterySupplement = Object.freeze({
  leisure:['time free for enjoyable activities','recreation time outside normal duties'],
  preference:['favouring one option over another','a stronger choice between alternatives'],
  avoid:['keep clear of something unwanted','deliberately stay away from something'],
  afford:['have enough resources for a cost','be financially able to pay'],
  deny:['state that a claim is false','declare an accusation to be untrue'],
  permit:['give approval for an action','make something officially allowed'],
  arrange:['make plans for something in advance','put necessary plans in place'],
  urge:['press someone strongly to act','push someone firmly toward action'],
  recommend:['present something as a suitable choice','advise choosing a particular option'],
  demand:['require considerable effort or attention','place heavy requirements on something'],
  threaten:['put something valuable at serious risk','make harm or loss more likely'],
  resent:['feel bitter about unfair treatment','remain angry about perceived unfairness'],
  regret:['feel sorry about a past choice','wish a past outcome were different'],
  unfamiliar:['not recognised from previous experience','new or unknown to someone'],
  racquet:['strung hand-held equipment for hitting','handled sports frame with strings'],
  opponent:['person or team competing against you','the other side in a contest'],
  intense:['extreme in strength or effort','requiring very great energy or focus'],
  tournament:['organised competition with several matches','multi-match event that determines a winner'],
  determined:['firmly committed to achieving an aim','unwilling to give up on a goal'],
  discipline:['self-control that supports consistent effort','controlled behaviour for following a plan'],
  'goal-oriented':['strongly focused on specific results','directed toward achieving clear aims'],
  achievement:['worthwhile result gained through effort','difficult success that has been completed'],
  elite:['among the highest performers','at the top level of ability'],
  overwhelming:['too powerful to manage easily','greater than can be comfortably handled'],
  generation:['people from roughly the same age period','group born during a similar era'],
  challenge:['difficulty that tests someone’s ability','demanding problem requiring skill or effort'],
  solution:['method that resolves a difficulty','workable way to fix a problem'],
  pastime:['enjoyable activity done outside work','recreational pursuit for spare hours'],
  feat:['notable act requiring unusual skill','impressive accomplishment that is difficult'],
  regardless:['without letting that fact change things','despite the stated circumstance'],
  monetary:['connected with money or payment','involving financial value'],
  estimated:['worked out approximately, not exactly','based on calculation rather than certainty'],
  struggle:['have great difficulty doing something','need much effort because something is hard'],
  minimum:['lowest acceptable amount or level','smallest quantity that meets a requirement'],
  championship:['major contest deciding the title winner','competition that determines the leading player'],
  competitor:['person taking part in a contest','participant trying to win a competition'],
  relatively:['to a degree judged by comparison','fairly so compared with something else'],
  patience:['ability to stay calm while waiting','calm persistence despite difficulty'],
  atmosphere:['overall mood felt in a place','emotional feeling created by a setting'],
  incredible:['extremely impressive or surprising','exceptionally remarkable and hard to believe'],
  criteria:['standards used to make a judgement','conditions used for evaluating choices'],
  historic:['important enough to matter in history','likely to be remembered historically'],
  selection:['range of available choices','set from which items are chosen'],
  produce:['bring something into existence','create or manufacture something'],
  craftspeople:['skilled workers who make things by hand','people with specialist hand-making skills'],
  significant:['important enough to have an effect','meaningful enough to make a difference'],
  expansion:['process of becoming larger in scope','growth in size, range or amount'],
  reputation:['shared opinion others have formed','public judgement built over time'],
  reasonable:['fair or sensible, not excessive','within an acceptable moderate limit'],
  antiques:['valuable old objects kept for interest','collectable objects from an earlier period']
});

export default unit1MasterySupplement;
`);

replaceOnce(
  'content/vocabulary/units/unit-01.js',
  `  const masteryMeanings = unit1MasterySupplement[entry.term] ?? [];
  const masterySource = (unit1LanguageBank[entry.term]?.contexts ?? []).slice(0,2);
  const masteryContexts = masterySource.map((record,index) => ({`,
  `  const masteryMeanings = unit1MasterySupplement[entry.term] ?? [];
  const languageContexts = unit1LanguageBank[entry.term]?.contexts ?? [];
  const grammarContexts = unit1GrammarSupplement[entry.term]?.retrievalContexts ?? [];
  const fallbackContexts = [
    { text:entry.meaningSentence, answer:entry.term },
    { text:String(entry.production?.sentence ?? '').replace(String(entry.production?.source ?? ''), entry.term), answer:entry.term }
  ];
  const masterySource = (languageContexts.length >= 2 ? languageContexts : grammarContexts.length >= 2 ? grammarContexts : fallbackContexts).slice(0,2);
  const masteryContexts = masterySource.map((record,index) => ({`
);

replaceOnce(
  'tests/vocabulary-activity-builder.test.js',
  `  senses:[{ senseId:'significant_1', meaning:'of great weight or large enough to be noticed or have an effect', acceptedParaphrases:['important','notable'], contextDependentParaphrases:[], misleadingDistractors:['famous','ordinary','tiny'] }],`,
  `  senses:[{ senseId:'significant_1', meaning:'of great weight or large enough to be noticed or have an effect', acceptedParaphrases:['important','notable'], contextDependentParaphrases:[], misleadingDistractors:['famous','ordinary','tiny'], masteryContexts:[
    { contextId:'sig_meaning', text:'The programme led to a significant improvement in results.', meaning:'important enough to affect results' },
    { contextId:'sig_para', text:'The programme had an effect large enough to notice.', meaning:'meaningful enough to make a difference' }
  ] }],`
);

replaceOnce(
  'tests/vocabulary-navigation-distractor-regression.test.js',
  `  senses:[{ senseId:'permit_1', meaning:'to allow something to happen', acceptedParaphrases:['allow','give permission for'], misleadingDistractors:['prevent','demand','resent'] }]`,
  `  senses:[{ senseId:'permit_1', meaning:'to allow something to happen', acceptedParaphrases:['allow','give permission for'], misleadingDistractors:['prevent','demand','resent'], masteryContexts:[{ contextId:'permit_meaning', text:'The club does not permit spectators to enter the training area.', meaning:'give official approval for an action' }] }]`
);
replaceOnce(
  'tests/vocabulary-navigation-distractor-regression.test.js',
  `    assert.equal(question.options.includes('allow'), true);`,
  `    const expectedCorrect = activityType === 'meaning_match' ? 'allow' : 'give official approval for an action';
    assert.equal(question.options.includes(expectedCorrect), true);`
);

console.log('Final Meaning Mastery regression fixes applied.');
