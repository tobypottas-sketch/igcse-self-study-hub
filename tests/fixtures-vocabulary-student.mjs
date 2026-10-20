// Network boundary fixture: real router, controller, renderer, planner and marking run in-browser.
export async function mockVocabularyStudent(page, saveMode = 'success') {
  await page.route('**/src/supabase.js', route => route.fulfill({ contentType:'text/javascript', body:`
    import unit from '/content/vocabulary/releases/unit-01.js';
    import { validateVocabularyAttempt } from '/supabase/functions/vocabulary-attempt-action/validation.js';
    import { freshPathwayProgress, applyPathwayAttempt } from '/src/vocabulary/pathway-progress.js';
    const pathwayHistory = {};
    const snake = row => Object.fromEntries(Object.entries(row).map(([key,value]) => [key.replace(/[A-Z]/g, c => '_' + c.toLowerCase()), value]));
    const tables = {
      profiles:{ id:'navigation-student', role:'student', active:true, display_name:'Navigation Student' },
      vocabulary_unit_occurrences:unit.occurrences.map(snake),
      vocabulary_items:unit.items.map(snake),
      vocabulary_contexts:unit.contexts.map(row => ({ ...snake(row), context_type:row.type, prompt_text:row.text })),
      vocabulary_unit_activities:unit.activities.filter(row => ${JSON.stringify(saveMode)} !== 'unpublished' || !row.activityContentId.startsWith('language-bank:')).map(snake),
      vocabulary_global_mastery:[], vocabulary_unit_mastery:[]
    };
    window.vocabularyAttempts = [];
    window.settleVocabularySave = null;
    const client = {
      auth:{ getUser:async () => ({ data:{ user:{ id:'navigation-student' } } }) },
      from(name) {
        const query = { then(resolve) { resolve({ data:tables[name] ?? [] }); } };
        for (const method of ['select','eq','in','order','single','insert']) query[method] = () => query;
        return query;
      },
      functions:{ async invoke(name, { body }) {
        if (name !== 'vocabulary-attempt-action') return { data:{ ok:true } };
        window.vocabularyAttempts.push(body);
        try { validateVocabularyAttempt(body); } catch (error) { return { error:{ message:error.message } }; }
        if (${JSON.stringify(saveMode)} === 'pending') await new Promise(resolve => { window.settleVocabularySave = resolve; });
        if (${JSON.stringify(saveMode)} === 'failed') return { error:{ message:'Simulated offline save' } };
        if (${JSON.stringify(saveMode)} === 'continue') {
          const key = body.occurrenceId + ':' + body.pathwayId;
          const id = body.activityContentId ?? body.contextId ?? body.occurrenceId;
          const progress = applyPathwayAttempt(pathwayHistory[key] ?? freshPathwayProgress(), {
            stageId:body.pathwayStage, servedStageId:body.servedPathwayStage, correct:true,
            firstAttempt:body.firstAttempt, retryUsed:body.retryUsed, supportLevel:body.supportLevel,
            contentId:id, contextId:id, promptKey:id, activityType:body.questionType
          });
          pathwayHistory[key] = progress;
          return { data:{ ok:true, correct:true, pathwayId:body.pathwayId, pathwayProgress:progress } };
        }
        return { data:{ ok:true, correct:body.rawAnswer === 'leisure' } };
      } }
    };
    export async function getSupabaseClient() { return client; }
  ` }));
  await page.goto('http://127.0.0.1:4173/vocabulary.html');
  await page.locator('[data-action="open-unit"][data-unit="1"]').click();
  await page.locator('[data-action="open-pathway"][data-pathway="context"]').click();
}
