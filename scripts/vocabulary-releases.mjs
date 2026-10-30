// Released-unit discovery for the content tooling. A unit is RELEASED when content/vocabulary/releases/unit-NN.js exists and exports a live unit
// whose unitNumber matches NN. Drafts (units/unit-NN-draft.js, status 'draft') are never in releases/, so they are never discovered or published.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const RELEASES_DIR = fileURLToPath(new URL('../content/vocabulary/releases/', import.meta.url));
export const UNITS_DIR = fileURLToPath(new URL('../content/vocabulary/units/', import.meta.url));
const pad = n => String(n).padStart(2, '0');
const RELEASE_FILE = /^unit-(\d{2})\.js$/;

// Release file numbers present in a directory, ascending.
export function releaseNumbers(dir = RELEASES_DIR) {
  return fs.readdirSync(dir).map(name => RELEASE_FILE.exec(name)?.[1]).filter(Boolean).map(Number).sort((a, b) => a - b);
}
export async function loadReleases(dir = RELEASES_DIR) {
  const out = [];
  for (const unitNumber of releaseNumbers(dir)) {
    const file = path.join(dir, `unit-${pad(unitNumber)}.js`);
    const release = (await import(pathToFileURL(file).href)).default;
    if (release?.status !== 'live') throw new Error(`releases/unit-${pad(unitNumber)}.js is not a live release (status "${release?.status}"): only live units are released.`);
    if (Number(release.unitNumber) !== unitNumber) throw new Error(`releases/unit-${pad(unitNumber)}.js exports unit ${release.unitNumber}: the file number and the unit number must match.`);
    out.push({ unitNumber, file, release });
  }
  return out;
}
export const releaseFileFor = (unitNumber, dir = RELEASES_DIR) => path.join(dir, `unit-${pad(unitNumber)}.js`);
// One lock file per unit, next to its source. Unit 1's path is the existing one.
export const lockFileFor = (unitNumber, dir = UNITS_DIR) => pathToFileURL(path.join(dir, `unit-${pad(unitNumber)}.content-lock.json`));
// Unit 1 keeps its recorded version string; later units use unit-NN/v1.
export const contentVersionFor = unitNumber => Number(unitNumber) === 1 ? 'unit-01/job9' : `unit-${pad(unitNumber)}/v1`;
// Generated content-sync chunk file names: Unit 1 keeps its committed names.
export const syncChunkNameFor = (unitNumber, n) => Number(unitNumber) === 1 ? `job9-unit-01-sync-chunk-${n}.sql` : `unit-${pad(unitNumber)}-sync-chunk-${n}.sql`;
export { pad as padUnit };
