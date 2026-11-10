// Unit background themes: purely decorative page-edge artwork behind the activity screens.
//
// To theme another unit: add `<unitNumber>: '<theme id>'` below, drop its seamless repeating wallpaper SVG in assets/vocabulary/themes/
// (<id>-wallpaper.svg) and add one `--unit-wallpaper` line for the id in vocabulary-unit-themes.css. No activity screen needs editing.
// Units without an entry keep the plain background. This file never reads or changes progress, scoring or saved state.
export const UNIT_THEMES = Object.freeze({
  1: 'sports-free-time',
  2: 'digital-life',
  3: 'food-and-drink',
  4: 'transport',
  5: 'holidays',
  6: 'learning-study-skills'
});

export function unitThemeId(unitNumber) {
  return UNIT_THEMES[Number(unitNumber)] ?? null;
}

// Attribute string for a screen's root element ('' when the unit has no theme).
export function unitThemeAttr(unitNumber) {
  const id = unitThemeId(unitNumber);
  return id ? ` data-unit-theme="${id}"` : '';
}

// Unit OVERVIEW pages (the screen with the six pathways) are a separate, larger illustration, not the repeating activity wallpaper.
// Units 1 to 6 so far. A new overview needs one line here, an `<id>-overview.svg` in assets/vocabulary/themes/ and one `--unit-overview` line in the CSS.
export const UNIT_OVERVIEW_THEMES = Object.freeze({ 1: 'sports-free-time', 2: 'digital-life', 3: 'food-and-drink', 4: 'transport', 5: 'holidays', 6: 'learning-study-skills' });
export function unitOverviewAttr(unitNumber) { const id = UNIT_OVERVIEW_THEMES[Number(unitNumber)]; return id ? ` data-unit-overview="${id}"` : ''; }
