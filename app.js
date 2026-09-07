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
function cleanLaw(value){return String(value||'').trim().replace(/\s+/g,' ');}
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

const sample='Article 12. Providers shall establish appropriate governance measures and procedures to protect the rights of users and maintain transparent oversight of regulated systems.';
document.getElementById('sample').addEventListener('click',()=>document.getElementById('legalText').value=sample);
document.getElementById('run').addEventListener('click',()=>{if(!document.getElementById('legalText').value.trim()){alert('Paste legal text or load the sample first.');return;}document.getElementById('empty').style.display='none';document.getElementById('results').style.display='block';});
document.getElementById('verify').addEventListener('click',()=>document.getElementById('verified').style.display='block');
document.getElementById('clear').addEventListener('click',()=>{document.getElementById('legalText').value='';document.getElementById('results').style.display='none';document.getElementById('empty').style.display='grid';document.getElementById('verified').style.display='none';});


const trackerBody=document.getElementById('trackerBody'), trackerSearch=document.getElementById('trackerSearch'), trackerStatus=document.getElementById('trackerStatus'), trackerRegion=document.getElementById('trackerRegion'), trackerCount=document.getElementById('trackerCount');
function renderTracker(){
 const q=trackerSearch.value.toLowerCase();
 const arr=tracker.filter(x=>(trackerStatus.value==='all'||x.status===trackerStatus.value)&&(trackerRegion.value==='all'||x.region===trackerRegion.value)&&(!q||(x.country+' '+x.bill+' '+x.relevance).toLowerCase().includes(q)));
 trackerCount.textContent=`${arr.length} tracked item${arr.length===1?'':'s'} · reviewed monthly`;
 trackerBody.innerHTML=arr.map(x=>`<tr><td><strong>${x.country}</strong><br><span style="color:var(--muted)">${x.region}</span></td><td>${x.bill}</td><td><span class="badge">${x.status}</span></td><td>${x.relevance}</td><td>${x.reviewed}</td><td><a class="source-link" href="${x.source}" target="_blank" rel="noopener">Official source ↗</a></td></tr>`).join('');
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
