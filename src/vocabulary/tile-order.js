// Spelling & Recall tile order. A tile exercise must never be served already solved, so the order is always checked against
// the answer and, if needed, rearranged deterministically (no reliance on "random chance makes it unlikely").
function hashSeed(seed) { let hash = 2166136261; for (const char of String(seed ?? '')) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619) >>> 0; } return hash >>> 0; }
function seededShuffle(values, seed) {
  const output = [...values]; let state = hashSeed(seed) || 1;
  for (let i = output.length - 1; i > 0; i -= 1) { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; const j = state % (i + 1); [output[i], output[j]] = [output[j], output[i]]; }
  return output;
}

// True when the tiles, joined in order, spell the answer (spaces in the answer are ignored: "d e n y" and "deny" are the same).
export function isSolvedOrder(tiles, answer) {
  const target = String(answer ?? '').replace(/\s+/g, '');
  return Array.isArray(tiles) && tiles.join('').replace(/\s+/g, '') === target;
}
function inPlace(tiles, answerTiles) { return tiles.filter((tile, index) => tile === answerTiles[index]).length; }

// Returns the tiles in a deterministic order that is NEVER the answer. For words of four or more tiles it also avoids an
// order in which more than half the tiles already sit in their final position, when a better order exists.
export function unsolvedTileOrder(tiles, answer, seed) {
  const source = Array.from(tiles ?? []);
  const target = String(answer ?? '').replace(/\s+/g, '');
  if (source.length < 2 || new Set(source).size < 2) throw new Error('These tiles cannot be arranged into an unsolved order.');
  const answerTiles = Array.from(target);
  const nearlySolved = order => order.length >= 4 && inPlace(order, answerTiles) * 2 > order.length;
  let fallback = null;
  for (let attempt = 0; attempt < 64; attempt += 1) {
    const order = seededShuffle(source, attempt ? `${seed}:again:${attempt}` : seed);
    if (isSolvedOrder(order, target)) continue;
    if (!nearlySolved(order)) return order;
    fallback ??= order;
  }
  if (fallback) return fallback;
  // Deterministic guarantee: some rotation or adjacent swap of the source is always different from the answer.
  for (let shift = 1; shift < source.length; shift += 1) {
    const rotated = [...source.slice(shift), ...source.slice(0, shift)];
    if (!isSolvedOrder(rotated, target)) return rotated;
  }
  for (let index = 0; index < source.length - 1; index += 1) {
    if (source[index] === source[index + 1]) continue;
    const swapped = [...source]; [swapped[index], swapped[index + 1]] = [swapped[index + 1], swapped[index]];
    if (!isSolvedOrder(swapped, target)) return swapped;
  }
  throw new Error('These tiles cannot be arranged into an unsolved order.');
}
