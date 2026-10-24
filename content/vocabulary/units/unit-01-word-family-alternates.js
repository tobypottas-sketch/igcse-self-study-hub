// Unit 1 · Word Families — a SECOND authored example sentence for the two non-headword forms of each minimal (three-form) family.
//
// Why: Word Families Mastery asks the learner to type the right form in two or three gaps, and per-word Mastery needs two DIFFERENT prompts.
// A family with only two non-headword forms has just one set of gaps, so it could be asked only one way. A second authored sentence for each
// form gives a second, genuinely different prompt. Nothing is generated: every sentence is written by hand, contains its form exactly once,
// and never starts with it (so the gap does not hand over a capital letter).
//
// Shape: { headword: { form: 'second example sentence', ... } }. build via unit-01.js -> sense.wordFamilyForms[].altExample.
export const unit1WordFamilyAlternates = Object.freeze({
  preference: {
    prefer: 'Most of my classmates prefer playing outdoors when the weather is dry.',
    preferable: 'A quiet training session is preferable to a rushed one before an exam.'
  },
  avoid: {
    avoidance: 'The avoidance of sugary drinks is part of the athletes’ diet plan.',
    unavoidable: 'With so many teams entering, a few disappointments were unavoidable.'
  },
  afford: {
    affordable: 'Second-hand equipment makes the sport affordable for beginners.',
    unaffordable: 'Tickets for the final were unaffordable for most of the students.'
  },
  deny: {
    denial: 'The coach’s denial surprised everyone because the evidence was so clear.',
    undeniable: 'It is undeniable that regular exercise improves concentration in lessons.'
  },
  arrange: {
    arrangement: 'The travel arrangement saved the team two hours on the way home.',
    rearrange: 'Could we rearrange the training session so that it starts after lunch?'
  },
  recommend: {
    recommendation: 'On the coach’s recommendation, the club bought lighter running shoes.',
    recommended: 'This stretching routine is recommended for anyone who sits all day.'
  },
  threaten: {
    threat: 'Heavy snow was a serious threat to the success of the school sports day.',
    threatening: 'The dark clouds looked threatening, so the match was moved indoors.'
  },
  resent: {
    resentment: 'His resentment grew whenever others were chosen to play instead of him.',
    resentful: 'She felt resentful after the referee ignored the unfair tackle.'
  },
  regret: {
    regrettable: 'The injury was regrettable, but the team still played with great spirit.',
    regrettably: 'The swimming gala was regrettably cancelled because of the broken heating.'
  },
  opponent: {
    oppose: 'Some parents oppose the plan to shorten the lunch break for training.',
    opposition: 'There was strong opposition to the idea of charging students for the gym.'
  },
  determined: {
    determine: 'Judges determine the winner by adding up the points from every round.',
    determination: 'Her determination to improve her time impressed everybody at the club.'
  },
  discipline: {
    disciplined: 'A disciplined athlete goes to bed early before a big race.',
    undisciplined: 'The undisciplined team kept arguing instead of following the plan.'
  },
  achievement: {
    achieve: 'Players who train every day can achieve far more than they expect.',
    achievable: 'The coach set a goal that was difficult but achievable for the whole squad.'
  },
  challenge: {
    challenging: 'The mountain route was challenging, but the students enjoyed every minute.',
    challenger: 'The young challenger surprised the champion with a fast start.'
  },
  solution: {
    solve: 'Working together, the players managed to solve the problem of the muddy pitch.',
    unsolved: 'The question of who would pay for the new nets remained unsolved.'
  },
  minimum: {
    minimal: 'The damage to the pitch was minimal, so the final went ahead as planned.',
    minimise: 'Warming up properly helps athletes to minimise the risk of injury.'
  },
  selection: {
    select: 'The teacher will select five students to represent the school in the relay.',
    selective: 'The club is very selective about who joins the senior team.'
  },
  significant: {
    significance: 'The coach explained the significance of each change to the starting line-up.',
    significantly: 'Her times have improved significantly since she began training with the club.'
  },
  expansion: {
    expand: 'The school plans to expand the sports hall by adding two more courts.',
    expanding: 'An expanding fan base meant the stadium needed more seats.'
  },
  reputation: {
    reputable: 'Only reputable companies were allowed to sell tickets for the tournament.',
    disreputable: 'The disreputable agent was banned from every club in the league.'
  }
});
export default unit1WordFamilyAlternates;
