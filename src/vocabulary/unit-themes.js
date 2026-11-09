// Unit background themes: purely decorative page-edge artwork behind the activity screens.
//
// To theme another unit: add `<unitNumber>: '<theme id>'` below, drop its seamless repeating wallpaper SVG in assets/vocabulary/themes/
// (<id>-wallpaper.svg) and add one block for the id in vocabulary-unit-themes.css. No activity screen needs editing.
// Units without an entry keep the plain background. This file never reads or changes progress, scoring or saved state.
export const UNIT_THEMES = Object.freeze({
  1: 'sports-free-time'
});

export function unitThemeId(unitNumber) {
  return UNIT_THEMES[Number(unitNumber)] ?? null;
}

// Attribute string for a screen's root element ('' when the unit has no theme).
export function unitThemeAttr(unitNumber) {
  const id = unitThemeId(unitNumber);
  return id ? ` data-unit-theme="${id}"` : '';
}
