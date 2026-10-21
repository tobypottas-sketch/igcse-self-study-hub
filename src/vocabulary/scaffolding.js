import { isSolvedOrder } from './tile-order.js';

function text(value) { return String(value ?? '').trim(); }
function array(value) { return Array.isArray(value) ? value : []; }

function acceptedAnswers(activity) {
  return array(activity?.markingReference?.acceptedAnswers).map(text).filter(Boolean);
}

function chooseOther(values, accepted) {
  const acceptedSet = new Set(accepted.map(value => value.toLocaleLowerCase('en')));
  return values.find(value => !acceptedSet.has(text(value).toLocaleLowerCase('en'))) ?? null;
}

function narrowOptions(values, accepted) {
  const curated = array(values).map(text).filter(Boolean);
  const acceptedInOptions = accepted.find(answer => curated.includes(answer)) ?? accepted[0] ?? null;
  const other = chooseOther(curated, accepted);
  const selected = new Set([acceptedInOptions, other].filter(Boolean));
  return curated.filter(option => selected.has(option));
}

function firstCorrectTile(tiles, accepted) {
  for (const answer of accepted) {
    const cleanAnswer = text(answer).toLocaleLowerCase('en');
    if (!cleanAnswer) continue;
    const prefixes = tiles.filter(tile => {
      const cleanTile = text(tile).toLocaleLowerCase('en');
      return cleanTile && (cleanAnswer === cleanTile || cleanAnswer.startsWith(`${cleanTile} `));
    });
    if (prefixes.length) return prefixes.sort((a,b) => text(b).length - text(a).length)[0];
  }
  return null;
}

function partialTextClue(answer) {
  const clean = text(answer);
  if (!clean) return '';
  const firstToken = clean.split(/\s+/)[0];
  if (clean.split(/\s+/).length > 1) return `${firstToken} …`;
  return `${firstToken.slice(0,1)}…`;
}

function primaryMatchOptions(activity) {
  const normalized = array(activity?.matchOptions).map(text).filter(Boolean);
  if (normalized.length) return normalized;
  const pairs = array(activity?.pairs);
  const primaryId = activity?.primaryEvidenceTargetId;
  const primary = pairs.find(pair => pair?.vocabularyId === primaryId) ?? pairs[0] ?? null;
  if (!primary) return [];
  return pairs.map(pair => text(pair?.definition)).filter(Boolean);
}

export function buildSupportStep(activity = {}, attemptResult = {}) {
  if (attemptResult.correct) return null;
  const misconceptionCategory = attemptResult.misconceptionCategory ?? null;
  const attemptNumber = Number(attemptResult.attemptNumber ?? 1);

  if (attemptNumber >= 2) {
    return { action:'move_on', recycle:true, supportLevel:'major', misconceptionCategory };
  }

  const accepted = acceptedAnswers(activity);
  if (activity.responseMode === 'choice') {
    return {
      action:'retry',
      recycle:false,
      supportLevel:'light',
      kind:'narrow_choices',
      options:narrowOptions(activity.options, accepted),
      misconceptionCategory
    };
  }

  if (activity.responseMode === 'matching') {
    return {
      action:'retry',
      recycle:false,
      supportLevel:'light',
      kind:'narrow_match',
      options:narrowOptions(primaryMatchOptions(activity), accepted),
      misconceptionCategory
    };
  }

  if (activity.responseMode === 'drag_gap') {
    return {
      action:'retry',
      recycle:false,
      supportLevel:'light',
      kind:'narrow_drag_gap',
      options:narrowOptions(activity.draggables ?? activity.wordBank, accepted),
      misconceptionCategory
    };
  }

  if (activity.responseMode === 'tiles') {
    const tiles = array(activity.tiles).map(text).filter(Boolean);
    const fixed = firstCorrectTile(tiles, accepted);
    const remaining = [...tiles];
    const index = remaining.indexOf(fixed);
    if (index >= 0) remaining.splice(index, 1);
    // Spelling & Recall only: the supported retry must not show the fixed letter followed by a remainder that already spells
    // the word. Rotate deterministically until it does not; every other tile activity keeps its order exactly as before.
    if (activity.type === 'spelling_rebuild' && fixed) {
      const answer = accepted.find(value => !/\s/.test(value)) ?? accepted[0] ?? '';
      for (let shift = 0; shift < remaining.length && isSolvedOrder([fixed, ...remaining], answer); shift += 1) {
        remaining.push(remaining.shift());
        if (remaining.length > 1 && new Set(remaining).size < 2) break;
      }
    }
    return {
      action:'retry',
      recycle:false,
      supportLevel:'light',
      kind:'partial_build',
      fixedChunks:fixed ? [fixed] : [],
      remainingTiles:remaining,
      misconceptionCategory
    };
  }

  if (activity.responseMode === 'evidence') {
    return {
      action:'retry',
      recycle:false,
      supportLevel:'light',
      kind:'narrow_evidence',
      options:narrowOptions(activity.evidenceOptions, accepted),
      misconceptionCategory
    };
  }

  const clue = partialTextClue(accepted[0]);
  return {
    action:'retry',
    recycle:false,
    supportLevel:'light',
    kind:'partial_text',
    clue,
    misconceptionCategory
  };
}