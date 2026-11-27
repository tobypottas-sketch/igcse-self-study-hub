export async function saveVocabularyMerits(client, actorId, studentId, meritNumbers) {
  const records = [...new Set(meritNumbers)].map(meritNumber => ({
    student_id:studentId, merit_number:meritNumber, awarded_by:actorId
  }));
  if (!records.length) return;
  const { error } = await client.from('vocabulary_merit_awards').upsert(records, {
    onConflict:'student_id,merit_number', ignoreDuplicates:true
  });
  if (error) throw error;
}
