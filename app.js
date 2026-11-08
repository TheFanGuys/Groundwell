const studies = [
  {id:'32783238', title:'Daily cranberry intake and H. pylori suppression', year:2021, type:'Randomized controlled trial', prep:'Juice / powder', topic:'Digestion', population:'Adults with H. pylori infection', methods:'Double-blind, randomized, placebo-controlled trial comparing cranberry preparations.', summary:'The study evaluated suppression of H. pylori. Suppression and durable eradication are different outcomes.'},
  {id:'15810945', title:'Cranberry juice and H. pylori infection', year:2005, type:'Randomized controlled trial', prep:'Juice', topic:'Digestion', population:'Adults with H. pylori infection', methods:'Double-blind trial comparing cranberry juice with placebo.', summary:'The trial investigated cranberry juice and measured H. pylori status using breath tests.'},
  {id:'34256014', title:'Gut microbiota-targeted diets and immune status', year:2021, type:'Randomized controlled trial', prep:'Whole food', topic:'Microbiome', population:'Adults', methods:'Diet intervention comparing high-fiber and high-fermented-food diets.', summary:'The investigators measured changes in the gut microbiome and immune markers.'},
  {id:'31105044', title:'Ultra-processed diets and calorie intake', year:2019, type:'Randomized controlled trial', prep:'Whole diet', topic:'Nutrition', population:'20 adults in an inpatient setting', methods:'Randomized crossover feeding study with two weeks on each diet.', summary:'Participants consumed an average of 508 more calories per day during the ultra-processed diet phase.'}
];
const experts = [
  ['Andrew Weil, MD','Integrative medicine','https://www.medicine.arizona.edu/person/andrew-t-weil-md'],
  ['Victoria Maizes, MD','Integrative medicine','https://medicine.arizona.edu/person/victoria-maizes-md'],
  ['Christopher Gardner, PhD','Nutrition research','https://med.stanford.edu/prevention/people/faculty_academic/Gardner.html'],
  ['Emeran Mayer, MD','Gut–brain research','https://healthy.ucla.edu/person/emeran-a-mayer/'],
  ['Jon Wardle, PhD','Naturopathic medicine','https://researchportal.scu.edu.au/esploro/profile/jon_wardle'],
  ['Tieraona Low Dog, MD','Herbal medicine','https://awcim.arizona.edu/formalbio_tlowdog.html']
];
const app = document.querySelector('#app');
const nav = document.querySelector('nav');
const pages = ['Research','Food','Scan','Dispatch','Library'];
const selected = new Set();
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem('groundwell.'+key)) ?? fallback; } catch { return fallback; } };
const save = (key, value) => localStorage.setItem('groundwell.'+key,JSON.stringify(value));
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const paper = s => 'https://pubmed.ncbi.nlm.nih.gov/'+s.id+'/';
const link = (url, title) => '<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(title)+'</a>';
const panel = content => '<section class="panel">'+content+'</section>';
let focus = studies[0], detail = 'Summary', query = '', prep = '', topic = '', dispatchTab = 'Research', dispatchIndex = 0;
let label = '', photo = '', recognized = [], scanMessage = '', scanBusy = false, published = [];
const archive = studies.map(s => ({title:s.title,date:String(s.year),topic:s.topic,kind:'Research',url:paper(s),summary:s.summary}));
function research(){
  const options = (values,value) => values.map(v=>'<option'+(v===value?' selected':'')+'>'+esc(v)+'</option>').join('');
  app.innerHTML='<h1>Research workspace</h1><div class="grid">'+panel('<div class="row"><h2>Search filters</h2><button id="clear">Clear all</button></div><label>Topic<select id="topic"><option value="">Any topic</option>'+options([...new Set(studies.map(s=>s.topic))],topic)+'</select></label><label>Preparation<select id="prep"><option value="">Any preparation</option>'+options(studies.map(s=>s.prep),prep)+'</select></label><p class="muted">Browse the curated starter library or expand your search on PubMed.</p><a id="external" target="_blank" rel="noopener noreferrer">Search PubMed</a>')+panel('<label for="search">Search studies</label><input id="search" type="search" value="'+esc(query)+'" placeholder="Try cranberry or microbiome"><div id="results"></div>')+panel('<h2>Study details</h2><div class="tabs">'+['Summary','Methods','Sources'].map(t=>'<button data-detail="'+t+'" class="'+(detail===t?'active':'')+'">'+t+'</button>').join('')+'</div><h3>'+esc(focus.title)+'</h3><span class="tag">'+focus.year+' · '+focus.type+'</span><p>'+esc(detail==='Methods'?focus.methods:detail==='Sources'?focus.population+' · '+focus.prep:focus.summary)+'</p>'+link(paper(focus),'Open source ↗')+' <button id="bookmark">'+(read('bookmarks',[]).includes(focus.id)?'Remove bookmark':'Save study')+'</button>')+'</div><dialog id="compare"></dialog>';
  const renderRows = () => {
    const list=studies.filter(s=>(!topic||s.topic===topic)&&(!prep||s.prep===prep)&&query.toLowerCase().trim().split(/\s+/).every(q=>Object.values(s).join(' ').toLowerCase().includes(q)));
    document.querySelector('#external').href='https://pubmed.ncbi.nlm.nih.gov/?term='+encodeURIComponent(query||'botanical medicine');
    document.querySelector('#results').innerHTML='<p class="muted">'+list.length+' results</p><div class="table"><table><thead><tr><th>Pin</th><th>Title</th><th>Design</th><th>Year</th></tr></thead><tbody>'+list.map(s=>'<tr class="'+(focus===s?'active':'')+'"><td><input type="checkbox" data-pin="'+s.id+'" aria-label="Pin '+esc(s.title)+'" '+(selected.has(s.id)?'checked':'')+'></td><td><button data-study="'+s.id+'">'+esc(s.title)+'</button></td><td>'+s.type+'</td><td>'+s.year+'</td></tr>').join('')+'</tbody></table></div>'+(!list.length?'<p>No local matches. Try another term or search PubMed.</p>':'')+'<div class="row toolbar"><strong>'+selected.size+' selected</strong><button id="compareButton" class="primary" '+(selected.size<2?'disabled':'')+'>Compare selected</button></div>';
    document.querySelectorAll('[data-pin]').forEach(el=>el.onchange=()=>{el.checked?selected.add(el.dataset.pin):selected.delete(el.dataset.pin);renderRows();});
    document.querySelectorAll('[data-study]').forEach(el=>el.onclick=()=>{focus=studies.find(s=>s.id===el.dataset.study);research();});
    document.querySelector('#compareButton').onclick=()=>{const d=document.querySelector('#compare');d.innerHTML='<div class="row"><h2>Study comparison</h2><form method="dialog"><button>Close</button></form></div><div class="table"><table><thead><tr><th>Study</th><th>Population</th><th>Preparation</th><th>Methods</th></tr></thead><tbody>'+studies.filter(s=>selected.has(s.id)).map(s=>'<tr><td>'+link(paper(s),s.title)+'</td><td>'+esc(s.population)+'</td><td>'+esc(s.prep)+'</td><td>'+esc(s.methods)+'</td></tr>').join('')+'</tbody></table></div>';d.showModal();};
  };
  renderRows();
  document.querySelector('#search').oninput=e=>{query=e.target.value;renderRows();};
  document.querySelector('#topic').onchange=e=>{topic=e.target.value;renderRows();};
  document.querySelector('#prep').onchange=e=>{prep=e.target.value;renderRows();};
  document.querySelector('#clear').onclick=()=>{query=prep=topic='';research();};
  document.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>{detail=b.dataset.detail;research();});
  document.querySelector('#bookmark').onclick=()=>{const ids=new Set(read('bookmarks',[]));ids.has(focus.id)?ids.delete(focus.id):ids.add(focus.id);save('bookmarks',[...ids]);research();};
}
const ingredientIndex=[
 ['sunflower oil','Used as a cooking oil or a fat in packaged foods.','seed oils'],
 ['canola oil','Used as a cooking oil or a fat in packaged foods.','seed oils'],
 ['cane sugar','Added for sweetness. Check the Nutrition Facts panel for the labeled amount of added sugars.','added sugars'],
 ['natural flavor','A flavoring declaration. The label may provide limited detail about the individual flavoring components.','flavorings'],
 ['turmeric extract','A concentrated turmeric preparation. Compare its standardized composition with the exact extract used in research.',''],
 ['black pepper extract','A concentrated black pepper preparation. Check the label for the actual amount and standardization.','']
];
const terms = text => text.toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);
function scan(){
  const prefs=read('preferences',{allergy:'',avoid:''});
  app.innerHTML='<h1>Label scanner</h1><div class="grid scan">'+panel('<h2>Label image</h2><label>Take or choose a label photo<input id="photo" type="file" accept="image/*" capture="environment"></label><div class="photo">'+(photo?'<img src="'+esc(photo)+'" alt="Your label photo">':'<span class="muted">Your photo appears here</span>')+'</div><button id="ocr" '+(!photo||scanBusy?'disabled':'')+'>Read label</button><p role="status">'+esc(scanMessage)+'</p>')+panel('<h2>Label ingredients</h2><p>Check the extracted text or enter the ingredients yourself.</p><label>Ingredient list<textarea id="label">'+esc(label)+'</textarea></label><button class="primary" id="review">Review ingredients</button> <button id="sample" '+(scanBusy?'disabled':'')+'>Try example</button>')+panel('<h2>Ingredient review</h2><p class="note">Concern score unavailable from ingredient names alone. Check amounts and verify any allergy match against the full package.</p>'+(recognized.length?recognized.map(name=>{const n=name.toLowerCase();const hit=ingredientIndex.find(([key])=>n===key);const allergy=terms(prefs.allergy).find(a=>n.includes(a));const avoid=terms(prefs.avoid).some(a=>n.includes(a)||hit?.[2]===a);return '<article><h3>'+esc(name)+'</h3>'+(allergy?'<strong>Possible allergy match · '+esc(allergy)+'</strong> ':'')+(avoid?'<span class="tag">Your avoid list</span>':'')+'<p>'+esc(hit?.[1]||'Unreviewed ingredient. Check the original label.')+'</p></article>';}).join(''):'<p class="muted">Review a label to see ingredient details here.</p>'))+'</div>';
  document.querySelector('#label').oninput=e=>{label=e.target.value;};
  document.querySelector('#photo').onchange=e=>{const file=e.target.files[0];if(!file||scanBusy)return;if(photo.startsWith('blob:')) URL.revokeObjectURL(photo);photo=URL.createObjectURL(file);scanMessage='';recognized=[];scan();};
  document.querySelector('#review').onclick=()=>{recognized=label.replace(/^\s*ingredients\s*:/i,'').replace(/\s*\n\s*/g,' ').split(/[,;]/).map(s=>s.trim().replace(/\.$/,'')).filter(Boolean);scan();};
  document.querySelector('#sample').onclick=()=>{if(photo.startsWith('blob:'))URL.revokeObjectURL(photo);photo=new URL('./sample-label.png',location.href).href;label='';scanMessage='Example label loaded. Choose Read label.';recognized=[];scan();};
  document.querySelector('#ocr').onclick=async()=>{scanBusy=true;scanMessage='Reading image…';scan();try{
    await loadScript('./vendor/tesseract.min.js','Tesseract');
    const worker=await window.Tesseract.createWorker('eng',1,{
      workerPath:'./vendor/worker.min.js',
      corePath:new URL('./vendor/tesseract-core-lstm.wasm.js',location.href).href,
      langPath:new URL('./vendor/',location.href).href,
      workerBlobURL:false
    });
    try {label=(await worker.recognize(photo)).data.text;} finally {await worker.terminate();}
    scanMessage=label?'Check the extracted text before reviewing.':'No text found. Try another photo or enter the text manually.';
  }catch(e){scanMessage=e.message;}finally{scanBusy=false;if(location.hash==='#scan')scan();}};
}
const scripts = new Map();
function loadScript(src, name){
  if(window[name]) return Promise.resolve();
  if(!scripts.has(src)){
    scripts.set(src,new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=src;
      script.onload=resolve;
      script.onerror=()=>{script.remove();reject(Error('Could not load '+name+'. Try again while online.'));};
      document.head.append(script);
    }).catch(error=>{scripts.delete(src);throw error;}));
  }
  return scripts.get(src);
}
function dispatch(){
  const oldChart=document.querySelector('#studyChart');
  if(oldChart)window.Chart?.getChart(oldChart)?.destroy();
  const items=[...published,...archive].filter(s=>s.kind===dispatchTab).sort((a,b)=>b.date.localeCompare(a.date));
  const item=items[dispatchIndex]||items[0];
  app.innerHTML='<h1>Dispatch desk</h1><div class="grid">'+panel('<h2>Filters</h2><p class="muted">Choose a desk to see research, breaking news, or events.</p><button id="publish">Publish Desk</button>')+panel('<div class="tabs">'+['Research','Breaking','Events'].map(t=>'<button data-desk="'+t+'" class="'+(t===dispatchTab?'active':'')+'">'+t+'</button>').join('')+'</div>'+(items.length?'<div class="table"><table><thead><tr><th>Date</th><th>Update</th><th>Topic</th></tr></thead><tbody>'+items.map((s,i)=>'<tr class="'+(s===item?'active':'')+'"><td>'+esc(s.date)+'</td><td><button data-story="'+i+'">'+esc(s.title)+'</button></td><td>'+esc(s.topic)+'</td></tr>').join('')+'</tbody></table></div>':'<p>No published items on this desk yet.</p>')+'<h3>Study spotlight</h3><strong>508 kcal/day more</strong><div class="chart"><canvas id="studyChart" role="img" aria-label="508 kcal per day greater intake during the ultra-processed diet phase"></canvas></div><small>Mean difference in energy intake during the ultra-processed diet phase. Bar scale 0–600 kcal/day. Inpatient crossover trial, 20 adults, two weeks per diet.</small><p>'+link(paper(studies[3]),'Hall et al. · Original trial ↗')+'</p>')+panel('<h2>Source details</h2>'+(item?'<h3>'+esc(item.title)+'</h3><p>'+esc(item.summary)+'</p>'+link(item.url,'Open original source ↗'):'<p class="muted">Select a published update.</p>'))+'</div>';
  document.querySelectorAll('[data-desk]').forEach(b=>b.onclick=()=>{dispatchTab=b.dataset.desk;dispatchIndex=0;dispatch();});
  document.querySelectorAll('[data-story]').forEach(b=>b.onclick=()=>{dispatchIndex=Number(b.dataset.story);dispatch();});
  document.querySelector('#publish').onclick=publish;
  const canvas=document.querySelector('#studyChart');
  loadScript('./vendor/chart.umd.js','Chart').then(()=>{
    if(!canvas.isConnected)return;
    new window.Chart(canvas,{
      type:'bar',
      data:{labels:['Mean difference'],datasets:[{data:[508],backgroundColor:'#08766f',borderRadius:5,barThickness:24}]},
      options:{indexAxis:'y',maintainAspectRatio:false,animation:matchMedia('(prefers-reduced-motion: reduce)').matches?false:{duration:300},plugins:{legend:{display:false},tooltip:{callbacks:{label:context=>context.raw+' kcal/day'}}},scales:{x:{min:0,max:600},y:{display:false}}}
    });
  }).catch(()=>{if(canvas.isConnected)canvas.parentElement.hidden=true;});
}
function validReport(s){
  return s && ['title','date','topic','kind','url','summary'].every(k=>typeof s[k]==='string'&&s[k].trim()) && ['Research','Breaking','Events'].includes(s.kind) && /^\d{4}-\d{2}-\d{2}$/.test(s.date) && /^https:\/\/[^\s]+$/i.test(s.url);
}
function publish(){
  window.Chart?.getChart(document.querySelector('#studyChart'))?.destroy();
  app.innerHTML='<h1>Publish Desk</h1>'+panel('<p>Paste a reviewed Claude report as a JSON array. Export the combined Dispatch file, then replace <code>dispatch.json</code> in GitHub.</p><pre>[{"title":"…","date":"YYYY-MM-DD","topic":"…","kind":"Research","url":"https://…","summary":"…"}]</pre><label>Report JSON<textarea id="report"></textarea></label><button id="export" class="primary">Validate and export</button> <button id="back">Back to Dispatch</button><p id="status" role="status"></p>');
  document.querySelector('#back').onclick=dispatch;
  document.querySelector('#export').onclick=()=>{
    const status=document.querySelector('#status');
    try{
      const items=JSON.parse(document.querySelector('#report').value);
      if(!Array.isArray(items)||!items.length||!items.every(validReport)) throw Error('Provide an array of complete reports with HTTPS sources and a valid category.');
      const combined=new Map(published.map(s=>[s.url,s]));
      items.forEach(s=>combined.set(s.url,s));
      const url=URL.createObjectURL(new Blob([JSON.stringify([...combined.values()],null,2)+'\n'],{type:'application/json'}));
      const a=document.createElement('a');a.href=url;a.download='dispatch.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      status.textContent='Exported. Commit dispatch.json to publish.';
    }catch(e){status.textContent=e.message;}
  };
}
function food(){
  const prefs=read('preferences',{allergy:'',avoid:''});
  app.innerHTML='<h1>Food & ingredients</h1><div class="grid">'+panel('<h2>Personal flags</h2><form id="prefs"><label>Allergies, separated by commas<input name="allergy" value="'+esc(prefs.allergy)+'"></label><label>Preferences to avoid<input name="avoid" value="'+esc(prefs.avoid)+'" placeholder="e.g. seed oils, added sugars"></label><button class="primary">Save preferences</button><p role="status" id="prefstatus"></p></form>')+panel('<h2>Ingredient index</h2><label>Find an ingredient<input type="search" id="ingredientQuery"></label><div id="ingredients"></div>')+panel('<h2>Review a product</h2><p>Use the scanner to take a photo or paste a label.</p><a href="#scan">Open Label Scanner →</a>')+'</div>';
  const input=document.querySelector('#ingredientQuery');
  const update=()=>{document.querySelector('#ingredients').innerHTML=ingredientIndex.filter(i=>i.join(' ').includes(input.value.toLowerCase().trim())).map(i=>'<h3>'+esc(i[0])+'</h3><p>'+esc(i[1])+'</p>').join('')||'<p>No reviewed entries match.</p>';};
  input.oninput=update;update();
  document.querySelector('#prefs').onsubmit=e=>{e.preventDefault();save('preferences',Object.fromEntries(new FormData(e.target)));document.querySelector('#prefstatus').textContent='Saved on this device.';};
}
function library(){
  const saved=studies.filter(s=>read('bookmarks',[]).includes(s.id));
  app.innerHTML='<h1>Library</h1><div class="grid">'+panel('<h2>Saved studies</h2>'+(saved.map(s=>'<p>'+link(paper(s),s.title)+'</p>').join('')||'<p>Save studies from Research.</p>'))+panel('<h2>Expert atlas</h2>'+experts.map(([name,field,url])=>'<h3>'+link(url,name)+'</h3><p class="muted">'+esc(field)+'</p>').join(''))+panel('<h2>About this edition</h2><p>Groundwell is a research and label-reading tool. Review the source and verify the exact preparation before applying a finding.</p>')+'</div>';
}
const routes={research,food,scan,dispatch,library};
function render(){
  const chart=document.querySelector('#studyChart');
  if(chart) window.Chart?.getChart(chart)?.destroy();
  const requested=location.hash.slice(1);
  const route=Object.hasOwn(routes,requested)?requested:'research';
  nav.innerHTML=pages.map(p=>'<a href="#'+p.toLowerCase()+'" '+(p.toLowerCase()===route?'aria-current="page"':'')+'>'+p+'</a>').join('');
  routes[route]();
}
window.addEventListener('hashchange',render);
render();
if(location.protocol!=='file:')fetch('./dispatch.json').then(r=>r.json()).then(items=>{published=items.filter(validReport);if(location.hash==='#dispatch')dispatch();}).catch(()=>{});
if('serviceWorker' in navigator && location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
