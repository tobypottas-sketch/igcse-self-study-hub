// Test-server preparation only: publish the canonical release's complete Sets before browser timing begins.
// These are public curriculum IDs, never student progress or answers. No readiness work runs in the browser fixture.
import unit from '../../content/vocabulary/releases/unit-01.js';
import { releasePlannerContent } from '../../content/vocabulary/readiness-report.js';
import { buildPathwayCoverage } from '../../src/vocabulary/pathway-coverage.js';
import { setsFromCoverage } from '../../src/vocabulary/pathway-sets.js';

const coverage = buildPathwayCoverage({ content:releasePlannerContent(unit) });
export const publishedVocabularyMembers = Object.entries(coverage).flatMap(([pathway_id,row]) =>
  setsFromCoverage(pathway_id,row,unit.occurrences.map(occurrence => occurrence.occurrenceId)).setList.flatMap(set =>
    set.members.map((occurrence_id,index) => ({ pathway_id,set_number:set.setNumber,position:index + 1,occurrence_id }))
  )
);
