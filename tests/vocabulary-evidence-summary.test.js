import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVocabularyEvidenceSummary, compareInterventionEvidence } from '../src/evidence/vocabulary-summary.js';

const mastery = [
  { vocabularyId:'v1', status:'building', strandEvidence:{ meaning:7, recognition:6, context:5, paraphrasing:1, production:0 }, recentErrorPattern:'retrieval_failure', updatedAt:'2026-10-16T10:00:00Z' },
  { vocabularyId:'v2', status:'secure', strandEvidence:{ meaning:7, recognition:6, context:5, paraphrasing:4, production:2 }, recentErrorPattern:null, updatedAt:'2026-10-16T10:00:00Z' }
];

test('EH-facing vocabulary summary is interpreted, provenance-backed, and free of raw answers', () => {
  const summary = buildVocabularyEvidenceSummary({
    studentId:'s1', mastery,
    activity:[{ id:'event-1', occurredAt:'2026-10-16T10:00:00Z', metadata:{ strand:'production', answer_text:'MUST NOT PASS' } }],
    evidenceWindowStart:'2026-10-03T00:00:00Z', evidenceWindowEnd:'2026-10-17T00:00:00Z'
  });
  assert.equal(summary.learningArea, 'vocabulary_paraphrase');
  assert.equal(summary.studentId, 's1');
  assert.ok(['needs_attention','developing','secure','strong'].includes(summary.status));
  assert.equal(summary.developmentArea, 'production');
  assert.ok(summary.provenance.length >= 2);
  assert.equal(JSON.stringify(summary).includes('MUST NOT PASS'), false);
});

test('intervention outcome compares before and after evidence without pretending completion means improvement', () => {
  const before = { status:'developing', strandScores:{ production:1, paraphrasing:2 }, persistentTargetCount:6, evidenceCount:12 };
  const improved = { status:'secure', strandScores:{ production:5, paraphrasing:5 }, persistentTargetCount:2, evidenceCount:20 };
  assert.equal(compareInterventionEvidence(before, improved), 'improved');
  assert.equal(compareInterventionEvidence(before, { ...before, evidenceCount:12 }), 'insufficient_follow_up_evidence');
  assert.equal(compareInterventionEvidence(before, { ...before, evidenceCount:20 }), 'no_clear_change');
});
