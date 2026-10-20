// Deterministic "which part of the paraphrase does the student have to supply" rule for Complete the
// Paraphrase. Shared by the client builder and the server marker so the two can never disagree.
//
// The blank must test the CHANGED language (require → demand), never a word the student can read
// straight off the source phrase. A chunk counts as changed when it contains a content word that does
// not occur in the original phrase; small function words are ignored so "an" → "a" is not the lesson.

const FUNCTION_WORDS = new Set(['a','an','the','of','to','on','in','at','for','and','or','with','by','from','as','that','is','are','be']);

function words(value) {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase('en').replace(/[’‘]/g, "'").match(/[a-z0-9]+(?:['-][a-z0-9]+)*/g) ?? [];
}
function clean(list) { return (Array.isArray(list) ? list : []).map(value => String(value ?? '').trim()).filter(Boolean); }

export function completeParaphraseBlank(data = {}) {
  const chunks = clean(data?.chunks);
  if (!chunks.length) {
    const whole = String(data?.equivalentPhrase ?? '').trim();
    return whole ? { index:0, answer:whole, stem:'___', changed:false } : null;
  }
  const original = new Set(words(data?.originalPhrase));
  const changedIndex = chunks.findIndex(chunk => words(chunk).some(word => !FUNCTION_WORDS.has(word) && !original.has(word)));
  const changed = changedIndex >= 0;
  const index = changed ? changedIndex : chunks.length - 1;
  const stem = chunks.map((chunk, position) => position === index ? '___' : chunk).join(' ');
  return { index, answer:chunks[index], stem, changed };
}
