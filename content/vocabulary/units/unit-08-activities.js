// Unit 8 · Paraphrasing content (phrase_set and idea_set), WORDS 1–50 (complete). Same record shapes and contract as unit-07-activities.js:
//   phrase_set : originalPhrase (plain wording) -> equivalentPhrase (contains the target), acceptedVariants, chunks, commonMeaningDistortions
//   idea_set   : originalIdea (contains the target) with accurate paraphrases that do NOT contain it, a meaning invariant, and three
//                meaning-changing distractors each tagged with the misconception it represents.
// Every record is linked to exactly one Unit 8 word.
const status = 'approved';
const unitNumber = 8;

function phrase(id, originalPhrase, equivalentPhrase, linkedVocabularyIds, { acceptedVariants = [], chunks = null, distortions = [] } = {}) {
  return {
    activityContentId:`u8_phrase_${id}`, unitNumber, contentType:'phrase_set', status,
    activityData:{
      originalPhrase, equivalentPhrase, acceptedVariants,
      chunks:chunks ?? equivalentPhrase.split(/\s+/),
      commonMeaningDistortions:distortions,
      linkedVocabularyIds,
      primaryEvidenceTargetId:linkedVocabularyIds.length === 1 ? linkedVocabularyIds[0] : undefined
    }
  };
}

function idea(id, originalIdea, accurateParaphrase, invariantType, invariantValue, distractors, linkedVocabularyIds = []) {
  return {
    activityContentId:`u8_idea_${id}`, unitNumber, contentType:'idea_set', status,
    activityData:{
      originalIdea,
      accurateParaphrases:Array.isArray(accurateParaphrase) ? accurateParaphrase : [accurateParaphrase],
      meaningInvariants:[{ type:invariantType, value:invariantValue }],
      distractors,
      linkedVocabularyIds
    }
  };
}

const phraseSets = [
  phrase('architecture_main', 'the style and design of buildings in the city', 'the architecture of the city', ['vocab_architecture'], { chunks:['the architecture', 'of the city'], distortions:['the history of the city', 'the population of the city', 'the transport of the city'] }),
  phrase('availability_main', 'whether the materials can be obtained', 'the availability of the materials', ['vocab_availability_8'], { chunks:['the availability', 'of the materials'], distortions:['the price of the materials', 'the weight of the materials', 'the colour of the materials'] }),
  phrase('concerned_main', 'worried about the safety of the workers', 'concerned about the safety of the workers', ['vocab_concerned'], { chunks:['concerned about', 'the safety of the workers'], distortions:['pleased about the safety of the workers', 'responsible for the safety of the workers', 'unaware of the safety of the workers'] }),
  phrase('complicated_main', 'a process with many confusing steps', 'a complicated process', ['vocab_complicated'], { chunks:['a complicated', 'process'], distortions:['a simple process', 'a quick process', 'a cheap process'] }),
  phrase('curved_main', 'a roof that bends smoothly', 'a curved roof', ['vocab_curved'], { chunks:['a curved', 'roof'], distortions:['a flat roof', 'a sloping roof', 'a broken roof'] }),
  phrase('detailed_main', 'a report that includes all the facts', 'a detailed report', ['vocab_detailed'], { chunks:['a detailed', 'report'], distortions:['a short report', 'a late report', 'a private report'] }),
  phrase('development_main', 'the process of creating new products', 'the development of new products', ['vocab_development'], { chunks:['the development', 'of new products'], distortions:['the sale of new products', 'the price of new products', 'the packaging of new products'] }),
  phrase('elements_main', 'the different parts of the design', 'the elements of the design', ['vocab_elements'], { chunks:['the elements', 'of the design'], distortions:['the cost of the design', 'the owner of the design', 'the date of the design'] }),
  phrase('established_main', 'a company that has existed for many years', 'an established company', ['vocab_established'], { chunks:['an established', 'company'], distortions:['a new company', 'a small company', 'a failed company'] }),
  phrase('facilities_main', 'the buildings and equipment for sport', 'the sports facilities', ['vocab_facilities_8'], { chunks:['the sports', 'facilities'], distortions:['the sports teachers', 'the sports results', 'the sports rules'] }),
  phrase('feature_main', 'the most noticeable part of the design', 'the main feature of the design', ['vocab_feature_8'], { chunks:['the main feature', 'of the design'], distortions:['the main cost of the design', 'the main fault of the design', 'the main owner of the design'] }),
  phrase('humanity_main', 'all the people in the world', 'the whole of humanity', ['vocab_humanity'], { chunks:['the whole', 'of humanity'], distortions:['the whole of the country', 'the whole of the company', 'the whole of the family'] }),
  phrase('impact_main', 'a strong effect on young people', 'a big impact on young people', ['vocab_impact'], { chunks:['a big impact', 'on young people'], distortions:['a big interest in young people', 'a big report on young people', 'a big gift for young people'] }),
  phrase('ingredients_main', 'the foods that the cake is made from', 'the ingredients of the cake', ['vocab_ingredients_8'], { chunks:['the ingredients', 'of the cake'], distortions:['the price of the cake', 'the packaging of the cake', 'the size of the cake'] }),
  phrase('innovation_main', 'new ideas in technology', 'innovation in technology', ['vocab_innovation'], { chunks:['innovation', 'in technology'], distortions:['investment in technology', 'interest in technology', 'problems in technology'] }),
  phrase('inspiration_main', 'the source of the ideas for the design', 'the inspiration for the design', ['vocab_inspiration'], { chunks:['the inspiration', 'for the design'], distortions:['the money for the design', 'the rules for the design', 'the deadline for the design'] }),
  phrase('inspectors_main', 'officials who check that food is safe', 'food inspectors', ['vocab_inspectors'], { chunks:['food', 'inspectors'], distortions:['food producers', 'food sellers', 'food critics'] }),
  phrase('instructor_main', 'a person who teaches people to drive', 'a driving instructor', ['vocab_instructor'], { chunks:['a driving', 'instructor'], distortions:['a driving inspector', 'a taxi driver', 'a car seller'] }),
  phrase('launched_main', 'started selling a new product', 'launched a new product', ['vocab_launched'], { chunks:['launched', 'a new product'], distortions:['stopped selling a new product', 'designed a new product', 'repaired a new product'] }),
  phrase('landscape_main', 'the scenery of the countryside', 'the landscape of the countryside', ['vocab_landscape_8'], { chunks:['the landscape', 'of the countryside'], distortions:['the people of the countryside', 'the roads of the countryside', 'the history of the countryside'] }),
  phrase('manufacturing_main', 'making goods in large factories', 'manufacturing in large factories', ['vocab_manufacturing'], { chunks:['manufacturing', 'in large factories'], distortions:['selling in large factories', 'cleaning in large factories', 'training in large factories'] }),
  phrase('minority_main', 'fewer than half of the workers', 'a minority of the workers', ['vocab_minority'], { chunks:['a minority', 'of the workers'], distortions:['most of the workers', 'all of the workers', 'none of the workers'] }),
  phrase('packaging_main', 'the wrapping around the product', 'the packaging around the product', ['vocab_packaging'], { chunks:['the packaging', 'around the product'], distortions:['the label on the product', 'the price of the product', 'the advert for the product'] }),
  phrase('presented_main', 'showed the plan formally to the managers', 'presented the plan to the managers', ['vocab_presented'], { chunks:['presented the plan', 'to the managers'], distortions:['hid the plan from the managers', 'sold the plan to the managers', 'sent the plan away from the managers'] }),
  phrase('publicity_main', 'a lot of attention from the media', 'a lot of publicity', ['vocab_publicity'], { chunks:['a lot of', 'publicity'], distortions:['a lot of money', 'a lot of complaints', 'a lot of advice'] }),
  phrase('qualified_main', 'a teacher with the right training and certificates', 'a qualified teacher', ['vocab_qualified'], { chunks:['a qualified', 'teacher'], distortions:['a retired teacher', 'a popular teacher', 'a strict teacher'] }),
  phrase('regulations_main', 'the official rules about safety', 'the safety regulations', ['vocab_regulations'], { chunks:['the safety', 'regulations'], distortions:['the safety equipment', 'the safety reports', 'the safety training'] }),
  phrase('relentless_main', 'pressure that never stops', 'relentless pressure', ['vocab_relentless'], { chunks:['relentless', 'pressure'], distortions:['little pressure', 'sudden pressure', 'gentle pressure'] }),
  phrase('response_main', 'the reaction from customers', 'the response from customers', ['vocab_response'], { chunks:['the response', 'from customers'], distortions:['the questions from customers', 'the money from customers', 'the orders from customers'] }),
  phrase('responsible_main', 'in charge of the new staff', 'responsible for the new staff', ['vocab_responsible_8'], { chunks:['responsible for', 'the new staff'], distortions:['unhappy with the new staff', 'afraid of the new staff', 'unaware of the new staff'] }),
  phrase('rough_main', 'an approximate idea of the cost', 'a rough idea of the cost', ['vocab_rough'], { chunks:['a rough idea', 'of the cost'], distortions:['an exact idea of the cost', 'a clear record of the cost', 'a fixed limit on the cost'] }),
  phrase('significant_main', 'a large and important increase', 'a significant increase', ['vocab_significant_8'], { chunks:['a significant', 'increase'], distortions:['a tiny increase', 'a sudden increase', 'an expected increase'] }),
  phrase('source_main', 'where the money comes from', 'the source of the money', ['vocab_source'], { chunks:['the source', 'of the money'], distortions:['the amount of the money', 'the owner of the money', 'the use of the money'] }),
  phrase('specialise_main', 'focus on employment law', 'specialise in employment law', ['vocab_specialise_8'], { chunks:['specialise in', 'employment law'], distortions:['give up employment law', 'teach employment law', 'avoid employment law'] }),
  phrase('structures_main', 'the tall buildings and bridges of the city', 'the tall structures of the city', ['vocab_structures'], { chunks:['the tall structures', 'of the city'], distortions:['the busy streets of the city', 'the old parks of the city', 'the main shops of the city'] }),
  phrase('sustainable_main', 'energy that will not harm the planet', 'sustainable energy', ['vocab_sustainable'], { chunks:['sustainable', 'energy'], distortions:['expensive energy', 'wasted energy', 'imported energy'] }),
  phrase('transformed_main', 'completely changed the old building', 'transformed the old building', ['vocab_transformed'], { chunks:['transformed', 'the old building'], distortions:['repaired the old building', 'sold the old building', 'painted the old building'] }),
  phrase('operator_main', 'the person who works the crane', 'the crane operator', ['vocab_operator'], { chunks:['the crane', 'operator'], distortions:['the crane designer', 'the crane owner', 'the crane inspector'] }),
  phrase('nutritionist_main', 'advice from an expert on healthy eating', 'advice from a nutritionist', ['vocab_nutritionist'], { chunks:['advice from', 'a nutritionist'], distortions:['advice from a chef', 'advice from a farmer', 'advice from a waiter'] }),
  phrase('director_main', 'the head of the company', 'the director of the company', ['vocab_director'], { chunks:['the director', 'of the company'], distortions:['the cleaner of the company', 'the customer of the company', 'the visitor to the company'] }),
  phrase('expert_main', 'a person with great knowledge of computers', 'a computer expert', ['vocab_expert'], { chunks:['a computer', 'expert'], distortions:['a computer seller', 'a computer user', 'a computer beginner'] }),
  phrase('engineer_main', 'a person who designs computer programs', 'a software engineer', ['vocab_engineer_8'], { chunks:['a software', 'engineer'], distortions:['a software seller', 'a software user', 'a software tester'] }),
  phrase('scientist_main', 'a person who does research in a laboratory', 'a scientist in a laboratory', ['vocab_scientist'], { chunks:['a scientist', 'in a laboratory'], distortions:['a cleaner in a laboratory', 'a visitor in a laboratory', 'a guard in a laboratory'] }),
  phrase('assignment_main', 'a piece of work set by the teacher', 'an assignment set by the teacher', ['vocab_assignment'], { chunks:['an assignment', 'set by the teacher'], distortions:['a prize given by the teacher', 'a book read by the teacher', 'a trip led by the teacher'] }),
  phrase('employment_main', 'paid work for young people', 'employment for young people', ['vocab_employment'], { chunks:['employment', 'for young people'], distortions:['holidays for young people', 'training for young people', 'prizes for young people'] }),
  phrase('traditional_main', 'methods that have been used for centuries', 'traditional methods', ['vocab_traditional'], { chunks:['traditional', 'methods'], distortions:['modern methods', 'secret methods', 'cheap methods'] }),
  phrase('trainer_main', 'a person who helps you get fit', 'a personal trainer', ['vocab_trainer'], { chunks:['a personal', 'trainer'], distortions:['a personal doctor', 'a personal chef', 'a personal driver'] }),
  phrase('technology_main', 'modern machines and computers in schools', 'technology in schools', ['vocab_technology'], { chunks:['technology', 'in schools'], distortions:['uniforms in schools', 'sports in schools', 'rules in schools'] }),
  phrase('creative_main', 'people with lots of original ideas', 'creative people', ['vocab_creative'], { chunks:['creative', 'people'], distortions:['careful people', 'honest people', 'punctual people'] }),
  phrase('wellbeing_main', 'the health and happiness of the staff', 'the wellbeing of the staff', ['vocab_wellbeing'], { chunks:['the wellbeing', 'of the staff'], distortions:['the salaries of the staff', 'the skills of the staff', 'the uniforms of the staff'] })
];

const ideaSets = [
  idea('architecture', 'The new library is famous for its bold architecture.', ['The new library is well known for the daring design of its building.', 'People know the new library because of its striking building design.', 'The building design of the new library is bold, and this has made it famous.'], 'meaning', 'design of the building', [
    { text:'The new library is famous for its large collection of books.', misconceptionCategory:'meaning_confusion' },
    { text:'The new library is unknown despite its bold design.', misconceptionCategory:'polarity_change' },
    { text:'The new library will become famous for its bold design one day.', misconceptionCategory:'time_change' }
  ], ['vocab_architecture']),
  idea('availability', 'The availability of skilled workers is the main reason the company chose this town.', ['The company picked this town mainly because skilled workers can easily be found there.', 'The main reason for choosing this town was that the firm could find skilled staff there.', 'Skilled workers are easy to find in this town, which is chiefly why the company chose it.'], 'cause_effect', 'skilled workers can be found', [
    { text:'The low cost of skilled workers is the main reason the company chose this town.', misconceptionCategory:'meaning_confusion' },
    { text:'The lack of skilled workers is the main reason the company chose this town.', misconceptionCategory:'polarity_change' },
    { text:'Finding skilled workers was one small reason the company chose this town.', misconceptionCategory:'degree_change' }
  ], ['vocab_availability_8']),
  idea('concerned', 'Many employees are concerned about losing their jobs to new technology.', ['A lot of workers are worried that new technology could take their jobs.', 'Many staff fear that they may lose their jobs because of new technology.', 'Plenty of employees feel anxious that new machines and software might replace them.'], 'meaning', 'worried', [
    { text:'Many employees are excited about losing their jobs to new technology.', misconceptionCategory:'polarity_change' },
    { text:'A few employees are worried about losing their jobs to new technology.', misconceptionCategory:'quantity_change' },
    { text:'Many employees have already lost their jobs to new technology.', misconceptionCategory:'time_change' }
  ], ['vocab_concerned']),
  idea('complicated', 'The instructions were so complicated that nobody could follow them.', ['The instructions were so hard to understand that no one was able to follow them.', 'Nobody could follow the instructions because they were too confusing.', 'Because the instructions had too many confusing details, no one managed to follow them.'], 'cause_effect', 'too difficult to follow', [
    { text:'The instructions were so simple that everyone could follow them.', misconceptionCategory:'polarity_change' },
    { text:'The instructions were rather confusing, but most people followed them.', misconceptionCategory:'degree_change' },
    { text:'The instructions were so short that nobody read them.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_complicated']),
  idea('curved', 'The building has curved walls instead of straight ones.', ['The walls of the building bend smoothly rather than running straight.', 'Instead of being straight, the building’s walls are rounded.', 'The building’s walls are not straight; they bend in smooth lines.'], 'meaning', 'bending smoothly', [
    { text:'The building has straight walls instead of rounded ones.', misconceptionCategory:'polarity_change' },
    { text:'The building has tall walls instead of short ones.', misconceptionCategory:'meaning_confusion' },
    { text:'The building had curved walls before it was rebuilt.', misconceptionCategory:'time_change' }
  ], ['vocab_curved']),
  idea('detailed', 'The architect gave the builders detailed drawings of the new office.', ['The architect handed the builders drawings of the new office that showed every small part.', 'The builders received plans of the new office from the architect, with all the small parts shown.', 'Drawings of the new office showing every part carefully were given to the builders by the architect.'], 'meaning', 'showing every small part', [
    { text:'The architect gave the builders rough drawings of the new office.', misconceptionCategory:'meaning_confusion' },
    { text:'The builders gave the architect careful drawings of the new office.', misconceptionCategory:'role_reversal' },
    { text:'The architect will give the builders full drawings of the new office.', misconceptionCategory:'time_change' }
  ], ['vocab_detailed']),
  idea('development', 'The development of the new engine took four years.', ['Creating and improving the new engine took four years.', 'It took four years to design and perfect the new engine.', 'Four years were needed to create the new engine and make it work well.'], 'quantity', 'four years', [
    { text:'The development of the new engine took four months.', misconceptionCategory:'quantity_change' },
    { text:'The sale of the new engine took four years.', misconceptionCategory:'meaning_confusion' },
    { text:'Creating the new engine will take four years.', misconceptionCategory:'time_change' }
  ], ['vocab_development']),
  idea('elements', 'Colour and light are the most important elements of her design.', ['The most important parts of her design are colour and light.', 'In her design, colour and light are the key parts.', 'Of all the parts that make up her design, colour and light matter most.'], 'meaning', 'most important parts', [
    { text:'Colour and light are the least important parts of her design.', misconceptionCategory:'polarity_change' },
    { text:'Colour and light are the most expensive parts of her design.', misconceptionCategory:'meaning_confusion' },
    { text:'Colour and light were once the most important parts of her design.', misconceptionCategory:'time_change' }
  ], ['vocab_elements']),
  idea('established', 'Most of our clients are established businesses rather than new ones.', ['Most of our customers are firms that have existed for many years, not new ones.', 'Long-standing businesses, rather than new firms, make up most of our client list.', 'The majority of our clients are well-known companies with a long history, not start-ups.'], 'quantity', 'most', [
    { text:'Most of our clients are new businesses rather than long-standing ones.', misconceptionCategory:'polarity_change' },
    { text:'Only a few of our clients are long-standing businesses.', misconceptionCategory:'quantity_change' },
    { text:'Most of our clients are large businesses rather than small ones.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_established']),
  idea('facilities', 'The factory has excellent facilities for its workers, including a canteen and a gym.', ['The factory provides its workers with very good places and equipment, such as a canteen and a gym.', 'Workers at the factory can use high-quality services, for example a canteen and a gym.', 'A canteen and a gym are among the very good things the factory provides for its staff.'], 'meaning', 'places and equipment provided', [
    { text:'The factory has poor places and equipment for its workers, including a canteen and a gym.', misconceptionCategory:'polarity_change' },
    { text:'The factory plans to build a canteen and a gym for its workers.', misconceptionCategory:'time_change' },
    { text:'Only the managers can use the canteen and the gym at the factory.', misconceptionCategory:'quantity_change' }
  ], ['vocab_facilities_8']),
  idea('feature', 'The main feature of the new office is a large garden on the roof.', ['The most noticeable part of the new office is a big rooftop garden.', 'A large garden on the roof is what stands out most about the new office.', 'What people notice most in the new office is the big garden on its roof.'], 'meaning', 'most noticeable part', [
    { text:'The new office has no garden on the roof.', misconceptionCategory:'polarity_change' },
    { text:'The main problem with the new office is a large garden on the roof.', misconceptionCategory:'meaning_confusion' },
    { text:'The new office will have a large garden on the roof next year.', misconceptionCategory:'time_change' }
  ], ['vocab_feature_8']),
  idea('humanity', 'The new medicine could save millions of lives and benefit humanity.', ['The new drug might save millions of lives and help people all over the world.', 'Millions of lives could be saved by the new medicine, which would be good for the human race.', 'The new medicine may help everyone on the planet and save millions of lives.'], 'meaning', 'all people', [
    { text:'The new medicine could save millions of lives but help only one country.', misconceptionCategory:'quantity_change' },
    { text:'The new medicine could end millions of lives and harm everyone.', misconceptionCategory:'polarity_change' },
    { text:'The new medicine has already saved millions of lives.', misconceptionCategory:'time_change' }
  ], ['vocab_humanity']),
  idea('impact', 'The new factory has had a positive impact on the local economy.', ['The new factory has had a good effect on the local economy.', 'The local economy has benefited from the new factory.', 'Thanks to the new factory, the area’s economy has improved.'], 'meaning', 'good effect', [
    { text:'The new factory has had a negative effect on the local economy.', misconceptionCategory:'polarity_change' },
    { text:'The new factory will help the local economy in the future.', misconceptionCategory:'time_change' },
    { text:'The new factory has made no difference to the local economy.', misconceptionCategory:'degree_change' }
  ], ['vocab_impact']),
  idea('ingredients', 'The company uses only natural ingredients in its fruit juices.', ['The firm makes its fruit juices only from natural foods.', 'Nothing artificial goes into the company’s fruit juices.', 'The fruit juices are made entirely from natural things.'], 'quantity', 'only natural', [
    { text:'The company uses mainly artificial foods in its fruit juices.', misconceptionCategory:'polarity_change' },
    { text:'The company uses some natural foods in its fruit juices.', misconceptionCategory:'quantity_change' },
    { text:'The company uses only natural packaging for its fruit juices.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_ingredients_8']),
  idea('innovation', 'The company encourages innovation by rewarding staff for new ideas.', ['The firm rewards its workers for fresh ideas in order to encourage new ways of working.', 'By giving rewards for new ideas, the company helps staff to create new things.', 'Staff who suggest new ideas are rewarded, because the company wants to develop new products and methods.'], 'cause_effect', 'by rewarding new ideas', [
    { text:'The company discourages new ideas by punishing staff who suggest them.', misconceptionCategory:'polarity_change' },
    { text:'The company encourages new ideas without rewarding anyone.', misconceptionCategory:'omitted_information' },
    { text:'The company rewards staff for following old methods.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_innovation']),
  idea('inspiration', 'The designer’s grandmother was the inspiration for her first collection.', ['The designer got the ideas for her first collection from her grandmother.', 'Her grandmother gave the designer the ideas behind her first collection.', 'The designer’s first collection was based on ideas that came from her grandmother.'], 'meaning', 'source of ideas', [
    { text:'The designer’s grandmother paid for her first collection.', misconceptionCategory:'meaning_confusion' },
    { text:'The designer gave her grandmother the ideas for her first collection.', misconceptionCategory:'role_reversal' },
    { text:'The designer’s grandmother will give her ideas for her next collection.', misconceptionCategory:'time_change' }
  ], ['vocab_inspiration']),
  idea('inspectors', 'Inspectors visit every factory at least once a year to check safety.', ['Officials check safety in each factory one or more times a year.', 'Every factory receives a safety check from officials at least yearly.', 'At least once a year, each factory is visited by people who check that it is safe.'], 'quantity', 'at least once a year', [
    { text:'Inspectors visit every factory once every ten years to check safety.', misconceptionCategory:'quantity_change' },
    { text:'Inspectors visit only a few factories to check safety.', misconceptionCategory:'scope_change' },
    { text:'Salespeople visit every factory at least once a year to sell products.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_inspectors']),
  idea('instructor', 'The instructor taught the new staff how to use the machines safely.', ['The new workers were shown how to operate the machines safely by the person teaching them.', 'The person in charge of teaching showed new employees how to use the machines without danger.', 'New staff learned safe use of the machines from their teacher.'], 'meaning', 'person who teaches a skill', [
    { text:'The teacher showed the new staff how to repair the machines.', misconceptionCategory:'meaning_confusion' },
    { text:'The new staff taught their teacher how to use the machines safely.', misconceptionCategory:'role_reversal' },
    { text:'Nobody showed the new staff how to use the machines safely.', misconceptionCategory:'polarity_change' }
  ], ['vocab_instructor']),
  idea('launched', 'The company launched its first electric car last year.', ['The firm started selling its first electric car last year.', 'Last year, the company introduced its first electric car to the public.', 'Its first electric car went on sale from the company last year.'], 'time', 'last year', [
    { text:'The company will start selling its first electric car next year.', misconceptionCategory:'time_change' },
    { text:'The company stopped making its first electric car last year.', misconceptionCategory:'polarity_change' },
    { text:'The company bought its first electric car last year.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_launched']),
  idea('landscape', 'The new road has completely changed the landscape around the village.', ['The scenery around the village looks totally different because of the new road.', 'Because of the new road, the land around the village looks completely different.', 'The view of the countryside around the village has been entirely changed by the new road.'], 'degree', 'completely', [
    { text:'The new road has slightly changed the scenery around the village.', misconceptionCategory:'degree_change' },
    { text:'The new road has not changed the scenery around the village.', misconceptionCategory:'polarity_change' },
    { text:'The new road has completely changed the traffic around the village.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_landscape_8']),
  idea('manufacturing', 'Manufacturing has moved from Europe to Asia over the last thirty years.', ['Over the past thirty years, factory production has shifted from Europe to Asia.', 'In the last three decades, the making of goods in factories has moved from Europe to Asia.', 'Goods that used to be made in European factories have been produced in Asia over the last thirty years.'], 'direction', 'from Europe to Asia', [
    { text:'Factory production has moved from Asia to Europe over the last thirty years.', misconceptionCategory:'direction_change' },
    { text:'Shopping has moved from Europe to Asia over the last thirty years.', misconceptionCategory:'meaning_confusion' },
    { text:'Factory production will move from Europe to Asia in the next thirty years.', misconceptionCategory:'time_change' }
  ], ['vocab_manufacturing']),
  idea('minority', 'Only a minority of employees use the new gym.', ['Fewer than half of the workers use the new gym.', 'Most employees do not use the new gym; only a small number do.', 'The new gym is used by a smaller part of the staff.'], 'quantity', 'fewer than half', [
    { text:'Most employees use the new gym.', misconceptionCategory:'quantity_change' },
    { text:'No employees use the new gym.', misconceptionCategory:'polarity_change' },
    { text:'Only a few employees like the new canteen.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_minority']),
  idea('packaging', 'The company has replaced all its plastic packaging with paper.', ['The firm now wraps all its products in paper instead of plastic.', 'Paper has taken the place of plastic in all of the company’s wrapping.', 'All of the company’s plastic boxes and wrappers have been changed to paper ones.'], 'quantity', 'all', [
    { text:'The company has replaced some of its plastic wrapping with paper.', misconceptionCategory:'quantity_change' },
    { text:'The company has replaced all its paper wrapping with plastic.', misconceptionCategory:'direction_change' },
    { text:'The company plans to replace its plastic wrapping with paper.', misconceptionCategory:'time_change' }
  ], ['vocab_packaging']),
  idea('presented', 'The engineer presented her design to the board last Friday.', ['Last Friday, the engineer showed and explained her design to the board.', 'The engineer formally showed the board her design last Friday.', 'Her design was explained to the board by the engineer last Friday.'], 'time', 'last Friday', [
    { text:'The engineer will show her design to the board next Friday.', misconceptionCategory:'time_change' },
    { text:'The board showed its design to the engineer last Friday.', misconceptionCategory:'role_reversal' },
    { text:'The engineer hid her design from the board last Friday.', misconceptionCategory:'polarity_change' }
  ], ['vocab_presented']),
  idea('publicity', 'The company’s new advert has attracted a lot of publicity.', ['The firm’s new advert has received plenty of attention from the media and the public.', 'Many people and newspapers have noticed the company’s new advert.', 'The new advert from the company has been widely discussed in the media.'], 'quantity', 'a lot of', [
    { text:'The company’s new advert has attracted very little attention.', misconceptionCategory:'quantity_change' },
    { text:'The company’s new advert has attracted a lot of new staff.', misconceptionCategory:'meaning_confusion' },
    { text:'The company’s new advert will attract a lot of attention next month.', misconceptionCategory:'time_change' }
  ], ['vocab_publicity']),
  idea('qualified', 'Only qualified staff may use the machines in the laboratory.', ['Only workers with the right training are allowed to use the laboratory machines.', 'The machines in the laboratory can be used only by properly trained employees.', 'Staff without the official training must not use the laboratory machines.'], 'condition', 'only trained staff', [
    { text:'Any member of staff may use the machines in the laboratory.', misconceptionCategory:'quantity_change' },
    { text:'Only trained staff may clean the machines in the laboratory.', misconceptionCategory:'meaning_confusion' },
    { text:'Only untrained staff may use the machines in the laboratory.', misconceptionCategory:'polarity_change' }
  ], ['vocab_qualified']),
  idea('regulations', 'Under the new regulations, all drivers must take a break every four hours.', ['The new official rules say that every driver has to stop for a rest every four hours.', 'According to the new rules, drivers are required to take a break every four hours.', 'All drivers now have to rest every four hours because of the new rules.'], 'quantity', 'every four hours', [
    { text:'Under the new rules, all drivers must take a break every eight hours.', misconceptionCategory:'quantity_change' },
    { text:'Under the new rules, drivers may choose whether to take a break.', misconceptionCategory:'modality_change' },
    { text:'Under the old rules, all drivers had to take a break every four hours.', misconceptionCategory:'time_change' }
  ], ['vocab_regulations']),
  idea('relentless', 'The nurses face relentless demands during the winter months.', ['During winter, the nurses face demands that never stop.', 'In the winter months, there is constant pressure on the nurses.', 'The nurses have no break from heavy demands throughout the winter.'], 'degree', 'never stopping', [
    { text:'The nurses face occasional demands during the winter months.', misconceptionCategory:'degree_change' },
    { text:'The nurses face constant demands during the summer months.', misconceptionCategory:'time_change' },
    { text:'The nurses make constant demands on their patients during the winter months.', misconceptionCategory:'role_reversal' }
  ], ['vocab_relentless']),
  idea('response', 'The response to the new product has been very positive.', ['People have reacted very well to the new product.', 'The reaction to the new product has been extremely good.', 'Customers have given the new product a very positive reaction.'], 'meaning', 'reaction', [
    { text:'The reaction to the new product has been very negative.', misconceptionCategory:'polarity_change' },
    { text:'The price of the new product has been very low.', misconceptionCategory:'meaning_confusion' },
    { text:'The reaction to the new product will probably be positive.', misconceptionCategory:'time_change' }
  ], ['vocab_response']),
  idea('responsible', 'The supervisor is responsible for checking the machines every morning.', ['Checking the machines each morning is the supervisor’s job.', 'Every morning, it is the supervisor’s duty to check the machines.', 'The supervisor is in charge of inspecting the machines each morning.'], 'meaning', 'duty', [
    { text:'The supervisor has to check the machines once a month.', misconceptionCategory:'quantity_change' },
    { text:'The supervisor is not allowed to check the machines every morning.', misconceptionCategory:'polarity_change' },
    { text:'The supervisor has to buy new machines every morning.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_responsible_8']),
  idea('rough', 'The engineer gave us a rough estimate of the cost of the repairs.', ['The engineer told us approximately how much the repairs would cost.', 'We received a general idea of the repair costs from the engineer.', 'The engineer guessed about how much fixing it would cost, without exact figures.'], 'precision', 'approximate', [
    { text:'The engineer gave us an exact price for the repairs.', misconceptionCategory:'precision_change' },
    { text:'We gave the engineer an approximate idea of the cost of the repairs.', misconceptionCategory:'role_reversal' },
    { text:'The engineer refused to say anything about the cost of the repairs.', misconceptionCategory:'polarity_change' }
  ], ['vocab_rough']),
  idea('significant', 'The new software has led to a significant fall in mistakes.', ['There are noticeably fewer mistakes because of the new software.', 'The new software has greatly reduced the number of mistakes.', 'Mistakes have dropped by a large amount since the new software arrived.'], 'degree', 'large', [
    { text:'The new software has led to a small fall in mistakes.', misconceptionCategory:'degree_change' },
    { text:'The new software has led to a large rise in mistakes.', misconceptionCategory:'direction_change' },
    { text:'The new software will lead to a fall in mistakes next year.', misconceptionCategory:'time_change' }
  ], ['vocab_significant_8']),
  idea('source', 'Tourism is the island’s main source of jobs.', ['Most jobs on the island come from tourism.', 'The tourist industry provides more work than anything else on the island.', 'On the island, the largest number of jobs is created by tourism.'], 'quantity', 'main', [
    { text:'Tourism provides only a few jobs on the island.', misconceptionCategory:'degree_change' },
    { text:'Tourism has destroyed most jobs on the island.', misconceptionCategory:'polarity_change' },
    { text:'Fishing provides most of the jobs on the island.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_source']),
  idea('specialise', 'Our engineers specialise in designing bridges.', ['Our engineers focus on bridge design.', 'Designing bridges is the particular area that our engineers are experts in.', 'The particular field of our engineers is the design of bridges.'], 'meaning', 'focus on one area', [
    { text:'Our engineers avoid designing bridges.', misconceptionCategory:'polarity_change' },
    { text:'Our engineers design all kinds of buildings.', misconceptionCategory:'scope_change' },
    { text:'Our engineers repair bridges.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_specialise_8']),
  idea('structures', 'After the flood, engineers checked all the structures in the town.', ['After the flood, engineers examined every building and bridge in the town.', 'Every building, bridge and wall in the town was checked by engineers after the flood.', 'Engineers inspected everything that had been built in the town once the flood was over.'], 'quantity', 'all', [
    { text:'After the flood, engineers checked a few buildings in the town.', misconceptionCategory:'quantity_change' },
    { text:'Before the flood, engineers checked all the buildings in the town.', misconceptionCategory:'time_change' },
    { text:'After the flood, engineers checked all the rivers in the town.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_structures']),
  idea('sustainable', 'The company wants all its products to be sustainable by 2030.', ['By 2030, the firm aims to make every product without harming the environment.', 'The company plans for all of its goods to be environmentally friendly by 2030.', 'By the year 2030, every product the company makes should be good for the planet in the long term.'], 'time', 'by 2030', [
    { text:'The company wants some of its products to be environmentally friendly by 2030.', misconceptionCategory:'quantity_change' },
    { text:'The company wants all its products to be cheaper by 2030.', misconceptionCategory:'meaning_confusion' },
    { text:'The company wants all its products to be environmentally friendly by 2050.', misconceptionCategory:'time_change' }
  ], ['vocab_sustainable']),
  idea('transformed', 'Robots have transformed the way cars are made.', ['Robots have completely changed how cars are produced.', 'The method of making cars is totally different because of robots.', 'Car manufacturing has been changed in a major way by robots.'], 'degree', 'completely', [
    { text:'Robots have slightly changed the way cars are made.', misconceptionCategory:'degree_change' },
    { text:'Robots have not changed the way cars are made.', misconceptionCategory:'polarity_change' },
    { text:'Robots have completely changed the way cars are sold.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_transformed']),
  idea('operator', 'The operator must check the machine before every shift.', ['The person who works the machine has to inspect it before each shift.', 'Before every shift, the machine has to be checked by the worker who controls it.', 'Each shift, the person using the machine must check it first.'], 'time', 'before every shift', [
    { text:'The person who works the machine must check it once a month.', misconceptionCategory:'quantity_change' },
    { text:'The manager must check the machine before every shift.', misconceptionCategory:'role_change' },
    { text:'The person who works the machine must clean it after every shift.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_operator']),
  idea('nutritionist', 'A nutritionist checks every new product before it goes on sale.', ['Each new product is checked by a food and health expert before it is sold.', 'Before any new product is sold, an expert on healthy eating examines it.', 'An expert in diet looks at every new product before it reaches the shops.'], 'time', 'before it goes on sale', [
    { text:'A diet expert checks every new product after it goes on sale.', misconceptionCategory:'time_change' },
    { text:'A diet expert checks a few new products before they go on sale.', misconceptionCategory:'quantity_change' },
    { text:'A chef checks every new product before it goes on sale.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_nutritionist']),
  idea('director', 'The director has decided to open a new office in Lagos.', ['The person in charge of the company has chosen to open a new office in Lagos.', 'A new office in Lagos will be opened, the head of the company has decided.', 'The company’s senior manager has made the decision to set up an office in Lagos.'], 'meaning', 'person in charge', [
    { text:'The head of the company has decided to close the office in Lagos.', misconceptionCategory:'polarity_change' },
    { text:'A trainee has decided to open a new office in Lagos.', misconceptionCategory:'role_change' },
    { text:'The head of the company may open a new office in Lagos one day.', misconceptionCategory:'certainty_change' }
  ], ['vocab_director']),
  idea('expert', 'The company asked an expert to check the safety of the new building.', ['The firm asked a specialist to make sure the new building was safe.', 'A person with special knowledge was asked by the company to examine how safe the new building was.', 'The company wanted someone highly skilled to inspect the safety of the new building.'], 'meaning', 'person with special knowledge', [
    { text:'The company asked a beginner to check the safety of the new building.', misconceptionCategory:'meaning_confusion' },
    { text:'The company asked a specialist to design the new building.', misconceptionCategory:'action_change' },
    { text:'The company did not ask anyone to check the safety of the new building.', misconceptionCategory:'polarity_change' }
  ], ['vocab_expert']),
  idea('engineer', 'The engineer has designed a car that runs on hydrogen.', ['A car powered by hydrogen has been designed by the technical expert.', 'The person trained in designing machines has created a hydrogen-powered car.', 'A hydrogen car is the new design of the technical specialist.'], 'meaning', 'person who designs machines', [
    { text:'The technical expert has bought a car that runs on hydrogen.', misconceptionCategory:'meaning_confusion' },
    { text:'The technical expert will design a car that runs on hydrogen.', misconceptionCategory:'time_change' },
    { text:'The technical expert has designed a car that runs on petrol.', misconceptionCategory:'detail_change' }
  ], ['vocab_engineer_8']),
  idea('scientist', 'A scientist at the university has discovered a new way to clean water.', ['A university researcher has found a new method of cleaning water.', 'A new method for making water clean has been found by a university researcher.', 'Someone who does research at the university has found a fresh way to purify water.'], 'meaning', 'researcher', [
    { text:'A student at the university has bought a new machine to clean water.', misconceptionCategory:'meaning_confusion' },
    { text:'A university researcher will try to discover a new way to clean water.', misconceptionCategory:'time_change' },
    { text:'A university researcher has discovered a new way to pollute water.', misconceptionCategory:'polarity_change' }
  ], ['vocab_scientist']),
  idea('assignment', 'All students must hand in their assignment by Friday.', ['Every student has to submit the set piece of work by Friday.', 'The task the students were given must be handed in by everyone by Friday.', 'By Friday, each student needs to give in their piece of set work.'], 'time', 'by Friday', [
    { text:'All students must hand in their set work by next month.', misconceptionCategory:'time_change' },
    { text:'Only some students must hand in their set work by Friday.', misconceptionCategory:'quantity_change' },
    { text:'All students must collect their prize by Friday.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_assignment']),
  idea('employment', 'The new factory will provide employment for five hundred people.', ['Five hundred people will get jobs at the new factory.', 'The new factory will give paid work to five hundred people.', 'Jobs for five hundred people will be created by the new factory.'], 'quantity', 'five hundred', [
    { text:'The new factory will provide jobs for fifty people.', misconceptionCategory:'quantity_change' },
    { text:'The new factory will provide training for five hundred people.', misconceptionCategory:'meaning_confusion' },
    { text:'The new factory has stopped giving jobs to five hundred people.', misconceptionCategory:'polarity_change' }
  ], ['vocab_employment']),
  idea('traditional', 'The company still makes its cheese using traditional methods.', ['The firm continues to make its cheese in the way it has been made for centuries.', 'Long-established methods are still used by the company to produce its cheese.', 'The company has not changed the old way it makes its cheese.'], 'meaning', 'long-established', [
    { text:'The company now makes its cheese using modern machines.', misconceptionCategory:'meaning_confusion' },
    { text:'The company used to make its cheese using old methods.', misconceptionCategory:'time_change' },
    { text:'The company makes its butter using old methods.', misconceptionCategory:'detail_change' }
  ], ['vocab_traditional']),
  idea('trainer', 'A trainer will teach all new staff how to use the software.', ['All new employees will be taught how to use the software by a person who trains staff.', 'Someone whose job is teaching skills will show every new worker how the software works.', 'Every new member of staff will learn the software from a coach.'], 'quantity', 'all new staff', [
    { text:'A coach will teach some new staff how to use the software.', misconceptionCategory:'quantity_change' },
    { text:'The new staff will teach a coach how to use the software.', misconceptionCategory:'role_reversal' },
    { text:'A coach will teach all new staff how to repair the computers.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_trainer']),
  idea('technology', 'Many factory jobs have disappeared because of new technology.', ['Lots of factory jobs no longer exist because of modern machines and computers.', 'Modern equipment has replaced many jobs in factories.', 'Because of new machines and computer systems, plenty of factory jobs have gone.'], 'cause_effect', 'because of new machines', [
    { text:'Many factory jobs have been created because of new machines.', misconceptionCategory:'polarity_change' },
    { text:'A few factory jobs have disappeared because of new machines.', misconceptionCategory:'quantity_change' },
    { text:'Many factory jobs have disappeared because of high taxes.', misconceptionCategory:'cause_change' }
  ], ['vocab_technology']),
  idea('creative', 'The company is looking for creative designers to work on its new games.', ['The firm wants designers who are full of original ideas for its new games.', 'Imaginative designers are needed by the company for its new games.', 'The company needs designers who can think of new ideas to work on its next games.'], 'meaning', 'imaginative', [
    { text:'The company is looking for careful testers to work on its new games.', misconceptionCategory:'meaning_confusion' },
    { text:'The company is getting rid of imaginative designers.', misconceptionCategory:'polarity_change' },
    { text:'The company was looking for imaginative designers last year.', misconceptionCategory:'time_change' }
  ], ['vocab_creative']),
  idea('wellbeing', 'The company believes that staff wellbeing is more important than profit.', ['The firm thinks that the health and happiness of its workers matter more than making money.', 'According to the company, how well and happy employees feel is more important than earnings.', 'Making money matters less to the company than keeping its staff healthy and happy.'], 'comparison', 'more important than profit', [
    { text:'The company believes that profit is more important than staff health and happiness.', misconceptionCategory:'comparison_reversal' },
    { text:'The company believes that staff salaries are more important than profit.', misconceptionCategory:'meaning_confusion' },
    { text:'The company once believed that staff health and happiness mattered more than profit.', misconceptionCategory:'time_change' }
  ], ['vocab_wellbeing'])
];

export default [...phraseSets, ...ideaSets];
