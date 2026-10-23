const coverageByUnit = new Map();

function unitKey(value) {
  const number = Number(value);
  return Number.isFinite(number) ? String(number) : String(value ?? '');
}

export function registerPathwayCoverage(unitNumber, coverage) {
  const key = unitKey(unitNumber);
  if (!key || !coverage || typeof coverage !== 'object') return;
  coverageByUnit.set(key, coverage);
}

export function registeredPathwayCoverage(unitNumber) {
  return coverageByUnit.get(unitKey(unitNumber)) ?? null;
}

export function clearPathwayCoverage(unitNumber = null) {
  if (unitNumber == null) coverageByUnit.clear();
  else coverageByUnit.delete(unitKey(unitNumber));
}

// Does the unit's readiness allow this pathway to serve this word? Locked pathways serve nobody. A unit with no registered
// coverage (nothing has been evaluated yet) is not filtered, so callers must evaluate a unit before practising it.
export function coverageServes(unitNumber, pathwayId, occurrenceId) {
  const coverage = unitNumber == null ? null : registeredPathwayCoverage(unitNumber)?.[pathwayId] ?? null;
  if (!coverage) return true;
  if (coverage.available === false) return false;
  return new Set((coverage.occurrenceIds ?? []).map(String)).has(String(occurrenceId));
}

// Can any live pathway serve this word? Mixed Practice only uses words for which one can.
export function servedByAnyLivePathway(unitNumber, occurrenceId, pathwayIds = []) {
  return pathwayIds.some(pathwayId => {
    const coverage = unitNumber == null ? null : registeredPathwayCoverage(unitNumber)?.[pathwayId] ?? null;
    return !coverage || coverageServes(unitNumber, pathwayId, occurrenceId);
  });
}
