// Executable specification of Locked Decisions 5 and 8 (provisional Paraphrasing Mastery; per-component multi-part evidence).
export function scoreMultiPart(components = []) {
  const results = components.map(Boolean);
  const total = results.length;
  const correct = results.filter(Boolean).length;
  // The visible item stays all-or-nothing so mission score is not inflated; the evidence keeps every component.
  return { visibleCorrect: total > 0 && correct === total, missionPoints: total > 0 && correct === total ? 1 : 0, evidence: { components: results, correct, total } };
}

// attempt = { productive, correct, provisional, reviewFlag }. Provisional evidence can complete the visible stage
// (the caller decides that from the mission) but never creates secure/mastered confidence on its own.
export function confidenceFrom(attempts = []) {
  const good = attempts.filter(a => a.productive && a.correct);
  const firm = good.filter(a => !a.provisional);
  const provisional = good.filter(a => a.provisional);
  if (firm.length >= 1 && (firm.length + provisional.length) >= 2) return 'secure';
  if (firm.length >= 1 || provisional.length >= 1) return 'building';
  return 'new';
}
// NOTE: the numeric thresholds above are a placeholder to express "provisional alone is never secure; corroboration upgrades".
// The hidden-confidence model is not yet locked (see report); do not read these numbers as a decision.
