# Cambridge IGCSE 0511 writing assessor — teacher research prototype

**Status:** experimental, offline from the Hub, not deployed to Cloudflare, not safe for real student assessment.

This folder contains a two-stage Cloudflare Workers AI prototype. Stage 1 extracts exact text evidence about review task fulfilment, vocabulary/structures and possible language errors; the application discards any supposed quote not found verbatim in the essay. Stage 2 receives this filtered evidence and estimates Content (0–6) and Language (0–9) using paraphrases of the official 2024 specimen band descriptors. The final validator discards unsupported quotations, stops obvious false claims about missing food/recommendations, checks marks are valid and withholds the mark if it lacks basic grounded support.

The safeguards reduce some errors but **do not prove marking accuracy**. A model can still produce incorrect judgements in prose, and a quote's presence does not prove a criticism is valid. Any actual language errors require human verification. Do not present scores as official Cambridge grades. No letter-grade conversion.

## Sources

- Cambridge 0511 2027–2029 syllabus: https://www.cambridgeinternational.org/Images/721343-2027-2029-syllabus.pdf — Exercises 5 and 6: 120–160 words, Content 6, Language 9.
- Cambridge 0511 2024 specimen Paper 1 mark scheme: https://www.cambridgeinternational.org/Images/637289-2024-specimen-paper-1-mark-scheme.pdf — Content bands 5–6 / 3–4 / 1–2 and Language 7–9 / 4–6 / 1–3.
- Mark-scheme and paper-year alignment must be reconfirmed before classroom deployment.

## Run regression tests

```sh
node --test assessor-prototype/worker.test.mjs
```

The GitHub workflow `.github/workflows/assessor-prototype-tests.yml` runs these for changes in this folder.

## Cloudflare configuration (future teacher-only testing)

Copy `worker.js` to the **existing** `igcse-writing-assessor` Worker in a controlled deployment after tests pass, keeping the existing `AI` binding and `ASSESSMENT_TEST_KEY` secret. Do **not** deploy automatically. There is no live assessment integration in this commit. `GET /` is a harmless status response. `POST /teacher-test` requires the secret and always uses the **hard-coded fictional restaurant sample**; the request body is ignored and student submissions are not accepted. The secret must be rotated because the earlier testing key was exposed in chat/screenshots.

The model is `@cf/meta/llama-3.1-8b-instruct-fp8-fast`. The pipeline makes **two AI calls** per test and consumes free-tier capacity. There is no automatic paid upgrade built into the code. No student names, emails or writing are transmitted by this prototype. Responses are explicitly not cached and errors avoid logging writing, secrets and model output.

## Before any student-facing use

1. Obtain several teacher-marked responses spanning low, mid and high quality and independently compare Content and Language band agreement.
2. Verify fabricated-claim rate and language-error precision, not just average mark agreement; adjust or reject the model if too weak.
3. Implement authenticated per-student requests, server-side throttling/quotas, privacy review, and assessment opt-in; **never** distribute `ASSESSMENT_TEST_KEY` to browsers.
4. Decide how to handle availability/quotas without fabricated results, and provide a teacher review/override mechanism.
