# Vocabulary Builder graphics

PNG illustrations sit **over** the existing inline SVG art. The SVG is the placeholder and the fallback; a PNG only appears once it is shipped and has loaded.

## Shipping a PNG
1. Drop the file at `assets/vocabulary/<path>` (names below).
2. Add that path (relative to `assets/vocabulary/`) to `src/vocabulary/graphics-manifest.js`.

Nothing else changes. Unlisted files cause no requests. A listed file that fails to load is removed silently, the SVG stays, and it is not retried this session.

## Files
| File | Size |
|---|---|
| `units/unit-01.png` | 1672×411 (as supplied) |
| `units/unit-02.png` | 2127×739 (as supplied) |
| `units/unit-03.png` | 2127×739 (as supplied) |
| `units/unit-04.png` | 2127×739 (as supplied) |
| `units/unit-05.png` | 2127×739 (as supplied) |
| `units/unit-06.png` (future: `unit-07.png` …) | 2127×739 (as supplied) |
| `pathways/meaning.png` | 1024×1024, transparent |
| `pathways/context.png` | 1024×1024, transparent |
| `pathways/word-families.png` | 1024×1024, transparent |
| `pathways/paraphrasing.png` | 1024×1024, transparent |
| `pathways/precision-use.png` | 1024×1024, transparent |
| `pathways/spelling-recall.png` | 1024×1024, transparent |

Layout notes: the unit hero shows the image at about 2.9:1 up to ~440px wide, anchored right (so the left edge may be trimmed: keep the key action in the centre/right); the home unit card shows a square 132px crop at ~46% across, so the main sport action should sit about 40-60% across the banner. Pathway art is shown contained in a ~176×156 corner slot (150×130 tablet, 104×88 phone): centred subject with padding.

## Shared art direction (prefix every prompt)
High-quality modern editorial illustration for a premium secondary-school education app. Mature Grade 9–11 visual style. Clean composition, refined geometric forms, believable proportions, subtle depth, soft contemporary colours, crisp edges, restrained detail, professional and intelligent rather than childish. No text, no logos, no labels, no watermarks, no clip-art aesthetic, no exaggerated cartoon faces, no stock-photo look. Designed to remain visually clear when displayed at small-to-medium UI sizes.

## Prompts
**Unit 1 banner (wide landscape, about 4:1 or 2:1):** [prefix] Scene: a mixed sports and free-time moment. Active side: tennis or badminton player mid-rally, a cyclist and a jogger. Quieter side: a student seated with a book and headphones. Subtle ball, racquet and sports bag props. Subjects grouped centre and right with generous breathing room on the left; no critical detail at the edges.

**Meaning (1024×1024, transparent background):** [prefix] Single centred object group: an open book or vocabulary page with one highlighted word, connected by a thin line to a definition card. Generous padding, no background.

**Context (1024×1024, transparent):** [prefix] A speech bubble or sentence strip with one highlighted word token and softer surrounding word cues. Centred, padded, no background, no readable text.

**Word Families (1024×1024, transparent):** [prefix] A central root card node branching to three or four related nodes. No people. Centred, padded, no background.

**Paraphrasing (1024×1024, transparent):** [prefix] Two speech bubbles linked by transformation arrows around one shared concept, reading left to right. Centred, padded, no background, no readable text.

**Precision & Use (1024×1024, transparent):** [prefix] Several word tiles, one selected and aligned to a target marker. Centred, padded, no background.

**Spelling & Recall (1024×1024, transparent):** [prefix] Letter tiles with one being placed, an ordered sequence emerging, a few decorative non-word letters. Not Scrabble-like. Centred, padded, no background.
