import fs from 'node:fs';

const path = 'content/vocabulary/units/unit-01.js';
let source = fs.readFileSync(path,'utf8');
const importLine = "import unit1WordFamilySupplement from './unit-01-word-family-supplement.js';";

if (!source.includes(importLine)) {
  source = source.replace(
    "import unit1Activities from './unit-01-activities.js';",
    "import unit1Activities from './unit-01-activities.js';\n" + importLine
  );
}
source = source.replace('activities:unit1Activities','activities:[...unit1Activities, ...unit1WordFamilySupplement]');
fs.writeFileSync(path,source);
