# Cambridge IGCSE 0511 writing assessor — teacher research prototype

**Status:** experimental teacher-only prototype, separate from the Hub. These changes have not been deployed or tested against the live Cloudflare account. Not validated for real student assessment.

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

The model is `@cf/meta/llama-3.3-70b-instruct-fp8-fast`. The pipeline makes **at most two AI calls**, capped at 900 and 1,100 output tokens. Failed extraction stops grading. There are no automatic retries, alternative models, paid providers or AI Gateway billing. No student names, emails or writing are transmitted by this prototype. Responses are explicitly not cached and errors avoid logging writing, secrets and model output.

### Failure investigation and repair (2026-11-05)

The original implementation requested unconstrained text from `llama-3.1-8b-instruct-fp8-fast`; malformed/truncated JSON therefore caused `invalid_ai_json`. A later repair enabled JSON Mode and selected `llama-3.1-8b-instruct`. **That model's current documentation redirects to the unavailable-model catalog.** The JSON Mode guide still lists it, so that guide alone is insufficient to choose a model. The prior unit tests accepted any model name and did not detect this incompatibility.

The replacement above is present in both the current catalog and JSON Mode guide. It accepts `messages`, `temperature: 0`, bounded `max_tokens` and `response_format: {type: "json_schema", json_schema: <direct schema>}`. Streaming is explicitly disabled: JSON Mode does not support it. The parser already handles object responses, JSON text and complete JSON fences; truncated JSON is never repaired or converted into invented marks.

Schemas now bound marks, strings and feedback arrays. The same schema subset is validated locally before evidence proceeds to grading. Incomplete evidence/error envelopes fail closed. Numeric Cloudflare error codes distinguish unavailable models, permissions, paid-plan requirements, quota/capacity and timeouts; arbitrary error text/codes are never echoed. Cloudflare explicitly warns that JSON Mode can fail to satisfy a schema. Such a failure still withholds the mark rather than silently falling back to unconstrained generation.

Evidence limitation: the unavailable model and failure paths were reproduced with synthetic binding responses, **not live account logs**. Historical error names alone cannot prove whether a particular deployed request hit unavailable-model, permission, quota or schema errors. Live account access and a post-approval deployment/smoke check are still needed to confirm runtime health.

### Protected diagnostics after an approved deployment

Use the existing secret in the `X-Assessment-Test-Key` header, never in a URL, frontend code, screenshot or committed command. Both probes ignore bodies and contain no essay:

- `POST /diagnose`: one 20-token plain-text model-access probe.
- `POST /diagnose?mode=json`: one 32-token structured-output probe using the same model/request helper as assessment. A valid `ready: true` object is required.
- `POST /teacher-test`: the fixed fictional review only; verifies both assessment stages.

A successful plain-text probe alone does **not** establish JSON Mode health. Neither probe proves marking accuracy. Keep real writing out of this prototype.

### Free allowance boundary

Cloudflare currently includes **10,000 Neurons per account per day**, resetting at 00:00 UTC. This model is not listed among models requiring paid billing. On **Workers Free**, further AI requests fail when the allowance is exhausted; this code fails closed and never upgrades or retries. Other Workers in the same account share that allowance. Each two-stage test consumes input tokens as well as up to 2,000 output tokens; it is not an unlimited free assessment service.

**Before approving deployment, confirm that the existing account is on Workers Free and review its remaining daily usage.** On Workers Paid, Cloudflare charges above the allowance: these per-request bounds are not an account-wide spending cap. No account plan, billing, secret or deployment setting was changed here.

Sources checked:

- [Current model catalog](https://developers.cloudflare.com/workers-ai/models/?unavailable=llama-3.1-8b-instruct)
- [Replacement model and request parameters](https://developers.cloudflare.com/workers-ai/models/llama-3.3-70b-instruct-fp8-fast/)
- [JSON Mode compatibility, schema shape and limitations](https://developers.cloudflare.com/workers-ai/features/json-mode/)
- [Free allowance and model pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Cloudflare error codes](https://developers.cloudflare.com/workers-ai/platform/errors/)

## Before any student-facing use

1. Obtain several teacher-marked responses spanning low, mid and high quality and independently compare Content and Language band agreement.
2. Verify fabricated-claim rate and language-error precision, not just average mark agreement; adjust or reject the model if too weak.
3. Implement authenticated per-student requests, server-side throttling/quotas, privacy review, and assessment opt-in; **never** distribute `ASSESSMENT_TEST_KEY` to browsers.
4. Decide how to handle availability/quotas without fabricated results, and provide a teacher review/override mechanism.
