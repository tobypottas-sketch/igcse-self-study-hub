// UNIT AUTHORING TEMPLATE. Copy this file to units/unit-NN.js and replace the two EXAMPLE words with the unit's 50 targets.
// It is never published: the name does not match unit-NN.js, so the release tooling ignores it, and the words below are invented.
//
// Check your work at any time (needs no database):
//   node scripts/check-unit-authoring.mjs content/vocabulary/units/unit-NN.js
// It lists which pathways would be live and, for each that would not, how many more words need content and what each lacks.
// The numbers come from the real question builders and the readiness rules (content/vocabulary/pathway-readiness-rules.js), so the
// list never asks for more than the engine uses.
//
// WHAT EACH PIECE FEEDS (author only what the pathways you want live need):
//   meaning        meaning, paraphrases, distractors (>=3), meaningSentence, paraphrase/production sentences,
//                  masteryContexts (>=1, with the meaning each sentence shows), situationDistractors (>=3)
//   context        gap-fill sentences (retrievalContexts) with a reviewed gapDistractors row (3 wrong options) for each sentence you
//                  want to count; the language bank is optional extra depth
//   word_families  wordFamily forms + word_family writing_set activities
//   precision_use  improve_vocabulary writing_set activities
//   paraphrasing   phrase_set activities; idea_set activities (the pathway needs both kinds)
//   spelling       nothing required: plausible misspellings are generated. Reviewed misspellings (lexical-spelling-errors.js) are
//                  needed only for words the generator cannot cover; the check reports the real shortfall.
import { buildCuratedUnit } from '../build-unit.js';

const UNIT_NUMBER = 20; // template only: a real unit uses its own number from the unit registry
const status = 'draft'; // 'approved' once every word is final; the structural check is stricter for approved units

// e(term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence, paraphraseSource, paraphraseSentence,
//   productionSource, productionSentence, extras)
const e = (term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence, paraphraseSource, paraphraseSentence, productionSource, productionSentence, extras = {}) => ({
  term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence,
  paraphrase:{ source:paraphraseSource, sentence:paraphraseSentence },
  production:{ source:productionSource, sentence:productionSentence },
  ...extras
});

const entries = [
  e('assemble', 'verb',
    'to fit the parts of something together',                       // meaning: the dictionary-style definition
    ['put together', 'build from parts'],                           // paraphrases: accepted short equivalents
    ['take apart', 'repair', 'order online'],                       // distractors: >=3 wrong meanings (authored, never other words')
    'Students assemble the model from a kit of wooden pieces.',     // meaningSentence: the word in a natural sentence
    'put together', 'Students put together the model from a kit of wooden pieces.',   // paraphrase: same sentence, word swapped
    'build from parts', 'Workers build from parts the frames that arrive in boxes.',  // production: a second sentence in the swap
    {
      wordFamily:['assembly', 'assembler'],
      collocations:['assemble a team', 'assemble furniture'],
      grammarForms:{ base:'assemble', thirdPerson:'assembles', past:'assembled', pastParticiple:'assembled', ing:'assembling' },
      // Mastery: two sentences (the word in use) and the meaning each one shows. Needed for Meaning -> Mastery.
      masteryContexts:[
        { text:'The team will assemble at the gate at nine.', meaning:'gather in one place' },
        { text:'It took an hour to assemble the shelf.', meaning:'fit parts together' }
      ],
      // Meaning -> Apply: >=3 distinct, target-free sentences that are near-misses (never show the word, never also fit).
      situationDistractors:[
        'The workers took the old shelf apart and carried it outside.',
        'A mechanic fixed the broken part of the bicycle.',
        'She ordered a new desk from the shop and waited for the delivery.'
      ],
      // Context: gap-fill sentences. id = a short label you choose; target = the exact form blanked out of the sentence.
      retrievalContexts:[
        { id:'1', text:'The students assemble the model from wooden pieces.', target:'assemble', grammarPattern:'' },
        { id:'2', text:'It took the team an hour to assemble the stage.', target:'assemble', grammarPattern:'' }
      ],
      // Reviewed options for each gap sentence above (match by id). answer = the blanked form; wrong = 3 options that can NOT
      // also complete the sentence. A row that does not match its sentence is a build error, not a silent skip.
      gapDistractors:[
        { id:'1', answer:'assemble', wrong:['borrow', 'forget', 'describe'] },
        { id:'2', answer:'assemble', wrong:['photograph', 'explain', 'cancel'] }
      ]
    }),
  e('durable', 'adjective',
    'able to last a long time without being damaged',
    ['long-lasting', 'hard-wearing'],
    ['fashionable', 'cheap', 'colourful'],
    'These boots are durable enough for a whole winter of walking.',
    'long-lasting', 'These boots are long-lasting enough for a whole winter of walking.',
    'hard-wearing', 'Hard-wearing fabric suits children’s school bags.',
    {
      wordFamily:['durability'],
      masteryContexts:[
        { text:'A durable phone case survives many falls.', meaning:'strong and long-lasting' },
        { text:'The company is proud of its durable products.', meaning:'made to last' }
      ],
      situationDistractors:[
        'The jacket tore after one week and the shop refunded the money.',
        'Everyone admired the bright colours of the new bag.',
        'The tickets sold out within minutes of going on sale.'
      ],
      retrievalContexts:[{ id:'1', text:'These boots are durable enough for a whole winter.', target:'durable', grammarPattern:'' }],
      gapDistractors:[{ id:'1', answer:'durable', wrong:['hungry', 'curious', 'generous'] }]
    })
];

// ---- activities --------------------------------------------------------------------------------------------------------------
// One record per prompt. `linkedVocabularyIds` names the word(s) the prompt is evidence for: vocab_<slug of the term>.
const activity = (id, contentType, activityData) => ({ activityContentId:`u${UNIT_NUMBER}_${id}`, unitNumber:UNIT_NUMBER, contentType, status, activityData });

const activities = [
  // Word Families: fill the gap with the right form of the word's family (needs wordFamily on the entry).
  activity('wf_assemble_a', 'writing_set', {
    taskType:'word_family', prompt:'Use the correct form from the assemble word family.',
    sourceText:'The _____ of the stage took all morning.', acceptedAnswers:['assembly'],
    linkedVocabularyIds:['vocab_assemble'], primaryEvidenceTargetId:'vocab_assemble'
  }),
  // Precision & Use: replace vague wording with the precise word. distractors are wrong in meaning but fit grammatically.
  activity('precision_assemble_a', 'writing_set', {
    taskType:'improve_vocabulary', prompt:'Replace “put together” with a more precise word or phrase.',
    sourceText:'The students put together the model in one lesson.', acceptedAnswers:['assembled'],
    distractors:['borrowed', 'forgot', 'described'],
    linkedVocabularyIds:['vocab_assemble'], primaryEvidenceTargetId:'vocab_assemble'
  }),
  // Paraphrasing, phrase level: a phrase and an equivalent phrase.
  activity('phrase_assemble_a', 'phrase_set', {
    originalPhrase:'assemble the model', equivalentPhrase:'put the model together', acceptedVariants:[],
    chunks:['put', 'the', 'model', 'together'], commonMeaningDistortions:['take the model apart'],
    linkedVocabularyIds:['vocab_assemble'], primaryEvidenceTargetId:'vocab_assemble'
  }),
  // Paraphrasing, idea level: a whole idea, accurate paraphrases, what must not change, and plausible wrong versions.
  activity('idea_durable_a', 'idea_set', {
    originalIdea:'The boots are durable, so they last for years.',
    accurateParaphrases:['The boots are hard-wearing, so they stay in good condition for years.'],
    meaningInvariants:[{ type:'result', value:'they last for years' }],
    distractors:[{ text:'The boots are fashionable, so many people buy them.', reason:'changes the reason' }],
    linkedVocabularyIds:['vocab_durable']
  }),
  // Language bank (optional): extra reviewed gap-fill sentences for Context. Exactly 3 wrong options, none equal to the answer.
  activity('bank_assemble_1', 'writing_set', {
    taskType:'language_bank_context', prompt:'Complete the sentence with the best word or phrase.',
    sourceText:'Please ____ in the hall before the assembly begins.', acceptedAnswers:['assemble'],
    distractors:[{ text:'borrow', reason:'wrong meaning' }, { text:'forget', reason:'wrong meaning' }, { text:'describe', reason:'wrong meaning' }],
    linkedVocabularyIds:['vocab_assemble'], primaryEvidenceTargetId:'vocab_assemble', languageBankContextId:'assemble_ctx_1'
  })
];
// The language-bank row's id convention: activityContentId must be `language-bank:<languageBankContextId>`.
activities[activities.length - 1].activityContentId = 'language-bank:assemble_ctx_1';

// Reviewed misspellings are lexical (one list per word, shared by every unit): add them to content/vocabulary/lexical-spelling-errors.js
// keyed by vocabularyId, and pass that map here as `lexicalSpelling`.
export default buildCuratedUnit({
  unitNumber:UNIT_NUMBER,
  unitTitle:'Template Example',
  status,
  source:'EXAMPLE ONLY',
  entries,
  activities,
  lexicalSpelling:{}
});
