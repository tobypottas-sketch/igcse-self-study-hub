import fs from 'node:fs';

function replaceOnce(path, from, to) {
  const source = fs.readFileSync(path, 'utf8');
  if (!source.includes(from)) throw new Error(`Expected source not found in ${path}`);
  const next = source.replace(from, to);
  if (next === source) throw new Error(`No change made in ${path}`);
  fs.writeFileSync(path, next);
}

// 1) Make Meaning Mastery exact-context-only and derive its answer solely from sense.masteryContexts.
{
  const path = 'supabase/functions/_shared/vocabulary-engine.js';
  let source = fs.readFileSync(path, 'utf8');
  source = source.replace(
    "  'same_idea','spot_meaning_change','find_evidence','which_situation_fits','correct_usage',",
    "  'same_idea','spot_meaning_change','find_evidence','which_situation_fits','correct_usage','meaning_in_context',"
  );
  const oldBlock = `  for (const answer of Array.isArray(context.acceptedAnswers) ? context.acceptedAnswers : []) {\n    accepted.add(normalizeVocabularyAnswer(answer));\n  }\n\n  if (!exactContextOnly) {`;
  const newBlock = `  if (questionType === 'meaning_in_context') {\n    const masteryContext = (Array.isArray(sense.masteryContexts) ? sense.masteryContexts : [])\n      .find(record => record?.contextId === context.contextId);\n    const designated = normalizeVocabularyAnswer(masteryContext?.meaning);\n    if (designated) accepted.add(designated);\n  } else {\n    for (const answer of Array.isArray(context.acceptedAnswers) ? context.acceptedAnswers : []) {\n      accepted.add(normalizeVocabularyAnswer(answer));\n    }\n  }\n\n  if (!exactContextOnly) {`;
  if (!source.includes(oldBlock)) throw new Error(`Expected marking block not found in ${path}`);
  source = source.replace(oldBlock, newBlock);
  fs.writeFileSync(path, source);
}

// 2) Preserve two designated Mastery contexts inside each sense without changing DB schema.
{
  const path = 'content/vocabulary/build-unit.js';
  let source = fs.readFileSync(path, 'utf8');
  const old = `    const retrievalContexts = array(entry.retrievalContexts);\n    const sense = {\n      senseId,\n      meaning:text(entry.meaning),\n      acceptedParaphrases:paraphrases,`;
  const next = `    const retrievalContexts = array(entry.retrievalContexts);\n    const masteryContexts = array(entry.masteryContexts).slice(0,2).map((record,index) => ({\n      contextId:index === 0 ? meaningId : paraphraseId,\n      text:text(record?.text),\n      meaning:text(record?.meaning)\n    })).filter(record => record.text && record.meaning);\n    const sense = {\n      senseId,\n      meaning:text(entry.meaning),\n      acceptedParaphrases:paraphrases,\n      ...(masteryContexts.length ? { masteryContexts } : {}),`;
  if (!source.includes(old)) throw new Error(`Expected sense block not found in ${path}`);
  source = source.replace(old, next);
  fs.writeFileSync(path, source);
}

// 3) Wire Unit 1's reviewed meanings to two existing high-quality language-bank contexts per word.
{
  const path = 'content/vocabulary/units/unit-01.js';
  let source = fs.readFileSync(path, 'utf8');
  source = source.replace(
    "import unit1GrammarSupplement from './unit-01-grammar-supplement.js';",
    "import unit1GrammarSupplement from './unit-01-grammar-supplement.js';\nimport unit1LanguageBank from './unit-01-language-bank.js';\nimport unit1MasterySupplement from './unit-01-mastery-supplement.js';"
  );
  const old = `const enrichedEntries = entries.map(entry => ({ ...entry, ...(unit1GrammarSupplement[entry.term] ?? {}) }));`;
  const next = `const enrichedEntries = entries.map(entry => {\n  const masteryMeanings = unit1MasterySupplement[entry.term] ?? [];\n  const masterySource = (unit1LanguageBank[entry.term]?.contexts ?? []).slice(0,2);\n  const masteryContexts = masterySource.map((record,index) => ({\n    text:String(record?.text ?? '').replace('____', String(record?.answer ?? entry.term)),\n    meaning:String(masteryMeanings[index] ?? '').trim()\n  }));\n  return { ...entry, ...(unit1GrammarSupplement[entry.term] ?? {}), masteryContexts };\n});`;
  if (!source.includes(old)) throw new Error(`Expected enrichedEntries block not found in ${path}`);
  source = source.replace(old, next);
  fs.writeFileSync(path, source);
}

// 4) Browser builder: serve the designated phrase and inferential sentence for the exact context ID.
{
  const path = 'src/vocabulary/activity-builder.js';
  let source = fs.readFileSync(path, 'utf8');
  const old = `function meaningInContext(args, definition) {\n  const { item, occurrence, contexts, seed } = args;\n  const sense = senseFor(item, occurrence);\n  const context = chooseContext(contexts, ['meaning_context','paraphrase_context'], args.usedContentIds, seed);\n  const correct = text(context.acceptedAnswers?.[0] ?? sense.acceptedParaphrases?.[0] ?? sense.meaning);\n  const wrong = meaningDistractors(args, sense, correct, seed);\n  if (wrong.length < 3) throw new Error('Meaning in Context requires three comparable curated distractors.');\n  const options = shuffleAnswerOptions([correct, ...wrong], \`${'${seed}'}:meaning-context\`, args.optionNonce);\n  return baseActivity({ definition, occurrence, contentId:context.contextId, prompt:\`In this sentence, which meaning best fits “${'${text(item.term)}'}”?\\n${'${text(context.text)}'}\`, markingReference:{ acceptedAnswers:[correct] }, extra:{ options, contextId:context.contextId } });\n}`;
  const next = `function meaningInContext(args, definition) {\n  const { item, occurrence, contexts, seed } = args;\n  const sense = senseFor(item, occurrence);\n  const liveContextIds = new Set(array(contexts).map(context => context?.contextId).filter(Boolean));\n  const candidates = array(sense.masteryContexts).filter(record => liveContextIds.has(record?.contextId) && text(record?.text) && text(record?.meaning));\n  if (!candidates.length) throw new Error('Meaning in Context requires curated Mastery contexts.');\n  const used = new Set(array(args.usedContentIds));\n  const unused = candidates.filter(record => !used.has(record.contextId));\n  const context = stableShuffle(unused.length ? unused : candidates, \`${'${seed}'}:meaning-mastery\`)[0];\n  const correct = text(context.meaning);\n  const wrong = meaningDistractors(args, sense, correct, seed);\n  if (wrong.length < 3) throw new Error('Meaning in Context requires three comparable curated distractors.');\n  const options = shuffleAnswerOptions([correct, ...wrong], \`${'${seed}'}:meaning-context\`, args.optionNonce);\n  return baseActivity({ definition, occurrence, contentId:context.contextId, prompt:\`In this sentence, which meaning best fits “${'${text(item.term)}'}”?\\n${'${text(context.text)}'}\`, markingReference:{ acceptedAnswers:[correct] }, extra:{ options, contextId:context.contextId } });\n}`;
  if (!source.includes(old)) throw new Error(`Expected meaningInContext block not found in ${path}`);
  source = source.replace(old, next);
  fs.writeFileSync(path, source);
}

// 5) Server: ignore the row's legacy accepted_answers for Mastery and fail closed when the sense has no designation.
{
  const path = 'supabase/functions/vocabulary-attempt-action/index.ts';
  let source = fs.readFileSync(path, 'utf8');
  const old = `      const acceptedAnswers = sentenceAnswerTypes.has(input.questionType) ? [String(context.prompt_text ?? '').trim()].filter(Boolean) : (context.accepted_answers ?? []);\n      markingContext = { contextId:context.context_id, acceptedAnswers };`;
  const next = `      let acceptedAnswers: string[];\n      if (input.questionType === 'meaning_in_context') {\n        const masteryContext = (Array.isArray(sense.masteryContexts) ? sense.masteryContexts : [])\n          .find((record: any) => String(record?.contextId ?? '') === context.context_id);\n        const designated = String(masteryContext?.meaning ?? '').trim();\n        acceptedAnswers = designated ? [designated] : [];\n      } else {\n        acceptedAnswers = sentenceAnswerTypes.has(input.questionType) ? [String(context.prompt_text ?? '').trim()].filter(Boolean) : (context.accepted_answers ?? []);\n      }\n      markingContext = { contextId:context.context_id, acceptedAnswers };`;
  if (!source.includes(old)) throw new Error(`Expected context marking block not found in ${path}`);
  source = source.replace(old, next);
  fs.writeFileSync(path, source);
}

// 6) Comprehensive content contract: 50 targets x 2 = 100 Mastery variants, no direct legacy-answer leakage.
fs.writeFileSync('tests/vocabulary-meaning-mastery-content.test.js', `import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport unit1 from '../content/vocabulary/units/unit-01.js';\nimport { markCuratedAnswer, normalizeVocabularyAnswer } from '../supabase/functions/_shared/vocabulary-engine.js';\n\ntest('Unit 1 provides exactly 100 strict Meaning Mastery variants', () => {\n  assert.equal(unit1.items.length, 50);\n  const contextsById = new Map(unit1.contexts.map(row => [row.contextId,row]));\n  let total = 0;\n  for (const item of unit1.items) {\n    const sense = item.senses[0];\n    assert.equal(sense.masteryContexts?.length, 2, item.term);\n    for (const mastery of sense.masteryContexts) {\n      total += 1;\n      assert.ok(contextsById.has(mastery.contextId), \`${'${item.term}'} missing live context ${'${mastery.contextId}'}\`);\n      assert.ok(mastery.text.length >= 12, \`${'${item.term}'} context too short\`);\n      assert.ok(mastery.meaning.length >= 8, \`${'${item.term}'} meaning too short\`);\n      const ctx = contextsById.get(mastery.contextId);\n      const mark = answer => markCuratedAnswer({ item, sense, context:{ ...ctx, acceptedAnswers:[item.term, ...(ctx.acceptedAnswers ?? [])] }, questionType:'meaning_in_context', rawAnswer:answer }).correct;\n      assert.equal(mark(mastery.meaning), true, \`${'${item.term}'} designated meaning rejected\`);\n      assert.equal(mark(item.term), false, \`${'${item.term}'} headword leaked\`);\n      assert.equal(mark(\`  ${'${item.term.toUpperCase()}'}  \`), false, \`${'${item.term}'} padded headword leaked\`);\n      for (const legacy of sense.acceptedParaphrases ?? []) assert.equal(mark(legacy), false, \`${'${item.term}'} legacy paraphrase leaked: ${'${legacy}'}\`);\n      assert.notEqual(normalizeVocabularyAnswer(mastery.meaning), normalizeVocabularyAnswer(item.coreMeaning), \`${'${item.term}'} Mastery answer duplicates core meaning\`);\n    }\n  }\n  assert.equal(total, 100);\n});\n`);

console.log('Meaning Mastery implementation applied.');
