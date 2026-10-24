// The one place that says which Vocabulary Builder units exist and what is special about each.
//
// It carries only what the database cannot: the planned title, the word count a unit must reach, and any pathway that is
// deliberately held back. It never makes content live: a unit appears for students only when its occurrences are live in the
// database, and a pathway is live only when it passes the readiness rules (content/vocabulary/pathway-readiness-rules.js).
// `pathwayOverrides` is an editorial HOLD: it can keep a ready pathway hidden, never switch one on. Adding a unit's content
// means adding its unit file and release file and its artwork. Nothing in the engine or the views changes.
export const EXPECTED_WORDS_PER_UNIT = 50;

const UNITS = {
  1:{ title:'Sports and Free Time' },
  2:{ title:'Digital Life' },
  3:{ title:'Food' },
  4:{ title:'Transport' },
  5:{ title:'Holidays' },
  6:{ title:'Learning and Study Skills' },
  7:{ title:'Interviews' },
  8:{ title:'Work' },
  9:{ title:'Communication' },
  10:{ title:'Education' },
  11:{ title:'Human Achievements' },
  12:{ title:'Organisations and Volunteers' },
  13:{ title:'Success and Fame' },
  14:{ title:'Medical Care' },
  15:{ title:'Healthy Lifestyles' },
  16:{ title:'Animal Life' },
  17:{ title:'The Environment' },
  18:{ title:'Feeding the World' },
  19:{ title:'Lifestyles' },
  20:{ title:'Technology and the Future' }
};

function freezeDeep(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freezeDeep(child);
  }
  return value;
}

export const UNIT_REGISTRY = freezeDeep(Object.fromEntries(Object.entries(UNITS).map(([number, unit]) => [
  number,
  { unitNumber:Number(number), title:unit.title, expectedWords:unit.expectedWords ?? EXPECTED_WORDS_PER_UNIT, pathwayOverrides:unit.pathwayOverrides ?? {} }
])));

// The configuration for a unit number, or null when the number is not a planned unit.
export function unitConfig(unitNumber) {
  return UNIT_REGISTRY[String(Math.trunc(Number(unitNumber)))] ?? null;
}

// How a pathway is withheld in a unit, or null when nothing is withheld.
export function pathwayOverride(unitNumber, pathwayId) {
  return unitConfig(unitNumber)?.pathwayOverrides?.[pathwayId] ?? null;
}
