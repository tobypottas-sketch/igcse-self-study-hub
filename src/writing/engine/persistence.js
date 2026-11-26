import {WRITING_APPS} from '../submissions.js';
import {restoreWritingState} from './persistence-state.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const contentId = /^[a-z0-9][a-z0-9_-]{0,79}$/;
const positive = value => Number.isInteger(value) && value > 0 && value <= 2147483647;
const failure = (code, cause) => ({ok:false, error:{code, cause}});

export function contentIdentity({appKey, curriculumId, curriculumVersion, pathwayId, stageId, activityId, contentVersion, taskId, taskVersion}) {
  if (!Object.hasOwn(WRITING_APPS, appKey) || typeof curriculumId !== 'string' || !contentId.test(curriculumId)
      || !positive(curriculumVersion) || !['structure','expression','development','cohesion','editing','exam'].includes(pathwayId)
      || (stageId !== undefined && !['discover','explore','practise','apply','master'].includes(stageId))
      || ((activityId === undefined) !== (contentVersion === undefined))
      || (activityId !== undefined && (!stageId || typeof activityId !== 'string' || !contentId.test(activityId) || !positive(contentVersion)))
      || ((taskId === undefined) !== (taskVersion === undefined))
      || (taskId !== undefined && (typeof taskId !== 'string' || !contentId.test(taskId) || !positive(taskVersion)))) {
    throw new TypeError('Invalid writing content identity');
  }
  return Object.freeze({appKey, curriculumId, curriculumVersion, pathwayId, stageId, activityId, contentVersion, taskId, taskVersion});
}

function databaseError(error, status) {
  if (error.message === 'writing_draft_conflict') return 'revision_conflict';
  if (status === 401 || status === 403 || error.code === '42501') return 'permission_denied';
  if (error.code === 'P0002') return 'missing';
  if (error.code === '23505') return 'duplicate_request';
  if (error.code === '23514' || error.code === '22023' || error.code === '23503') return 'invalid_payload';
  if (status === 0 || error.name === 'AbortError' || error instanceof TypeError) return 'network';
  return 'database';
}

async function run(request) {
  try {
    const {data,error,status} = await request();
    if (error) return failure(databaseError(error,status),error);
    return data === null ? failure('missing') : {ok:true,data};
  } catch (error) {
    return failure(databaseError(error),error);
  }
}

// The database enforces ownership. Passing a genre only filters records already visible under RLS.
export function createWritingPersistence(client) {
  function byId(table, appKey, id) {
    if (!Object.hasOwn(WRITING_APPS,appKey) || typeof id !== 'string' || !uuid.test(id)) {
      return Promise.resolve(failure('invalid_payload'));
    }
    return run(() => client.from(table).select('*').eq('app_key',appKey).eq('id',id).maybeSingle());
  }

  return Object.freeze({
    async listProgress({appKey,curriculumId,curriculumVersion}) {
      if (!Object.hasOwn(WRITING_APPS,appKey) || typeof curriculumId !== 'string' || !contentId.test(curriculumId) || !positive(curriculumVersion)) {
        return failure('invalid_payload');
      }
      return run(() => client.from('writing_pathway_progress').select('*').eq('app_key',appKey)
        .eq('curriculum_id',curriculumId).eq('curriculum_version',curriculumVersion).order('pathway_id'));
    },
    getActivityAttempt: (appKey,id) => byId('writing_activity_attempts',appKey,id),
    getExamAttempt: (appKey,id) => byId('writing_exam_attempts',appKey,id),
    getSubmission: (appKey,id) => byId('student_writing_submissions',appKey,id),
    async listDrafts(appKey,taskId,taskVersion) {
      if (!Object.hasOwn(WRITING_APPS,appKey) || typeof taskId !== 'string'
          || !contentId.test(taskId) || !positive(taskVersion)) return failure('invalid_payload');
      return run(() => client.from('writing_drafts').select('id,draft_context,revision_number,updated_at')
        .eq('app_key',appKey).eq('task_id',taskId).eq('task_version',taskVersion)
        .order('updated_at',{ascending:false}));
    },
    async getDraft(appKey,id) {
      const result = await byId('writing_drafts',appKey,id);
      if (!result.ok) return result;
      const restored = restoreWritingState(result.data.workspace_state);
      if (!restored.ok) return restored;
      return {ok:true,data:result.data};
    },
    async saveDraft({id,requestId,expectedRevision,appKey,taskId,taskVersion,context,state,currentResponse='',originalResponse=''}) {
      if (typeof id !== 'string' || !uuid.test(id) || typeof requestId !== 'string' || !uuid.test(requestId)
          || (expectedRevision !== 0 && !positive(expectedRevision)) || !Object.hasOwn(WRITING_APPS,appKey)
          || typeof taskId !== 'string' || !contentId.test(taskId) || !positive(taskVersion)
          || !['studio','workshop','gold'].includes(context) || typeof currentResponse !== 'string'
          || typeof originalResponse !== 'string' || currentResponse.length > 30000
          || originalResponse.length > 30000) return failure('invalid_payload');
      const restored = restoreWritingState(state);
      if (!restored.ok) return restored;
      return run(() => client.rpc('save_writing_draft',{
        draft_id:id, request_id:requestId, expected_revision:expectedRevision, genre:appKey,
        task_key:taskId, task_rev:taskVersion, context_key:context, state,
        response_text:currentResponse, first_response:originalResponse
      }));
    },
    async deleteDraft(appKey,id,expectedRevision) {
      if (!Object.hasOwn(WRITING_APPS,appKey) || typeof id !== 'string' || !uuid.test(id)
          || !positive(expectedRevision)) return failure('invalid_payload');
      return run(() => client.from('writing_drafts').delete().eq('app_key',appKey)
        .eq('id',id).eq('revision_number',expectedRevision).select('id').maybeSingle());
    }
  });
}
