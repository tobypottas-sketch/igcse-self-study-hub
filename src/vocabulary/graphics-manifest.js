// The ONE list a person edits when a final PNG illustration is added to the repo.
//
// Put the file at the canonical path (see graphics-registry.js, e.g. assets/vocabulary/pathways/meaning.png) and add its
// path, relative to assets/vocabulary/, to this list. Nothing else changes: the views, CSS and tests pick it up. Until a
// path is listed here the built-in inline artwork is used and the browser makes no request for the missing file.
//
//   'units/unit-01.png', 'units/unit-02.png', 'units/unit-03.png', 'units/unit-04.png', 'units/unit-05.png'
//   'pathways/meaning.png', 'pathways/context.png', 'pathways/word-families.png',
//   'pathways/paraphrasing.png', 'pathways/precision-use.png', 'pathways/spelling-recall.png'
export const SHIPPED_PNG = Object.freeze([
  'units/unit-01.png', 'units/unit-02.png', 'units/unit-03.png', 'units/unit-04.png', 'units/unit-05.png',
  'pathways/meaning.png', 'pathways/context.png', 'pathways/word-families.png',
  'pathways/paraphrasing.png', 'pathways/precision-use.png', 'pathways/spelling-recall.png'
]);
