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
  "vocab_participant":["participent","particpant","partisipant","participaunt","particapant","particiant"], // participant (Unit 3)
  "vocab_outlet":["outlett","outlit","autlet","outlat","outlete","outlt"], // outlet (Unit 3)
  "vocab_sprinkled":["sprinckled","sprinkeld","sprinkledd","sprinkelled","sprinklled","spinkled"], // sprinkled (Unit 3)
  "vocab_underestimate":["understimate","underestimete","underestamate","underrestimate","underestemate","undaestimate"], // underestimate (Unit 3)
  "vocab_considerably":["considerabley","considerrably","considerbly","consederably","considerablly","considerabily"], // considerably (Unit 3)
  "vocab_guaranteed":["garanteed","guarenteed","guarantied","gaurenteed","guaranted","guarranteed"], // guaranteed (Unit 3)
  "vocab_harmless":["harmles","harmlis","harmlessa","harmeless","hermless","harmlesss"], // harmless (Unit 3)
  "vocab_pressure":["presure","pressur","pressher","preshure","presssure","pressere"], // pressure (Unit 3)
  "vocab_fooled":["fooleed","fouled","foold","fooldd","fuuled","fulled"], // fooled (Unit 3)
  "vocab_majority":["magority","majorety","majorrity","mejority","majoriti","majorty"], // majority (Unit 3)
  "vocab_inexpensive":["inexpensiv","inexpensife","inexpencive","inexspensive","unexpensive","inexpensve"], // inexpensive (Unit 3)
  "vocab_sodium":["sodeum","soduim","sodiem","sodum","sodiumm","soadium"], // sodium (Unit 3)
  "vocab_commercially":["comercially","commercialy","commerciely","commercialley","comersially","commercilly"], // commercially (Unit 3)
  "vocab_processed":["procesed","prosessed","proccessed","processd","processt","procssed"], // processed (Unit 3)
  "vocab_depression":["depresion","depretion","depresssion","deppression","depreshion","depresson"], // depression (Unit 3)
  "vocab_overweight":["overwieght","overwait","overweit","overwheight","overweigth","overwaight"], // overweight (Unit 3)
  "vocab_unwell":["unwel","unwelll","unwhel","onwell","unwll","unweel"], // unwell (Unit 3)
  "vocab_ingredients":["ingrediants","ingreedients","ingredents","ingridients","ingredientz","ingredeints"], // ingredients (Unit 3)
  "vocab_nutritious":["nutricious","nutritous","nutrishous","nutritiuos","nutritios","nuttritious"], // nutritious (Unit 3)
  "vocab_moderation":["moderashun","moderatoin","modaration","moderaton","moderration","moderacion"], // moderation (Unit 3)
  "vocab_deceive":["decieve","deceeve","deseive","deceave","decive","deceiv"], // deceive (Unit 3)
  "vocab_advertisement":["advertisment","advertizement","adverticement","advertisemant","adversisement","advertismant"], // advertisement (Unit 3)
  "vocab_variety":["variaty","varity","varietey","vareity","verity","varriety"], // variety (Unit 3)
  "vocab_portion":["porshun","portian","porsion","portoin","porttion","protion"], // portion (Unit 3)
  "vocab_purchase":["purchese","perchase","purchace","purchass","purcase","purchasse"], // purchase (Unit 3)
  "vocab_takeaway":["takeway","takaway","takeawy","takeawai","takaweay","takeaaway"], // takeaway (Unit 3)
  "vocab_barbecue":["barbeque","barbecu","barbacue","barbeceu","barbequ","barbicue"], // barbecue (Unit 3)
  "vocab_saturated":["saturaded","satturated","saturatid","saterated","saturted","sarurated"], // saturated (Unit 3)
  "vocab_convenient":["convienient","convinient","conveniant","convenint","conveneint","convenent"], // convenient (Unit 3)
  "vocab_extensive":["extencive","extensiv","extenisve","extentive","extensife","estensive"], // extensive (Unit 3)
  "vocab_fashionable":["fashonable","fasionable","fashionible","fashinable","fashionnable","fashionabel"], // fashionable (Unit 3)
  "vocab_satisfying":["satisfiing","satisfyng","satisfing","satsfying","satisfieing","satysfying"], // satisfying (Unit 3)
  "vocab_disappointed":["dissapointed","disapointed","disappointd","disappoinded","dissapoited","disappointted"], // disappointed (Unit 3)
  "vocab_inconvenient":["inconvienent","inconvinient","inconveniant","inconvenint","incovenient","inconvenent"], // inconvenient (Unit 3)
  "vocab_excellent":["excelent","exellent","excellant","excellint","ecxellent","excelllent"], // excellent (Unit 3)
  "vocab_polite":["polit","poilte","pollite","polight","polyte","pollight"], // polite (Unit 3)
  "vocab_helpful":["helpfull","helpfal","helfull","helpfool","halpful","helppful"], // helpful (Unit 3)
  "vocab_recommendation":["recomendation","reccomendation","recommendasion","recommedation","recommandation","recomendacion"], // recommendation (Unit 3)
  "vocab_informative":["informitive","infomative","informativ","enformative","informatif","informatuve"], // informative (Unit 3)
  "vocab_reflection":["refelction","reflaction","reflecsion","reflektion","reflecton","relfection"], // reflection (Unit 3)
  "vocab_organiser":["organizer","orginiser","orgainser","organisor","organisier","organnaiser"], // organiser (Unit 3)
  "vocab_presenter":["presentor","presanter","pressenter","presentar","prezenter","presnter"], // presenter (Unit 3)
  "vocab_evaluate":["evalute","evaluat","evalaute","evaluete","evluate","evalueate"], // evaluate (Unit 3)
  "vocab_consume":["consum","comsume","consoume","cunsume","consuem","consumme"], // consume (Unit 3)
  "vocab_balanced":["ballanced","balansed","balenced","balancd","balanceed","balaned"], // balanced (Unit 3)
  "vocab_calorie":["calory","calorey","callorie","calorrie","kalorie","calarie"], // calorie (Unit 3)
  "vocab_hygienic":["hygenic","hyginic","higienic","hygeinic","hygienick","hygienik"], // hygienic (Unit 3)
  "vocab_appetising":["appetizing","apetising","appetsing","appetiseing","appitising","appettising"], // appetising (Unit 3)
  "vocab_cuisine":["cuisene","quisine","cuisin","cusine","cuisinne","cuizine"], // cuisine (Unit 3)
  "vocab_breathtaking":["brethtaking","breathtakeing","breathtaiking","breathtacking","breaththaking","breathaking"], // breathtaking (Unit 4)
  "vocab_comfort":["comfurt","comfot","confort","comfert","cumfort","comfortt"], // comfort (Unit 4)
  "vocab_reality":["realaty","reallity","realitty","relaity","raelity","realiti"], // reality (Unit 4)
  "vocab_toughest":["tuffest","toughist","toughtest","touhgest","toughes","tougest"], // toughest (Unit 4)
  "vocab_storeys":["stories","storeis","storyes","storees","storrys","storys"], // storeys (Unit 4)
  "vocab_accommodate":["acommodate","accomodate","accommadate","acomodate","accommodete","accomodete"], // accommodate (Unit 4)
  "vocab_luxury":["luxery","luxary","lugzury","luxurry","luxuary","luxeri"], // luxury (Unit 4)
  "vocab_altitude":["altatude","altitute","altitud","altidude","alltitude","altituide"], // altitude (Unit 4)
  "vocab_landscape":["landscap","lanscape","landscpae","landskape","landscaipe","landscaep"], // landscape (Unit 4)
  "vocab_passenger":["pasenger","passanger","passeger","passangar","pasanger","pessenger"], // passenger (Unit 4)
  "vocab_aerial_tourism":["arial tourism","aerial tourizm","aereal tourism","aerial turism","aerial tourisim","airial tourism"], // aerial tourism (Unit 5)
  "vocab_underwater_photography":["underwatter photography","underwater fotography","underwater photograpy","underwater photgraphy","underwater photografy","underwatar photography"], // underwater photography (Unit 5)
  "vocab_documentary":["documentry","documantary","documentery","docementary","documentarry","dokumentary"], // documentary (Unit 5)
  "vocab_snorkelling":["snorkeling","snorkling","snorckelling","snorkelng","snorkellign","snoorkelling"], // snorkelling (Unit 5)
  "vocab_expedition":["expidition","expedishion","expeditoin","expedtion","expeditian","expediton"], // expedition (Unit 5)
  "vocab_yacht":["yaht","yatch","yaught","yackt","yacth","yahct"], // yacht (Unit 5)
  "vocab_scenery":["senery","sceneery","scenary","scennery","sceenery","scenerie"], // scenery (Unit 5)
  "vocab_attractions":["atractions","attracsions","attractons","atracttions","attractoins","attrations"], // attractions (Unit 5)
  "vocab_accommodation":["acommodation","accomodation","accommodaton","acomodation","accommadation","accommodtion"], // accommodation (Unit 5)
  "vocab_adventurous":["adventerous","advanturous","adventurus","adventourous","adveturous","adventrous"], // adventurous (Unit 5)
  "vocab_spectacular":["spectaculer","spectakular","spectaclar","spectacualr","spectaculor","spectacullar"], // spectacular (Unit 5)
  "vocab_dramatic":["dramatik","dramatc","dramatick","dramtic","drammatic","dramaticc"], // dramatic (Unit 5)
  "vocab_stunning":["stuning","stunnin","stunnig","stunnng","stuuning","stunneng"], // stunning (Unit 5)
  "vocab_popular":["populer","poplar","popullar","populaar","pupular","popuular"], // popular (Unit 5)
  "vocab_static":["statick","staic","statik","statc","stattic","staticc"], // static (Unit 5)
  "vocab_ground_level":["ground-levle","grownd-level","ground-leval","groud-level","ground-lavel","ground-lvel"], // ground-level (Unit 5)
  "vocab_angle_of_view":["angel of view","angle of veiw","angle off view","angl of view","angle of vew","angle of viw"], // angle of view (Unit 5)
  "vocab_ecological_habitats":["ecologicle habitats","ecological habbitats","ecologial habitats","ecolagical habitats","ecological habitates","ecoligical habitats"], // ecological habitats (Unit 5)
  "vocab_marine_world":["marin world","marine wolrd","mareine world","marrine world","marine word","marinne world"], // marine world (Unit 5)
  "vocab_engineer":["enginer","engeneer","enginere","ingineer","enjineer","engineeer"], // engineer (Unit 4)
  "vocab_pilot":["pilott","pilet","pylot","pilotte","pillot","piolt"], // pilot (Unit 4)
  "vocab_airship":["airchip","airshp","aireship","airshipp","arship","airsip"], // airship (Unit 4)
  "vocab_launch":["lanch","lonch","launche","luanch","launsh","lawnch"], // launch (Unit 4)
  "vocab_height":["hight","heigth","hieght","heighth","heigt","hite"], // height (Unit 4)
  "vocab_anxious":["anxous","anxius","anxcious","ancious","anxiuos","anxsious"], // anxious (Unit 4)
  "vocab_vehicle":["vehical","vehicel","vehicule","veicle","vehicl","vehichle"], // vehicle (Unit 4)
  "vocab_pollution":["polution","pollushion","pollutian","polluton","pollusion","polutian"], // pollution (Unit 4)
  "vocab_destination":["destinashun","destenation","destinasion","destanation","destinaton","distination"], // destination (Unit 4)
  "vocab_spacious":["spatious","spacius","spaceous","spasious","spacous","spaciuos"], // spacious (Unit 4)
  "vocab_efficiently":["efficently","effeciently","eficiently","efficiantly","efficeintly","efficienly"], // efficiently (Unit 4)
  "vocab_invention":["invension","inventian","invenshun","invantion","inventon","invetion"], // invention (Unit 4)
  "vocab_machinery":["machinary","mashinery","machinry","machienery","machnery","machinerry"], // machinery (Unit 4)
  "vocab_enormous":["enormus","enourmous","enormuos","anormous","enormouse","enomous"], // enormous (Unit 4)
  "vocab_collision":["colision","collission","collizion","colission","collsion","collisoin"], // collision (Unit 4)
  "vocab_organisation":["organisasion","orginisation","organistion","oraganisation","organisaton","organization"], // organisation (Unit 4),
  "vocab_livelihood":["livlihood","livelyhood","liveliehood","livelihod","livilihood","livelhood"], // livelihood (Unit 4)
  "vocab_fatality":["fatalty","fatallity","fatilty","fatelity","fatalitty","fataliti"], // fatality (Unit 4)
  "vocab_initiative":["initative","inititive","intiative","initiatve","inisiative","initaitive"], // initiative (Unit 4)
  "vocab_campaign":["campain","campaing","campagn","campiagn","kampaign","campaigne"], // campaign (Unit 4)
  "vocab_pothole":["potthole","pothol","poothole","pothoole","potehole","pothoel"], // pothole (Unit 4)
  "vocab_trauma":["trama","traumma","trauna","trawma","traumer","tramua"], // trauma (Unit 4)
  "vocab_measures":["mesures","measurs","meashures","mezures","measuers","meausres"], // measures (Unit 4)
  "vocab_estimate":["estamate","estimete","esstimate","estimat","astimate","estimite"], // estimate (Unit 4)
  "vocab_regulation":["reguation","regualtion","regulashun","reglation","regulatoin","rgulation"], // regulation (Unit 4)
  "vocab_operate":["oparate","operat","operrate","opperate","operete","oporate"], // operate (Unit 4),
  "vocab_detain":["detane","detian","deatin","dettain","detaen","ditain"], // detain (Unit 4)
  "vocab_offences":["offenses","ofences","offencs","offeces","offennces","offensess"], // offences (Unit 4)
  "vocab_provisional":["provisonal","provisinal","provissional","provitional","proviscional","provisonel"], // provisional (Unit 4)
  "vocab_enforcement":["enforcment","enforcemant","inforcement","enforsement","enforcemnt","enforcemment"], // enforcement (Unit 4)
  "vocab_statistics":["statistcs","statisics","statictics","statistiks","stastistics","statisitcs"], // statistics (Unit 4)
  "vocab_safety":["safty","saftey","saftety","safetey","saefty","sayfety"], // safety (Unit 4)
  "vocab_sustainability":["sustainabilty","sustainibility","sustanability","sustainablity","sustainabilitty","sustenability"], // sustainability (Unit 4)
  "vocab_legislation":["legislaton","legeslation","legislashun","ledgislation","legislasion","lesgislation"], // legislation (Unit 4)
  "vocab_introduce":["introduse","intruduce","introdyce","intorduce","introduc","entroduce"], // introduce (Unit 4)
  "vocab_innovative":["inovative","inovvative","inivative","innovatve","innovitive","innovativ"], // innovative (Unit 4)
});
