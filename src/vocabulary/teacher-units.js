// Which unit the teacher pathway table is showing.
// Units that exist in the data, and the one the teacher is looking at: the unit this class practised most recently, unless they choose another.
export function unitOptions(classData) {
  const seen = new Map();
  for (const row of classData.occurrences ?? []) if (!seen.has(row.unitNumber)) seen.set(row.unitNumber, { unitNumber:row.unitNumber, unitTitle:row.unitTitle });
  return [...seen.values()].sort((a, b) => a.unitNumber - b.unitNumber);
}
function latestPractisedUnit(classData, options) {
  const known = new Set(options.map(row => row.unitNumber));
  const latest = (classData.activity ?? []).filter(row => known.has(Number(row.metadata?.unit_number))).sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))[0];
  return latest ? Number(latest.metadata.unit_number) : (options[0]?.unitNumber ?? null);
}
export function selectedUnit(classData) {
  const options = unitOptions(classData);
  if (classData.selectedUnit === 'all') return { options, selected:'all', selectedTitle:'' };
  const chosen = options.find(row => row.unitNumber === Number(classData.selectedUnit)) ?? options.find(row => row.unitNumber === latestPractisedUnit(classData, options)) ?? null;
  return { options, selected:chosen?.unitNumber ?? 'all', selectedTitle:chosen?.unitTitle ?? '' };
}
export function unitOccurrences(classData) {
  const { selected } = selectedUnit(classData);
  return selected === 'all' ? classData.occurrences : classData.occurrences.filter(row => row.unitNumber === selected);
}

