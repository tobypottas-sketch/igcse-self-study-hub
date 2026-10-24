import test from 'node:test';
import assert from 'node:assert/strict';

async function contracts() {
  return import('../src/evidence/contracts.js');
}

const baseInput = {
  learningArea: 'vocabulary_paraphrase',
  studentId: 'student-1',
  status: 'developing',
  trend: 'improving',
  signalStrength: 'strong',
  evidenceWindowStart: '2026-10-01T00:00:00.000Z',
  evidenceWindowEnd: '2026-10-17T00:00:00.000Z',
  provenance: [{ source: 'vocabulary_global_mastery', id: 'target-1' }],
  strands: {
    meaning: 'secure',
    recognition: 'secure',
    context: 'developing',
    paraphrasing: 'developing',
    production: 'needs_attention'
  }
};

test('evidence summary requires shared identity, status, window, and provenance', async () => {
  const { buildEvidenceSummary } = await contracts();
  assert.throws(() => buildEvidenceSummary({ ...baseInput, studentId: '' }), /student/i);
  assert.throws(() => buildEvidenceSummary({ ...baseInput, evidenceWindowEnd: '' }), /window/i);
  assert.throws(() => buildEvidenceSummary({ ...baseInput, provenance: [] }), /provenance/i);

  const summary = buildEvidenceSummary(baseInput);
  assert.equal(summary.learningArea, 'vocabulary_paraphrase');
  assert.equal(summary.studentId, 'student-1');
  assert.equal(summary.status, 'developing');
  assert.equal(summary.strands.production, 'needs_attention');
});

test('shared evidence contract accepts app-specific strand names without hard-coding them', async () => {
  const { buildEvidenceSummary } = await contracts();
  const summary = buildEvidenceSummary({
    ...baseInput,
    learningArea: 'future_learning_area',
    strands: { custom_future_skill: 'secure' }
  });
  assert.deepEqual(summary.strands, { custom_future_skill: 'secure' });
});

test('invalid shared status trend and signal strength are rejected', async () => {
  const { buildEvidenceSummary } = await contracts();
  assert.throws(() => buildEvidenceSummary({ ...baseInput, status: 'terrible' }), /status/i);
  assert.throws(() => buildEvidenceSummary({ ...baseInput, trend: 'zooming' }), /trend/i);
  assert.throws(() => buildEvidenceSummary({ ...baseInput, signalStrength: 'certain' }), /signal/i);
});
