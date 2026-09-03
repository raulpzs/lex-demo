const pages=[...document.querySelectorAll('.page')];
const navButtons=[...document.querySelectorAll('nav [data-page]')];
function go(name){pages.forEach(p=>p.classList.toggle('active',p.id===name));navButtons.forEach(b=>b.classList.toggle('active',b.dataset.page===name));window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('[data-page]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();go(el.dataset.page);}));



let selected='eu24';
const lawList=document.getElementById('lawList'), detail=document.getElementById('lawDetail');
function renderDetail(id){
  selected=id; const x=laws.find(l=>l.id===id);
  detail.innerHTML=`<span class="badge">${x.status}</span><h2 style="font-size:34px;margin-top:14px">${x.title}</h2><p style="color:var(--muted);margin-top:0">${x.place} · ${x.year}</p><p>${x.summary}</p><h3 style="margin-top:24px">LEX domains</h3><div class="tags">${x.domains.map(d=>`<span class="badge">${d}</span>`).join('')}</div><div class="evidence"><strong>Provision-level record</strong><p style="font-size:14px;color:var(--muted)">The public record shows the provision key, code, statutory evidence, explanation, reviewer status, and links to comparable provisions.</p><span class="badge">Human verified</span></div>`;
  renderList();
}
function renderList(){
  const q=document.getElementById('search').value.toLowerCase(), f=document.getElementById('filter').value;
  const filtered=laws.filter(x=>(f==='all'||x.place===f)&&(x.title+' '+x.place).toLowerCase().includes(q));
  lawList.innerHTML=filtered.map(x=>`<button class="law-row ${x.id===selected?'active':''}" data-law="${x.id}"><strong>${x.title}</strong><small>${x.place} · ${x.year}</small></button>`).join('')||'<p style="color:var(--muted)">No matching laws.</p>';
  lawList.querySelectorAll('[data-law]').forEach(b=>b.addEventListener('click',()=>renderDetail(b.dataset.law)));
}
document.getElementById('search').addEventListener('input',renderList);
document.getElementById('filter').addEventListener('change',renderList);
renderDetail(selected);


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
scoreGrid.innerHTML=laws.map(x=>{
  const report=(humanRightsScores||[]).find(r=>r.id===x.id) || {};
  const score=(report.score===null || report.score===undefined) ? '—' : report.score;
  const scoreLabel=(report.score===null || report.score===undefined) ? 'Score pending' : `Score ${report.score}`;
  const category=report.category || 'Category pending';
  return `<article class="score-card"><div class="score-top"><div><span class="badge">${x.place}</span><h3 style="margin-top:12px">${x.title}</h3><p class="count-pill">${x.year} · verified coding</p></div><div class="score-value">${score}</div></div><div class="score-scale"></div><div class="score-labels"><span>More restrictive</span><span>More protective</span></div><div class="tags" style="margin-top:15px"><span class="badge neutral">${scoreLabel}</span><span class="badge neutral">${category}</span></div>${report.rationale?`<div class="evidence"><strong>Assessment rationale</strong><p style="font-size:14px;color:var(--muted)">${report.rationale}</p></div>`:''}</article>`;
}).join('');

document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));
