// Unit 9 · Meaning · Apply and Mastery — authored wrong meanings, WORDS 1–50 (complete). Same contract as unit-08-meaning-mastery.js:
// two records per word in the order of the word's two Mastery contexts; exactly three authored WRONG glosses, same grammar and similar length
// as the correct gloss, plausible in general, wrong in this sentence.
const w = (wrongMeanings, extra = {}) => ({ wrongMeanings, ...extra });

export default Object.freeze({
  communication: [
    w(['the ability to work long hours without a break', 'the ability to repair computers quickly', 'the ability to follow rules carefully']),
    w(['the supply of electricity and clean water', 'the movement of cars along the roads', 'the delivery of food to the shops'])
  ],
  signalling: [
    w(['making a loud complaint to someone', 'staying silent so nobody notices', 'writing a message on paper']),
    w(['hiding a problem from the driver', 'recording a journey for later', 'playing music to the passengers'])
  ],
  represent: [
    w(['to cause a feeling or emotion', 'to hide a meaning from others', 'to replace an older symbol']),
    w(['to compete against a group', 'to leave a group permanently', 'to train a group of beginners'])
  ],
  effective: [
    w(['cheap but slow to produce', 'popular but hard to understand', 'new but not yet tested']),
    w(['costing more than was planned', 'lasting longer than was planned', 'attracting more criticism than expected'])
  ],
  portable: [
    w(['very expensive to buy', 'attached to one place', 'easy to break']),
    w(['too large to fit through a door', 'only usable by one teacher', 'designed to stay on one wall'])
  ],
  demonstrate: [
    w(['to explain something only in writing', 'to ask others how to do something', 'to refuse to show how something works']),
    w(['to suggest that something might be false', 'to guess something without evidence', 'to hide that something is true'])
  ],
  launched: [
    w(['stopped selling to customers', 'kept secret from the public', 'tested only by engineers']),
    w(['ended an activity early', 'criticised an activity publicly', 'paid for an activity secretly'])
  ],
  passive: [
    w(['angry and critical', 'well informed and curious', 'loud and excited']),
    w(['eager to argue', 'very well prepared', 'in charge of the event'])
  ],
  interactive: [
    w(['shown to a large audience at once', 'printed on paper for each student', 'kept private from the teacher']),
    w(['written only by professional journalists', 'updated once a week', 'free of advertising'])
  ],
  'tech-savvy': [
    w(['nervous about using modern technology', 'living far from the nearest town', 'interested only in low prices']),
    w(['worried about using modern devices', 'unable to see small writing clearly', 'too busy to use technology'])
  ],
  'digital native': [
    w(['someone who works in a computer shop', 'someone who avoids using the internet', 'someone who moved from another country']),
    w(['a person who designs computer programs', 'a person who learned technology late in life', 'a person who works from home'])
  ],
  accuracy: [
    w(['how quickly something is done', 'how cheap something is', 'how popular something is']),
    w(['speed without hesitation', 'creativity and imagination', 'length and detail'])
  ],
  appropriate: [
    w(['too long for the situation', 'difficult for the situation', 'funny in the situation']),
    w(['interesting to a particular person', 'too expensive for a particular person', 'frightening for a particular person'])
  ],
  banned: [
    w(['strongly recommended', 'made cheaper', 'officially required']),
    w(['officially chosen to do something', 'paid extra to do something', 'trained to do something'])
  ],
  community: [
    w(['a company that sells products', 'a website that stores files', 'a person who works alone']),
    w(['the government of the country', 'the workers from abroad', 'the tourists visiting the area'])
  ],
  optional: [
    w(['compulsory for everyone', 'too difficult to continue', 'only for the best students']),
    w(['a strict rule for everyone', 'a punishment for breaking rules', 'a tradition from the past'])
  ],
  survive: [
    w(['to become more popular', 'to change very quickly', 'to be replaced by something new']),
    w(['to be damaged badly by something', 'to be sold after something', 'to be copied after something'])
  ],
  unlike: [
    w(['in the same way as', 'because of', 'at the same time as']),
    w(['similar to', 'chosen by', 'replaced by'])
  ],
  frustration: [
    w(['great excitement because something worked', 'deep sadness because of a loss', 'calm patience while waiting']),
    w(['the feeling of being extremely tired', 'the feeling of being proud', 'the feeling of being frightened'])
  ],
  informal: [
    w(['serious and polite in style', 'long and detailed in style', 'scientific in style']),
    w(['very strict and serious', 'secret and private', 'long and tiring'])
  ],
  casual: [
    w(['very smart and expensive', 'carefully planned', 'serious and traditional']),
    w(['rude and aggressive in manner', 'shy and quiet in manner', 'strict and serious in manner'])
  ],
  workforce: [
    w(['all the people who buy products', 'all the machines in offices', 'all the rules at work']),
    w(['all the managers of a company', 'all the customers of a company', 'all the products of a company'])
  ],
  generation: [
    w(['people who work in the same company', 'people who live in the same street', 'people who speak the same language']),
    w(['the people of one family considered together', 'the people of one country considered together', 'the people of one profession considered together'])
  ],
  perception: [
    w(['the price that people pay for something', 'the history of something', 'the rules about something']),
    w(['a fear about a situation', 'a fact proved about a situation', 'a plan for a situation'])
  ],
  'non-verbal': [
    w(['written in a short message', 'spoken in a loud voice', 'recorded on video']),
    w(['using written words rather than speech', 'using loud sounds rather than words', 'using emojis rather than letters'])
  ],
  underlying: [
    w(['the most obvious cause that everyone sees', 'a minor cause that does not matter', 'the cause that appears last']),
    w(['clearly printed on the surface', 'added as a joke', 'meant only for children'])
  ],
  differentiate: [
    w(['to mix up two things', 'to combine two things', 'to copy two things']),
    w(['to make itself the same as others', 'to join together with others', 'to sell itself more cheaply than others'])
  ],
  physical: [
    w(['existing only online', 'very old and historic', 'run by the government']),
    w(['imaginary rather than real', 'online rather than in person', 'written rather than spoken'])
  ],
  platform: [
    w(['a piece of computer equipment', 'a group of software engineers', 'a password for an account']),
    w(['a room for formal meetings', 'a cable that carries signals', 'a person who manages calls'])
  ],
  virtual: [
    w(['happening in a large hall', 'happening very early in the morning', 'happening only once a year']),
    w(['built from real stone and wood', 'painted by hand on paper', 'shown in a museum'])
  ],
  'face-to-face': [
    w(['by email, without meeting', 'over the phone, without seeing', 'online, with cameras off']),
    w(['happening online with no camera', 'happening at home alone', 'happening through written messages'])
  ],
  conference: [
    w(['a short private chat', 'a written report on a subject', 'a quiet place for studying']),
    w(['a recorded film shown online', 'a single phone call between two people', 'a written newsletter sent to staff'])
  ],
  suitable: [
    w(['too expensive for a particular purpose', 'famous for a particular purpose', 'dangerous for a particular purpose']),
    w(['very early and inconvenient', 'already fully booked', 'long and boring'])
  ],
  'underlying meaning': [
    w(['the message printed in large letters', 'the meaning given in a dictionary', 'the name of the company']),
    w(['the exact words a person uses', 'the tone of voice a person uses', 'the language a person speaks'])
  ],
  'informal language': [
    w(['official words used in legal documents', 'technical words used in science', 'foreign words borrowed from other languages']),
    w(['very formal words not suitable for friends', 'difficult words used by experts', 'old words no longer used'])
  ],
  'formal style': [
    w(['a relaxed, chatty way of writing', 'a funny way of writing', 'a short way of writing']),
    w(['a relaxed way of speaking for parties', 'a fast way of speaking for news', 'a quiet way of speaking for libraries'])
  ],
  'reporting verb': [
    w(['a word like quickly or slowly that tells us how', 'a word like big or small that describes a noun', 'a word like who or what that begins a question']),
    w(['a word such as run, jump or swim that shows movement', 'a word such as and, but or so that joins sentences', 'a word such as here, there or now that shows place or time'])
  ],
  'direct object': [
    w(['the person who does the action', 'the word that describes how', 'the time when the action happens']),
    w(['the person who gives praise', 'the place where the action happens', 'the reason for the action'])
  ],
  clause: [
    w(['a single word that describes a noun', 'a punctuation mark between sentences', 'a paragraph at the end of an essay']),
    w(['a single word showing time', 'a full paragraph of writing', 'a title at the top of a page'])
  ],
  suggest: [
    w(['to order someone strictly', 'to refuse to allow something', 'to complain about something']),
    w(['to demand something angrily', 'to reject a plan', 'to report a problem'])
  ],
  recommend: [
    w(['to warn against something', 'to complain about something', 'to forbid something']),
    w(['to say that something is too expensive', 'to say that something is boring', 'to say that something is dangerous'])
  ],
  solution: [
    w(['a description of how serious a problem is', 'a list of the causes of a problem', 'a question about a problem']),
    w(['a reason why something went wrong', 'a person who reports a problem', 'a test that shows a problem'])
  ],
  introduction: [
    w(['the closing part of a piece of writing', 'the list of sources at the end', 'the title on the cover']),
    w(['the end of a talk', 'the questions after a talk', 'the slides used in a talk'])
  ],
  conclusion: [
    w(['the opening part of a piece of writing', 'the title of a piece of writing', 'the longest part of a piece of writing']),
    w(['a question asked before deciding', 'a guess made without evidence', 'a disagreement between experts'])
  ],
  audience: [
    w(['the people who write something', 'the people who print something', 'the people who sell something']),
    w(['the people organising a talk', 'the people recording a talk', 'the people paying for a talk'])
  ],
  purpose: [
    w(['the cost of an activity', 'the location of an activity', 'the timing of an activity']),
    w(['what a text accidentally shows', 'how long a text is', 'who wrote a text'])
  ],
  evaluate: [
    w(['to list strengths and weaknesses without judging', 'to copy strengths and weaknesses from a source', 'to ignore strengths and weaknesses']),
    w(['to pay for something', 'to advertise something', 'to install something'])
  ],
  relevant: [
    w(['unconnected with the subject', 'longer than the subject', 'older than the subject']),
    w(['unusual for the situation being discussed', 'dangerous in the situation being discussed', 'secret in the situation being discussed'])
  ],
  constructive: [
    w(['unkind and intended to hurt', 'very short and unclear', 'unrelated to the work']),
    w(['long and boring with no results', 'angry and unfriendly', 'secret and unofficial'])
  ],
  research: [
    w(['a quick guess without evidence', 'a short look at headlines', 'a personal opinion online']),
    w(['popular opinion that has not been tested', 'a story shared on social media', 'an advert for a product'])
  ]
});
