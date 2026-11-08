// Student coach: finds CLEARLY DEMONSTRABLE slips directly in the student's own text, without asking the model.
// Nothing here is a guess. A finding exists only when (a) its wording is a verbatim span of the text and (b) its fix passes the same
// deterministic test the teacher pipeline uses (error-check.js confirmCorrection), or is a missing apostrophe in a fixed list of short forms
// whose apostrophe-less spelling is not an ordinary English word. Everything else is left alone: the safeguard against invented mistakes is unchanged.
import { confirmCorrection, KNOWN_MISSPELLINGS } from './error-check.js';
import { profileResponse } from './response-profile.js';

const SHORT_FORMS = Object.freeze({
  dont:["don't", 'do not'], cant:["can't", 'cannot'], doesnt:["doesn't", 'does not'], didnt:["didn't", 'did not'], isnt:["isn't", 'is not'], wasnt:["wasn't", 'was not'],
  arent:["aren't", 'are not'], werent:["weren't", 'were not'], havent:["haven't", 'have not'], hasnt:["hasn't", 'has not'], hadnt:["hadn't", 'had not'],
  couldnt:["couldn't", 'could not'], wouldnt:["wouldn't", 'would not'], shouldnt:["shouldn't", 'should not'], im:["I'm", 'I am'], ive:["I've", 'I have'],
  youre:["you're", 'you are'], theyre:["they're", 'they are'], whats:["what's", 'what is'], thats:["that's", 'that is'], theres:["there's", 'there is']
});
const WORD = /[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu;
const PLURAL = new Set(['they', 'we', 'you']), SINGULAR = new Set(['he', 'she', 'it']);
const AGREE = [['was', 'were'], ['is', 'are'], ['has', 'have'], ['does', 'do'], ["doesn't", "don't"], ["wasn't", "weren't"], ["isn't", "aren't"], ["hasn't", "haven't"]];
const matchCase = (original, fixed) => original[0] !== original[0].toLowerCase() ? fixed[0].toUpperCase() + fixed.slice(1) : fixed;

// → [{ category, quote, correction, explanation, at }] in text order, each already verified.
export function findClearErrors(text) {
  const source = String(text ?? ''); const words = [...source.matchAll(WORD)]; const found = [];
  const add = (category, quote, correction, explanation, at) => { if (explanation && source.includes(quote)) found.push({ category, quote, correction, explanation, at }); };
  words.forEach((match, i) => {
    const word = match[0], low = word.toLowerCase().replace(/’/gu, "'"), at = match.index;
    if (SHORT_FORMS[low] && (word === low || word === low[0].toUpperCase() + low.slice(1))) {
      const [base, long] = SHORT_FORMS[low], fixed = base.startsWith('I') ? base : matchCase(word, base);
      add('apostrophe', word, fixed, 'A short form needs an apostrophe where letters are missing: write ' + fixed + ' (' + long + ').', at);
    } else if (KNOWN_MISSPELLINGS.has(low)) {
      const fixed = matchCase(word, KNOWN_MISSPELLINGS.get(low)), check = confirmCorrection(word, fixed, source);
      if (check.confirmed) add('spelling', word, fixed, check.explanation, at);
    } else if (word === 'i' && source[at - 1] !== '.' && source[at + 1] !== '.' && source[at + 1] !== "'") {
      const check = confirmCorrection('i', 'I', source);
      if (check.confirmed) add('capital', 'i', 'I', check.explanation, at);
    }
    // a plural pronoun with a singular verb, or he/she/it with a plural one: "they was", "he don't"
    const next = words[i + 1];
    if (next && source.slice(at + word.length, next.index).trim() === '' && source.slice(at + word.length, next.index).length <= 1) {
      const subject = word.toLowerCase(), verb = next[0].toLowerCase().replace(/’/gu, "'");
      for (const [singular, plural] of AGREE) {
        const fix = PLURAL.has(subject) && verb === singular ? plural : SINGULAR.has(subject) && verb === plural ? singular : null;
        if (!fix || (word !== subject && word !== matchCase(word, subject)) || next[0] !== verb) continue;
        const quote = word + ' ' + next[0], correction = word + ' ' + fix, check = confirmCorrection(quote, correction, source);
        if (check.confirmed) add('agreement', quote, correction, check.explanation, at);
      }
    }
  });
  return found.sort((a, b) => a.at - b.at);
}

const quoteList = items => { const q = [...new Set(items.map(item => '“' + item.quote + '”'))].slice(0, 3); return q.length > 1 ? q.slice(0, -1).join(', ') + ' and ' + q.at(-1) : q[0]; };
const HABITS = {
  apostrophe: items => 'Next time, check short forms such as ' + quoteList(items) + ': each needs an apostrophe where letters are missing. Reread your text once, looking only for these.',
  spelling: items => 'Next time, check the spelling of words like ' + quoteList(items) + ' before you finish, and keep a short list of the words you often misspell.',
  agreement: items => 'Next time, check that each verb matches its subject, as in ' + quoteList(items) + '. Reread your text once, looking only at verbs.',
  capital: () => 'Next time, check that I, days and months always start with a capital letter. Reread your text once, looking only for these.'
};
// Targets built only from counted facts about the text (response-profile.js), phrased as something to TRY, never as a claim that anything is "missing".
function structureTarget(app, text) {
  const p = profileResponse(text), words = (String(text).match(/[\p{L}\p{N}']+/gu) ?? []).length;
  if (app === 'email') {
    if (!p.greeting) return 'Next time, begin with a friendly greeting such as “Hi Sam,” so the email sounds like a message to a friend.';
    if (p.paragraphs < 2 && words >= 40) return 'Next time, put each main point in its own short paragraph, so your friend can find each answer easily.';
    if (!p.questions) return 'Next time, ask your friend one question near the end, such as “What are you planning to do?”, to keep the conversation going.';
    if (!p.signOff) return 'Next time, finish with a friendly closing such as “Best wishes,” before your name.';
    if (!p.reasons && !p.examples) return 'Next time, choose one of your points and add a reason with “because”, or a small example, so your friend gets more detail.';
  }
  if (app === 'review') {
    if (p.paragraphs < 2 && words >= 40) return 'Next time, split your review into short paragraphs, for example one for what it is like and one for your recommendation.';
    if (!p.reasons && !p.examples) return 'Next time, choose one opinion and add a reason with “because”, or a specific example, so readers can see why you think it.';
    if (!/\b(?:recommend|worth|should (?:go|visit|watch|see|read|try)|must (?:go|see|visit|watch|read|try))\b/iu.test(text)) return 'Next time, finish with a clear recommendation, for example “I would recommend it to anyone who…”.';
  }
  return '';
}
// → { improvements: [up to 2 fixes], target } — improvements skip anything already covered; the target is only used when the model gave none.
export function studentCoach(app, text, existing = []) {
  const found = findClearErrors(text);
  const covered = point => existing.some(old => String(old.quote).includes(point.quote) || point.quote.includes(String(old.quote)));
  const fresh = found.filter(point => !covered(point)), seen = new Set(), picks = [];
  for (const point of fresh) if (!seen.has(point.category)) { seen.add(point.category); picks.push(point); }     // different kinds first
  for (const point of fresh) if (picks.length < 2 && !picks.includes(point)) picks.push(point);
  const improvements = picks.slice(0, 2).sort((a, b) => a.at - b.at).map(point => ({ quote:point.quote, advice:point.explanation, type:'error', suggestion:point.correction }));
  const groups = {}; for (const point of found) (groups[point.category] ??= []).push(point);
  const pattern = Object.entries(groups).filter(([, items]) => items.length >= 2).sort((a, b) => b[1].length - a[1].length)[0];
  const target = (pattern && HABITS[pattern[0]](pattern[1])) || structureTarget(app, text) || (found.length > improvements.length ? HABITS[found[0].category](found) : '');   // a lone slip is already explained above; do not repeat it as the target
  return { improvements, target, errorCount: found.length };
}
