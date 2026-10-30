// Reviewed misspellings, keyed by vocabularyId. A spelling error belongs to the lexical item, not to a unit: one entry here serves
// every unit that contains the word, so there is never a second, separately maintained set. Each unit's build attaches these to the
// word's published data. Plausible-misspelling generation (spelling-errors.js) still tops up any word that has fewer than three.
export const LEXICAL_SPELLING_ERRORS = Object.freeze({
  "vocab_leisure":["leisur time","lesiure time","liesure time","leasure time","leisuer time","lesure time"], // leisure time
  "vocab_preference":["preferance","prefrence","prefference","preferrence","prefernce","preferense"], // preference
  "vocab_avoid":["aviod","avoyd","avoide","avoied","avode","avoidd"], // avoid
  "vocab_afford":["aford","affored","afforde","afferd","afoord","affoard"], // afford
  "vocab_deny":["denie","deney","dany","denay","deni","denny"], // deny
  "vocab_permit":["pemit","permet","permitt","premit","permmit","permiet"], // permit
  "vocab_arrange":["arange","arrenge","arrnage","arrage","arrang","arrangge"], // arrange
  "vocab_urge":["urdge","uerge","urege","urgue","urgge","ugre"], // urge
  "vocab_recommend":["recomend","reccomend","recommed","recomand","recommand","reccommend"], // recommend
  "vocab_demand":["demend","damand","demmand","deamnd","demant","demund"], // demand
  "vocab_threaten":["threten","thretan","threatan","thretten","threaton","theaten"], // threaten
  "vocab_resent":["resant","resint","resnet","ressent","resentt","resentd"], // resent
  "vocab_regret":["regrett","regert","regrat","regreat","reggret","rigret"], // regret
  "vocab_unfamiliar":["unfamilar","unfamiliare","unfimiliar","unfamilliar","unfammiliar","unfamiler"], // unfamiliar
  "vocab_racquet":["racquit","racqet","raquet","racqeut","racquett","rackquet"], // racquet
  "vocab_opponent":["oponent","opponant","oppenent","opponet","opponnent","oppnent"], // opponent
  "vocab_intense":["intence","intens","intese","intesne","intsense","entense"], // intense
  "vocab_tournament":["tornament","tournement","tourment","tournamnet","toornament","tournamant"], // tournament
  "vocab_determined":["determind","determaned","detirmined","determinned","determiend","detirmend"], // determined
  "vocab_discipline":["disipline","discipine","dicipline","discapline","disciplin","discipleine"], // discipline
  "vocab_goal_oriented":["goal-orriented","goal oriented","goaloriented","goal-orianted","goal-orientted","gole-oriented"], // goal-oriented
  "vocab_achievement":["acheivement","achievment","achievemant","acheivment","achivement","achievemnet"], // achievement
  "vocab_elite":["elit","eilte","ellite","elete","elyte","elitte"], // elite
  "vocab_overwhelming":["overwelming","overwhelmeng","overwhleming","overwhellming","overwhealming","overwhelning"], // overwhelming
  "vocab_generation":["genaration","generatoin","generasion","generetion","generaton","jeneration"], // generation
  "vocab_challenge":["chalenge","challange","chalenje","chalange","challege","chalengge"], // challenge
  "vocab_solution":["solusion","solutoin","soloution","soluton","sollution","solucion"], // solution
  "vocab_pastime":["pasttime","pastim","pastyme","passtime","pasetime","pastimme"], // pastime
  "vocab_feat":["feet","feit","feate","fiet","feeat","featt"], // feat
  "vocab_regardless":["regardles","regardlss","regaurdless","regardlass","regaredless","rigardless"], // regardless
  "vocab_monetary":["monatary","monetery","monitary","monetory","monnetary","monitery"], // monetary
  "vocab_estimated":["estamated","estimeted","estemated","estimatd","esstimated","estimmated"], // estimated
  "vocab_struggle":["strugle","struggel","strugel","struggal","strugal","struggol"], // struggle
  "vocab_minimum":["minimun","minumum","minimom","minimium","miniumum","minnimum"], // minimum
  "vocab_championship":["champianship","champeonship","championshp","championsip","champonship","championchip"], // championship
  "vocab_competitor":["competator","competiter","competetor","compeditor","competitar","compettitor"], // competitor
  "vocab_relatively":["relativly","relatevely","relativelly","realatively","relativley","relitively"], // relatively
  "vocab_patience":["patients","pasience","patiense","paitence","patiance","pateince"], // patience
  "vocab_atmosphere":["atmosfere","atmospher","atmoshpere","athmosphere","atmosphear","atmosphire"], // atmosphere
  "vocab_incredible":["incredable","increadible","incredibal","incridible","incrediable","increedible"], // incredible
  "vocab_criteria":["criterea","critiria","criteriea","cryteria","critera","criterria"], // criteria
  "vocab_historic":["historick","histroic","hystoric","historec","historik","historyc"], // historic
  "vocab_selection":["selecsion","selektion","selction","selecttion","sellection","selectian"], // selection
  "vocab_produce":["prodouce","produse","prodduce","prodyce","produsse","producee"], // produce
  "vocab_craftspeople":["craftspeeple","craftpeople","craftspeaple","craftspeepal","craftspeoples","craftsepople"], // craftspeople
  "vocab_significant":["signifacant","significent","signficant","signifficant","significat","sinificant"], // significant
  "vocab_expansion":["expantion","expanshion","expension","expanssion","expandsion","expasion"], // expansion
  "vocab_reputation":["repution","reputaton","reputasion","repetation","reputashun","reputtation"], // reputation
  "vocab_reasonable":["reasonible","resonable","reasonnable","reasonabal","reasenable","reasonble"], // reasonable
  "vocab_antiques":["antikes","antiqes","antiqus","anteques","antiquies","antikeys"], // antiques
  "vocab_admit":["admitt","admet","ammit","admmit","adimit","admite"], // admit (Unit 2)
  "vocab_entertainment":["entertainmant","entertaiment","enterteinment","entertianment","entertainement","entertainmeant"], // entertainment (Unit 2)
  "vocab_access":["acess","acces","axcess","accses","acsess","accesss"], // access (Unit 2)
  "vocab_device":["divice","devic","deveice","devvice","deviec"], // device (Unit 2)
  "vocab_digital":["digitel","digitall","digtal","dijital","digitale","degital"], // digital (Unit 2)
  "vocab_streaming":["streeming","streming","streamimg","streammng","streamin","streeaming"], // streaming (Unit 2)
  "vocab_relevant":["relevent","relavant","revelant","relevat","relivant","relevaant"], // relevant (Unit 2)
  "vocab_educator":["educater","edukator","educatar","eductor","educaitor","edducator"], // educator (Unit 2)
  "vocab_essential":["essencial","esential","essentail","essensial","essentual","esssential"], // essential (Unit 2)
  "vocab_current_affairs":["curent affairs","current affaires","current afairs","current affares","currant affairs","current affiars"], // current affairs (Unit 2)
  "vocab_apparently":["apparantly","aparently","apparentlly","apparrently","apperently","aparrently"], // apparently (Unit 2)
  "vocab_supposedly":["supposidly","suposedly","supposeddly","suppossedly","supposebly","supposadly"], // supposedly (Unit 2)
  "vocab_celebrity":["celebrety","celibrity","celebritty","celabrity","celebraty","celebirty"], // celebrity (Unit 2)
  "vocab_informed":["infomed","informd","enformed","inforrmed","informmed","imformed"], // informed (Unit 2)
  "vocab_communicate":["comunicate","communcate","communikate","comunnicate","communicat","comminicate"], // communicate (Unit 2)
  "vocab_remotely":["remotly","remotley","remotelly","remoetly","rimotely","remotelie"], // remotely (Unit 2)
  "vocab_transform":["transfrom","tranform","transfom","trasform","transferm","transforn"], // transform (Unit 2)
  "vocab_percentage":["percentege","precentage","percantage","percentge","pecentage","persentage"], // percentage (Unit 2)
  "vocab_impression":["impresion","impresssion","imprestion","impreshion","inpression","empression"], // impression (Unit 2)
  "vocab_remote_control":["remot control","remote contrel","remote controll","remoat control","remote cotrol","remote contol"], // remote control (Unit 2)
  "vocab_feature":["featur","feture","feeature","featuer","fearture","feachure"], // feature (Unit 2)
  "vocab_function":["funtion","fuction","funcion","functon","functoin","funccion"], // function (Unit 2)
  "vocab_interactive":["intaractive","interactiv","interactave","intreractive","interractive","interective"], // interactive (Unit 2)
  "vocab_widespread":["widespred","widesprad","wydespread","widespreed","widdespread","widesread"], // widespread (Unit 2)
  "vocab_availability":["availablity","avalibility","availabilty","aviability","availibility","availabilaty"], // availability (Unit 2)
  "vocab_high_performance":["high-preformance","high-performence","high-perfomance","high-performanse","high-peformance","high-performanc"], // high-performance (Unit 2)
  "vocab_stabilising":["stablising","stabillising","stabiliseing","stabalising","stabilisng","stebilising"], // stabilising (Unit 2): "stabilizing" is the valid US spelling, so it is not listed as an error
  "vocab_multi_task":["multi task","mult-task","multi-tsak","multy-task","multi-taks","mutli-task"], // multi-task (Unit 2): "multitask" is an accepted variant, so it is not listed as an error
  "vocab_predictable":["predicable","predictible","predictabel","predectable","preditable","predictabull"], // predictable (Unit 2)
  "vocab_professional":["profesional","professinal","proffessional","proffesional","professionel","profesionnal"], // professional (Unit 2)
  "vocab_regional":["regonal","reigional","regeonal","regionel","regionall","reagional"], // regional (Unit 2)
  "vocab_commentary":["comentary","commentry","commentery","commenatry","comentry","commentarry"], // commentary (Unit 2)
  "vocab_educational":["educasional","eductional","educatinal","educationel","educatonal","edducational"], // educational (Unit 2)
  "vocab_culture":["culchure","cultur","cultue","kulture","cultere","culturre"], // culture (Unit 2)
  "vocab_genuine":["genuin","genwine","genuwine","genuiine","gennuine","genune"], // genuine (Unit 2)
  "vocab_amusing":["amuseing","amusung","amussing","amuzing","ammusing","amusinng"], // amusing (Unit 2)
  "vocab_competitive":["competative","compettitive","competive","competitave","comptitive","competitiv"], // competitive (Unit 2)
  "vocab_critical":["critcal","critacal","critticall","criticle","critial","cricital"], // critical (Unit 2)
  "vocab_impressive":["impresive","impressiv","impressave","imprressive","impresssive","inpressive"], // impressive (Unit 2)
  "vocab_determination":["determnation","detirmination","determinasion","deturmination","determinattion","determenation"], // determination (Unit 2)
  "vocab_overcome":["overcom","ovarcome","overcomme","overkome","over come","overcum"], // overcome (Unit 2)
  "vocab_accessory":["accesory","acessory","accessary","accesorry","acsessory","axessory"], // accessory (Unit 2)
  "vocab_equipment":["equipement","equipmant","ekwipment","equiptment","equipmet","equipmment"], // equipment (Unit 2)
  "vocab_fixture":["fixtur","fixchure","fiksture","fixtre","fixure","fixtuer"], // fixture (Unit 2)
  "vocab_removable":["remuvable","removible","removabel","remmovable","removabal","remoovable"], // removable (Unit 2): "removeable" is not listed as an error because some dictionaries record it as a variant
  "vocab_adjustable":["adjustible","adjustabel","ajustable","adjustble","adjusstable","adjustabal"], // adjustable (Unit 2)
  "vocab_affordable":["affordible","afordable","affordabel","affoardable","affordabal","affforable"], // affordable (Unit 2)
  "vocab_external":["externel","exturnal","extenal","extrenal","eksternal","externall"], // external (Unit 2)
  "vocab_concentrate":["concentrat","consentrate","concentate","concentrait","concetrate","consentrait"], // concentrate (Unit 2)
});
