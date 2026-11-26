# R2.0 individual review checkpoint

Main and PR #712 were fetched. Main was at `b61eea18` and the active baseline still generated 347 activities. Microsoft SSO stayed on draft PR #709. The existing findings remain in place as preliminary observations. The individual records here supply a second pass for the items they cover.

Objective prompts, source and choices were read from an export that omitted answer keys and feedback. Letters refer to source option order and concatenated letters record sentence order. The notes record the selection reasoning, the review against the stored key and feedback, and the recommended resolution. A recorded match can still have a validity defect. Workshop review reads the requirement, response and checklist together. Status applies to pedagogical content and excludes learner testing and implementation.

## Proposed corrections for validity defects

**Robotics showcase · `pedagogy-q-019`.** The free robotics showcase is a five-minute walk from the bus stop. The demonstration runs from 4:30 to 5:00. The hands-on session runs from 5:15 to 5:40, and visitors need to stay until the end to finish building their robot. Your readers can arrive at 4:15 and have to catch the 5:30 bus. Which advice helps them finish an activity and catch the bus?

- Go to the demonstration. It ends at 5:00, leaving enough time to walk to the stop.
- Skip the demonstration and finish the hands-on session. It starts fifteen minutes before the bus leaves.
- Go to both and leave the hands-on session at 5:25. That gives you enough time to finish the robot and walk to the stop.

The first answer uses the finish time and the walk. The second focuses on start time and overlooks the finish. The third accounts for the walk but gives up finishing the activity. Use shared retry feedback to explain which constraint each option misses.

**Film recommendation · `pedagogy-extra-q-31`.** Your school film club wants a film with believable characters to discuss after watching. Members are happy with a slower story if it gives them interesting characters. This film has believable characters but a slow middle. Which recommendation uses both points to help the club decide?

- Try it for the believable characters. The middle is slow, but the characters are the part your group wants to discuss.
- Give it a miss. The performances are believable, but the slow middle makes it a better choice for watching at home.
- Wait for a faster film with equally believable characters. That way the club can discuss the performances without sitting through a slow middle.

The first answer weighs both observations against the expressed preference. The second makes pace more important than the preference the group expressed. The third postpones the choice in the hope of avoiding a drawback the club has already said it can accept. Before finalising the revised choices, use a second plausibility pass and check that the first choice does not stand out through phrasing or length.

For both items preserve the learning objective. A materially changed answer or scenario needs a new assessment version when implemented. Keep IDs for unchanged meaning and keep existing writing drafts separate from checked attempts.

## Continuation

The generated baseline is the source of exact activity IDs. The generator joins the reviews by question/task ID and emits all unresolved IDs, grouped by pathway and stage. Structure and Idea Development are covered. Begin with Vocabulary Discover, Explore and Practise, then the workshops and transfer checkpoint. Grammar, Editing and Exam follow. Review dispositions are provisional until the browser check and pathway-level progression pass. R2.0 remains in progress and the PR remains draft.

## Browser evidence

The existing preview browser suite passed with the unchanged staff profile gate exercised by its local simulated account and access-denial fixtures. It covered both preview routes at 1440, 1024, 768 and 390 pixels. This establishes local renderer behaviour. A real school account was not used. The screenshot set samples all six pathways and includes retry, ordering, annotation, recognition, writing and reflection.

- Structure ordering leaves selected sentences in shuffled screen positions with prefixed sequence numbers. At 390 px, the final display reads 2, 3, 1 top to bottom. Put the selected sentences into a separate, readable sequence with move controls.
- Idea Development Explore displays the source passage and prompt separately. A lengthy answer that does not make the target link still unlocks the editor’s note. Use the individual review to decide which items need checked recognition and which merit open writing and self-review.
- Grammar Explore displays only the prompt and a later editor’s note for the punctuation transformation. Put the original and revision side by side on wide screens and in reading order on smaller screens. Keep the word count separate from whether the punctuation works.
- Vocabulary Apply distinctly separates the brief and observations. Editing Gold distinguishes the example and revision field. At mobile width, the complete editing sequence takes several screens to read. Keep related evidence within reach when students move between drafting and the checklist.
- Exam mock reflection records checks and short reflections. Label this as self-review and keep its internal timing separate from official assessment requirements.

## Provisional implementation priorities

1. Repair the four critical Idea Development validity findings before interaction polish. Version material changes and preserve unaffected writing drafts.
2. Rewrite Structure’s Master grouping checkpoint to test evidence organisation for real readers, then supply the missing destination paragraphs for the two Silver items.
3. Specify when Discover and Explore are checked or self-reviewed, and show first-try, retry and supported outcomes separately. Use the Structure retry pattern where applicable.
4. Prototype structured plans and a visible sentence sequence. Keep keyboard selection and undo. Continue testing source/option wrapping at 390 px.
5. Adjust directions and models to make required facts, intended audiences, target lengths and self-review checks align. Finish the pending pathway audit before setting scope for R2.1 or R2.2.

Teacher judgement is needed about how many Explore models should be compulsory at each proficiency level, and whether optional investigations are suitable as homework. Representative learner trials should inform that decision. Defensible texts, complete scenarios and accurate feedback are editorial decisions.
