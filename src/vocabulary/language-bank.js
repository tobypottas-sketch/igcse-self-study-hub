import unit1LanguageBank from '../../content/vocabulary/units/unit-01-language-bank.js';

function text(value) {
  return String(value ?? '').trim();
}

export function languageBankForItem(item = {}) {
  const term = text(item?.term);
  return term ? unit1LanguageBank[term] ?? null : null;
}

export function languageBankContextForItem(item = {}, usedContentIds = [], seed = '') {
  const bank = languageBankForItem(item);
  const contexts = Array.isArray(bank?.contexts) ? bank.contexts : [];
  if (!contexts.length) return null;

  const used = new Set((Array.isArray(usedContentIds) ? usedContentIds : []).map(String));
  const unused = contexts.filter(context => !used.has(`language-bank:${context.id}`) && !used.has(String(context.id)));
  const candidates = unused.length ? unused : contexts;

  let hash = 2166136261;
  for (const char of `${seed}:${termKey(item)}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return candidates[hash % candidates.length];
}

function termKey(item) {
  return text(item?.vocabularyId) || text(item?.term);
}
