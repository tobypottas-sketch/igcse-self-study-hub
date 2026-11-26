import assert from 'node:assert/strict';
import test from 'node:test';
import {contentIdentity,createWritingPersistence} from '../src/writing/engine/persistence.js';
import {restoreWritingState,serializeWritingState} from '../src/writing/engine/persistence-state.js';
import {pathways} from '../src/writing/content/review-pedagogy.js';
import {cohesion} from '../src/writing/content/review-cohesion.js';
import {editing} from '../src/writing/content/review-editing.js';
import {exam,examMocks} from '../src/writing/content/review-exam-20261125.js';

test('active pathways retain unique stable question, option, observation and task identities', () => {
  const allQuestions = [];
  const allTasks = [...examMocks];
  for (const course of [...Object.values(pathways),cohesion,editing,exam]) {
    assert.equal(new Set(course.practice.map(activity=>activity.id)).size,course.practice.length);
    assert.equal(new Set(course.discover.map(observation=>observation.id)).size,course.discover.length);
    allQuestions.push(...course.practice.flatMap(activity=>activity.items),...[course.analysis].flat());
    allTasks.push(...[course.gold,...course.apply,course.master].flat().filter(Boolean));
  }
  for (const item of allQuestions) {
    assert.match(item.id,/^[a-z0-9_-]+$/);
    assert.equal(item.optionIds.length,item.options.length);
    assert.equal(new Set(item.optionIds).size,item.options.length);
  }
  assert.equal(new Set(allQuestions.map(item=>item.id)).size,allQuestions.length);
  for (const item of allTasks) {
    assert.match(item.id,/^[a-z0-9_-]+$/);
    assert.equal(item.version,1);
  }
  assert.equal(new Set(allTasks.map(item=>item.id)).size,allTasks.length);
});

test('curriculum and task versions are explicit and genre-scoped', () => {
  const identity = {appKey:'review_writing',curriculumId:'review',curriculumVersion:1,pathwayId:'structure',taskId:'shared-task',taskVersion:1};
  assert.notDeepEqual(contentIdentity(identity),contentIdentity({...identity,appKey:'essay_writing'}));
  assert.notDeepEqual(contentIdentity(identity),contentIdentity({...identity,taskVersion:2}));
  assert.throws(()=>contentIdentity({...identity,taskVersion:undefined}),TypeError);
});

test('state survives question reordering and rejects invalid references or unsupported versions', () => {
  const items = [...pathways.structure.practice[0].items];
  const item = items[0];
  const result = serializeWritingState({
    objective:{'structure-focus':{currentQuestion:item.id,questions:{
      [item.id]:{displayOrder:[...item.optionIds].reverse(),selection:item.optionIds[0],checked:true}
    }}},
    planning:{audience:'Students'}, checklist:['covered-task']
  });
  assert.equal(result.ok,true);
  const restored = restoreWritingState(result.data).data;
  items.reverse();
  const active = restored.objective['structure-focus'];
  assert.equal(items.find(question=>question.id===active.currentQuestion),item);
  assert.equal(active.questions[item.id].selection,item.optionIds[0]);
  active.questions[item.id].selection='missing-option';
  assert.equal(restoreWritingState(restored).error.code,'invalid_payload');
  assert.equal(restoreWritingState({version:2}).error.code,'version_incompatibility');
});

test('persistence transports only approved draft arguments and reports outcomes', async () => {
  const request = {
    id:'00000000-0000-4000-8000-000000000001',requestId:'00000000-0000-4000-8000-000000000002',
    expectedRevision:1,appKey:'review_writing',taskId:'shared-task',taskVersion:1,context:'studio',
    state:{version:1},studentId:'ignored'
  };
  for (const [result,code] of [
    [{error:{message:'writing_draft_conflict'}},'revision_conflict'],
    [{error:{code:'42501'}},'permission_denied'],
    [{error:{code:'P0002'}},'missing'],
    [{error:{code:'23505'}},'duplicate_request'],
    [{error:{message:'fetch failed'},status:0},'network']
  ]) {
    const store=createWritingPersistence({rpc:(name,args)=>{
      assert.equal(name,'save_writing_draft');
      assert.equal(args.expected_revision,1);
      assert.equal(args.genre,'review_writing');
      assert.equal(Object.hasOwn(args,'student_id'),false);
      return result;
    }});
    assert.equal((await store.saveDraft(request)).error.code,code);
  }
});
