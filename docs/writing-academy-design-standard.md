# Creative Editorial — Writing Academy design standard
Reference implementation: Review / Structure & Organisation. Do not scale to other pathways until reviewed.
Audience: secondary students aged 14–17. A contemporary magazine-inspired learning studio, not a game or digital worksheet. Use confident typography, ink #142D48, teal #139D99, amber #F5B335, coral #ED6947, violet #7953C7, cream #FFF5E6. Use darker ink on bright surfaces for contrast. Original editorial illustrations, expressive geometric shapes, cultural relevance, no generic clip art or unnecessary animations. Keep writing editors calm.
## Interaction contract
Discover → Explore → Practise → Apply → Master. One active stage, one task at a time, explicit navigation, previous/next, immediate meaningful explanations. Keep a compact Cambridge 0511 reminder accessible on each stage, expandable blueprint/checklist. Model selector and one paragraph at a time, reveal annotations through active identification. Allow full model reading separately. Preserve session work when navigating stages; report actual completed stages, not visits or clicks. Practice completion is not Cambridge mastery or a grade. No invented data, rewards, or competition. Open responses receive self-check and comparison, not fake automatic assessment.
## Reuse and quality
Shared stage shell, activity runner, model explorer, response comparison and scoped CSS tokens; content data separate. Keyboard-accessible controls, focus on stage heading, normal document scroll, no horizontal overflow, reduced-motion support. Check desktop 1440, tablet 768, phone 390, landscape 1024×600. Test actual interactions and preserve staff gate. Do not discard educational requirements or original models. Persistent student progress, AI integration and account-synced drafts require separate release gates. Artwork assets should be original, optimised and replaceable. Staff preview is not student rollout.

## Editorial artwork

Use the registry in `src/writing/ui/editorial-art.js` for hero, pathway and stage art. The lesson shell takes a pathway artwork configuration and uses the stage position to select its illustration. Apply shares Practise artwork in the reference pathway. All art is decorative, with an empty alternative text. Keep useful text and controls in HTML.

The six original RGB PNGs in `assets/writing/` are 1536 × 1024. Their checkerboard is baked into the pixels. Keep these originals for editing and use the alpha WebPs for layout. The derivatives use a 3:2 aspect ratio, preserve the original composition, and remove the neutral checkerboard with a softened edge mask.

| Placement | WebP widths | Layout |
| --- | --- | --- |
| Academy hero | 384, 768, 1152 px | Side by side with the headline on larger screens, below the primary action on phones. Maximum 545 px display width. |
| Pathway card and banner | 256, 512 px | 144 px in the card and 96–136 px beside the lesson title. |
| Active stage | 256, 512 px | 246 px beside the activity on desktop, 180 px on tablet portrait and 120 px beside the stage heading on phones. |

The browser uses `srcset` to pick a size. The hero is prioritised, the card illustration is lazy-loaded, and the shell mounts only the current stage’s illustration. Use intrinsic dimensions and contain the full image. Keep stage art beside the learning content, with the activity spanning the full card below the heading on narrow screens.

## Studio workspace

Use `renderWorkspace` in `src/writing/ui/studio.js` for the Plan, Write and Review sequence. The Review entry point supplies tasks, stable planning field keys, level-specific language support, the checklist, word range and reference content. The draft engine scopes local storage to the account, task and task version. Plan and answer are separate fields. Review captures the first non-empty answer once and retains that snapshot through subsequent edits. Future genres can supply their own content and will need their own planning keys and draft compatibility checks.

| Placement | WebP widths | Layout |
| --- | --- | --- |
| Studio banner | 160, 320, 640 px | Neon Focus at 220 px beside the headline, 166 px on short landscape screens and up to 132 px on phones. |
| Studio context | 96, 192, 384 px | Creative Flow beside the Plan and Review headings at 88 px, or 68 px on phones. |

The Studio originals are square 1254 × 1254 RGB PNGs. Keep their coloured backgrounds in every derivative. The registry declares intrinsic dimensions and responsive candidates for each placement. Studio colour tokens extend the Academy palette on the banner and stage controls. Use a light surface for the editor and reserve colour for hierarchy and status.

From 700 px wide, the companion takes the narrower column. It stays within reach during page scrolling. Below 700 px, the companion starts collapsed above the workspace, with the task name visible as students scroll. Focus mode expands the editor and keeps the full exam task available on demand. Planning cards switch to one column on phones. Revision drafts share a row where space allows.

The editor counts the answer box only. A title is optional and counts if entered in the answer. The meter shows where the answer lands relative to 120–160 words. Staff preview uses self-assessment and local revision comparison.
