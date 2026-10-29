-- Return the post-settlement, student-owned Set snapshot with the mission result.
-- The existing recorder still validates/scores attempts and runs the unchanged Set transition/close triggers.
-- No mission is issued here: start_vocabulary_mission retains its locking, resume and next-Set intent rules.
create or replace function public.record_vocabulary_mission_with_sets(p_mission_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_mission jsonb;
  v_sets jsonb;
begin
  v_mission := public.record_vocabulary_mission(p_mission_id);
  -- Same read-only fields as loadPathwaySets. RLS still applies, with an additional explicit ownership predicate.
  -- This executes after all settlement triggers, in the same transaction; failures roll the recording back too.
  select coalesce(jsonb_agg(to_jsonb(s) order by s.pathway_id, s.set_number), '[]'::jsonb) into v_sets
  from (
    select unit_number, pathway_id, set_number, stage, phase, status,
           completed_stages, weak_target_ids, advanced_with_support, support_flags
    from public.vocabulary_pathway_sets
    where student_id = (select auth.uid()) and unit_number = (v_mission->>'unit_number')::integer
  ) s;
  return v_mission || jsonb_build_object('pathway_sets', v_sets);
end;
$$;

revoke all on function public.record_vocabulary_mission_with_sets(uuid) from public, anon;
grant execute on function public.record_vocabulary_mission_with_sets(uuid) to authenticated;
