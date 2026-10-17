const TIMED_DURATIONS = new Set([5,10,15,20]);

function date(value) {
  const result = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(result.getTime())) throw new Error('Invalid session date.');
  return result;
}

export function createSession({ unitNumber, mode = 'adaptive', durationMinutes = null, targetIds = [], now = new Date() } = {}) {
  if (!Number.isInteger(unitNumber) || unitNumber < 1 || unitNumber > 20) throw new Error('Invalid unit number.');
  if (!['adaptive','timed'].includes(mode)) throw new Error('Invalid session mode.');
  if (mode === 'timed' && !TIMED_DURATIONS.has(durationMinutes)) throw new Error('Timed session duration must be 5, 10, 15 or 20 minutes.');
  const startedAt = date(now).toISOString();
  return {
    unitNumber,
    mode,
    durationMinutes:mode === 'timed' ? durationMinutes : null,
    startedAt,
    expiresAt:mode === 'timed' ? new Date(date(now).getTime() + durationMinutes * 60 * 1000).toISOString() : null,
    targetIds:mode === 'adaptive' ? [...targetIds].slice(0,10) : [],
    completedTargetIds:[],
    completedAttempts:[],
    phase:'question',
    activeQuestion:null,
    summary:{ practised:0, strengthened:0, secure:0, mastered:0, needsAnotherLook:0 },
    expired:false
  };
}

export function isSessionComplete(session, now = new Date()) {
  if (session.mode === 'timed') return date(now).getTime() >= new Date(session.expiresAt).getTime();
  return session.targetIds.length > 0 && session.targetIds.every(id => session.completedTargetIds.includes(id));
}

export function completeAttempt(session, { targetId, evidence = {}, strengthened = false, movedToSecure = false, mastered = false, needsAnotherLook = false } = {}) {
  if (!targetId) throw new Error('Target ID is required.');
  const completedTargetIds = session.completedTargetIds.includes(targetId) ? [...session.completedTargetIds] : [...session.completedTargetIds, targetId];
  return {
    ...session,
    completedTargetIds,
    completedAttempts:[...session.completedAttempts, { targetId, evidence }],
    activeQuestion:null,
    phase:'question',
    summary:{
      practised:session.summary.practised + 1,
      strengthened:session.summary.strengthened + (strengthened ? 1 : 0),
      secure:session.summary.secure + (movedToSecure ? 1 : 0),
      mastered:session.summary.mastered + (mastered ? 1 : 0),
      needsAnotherLook:session.summary.needsAnotherLook + (needsAnotherLook ? 1 : 0)
    }
  };
}

export function expireSession(session, now = new Date()) {
  if (session.mode !== 'timed') return session;
  if (date(now).getTime() < new Date(session.expiresAt).getTime()) return session;
  return { ...session, expired:true, phase:'complete', activeQuestion:null };
}
