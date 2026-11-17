# Review Writing AI feedback — Worker quality upgrade (implementation handoff)

**Scope:** Cloudflare Worker `igcse-writing-assessor.toby-pottas.workers.dev/feedback`, for `app:"review"` only. **Do not change scoring, quotas, authentication, privacy handling, or the existing student interface in this task.**

## Confirmed Hub contract (17 November 2026)
- Hub sends `{app:"review", task, response, privacyNoticeAccepted:true}` to the Worker, with signed-in student's bearer token. `response` is a plain-text join of the four Review Writing sections separated by blank lines.
- The Hub expects `{feedback:{partial:boolean,strengths:[{quote,advice}],improvements:[{quote,advice,type,suggestion}],nextStep,lengthNotice,scores:{content,language,total}}}`.
- Accepted scores: integer Content 0–6, Language 0–9, Total exactly their sum (0–15), **AI estimate only**.
- `strengths` displayed: first item only. `improvements` displayed: first two only. Every item must contain a nonempty `quote` and `advice` to be displayed. `quote` is expected to be exact text from the student's draft. `type:"error"` with a nonempty suggestion displays a Before → After correction; `type:"style"` offers an optional revision.
- `nextStep` is displayed as a separate short blue action card. No extra response fields are shown by the current Hub.
- The frontend does NOT independently validate the quotes against the draft; the Worker must do so.

## Required improvement (prompt + response validation, Worker-side)
Produce actionable, *evidence-based* feedback rather than generic exam-writing advice. Students need to understand what to change in their own text.

1. Evaluate the **specific review task and complete student draft**. Apply the applicable 0511 review-writing Content (/6) and Language (/9) marking principles. Respect the task's audience, purpose and given prompts; do not assume every review is of a restaurant.
2. Select **one real strength**: an exact, reasonably short quote from the draft plus one sentence describing *why* that exact feature helps the reader.
3. Select **one or two highest-value improvements**:
   - Each uses a precise substring from the student's draft (exact quote; no invented text or paraphrase in the `quote` field).
   - Provide one *concrete* revised example in `suggestion` whenever a safe, meaningful change is possible.
   - Provide one short explanatory `advice` sentence directly tied to the change: what it improves in relation to purpose, audience, clarity, specificity or language control.
   - Prioritise missing development, unsupported evaluation, specificity, task coverage, organization and imprecise wording as appropriate; fix grammar only when an actual error appears.
   - For a factual/grammatical mistake, `type:"error"`. For a defensible optional enhancement to already-correct writing, `type:"style"`. Never label optional improvements as errors.
4. One *specific, executable* `nextStep`: e.g., “In your recommendation, name who would enjoy the venue and give one reason.” Avoid phrases such as “add more detail” or “use better vocabulary” without identifying where and how.
5. **Do not manufacture two corrections**. When only one justified improvement exists, return one. If none are reliable, return an empty improvement array rather than a fabricated correction, with a concrete next step only where supported.
6. Use compact language: advice and next step ideally one sentence each, ESL-friendly (Grade 9–11), minimal terminology. Do not explain the same issue in both a correction and `nextStep`.
7. Keep scores independent of the number of corrections. A comparatively high score may still have useful development opportunities; a perfect response need not have grammatical corrections.
8. **Evidence gate:** before returning, verify every `quote` is an exact substring of the supplied `response` (allow safe whitespace normalization only if retaining a mappable original excerpt). Remove unsupported items. Keep `suggestion` feasible and tied to the quoted words, not an unrelated model answer.
9. Preserve the Worker’s existing auth, PII protections, quotas, token/cost limits, and response JSON schema. Never log students’ raw writing or send identifiable details to telemetry.
10. If AI output is malformed, do not force an invented response. Use the existing safe partial-feedback response where appropriate.

## Prompt instruction fragment (adapt to actual Worker prompt, not a standalone replacement)
“Provide **one precise strength and up to two high-impact improvements anchored to the student's actual words**. For each improvement, return their exact short quote, a feasible improved version, and one sentence explaining how this helps their review. Prioritise improvements that make evaluation and recommendation more convincing. Identify genuine errors accurately; mark optional enhancements as style, never as grammar errors. Never invent a quote, error or task requirement. End with one concrete revision action, not generic advice. Use clear, concise Grade 9–11 ESL language. Respect the provided review task, and do not alter existing /6 Content or /9 Language scoring scales.”

## Validation matrix
- **Accurate grammar, thin evaluation:** a style improvement anchored to the student's unsupported opinion; no fictitious grammar mistakes.
- **Genuine sentence-level error:** `type:"error"` and a correction that fixes the actual problem.
- **Poor task fulfilment:** feedback addresses the specific missing criterion; does not invent a restaurant/film/book context.
- **Well-developed high-score review:** one genuine strength; only justified improvements; possible empty list.
- **Short/partial draft:** do not hallucinate missing content or award a full mark on insufficient evidence.
- **Invented or altered quotation:** reject the item before returning it to the Hub.
- **Length, privacy, budget:** unchanged safety gates; no additional model calls without a separate cost review.

## Important deployment limitation
The Cloudflare Worker source is **not contained in the accessible GitHub repositories**. This file is a precise implementation/QA handoff, **not a production change**. Locate the original Worker project and inspect its prompt, model response parser, and evidence validator before editing. Do not deploy a replacement Worker based solely on these instructions.

## Acceptance standard
On a representative set of authentic, anonymised review drafts, at least one actionably grounded improvement should be provided whenever supported. Test teacher-judged task coverage, quote fidelity, optional vs genuine error labels, score consistency, and concise display. A displayed score with no corrections is acceptable when justified; a fabricated correction is never acceptable.
