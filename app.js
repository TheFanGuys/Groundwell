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
  tile('Environment','Mold & indoor air','Understand damp buildings, symptoms, cleanup and the limits of tests.','#mold'),
  tile('Daily practice','Oral health','A practical guide to teeth, gums, food choices and dry mouth.','#oral')
 ].join('');
 return `<section class="hero"><div class="eyebrow">A quieter kind of wellness research</div><h1>Understand your health.<br>Keep your own record.</h1><p>Explore natural health topics in one place, with clear explanations, practical context, and tools for tracking what matters to you.</p><div class="hero-actions"><a class="button" href="#explore">Explore the library</a><a class="button alt" href="#journal">Open my wellness</a></div></section>
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
function nutrientDetail(id){
 const n=library.nutrients.find(x=>x.id===id);
 if(!n)return notFound();
 const f=n.fields,target=personal.profile?profileTarget(n.name,personal.profile):null;
 return `<div class="article"><a href="#supplements" class="eyebrow">← Nutrient library</a><h1>${escapeHtml(n.name)}</h1><p class="lede">${escapeHtml(f['What it does'])}</p><p class="muted">Also known as ${escapeHtml(n.aliases)}</p>${target?`<div class="profile-strip"><strong>Profile daily target · ${escapeHtml(target)}</strong><p>This is a total intake target from food and supplements, not a suggested supplement dose.</p></div>`:''}
 <div class="detail-grid"><section><h3>History</h3><p>${escapeHtml(f.History)}</p></section><section><h3>Food sources</h3><p>${escapeHtml(f['Food sources'])}</p></section><section><h3>General adult intake</h3><p>${escapeHtml(f['U.S. daily intake'])}</p></section><section><h3>Timing & use</h3><p>${escapeHtml(f['When to take it'])}</p></section></div><div class="callout"><strong>Limits and considerations</strong><br>${escapeHtml(f['Upper limit and cautions'])}</div><p>Daily intake guidance varies by life stage and individual circumstances. Record any product form and amount in My wellness before comparing your total intake.</p><div class="sourcebox"><details><summary>Reference and review notes</summary><p>${sources.nutrient} Reviewed November 2026.</p><a href="${escapeHtml(n.source)}" target="_blank" rel="noopener noreferrer">Detailed nutrient reference ↗</a></details></div><p style="margin-top:30px"><a class="button dark" href="#journal">Track this nutrient</a></p></div>`;
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
 const guides=[{name:'Mold & indoor air',text:deepArticles.mold.sections.map(x=>x.body.join(' ')).join(' '),href:'#mold'},{name:'Oral health',text:deepArticles.oral.sections.map(x=>x.body.join(' ')).join(' '),href:'#oral'},
 {name:'COVID vaccination',text:deepArticles.vaccine.sections.map(x=>x.body.join(' ')).join(' '),href:'#vaccine'},...Object.entries(conditionData).map(([id,d])=>({name:d.title,text:d.intro+' '+d.sections.map(x=>x.join(' ')).join(' '),href:'#guide/'+id}))];
 const all=[
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
 const blob=new Blob([JSON.stringify({schema:2,exportedAt:new Date().toISOString(),profile:personal.profile,entries:personal.entries},null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='groundwell-wellness-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
}
async function restoreData(e){
 const f=e.target.files?.[0];if(!f)return;
 try{
  if(f.size>10_000_000)throw Error('Backup is too large.');
  const data=JSON.parse(await f.text());
  if(data.schema!==2||!Array.isArray(data.entries)||data.entries.some(x=>!x||typeof x.id!=='string'||typeof x.type!=='string'||typeof x.title!=='string'||typeof x.date!=='string'||typeof x.detail!=='string')||(data.profile!==null&&typeof data.profile!=='object'))throw Error('This is not a Groundwell backup.');
  if(!confirm('Replace the profile and entries on this device with this backup?'))return;
  personal={profile:data.profile,entries:data.entries};persist();bindJournal('overview');
 }catch(err){alert(err.message||'Could not restore this file.')}
}
function notFound(){return '<div class="paper"><h1>Page unavailable</h1><a href="#home">Return home →</a></div>'}
function route(){
 const [page,arg]=decodeURIComponent((location.hash||'#home').slice(1)).split('/');
 const titles={home:'Overview',explore:'Explore',supplements:'Supplements',conditions:'Conditions',oral:'Oral health',mold:'Mold & air',vaccine:'Vaccine questions',watch:'Watch',people:'People',journal:'My wellness'};
 let content;
 switch(page){
  case 'home':content=home();break;
  case 'explore':content=explore();break;
  case 'supplements':content=supplements();break;
  case 'nutrient':content=nutrientDetail(arg);break;
  case 'conditions':content=conditions();break;
  case 'guide':content=conditionData[arg]?article(conditionData[arg]):notFound();break;
  case 'oral':content=oral();break;
  case 'vaccine':content=deepPage('vaccine');break;
  case 'mold':content=mold();break;
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
 if(page==='people'){renderPeople();$('#people-search').oninput=e=>renderPeople(e.target.value)}
 if(page==='explore'){renderExplore();$('#explore-search').oninput=renderExplore;$('#explore-type').onchange=renderExplore}
 if(page==='journal')bindJournal('overview');
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
