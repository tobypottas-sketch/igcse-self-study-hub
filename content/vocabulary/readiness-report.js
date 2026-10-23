// Readiness of release files, for the release check and the command line. A release file is a unit's content in authoring shape;
// it is converted to the same planner content the app builds from the database and judged by the one canonical evaluator.
import { evaluateUnitReadiness } from '../../src/vocabulary/pathway-readiness.js';
import { buildReadinessReport } from '../../src/vocabulary/teacher-readiness.js';

export function releasePlannerContent(unit) {
  const content = {
    occurrences:unit.occurrences, items:unit.items, contexts:unit.contexts, activities:unit.activities,
    itemsById:Object.fromEntries(unit.items.map(item => [item.vocabularyId, item])), contextsByOccurrence:{}
  };
  for (const context of unit.contexts) (content.contextsByOccurrence[context.occurrenceId] ??= []).push(context);
  return content;
}

export function releaseReadinessReports(releases = []) {
  return releases.map(unit => {
    const content = releasePlannerContent(unit);
    const readiness = evaluateUnitReadiness({ content });
    return { unitNumber:readiness.unitNumber, ...buildReadinessReport({ readiness, publishedWords:content.occurrences.length }) };
  });
}
