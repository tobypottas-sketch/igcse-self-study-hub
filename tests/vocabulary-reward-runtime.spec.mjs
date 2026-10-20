import { test, expect } from 'playwright/test';

test('ten-question pathway set reaches a genuine Session Complete reward state', async ({ page }) => {
  const { mockVocabularyStudent } = await import('./fixtures-vocabulary-student.mjs');
  const { default:unit } = await import('../content/vocabulary/releases/unit-01.js');
  const { planPathwayQuestion } = await import('../src/vocabulary/pathway-planner.js');
  const content = {...unit,itemsById:Object.fromEntries(unit.items.map(row => [row.vocabularyId,row])),contextsByOccurrence:{}};
  for (const row of unit.contexts) (content.contextsByOccurrence[row.occurrenceId] ??= []).push(row);

  await mockVocabularyStudent(page,'continue');
  for (let i = 0; i < 10; i++) {
    const target = unit.occurrences[i];
    const question = planPathwayQuestion({content,target,pathwayId:'context',stageId:'recognise',seed:`${target.occurrenceId}:${i}:adaptive`}).question;
    const answer = question.markingReference.acceptedAnswers[0];
    await page.locator(`[data-choice-answer=${JSON.stringify(answer)}]`).click();
    await expect(page.locator('.vocab-feedback')).toContainText('Correct');
    await page.locator('[data-action="next-question"]').click();
  }

  await expect(page.locator('[data-study-completion="session_complete"]')).toBeVisible();
  await expect(page.locator('h1')).toHaveText('Session complete');
  await expect(page.locator('[aria-label="3 stars"]')).toBeVisible();
  await expect(page.locator('.vocab-session-evidence')).toContainText('10 / 10');
  await expect(page.locator('[data-action="back-unit"]')).toContainText('Finish for now');
  await expect(page.locator('[data-action="continue-practice"]')).toHaveText('Continue');
  await expect(page.locator('[data-vocab-sync-warning]')).toHaveCount(0);

  await page.locator('[data-action="continue-practice"]').click();
  await expect(page.locator('[data-form="vocabulary-answer"]')).toBeVisible();
});
