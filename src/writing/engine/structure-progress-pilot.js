import {previewStages} from './preview-progress.js';

export function createStructureProgressPilot(client) {
  return {
    async load() {
      const {data: enrolled, error: eligibilityError} = await client.rpc('writing_structure_pilot_enrolled');
      if (eligibilityError) throw eligibilityError;
      if (!enrolled) return null;

      const {data, error} = await client.from('writing_pathway_progress')
        .select('current_stage,revision_number')
        .eq('app_key','review_writing')
        .eq('curriculum_id','review')
        .eq('curriculum_version',1)
        .eq('pathway_id','structure')
        .maybeSingle();
      if (error) throw error;
      return data ?? {current_stage:'discover',revision_number:0};
    },
    async save(stage, expectedRevision) {
      if (!previewStages.includes(stage) || !Number.isInteger(expectedRevision) || expectedRevision<0) {
        throw new TypeError('Invalid writing pilot checkpoint');
      }
      const {data, error} = await client.rpc('save_writing_structure_pilot_stage',{
        p_stage:stage,p_expected_revision:expectedRevision
      }).single();
      if (error) throw error;
      return data;
    }
  };
}
