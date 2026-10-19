const UNIT_ART = Object.freeze({
  1:Object.freeze({ src:'assets/vocabulary-study/sports-free-time.svg', alt:'Student running outdoors with sports equipment' }),
  2:Object.freeze({ src:'assets/vocabulary-study/digital-life.svg', alt:'Laptop and mobile devices representing digital life' }),
  3:Object.freeze({ src:'assets/vocabulary-study/travel-tourism.svg', alt:'Aeroplane travelling above mountains and clouds' }),
  4:Object.freeze({ src:'assets/vocabulary-study/environment.svg', alt:'Trees, hills and a clean natural landscape' }),
  5:Object.freeze({ src:'assets/vocabulary-study/education.svg', alt:'Graduation cap, books and study materials' })
});

const ACHIEVEMENT_ART = Object.freeze({
  completion:Object.freeze({ src:'assets/vocabulary-study/achievement-trophy.svg', alt:'Trophy celebrating session completion' }),
  stage_advanced:Object.freeze({ src:'assets/vocabulary-study/achievement-stage.svg', alt:'Progress badge celebrating a newly unlocked stage' }),
  mastered:Object.freeze({ src:'assets/vocabulary-study/achievement-mastery.svg', alt:'Gold mastery badge with a crown' })
});

export function unitArtwork(unitNumber) {
  return UNIT_ART[Number(unitNumber)] ?? null;
}

export function achievementArtwork(kind) {
  return ACHIEVEMENT_ART[kind] ?? null;
}
