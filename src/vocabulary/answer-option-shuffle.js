// Presentation only: never use this nonce/PRNG to select question content.
export function shuffleAnswerOptions(values, seed = '', optionNonce = '') {
  const output = [...values];
  let state = 2166136261;
  for (const char of JSON.stringify([String(seed), String(optionNonce)])) {
    state = Math.imul(state ^ char.charCodeAt(0), 16777619) >>> 0;
  }
  // Mulberry32 mixes the whole state before returning each unsigned draw.
  function draw() {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return (value ^ (value >>> 14)) >>> 0;
  }
  for (let index = output.length - 1; index > 0; index--) {
    const size = index + 1;
    const limit = Math.floor(0x100000000 / size) * size;
    let value;
    do { value = draw(); } while (value >= limit);
    const swap = value % size;
    [output[index], output[swap]] = [output[swap], output[index]];
  }
  return output;
}
