// Pre-publish check for a unit being authored. It asks the one canonical readiness evaluator what a student would get and turns the
// answer into an authoring to-do list: which pathways would be live, and for each one that would not, exactly how many more words
// need content and what each is missing. Nothing here restates a rule: the numbers come from the real builders and the readiness
// rules, so the list can never ask for more (or less) than the engine actually needs.
import { evaluateUnitReadiness } from '../../src/vocabulary/pathway-readiness.js';
import { PATHWAY_STAGES, VOCABULARY_PATHWAYS } from '../../src/vocabulary/pathway-model.js';
import { releasePlannerContent } from './readiness-report.js';
import { validateUnit } from './schema.js';

const STAGE_LABEL = Object.freeze(Object.fromEntries(PATHWAY_STAGES.map(stage => [stage.id, stage.label])));

// What to author, in the author's terms, for a failure the builders reported.
export function authoringHint(failure = {}) {
  if (failure.kind === 'situation') return 'reviewed wrong situations: sense.situationDistractors (at least 3, distinct, none showing the target word)';
  if (failure.kind === 'gap-fill') return 'reviewed gap-fill options: a gapDistractors row (3 wrong options) for a blankable gap-fill sentence, and no malformed rows';
  if (failure.kind === 'meaning') return 'at least 3 distinct authored wrong meanings (distractors) for the word';
  if (/spelling/i.test(failure.reason ?? '')) return 'reviewed misspellings (the lexical list): the generator cannot make three plausible ones for this word';
  if (/No suitable curated activity/.test(failure.reason ?? '')) return 'content this stage can use. Usual causes: fewer than 3 other words of the same part of speech in the unit, no blankable gap-fill sentence (the word inside it, not at the start), no target-free situation, or no mastery contexts';
  return failure.reason || 'content the builders need is missing';
}

function groupFailures(failures, termFor) {
  const groups = new Map();
  for (const failure of failures) {
    const hint = authoringHint(failure);
    if (!groups.has(hint)) groups.set(hint, []);
    groups.get(hint).push(termFor(failure));
  }
  return [...groups.entries()].map(([need, terms]) => ({ need, words:terms.length, terms }));
}

export function checkUnitAuthoring(unit, { expectedWords = null } = {}) {
  const content = releasePlannerContent(unit);
  const termById = Object.fromEntries(unit.items.map(item => [item.vocabularyId, item.term]));
  const readiness = evaluateUnitReadiness({ content, expectedWords });
  const structural = validateUnit(unit).errors;

  const pathways = VOCABULARY_PATHWAYS.map(pathway => {
    const row = readiness.pathways[pathway.id];
    const stages = PATHWAY_STAGES.map(stage => {
      const have = row.stageCounts[stage.id];
      const need = row.stageMinimums[stage.id];
      return {
        stage:stage.id, label:STAGE_LABEL[stage.id], have, need, shortBy:Math.max(0, need - have),
        blockers:groupFailures(row.stageFailures[stage.id] ?? [], failure => termById[failure.vocabularyId] ?? failure.vocabularyId)
      };
    });
    const fullPath = row.missing.find(entry => entry.kind === 'full_path');
    const diversity = row.missing.filter(entry => entry.kind === 'diversity').map(entry => ({ label:entry.label, have:entry.have, need:entry.need, shortBy:entry.need - entry.have }));
    const shortBy = Math.max(0, ...stages.map(stage => stage.shortBy), fullPath ? fullPath.need - fullPath.have : 0, ...diversity.map(entry => entry.shortBy));
    return {
      pathwayId:pathway.id, label:pathway.label, live:row.live, reason:row.reason, held:row.held,
      stages, fullPath:fullPath ? { have:fullPath.have, need:fullPath.need, shortBy:fullPath.need - fullPath.have } : null, diversity,
      // The least that must be fixed: failing words overlap between stages, so this is a floor, not a promise.
      atLeastMoreWords:shortBy
    };
  });
  return {
    unitNumber:readiness.unitNumber, expectedWords:readiness.expectedWords, publishedWords:content.occurrences.length,
    structuralErrors:structural, authoring:readiness.authoring, pathways,
    publishable:structural.length === 0, allLive:pathways.every(pathway => pathway.live)
  };
}

export function renderAuthoringReport(report) {
  const lines = [`Unit ${report.unitNumber ?? '?'}: ${report.publishedWords}/${report.expectedWords} words`];
  if (report.structuralErrors.length) {
    lines.push(`  STRUCTURE: ${report.structuralErrors.length} problem${report.structuralErrors.length === 1 ? '' : 's'}`);
    for (const error of report.structuralErrors.slice(0, 20)) lines.push(`    - ${error}`);
  } else lines.push('  Structure: valid');
  const { gapSentences, gapSentencesReviewed, gapMalformed, situationWordsReviewed, situationWordsMalformed, words } = report.authoring ?? {};
  if (words != null) {
    lines.push(`  Reviewed content: ${gapSentencesReviewed}/${gapSentences} gap-fill sentences, ${situationWordsReviewed}/${words} wrong-situation sets` + (gapMalformed || situationWordsMalformed ? ` (${gapMalformed} malformed gap rows, ${situationWordsMalformed} malformed situation sets)` : ''));
  }
  for (const pathway of report.pathways) {
    lines.push(`  ${pathway.live ? 'LIVE  ' : 'LOCKED'} ${pathway.label}${pathway.live ? '' : `: needs content for at least ${pathway.atLeastMoreWords} more word${pathway.atLeastMoreWords === 1 ? '' : 's'}`}`);
    if (pathway.live) {
      // Live, but some words are not covered by a stage: worth knowing, never blocking.
      for (const stage of pathway.stages.filter(entry => entry.blockers.length)) {
        const count = stage.blockers.reduce((total, blocker) => total + blocker.words, 0);
        lines.push(`      ${stage.label}: ${count} word${count === 1 ? ' is' : 's are'} not covered (${stage.blockers.flatMap(blocker => blocker.terms).slice(0, 6).join(', ')}${count > 6 ? ', …' : ''})`);
      }
      continue;
    }
    if (pathway.held) lines.push('      held back in the unit registry');
    for (const stage of pathway.stages.filter(entry => entry.shortBy > 0)) {
      lines.push(`      ${stage.label}: ${stage.have}/${stage.need} words ready (${stage.shortBy} short)`);
      for (const blocker of stage.blockers.slice(0, 6)) lines.push(`        ${blocker.words} ${blocker.words === 1 ? 'word lacks' : 'words lack'} ${blocker.need}: ${blocker.terms.slice(0, 8).join(', ')}${blocker.terms.length > 8 ? ', …' : ''}`);
    }
    if (pathway.fullPath && pathway.fullPath.shortBy > 0) lines.push(`      Only ${pathway.fullPath.have} words can run every stage; ${pathway.fullPath.need} needed`);
    for (const entry of pathway.diversity) lines.push(`      ${entry.have} ${entry.label}; ${entry.need} needed`);
  }
  return lines.join('\n');
}
