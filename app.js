const $=selector=>document.querySelector(selector);
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const storageKey='groundwell-personal-v2';
const emptyState=()=>({profile:null,entries:[]});
let personal=emptyState();
try{
 const saved=JSON.parse(localStorage.getItem(storageKey));
 if(saved && typeof saved==='object'){
  personal.profile=saved.profile && typeof saved.profile==='object'?saved.profile:null;
  personal.entries=Array.isArray(saved.entries)?saved.entries.filter(x=>x&&typeof x==='object'):[];
 }
}catch{}
try{
 if(!localStorage.getItem(storageKey)){
  const oldProfile=JSON.parse(localStorage.getItem('groundwell-profile-v1')||'null');
  if(oldProfile&&typeof oldProfile==='object'&&Number(oldProfile.age)>=18)personal.profile=oldProfile;
  const moldNotes=localStorage.getItem('groundwell-mold-log-v1');
  if(moldNotes)personal.entries.push({id:'legacy-mold-log',type:'environment',date:new Date().toISOString().slice(0,10),title:'Imported mold notes',detail:moldNotes});
  const oldLibrary=JSON.parse(localStorage.getItem('groundwell-library-v1')||'null');
  if(oldLibrary?.notes)personal.entries.push({id:'legacy-research-note',type:'research',date:new Date().toISOString().slice(0,10),title:'Imported research notes',detail:oldLibrary.notes});
  if(personal.profile||personal.entries.length)localStorage.setItem(storageKey,JSON.stringify(personal));
 }
}catch{}
let library={nutrients:[],people:[],archive:[]};
const view=$('#view');
const sources={
 nutrient:'Nutrient intake and use information is summarized from the NIH Office of Dietary Supplements fact sheets. The daily intake target describes food and supplements together.',
 mold:'CDC and EPA guidance on damp buildings, exposure, cleanup, and clinical evaluation.',
 oral:'American Dental Association and CDC oral health guidance.'
};
const conditionData={
 'autoimmune':{
 title:'Autoimmune health',subtitle:'Nutrition, symptoms, and daily living',intro:'Autoimmune conditions involve immune activity directed at the body’s own tissues. Their causes and treatments vary by diagnosis. A wellness plan starts with a confirmed diagnosis, an understanding of the affected organs, and a record of symptoms and current care.',
 sections:[['Food patterns','A varied dietary pattern can support nutritional adequacy. Some people need condition-specific changes, such as avoiding gluten in celiac disease. Broad elimination diets may create deficiencies if used without a clear reason.'],['Movement and rest','Adapt activity to symptoms and function. Sleep and stress management can help daily well-being. Record what actually changes over weeks instead of changing many things at once.'],['Supplements','Review vitamin D, iron, B12, and other nutrients when diet, symptoms, or clinical testing suggests a gap. More intake does not automatically mean a better immune response.'],['Questions to investigate','Which diagnosis is established? Are any organs involved? Which symptoms warrant a prompt clinical review? Which nutritional changes have condition-specific evidence?']]
 },
 'adhd':{
 title:'ADHD',subtitle:'Attention, routines, sleep, and nutrition',intro:'ADHD is a pattern of difficulties with attention and/or impulsivity that affects daily life. Natural approaches can be studied as part of a broader care plan. Track sleep, meal timing, work demands, and symptom patterns to identify useful questions.',
 sections:[['Daily structure','Consistent sleep and wake times, a low-friction task list, time blocks, and reducing distractions can make daily tasks easier. Keep experiments small enough to compare.'],['Food and nutrients','Regular meals and sufficient nutrition matter. If dietary intake is limited, investigate specific gaps instead of assuming a universal supplement protocol.'],['Exercise and mindfulness','Physical activity and attention practices may support well-being and self-regulation. Effects differ between people and studies.'],['Track','Record sleep duration, focus periods, task completion, and whether a change helps beyond a single day. Note medication and caffeine timing if relevant.']]
 },
 'depression':{
 title:'Depression',subtitle:'Daily patterns and supportive approaches',intro:'Depression affects mood, motivation, sleep, appetite, and daily function. A person can study nutrition, activity, social connection, and sleep while also seeking an assessment of persistent or worsening symptoms.',
 sections:[['Sleep and daylight','A consistent schedule and daytime light exposure can support circadian rhythm. Track whether changes improve sleep and daytime functioning.'],['Movement and connection','A manageable activity plan and regular social contact can help some people. Set a starting point that fits current energy rather than an idealized routine.'],['Nutrition and supplements','A balanced pattern and correcting documented nutrient deficiencies may matter. Supplement studies vary in quality and relevance, and interactions need review.'],['Track','Record mood, sleep, appetite, energy, activity, and major events. Changes over time can help a clinician understand the full picture.']]
 },
 'nutrition':{
 title:'Nutrition foundations',subtitle:'Food first, then specific questions',intro:'A useful nutrition reference connects food patterns, individual needs, and the nutrients in specific foods. It helps people notice gaps without turning every meal into a score.',
 sections:[['Build a pattern','Include varied vegetables and fruit, protein sources, fiber-rich foods, and fats that fit your needs and preferences. Adequacy matters over time, not only in a single meal.'],['Read a label','Check serving size, nutrients, ingredients, and how the food fits the rest of your diet. A single ingredient does not establish the overall effect of a food.'],['Personal context','Age, sex, pregnancy, medical conditions, medications, food access, and preferences can change the questions worth asking. Weight alone does not set routine vitamin targets.'],['Keep a useful log','Record meals with optional notes on hunger, energy, and symptoms. Review patterns weekly before making a change.']]
 }
};
const videos=[
 {id:'bhkxidN2M9Q',title:'Vitamin D, omega-3s & exercise',person:'Rhonda Patrick',topic:'Nutrition',summary:'A long-form discussion of vitamin D, magnesium, marine omega-3s, and exercise. Use the nutrient articles to check intake targets and the distinction between a speaker’s interpretation and established guidance.',points:['What food and supplement forms are discussed','Which claims are based on human outcomes','What changes with personal context']},
 {id:'WDloBk9BJqc',title:'How to think about vitamin D intake',person:'Rhonda Patrick with Tim Ferriss',topic:'Supplements',summary:'A conversation about vitamin D supplementation. Groundwell’s vitamin D card provides the age-based daily intake target and upper limit to keep beside the video.',points:['Daily intake versus treatment dose','Why baseline status matters','Where the reference target comes from']}
];
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(personal));return true}catch{return false}}
function pageHeader(kicker,title,subtitle){return `<div class="eyebrow">${escapeHtml(kicker)}</div><h1>${escapeHtml(title)}</h1><p class="muted" style="max-width:720px;font-size:17px">${escapeHtml(subtitle)}</p>`}
function section(title,body,link){return `<div class="section-head"><h2>${title}</h2>${link?`<a href="${link[1]}">${link[0]} →</a>`:''}</div>${body}`}
function tile(label,title,description,href){return `<a class="card" href="${href}"><span class="tag">${label}</span><h3>${title}</h3><p>${description}</p><span class="arrow">Explore →</span></a>`}
function home(){
 const featured=[
  tile('Reference','Supplement library','Explore 20 nutrients, their forms, uses, food sources and intake guidance.','#supplements'),
  tile('Environment','Mold & indoor air','A detailed building and health investigation with testing limits.','#mold'),
  tile('Daily practice','Oral health','A practical guide to teeth, gums, food choices and dry mouth.','#oral')
 ].join('');
 return `<section class="hero"><div class="eyebrow">A quieter kind of wellness research</div><h1>Understand your health.<br>Keep your own record.</h1><p>Explore natural health topics in one place, with clear explanations, practical context, and tools for tracking what matters to you.</p><div class="hero-actions"><a class="button" href="#explore">Explore the library</a><a class="button alt" href="#journal">Open my wellness</a></div></section>
 ${section('Research dossiers',`<div class="grid two">${tile('Deep study','H. pylori: infection to confirmed cure','Mechanism, testing, treatment evidence, natural adjuncts and a test-to-cure timeline.','#dossier/hpylori')}${tile('Deep study','IBS: beyond a food list','Gut–brain pathways, fiber, FODMAP, probiotics and a disciplined experiment.','#dossier/ibs')}${tile('Field guide','Damp buildings and mold','Exposure, testing limits, physical remediation and clinical history.','#dossier/mold')}</div>`)}
 <div class="paper" style="margin:18px 0"><a class="button dark" href="#research">Open the research desk →</a><p>Browse the expanded dossiers by area and search their full text.</p></div>
 ${section('Dive into the atlas',`<div class="grid two">${tile('Learn','Digestive health atlas','Explore symptoms, mechanisms, IBS, reflux, H. pylori, celiac disease and more with diagrams.','#atlas')}${tile('Daily practice','Supplement routine','Track each dose, see your daily capsule fill, and anticipate refills.','#routine')}</div>`)}
 ${section('Start with a topic',`<div class="grid three">${featured}</div>`,['All topics','#conditions'])}
 ${section('A reference you can use',`<div class="grid two">${tile('Read','Nutrition foundations','Build a food pattern and research individual needs without a wall of links.','#guide/nutrition')}${tile('Research','Vaccine questions','Ingredients, known effects and what detox claims need to prove.','#vaccine')}</div>`)}
 <div class="profile-strip"><strong>${personal.profile?escapeHtml(personal.profile.name||'Your profile')+' · '+escapeHtml(personal.profile.age)+' years':'Your wellness space'}</strong><p>${personal.profile?'Your intake context and records are available in My wellness.':'Set up a profile, then track supplements, food, symptoms and protocols on this device.'} <a href="#journal"><u>Open My wellness →</u></a></p></div>`;
}
function article(template,sourceName,sourceUrl){
 return `<div class="article"><div class="eyebrow">${escapeHtml(template.subtitle)}</div><h1>${escapeHtml(template.title)}</h1><p class="lede">${escapeHtml(template.intro)}</p><div class="callout">Use this guide to frame questions and record observations. Needs and appropriate care vary by person and diagnosis.</div>${template.sections.map(([h,p])=>`<h2>${escapeHtml(h)}</h2><p>${escapeHtml(p)}</p>`).join('')}<div class="sourcebox"><details><summary>Editorial notes and source</summary><p>Groundwell summary · Reviewed November 2026. ${escapeHtml(sourceName||'Additional research is needed for claims about specific interventions.')}</p>${sourceUrl?`<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">Read original research overview ↗</a>`:''}</details></div></div>`;
}
const moldSections=[
 ['Recognize the pattern','Damp buildings can be associated with nasal and eye irritation, cough, wheeze, allergy symptoms, worsening asthma, and some less common lung problems. Symptoms may have several causes. Note when they began and whether they change away from the building.'],
 ['Find the water source','Inspect plumbing, roof and window leaks, condensation, wet insulation, HVAC areas, staining, and musty odors. Photograph dates and places. A visible or smelled problem deserves attention even if a species is unknown.'],
 ['Dry and remove','Stop the water source and dry affected material promptly. EPA guidance says many small areas under about 10 square feet can be handled following its methods. Major damage, larger areas, or sewage contamination calls for experienced help. Moldy porous materials may need removal.'],
 ['Clean safely','People with asthma, respiratory disease, allergies, immune suppression, or underlying lung disease should avoid doing mold cleanup. For suitable small-area cleanup, protect eyes and skin and use at least a NIOSH approved N95 respirator.'],
 ['Interpret tests','A surface swab identifies material at the spot sampled. It does not measure an individual’s exposure or establish a diagnosis. The priority is identifying and correcting moisture and removing growth.'],
 ['Discuss health concerns','Bring a timeline of water damage, rooms affected, symptoms, time away, cleanup, and relevant medical history. A clinician can assess symptoms and decide whether allergy or respiratory testing fits the case.'],
 ['Evaluate proposed protocols','Ask what diagnosis a test establishes, how it changes care, and what outcomes support a treatment. Some commercial tests and complex treatment protocols remain disputed. Track symptoms and building conditions separately.']
];
const deepArticles={
 mold:{
  eyebrow:'Environmental health / Field guide',
  title:'Mold, moisture & health',
  deck:'A damp building deserves a methodical response. Identify the water, understand what exposure can and cannot explain, then document the work and your symptoms.',
  updated:'Reviewed November 2026',
  highlights:[['01','Find the moisture source'],['02','Remove damaged material'],['03','Assess symptoms in context']],
  sections:[
   {id:'what',title:'What a damp building can mean',body:[
    'Molds grow where moisture persists. Leaks, flooding, condensation, high indoor humidity, and wet building materials can all create conditions for growth. A musty odor or visible staining is useful evidence even when the species is unknown. Hidden growth can occur behind drywall, beneath flooring, or in wet insulation.',
    'People in damp buildings may report nasal congestion, cough, wheeze, eye or skin irritation, worsening asthma, and eczema. Some people develop more serious respiratory conditions, including hypersensitivity pneumonitis. The same symptoms can have other causes, so a building history and medical assessment belong together.'
   ],note:'The color or species name on a swab does not, by itself, establish the amount a person inhaled or explain every symptom.'},
   {id:'inspect',title:'A practical inspection sequence',body:[
    'Start with a dated map of the rooms. Mark water stains, odors, condensation, plumbing or roof leaks, and any materials that stayed wet. Photograph the area before and after work. A moisture meter can help find wet building materials when used by someone who understands the material and instrument.',
    'Fix the water source before cosmetic repairs. If water damage continues, surface cleaning alone will not solve the underlying problem. Keep records of repair dates, drying, material removal, and any recurrence.'
   ]},
   {id:'cleanup',title:'Cleanup and protection',body:[
    'EPA guidance says many small areas under about 10 square feet can be handled by a homeowner following its cleanup instructions. Larger areas, extensive water damage, or sewage contamination call for experienced help. Hard surfaces can often be cleaned and dried. Moldy porous materials, such as ceiling tiles or carpet, may need to be discarded because growth can penetrate them. Fogging or spraying a killing agent alone does not remove the contaminated material or fix the moisture source. Dead mold can still trigger reactions.',
    'People with asthma, allergies, chronic lung disease, or immune suppression should avoid doing mold cleanup. A person who can safely handle a small area should use at least a NIOSH approved N95 respirator and protect skin and eyes. Do not paint over growth or close up a wall before it is dry.'
   ]},
   {id:'testing',title:'How to interpret tests',body:[
    'A surface swab shows what grew at the sampled spot. Air samples vary with time and conditions and do not provide a universal threshold for a healthy home. Visible or smelled growth and a moisture problem warrant action without waiting for a species report.',
    'Commercial urine mycotoxin tests do not establish illness caused by indoor mold. Exposure from food and other sources complicates interpretation, and levels that diagnose a building-related illness have not been established. Ask what a test measures, how it changes the plan, and whether it has been validated for that purpose.'
   ]},
   {id:'health',title:'Bring a useful history to a clinician',body:[
    'Record symptom onset, affected rooms, time spent in the building, changes when away, pre-existing asthma or allergies, and medications. Bring the building timeline and the work completed. A clinician can examine symptoms and decide whether an allergy, respiratory, or other evaluation is appropriate.',
    'If symptoms are severe, worsening, or include breathing difficulty, seek timely medical evaluation. A single environmental result should not replace an assessment of the person.'
   ]},
   {id:'protocols',title:'Claims and treatment protocols',body:[
    'People use “mold toxicity” to describe different experiences, including recognized allergic and respiratory conditions and proposed syndromes with debated diagnostic tests and treatments. The phrase alone is not a diagnosis. Evaluate a proposed protocol by asking what condition it treats, what outcomes were measured, and what risks and costs it carries.',
    'The most actionable building intervention remains controlling moisture and removing growth. A health plan should address the condition actually found and track whether symptoms change after the building problem is corrected.'
   ]}
  ],
  source:[['CDC mold and home testing','https://www.cdc.gov/mold-health/about/index.html'],['CDC cleanup precautions','https://www.cdc.gov/mold-health/about/clean-up.html'],['EPA home cleanup','https://www.epa.gov/mold/mold-cleanup-your-home'],['EPA on removal and biocides','https://www.epa.gov/mold/mold-remediation-schools-and-commercial-buildings-guide-chapter-3'],['NIOSH damp buildings','https://www.cdc.gov/niosh/mold/about/index.html'],['CDC on urine mycotoxin testing','https://www.cdc.gov/mmwr/preview/mmwrhtml/mm6406a7.htm']],
  related:[['Oral health','#oral'],['My wellness log','#journal']]
 },
 oral:{
  eyebrow:'Daily health / Reference guide',
  title:'Oral health, from food to gums',
  deck:'A practical reference for protecting teeth and gums, understanding dry mouth, and keeping track of concerns before a dental visit.',
  updated:'Reviewed November 2026',
  highlights:[['2×','Brush with fluoride toothpaste'],['Daily','Clean between teeth'],['Often','Review diet and dry mouth']],
  sections:[
   {id:'routine',title:'The daily foundation',body:[
    'Brush teeth twice a day with fluoride toothpaste and clean between teeth daily. Plaque forms repeatedly, so consistency matters more than an occasional intensive cleaning. A dentist or hygienist can help choose a brush, floss, interdental brush, or other tool that fits the spaces and your dexterity.',
    'Regular dental visits help find decay, gum disease, and oral changes that are easy to miss. The best recall interval depends on a person’s risk and findings.'
   ]},
   {id:'food',title:'Nutrition and the mouth',body:[
    'Oral bacteria can turn sugars into acids that attack enamel. Frequent sweet drinks or snacks create repeated acid exposure. Acidic drinks and foods can contribute to enamel erosion. Water, a varied diet, and limiting frequent sugar exposure support teeth and general nutrition.',
    'Calcium, vitamin D, protein, and other nutrients support normal tissues and bone health. A supplement cannot substitute for plaque control or repair a cavity. Food pattern, frequency, and total intake are more informative than labeling one ingredient as universally harmful.'
   ]},
   {id:'gums',title:'Gum inflammation',body:[
    'Red, swollen, or bleeding gums may reflect gingivitis. Plaque that stays in place can harden into tartar, which requires professional removal. Periodontitis can damage the tissues and bone supporting teeth and needs a dental assessment.',
    'Track bleeding, tenderness, recession, loose teeth, or persistent bad breath. Do not assume a nutrient deficiency explains these signs without an examination.'
   ]},
   {id:'dry',title:'Dry mouth',body:[
    'Saliva protects the mouth by clearing food debris and buffering acids. Medicines, dehydration, mouth breathing, and some conditions can reduce saliva. Persistent dry mouth increases the importance of dental prevention and reviewing possible causes.',
    'Record when dryness occurs, medications, nighttime symptoms, thirst, and changes in taste or swallowing. A dentist or clinician can suggest an individualized plan.'
   ]},
   {id:'life',title:'Across life stages',body:[
    'Older adults may face additional dry mouth, dexterity, gum, root decay, or denture challenges. Pregnancy can change gum symptoms. Children need age-appropriate brushing help and fluoride guidance from their dental clinician.',
    'The person’s profile can organize reminders and questions, but an oral care routine should be based on dental findings.'
   ]}
  ],
  source:[['ADA daily recommendations','https://www.mouthhealthy.org/oral-health-recommendations'],['ADA diet and dental health','https://www.mouthhealthy.org/all-topics-a-z/diet-and-dental-health'],['CDC gum disease','https://www.cdc.gov/oral-health/about/gum-periodontal-disease.html'],['ADA dry mouth','https://www.mouthhealthy.org/all-topics-a-z/dry-mouth']],
  related:[['Nutrition foundations','#guide/nutrition'],['Supplement library','#supplements']]
 },
 vaccine:{
  eyebrow:'Research desk / Questions & evidence',
  title:'COVID vaccination: ingredients, effects & recovery questions',
  deck:'A plain-language review of how mRNA vaccines work, what is known about persistence and adverse effects, and what a “detox” claim would need to prove.',
  updated:'Reviewed November 2026',
  highlights:[['mRNA','Cellular instructions'],['Lipids','Delivery particles'],['Care','Address actual symptoms']],
  sections:[
   {id:'mechanism',title:'What an mRNA vaccine does',body:[
    'An mRNA vaccine delivers instructions in a lipid particle. Cells use the instructions to make a version of the viral spike protein, which prompts an immune response. The mRNA does not enter the cell nucleus or rewrite DNA. The body breaks down the mRNA, but the time course can vary by tissue and by what a study measures.',
    'The vaccine cannot cause an infection with the coronavirus because it does not contain live virus. An immune response can produce short-lived symptoms such as soreness, fatigue, headache, or fever.'
   ]},
   {id:'ingredients',title:'What is in the formulation',body:[
    'The core components of common mRNA formulations are nucleoside-modified mRNA, lipids that carry it into cells, and salts and sugars that stabilize the product. Specific ingredients vary by product and version. Lipid nanoparticles are fats, not tiny metal devices.',
    'The published ingredient lists for these mRNA products do not include heavy metals as ingredients. If someone has a separate, suspected metal exposure, that deserves its own exposure history and appropriate testing rather than being attributed to a vaccine.'
   ]},
   {id:'persistence',title:'What persistence studies actually measured',body:[
    'A small human blood study detected vaccine mRNA in some participants for up to about two weeks after a booster. Another tissue study detected it in draining lymph nodes within 30 days in recently vaccinated deceased patients, with no detection in people sampled later than 30 days in that study. These results add detail to the time course; they do not establish that everyone has persistent vaccine material or that a positive signal causes a particular chronic symptom.',
    'Immune memory can last far longer than the original mRNA. Antibodies and immune cells are a response to an antigen, not evidence that the original vaccine material is still present.'
   ]},
   {id:'effects',title:'Known effects worth recognizing',body:[
    'Common reactions are usually short-lived. Myocarditis and pericarditis have been observed rarely after mRNA vaccination, most often in adolescent and young adult males soon after a dose, though other groups can be affected. Severe allergic reactions are also rare.',
    'Chest pain, shortness of breath, palpitations, or signs of a severe allergic reaction warrant prompt medical evaluation. A clinician can evaluate other possible causes, including infection, and choose tests according to symptoms.'
   ]},
   {id:'detox',title:'What “detoxing mRNA” would require',body:[
    'There is no established supplement, binder, sauna schedule, chelation regimen, or diet shown in human trials to remove vaccine mRNA or spike protein from the body or treat a claimed chronic vaccine effect. Selling a protocol as a proven “spike detox” goes beyond the evidence.',
    'Chelation has a role in certain diagnosed metal poisonings, but it can lower essential minerals or harm the kidneys. Without evidence of metal poisoning, a metal-removal treatment has no demonstrated target here. General sleep, adequate nutrition, hydration, and gradual return to activity can support well-being, but they are not a specific mRNA removal process.'
   ]},
   {id:'next',title:'If you are experiencing symptoms',body:[
    'Write down the product and date, symptom onset, duration, severity, medications, illnesses, and what has changed. Seek an assessment focused on the symptoms rather than assuming a mechanism. Ask which diagnosis is being evaluated and what a test or treatment would change.',
    'The personal journal can keep this timeline together. It can show associations in time; it cannot by itself determine the cause.'
   ]}
  ],
  source:[['CDC how mRNA vaccines work','https://www.cdc.gov/covid/vaccines/how-they-work.html'],['Human blood distribution study','https://pubmed.ncbi.nlm.nih.gov/39298422/'],['Human tissue persistence study','https://pubmed.ncbi.nlm.nih.gov/37758751/'],['CDC myocarditis clinical considerations','https://www.cdc.gov/vaccines/covid-19/clinical-considerations/myocarditis.html'],['Poison Control on chelation','https://www.poison.org/articles/chelation-therapy']],
  related:[['Track symptoms','#journal'],['Nutrition foundations','#guide/nutrition']]
 }
};
deepArticles.nutrition={eyebrow:'Nutrition / Reference guide',title:'Nutrition foundations',deck:'A practical framework for building meals, reading claims and finding specific nutrient gaps.',updated:'Reviewed November 2026',highlights:[['01','Build a repeatable pattern'],['02','Find actual gaps'],['03','Track changes over time']],sections:[
{id:'pattern',title:'What a food pattern does',body:['Nutrition is the combined effect of foods and habits over time. A useful baseline includes varied vegetables and fruit, enough protein, fiber-rich plants, and fat sources that fit a person’s needs. Food access, culture, preferences and medical conditions shape what is realistic. One meal cannot prove a diet is healthy or unhealthy.','Start by describing what you currently eat across an ordinary week. Look for missing food groups, irregular meal timing, and foods you enjoy enough to repeat. A sustainable improvement is more useful than an elaborate plan that lasts three days.']},
{id:'macros',title:'Protein, carbohydrates and fats',body:['Protein supplies essential amino acids. Eggs, fish, meat, dairy, soy, beans and lentils are examples; amounts and digestibility differ. Carbohydrate foods range from intact grains and fruit to refined sweets, so the category alone says little about a meal. Fat is necessary; the mix of foods, portions and overall energy balance matters.','For a practical plate, choose a protein source, add produce, then add a carbohydrate and fat source appropriate to appetite and activity. Adjust for conditions such as diabetes, kidney disease, allergies or pregnancy with individualized advice.']},
{id:'fiber',title:'Fiber and the gut',body:['Fiber in beans, vegetables, fruit, nuts and whole grains adds bulk and is fermented to different degrees by gut microbes. Increasing fiber gradually and drinking enough fluid can improve tolerance. Different foods contain different fibers, so variety matters more than a single “gut health” product.','If you have persistent abdominal pain, bleeding, unexplained weight change or significant bowel changes, investigate the symptom rather than assuming it is a normal response to a new food.']},
{id:'micros',title:'Micronutrient adequacy',body:['Vitamins and minerals have specific roles and intake targets. A food log can reveal patterns such as little iron-rich food, limited B12 sources, or low calcium intake. A supplement is most useful when it addresses a plausible gap, a life-stage need, or a documented deficiency. A high dose is not a substitute for a more complete diet.','Check the nutrient’s form, amount per serving, upper limit, interactions, and the combined amount from fortified foods and other products. The supplement directory provides an individual card for each major nutrient.']},
{id:'labels',title:'Read labels in context',body:['Start with serving size and the amount you actually eat. Compare fiber, protein, sodium, added sugars and relevant micronutrients, then read the ingredient list for allergens and preferences. A long ingredient list or unfamiliar chemical name does not by itself establish harm.','When comparing two products, ask what the food replaces in your diet and how often you consume it. A numerical “danger score” without exposure, dose and outcome evidence would be misleading.']},
{id:'experiment',title:'Make an interpretable change',body:['Choose one change, such as adding a regular breakfast, replacing one snack, or increasing beans and vegetables. Record a baseline and the intended outcome, then observe over a few weeks. Mood and energy vary for many reasons; a food diary shows patterns but cannot establish cause.','If a restrictive diet is proposed, write down its purpose, duration, how nutrients will be maintained, and what result would justify continuing it. For diagnosed conditions, follow the condition-specific nutrition requirements.']}
],source:[['Dietary Guidelines for Americans','https://www.dietaryguidelines.gov/'],['NIH Office of Dietary Supplements fact sheets','https://ods.od.nih.gov/factsheets/list-all/'],['NIDDK nutrition and healthy eating','https://www.niddk.nih.gov/health-information/weight-management/healthy-eating-physical-activity-for-life']],related:[['Supplement library','#supplements'],['Track meals','#journal']]};
deepArticles.autoimmune={eyebrow:'Immune health / Reference guide',title:'Autoimmune health',deck:'Different diagnoses affect different tissues. Build a plan around the specific condition, its activity and nutritional needs.',updated:'Reviewed November 2026',highlights:[['01','Confirm the diagnosis'],['02','Protect function'],['03','Test specific nutrition gaps']],sections:[
{id:'scope',title:'Why the diagnosis matters',body:['Autoimmune diseases are not one syndrome. Rheumatoid arthritis affects joints and can affect other organs; celiac disease requires strict gluten avoidance; autoimmune thyroid disease creates different questions again. The symptoms, tests and appropriate care differ. A general “immune boost” does not describe a useful target.','Record the diagnosis, affected organs, current treatment and what a flare means in your case. Sudden new weakness, chest symptoms, severe pain or organ-related symptoms deserve prompt evaluation.']},
{id:'food',title:'Food and elimination diets',body:['A balanced dietary pattern can help meet protein, fiber and micronutrient needs. Some conditions have a specific established dietary intervention, most clearly gluten avoidance for celiac disease. Beyond these, claims that one exclusion diet treats all autoimmune diseases outrun the evidence.','An elimination experiment should have a clear hypothesis, short review interval and a plan for adequate nutrition. Restricting many foods can cause deficiencies and obscure whether a change truly helped.']},
{id:'movement',title:'Movement, rest and pacing',body:['Joint pain and fatigue can make movement difficult, yet appropriately adapted activity helps function and well-being for many people. In rheumatoid arthritis, plans may combine aerobic activity, strengthening and range-of-motion work with rest during active symptoms. The right level depends on disease activity and limitations.','Track what you could do before and after activity, not just whether you exercised. A pattern of prolonged worsening suggests the plan needs adjustment.']},
{id:'nutrients',title:'Nutrients worth checking',body:['Dietary limitations, inflammation, medication use and organ involvement can change nutritional needs. Iron, B12, vitamin D, calcium and folate may be relevant in particular settings, but the reason and interpretation vary. Blood tests and diet history are more useful than a universal stack.','High dose vitamin A, selenium, iodine or other products can cause harm. Bring a complete product list to a clinician or pharmacist, especially when taking immune-modifying medicines.']},
{id:'tracking',title:'Build a useful flare record',body:['Track symptoms, morning stiffness, sleep, activity, infection, menstrual cycle if applicable, medications and diet changes. Note the duration and effect on function. Keep the record simple enough to sustain.','An association in a diary is a lead for investigation, not proof that a food or supplement caused the change. Avoid changing multiple variables at once.']},
{id:'evidence',title:'Assess a proposed protocol',body:['Ask which named disease and outcome the study measured, whether participants were similar to you, how long follow-up lasted, and what adverse effects occurred. A testimonial about “reversing autoimmunity” does not answer those questions.','Discuss any plan to stop an established treatment. Delayed control of active disease can allow damage even when day-to-day symptoms fluctuate.']}
],source:[['NIAMS rheumatoid arthritis overview','https://www.niams.nih.gov/health-topics/rheumatoid-arthritis'],['NIAMS arthritis exercise','https://www.niams.nih.gov/health-topics/arthritis-and-rheumatic-diseases'],['NIDDK celiac disease treatment','https://www.niddk.nih.gov/health-information/digestive-diseases/celiac-disease/treatment']],related:[['Nutrition foundations','#guide/nutrition'],['Track symptoms','#journal']]};
deepArticles.adhd={eyebrow:'Brain health / Reference guide',title:'ADHD and daily function',deck:'Explore sleep, structure, activity and nutrition with clear expectations about what is and is not established.',updated:'Reviewed November 2026',highlights:[['01','Map the difficulty'],['02','Simplify routines'],['03','Check evidence and safety']],sections:[
{id:'picture',title:'Describe the actual problem',body:['ADHD involves persistent patterns of inattention and/or hyperactivity-impulsivity that impair function. Sleep deprivation, anxiety, depression, medication effects and other conditions can also affect attention. An assessment helps identify what is happening and whether more than one issue is present.','Write down where the difficulty occurs, its duration, what tasks are affected, and what reliably helps. This is more useful than a single online score.']},
{id:'structure',title:'Design the environment',body:['Use one capture place for tasks, break work into visible next steps, schedule short work blocks, and reduce avoidable interruptions. Put cues where actions occur: medicines beside a routine, supplies at the work location, and reminders tied to a time or event.','Compare a small number of changes over two to four weeks using outcomes such as completed tasks, missed appointments or time to start work.']},
{id:'sleep',title:'Sleep and activity',body:['Consistent wake times, a wind-down routine and attention to caffeine timing can help clarify how much sleep loss contributes to symptoms. Physical activity may have small to moderate short-term benefits for some ADHD outcomes, but study methods and populations vary.','An exercise or mindfulness practice can be a supportive routine without being presented as a replacement for an individualized care plan.']},
{id:'nutrition',title:'Food, omega-3s and deficiencies',body:['Regular meals and adequate calories can prevent hunger from worsening concentration. If someone eats a limited range of foods, assess nutrient adequacy. Omega-3 supplements have been studied extensively, yet overall evidence for meaningful ADHD symptom improvement remains uncertain and effect estimates are small or inconsistent.','A blood test or diet history may identify a specific deficiency that merits correction. Avoid promising that one supplement treats ADHD in everyone.']},
{id:'interactions',title:'Product and medicine review',body:['Herbal and stimulant-like products can affect sleep, heart rate or prescribed medicines. Record exact product, dose and timing rather than treating all “natural focus” blends as equivalent.','If symptoms change sharply, functioning declines or there are safety concerns, seek an appropriate clinical evaluation.']},
{id:'log',title:'A four-week tracking experiment',body:['Week one: record sleep, meals, caffeine and two functional outcomes without changing anything. Week two: choose one routine change. Weeks three and four: keep the same measures and review whether the improvement lasted.','Keep confounders visible, including illness, travel, workload and medication changes. The journal is a record of observations, not a diagnostic test.']}
],source:[['NCCIH ADHD complementary approaches','https://www.nccih.nih.gov/health/attention-deficit-hyperactivity-disorder-at-a-glance'],['NIMH ADHD overview','https://www.nimh.nih.gov/health/topics/attention-deficit-hyperactivity-disorder-adhd']],related:[['Nutrition foundations','#guide/nutrition'],['Track focus','#journal']]};
deepArticles.depression={eyebrow:'Brain health / Reference guide',title:'Depression and supportive care',deck:'A grounded look at sleep, movement, social connection, nutrition and the limits of supplement claims.',updated:'Reviewed November 2026',highlights:[['01','Assess persistence'],['02','Choose manageable actions'],['03','Review interactions']],sections:[
{id:'recognize',title:'Recognize the full pattern',body:['Depression can affect mood, interest, energy, concentration, sleep, appetite and function. Symptoms lasting weeks or interfering with daily life deserve assessment. Medical conditions, medications and other mental health concerns can overlap.','A daily record of mood and function can help convey a pattern. It does not tell you that a particular nutrient or event is the sole cause. If you feel at risk of harming yourself, seek immediate local emergency help.']},
{id:'rhythm',title:'Sleep, light and daily rhythm',body:['A consistent wake time, daytime light and a manageable evening routine can support regular sleep. Difficulty sleeping may be a symptom that requires its own assessment. Treat a proposed sleep routine as an experiment with a stated outcome, not a cure.','Track bedtime, waking, daytime energy and naps for several weeks. Travel, shift work and illness can explain fluctuations.']},
{id:'movement',title:'Activity and connection',body:['Exercise can help some people with depressive symptoms. Begin at a level possible today, even brief walking, and increase gradually. Social contact and planned meaningful activity may reduce isolation and help daily structure.','A plan that is too demanding can fail because the person is already unwell. Set small, repeatable goals and notice whether functioning actually improves.']},
{id:'food',title:'Nutrition and specific gaps',body:['Regular meals and an adequate diet help meet basic needs. If appetite is low, weight changes or intake is restricted, review possible deficiencies and practical food access. Correcting a documented deficiency is different from claiming that high dose vitamins treat depression.','Omega-3 supplements have mixed evidence for depressive symptoms. Product composition, study populations and comparison treatments differ, so a broad promise is not supported.']},
{id:'herbs',title:'St John’s wort and other products',body:['St John’s wort has been studied for depression, with findings that vary by severity and study. It interacts with many medicines, including antidepressants and medications affected by drug-metabolizing enzymes. Combining it with serotonergic drugs can be dangerous.','Bring every supplement and medication to a qualified professional before starting or stopping a product. “Natural” describes origin, not interaction risk.']},
{id:'next',title:'When to seek more help',body:['Worsening symptoms, impaired self-care, inability to work, or thoughts of self-harm call for timely support. Depression is treatable, and combining supportive daily practices with appropriate care can be reasonable.','A clinician can review sleep, medicines, medical causes and treatment options. Track the outcomes that matter to you, such as ability to get out of bed, social contact and work function.']}
],source:[['NCCIH depression complementary approaches','https://www.nccih.nih.gov/health/depression'],['NCCIH St John’s wort','https://www.nccih.nih.gov/health/st-johns-wort'],['NIMH depression overview','https://www.nimh.nih.gov/health/topics/depression']],related:[['Nutrition foundations','#guide/nutrition'],['Track mood','#journal']]};

function deepPage(id){
 const d=deepArticles[id];if(!d)return notFound();
 const anchors=d.sections.map(s=>'<button type="button" data-jump="'+id+'-'+s.id+'">'+escapeHtml(s.title)+'</button>').join('');
 return '<div class="deep-layout"><article class="deep-article"><div class="eyebrow">'+escapeHtml(d.eyebrow)+'</div><h1>'+escapeHtml(d.title)+'</h1><p class="lede">'+escapeHtml(d.deck)+'</p><div class="hero-facts">'+d.highlights.map(([n,t])=>'<div><strong>'+escapeHtml(n)+'</strong><span>'+escapeHtml(t)+'</span></div>').join('')+'</div><p class="reading-meta">'+escapeHtml(d.updated)+' · '+d.sections.length+' sections</p>'+d.sections.map(s=>'<section class="deep-section" id="'+id+'-'+s.id+'"><div class="eyebrow">'+String(d.sections.indexOf(s)+1).padStart(2,'0')+' / '+String(d.sections.length).padStart(2,'0')+'</div><h2>'+escapeHtml(s.title)+'</h2>'+s.body.map(p=>'<p>'+escapeHtml(p)+'</p>').join('')+(s.note?'<div class="insight">'+escapeHtml(s.note)+'</div>':'')+'</section>').join('')+'<div class="sourcebox"><details><summary>Research notes · '+d.source.length+' references</summary><p>These sources support the page above. Read the study or guidance for its methods and limits.</p><ol>'+d.source.map(([name,url])=>'<li><a href="'+escapeHtml(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(name)+'</a></li>').join('')+'</ol></details></div><div class="related"><div class="eyebrow">Continue exploring</div>'+d.related.map(([name,route])=>'<a href="'+route+'">'+escapeHtml(name)+' →</a>').join('')+'</div></article><aside class="article-rail"><div class="eyebrow">On this page</div><nav>'+anchors+'</nav><div class="rail-note">Groundwell research guide<br>'+escapeHtml(d.updated)+'</div></aside></div>';
}

function mold(){return deepPage('mold')+`<div class="paper" style="max-width:790px;margin-top:22px"><h2>Keep a building log</h2><p>Record dates, rooms, moisture, symptoms, and work completed.</p><textarea id="mold-note" class="search" rows="4" placeholder="Date · Room · Moisture source · Symptoms · Actions"></textarea><button class="button dark" id="save-mold" type="button">Save to My wellness</button></div>`}
function oral(){return deepPage('oral')}
function conditions(){
 const cards=[
  tile('Foundation','Nutrition','Food patterns, nutrient adequacy and useful tracking.','#guide/nutrition'),
  tile('Immune health','Autoimmune conditions','Dietary questions, daily function and condition-specific context.','#guide/autoimmune'),
  tile('Focus','ADHD','Sleep, routines, nutrition and tracking attention.','#guide/adhd'),
  tile('Mood','Depression','Sleep, activity, nutrition and symptom patterns.','#guide/depression'),
  tile('Environment','Mold & indoor air','Building investigation, cleanup and health history.','#mold'),
  tile('Daily care','Oral health','Teeth, gums, food and dry mouth.','#oral'),
  tile('Research desk','COVID vaccination','Ingredients, persistence, adverse effects and detox claims.','#vaccine')];
 return pageHeader('The library','Conditions & topics','A clear starting point for each subject. Open a guide for the full explanation.')+`<div class="grid three" style="margin-top:24px">${cards.join('')}</div>`;
}
function profileTarget(name,p){
 const age=Number(p.age),male=p.sex==='male',stage=p.stage;
 const target={
 'Vitamin D':age>=71?'20 mcg (800 IU)':'15 mcg (600 IU)',
 'Vitamin B12':stage==='pregnant'?'2.6 mcg':stage==='lactating'?'2.8 mcg':'2.4 mcg',
 'Vitamin B6':stage==='pregnant'?'1.9 mg':stage==='lactating'?'2 mg':age>50?(male?'1.7 mg':'1.5 mg'):'1.3 mg',
 'Iron':stage==='pregnant'?'27 mg':stage==='lactating'?'9 mg':!male&&age<=50?'18 mg':'8 mg',
 'Calcium':stage!=='none'?'1,000 mg':(!male&&age>=51)||age>=71?'1,200 mg':'1,000 mg',
 'Magnesium':stage==='pregnant'?(age<=30?'350 mg':'360 mg'):stage==='lactating'?(age<=30?'310 mg':'320 mg'):male?(age<=30?'400 mg':'420 mg'):(age<=30?'310 mg':'320 mg'),
 'Vitamin B9':stage==='pregnant'?'600 mcg DFE':stage==='lactating'?'500 mcg DFE':'400 mcg DFE',
 'Vitamin A':stage==='pregnant'?'770 mcg RAE':stage==='lactating'?'1,300 mcg RAE':male?'900 mcg RAE':'700 mcg RAE',
 'Vitamin C':stage==='pregnant'?'85 mg':stage==='lactating'?'120 mg':male?'90 mg':'75 mg',
 'Vitamin K':stage!=='none'?'90 mcg AI':male?'120 mcg AI':'90 mcg AI',
 'Zinc':stage==='pregnant'?'11 mg':stage==='lactating'?'12 mg':male?'11 mg':'8 mg'
 };
 return target[name]||null;
}
function supplements(){
 return `${pageHeader('Reference library','Supplements & nutrients','Search by name, alternate name, or food source. Open a full card for history, uses, intake guidance, timing, and safety.')}<input id="nutrient-search" class="search" type="search" placeholder="Search vitamin D, B12, magnesium…"><div class="profile-strip"><strong>${personal.profile?'Profile active · '+escapeHtml(personal.profile.age)+' years':'General adult reference'}</strong><p>Daily targets include food and supplements. <a href="#journal"><u>${personal.profile?'Edit profile':'Set up a profile'} →</u></a></p></div><div id="nutrient-list" class="grid three"></div>`;
}
const nutrientDepth={
 'vitamin-a':{
 focus:'Retinol is the preformed form found in animal foods. Colorful plants supply carotenoids that the body can convert to vitamin A. The conversion differs between people and foods, so the two sources should not be treated as identical milligram for milligram.',
 use:'Vitamin A supports vision in low light, immune defenses, growth, and normal tissue development. Deficiency can affect night vision and the eyes, but extra intake above an adequate amount has not been shown to improve vision in a well-nourished adult.',
 practice:'Compare the total from food, fortified products, and supplements. A label may list retinyl palmitate, retinyl acetate, or beta-carotene. The upper limit applies to preformed vitamin A; pregnancy warrants particular care with high-retinol products.',
 question:'Is the concern low dietary intake, a diagnosed deficiency, or a promise of better eyesight? Those are different questions.'
 },
 'vitamin-b1':{
 focus:'Thiamin is a water-soluble B vitamin. Enriched grain products, pork, legumes, and seeds can supply it. Its role became clear when diets based on polished rice were linked with beriberi.',
 use:'Thiamin helps enzymes release energy from carbohydrates and supports nerve function. People with poor intake, some malabsorption conditions, or heavy alcohol use may be at higher risk of deficiency.',
 practice:'A routine supplement is usually taken with a meal for convenience, though no specific hour is required. Look at dietary pattern and any condition affecting absorption before assuming a large dose is necessary.',
 question:'Is there a dietary gap or a medical reason to suspect deficiency?'
 },
 'vitamin-b2':{
 focus:'Riboflavin becomes part of the FAD and FMN coenzymes, which participate in many energy-related reactions. Dairy, eggs, meat, almonds, and fortified grains are common sources.',
 use:'Low riboflavin can contribute to mouth and skin changes and may occur alongside other B-vitamin gaps. It has been studied at higher doses for migraine prevention, a separate use from ordinary dietary adequacy.',
 practice:'Check the product amount before combining a B-complex with a multivitamin. Bright yellow urine after a supplement is a familiar effect of excess riboflavin and is not proof of a therapeutic benefit.',
 question:'Is the goal meeting a daily intake target or discussing a specific clinical use such as migraine?'
 },
 'vitamin-b3':{
 focus:'Niacin includes nicotinic acid and nicotinamide. The body can also make some niacin from the amino acid tryptophan, which is why intake is expressed as niacin equivalents.',
 use:'Niacin supports energy metabolism, skin, and nervous-system function. Severe deficiency causes pellagra. High-dose nicotinic acid used for blood lipids is a drug-level intervention and should not be confused with a nutritional serving.',
 practice:'Compare the form and dose on the label. Nicotinic acid can cause flushing; larger amounts can affect the liver and glucose. The adult upper limit for routine supplemental intake is far below doses sometimes used clinically.',
 question:'Which form is in the product, and what outcome is the dose meant to change?'
 },
 'vitamin-b5':{
 focus:'Pantothenic acid is a component of coenzyme A. It occurs across many foods, including poultry, mushrooms, eggs, and whole grains, which helps explain why deficiency is uncommon with varied eating.',
 use:'Coenzyme A participates in fatty-acid metabolism and many other biochemical reactions. Marketing claims that pantothenic acid alone will raise energy or clear acne need to be evaluated separately from its essential nutrient role.',
 practice:'Start with food pattern and the adequate-intake target. A standard multivitamin often supplies a daily amount. Very large doses can cause gastrointestinal discomfort without a clear reason to use them.',
 question:'Is a marketed benefit supported by a human trial, or only by the fact that the vitamin is essential?'
 },
 'vitamin-b6':{
 focus:'Vitamin B6 is a group of related compounds. Pyridoxine is common in supplements, while pyridoxal 5-phosphate is an active coenzyme form. Foods include chickpeas, poultry, fish, and potatoes.',
 use:'B6 supports amino-acid metabolism, hemoglobin, and neurotransmitter synthesis. That biochemical role does not mean a high-dose B6 supplement treats every mood or nerve symptom.',
 practice:'Add up B6 from multivitamins, B-complex products, and single-ingredient tablets. Long-term high intakes can injure sensory nerves. Tingling or numbness while taking B6 deserves a review of all product labels.',
 question:'What is the total daily B6 amount across every product, and how long has it been used?'
 },
 'vitamin-b7':{
 focus:'Biotin helps enzymes involved in fat, carbohydrate, and amino-acid metabolism. Deficiency is uncommon in people eating varied foods. Cooked eggs, fish, nuts, and seeds provide it.',
 use:'High-dose biotin is marketed for hair and nails, but evidence for benefit in a person without deficiency is limited. Hair changes have many possible causes that a supplement cannot identify.',
 practice:'Biotin can interfere with certain laboratory tests, including tests used for thyroid and heart problems. Tell the laboratory and clinician about any biotin product before testing. No special morning or evening timing is established.',
 question:'Is there evidence of deficiency, and could the supplement interfere with a test you are having?'
 },
 'vitamin-b9':{
 focus:'Folate is the broad nutrient family. Food folate, folic acid, and 5-MTHF have different chemistry and labeling conventions. Dietary folate equivalents account for differences in absorption.',
 use:'Folate supports DNA synthesis and cell division. Adequate intake around conception matters for neural-tube development. A common gene variant alone does not establish that someone needs a large methylfolate dose.',
 practice:'The preconception and pregnancy question deserves specific guidance. Folic acid has the strongest established prevention evidence for neural-tube defects. Large amounts of supplemental folate can complicate recognition of a B12 deficiency.',
 question:'Is the goal general adequacy, pregnancy planning, or treatment of a documented problem?'
 },
 'vitamin-b12':{
 focus:'B12 in foods is attached to protein and requires normal digestion for release. Supplements contain free B12. Cyanocobalamin and methylcobalamin are common forms; available evidence has not shown that one form is universally better absorbed.',
 use:'B12 is needed for red cells, DNA, and nerve function. People avoiding animal foods, older adults, and people taking metformin or acid-suppressing drugs may need closer attention to intake or status.',
 practice:'A large number on a supplement label is not the amount absorbed. Absorption becomes less efficient at higher doses. A suspected deficiency, especially with neurologic symptoms, calls for an evaluation of the cause and an appropriate treatment route.',
 question:'Is the concern low intake, impaired absorption, or a documented deficiency?'
 },
 'vitamin-c':{
 focus:'Vitamin C is a water-soluble nutrient in peppers, citrus, kiwi, berries, and many vegetables. It is needed for collagen formation and improves absorption of nonheme iron from plant foods.',
 use:'Severe deficiency causes scurvy. Vitamin C supports normal immune function, but that essential role does not mean very high doses prevent every infection or shorten every illness.',
 practice:'Food can supply the daily target. People who smoke have a higher recommended intake. Large supplemental amounts may cause diarrhea or cramping. Pairing a vitamin-C-rich food with beans or lentils can help iron absorption.',
 question:'Would a food change meet the goal without a high-dose product?'
 },
 'vitamin-d':{
 focus:'Vitamin D3 and D2 are the common supplemental forms. Skin makes vitamin D with ultraviolet exposure, while fatty fish and fortified foods provide some. Intake alone cannot tell you an individual blood level.',
 use:'Vitamin D helps absorb calcium and maintain bone health. Trials for unrelated conditions have produced mixed results, so a low level, a bone-health goal, and a general wellness claim should be considered separately.',
 practice:'A meal containing fat may improve absorption. Age changes the daily target after 70. A supplement label often uses IU, while reference tables use micrograms: 1 mcg equals 40 IU. Excess intake can raise blood calcium.',
 question:'Is there a reason to check status or discuss a different dose because of an established condition?'
 },
 'vitamin-e':{
 focus:'Vitamin E is a family of compounds. The adult intake target is expressed as alpha-tocopherol. Nuts, seeds, and several plant oils supply it alongside other nutrients.',
 use:'It acts as an antioxidant in cells and supports normal immune function. Results from studies of high-dose supplementation for disease prevention have not justified treating all antioxidant claims as equivalent.',
 practice:'A food source is different from a high-dose capsule. Some large doses can increase bleeding risk, especially with anticoagulant medicines. Check whether multiple products contain vitamin E.',
 question:'Does a product supply a nutritional amount or a much higher therapeutic claim?'
 },
 'vitamin-k':{
 focus:'Vitamin K1 is abundant in leafy greens. K2 refers to several menaquinones found in some animal and fermented foods. These forms share roles but are not interchangeable in every study.',
 use:'Vitamin K helps activate proteins needed for normal clotting and contributes to bone-protein activity. Interest in K2 and cardiovascular or bone outcomes is active research, with claims varying by product and study.',
 practice:'For someone taking warfarin, consistency of vitamin K intake matters. Do not abruptly change leafy-green intake or add K products without discussing the plan with the prescribing team. Routine timing has no established special hour.',
 question:'Does a study address the same K form, dose, population, and outcome as the product being considered?'
 },
 'calcium':{
 focus:'Calcium comes from dairy, fortified beverages, calcium-set tofu, greens such as kale, and fish eaten with bones. Spinach contains calcium but much of it is poorly absorbed because of oxalate.',
 use:'Calcium supports bones, muscle contraction, and nerve signaling. The daily target changes for women after 50 and men after 70. Bone health also depends on vitamin D status, activity, and other factors.',
 practice:'Calcium carbonate is usually taken with food; citrate is less dependent on stomach acid. Supplemental absorption is highest at 500 mg or less at a time. Check the elemental calcium amount and separate from medicines when instructed.',
 question:'How much calcium is already coming from food before adding a supplement?'
 },
 'magnesium':{
 focus:'Magnesium is present in legumes, nuts, seeds, leafy greens, and whole grains. The elemental magnesium amount on a label matters more than the total weight of a salt such as magnesium citrate.',
 use:'It is involved in hundreds of enzyme reactions and normal muscle and nerve function. Supplements have been studied for particular conditions, but a biological role does not prove a broad sleep or anxiety benefit for everyone.',
 practice:'Forms differ in solubility and gastrointestinal effects. Oxide may be less well absorbed than some other salts. Supplemental magnesium can cause diarrhea and can interfere with absorption of certain antibiotics or bone medicines if taken together.',
 question:'Which form and elemental dose is being taken, and is a medication-spacing issue present?'
 },
 'iron':{
 focus:'Heme iron from animal foods and nonheme iron from plants differ in absorption. Beans, lentils, fortified grains, and meat can contribute. Vitamin C with plant iron improves absorption.',
 use:'Iron is needed for hemoglobin and oxygen transport. Requirements vary markedly with age, sex, pregnancy, and menstrual status. Fatigue alone does not establish iron deficiency.',
 practice:'Iron supplements can cause gastrointestinal effects and are dangerous to children if accidentally swallowed. Calcium supplements can reduce absorption when taken together. A suspected deficiency calls for evaluating iron status and the reason for low stores.',
 question:'What do hemoglobin and iron studies show, and why might iron stores be low?'
 },
 'zinc':{
 focus:'Zinc is found in oysters, meat, beans, seeds, and nuts. Plant compounds can reduce absorption, so food pattern can affect availability.',
 use:'Zinc supports immune-cell activity, wound healing, growth, and taste. Zinc lozenges have been studied for the common cold, a distinct question from taking a daily zinc tablet indefinitely.',
 practice:'Long-term high zinc can reduce copper status and lead to problems of its own. Zinc can also interfere with certain antibiotics. Add up zinc from multivitamins and individual products.',
 question:'Is this short-term use for a studied outcome or a daily dose continued for months?'
 },
 'iodine':{
 focus:'Iodine is needed to make thyroid hormones. Iodized salt, seafood, and dairy are common sources. Kelp products vary greatly in iodine content.',
 use:'Adequate iodine is particularly important during pregnancy and lactation. Both too little and too much can affect thyroid function, so a high-dose seaweed supplement is not automatically beneficial.',
 practice:'Check whether household salt is iodized and whether other supplements contain iodine. Thyroid disease or thyroid medicines make individual advice more important. Pregnancy guidance differs from the ordinary adult target.',
 question:'Is intake actually low, and is there a thyroid condition that changes the plan?'
 },
 'selenium':{
 focus:'Selenium content of plant foods depends on soil. Seafood, meat, eggs, and Brazil nuts can supply it. A few Brazil nuts may contain very different amounts.',
 use:'Selenium is part of proteins involved in antioxidant defenses and thyroid hormone metabolism. Studies of supplementation for broad disease prevention do not support assuming more is better.',
 practice:'Compare the product amount with food and the upper limit. Repeated large intakes can cause hair and nail changes, gastrointestinal symptoms, and other problems. Avoid stacking high-selenium products.',
 question:'Is the proposed benefit backed by an outcome study or only a mechanistic theory?'
 },
 'omega-3-fats':{
 focus:'ALA is an essential plant omega-3 in flax, chia, walnuts, and some oils. EPA and DHA occur mainly in fish and algae. Conversion of ALA into EPA and DHA is limited and variable.',
 use:'Omega-3 fats are part of normal cell membranes. Prescription EPA/DHA products for high triglycerides are a different context from an ordinary fish-oil capsule. Evidence for ADHD, mood, and broad prevention is mixed by outcome.',
 practice:'Read the EPA and DHA amounts per serving rather than the total fish-oil weight. Check product quality and discuss high doses if using anticoagulants or if atrial fibrillation is a concern. Fish and algae foods can be considered alongside supplements.',
 question:'Which omega-3 form, amount, and health outcome is the study actually about?'
 }
};

let nutrientProfileId='';
const NUTRIENT_SCALES={
 'vitamin-d':{unit:'mcg',target:p=>Number(p.age)>=71?20:15,upper:p=>100,kind:'total intake'},
 'zinc':{unit:'mg',target:p=>p.sex==='male'?11:8,upper:p=>40,kind:'total intake'},
 'iron':{unit:'mg',target:p=>p.sex==='male'||Number(p.age)>=51?8:18,upper:p=>45,kind:'total intake'},
 'calcium':{unit:'mg',target:p=>p.sex==='female'&&Number(p.age)>=51||p.sex==='male'&&Number(p.age)>=71?1200:1000,upper:p=>Number(p.age)>=51?2000:2500,kind:'total intake'},
 'vitamin-c':{unit:'mg',target:p=>p.sex==='male'?90:75,upper:p=>2000,kind:'total intake'}
};
function currentNutrientProfile(){if(nutrientProfileId==='journal')return personal.profile;if(nutrientProfileId)return routine.people.find(x=>x.id===nutrientProfileId);return personal.profile||null}
function nutrientProfileChooser(){return `<div class="profile-chooser"><label>Reference profile <select id="nutrient-person"><option value="" ${!nutrientProfileId?'selected':''}>${personal.profile?'Journal profile':'Choose a person'}</option>${personal.profile?'<option value="journal" '+(nutrientProfileId==='journal'?'selected':'')+'>Journal profile</option>':''}${routine.people.map(p=>`<option value="${escapeHtml(p.id)}" ${nutrientProfileId===p.id?'selected':''}>${escapeHtml(p.name)}</option>`).join('')}</select></label><p>This controls published adult reference tables. It does not prescribe a supplement amount or account for medical conditions.</p></div>`}
function nutrientScale(id,p){let d=NUTRIENT_SCALES[id];if(!d||!p||!['female','male'].includes(p.sex)||!(Number(p.age)>=18))return '';let target=d.target(p),upper=d.upper(p),width=Math.max(3,Math.min(100,target/upper*100));return `<div class="nutrient-scale"><div class="eyebrow">Published adult references · ${escapeHtml(p.name||'Profile')} · ${escapeHtml(p.age)} years</div><div class="scale-track"><div class="scale-target" style="left:${width}%"></div></div><div class="scale-numbers"><span>0</span><strong>Intake target: ${target} ${d.unit}</strong><span>Upper limit: ${upper} ${d.unit}</span></div><p>The target describes food plus supplements. The upper limit is a boundary for most adults, not a target. This visual compares two different concepts on one scale; treatment and pregnancy can require different guidance.</p></div>`}

function nutrientDetail(id){
 const n=library.nutrients.find(x=>x.id===id);
 if(!n)return notFound();
 const f=n.fields,person=currentNutrientProfile(),target=person?.sex?profileTarget(n.name,person):null,relatedDossier=({'vitamin-d':'vitamin-d','magnesium':'magnesium','calcium':'calcium','iron':'iron','zinc':'zinc','vitamin-b12':'b12','vitamin-b6':'b6-neuropathy','vitamin-b9':'folate','iodine':'iodine-thyroid','selenium':'selenium','vitamin-k':'vitamin-k','omega-3-fats':'omega3'})[id];
 return `<div class="article"><a href="#supplements" class="eyebrow">← Nutrient library</a><h1>${escapeHtml(n.name)}</h1><p class="lede">${escapeHtml(f['What it does'])}</p><p class="muted">Also known as ${escapeHtml(n.aliases)}</p>${nutrientProfileChooser()}${nutrientScale(id,person)}${target?`<div class="profile-strip"><strong>Profile daily target · ${escapeHtml(target)}</strong><p>This is a total intake target from food and supplements, not a suggested supplement dose.</p></div>`:''}
 <div class="detail-grid"><section><h3>History</h3><p>${escapeHtml(f.History)}</p></section><section><h3>Food sources</h3><p>${escapeHtml(f['Food sources'])}</p></section><section><h3>General adult intake</h3><p>${escapeHtml(f['U.S. daily intake'])}</p></section><section><h3>Timing & use</h3><p>${escapeHtml(f['When to take it'])}</p></section></div>${nutrientDepth[id]?`<div class="nutrient-reading"><h2>Forms and food context</h2><p>${escapeHtml(nutrientDepth[id].focus)}</p><h2>What the evidence addresses</h2><p>${escapeHtml(nutrientDepth[id].use)}</p><h2>Practical use</h2><p>${escapeHtml(nutrientDepth[id].practice)}</p><div class="insight"><strong>Question to ask</strong><br>${escapeHtml(nutrientDepth[id].question)}</div></div>`:''}<div class="callout"><strong>Limits and considerations</strong><br>${escapeHtml(f['Upper limit and cautions'])}</div><p>Daily intake guidance varies by life stage and individual circumstances. Record any product form and amount in My wellness before comparing your total intake.</p><div class="sourcebox"><details><summary>Reference and review notes</summary><p>${sources.nutrient} Reviewed November 2026.</p><a href="${escapeHtml(n.source)}" target="_blank" rel="noopener noreferrer">Detailed nutrient reference ↗</a></details></div><p style="margin-top:30px">${relatedDossier?`<a class="button dark" href="#dossier/${relatedDossier}">Read the deeper research dossier</a> `:''}<a class="button dark" href="#routine">Add to supplement routine</a></p></div>`;
}
function renderNutrients(q=''){
 const matches=library.nutrients.filter(n=>(n.name+' '+n.aliases+' '+n.fields['Food sources']).toLowerCase().includes(q.toLowerCase().trim()));
 $('#nutrient-list').innerHTML=matches.map(n=>tile('Nutrient',escapeHtml(n.name),escapeHtml(n.fields['What it does']),`#nutrient/${n.id}`)).join('')||'<div class="paper">No matching nutrient. Try another name or form.</div>';
}
function people(){
 return `${pageHeader('The people library','People & perspectives','Explore fields of work and open a profile inside Groundwell. Inclusion is a way to study a person’s ideas, not an endorsement.')}<input class="search" id="people-search" type="search" placeholder="Search name or field"><div id="people-list" class="grid three" style="margin-top:20px"></div>`;
}
function renderPeople(q=''){
 const matching=library.people.filter(p=>(p.name+' '+p.field).toLowerCase().includes(q.toLowerCase().trim()));
 $('#people-list').innerHTML=matching.map((p,i)=>tile('Person',escapeHtml(p.name),escapeHtml(p.field),`#person/${encodeURIComponent(p.name)}`)).join('')||'<div class="paper">No matching person.</div>';
}
function person(name){
 const p=library.people.find(x=>x.name===name);
 if(!p)return notFound();
 return `<div class="article"><a href="#people" class="eyebrow">← People directory</a><h1>${escapeHtml(p.name)}</h1><p class="lede">${escapeHtml(p.field)}</p><h2>Research lens</h2><p>This profile identifies a field of work to explore. Read specific claims alongside the underlying study, method, and population before using them to guide a personal decision.</p><h2>Related Groundwell areas</h2><div class="grid two">${tile('Library','Supplement research','Compare nutrient claims with intake and safety guidance.','#supplements')}${tile('Library','Health conditions','See where nutrition and lifestyle topics intersect with conditions.','#conditions')}</div><div class="sourcebox"><details><summary>Original profile or publications</summary><a href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer">Open external source ↗</a></details></div></div>`;
}
function watch(){
 return `${pageHeader('Watch & read','Video library','Selected talks sit beside Groundwell summaries and related reference pages. The written context is available even when video playback is unavailable.')}<div class="grid two" style="margin-top:24px">${videos.map(v=>`<a href="#video/${v.id}" class="card"><div class="video-box">▷</div><span class="tag">${escapeHtml(v.topic)}</span><h3>${escapeHtml(v.title)}</h3><p>${escapeHtml(v.person)}</p><span class="arrow">Watch and read →</span></a>`).join('')}</div>`;
}
function videoDetail(id){
 const v=videos.find(x=>x.id===id);if(!v)return notFound();
 return `<div class="article"><a class="eyebrow" href="#watch">← Video library</a><h1>${escapeHtml(v.title)}</h1><p class="lede">${escapeHtml(v.person)} · ${escapeHtml(v.topic)}</p><div id="player"><button id="load-video" class="button dark" type="button">Play video here</button><p class="muted">Playback loads only when requested and requires a connection.</p></div><h2>Groundwell viewing note</h2><p>${escapeHtml(v.summary)}</p><h2>Questions to keep in mind</h2><ul>${v.points.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul><p><a class="button dark" href="#supplements">Explore related nutrients</a></p></div>`;
}
function explore(){
 return `${pageHeader('Search & discover','Explore the library','Search Groundwell’s written guides, nutrients, people, videos and source archive from one place.')}<input id="explore-search" type="search" class="search" placeholder="Search mold, vitamin D, ADHD, a person…"><div class="toolbar"><select id="explore-type"><option value="all">Everything</option><option value="guide">Guides</option><option value="nutrient">Nutrients</option><option value="person">People</option><option value="video">Videos</option><option value="archive">Source archive</option></select><span id="explore-count" class="muted"></span></div><div id="explore-results" class="list"></div>`;
}
function renderExplore(){
 const q=($('#explore-search')?.value||'').trim().toLowerCase(),type=$('#explore-type')?.value||'all';
 const guides=[...ATLAS.map(x=>({name:x.title,text:x.deck+' '+x.sections.flat().join(' '),href:'#chapter/'+x.id})),{name:'Mold & indoor air',text:deepArticles.mold.sections.map(x=>x.body.join(' ')).join(' '),href:'#mold'},{name:'Oral health',text:deepArticles.oral.sections.map(x=>x.body.join(' ')).join(' '),href:'#oral'},
 {name:'COVID vaccination',text:deepArticles.vaccine.sections.map(x=>x.body.join(' ')).join(' '),href:'#vaccine'},...Object.keys(conditionData).map(id=>({name:deepArticles[id].title,text:deepArticles[id].deck+' '+deepArticles[id].sections.map(x=>x.body.join(' ')).join(' '),href:'#guide/'+id}))];
 const all=[
 ...Object.entries(MONOGRAPHS).map(([id,x])=>({type:'guide',title:x.title,description:x.deck,text:x.sections.map(s=>s.title+' '+s.body.join(' ')).join(' '),href:'#dossier/'+id})),
 ...guides.map(x=>({type:'guide',title:x.name,description:'Groundwell guide',text:x.text,href:x.href})),
 ...library.nutrients.map(x=>({type:'nutrient',title:x.name,description:x.fields['What it does'],text:x.aliases+' '+Object.values(x.fields).join(' '),href:'#nutrient/'+x.id})),
 ...library.people.map(x=>({type:'person',title:x.name,description:x.field,text:x.field,href:'#person/'+encodeURIComponent(x.name)})),
 ...videos.map(x=>({type:'video',title:x.title,description:x.person,text:x.summary,href:'#video/'+x.id})),
 ...library.archive.map((x,i)=>({type:'archive',title:x.title,description:x.description,text:x.topic+' '+x.meta,href:'#archive/'+i}))
 ];
 const found=all.filter(x=>(type==='all'&&x.type!=='archive'||type===x.type)&&(!q||(x.title+' '+x.description+' '+x.text).toLowerCase().includes(q))).slice(0,250);
 $('#explore-count').textContent=found.length+(type==='archive'?' archive matches':' results');
 $('#explore-results').innerHTML=found.map(x=>`<a class="list-item" href="${x.href}"><div class="alpha">${escapeHtml(x.type)}</div><h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.description)}</p></a>`).join('')||'<div class="paper">No matches. Try a broader term or choose a different category.</div>';
}
function archiveDetail(i){
 const x=library.archive[Number(i)];if(!x)return notFound();
 return `<div class="article"><a href="#explore" class="eyebrow">← Explore</a><h1>${escapeHtml(x.title)}</h1><p class="lede">${escapeHtml(x.description)}</p><div class="notice">This is a catalog record. The original material has not yet been rewritten as a Groundwell article.</div><p>${escapeHtml(x.meta)} · ${escapeHtml(x.topic)}</p><details class="sourcebox"><summary>Original source</summary><p><a class="reference-link" href="${escapeHtml(x.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(x.url)}</a></p></details></div>`;
}
function journal(){
 const p=personal.profile||{};
 return `${pageHeader('Private on this device','My wellness','Keep a personal record of supplements, food, symptoms and protocols. Export a copy whenever you want a backup.')}
 <div class="tabs"><button data-tab="overview" class="active">Timeline</button><button data-tab="profile">Profile</button><button data-tab="supplement">Supplements</button><button data-tab="food">Food</button><button data-tab="symptom">Symptoms</button><button data-tab="protocol">Protocols</button></div><div id="journal-content"></div>`;
}
function journalContent(tab){
 if(tab==='profile'){
  const p=personal.profile||{};
  return `<div class="paper"><h2>Your profile</h2><p>Age and sex set published adult intake targets where available. Weight is optional context. Records stay in this browser.</p><form id="profile-form" class="form-grid"><label>Name<input name="name" maxlength="40" value="${escapeHtml(p.name||'')}" placeholder="Optional"></label><label>Age 18–120<input name="age" type="number" min="18" max="120" required value="${escapeHtml(p.age||'')}"></label><label>Sex used for reference tables<select name="sex" required><option value="">Select</option><option value="female" ${p.sex==='female'?'selected':''}>Female</option><option value="male" ${p.sex==='male'?'selected':''}>Male</option></select></label><label>Weight in pounds (optional)<input name="weight" type="number" min="40" max="1000" step=".1" value="${escapeHtml(p.weight||'')}"></label><label>Life stage<select name="stage"><option value="none">Neither</option><option value="pregnant" ${p.stage==='pregnant'?'selected':''}>Pregnant</option><option value="lactating" ${p.stage==='lactating'?'selected':''}>Lactating</option></select></label><div class="span"><button class="button dark">Save profile</button> <button type="button" class="ghost" id="clear-profile">Clear profile</button></div></form><p id="profile-message" role="status"></p></div>`;
 }
 if(tab==='overview'){
  const rows=[...personal.entries].reverse().slice(0,30);
  return `<div class="grid two"><div class="paper"><h2>Recent entries</h2>${rows.length?`<div class="timeline">${rows.map(x=>`<article><strong>${escapeHtml(x.title)}</strong><small>${escapeHtml(x.date)} · ${escapeHtml(x.type)}</small><p>${escapeHtml(x.detail)}</p><button class="ghost" data-delete="${escapeHtml(x.id)}" type="button">Delete</button></article>`).join('')}</div>`:'<p>No entries yet. Choose a tab to add your first note.</p>'}</div><div class="paper"><h2>Keep a usable record</h2><p>Record one change at a time, including dates and product amounts. Trends are observations that can be discussed with a clinician.</p><p>${personal.profile?'Profile: '+escapeHtml(personal.profile.name||'Adult')+' · '+escapeHtml(personal.profile.age)+' years':'Set up your profile to see applicable intake targets.'}</p><button id="export-data" class="button dark" type="button">Export all data</button> <label class="ghost" style="display:inline-block">Restore backup<input id="restore-data" type="file" accept="application/json" hidden></label></div></div>`;
 }
 const fields={
 supplement:[['Product or nutrient','name','text'],['Amount and form','amount','text'],['Schedule','schedule','text']],
 food:[['Meal or food','name','text'],['Portion or ingredients','amount','text'],['Context','schedule','text']],
 symptom:[['Symptom','name','text'],['Severity (0–10)','amount','number'],['Context or trigger','schedule','text']],
 protocol:[['Protocol or practice','name','text'],['Plan or frequency','amount','text'],['Starting point','schedule','text']]
 };
 return `<div class="paper"><h2>Record ${tab}</h2><form id="entry-form" class="entry-form"><input type="hidden" name="type" value="${tab}">${fields[tab].map(([label,name,type])=>`<label>${label}<input name="${name}" type="${type}" ${type==='number'?'min="0" max="10"':''} required></label>`).join('')}<label>Date<input name="date" type="date" value="${new Date().toISOString().slice(0,10)}" required></label><label class="span">Notes<textarea name="notes" placeholder="What changed?"></textarea></label><div class="span"><button class="button dark">Save entry</button></div></form><p id="entry-message" role="status"></p></div>`;
}
function bindJournal(tab){
 $('#journal-content').innerHTML=journalContent(tab);
 document.querySelectorAll('[data-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.tab===tab);b.onclick=()=>bindJournal(b.dataset.tab)});
 if(tab==='profile'){
  $('#profile-form').onsubmit=e=>{
   e.preventDefault();
   const data=Object.fromEntries(new FormData(e.currentTarget).entries());
   if(data.stage!=='none'&&data.sex!=='female'){$('#profile-message').textContent='Choose the female reference table for pregnancy or lactation targets.';return}
   personal.profile=data;
   $('#profile-message').textContent=persist()?'Profile saved on this device.':'Storage is unavailable. Export your data.';
  };
  $('#clear-profile').onclick=()=>{personal.profile=null;persist();bindJournal('profile')};
 }
 if(tab==='overview'){
  $('#export-data').onclick=exportData;
  $('#restore-data').onchange=restoreData;
  document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{personal.entries=personal.entries.filter(x=>x.id!==b.dataset.delete);persist();bindJournal('overview')});
 }
 const form=$('#entry-form');
 if(form)form.onsubmit=e=>{
  e.preventDefault();const fields=Object.fromEntries(new FormData(form).entries());
  personal.entries.push({id:crypto.randomUUID?.()||String(Date.now()+Math.random()),type:fields.type,date:fields.date,title:fields.name,detail:[fields.amount,fields.schedule,fields.notes].filter(Boolean).join(' · ')});
  $('#entry-message').textContent=persist()?'Entry saved.':'Storage unavailable. Export your data now.';
  form.reset();form.elements.date.value=new Date().toISOString().slice(0,10);
 };
}
function exportData(){
 const blob=new Blob([JSON.stringify({schema:2,exportedAt:new Date().toISOString(),profile:personal.profile,entries:personal.entries,routine},null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='groundwell-wellness-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
}
function validRoutineBackup(r){return r&&Array.isArray(r.people)&&r.people.length>0&&r.people.every(x=>x&&typeof x.id==='string'&&typeof x.name==='string')&&typeof r.selected==='string'&&r.people.some(x=>x.id===r.selected)&&Array.isArray(r.products)&&r.products.every(x=>x&&typeof x.id==='string'&&typeof x.personId==='string'&&typeof x.name==='string'&&typeof x.dose==='string'&&typeof x.stockDate==='string'&&Array.isArray(x.times)&&x.times.every(t=>typeof t==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(t))&&Array.isArray(x.days)&&x.days.every(d=>Number.isInteger(d)&&d>=0&&d<=6)&&Number.isFinite(Number(x.stock))&&Number.isFinite(Number(x.perDose)))&&Array.isArray(r.doses)&&r.doses.every(x=>x&&typeof x.productId==='string'&&typeof x.date==='string'&&typeof x.time==='string'&&['taken','skipped'].includes(x.status))}
async function restoreData(e){
 const f=e.target.files?.[0];if(!f)return;
 try{
  if(f.size>10_000_000)throw Error('Backup is too large.');
  const data=JSON.parse(await f.text());
  if(data.schema!==2||!Array.isArray(data.entries)||data.entries.some(x=>!x||typeof x.id!=='string'||typeof x.type!=='string'||typeof x.title!=='string'||typeof x.date!=='string'||typeof x.detail!=='string')||(data.profile!==null&&typeof data.profile!=='object'))throw Error('This is not a Groundwell backup.');
  if(data.routine!==undefined&&!validRoutineBackup(data.routine))throw Error('The supplement routine in this backup is invalid. Nothing was replaced.');
  if(!confirm('Replace the profile, journal and (if included) supplement routine on this device with this backup?'))return;
  personal={profile:data.profile,entries:data.entries};persist();
  if(data.routine){routine=data.routine;routineSave()}
  if(location.hash==='#routine'){view.innerHTML=routinePage();bindRoutine()}else bindJournal('overview');
 }catch(err){alert(err.message||'Could not restore this file.')}
}

function atlasVisual(type){
 const common='<defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7" fill="#879f7a"/></marker></defs>';
 if(type==='path')return `<svg viewBox="0 0 720 180" role="img" aria-label="Digestive route from mouth through stomach and small intestine to colon">${common}<path d="M88 89H620" stroke="#879f7a" stroke-width="3" marker-end="url(#arrow)"/>${['Mouth','Esophagus','Stomach','Small intestine','Colon'].map((t,i)=>`<circle cx="${90+i*128}" cy="89" r="25" fill="#d7e4d1" stroke="#63846b"/><text x="${90+i*128}" y="94" text-anchor="middle" fill="#24443d" font-size="16">${i+1}</text><text x="${90+i*128}" y="143" text-anchor="middle" fill="#35463f" font-size="13">${t}</text>`).join('')}</svg>`;
 if(type==='gutbrain')return `<svg viewBox="0 0 720 180" role="img" aria-label="Two-way communication between gut and brain">${common}<circle cx="170" cy="88" r="55" fill="#dce9e0"/><circle cx="550" cy="88" r="55" fill="#e6dfcf"/><text x="170" y="95" text-anchor="middle" font-size="24" fill="#24443d">GUT</text><text x="550" y="95" text-anchor="middle" font-size="24" fill="#24443d">BRAIN</text><path d="M230 70H480" stroke="#63846b" stroke-width="3" marker-end="url(#arrow)"/><path d="M490 107H240" stroke="#63846b" stroke-width="3" marker-end="url(#arrow)"/><text x="360" y="57" text-anchor="middle" font-size="13">signals and sensation</text><text x="360" y="136" text-anchor="middle" font-size="13">stress and regulation</text></svg>`;
 if(type==='ferment')return `<svg viewBox="0 0 720 180" role="img" aria-label="Fermentable carbohydrate pathway: food, water and fermentation, symptoms in sensitive people">${common}<path d="M110 88H620" stroke="#879f7a" stroke-width="3" marker-end="url(#arrow)"/>${['Food','Small bowel','Colon microbes','Gas and water','Sensation'].map((t,i)=>`<rect x="${37+i*135}" y="59" width="116" height="58" rx="15" fill="${i%2?'#e9e2d5':'#dce9e0'}"/><text x="${95+i*135}" y="93" text-anchor="middle" font-size="13" fill="#24443d">${t}</text>`).join('')}</svg>`;
 if(type==='evidence')return `<svg viewBox="0 0 720 180" role="img" aria-label="Evidence ladder from mechanism and anecdotes to controlled human outcomes">${common}${['Mechanism','Anecdote','Observational','Controlled trial'].map((t,i)=>`<rect x="${40+i*170}" y="${110-i*25}" width="140" height="${35+i*25}" rx="7" fill="${['#e5e6da','#dce5d4','#c9dcd0','#a9c9b8'][i]}"/><text x="${110+i*170}" y="${135-i*12}" text-anchor="middle" font-size="13" fill="#24443d">${t}</text>`).join('')}</svg>`;
 return `<svg viewBox="0 0 720 180" role="img" aria-label="Symptom timeline with meals, symptoms and bowel changes"><path d="M35 132H690" stroke="#869f90" stroke-width="2"/>${['Morning','Midday','Evening'].map((t,i)=>`<circle cx="${125+i*225}" cy="132" r="7" fill="#63846b"/><text x="${125+i*225}" y="160" text-anchor="middle" font-size="14">${t}</text>`).join('')}<path d="M60 88 Q150 20 260 78 T480 65 T670 92" fill="none" stroke="#bd8069" stroke-width="4"/><text x="340" y="32" text-anchor="middle" font-size="14">Record pattern and timing</text></svg>`;
}
function atlasHome(){return `${pageHeader('Groundwell atlas','Learn inside the library','A research desk of 25 focused dossiers and 29 concise topic briefs. Search their full text and follow the evidence from one subject to another.')}<div class="atlas-bar"><input class="search" id="atlas-search" type="search" placeholder="Search symptoms, foods, mechanisms or chapters" aria-label="Search chapters"><select id="atlas-filter" aria-label="Filter chapter category"><option value="all">All chapters</option>${[...new Set(ATLAS.map(x=>x.category))].map(c=>`<option>${escapeHtml(c)}</option>`).join('')}</select></div><p class="muted" id="atlas-count"></p><div id="atlas-results" class="grid three"></div><div class="paper"><a class="button dark" href="#glossary">Explore glossary and reading paths</a></div><div class="paper"><h2>Continue through Groundwell</h2><div class="grid three">${tile('Reference','20 nutrient cards','History, forms, food sources, intake and cautions.','#supplements')}${tile('Environment','Mold and indoor air','Moisture, cleanup and interpreting tests.','#mold')}${tile('Daily care','Oral health','Teeth, gums and food choices.','#oral')}${tile('Brain health','ADHD and depression','Evidence and practical tracking.','#conditions')}${tile('People','Expert directory','Thirty people to investigate with context.','#people')}${tile('Practice','Supplement routine','A daily capsule and refill planner.','#routine')}</div></div>`}
function renderAtlas(){const q=($('#atlas-search')?.value||'').trim().toLowerCase(),cat=$('#atlas-filter')?.value||'all';const rows=ATLAS.filter(x=>(cat==='all'||x.category===cat)&&(`${x.title} ${x.deck} ${x.sections.flat().join(' ')}`.toLowerCase().includes(q)));$('#atlas-count').textContent=`${rows.length} of ${ATLAS.length} topic briefs`;$('#atlas-results').innerHTML=rows.map(x=>tile(escapeHtml(x.category),escapeHtml(x.title),escapeHtml(x.deck),`#chapter/${x.id}`)).join('')||'<div class="paper">No chapter matches. Try a broader term.</div>'}
function atlasChapter(id){const x=ATLAS.find(x=>x.id===id);if(!x)return notFound();return `<div class="deep-layout"><article class="deep-article"><a href="#atlas" class="eyebrow">← Digestive atlas</a><h1>${escapeHtml(x.title)}</h1><p class="lede">${escapeHtml(x.deck)}</p><div class="atlas-visual">${atlasVisual(x.visual)}</div><p class="reading-meta">Groundwell topic brief · Reviewed November 2026 · ${x.sections.length} sections</p>${x.sections.map(([title,...paras],i)=>`<section class="deep-section" id="chapter-${x.id}-${i}"><div class="eyebrow">${String(i+1).padStart(2,'0')} / ${String(x.sections.length).padStart(2,'0')}</div><h2>${escapeHtml(title)}</h2>${paras.map(p=>`<p>${escapeHtml(p)}</p>`).join('')}</section>`).join('')}<div class="sourcebox"><details><summary>Research notes · ${x.sources.length} sources</summary><p>Primary references used to write this on-site explanation.</p><ol>${x.sources.map(([name,url])=>`<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a></li>`).join('')}</ol></details></div><div class="related"><div class="eyebrow">Keep exploring</div><a href="#atlas">All chapters →</a><a href="#routine">Supplement routine →</a><a href="#journal">Symptom journal →</a></div></article><aside class="article-rail"><div class="eyebrow">In this chapter</div><nav>${x.sections.map(([title],i)=>`<button type="button" data-jump="chapter-${x.id}-${i}">${escapeHtml(title)}</button>`).join('')}</nav></aside></div>`}

function glossaryPage(){return `${pageHeader('Reference desk','Glossary & learning paths','Define the concepts as you read, then follow a sequence of chapters that builds understanding.')}<div class="grid two path-grid">${PATHS.map(([name,desc,ids])=>`<div class="paper"><span class="tag">${ids.length} chapters</span><h2>${escapeHtml(name)}</h2><p>${escapeHtml(desc)}</p><ol>${ids.map(id=>{let x=ATLAS.find(a=>a.id===id);return `<li><a href="#chapter/${id}">${escapeHtml(x?.title||id)}</a></li>`}).join('')}</ol></div>`).join('')}</div><h2>Quick definitions</h2><input class="search" type="search" id="glossary-search" placeholder="Search a term or definition"><div id="glossary-list"></div>`}
function renderGlossary(){let q=($('#glossary-search')?.value||'').toLowerCase();$('#glossary-list').innerHTML=GLOSSARY.filter(([term,def])=>(term+' '+def).toLowerCase().includes(q)).map(([term,def,id])=>`<div class="glossary-row"><div><h3>${escapeHtml(term)}</h3><p>${escapeHtml(def)}</p></div><a href="#chapter/${id}">Read chapter →</a></div>`).join('')||'<p>No matching definition.</p>'}

function monographFigure(kind){
 if(kind==='claim-ladder')return `<figure class="science-figure"><div class="timing-chart"><div><b>Product identity</b><span>Species and strain</span></div><div><b>Studied dose</b><span>Viability and schedule</span></div><div><b>Population</b><span>Condition and context</span></div><div><b>Outcome</b><span>Measured benefit and harms</span></div></div><figcaption>A strain-specific study cannot validate every product with a similar label.</figcaption></figure>`;
 if(kind==='celiac-test')return `<figure class="science-figure"><div class="timing-chart"><div><b>Eating gluten</b><span>Keep the diagnostic signal</span></div><div><b>Blood tests</b><span>tTG-IgA and total IgA</span></div><div><b>Confirm</b><span>Clinical review and possible biopsy</span></div><div><b>Plan</b><span>Act on an established diagnosis</span></div></div><figcaption>Discuss testing before removing gluten; the exact diagnostic pathway depends on the patient.</figcaption></figure>`;
 if(kind==='gum-path')return `<figure class="science-figure"><div class="timing-chart"><div><b>Plaque</b><span>Biofilm at gumline</span></div><div><b>Gingivitis</b><span>Redness and bleeding</span></div><div><b>Calculus</b><span>Hardened deposits</span></div><div><b>Periodontitis</b><span>Possible loss of support</span></div></div><figcaption>Progression is not inevitable. Examination distinguishes reversible inflammation from loss of supporting tissue.</figcaption></figure>`;
 if(kind==='gum-assessment')return `<figure class="science-figure"><div class="test-grid"><div><strong>Bleeding</strong><span>Inflammatory sign</span><p>Local plaque and other factors can contribute.</p></div><div><strong>Pocket probe</strong><span>Depth around each tooth</span><p>Interpreted with recession and attachment.</p></div><div><strong>Radiograph</strong><span>Bone support</span><p>Helps assess structural loss.</p></div><div><strong>Follow-up</strong><span>Change after care</span><p>Compares the same measured sites.</p></div></div><figcaption>These measurements answer different periodontal questions.</figcaption></figure>`;
 if(kind==='bowel-assessment')return `<figure class="science-figure"><div class="test-grid"><div><strong>Stool pattern</strong><span>Form and frequency</span><p>Distinguish hard stool from difficult evacuation.</p></div><div><strong>Medicine review</strong><span>Timing and dose</span><p>Iron and other products can contribute.</p></div><div><strong>Alarm features</strong><span>Bleeding, weight loss, pain</span><p>Prompt further assessment.</p></div><div><strong>Clinical examination</strong><span>Individual context</span><p>Tests depend on the question.</p></div></div><figcaption>A menopause timeline does not replace evaluation of a new bowel problem.</figcaption></figure>`;
 if(kind==='saliva')return `<figure class="science-figure"><div class="timing-chart"><div><b>Saliva flow</b><span>Lubricates and washes</span></div><div><b>Buffering</b><span>Helps neutralize acid</span></div><div><b>Minerals</b><span>Supports enamel repair</span></div><div><b>Low flow</b><span>Raises cavity and infection risk</span></div></div><figcaption>A functional map of saliva’s protective roles, not a diagnostic flow measurement.</figcaption></figure>`;
 if(kind==='oral-acid')return `<figure class="science-figure"><div class="timing-chart"><div><b>Carbohydrate</b><span>Available to plaque bacteria</span></div><div><b>Acid pulse</b><span>Local pH falls</span></div><div><b>Mineral loss</b><span>Enamel demineralizes</span></div><div><b>Recovery</b><span>Saliva and fluoride support repair</span></div></div><figcaption>Repeated exposure frequency and recovery time matter; this is a mechanism diagram, not an individual risk score.</figcaption></figure>`;
 if(kind==='nutrient-path')return `<figure class="science-figure"><div class="timing-chart"><div><b>Food or product</b><span>Amount and chemical form</span></div><div><b>Digestion</b><span>Release and absorption</span></div><div><b>Body status</b><span>Stores and regulation</span></div><div><b>Outcome</b><span>Function, deficiency or excess</span></div></div><figcaption>The dose on a label, absorbed amount, blood marker and health outcome are different measurements.</figcaption></figure>`;
 if(kind==='brain-routine')return `<figure class="science-figure"><div class="timing-chart"><div><b>Baseline</b><span>Sleep and daily function</span></div><div><b>One change</b><span>Routine or product</span></div><div><b>Same measure</b><span>Track over weeks</span></div><div><b>Review</b><span>Benefit, burden and harms</span></div></div><figcaption>A practical experiment design; a diary alone cannot prove causation.</figcaption></figure>`;
 if(kind==='immune-target')return `<figure class="science-figure"><div class="timing-chart"><div><b>Diagnosis</b><span>Name the condition</span></div><div><b>Organ target</b><span>Identify affected tissue</span></div><div><b>Activity</b><span>Symptoms and objective markers</span></div><div><b>Plan</b><span>Condition-specific care</span></div></div><figcaption>Autoimmune conditions share a category, not one universal dietary mechanism.</figcaption></figure>`;
 if(kind==='mold-chain')return `<figure class="science-figure"><div class="timing-chart"><div><b>Water entry</b><span>Leak, flood or condensation</span></div><div><b>Wet material</b><span>Porous surfaces remain damp</span></div><div><b>Growth and release</b><span>Fragments, spores and irritants</span></div><div><b>Occupant exposure</b><span>Depends on room, airflow and time</span></div></div><figcaption>Repair starts at the water source. The diagram is a causal model, not a measured dose for an individual.</figcaption></figure>`;
 if(kind==='mold-tests')return `<figure class="science-figure"><div class="test-grid"><div><strong>Inspection</strong><span>Moisture, odor, visible growth</span><p>Directly informs repair.</p></div><div><strong>Surface swab</strong><span>One sampled location</span><p>Can identify material there; does not measure inhaled exposure.</p></div><div><strong>Air sample</strong><span>One time and place</span><p>Changes with conditions; no universal health threshold.</p></div><div><strong>Urine test</strong><span>Excreted compounds</span><p>Does not establish illness from a particular building.</p></div></div><figcaption>Match a test to a question before collecting it. Results from one category cannot answer the others.</figcaption></figure>`;
 if(kind==='mold-closeout')return `<figure class="science-figure"><div class="timing-chart"><div><b>1. Stop water</b><span>Repair the entry point</span></div><div><b>2. Remove</b><span>Clean or discard damaged material</span></div><div><b>3. Dry</b><span>Verify materials are dry</span></div><div><b>4. Recheck</b><span>Inspect after normal use or rain</span></div></div><figcaption>A fog or coating cannot substitute for fixing moisture and removing contaminated material.</figcaption></figure>`;
 if(kind==='mechanism')return `<figure class="science-figure"><svg viewBox="0 0 760 250" role="img" aria-label="Cross-section of the stomach surface: acid above mucus, H pylori near epithelial cells, urease buffering local acidity"><defs><pattern id="mucus" width="15" height="15" patternUnits="userSpaceOnUse"><path d="M0 8 Q7 0 15 8" fill="none" stroke="#b3d0bd" stroke-width="3"/></pattern></defs><rect width="760" height="250" rx="15" fill="#f8f5ed"/><path d="M20 80 Q200 55 380 80 T740 80" fill="none" stroke="#d0876e" stroke-width="4"/><text x="45" y="44" fill="#934f43">Acidic stomach contents</text><rect x="20" y="88" width="720" height="75" fill="url(#mucus)"/><text x="485" y="117" fill="#375d4d">Protective mucus layer</text><path d="M20 171 Q180 152 380 171 T740 171 L740 230 L20 230Z" fill="#d5ada1"/><text x="45" y="211" fill="#512c29">Stomach surface cells</text><g fill="#345c54"><ellipse cx="218" cy="132" rx="35" ry="10" transform="rotate(-13 218 132)"/><ellipse cx="330" cy="116" rx="35" ry="10" transform="rotate(15 330 116)"/></g><text x="225" y="75" text-anchor="middle" fill="#23483e">H. pylori</text><path d="M225 80 L220 119" stroke="#23483e"/><text x="350" y="221" fill="#512c29">Inflammation can weaken defense</text></svg><figcaption>Mechanism schematic, not an anatomical scale drawing. Urease changes the bacterium’s immediate surroundings; persistent infection can inflame the lining.</figcaption></figure>`;
 if(kind==='test')return `<figure class="science-figure"><div class="test-grid"><div><strong>Breath</strong><span>Active urease signal</span><p>Useful for infection and cure when prepared correctly.</p></div><div><strong>Stool</strong><span>Bacterial antigen</span><p>Useful for infection and cure when prepared correctly.</p></div><div><strong>Blood antibody</strong><span>Immune memory</span><p>Cannot reliably tell whether treatment cleared the organism.</p></div><div><strong>Biopsy</strong><span>Tissue and organism</span><p>Used when endoscopy is indicated for a broader question.</p></div></div><figcaption>Tests answer different questions. Preparation and timing can change what a negative result means.</figcaption></figure>`;
 if(kind==='timeline')return `<figure class="science-figure"><div class="timing-chart"><div><b>Day 0</b><span>Complete therapy</span></div><div><b>Weeks 0–2</b><span>Plan the cure test; follow instructions for medicine holds</span></div><div><b>Weeks 2–4+</b><span>Allow the required interval after antibiotics and bismuth</span></div><div><b>At least week 4</b><span>Breath or stool test of cure if preparation is met</span></div></div><figcaption>ACG timing: test at least four weeks after treatment; hold acid-suppressing PPIs for two weeks and antibiotics/bismuth for four weeks before testing, as directed by the clinician.</figcaption></figure>`;
 if(kind==='fodmap')return `<figure class="science-figure"><div class="timing-chart"><div><b>Baseline</b><span>Define symptoms and stool pattern</span></div><div><b>Short restriction</b><span>Test whether symptoms change</span></div><div><b>Reintroduction</b><span>Challenge groups separately</span></div><div><b>Personalize</b><span>Restore tolerated foods</span></div></div><figcaption>A low-FODMAP trial is a sequence for learning tolerance, not a permanent list of forbidden foods.</figcaption></figure>`;
 if(kind==='gutbrain')return `<figure class="science-figure">${atlasVisual('gutbrain')}<figcaption>Gut–brain signaling affects sensation and movement in both directions. This schematic does not imply that symptoms are imagined.</figcaption></figure>`;
 return `<figure class="science-figure"><div class="evidence-bars"><div><span>Laboratory mechanism</span><i style="width:25%"></i><small>Hypothesis</small></div><div><span>Symptom report</span><i style="width:45%"></i><small>Experience</small></div><div><span>Controlled human outcome</span><i style="width:85%"></i><small>Clinical test</small></div><div><span>Confirmed cure test</span><i style="width:100%"></i><small>Eradication</small></div></div><figcaption>Conceptual evidence ladder, not numerical effect sizes. A symptom or lab result must not be substituted for a properly timed cure test.</figcaption></figure>`;
}
const RELATED_DOSSIERS={hpylori:['iron','b12','probiotics-research','midlife-digestion'],ibs:['celiac-testing','probiotics-research','magnesium','midlife-digestion'],mold:['autoimmune-research','adhd-research'],periodontal:['enamel','dry-mouth','tooth-decay'],enamel:['tooth-decay','dry-mouth','periodontal'],'tooth-decay':['enamel','periodontal','dry-mouth'],'dry-mouth':['enamel','tooth-decay','periodontal'],iron:['hpylori','b12','folate','midlife-digestion'],b12:['folate','iron','hpylori'],folate:['b12','iron','b6-neuropathy'],magnesium:['ibs','probiotics-research','calcium'],'vitamin-d':['calcium','autoimmune-research','midlife-digestion'],calcium:['vitamin-d','magnesium','midlife-digestion'],zinc:['selenium','vitamin-d','probiotics-research'],'iodine-thyroid':['selenium','midlife-digestion'],'midlife-digestion':['iron','calcium','ibs','celiac-testing'],'celiac-testing':['iron','b12','autoimmune-research'],'probiotics-research':['ibs','hpylori','magnesium'],'adhd-research':['omega3','b6-neuropathy','depression-research'],'depression-research':['omega3','b12','adhd-research'],'autoimmune-research':['vitamin-d','celiac-testing','periodontal'],'b6-neuropathy':['b12','adhd-research','folate'],selenium:['iodine-thyroid','zinc'],'vitamin-k':['calcium','omega3'],omega3:['adhd-research','depression-research','vitamin-k']};

function monographPage(id){let x=MONOGRAPHS[id];if(!x)return notFound();return `<div class="deep-layout monograph"><article class="deep-article"><a href="#atlas" class="eyebrow">← Learning atlas</a><div class="eyebrow">${escapeHtml(x.eyebrow)}</div><h1>${escapeHtml(x.title)}</h1><p class="lede">${escapeHtml(x.deck)}</p><div class="reading-meta">Reviewed November 2026 · ${x.sections.length} sections · Sources and evidence table below</div><div class="monograph-summary"><strong>How to read this dossier</strong><p>Mechanisms explain a plausible pathway. Tests answer specific questions. Human outcome evidence tells us what has been observed. The limitations are part of the conclusion.</p></div>${x.sections.map((s,i)=>`<section class="deep-section" id="dossier-${id}-${i}"><div class="eyebrow">${String(i+1).padStart(2,'0')} / ${String(x.sections.length).padStart(2,'0')}</div><h2>${escapeHtml(s.title)}</h2>${s.body.map(p=>`<p>${escapeHtml(p)}</p>`).join('')}${s.figure?monographFigure(s.figure):''}</section>`).join('')}<section class="deep-section" id="dossier-${id}-evidence"><div class="eyebrow">Evidence comparison</div><h2>What each approach can establish</h2><div class="table-scroll"><table class="evidence-table"><thead><tr><th>Method</th><th>Question</th><th>What supports it</th><th>Limit</th></tr></thead><tbody>${x.evidence.map(row=>`<tr>${row.map(cell=>`<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section><div class="sourcebox"><details><summary>Reference notes · ${x.sources.length} primary and research sources</summary><p>The main explanation is above. These sources allow verification and deeper study.</p><ol>${x.sources.map(([label,url])=>`<li><a target="_blank" rel="noopener noreferrer" href="${escapeHtml(url)}">${escapeHtml(label)}</a></li>`).join('')}</ol></details></div><div class="related"><div class="eyebrow">Follow the connections</div>${(RELATED_DOSSIERS[id]||[]).filter(key=>MONOGRAPHS[key]).map(key=>`<a href="#dossier/${key}">${escapeHtml(MONOGRAPHS[key].title)} →</a>`).join('')}<a href="#journal">Record your questions →</a></div></article><aside class="article-rail"><div class="eyebrow">In this dossier</div><nav>${x.sections.map((s,i)=>`<button type="button" data-jump="dossier-${id}-${i}">${escapeHtml(s.title)}</button>`).join('')}<button type="button" data-jump="dossier-${id}-evidence">Evidence comparison</button></nav></aside></div>`}

const RESEARCH_GROUPS=[['Digestion',['hpylori','ibs','probiotics-research','celiac-testing','midlife-digestion']],['Oral health',['dry-mouth','tooth-decay','periodontal','enamel']],['Nutrients',['vitamin-d','magnesium','calcium','iron','b12','zinc','b6-neuropathy','folate','iodine-thyroid','selenium','vitamin-k','omega3']],['Brain and immune health',['adhd-research','depression-research','autoimmune-research']],['Indoor air',['mold']]];
function researchDesk(){return `${pageHeader('Groundwell research desk','Study an area in depth','Dossiers organize mechanisms, testing, outcomes and limits. Browse by area or search the text. The 29 shorter atlas briefs remain a separate starting layer.')}<div class="atlas-bar"><input id="research-search" class="search" type="search" placeholder="Search evidence, mechanisms, symptoms…"><select id="research-filter"><option value="all">All areas</option>${RESEARCH_GROUPS.map(([g])=>`<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join('')}</select></div><p id="research-count" class="muted"></p><div id="research-results"></div><div class="paper"><h2>Investigate a supplement stack</h2><p>Read common interaction mechanisms and overlap concerns directly in the app.</p><a href="#flags">Open the interaction index →</a></div><div class="paper"><h2>From question to record</h2><p>Use these pages to frame a specific question. The personal journal can record symptoms and experiments; the supplement routine records exactly which products were taken. An observation in your log is a lead for investigation, not proof of a cause.</p><a href="#journal">Open My wellness →</a></div>`}
function renderResearch(){let q=($('#research-search')?.value||'').toLowerCase().trim(),filter=$('#research-filter')?.value||'all',count=0;$('#research-results').innerHTML=RESEARCH_GROUPS.filter(([group])=>filter==='all'||filter===group).map(([group,ids])=>{let cards=ids.filter(id=>{let x=MONOGRAPHS[id];return x&&(!q||(x.title+' '+x.deck+' '+x.sections.map(s=>s.title+' '+s.body.join(' ')).join(' ')).toLowerCase().includes(q))}).map(id=>{let x=MONOGRAPHS[id];count++;return tile('Dossier',escapeHtml(x.title),escapeHtml(x.deck),'#dossier/'+id)});return cards.length?section(escapeHtml(group),`<div class="grid three research-cards">${cards.join('')}</div>`):''}).join('')||'<div class="paper">No matching dossier. Try a broader term or explore the atlas briefs.</div>';$('#research-count').textContent=count+' detailed dossiers';}

function flagLibrary(){return `${pageHeader('Supplement science','Interactions & overlap','A curated research index for common issues in multi-product routines. Each entry states the mechanism or concern and what to check. The list is incomplete and does not certify a product as safe.')}<div class="atlas-bar"><input type="search" class="search" id="flag-search" placeholder="Search magnesium, thyroid medicine, laboratory tests…"><select id="flag-type"><option value="all">All flags</option><option value="medicine">Medicine interactions</option><option value="other">Dose and testing concerns</option></select></div><p class="muted" id="flag-count"></p><div id="flag-list"></div><div class="paper"><h2>Apply this to your own stack</h2><p>Enter the exact ingredient names from every bottle and any medicine names in the supplement routine. The checker looks for these limited flags and repeated ingredients; it cannot analyze label amounts or a medical history.</p><a class="button dark" href="#routine">Open supplement routine</a></div>`}
function renderFlags(){let q=($('#flag-search')?.value||'').toLowerCase(),type=$('#flag-type')?.value||'all',rows=RESEARCH_FLAGS.filter(f=>(type==='all'||(type==='medicine')===Boolean(f.medicine))&&(f.title+' '+f.ingredient+' '+f.explain).toLowerCase().includes(q));$('#flag-count').textContent=rows.length+' of '+RESEARCH_FLAGS.length+' curated flags';$('#flag-list').innerHTML=rows.map(f=>`<article class="paper flag-entry"><span class="tag">${f.medicine?'Medicine interaction':'Dose or testing concern'}</span><h2>${escapeHtml(f.title)}</h2><p>${escapeHtml(f.explain)}</p><details class="sourcebox"><summary>Research source</summary><a href="${escapeHtml(f.source)}" target="_blank" rel="noopener noreferrer">View original nutrient reference</a></details></article>`).join('')||'<div class="paper">No matching flag. This index is incomplete; try another term.</div>'}

function notFound(){return '<div class="paper"><h1>Page unavailable</h1><a href="#home">Return home →</a></div>'}
function route(){
 const [page,arg]=decodeURIComponent((location.hash||'#home').slice(1)).split('/');
 const titles={home:'Overview',explore:'Explore',supplements:'Supplements',conditions:'Conditions',oral:'Oral health',mold:'Mold & air',vaccine:'Vaccine questions',watch:'Watch',people:'People',journal:'My wellness',atlas:'Learning atlas',chapter:'Chapter',dossier:'Research dossier',research:'Research desk',flags:'Interaction index',routine:'Supplement routine',glossary:'Glossary'};
 let content;
 switch(page){
  case 'home':content=home();break;
  case 'explore':content=explore();break;
  case 'supplements':content=supplements();break;
  case 'nutrient':content=nutrientDetail(arg);break;
  case 'conditions':content=conditions();break;
  case 'atlas':content=atlasHome();break;
  case 'chapter':content=MONOGRAPHS[arg]?monographPage(arg):atlasChapter(arg);break;
  case 'routine':content=routinePage();break;
  case 'dossier':content=monographPage(arg);break;
  case 'research':content=researchDesk();break;
  case 'flags':content=flagLibrary();break;
  case 'glossary':content=glossaryPage();break;
  case 'guide':content=deepArticles[arg]?deepPage(arg):notFound();break;
  case 'oral':content=oral();break;
  case 'vaccine':content=deepPage('vaccine');break;
  case 'mold':content=monographPage('mold')+`<div class="paper" style="max-width:790px;margin-top:22px"><h2>Keep a building log</h2><p>Record dates, rooms, moisture, symptoms and work completed.</p><textarea id="mold-note" class="search" rows="4" placeholder="Date · Room · Moisture source · Symptoms · Actions"></textarea><button class="button dark" id="save-mold" type="button">Save to My wellness</button></div>`;break;
  case 'watch':content=watch();break;
  case 'video':content=videoDetail(arg);break;
  case 'people':content=people();break;
  case 'person':content=person(arg);break;
  case 'archive':content=archiveDetail(arg);break;
  case 'journal':content=journal();break;
  default:content=notFound();
 }
 view.innerHTML=content;
 $('#breadcrumb').textContent='Wellness reference / '+(titles[page]||'Article');
 document.querySelectorAll('[data-route]').forEach(a=>a.classList.toggle('active',a.dataset.route===page));
 if(page==='supplements'){renderNutrients();$('#nutrient-search').oninput=e=>renderNutrients(e.target.value)}
 if(page==='nutrient'){let select=$('#nutrient-person');if(select)select.onchange=e=>{nutrientProfileId=e.target.value;view.innerHTML=nutrientDetail(arg);$('#nutrient-person').onchange=select.onchange}}
 if(page==='people'){renderPeople();$('#people-search').oninput=e=>renderPeople(e.target.value)}
 if(page==='explore'){renderExplore();$('#explore-search').oninput=renderExplore;$('#explore-type').onchange=renderExplore}
 if(page==='journal')bindJournal('overview');
 if(page==='atlas'){renderAtlas();$('#atlas-search').oninput=renderAtlas;$('#atlas-filter').onchange=renderAtlas}
 if(page==='research'){renderResearch();$('#research-search').oninput=renderResearch;$('#research-filter').onchange=renderResearch}
 if(page==='flags'){renderFlags();$('#flag-search').oninput=renderFlags;$('#flag-type').onchange=renderFlags}
 if(page==='routine')bindRoutine();
 if(page==='glossary'){renderGlossary();$('#glossary-search').oninput=renderGlossary}
 document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.jump)?.scrollIntoView({behavior:'smooth'}));
 if(page==='mold')$('#save-mold').onclick=()=>{
  const value=$('#mold-note').value.trim();if(!value)return;
  personal.entries.push({id:crypto.randomUUID?.()||String(Date.now()),type:'environment',date:new Date().toISOString().slice(0,10),title:'Building and symptom log',detail:value});
  persist();$('#mold-note').value='';$('#save-mold').textContent='Saved';
 };
 if(page==='video'){
  $('#load-video').onclick=()=>{
   const player=$('#player');player.replaceChildren();
   const iframe=document.createElement('iframe');iframe.className='video-frame';iframe.title=videos.find(v=>v.id===arg)?.title||'Video';iframe.allow='accelerometer; autoplay; encrypted-media; picture-in-picture';iframe.allowFullscreen=true;iframe.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(arg)+'?autoplay=1';player.append(iframe);
  };
 }
 window.scrollTo({top:0,behavior:'auto'});
}
$('#global-search-button').onclick=()=>{location.hash='#explore';setTimeout(()=>$('#explore-search')?.focus(),20)};
$('#footer-export').onclick=exportData;
window.addEventListener('hashchange',route);
fetch('./data/library.json').then(r=>{if(!r.ok)throw Error('Content unavailable');return r.json()}).then(data=>{library=data;route()}).catch(()=>{view.innerHTML='<div class="paper"><h1>Library unavailable</h1><p>Reload the page when connected. Your personal records stay on this device.</p></div>'});
if('serviceWorker' in navigator && location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
