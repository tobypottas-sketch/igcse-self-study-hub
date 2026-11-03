# Vocabulary Class Card Illustrations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visible but restrained academic illustrations to the Vocabulary teacher class cards without changing their data or navigation behavior.

**Architecture:** Keep `renderClassChooser()` unchanged. Add one chooser-only stylesheet loaded after the existing Vocabulary styles. Use CSS pseudo-elements and three cycling inline SVG data illustrations so the artwork is decorative, non-interactive, and isolated from other teacher screens.

**Tech Stack:** HTML, CSS, inline SVG data URLs, Node test runner.

**Spec:** Approved in conversation: keep the current pastel cards/layout/count/CTA; add larger subtle academic line art with 2–3 variants; decorative only; no external image assets or dependencies.

## Global Constraints

- Preserve `teacher-open-class`, `data-class-id`, student counts, analytics navigation, permissions, loading, and backend contracts.
- No Supabase/schema/data changes and no private learning data.
- Keep artwork restrained and academic, not cartoonish.
- Maintain the existing 3 / 2 / 1 responsive chooser layout.

## Review Focus

- Illustration layer must not intercept clicks.
- Card text and CTA must remain readable above artwork.
- All three illustration variants must be present.
- Mobile cards must not become cramped.
- Styling must remain scoped to `.vocab-class-chooser`.

---

### Task 1: Decorative illustration layer

**Files:**
- Create: `tests/vocabulary-class-card-illustrations.test.js`
- Create: `vocabulary-class-illustrations.css`
- Modify: `vocabulary.html`

**Interfaces:**
- Consumes: existing `.vocab-class-chooser` and `.vocab-class-card` markup.
- Produces: decorative `::after` illustration layer with three `nth-child` variants.

- [ ] Write a failing test for stylesheet loading, scoped card artwork, three variants, and `pointer-events:none`.
- [ ] Verify the test fails because the stylesheet is not yet linked/implemented.
- [ ] Add the chooser-only stylesheet link to `vocabulary.html`.
- [ ] Implement three restrained academic SVG data illustrations and responsive placement.
- [ ] Run the focused test and full `npm test` suite.
- [ ] Inspect the branch diff and open an unmerged PR.