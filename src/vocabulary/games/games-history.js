// Variety memory for the Games area. In memory only: it lives for the page session, holds nothing but prompt ids / puzzle targets / round numbers,
// and is read by nothing except the two games' selection code. No storage, no network, no progression, XP, mastery or evidence.
export const createGameHistory = () => ({ blitzRound: 0, blitzSeen: new Map(), blitzTermUse: new Map(), cxRound: 0, cxSeen: new Map() });
// Shared by every mount of the Games area during one page session, so Play Again (and leaving and re-entering) keeps its memory.
export const sharedGameHistory = createGameHistory();
// Order: never seen first, then least recently seen, then (Blitz only) words served least often. `items` should arrive already shuffled:
// the sort is stable, so equal items stay in random order and play is never fixed.
export const leastRecentFirst = (items, seenRound, secondary = () => 0) => items.slice().sort((a, b) => seenRound(a) - seenRound(b) || secondary(a) - secondary(b));
