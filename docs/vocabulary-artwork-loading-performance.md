# Vocabulary artwork delivery performance — 19 November 2026

## Diagnosis

Measurement baseline: main `9089b0f8b0472ff59a5af81a262dc216aaa2540f`. Branch subsequently rebased onto `f9a126f2eff8079979c1313743baf0e146c71877`.

Current main added emergency classroom light-artwork mode during this investigation. Its default (SVG galleries and one selected-unit PNG hero) is preserved. Full-gallery browser tests/benchmarks explicitly use `?fullart=1`; the before/after figures below compare that original full-artwork experience. The optimized selected-unit hero also applies in default mode. This PR does not re-enable suppressed gallery PNGs by default.

The eight unit originals total about 12.24 MB; the six pathway originals add about 2.49 MB. Those full-size images were requested for small, fixed illustration slots. Cold-cache throttled transfers dominated readiness: Unit 1 and six pathways took about 19 seconds at 1.6 Mbps, while the same images in a fresh warm-cache reload transferred zero bytes. Post-load decode checks were tens of milliseconds, not seconds. This is principally a delivery-volume problem.

The public Unit 1 image returned HTTP 200, `Content-Type: image/png`, `Cache-Control: max-age=600`, an ETag and byte-range support. The registry uses stable URLs, with explicit revisions for replaced originals. No service worker was found. A live 14-image CDN probe timed out after 180 seconds on this testing connection; there is no successful live after-deployment measurement in this report.

The existing CSS already keeps available SVGs visible until the image is ready. Units 6–8 have no authored inline unit SVG, explaining their blank slots while awaiting a large file. No SVG is invented, removed or hidden by this change.

## Narrow fix

- Retain every original PNG, SVG, crop/position rule, image slot and accessibility attribute.
- Add content-hashed WebP delivery candidates: unit widths 640/960 and pathway width 512. The 22 files are resized derivatives encoded **losslessly**, not replacements for the originals.
- Browser `sizes` account for the full panoramic image needed behind a square crop; using only the tile width would visibly undersupply pixels.
- Keep the original PNG as `img.src` and the largest-width candidate. High-DPR selection is tested, and unsupported WebP browsers retain PNG delivery. Very high-DPR requests may intentionally remain larger to preserve quality.
- Make only the first two home illustrations eager/high-priority; keep later cards lazy. Unit heroes are eager/high-priority. Keep asynchronous decoding.
- Preserve the existing cached-image reuse; copy the target slot's loading priority when moving an old home image into a hero.
- A failed optimized source falls back once to the original; an original failure uses the existing SVG/session-failure handling. An already-selected original does not get a second runtime attempt.

No CSS, progress, question content, assessment, auth, XP, rewards or Supabase changes.

## Browser measurements

Actual renderer, page styles, runtime and artwork were served on localhost with the observed 600-second image cache policy. Synthetic unit titles/progress only; no account or student data was fetched. Images below the fold were scrolled into view instantly, one animation frame per slot, so these measurements cover **all requested illustrations**, not homepage first paint or login/data-fetch latency. The browser render-start marker precedes `innerHTML`; timing ends when all artwork has loaded. The unchanged 220 ms fade is not added to these load timings.

Desktop: 1280×900 at 1×, no artificial CPU/network limit. Mobile: 390×900 at 2×, 4× CPU slowdown, 1.6 Mbps download and 150 ms latency through Chrome DevTools Protocol. Each condition uses a fresh context for cold cache and a reload for warm cache. These are individual controlled samples, not field percentiles or a device SLA. Transferred bytes include response headers. All warm runs transferred **zero artwork bytes**.

| Scene | Viewport / DPR | Cold before → after | Warm before → after | Cold artwork transfer |
|---|---|---|---|---|
| Homepage: Units 1–8 | 1280px / 1× | 0.230s → 0.182s | 0.302s → 0.154s | 12.25 → 2.49 MB |
| Homepage: Units 1–8 | 390px / 2× | 61.565s → 12.796s | 0.192s → 0.186s | 12.25 → 2.49 MB |
| Unit 1 + six pathways | 1280px / 1× | 0.174s → 0.153s | 0.124s → 0.139s | 3.81 → 0.92 MB |
| Unit 1 + six pathways | 390px / 2× | 19.250s → 6.158s | 0.175s → 0.172s | 3.81 → 1.19 MB |

The robust regression contracts are selected-resource byte budgets, original-file hashes, decoded pixel equivalence, request priority, warm-cache zero transfers, all eight unit transitions, all six pathways, fallbacks and unchanged geometry. Wall-clock thresholds are deliberately not used as flaky CI assertions.

## Verification

- Nine new tests and two existing classroom-mode guards passed with zero failures/skips: actual-artwork desktop/mobile rendering, cold/warm cache, all eight units and six pathway images, high-DPR original selection, priority on reused heroes, delivery failures and lossless pixel checks for all 22 variants.
- Existing graphics geometry checks passed at 1280, 820 and 390px; existing missing-file, home-crop and reduced-motion cases passed.
- Existing test setup was corrected to match versioned router URLs, ignore unrelated theme SVG requests in the empty-PNG-manifest check, supply unrelated support-image fixtures, and accept selected delivery candidates as well as originals.
- Three legacy assertions also fail on unchanged main: Unit 6's original 2.94 MB PNG violates an old 1.5 MB source-file budget; the old slow-load test expects SVGs hidden despite current main CSS showing them; the legacy mission fixture times out waiting for a question. These were reproduced on both the measurement baseline and rebased current main with the same test bootstrap. No source PNG, CSS or progression logic was changed to force them green.
- Rebased verification totals: 24 passed, 3 baseline failures, 0 skipped/cancelled across 27 focused graphics/classroom tests.
- Original PNGs were verified byte-for-byte against the baseline Git blob hashes. Resized candidates were decoded and compared to the resized originals: every visible RGB pixel and alpha value matched.
- Browser screenshots were captured outside Git for home/overview art at desktop/mobile widths. No screenshots, student data, local dependencies or runtime logs are committed.

The full repository suite was not used to diagnose this image-only issue. Live post-deployment delivery and non-Chromium browsers remain unverified. Nothing was deployed or merged.

## Reproduction

Install isolated tools outside the repository; no project runtime dependency is added:

```sh
npm install --prefix /tmp/vocab-art-tools --no-audit --no-fund playwright@1.58.2 sharp@0.34.5
export NODE_PATH=/tmp/vocab-art-tools/node_modules
export CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
node --test tests/vocabulary-artwork-delivery.test.js tests/vocabulary-artwork-loading.browser.test.js
node --test tests/vocabulary-graphics-registry.test.js tests/vocabulary-graphics-browser.test.js
```

Generate candidates only after intentionally changing an original:

```sh
node scripts/generate-vocabulary-artwork.mjs
```

This reads source PNGs without modifying them, writes content-hashed derivatives and updates `graphics-delivery.js`. Source-hash tests reject stale generated metadata.

Use the same benchmark against a baseline checkout and this branch:

```sh
ART_ROOT=/absolute/path/to/baseline ART_UNIT=0 node scripts/benchmark-vocabulary-artwork.mjs
ART_UNIT=0 node scripts/benchmark-vocabulary-artwork.mjs
ART_ROOT=/absolute/path/to/baseline ART_UNIT=1 node scripts/benchmark-vocabulary-artwork.mjs
ART_UNIT=1 node scripts/benchmark-vocabulary-artwork.mjs
```

`ART_UNIT=0` renders all eight home cards; `1` renders Unit 1 and all six pathways. Optional `ART_PROFILE=desktop` or `mobile` isolates one condition. Output is JSON lines containing CDP request timings/transfer sizes, cache condition and render-to-loaded timing. Use sequential runs without competing browser tests when comparing timings. Never substitute these synthetic image-only timings for a production end-to-end navigation claim.
