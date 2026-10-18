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
