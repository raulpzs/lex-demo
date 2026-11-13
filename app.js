const pages=[...document.querySelectorAll('.page')];
const navButtons=[...document.querySelectorAll('nav [data-page]')];
function go(name){pages.forEach(p=>p.classList.toggle('active',p.id===name));navButtons.forEach(b=>b.classList.toggle('active',b.dataset.page===name));window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('[data-page]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();go(el.dataset.page);}));



let selected=null, corpusLaws=[], codingKeys=[], showAllKeys=false;
const lawList=document.getElementById('lawList'), detail=document.getElementById('lawDetail');
const corpusCsvPath='laws_coded.csv';
const escapeHtml=value=>String(value).replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));

function parseCsv(text){
  const rows=[[]]; let cell='', quoted=false;
  for(let i=0;i<text.length;i++){
    const char=text[i];
    if(quoted){
      if(char==='"'&&text[i+1]==='"'){cell+='"';i++;}
      else if(char==='"') quoted=false;
      else cell+=char;
    }else if(char==='"') quoted=true;
    else if(char===','){rows.at(-1).push(cell);cell='';}
    else if(char==='\n'){rows.at(-1).push(cell);rows.push([]);cell='';}
    else if(char!=='\r') cell+=char;
  }
  rows.at(-1).push(cell);
  return rows;
}
function parseYear(value){
  const raw=String(value||'').trim();
  const fourDigit=raw.match(/^(\d{4})/);
  if(fourDigit) return fourDigit[1];
  const shortDate=raw.match(/^\d{1,2}\/\d{1,2}\/(\d{2})$/);
  if(shortDate){const year=Number(shortDate[1]);return String(year<=29?2000+year:1900+year);}
  return 'Year unavailable';
}
function parseCode(value){
  const match=String(value||'').match(/\(\s*([+-]?\d+)\s*\)/);
  return match?Number(match[1]):0;
}
function cleanCountry(value){
  const raw=String(value||'').trim().replace(/\s+/g,' ');
  return ({'Phillipines':'Philippines','Gambia':'The Gambia','OEA':'Organization of American States','United States of America':'United States','Côte d"Ivoire':'Côte d’Ivoire'})[raw]||raw;
}
// Display-only formatting for law titles (capitalization, punctuation, accents).
// The CSV stays untouched; law IDs are still built from the raw LAW value.
const lawDisplayNames={
 'Ordonnance N 66-156':'Ordonnance n° 66-156',
 "loi n 82-01 du 6 fevrier 1982 portent code de l'information":'Loi n° 82-01 du 6 février 1982 portant code de l’information',
 "loi n 90-07 avril 1990 relative a l'information":'Loi n° 90-07 (avril 1990) relative à l’information',
 "loi organique n 12-05 du 12 janvier 2012 relative a l'information":'Loi organique n° 12-05 du 12 janvier 2012 relative à l’information',
 'loi organique n 23-14 du 27 aout 2023':'Loi organique n° 23-14 du 27 août 2023',
 'Law No. 30-VIQD - Amendments to the Law on Information, Informatization and Protection of Information':'Law No. 30-VIQD – Amendments to the Law on Information, Informatization and Protection of Information',
 'On information, informatization, and information protection':'On Information, Informatization, and Information Protection',
 'DIGITAL SECURITY ACT, 2018':'Digital Security Act, 2018',
 'Law Against Racism And All Forms Of Discrimination':'Law Against Racism and All Forms of Discrimination',
 'Emergency Powers (COVID-19)(AMENDMENT)(No. 2) Regulations, 2020':'Emergency Powers (COVID-19) (Amendment) (No. 2) Regulations, 2020',
 'Emergency Powers (COVID-19)(AMENDMENT)Regulations, 2020':'Emergency Powers (COVID-19) (Amendment) Regulations, 2020',
 'LOI n° 2013-451':'Loi n° 2013-451',
 'The law about Nation Management in the State of Emergency (translated)':'The Law About Nation Management in the State of Emergency (translated)',
 'LAW PROHIBITING MARAS, GANGS, GROUPS, ASSOCIATIONS AND ORGANIZATIONS OF A CRIMINAL NATURE':'Law Prohibiting Maras, Gangs, Groups, Associations and Organizations of a Criminal Nature',
 'Special Law Against Computer and related Crimes':'Special Law Against Computer and Related Crimes',
 'Decree 349 Penal Code Reforms':'Decree 349: Penal Code Reforms',
 'Decree 880 Penal Code Reform':'Decree 880: Penal Code Reform',
 'LOI no 2018-1202 du 22 décembre 2018 relative à la lutte contre la manipulation de l’information':'Loi n° 2018-1202 du 22 décembre 2018 relative à la lutte contre la manipulation de l’information',
 'Law No. 019_2016':'Law No. 019/2016',
 'LEY DE EMISIÓN DEL PENSAMIENTO (Thought Expression Law)':'Ley de Emisión del Pensamiento (Thought Expression Law)',
 'ACT LXXIX OF 2021 ON TAKING MORE SEVERE ACTION AGAINST PAEDOPHILE OFFENDERS AND AMENDING CERTAIN ACTS FOR THE PROTECTION OF CHILDREN':'Act LXXIX of 2021 on Taking More Severe Action Against Paedophile Offenders and Amending Certain Acts for the Protection of Children',
 'ACT LXXXVIII OF 2023 ON THE PROTECTION OF NATIONAL SOVEREIGNTY':'Act LXXXVIII of 2023 on the Protection of National Sovereignty',
 'Act XII of 2020 on the containment of coronavirus':'Act XII of 2020 on the Containment of Coronavirus',
 'Law on the independent media commission':'Law on the Independent Media Commission',
 'Law On The Independent Media Commission And Broadcasting':'Law on the Independent Media Commission and Broadcasting',
 'Decree On Information Management on the Internet':'Decree on Information Management on the Internet',
 'BAYANIHAN TO HEAL AS ONE ACT (REPUBLIC ACT NO. 11469)':'Bayanihan to Heal as One Act (Republic Act No. 11469)',
 'Act of 27 June 1997 on political parties':'Act of 27 June 1997 on Political Parties',
 'Act from December 30, 2015 on amending the Act on Radio and Television Broadcasting':'Act from December 30, 2015, on Amending the Act on Radio and Television Broadcasting',
 'Law determining offences and penalties in general':'Law Determining Offences and Penalties in General',
 'Law on prevention and punishment of cybercrimes':'Law on Prevention and Punishment of Cybercrimes',
 'DISASTER MANAGEMENT ACT, 2002':'Disaster Management Act, 2002',
 'Thailand’s Cybercrime Act amendment':'Thailand’s Cybercrime Act Amendment',
 'THE LAW ON REGULATION OF BROADCASTS VIA INTERNET AND COMBATING CRIMES COMMITTED BY THE MEANS OF SUCH PUBLICATIONS':'The Law on Regulation of Broadcasts via Internet and Combating Crimes Committed by the Means of Such Publications',
 'Law No. 16099 Press and freedom of communication Law':'Law No. 16099: Press and Freedom of Communication Law',
 'Law No. 16099 Reform to Press and freedom of communication Law':'Law No. 16099: Reform to Press and Freedom of Communication Law',
 'Law No. 20838 Reform to the Regulation of Audiovisual Communications Services':'Law No. 20838: Reform to the Regulation of Audiovisual Communications Services',
 'Law No. 1219 Special Law Against Cybercrime Reform':'Law No. 1219: Special Law Against Cybercrime Reform',
 'Law on the Excersice of Journalism':'Law on the Exercise of Journalism',
 'Decree 4.975 Creation of Cybersecurity Council':'Decree 4.975: Creation of Cybersecurity Council',
 'Law on the Supervision, Regularization, Performance, and Financing of Non-Governmental Organizations and Non-profit Social Organizations':'Law on the Supervision, Regularization, Performance, and Financing of Non-Governmental Organizations and Non-Profit Social Organizations'
};
function cleanLaw(value){
 const raw=String(value||'').trim().replace(/\s+/g,' ');
 if(lawDisplayNames[raw]) return lawDisplayNames[raw];
 // "(Algeria 1969) Algeria Penal Code 1969 as amended by 69-74" → "Algeria Penal Code 1969, as amended by 69-74"
 const algeria=raw.match(/^\(Algeria \d{4}\) (Algeria Penal Code \d{4}) as amended by (\S+)$/);
 if(algeria) return `${algeria[1]}, as amended by ${algeria[2]}`;
 return raw.replace(/(\w)'/g,'$1’');
}
function stableLawId(country,law,sourceYear){return `law-${encodeURIComponent(`${country}|${law}|${sourceYear}`)}`;}
function showCorpusError(message){
  lawList.innerHTML=`<p style="color:var(--muted)">${escapeHtml(message)}</p>`;
  detail.innerHTML=`<div class="evidence"><strong>Corpus unavailable</strong><p style="font-size:14px;color:var(--muted)">${escapeHtml(message)}</p></div>`;
}
function renderDetail(id){
  selected=id; const x=corpusLaws.find(l=>l.id===id); if(!x)return;
  const rules=codingKeys.map(key=>({key,value:parseCode(x.raw[key])})).filter(rule=>showAllKeys||rule.value!==0);
  const valueBadge=rule=>rule.value===1?'background:#e8f4ed;color:#21603a':rule.value===-1?'background:#f9e9e8;color:#9b302c':'background:#eef0ef;color:#5b6660';
  detail.innerHTML=`<h2 style="font-size:34px;margin-top:0">${escapeHtml(x.title)}</h2><p style="color:var(--muted);margin-top:0">${escapeHtml(x.country)} · ${escapeHtml(x.year)}</p><div class="evidence"><strong>LEX Keys</strong><p style="font-size:14px;color:var(--muted)">Showing ${rules.length} coding keys.</p><button id="toggleAllKeys" class="btn">${showAllKeys?'Hide zero keys':'Show all keys'}</button></div><div class="item-list" style="margin-top:16px">${rules.map(rule=>`<div class="item-row" style="cursor:default"><strong>${escapeHtml(rule.key)}</strong><span class="badge" style="float:right;${valueBadge(rule)}">${escapeHtml(rule.value)}</span></div>`).join('')}</div>`;
  document.getElementById('toggleAllKeys').addEventListener('click',()=>{showAllKeys=!showAllKeys;renderDetail(selected);});
  renderList();
}
function renderList(){
  const q=document.getElementById('search').value.toLowerCase(), f=document.getElementById('filter').value;
  const filtered=corpusLaws.filter(x=>(f==='all'||x.country===f)&&(!q||x.search.includes(q)));
  lawList.innerHTML=filtered.map(x=>`<button class="law-row ${x.id===selected?'active':''}" data-law="${escapeHtml(x.id)}"><strong>${escapeHtml(x.title)}</strong><small>${escapeHtml(x.country)} · ${escapeHtml(x.year)}</small></button>`).join('')||'<p style="color:var(--muted)">No matching laws.</p>';
  lawList.querySelectorAll('[data-law]').forEach(b=>b.addEventListener('click',()=>renderDetail(b.dataset.law)));
}
async function loadCorpus(){
  try{
    const response=await fetch(corpusCsvPath);
    if(!response.ok) throw new Error(`Unable to load ${corpusCsvPath}.`);
    const [headers,...rows]=parseCsv(await response.text());
    const keyStart=headers.indexOf('C_DISINFO_GEN');
    if(keyStart===-1) throw new Error('The CSV does not contain the C_DISINFO_GEN coding-key column.');
    codingKeys=headers.slice(keyStart).filter(header=>header&&!header.endsWith('_NOTE'));
    corpusLaws=rows.filter(row=>row.some(cell=>String(cell).trim())).map(row=>{
      const raw=Object.fromEntries(headers.map((header,column)=>[header,row[column]||'']));
      const rawCountry=raw.COUNTRY||'', rawLaw=raw.LAW||'';
      const country=cleanCountry(rawCountry), title=cleanLaw(rawLaw);
      return {id:stableLawId(rawCountry,rawLaw,raw.SRCEYR||''),country,title,year:parseYear(raw.SRCEYR),raw,search:`${rawCountry} ${country} ${rawLaw} ${title}`.toLowerCase()};
    }).filter(law=>law.country||law.title);
    if(!corpusLaws.length) throw new Error('The CSV contains no usable law rows.');
    document.getElementById('corpusCount').textContent=corpusLaws.length;
    const filter=document.getElementById('filter');
    filter.innerHTML='<option value="all">All jurisdictions</option>';
    [...new Set(corpusLaws.map(law=>law.country))].sort((a,b)=>a.localeCompare(b)).forEach(country=>{const option=document.createElement('option');option.value=country;option.textContent=country;filter.appendChild(option);});
    selected=corpusLaws[0].id;
    renderDetail(selected);
    renderScoreGrid(corpusLaws);
  }catch(error){showCorpusError(error.message||'The Corpus CSV could not be loaded.');}
}
document.getElementById('search').addEventListener('input',renderList);
document.getElementById('filter').addEventListener('change',renderList);
loadCorpus();


const cbSearch=document.getElementById('cbSearch'), cbSection=document.getElementById('cbSection'), cbActor=document.getElementById('cbActor'), cbContent=document.getElementById('cbContent');
const cbList=document.getElementById('cbList'), cbDetail=document.getElementById('cbDetail'), cbCount=document.getElementById('cbCount'), cbMore=document.getElementById('cbMore');
let cbSelected=codebook[0].number, cbLimit=24;
[...new Set(codebook.map(x=>x.actor))].sort().forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;cbActor.appendChild(o);});
[...new Set(codebook.map(x=>x.content))].sort().forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;cbContent.appendChild(o);});
function cbFiltered(){
  const q=cbSearch.value.trim().toLowerCase();
  return codebook.filter(x=>(cbSection.value==='all'||x.sectionKey===cbSection.value)&&(cbActor.value==='all'||x.actor===cbActor.value)&&(cbContent.value==='all'||x.content===cbContent.value)&&(!q||(x.variable+' '+x.statement+' '+x.section+' '+x.subsection+' '+x.actor+' '+x.content).toLowerCase().includes(q)));
}
function renderCbDetail(num){
  const x=codebook.find(i=>i.number===num)||codebook[0]; cbSelected=x.number;
  cbDetail.innerHTML=`<div class="tags"><span class="badge">${x.number}</span><span class="badge neutral">${x.sectionKey}</span><span class="badge neutral">${x.subsection}</span></div><h2 style="font-size:31px;margin-top:14px">${x.variable}</h2><p>${x.statement}</p><h3 style="margin-top:24px">Institutional Grammar</h3><div class="adico-raw">${x.adico||'ADICO formulation listed in the full codebook.'}</div><h3 style="margin-top:22px">Classification</h3><div class="tags"><span class="badge">${x.actor}</span><span class="badge">${x.content}</span></div><div class="evidence"><strong>Coding values</strong><p style="font-size:14px;color:var(--muted)">1 = legal rule appears as written <br> 0 = legal rule does not exist <br> -1 = legal rule appears as the negation of what is written.</p></div>`;
  renderCbList();
}
function renderCbList(){
  const arr=cbFiltered(); cbCount.textContent=`${arr.length} coding item${arr.length===1?'':'s'} found`;
  cbList.innerHTML=arr.slice(0,cbLimit).map(x=>`<button class="item-row ${x.number===cbSelected?'active':''}" data-cb="${x.number}"><span class="v">[${x.variable}]</span><strong style="display:block;margin-top:5px">${x.number} · ${x.subsection}</strong><small>${x.statement.length>150?x.statement.slice(0,150)+'…':x.statement}</small></button>`).join('')||'<p style="color:var(--muted)">No coding items match these filters.</p>';
  cbList.querySelectorAll('[data-cb]').forEach(b=>b.addEventListener('click',()=>renderCbDetail(b.dataset.cb)));
  cbMore.style.display=arr.length>cbLimit?'inline-flex':'none';
}
[cbSearch,cbSection,cbActor,cbContent].forEach(el=>el.addEventListener(el.tagName==='INPUT'?'input':'change',()=>{cbLimit=24;renderCbList();}));
cbMore.addEventListener('click',()=>{cbLimit+=24;renderCbList();});
renderCbDetail(cbSelected);

const trackerBody=document.getElementById('trackerBody'), trackerSearch=document.getElementById('trackerSearch'), trackerStatus=document.getElementById('trackerStatus'), trackerRegion=document.getElementById('trackerRegion'), trackerClosedBody=document.getElementById('trackerClosedBody'), trackerExprBody=document.getElementById('trackerExprBody'), trackerEnactedBody=document.getElementById('trackerEnactedBody');
const trackerEmptyRow=`<tr><td colspan="6" style="color:var(--muted)">No bills match the current filters.</td></tr>`;
function trackerRow(x,statusCell){
 return `<tr><td><strong>${x.country}</strong><br><span style="color:var(--muted)">${x.region}</span></td><td>${x.bill}</td><td>${statusCell}</td><td>${x.relevance}</td><td>${x.reviewed}</td><td><a class="source-link" href="${x.source}" target="_blank" rel="noopener">${x.sourceLabel||'Official source'} ↗</a></td></tr>`;
}
function renderTracker(){
 const q=trackerSearch.value.toLowerCase();
 const matches=(x,extra='')=>(trackerRegion.value==='all'||x.region===trackerRegion.value)&&(!q||(x.country+' '+x.bill+' '+x.relevance+' '+extra).toLowerCase().includes(q));
 const open=list=>(list||[]).filter(x=>(trackerStatus.value==='all'||x.status===trackerStatus.value)&&matches(x));
 const ai=open(tracker), expr=open(typeof trackerExpression==='undefined'?[]:trackerExpression);
 trackerBody.innerHTML=ai.length?ai.map(x=>trackerRow(x,`<span class="badge">${x.status}</span>`)).join(''):trackerEmptyRow;
 trackerExprBody.innerHTML=expr.length?expr.map(x=>trackerRow(x,`<span class="badge">${x.status}</span>`)).join(''):trackerEmptyRow;
 // Enacted and closed tables follow the search and region filters; the status filter applies only to bills under watch.
 const enacted=(typeof trackerEnacted==='undefined'?[]:trackerEnacted).filter(x=>matches(x));
 trackerEnactedBody.innerHTML=enacted.length?enacted.map(x=>trackerRow(x,`<span class="badge neutral">${x.track==='AI'?'AI and synthetic media':'Cybersecurity, security, media, and speech'}</span>`)).join(''):trackerEmptyRow;
 const closed=(typeof trackerClosed==='undefined'?[]:trackerClosed).filter(x=>matches(x,x.outcome));
 trackerClosedBody.innerHTML=closed.length?closed.map(x=>trackerRow(x,`<span class="badge neutral">${x.status}</span><br><span style="color:var(--muted);font-size:14px">${x.outcome}</span>`)).join(''):trackerEmptyRow;
}
[trackerSearch,trackerStatus,trackerRegion].forEach(el=>el.addEventListener(el.tagName==='INPUT'?'input':'change',renderTracker));
renderTracker();

const scoreGrid=document.getElementById('scoreGrid');
function renderScoreGrid(laws){scoreGrid.innerHTML=laws.map(x=>{
  const report=(humanRightsScores||[]).find(r=>r.id===x.id) || {};
  const score=(report.score===null || report.score===undefined) ? '—' : report.score;
  const scoreLabel=(report.score===null || report.score===undefined) ? 'Score pending' : `Score ${report.score}`;
  const category=report.category || 'Category pending';
  return `<article class="score-card"><div class="score-top"><div><span class="badge">${escapeHtml(x.country)}</span><h3 style="margin-top:12px">${escapeHtml(x.title)}</h3><p class="count-pill">${escapeHtml(x.year)} · verified coding</p></div><div class="score-value">${score}</div></div><div class="score-scale"></div><div class="score-labels"><span>More restrictive</span><span>More protective</span></div><div class="tags" style="margin-top:15px"><span class="badge neutral">${scoreLabel}</span><span class="badge neutral">${category}</span></div>${report.rationale?`<div class="evidence"><strong>Assessment rationale</strong><p style="font-size:14px;color:var(--muted)">${report.rationale}</p></div>`:''}</article>`;
}).join('');}

document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));
