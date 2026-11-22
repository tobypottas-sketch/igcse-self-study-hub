// Unit 9: Communication formal check. Same contract as Units 4, 6, 7 and 8: three forms of ten (six passage gaps, two paraphrase, one word-form, one precision).
// Thirty different Unit 9 targets, ten per form. All passages and sentences are new: none comes from a pathway activity.
const mcq = (id, target, type, prompt, choices, answer, diagnostic, explanation) => ({ id, target, type, prompt, choices, answer, diagnostic, explanation });
const typed = (id, target, prompt, answer, diagnostic, explanation) => ({ id, target, type:'word_form', prompt, answer, diagnostic, explanation });

const formA = {
  id:'A',
  title:'A debate about phones at school',
  passage:`Last month our school held a debate about mobile phones. The first speaker argued that phones have changed [[1]] between friends, because most teenagers now type messages instead of talking. She believed phones should be [[2]] during lessons, since nobody can concentrate when screens keep lighting up.\n\nThe second speaker disagreed. He said that phones are [[3]] in some lessons, for example when a class needs to check a word quickly. However, he agreed that a [[4]] chat is still better than a text when a friend has a serious problem, because you can see each other.\n\nA teacher added that much of what we mean is [[5]]: smiles, gestures and eye contact are lost in a message. Finally, a student described her [[6]] when a friend misunderstood a short text and stopped speaking to her for a week.`,
  questions:[
    mcq('A1','u9_01_communication','passage_mcq','Which word best completes gap 1?',['communication','generation','perception','conference'],'communication','Typing messages and talking are both ways of sharing ideas with friends.','Communication is the act of sharing information, ideas or feelings with other people.'),
    mcq('A2','u9_14_banned','passage_mcq','Which word best completes gap 2?',['banned','launched','represented','demonstrated'],'banned','She wants phones to be officially not allowed in class.','Banned means officially not allowed, usually by a rule or law.'),
    mcq('A3','u9_13_appropriate','passage_mcq','Which word best completes gap 3?',['appropriate','passive','portable','casual'],'appropriate','He thinks phones are right and acceptable for some classroom tasks.','Appropriate means suitable or right for a particular situation.'),
    mcq('A4','u9_31_face_to_face','passage_mcq','Which word best completes gap 4?',['face-to-face','informal','optional','portable'],'face-to-face','The two friends are in the same place and can see each other.','Face-to-face describes communication where people are physically together and can see each other.'),
    mcq('A5','u9_25_non_verbal','passage_mcq','Which word best completes gap 5?',['non-verbal','interactive','effective','optional'],'non-verbal','Smiles, gestures and eye contact do not use words.','Non-verbal communication is communication without words, through body language, facial expressions and gestures.'),
    mcq('A6','u9_19_frustration','passage_mcq','Which word best completes gap 6?',['frustration','solution','accuracy','research'],'frustration','Think about how she felt when she could not fix the misunderstanding.','Frustration is the feeling of being annoyed or upset because you cannot do or achieve what you want.'),
    mcq('A7','u9_10_tech_savvy','paraphrase_mcq','My grandmother is surprisingly good at using new technology: she edits her own videos on her tablet. Which word best replaces good at using new technology?',['tech-savvy','up-to-date','face-to-face','non-verbal'],'tech-savvy','Look for an informal adjective for someone who knows a lot about modern devices.','Tech-savvy means knowing a lot about modern technology and being able to use it well.'),
    mcq('A8','u9_16_optional','paraphrase_mcq','Joining the after-school drama club is not compulsory, so every student can decide for themselves. Which word best replaces not compulsory?',['optional','appropriate','physical','relevant'],'optional','Think about an adjective for something you can choose to do or not do.','Optional means available if you want it, but not required.'),
    typed('A9','u9_12_accuracy','Complete the sentence using the correct form of accuracy: “The reporter checked every fact to make sure that the article was ______.”','accurate','You need an adjective after “was”.','Accuracy is the noun; accurate is the adjective for something that is correct and exact.'),
    mcq('A10','u9_49_constructive','precision_mcq','Which phrase is most natural?',['constructive criticism','constructive mistake','constructive rumour','constructive silence'],'constructive criticism','Think about comments that are meant to help someone improve.','Constructive means helpful and intended to improve something; constructive criticism points out problems in a useful way.')
  ]
};

const formB = {
  id:'B',
  title:'A design company that works online',
  passage:`When the pandemic began, a small design company had to change the way its [[1]] operated almost overnight. All twelve employees started working from home and used an online [[2]] to share files, plans and messages.\n\nAt first, some staff found [[3]] meetings tiring, because they spent hours looking at faces on a screen. The company still holds one big [[4]] every spring, when clients and staff travel to a hotel to discuss new ideas together.\n\nThe manager allows a [[5]] dress code at home, so jeans and T-shirts are fine. She also set up an online [[6]] where employees can chat about their hobbies, which helps people feel that they belong to a group.`,
  questions:[
    mcq('B1','u9_22_workforce','passage_mcq','Which word best completes gap 1?',['workforce','audience','purpose','perception'],'workforce','You need a noun for all the people who work for the company.','A workforce is all the people who work for a company or in a country.'),
    mcq('B2','u9_29_platform','passage_mcq','Which word best completes gap 2?',['platform','conference','introduction','perception'],'platform','Think about the online system the staff use to share files.','A platform is a system or website that people use to share information or run programs.'),
    mcq('B3','u9_30_virtual','passage_mcq','Which word best completes gap 3?',['virtual','physical','portable','constructive'],'virtual','These meetings happen on a screen, not in a real room.','Virtual describes something that happens online or on a computer rather than in the physical world.'),
    mcq('B4','u9_32_conference','passage_mcq','Which word best completes gap 4?',['conference','platform','workforce','generation'],'conference','Clients and staff meet in a hotel to talk about ideas.','A conference is a large formal meeting where people discuss a subject, often over one or more days.'),
    mcq('B5','u9_21_casual','passage_mcq','Which word best completes gap 5?',['casual','passive','relevant','effective'],'casual','Jeans and T-shirts are relaxed clothes.','Casual means relaxed and not formal, especially about clothes or behaviour.'),
    mcq('B6','u9_15_community','passage_mcq','Which word best completes gap 6?',['community','workforce','solution','research'],'community','The group helps people feel that they belong together.','A community is a group of people who share interests or live in the same area and feel connected.'),
    mcq('B7','u9_17_survive','paraphrase_mcq','Many small bookshops will not continue to exist unless they start selling online. Which word best replaces continue to exist?',['survive','represent','differentiate','demonstrate'],'survive','Look for a verb meaning to keep going despite difficulties.','Survive means to continue to live or exist, especially in a difficult situation.'),
    mcq('B8','u9_05_portable','paraphrase_mcq','Modern laptops are light and small enough to carry easily, so students can work almost anywhere. Which word best replaces light and small enough to carry easily?',['portable','physical','virtual','passive'],'portable','Think about an adjective for devices you can take with you.','Portable means light and small enough to be carried or moved easily.'),
    typed('B9','u9_09_interactive_9','Complete the sentence using the correct form of interactive: “In the science museum, children can ______ with robots by asking them questions.”','interact','You need a verb after “can”.','Interactive is the adjective; interact is the verb meaning to communicate with or react to someone or something.'),
    mcq('B10','u9_41_recommend_9','precision_mcq','Which sentence is most natural?',['I recommend booking early.','I recommend to book early.','I recommend that booking early.','I recommend for booking early.'],'I recommend booking early.','Think about the verb form that follows this verb when no person is named.','Recommend is followed by an -ing form or a that-clause, as in I recommend booking early or I recommend that you book early.')
  ]
};

const formC = {
  id:'C',
  title:'Writing a report for the school magazine',
  passage:`Before you write a report, think carefully about its [[1]]: are you trying to inform readers, persuade them or simply entertain them? You should also consider your [[2]], because a report for parents needs a different tone from one for younger students.\n\nIn the [[3]], explain briefly what the report is about. Then present the [[4]] you carried out, such as the survey results and interviews. Include only information that is [[5]] to your topic, because interesting but unrelated details will confuse readers.\n\nFinally, in the [[6]], bring together your main points and make clear what you think should happen next.`,
  questions:[
    mcq('C1','u9_46_purpose','passage_mcq','Which word best completes gap 1?',['purpose','audience','research','clause'],'purpose','The question after the colon asks what the writer is trying to achieve.','The purpose of a text is the reason it is written, such as to inform, persuade or entertain.'),
    mcq('C2','u9_45_audience','passage_mcq','Which word best completes gap 2?',['audience','purpose','platform','conclusion'],'audience','Parents and younger students are the people who will read the report.','The audience is the group of people who read, watch or listen to something.'),
    mcq('C3','u9_43_introduction','passage_mcq','Which word best completes gap 3?',['introduction','conclusion','research','community'],'introduction','This is the first section, which says what the report is about.','An introduction is the first part of a piece of writing, which explains what it is about.'),
    mcq('C4','u9_50_research','passage_mcq','Which word best completes gap 4?',['research','purpose','solution','frustration'],'research','Surveys and interviews are ways of collecting information.','Research is detailed study of a subject to discover new information.'),
    mcq('C5','u9_48_relevant_9','passage_mcq','Which word best completes gap 5?',['relevant','optional','casual','passive'],'relevant','The information must be closely connected to the topic.','Relevant means closely connected with the subject you are discussing.'),
    mcq('C6','u9_44_conclusion','passage_mcq','Which word best completes gap 6?',['conclusion','introduction','platform','generation'],'conclusion','This is the final section, which brings the main points together.','A conclusion is the last part of a piece of writing, which summarises the main points.'),
    mcq('C7','u9_27_differentiate','paraphrase_mcq','Young children cannot always tell the difference between adverts and real news. Which word best replaces tell the difference?',['differentiate','demonstrate','represent','evaluate'],'differentiate','Look for a verb meaning to see how two things are not the same.','Differentiate means to see or show the difference between two or more things.'),
    mcq('C8','u9_06_demonstrate_9','paraphrase_mcq','In tomorrow’s lesson, the science teacher will show how the new microscope works. Which word best replaces show?',['demonstrate','represent','recommend','evaluate'],'demonstrate','Think about a verb for showing people how something is done.','Demonstrate means to show how something works or how to do something.'),
    typed('C9','u9_33_suitable','Complete the sentence using the correct form of suitable: “The film is ______ for young children because it contains a lot of violence.”','unsuitable','You need an adjective with a negative prefix, because the film is not right for children.','Suitable means right for a particular person or purpose; unsuitable is its opposite.'),
    mcq('C10','u9_40_suggest','precision_mcq','Which sentence is most natural?',['She suggested going to the museum.','She suggested to go to the museum.','She suggested us to go to the museum.','She suggested for going to the museum.'],'She suggested going to the museum.','Think about the verb form that follows this verb.','Suggest is followed by an -ing form or a that-clause, as in She suggested going or She suggested that we go.')
  ]
};

export const unit9VocabularyCheck = Object.freeze({
  unitNumber:9,
  title:'Unit Vocabulary Check',
  course:'Cambridge IGCSE ESL 0511',
  maxAttempts:3,
  forms:Object.freeze({ A:formA, B:formB, C:formC })
});

export default unit9VocabularyCheck;
