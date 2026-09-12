/* ============================================================
   ResumeAI — application logic
   Created by Muhammad Sulieman Khan
   ============================================================ */

const LS_KEY = 'resumeai_v1';
const uid = () => Math.random().toString(36).slice(2,10);

const SECTIONS = [
  {id:'personal', label:'Personal Information', icon:'👤'},
  {id:'summary', label:'Professional Summary', icon:'✎'},
  {id:'experience', label:'Experience', icon:'💼'},
  {id:'education', label:'Education', icon:'🎓'},
  {id:'skills', label:'Skills', icon:'⚡'},
  {id:'projects', label:'Projects', icon:'🧩'},
  {id:'certifications', label:'Certifications', icon:'📜'},
  {id:'languages', label:'Languages', icon:'🌐'},
  {id:'achievements', label:'Achievements & Awards', icon:'🏆'},
  {id:'references', label:'References', icon:'📇'},
  {id:'custom', label:'Custom Sections', icon:'➕'},
  {id:'design', label:'Design', icon:'🎨'},
  {id:'ats', label:'ATS Checker', icon:'✅'},
  {id:'settings', label:'Settings', icon:'⚙️'},
];

const TEMPLATES = [
  {id:'classic', name:'Classic Professional', cat:['Professional']},
  {id:'minimal', name:'Modern Minimal', cat:['Minimal']},
  {id:'executive', name:'Executive', cat:['Executive']},
  {id:'sidebar', name:'Sidebar', cat:['Professional']},
  {id:'timeline', name:'Timeline', cat:['Creative']},
  {id:'swiss', name:'Swiss', cat:['Minimal']},
  {id:'compact', name:'Compact / ATS', cat:['ATS']},
  {id:'creative', name:'Creative', cat:['Creative']},
];

const FONTS = ['Inter','Roboto','Poppins','Montserrat','Open Sans','Lato','Merriweather','Playfair Display','Source Sans 3','Georgia','Arial'];
const PALETTES = {Black:'#1a1a1a',Navy:'#1f2a52',Blue:'#2454c7',Green:'#1f8a5f',Teal:'#0f8a8a',Purple:'#6b3fbf',Burgundy:'#7a2036',Gray:'#4b4f58',Orange:'#c96a1f'};

function sampleResume(){
  return {
    id: uid(), name:'Software Engineer Resume', updatedAt: Date.now(),
    template:'classic',
    design:{font:'Inter', fontSize:'medium', color:PALETTES.Blue, margin:18, sectionSpacing:20, lineSpacing:1.45, sectionOrder:['summary','experience','education','skills','projects','certifications','languages','achievements','references','custom'],
      visibility:{photo:true,phone:true,email:true,website:true,linkedin:true,github:true,references:true,gpa:true,skillsProficiency:true}},
    photo:null,
    personal:{fullName:'Amara Osei', title:'Senior Product Designer', email:'amara.osei@email.com', phone:'+92 300 1234567', location:'Lahore, Pakistan', website:'amaraosei.design', linkedin:'linkedin.com/in/amaraosei', github:'', portfolio:''},
    summary:'Product designer with 6+ years shaping B2B SaaS experiences from research through shipped UI. Led design for a analytics platform used by 40,000+ weekly active users, and built the design system that cut new-feature design time by 35%.',
    experience:[
      {id:uid(), title:'Senior Product Designer', company:'Northwind Analytics', location:'Remote', start:'2022-03', end:'', current:true, description:'Led end-to-end design for the core analytics dashboard.\nBuilt and maintained a 120-component design system adopted across 4 product teams.\nMentored 2 junior designers and ran weekly critique sessions.'},
      {id:uid(), title:'Product Designer', company:'Fenwick Labs', location:'Lahore, Pakistan', start:'2019-06', end:'2022-02', current:false, description:'Designed onboarding flows that raised activation rate by 22%.\nPartnered directly with engineering on a design-to-code component library.'}
    ],
    education:[
      {id:uid(), degree:'BSc, Computer Science', institution:'LUMS', location:'Lahore, Pakistan', start:'2015-09', end:'2019-05', gpa:'3.7', description:'Focused on human-computer interaction and applied statistics.'}
    ],
    skills:[
      {id:uid(), name:'Figma', category:'Design', level:'Expert'},
      {id:uid(), name:'Design Systems', category:'Design', level:'Expert'},
      {id:uid(), name:'User Research', category:'Research', level:'Advanced'},
      {id:uid(), name:'HTML/CSS', category:'Technical', level:'Intermediate'},
      {id:uid(), name:'Prototyping', category:'Design', level:'Advanced'},
    ],
    projects:[{id:uid(), name:'OpenMetrics UI Kit', description:'Open-source component library for analytics dashboards, 1,200+ GitHub stars.', tech:'Figma, React, Storybook', url:'github.com/aosei/openmetrics', start:'2023-01', end:'2023-08'}],
    certifications:[{id:uid(), name:'Certified Usability Analyst', org:'Human Factors International', issueDate:'2021-04', expDate:'', credId:'', credUrl:''}],
    languages:[{id:uid(), name:'English', level:'Fluent'},{id:uid(), name:'Urdu', level:'Native'}],
    achievements:[{id:uid(), title:'Best Redesign — Product Awards 2023', org:'SaaS Design Guild', date:'2023-11', description:'Recognized for the Northwind Analytics dashboard redesign.'}],
    references:[{id:uid(), name:'Farhan Malik', position:'VP Product', company:'Northwind Analytics', email:'farhan.malik@email.com', phone:'+92 300 9876543'}],
    custom:[]
  };
}

function blankResume(name){
  const r = sampleResume();
  r.id = uid(); r.name = name || 'Untitled Resume'; r.updatedAt = Date.now();
  r.personal = {fullName:'', title:'', email:'', phone:'', location:'', website:'', linkedin:'', github:'', portfolio:''};
  r.summary=''; r.experience=[]; r.education=[]; r.skills=[]; r.projects=[]; r.certifications=[]; r.languages=[]; r.achievements=[]; r.references=[]; r.custom=[]; r.photo=null;
  return r;
}

/* ---------------- state & persistence ---------------- */
let STATE = load();
let activeId = null;
let activeSectionUI = 'personal';
let zoomLevel = 1;
let history = [], historyIdx = -1, historySuspend=false;
let darkPref = localStorage.getItem('resumeai_theme') || 'light';
if (darkPref==='dark') document.body.classList.add('dark');

function load(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return {resumes:[]};
}
let saveTimer=null;
function persist(showSaving){
  const el = document.getElementById('saveState');
  if(el && showSaving!==false) el.textContent='Saving…';
  clearTimeout(saveTimer);
  saveTimer=setTimeout(()=>{
    try{
      localStorage.setItem(LS_KEY, JSON.stringify(STATE));
      if(el) el.textContent='Saved just now';
    }catch(e){ toast('Could not save — local storage may be full.'); }
  }, 260);
}
function activeResume(){ return STATE.resumes.find(r=>r.id===activeId); }

function pushHistory(){
  if(historySuspend) return;
  const snap = JSON.stringify(activeResume());
  history = history.slice(0, historyIdx+1);
  history.push(snap);
  if(history.length>60) history.shift();
  historyIdx = history.length-1;
}
function undo(){
  if(historyIdx<=0) return toast('Nothing to undo');
  historyIdx--;
  applyHistorySnap();
}
function redo(){
  if(historyIdx>=history.length-1) return toast('Nothing to redo');
  historyIdx++;
  applyHistorySnap();
}
function applyHistorySnap(){
  historySuspend=true;
  const idx = STATE.resumes.findIndex(r=>r.id===activeId);
  STATE.resumes[idx] = JSON.parse(history[historyIdx]);
  persist(false); renderPanel(); renderPreview();
  historySuspend=false;
}

function mutate(fn){
  fn(activeResume());
  activeResume().updatedAt = Date.now();
  persist();
  renderPreview();
  pushHistory();
}

/* ---------------- toast ---------------- */
function toast(msg){
  const host = document.getElementById('toastHost');
  const t = document.createElement('div');
  t.className='toast'; t.textContent=msg;
  host.appendChild(t);
  setTimeout(()=>t.remove(), 3200);
}

/* ---------------- navigation between views ---------------- */
function showView(v){
  document.getElementById('view-landing').style.display = v==='landing' ? 'block' : 'none';
  document.getElementById('view-dashboard').style.display = v==='dashboard' ? 'block' : 'none';
  document.getElementById('view-builder').style.display = v==='builder' ? 'block' : 'none';
}
function goLanding(){ showView('landing'); }
function goDashboard(){ showView('dashboard'); renderDashboard(); }
function goBuilder(id){
  activeId = id; showView('builder'); activeSectionUI='personal';
  history=[]; historyIdx=-1; pushHistory();
  renderSidebar(); renderPanel(); renderPreview(); fitZoom();
}

/* ---------------- dashboard ---------------- */
function renderDashboard(){
  const wrap = document.getElementById('resList');
  wrap.innerHTML='';
  STATE.resumes.slice().sort((a,b)=>b.updatedAt-a.updatedAt).forEach(r=>{
    const card = document.createElement('div');
    card.className='rescard';
    card.innerHTML = `
      <div class="thumb" onclick="goBuilder('${r.id}')">${miniPreviewSVG(r)}</div>
      <div class="body" onclick="goBuilder('${r.id}')">
        <h4>${esc(r.name)}</h4>
        <div class="meta">Edited ${timeAgo(r.updatedAt)} · ${TEMPLATES.find(t=>t.id===r.template)?.name||''}</div>
      </div>
      <div class="acts">
        <button class="btn btn-sm" onclick="event.stopPropagation();renameResume('${r.id}')">Rename</button>
        <button class="btn btn-sm" onclick="event.stopPropagation();duplicateResume('${r.id}')">Duplicate</button>
        <button class="btn btn-sm" onclick="event.stopPropagation();exportSingleJSON('${r.id}')">Export</button>
        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteResume('${r.id}')">Delete</button>
      </div>`;
    wrap.appendChild(card);
  });
  const nc = document.createElement('div');
  nc.className='rescard newcard';
  nc.onclick=createResume;
  nc.innerHTML = `<div style="font-size:28px;">+</div><div>New Resume</div>`;
  wrap.appendChild(nc);
}
function miniPreviewSVG(r){
  return `<div style="font-size:9px;color:var(--ink-soft);text-align:center;padding:10px;">${esc(r.personal.fullName||'Untitled')}<br><span style="font-size:8px;">${esc(r.personal.title||'')}</span></div>`;
}
function timeAgo(ts){
  const s = Math.floor((Date.now()-ts)/1000);
  if(s<60) return 'just now';
  if(s<3600) return Math.floor(s/60)+'m ago';
  if(s<86400) return Math.floor(s/3600)+'h ago';
  return Math.floor(s/86400)+'d ago';
}
function createResume(){
  const r = STATE.resumes.length===0 ? sampleResume() : blankResume('Untitled Resume '+(STATE.resumes.length+1));
  STATE.resumes.push(r); persist(false);
  goBuilder(r.id);
  if(STATE.resumes.length===1) toast('Loaded a sample resume so you can see how templates look. Edit or clear it any time.');
}
function renameResume(id){
  const r = STATE.resumes.find(x=>x.id===id);
  const n = prompt('Rename resume', r.name);
  if(n){ r.name=n; r.updatedAt=Date.now(); persist(false); renderDashboard(); }
}
function duplicateResume(id){
  const r = STATE.resumes.find(x=>x.id===id);
  const copy = JSON.parse(JSON.stringify(r));
  copy.id=uid(); copy.name = r.name+' (Copy)'; copy.updatedAt=Date.now();
  STATE.resumes.push(copy); persist(false); renderDashboard();
  toast('Resume duplicated');
}
function deleteResume(id){
  if(!confirm('Delete this resume? This cannot be undone.')) return;
  STATE.resumes = STATE.resumes.filter(x=>x.id!==id);
  persist(false); renderDashboard();
}

/* ---------------- sidebar ---------------- */
function renderSidebar(){
  const wrap = document.getElementById('bSidebar');
  wrap.innerHTML='';
  SECTIONS.forEach(s=>{
    const div = document.createElement('div');
    div.className='navitem'+(activeSectionUI===s.id?' active':'');
    div.innerHTML = `<span class="ic">${s.icon}</span>${s.label}`;
    div.onclick = ()=>{ activeSectionUI=s.id; renderSidebar(); renderPanel(); };
    wrap.appendChild(div);
  });
}

/* ---------------- panel (forms) & mobile step nav ---------------- */
window.mobileNextStep = function(targetId, isDesign) {
  // Mobile Preview Override
  if (targetId === 'mobile_preview') {
    const vb = document.getElementById('view-builder');
    vb.classList.remove('mobile-hide-preview');
    vb.classList.add('mobile-hide-panel', 'mobile-hide-sidebar');
    setTimeout(fitZoom, 50);
    return;
  }
  
  // Normal Navigation
  const vb = document.getElementById('view-builder');
  vb.classList.add('mobile-hide-preview', 'mobile-hide-sidebar');
  vb.classList.remove('mobile-hide-panel');
  
  activeSectionUI = targetId;
  renderSidebar();
  renderPanel();
  if(isDesign) {
    toast('Details complete! Choose a template below, then tap Preview.');
  }
};

function renderPanel(){
  const p = document.getElementById('bPanel');
  const r = activeResume();
  if(!r) return;
  p.innerHTML='';
  p.scrollTop = 0; // Auto-scroll to top when moving to next step
  
  const renderers = {
    personal: panelPersonal, summary: panelSummary, experience: ()=>panelList('experience'),
    education: ()=>panelList('education'), skills: panelSkills, projects: ()=>panelList('projects'),
    certifications: ()=>panelList('certifications'), languages: panelLanguages, achievements: ()=>panelList('achievements'),
    references: ()=>panelList('references'), custom: panelCustom, design: panelDesign, ats: panelATS, settings: panelSettings
  };
  (renderers[activeSectionUI]||panelPersonal)();

  // Inject Sequential Navigation for Mobile
  const currentIdx = SECTIONS.findIndex(s => s.id === activeSectionUI);
  if(currentIdx !== -1) {
    const prev = SECTIONS[currentIdx - 1];
    const next = SECTIONS[currentIdx + 1];
    const navWrap = document.createElement('div');
    navWrap.className = 'mobile-step-nav';
    let html = `<div style="display:flex; justify-content:space-between; margin-top:30px; padding-top:15px; border-top:1px solid var(--border);">`;
    
    if(prev) {
      html += `<button class="btn" onclick="mobileNextStep('${prev.id}', false)">← Back</button>`;
    } else {
      html += `<div></div>`;
    }

    if(next) {
      if(next.id === 'design') {
         html += `<button class="btn btn-primary" onclick="mobileNextStep('${next.id}', true)">Next: Template →</button>`;
      } else {
         html += `<button class="btn btn-primary" onclick="mobileNextStep('${next.id}', false)">Next: ${next.label} →</button>`;
      }
    } else {
      // Final tab (Settings) - replace Next with Preview button
      html += `<button class="btn btn-primary" onclick="mobileNextStep('mobile_preview', false)">See Final Preview 👁</button>`;
    }
    html += `</div>`;
    
    // Add an extra quick-preview button to the top of the design section for mobile convenience
    if(activeSectionUI === 'design') {
       html = `<button class="btn btn-primary" style="width:100%; margin-bottom:15px;" onclick="mobileNextStep('mobile_preview', false)">👁 See Live Preview</button>` + html;
    }
    
    navWrap.innerHTML = html;
    p.appendChild(navWrap);
  }
}

function h(html){ const t=document.createElement('div'); t.innerHTML=html; return t.firstElementChild; }
function panelHeader(title, extra){
  const p=document.getElementById('bPanel');
  p.appendChild(h(`<div class="panel-h"><h2>${title}</h2><div>${extra||''}</div></div>`));
}

function panelPersonal(){
  const r=activeResume(); const p=document.getElementById('bPanel');
  panelHeader('Personal Information');
  const wrap=h(`<div></div>`); p.appendChild(wrap);
  wrap.appendChild(fieldRow('Full Name','fullName', r.personal.fullName, v=>mutate(r=>r.personal.fullName=v)));
  wrap.appendChild(fieldRow('Professional Title','title', r.personal.title, v=>mutate(r=>r.personal.title=v)));
  const row2=h(`<div class="row2"></div>`);
  row2.appendChild(fieldRow('Email','email', r.personal.email, v=>mutate(r=>r.personal.email=v)));
  row2.appendChild(fieldRow('Phone','phone', r.personal.phone, v=>mutate(r=>r.personal.phone=v)));
  wrap.appendChild(row2);
  const row3=h(`<div class="row2"></div>`);
  row3.appendChild(fieldRow('Location','location', r.personal.location, v=>mutate(r=>r.personal.location=v)));
  row3.appendChild(fieldRow('Website','website', r.personal.website, v=>mutate(r=>r.personal.website=v)));
  wrap.appendChild(row3);
  const row4=h(`<div class="row2"></div>`);
  row4.appendChild(fieldRow('LinkedIn','linkedin', r.personal.linkedin, v=>mutate(r=>r.personal.linkedin=v)));
  row4.appendChild(fieldRow('GitHub','github', r.personal.github, v=>mutate(r=>r.personal.github=v)));
  wrap.appendChild(row4);
  wrap.appendChild(fieldRow('Portfolio','portfolio', r.personal.portfolio, v=>mutate(r=>r.personal.portfolio=v)));

  const photoField = h(`<div class="field"><label>Profile Photo</label></div>`);
  const photoRow = h(`<div style="display:flex;gap:10px;align-items:center;"></div>`);
  const preview = h(`<div style="width:52px;height:52px;border-radius:50%;background:var(--border);background-size:cover;background-position:center;${r.photo?`background-image:url(${r.photo})`:''}"></div>`);
  const inp = h(`<input type="file" accept="image/*">`);
  inp.onchange = (e)=>{
    const f=e.target.files[0]; if(!f) return;
    if(f.size>3*1024*1024){ toast('Image too large — please use an image under 3MB.'); return; }
    const reader=new FileReader();
    reader.onload=()=>{ mutate(r=>r.photo=reader.result); renderPanel(); };
    reader.onerror=()=>toast('Could not read that image.');
    reader.readAsDataURL(f);
  };
  photoRow.appendChild(preview); photoRow.appendChild(inp);
  photoField.appendChild(photoRow); wrap.appendChild(photoField);

  const visLabel = h(`<div style="margin-top:6px;font-size:12.5px;font-weight:600;color:var(--ink-soft);">Show on resume</div>`);
  wrap.appendChild(visLabel);
  const visWrap = h(`<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;"></div>`);
  ['phone','email','website','linkedin','github'].forEach(k=>{
    const c=h(`<label class="chk"><input type="checkbox" ${r.design.visibility[k]?'checked':''}> ${k}</label>`);
    c.querySelector('input').onchange=e=>mutate(r=>r.design.visibility[k]=e.target.checked);
    visWrap.appendChild(c);
  });
  wrap.appendChild(visWrap);
}

function fieldRow(label, key, value, onInput, type){
  const f = h(`<div class="field"><label>${label}</label><input type="${type||'text'}" value="${esc(value||'')}"></div>`);
  f.querySelector('input').oninput = e=>onInput(e.target.value);
  return f;
}
function textareaField(label, value, onInput, rows){
  const f = h(`<div class="field"><label>${label}</label><textarea rows="${rows||3}">${esc(value||'')}</textarea></div>`);
  f.querySelector('textarea').oninput = e=>onInput(e.target.value);
  return f;
}

function panelSummary(){
  const r=activeResume();
  panelHeader('Professional Summary');
  const p=document.getElementById('bPanel');
  const ta = h(`<textarea rows="8" placeholder="A 2-4 sentence overview of your experience and strengths...">${esc(r.summary)}</textarea>`);
  const counter = h(`<div style="font-size:12px;color:var(--ink-soft);margin:6px 0 16px;"></div>`);
  const updateCounter=()=>{ const words = (ta.value.trim().match(/\S+/g)||[]).length; counter.textContent = `${ta.value.length} characters · ${words} words`; };
  ta.oninput = ()=>{ updateCounter(); mutate(r=>r.summary=ta.value); };
  updateCounter();
  p.appendChild(ta); p.appendChild(counter);
  const btnRow = h(`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;"></div>`);
  const aiAction=(mode)=>{
    let out = ta.value.trim();
    if(!out){ toast('Write a draft first, then ask AI to refine it.'); return; }
    if(mode==='professional') out = out.charAt(0).toUpperCase()+out.slice(1).replace(/\s+/g,' ').replace(/\bi\b/g,'I');
    if(mode==='concise') out = out.split(/(?<=[.!?])\s+/).slice(0,2).join(' ');
    if(mode==='improve') out = out.replace(/\bvery\b\s*/gi,'').replace(/\breally\b\s*/gi,'').trim();
    ta.value = out; mutate(r=>r.summary=out); updateCounter();
    toast('Applied a local demo rewrite. Connect an AI API in services/ai.js for real generation.');
  };
  ['Improve Summary','Make Professional','Make Concise'].forEach((label,i)=>{
    const b=h(`<button class="btn btn-sm">${label}</button>`);
    b.onclick=()=>aiAction(['improve','professional','concise'][i]);
    btnRow.appendChild(b);
  });
  p.appendChild(btnRow);
}

const LIST_CONFIG = {
  experience:{title:'Experience', fields:[['title','Job Title'],['company','Company'],['location','Location']], dates:true, current:true, desc:true, empty:{title:'',company:'',location:'',start:'',end:'',current:false,description:''}},
  education:{title:'Education', fields:[['degree','Degree'],['institution','Institution'],['location','Location'],['gpa','GPA']], dates:true, desc:true, empty:{degree:'',institution:'',location:'',start:'',end:'',gpa:'',description:''}},
  projects:{title:'Projects', fields:[['name','Project Name'],['tech','Technologies'],['url','URL']], dates:true, desc:true, empty:{name:'',description:'',tech:'',url:'',start:'',end:''}},
  certifications:{title:'Certifications', fields:[['name','Certification Name'],['org','Issuing Organization'],['issueDate','Issue Date'],['expDate','Expiration Date'],['credId','Credential ID'],['credUrl','Credential URL']], dates:false, desc:false, empty:{name:'',org:'',issueDate:'',expDate:'',credId:'',credUrl:''}},
  achievements:{title:'Achievements & Awards', fields:[['title','Achievement'],['org','Organization'],['date','Date']], dates:false, desc:true, empty:{title:'',org:'',date:'',description:''}},
  references:{title:'References', fields:[['name','Name'],['position','Position'],['company','Company'],['email','Email'],['phone','Phone']], dates:false, desc:false, empty:{name:'',position:'',company:'',email:'',phone:''}},
};

function panelList(key){
  const r=activeResume(); const cfg=LIST_CONFIG[key];
  const p=document.getElementById('bPanel');
  panelHeader(cfg.title, `<button class="btn btn-sm btn-primary" id="addBtn">+ Add</button>`);
  document.getElementById('addBtn').onclick = ()=>{
    mutate(r=>r[key].push(Object.assign({id:uid()}, cfg.empty)));
    renderPanel();
  };
  if(key==='references'){
    const c=h(`<label class="chk" style="margin-bottom:14px;"><input type="checkbox" ${r.referencesOnRequest?'checked':''}> Show "References available upon request" instead</label>`);
    c.querySelector('input').onchange = e=>mutate(r=>r.referencesOnRequest=e.target.checked);
    p.appendChild(c);
  }
  if(r[key].length===0){ p.appendChild(h(`<div style="color:var(--ink-soft);font-size:13.5px;">No entries yet. Click "+ Add" above.</div>`)); }
  r[key].forEach((entry, idx)=>{
    const card = h(`<div class="entry"></div>`);
    const top = h(`<div class="entry-top"><span class="tag">#${idx+1}</span><div style="display:flex;gap:4px;"></div></div>`);
    const actions = top.querySelector('div');
    if(idx>0){ const up=h(`<button class="iconbtn" title="Move up">↑</button>`); up.onclick=()=>{mutate(r=>{const a=r[key]; [a[idx-1],a[idx]]=[a[idx],a[idx-1]];}); renderPanel();}; actions.appendChild(up); }
    if(idx<r[key].length-1){ const dn=h(`<button class="iconbtn" title="Move down">↓</button>`); dn.onclick=()=>{mutate(r=>{const a=r[key]; [a[idx+1],a[idx]]=[a[idx],a[idx+1]];}); renderPanel();}; actions.appendChild(dn); }
    const dup=h(`<button class="iconbtn" title="Duplicate">⧉</button>`); dup.onclick=()=>{mutate(r=>r[key].splice(idx+1,0,Object.assign({},entry,{id:uid()}))); renderPanel();}; actions.appendChild(dup);
    const del=h(`<button class="iconbtn" title="Delete">✕</button>`); del.onclick=()=>{mutate(r=>r[key].splice(idx,1)); renderPanel();}; actions.appendChild(del);
    card.appendChild(top);

    cfg.fields.forEach(([fkey,flabel])=>{
      card.appendChild(fieldRow(flabel, fkey, entry[fkey], v=>mutate(r=>r[key][idx][fkey]=v)));
    });
    if(cfg.dates){
      const row=h(`<div class="row2"></div>`);
      row.appendChild(fieldRow('Start Date','start', entry.start, v=>mutate(r=>r[key][idx].start=v), 'month'));
      const endField = fieldRow('End Date','end', entry.end, v=>mutate(r=>r[key][idx].end=v), 'month');
      if(entry.current) endField.querySelector('input').disabled=true;
      row.appendChild(endField);
      card.appendChild(row);
    }
    if(cfg.current){
      const c=h(`<label class="chk" style="margin:4px 0 12px;"><input type="checkbox" ${entry.current?'checked':''}> Current Position</label>`);
      c.querySelector('input').onchange=e=>{ mutate(r=>r[key][idx].current=e.target.checked); renderPanel(); };
      card.appendChild(c);
    }
    if(cfg.desc){
      card.appendChild(textareaField('Description (one bullet per line)', entry.description, v=>mutate(r=>r[key][idx].description=v), 4));
    }
    p.appendChild(card);
  });
}

function panelSkills(){
  const r=activeResume(); const p=document.getElementById('bPanel');
  panelHeader('Skills', `<button class="btn btn-sm btn-primary" id="addBtn">+ Add Skill</button>`);
  document.getElementById('addBtn').onclick=()=>{ mutate(r=>r.skills.push({id:uid(),name:'',category:'General',level:'Intermediate'})); renderPanel(); };
  r.skills.forEach((s,idx)=>{
    const card=h(`<div class="entry"></div>`);
    const top=h(`<div class="entry-top"><span class="tag">#${idx+1}</span><button class="iconbtn">✕</button></div>`);
    top.querySelector('button').onclick=()=>{mutate(r=>r.skills.splice(idx,1)); renderPanel();};
    card.appendChild(top);
    const row=h(`<div class="row2"></div>`);
    row.appendChild(fieldRow('Skill Name','name', s.name, v=>mutate(r=>r.skills[idx].name=v)));
    row.appendChild(fieldRow('Category','category', s.category, v=>mutate(r=>r.skills[idx].category=v)));
    card.appendChild(row);
    const sel=h(`<div class="field"><label>Proficiency</label><select>${['Beginner','Intermediate','Advanced','Expert'].map(l=>`<option ${l===s.level?'selected':''}>${l}</option>`).join('')}</select></div>`);
    sel.querySelector('select').onchange=e=>mutate(r=>r.skills[idx].level=e.target.value);
    card.appendChild(sel);
    p.appendChild(card);
  });
  p.appendChild(h(`<div style="font-size:12px;color:var(--ink-soft);margin-top:6px;">Display style (bars, dots, tags, or text) is determined automatically by the selected template.</div>`));
}

function panelLanguages(){
  const r=activeResume(); const p=document.getElementById('bPanel');
  panelHeader('Languages', `<button class="btn btn-sm btn-primary" id="addBtn">+ Add Language</button>`);
  document.getElementById('addBtn').onclick=()=>{ mutate(r=>r.languages.push({id:uid(),name:'',level:'Fluent'})); renderPanel(); };
  r.languages.forEach((s,idx)=>{
    const card=h(`<div class="entry"></div>`);
    const top=h(`<div class="entry-top"><span class="tag">#${idx+1}</span><button class="iconbtn">✕</button></div>`);
    top.querySelector('button').onclick=()=>{mutate(r=>r.languages.splice(idx,1)); renderPanel();};
    card.appendChild(top);
    const row=h(`<div class="row2"></div>`);
    row.appendChild(fieldRow('Language','name', s.name, v=>mutate(r=>r.languages[idx].name=v)));
    const sel=h(`<div class="field"><label>Proficiency</label><select>${['Native','Fluent','Advanced','Intermediate','Basic'].map(l=>`<option ${l===s.level?'selected':''}>${l}</option>`).join('')}</select></div>`);
    sel.querySelector('select').onchange=e=>mutate(r=>r.languages[idx].level=e.target.value);
    row.appendChild(sel);
    card.appendChild(row);
    p.appendChild(card);
  });
}

function panelCustom(){
  const r=activeResume(); const p=document.getElementById('bPanel');
  if(!r.custom) r.custom=[];
  panelHeader('Custom Sections', `<button class="btn btn-sm btn-primary" id="addBtn">+ New Section</button>`);
  document.getElementById('addBtn').onclick=()=>{ mutate(r=>r.custom.push({id:uid(), title:'New Section', entries:[]})); renderPanel(); };
  r.custom.forEach((sec, sIdx)=>{
    const card=h(`<div class="entry"></div>`);
    const top=h(`<div class="entry-top" style="width:100%;"><input style="font-weight:700;flex:1;margin-right:8px;" value="${esc(sec.title)}"><button class="iconbtn">✕</button></div>`);
    top.style.display='flex'; top.style.alignItems='center';
    top.querySelector('input').oninput=e=>mutate(r=>r.custom[sIdx].title=e.target.value);
    top.querySelector('button').onclick=()=>{mutate(r=>r.custom.splice(sIdx,1)); renderPanel();};
    card.appendChild(top);
    sec.entries.forEach((en, eIdx)=>{
      const erow=h(`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:10px;"></div>`);
      erow.appendChild(fieldRow('Heading','heading', en.heading, v=>mutate(r=>r.custom[sIdx].entries[eIdx].heading=v)));
      erow.appendChild(textareaField('Details', en.detail, v=>mutate(r=>r.custom[sIdx].entries[eIdx].detail=v), 2));
      const rm=h(`<button class="btn btn-sm btn-danger">Remove entry</button>`);
      rm.onclick=()=>{mutate(r=>r.custom[sIdx].entries.splice(eIdx,1)); renderPanel();};
      erow.appendChild(rm);
      card.appendChild(erow);
    });
    const addEntry=h(`<button class="btn btn-sm" style="margin-top:10px;">+ Add Entry</button>`);
    addEntry.onclick=()=>{mutate(r=>r.custom[sIdx].entries.push({heading:'',detail:''})); renderPanel();};
    card.appendChild(addEntry);
    p.appendChild(card);
  });
}

function panelDesign(){
  const r=activeResume(); const p=document.getElementById('bPanel');
  panelHeader('Design');
  p.appendChild(h(`<div style="font-size:12.5px;font-weight:700;color:var(--ink-soft);margin:4px 0 10px;">TEMPLATE</div>`));
  const filters = h(`<div class="filterrow"></div>`);
  const cats=['All','Professional','Minimal','Executive','Creative','ATS'];
  let activeCat='All';
  cats.forEach(c=>{ const chip=h(`<div class="chip ${c==='All'?'active':''}">${c}</div>`); chip.onclick=()=>{ activeCat=c; [...filters.children].forEach(x=>x.classList.remove('active')); chip.classList.add('active'); renderTplGrid(); }; filters.appendChild(chip); });
  p.appendChild(filters);
  const grid = h(`<div class="tplgrid" style="margin-bottom:24px;"></div>`);
  p.appendChild(grid);
  function renderTplGrid(){
    grid.innerHTML='';
    TEMPLATES.filter(t=>activeCat==='All'||t.cat.includes(activeCat)).forEach(t=>{
      const card=h(`<div class="tplcard ${t.id===r.template?'active':''}"><div class="thumb"></div><div class="lbl"><span>${t.name}</span></div></div>`);
      card.querySelector('.thumb').innerHTML = `<div class="page">${renderTemplate(r, t.id)}</div>`;
      card.onclick=()=>{ mutate(r=>r.template=t.id); renderPanel(); };
      grid.appendChild(card);
    });
  }
  renderTplGrid();

  p.appendChild(h(`<div style="font-size:12.5px;font-weight:700;color:var(--ink-soft);margin:4px 0 10px;">TYPOGRAPHY</div>`));
  const fontSel=h(`<div class="field"><label>Font Family</label><select>${FONTS.map(f=>`<option ${f===r.design.font?'selected':''}>${f}</option>`).join('')}</select></div>`);
  fontSel.querySelector('select').onchange=e=>mutate(r=>r.design.font=e.target.value);
  p.appendChild(fontSel);
  const sizeRow=h(`<div class="field"><label>Font Size</label><div class="filterrow" id="sizeRow"></div></div>`);
  p.appendChild(sizeRow);
  ['small','medium','large'].forEach(sz=>{
    const chip=h(`<div class="chip ${sz===r.design.fontSize?'active':''}">${sz}</div>`);
    chip.onclick=()=>{ mutate(r=>r.design.fontSize=sz); renderPanel(); };
    sizeRow.querySelector('#sizeRow').appendChild(chip);
  });

  p.appendChild(h(`<div style="font-size:12.5px;font-weight:700;color:var(--ink-soft);margin:16px 0 10px;">COLOR</div>`));
  const swrow=h(`<div class="swrow"></div>`);
  Object.entries(PALETTES).forEach(([name,hex])=>{
    const sw=h(`<span class="swatch ${hex===r.design.color?'active':''}" title="${name}" style="background:${hex}"></span>`);
    sw.onclick=()=>{ mutate(r=>r.design.color=hex); renderPanel(); };
    swrow.appendChild(sw);
  });
  const custom=h(`<input type="color" value="${r.design.color}" style="width:38px;height:26px;padding:0;border:none;">`);
  custom.oninput=e=>mutate(r=>r.design.color=e.target.value);
  swrow.appendChild(custom);
  p.appendChild(swrow);

  p.appendChild(h(`<div style="font-size:12.5px;font-weight:700;color:var(--ink-soft);margin:6px 0 10px;">LAYOUT</div>`));
  p.appendChild(sliderField('Page Margins', r.design.margin, 8, 32, v=>mutate(r=>r.design.margin=v)));
  p.appendChild(sliderField('Section Spacing', r.design.sectionSpacing, 8, 40, v=>mutate(r=>r.design.sectionSpacing=v)));
  p.appendChild(sliderField('Line Spacing', r.design.lineSpacing*100, 100, 200, v=>mutate(r=>r.design.lineSpacing=v/100), '%'));

  p.appendChild(h(`<div style="font-size:12.5px;font-weight:700;color:var(--ink-soft);margin:16px 0 10px;">SECTION ORDER</div>`));
  const order=h(`<div></div>`);
  r.design.sectionOrder.forEach((sec,idx)=>{
    const row=h(`<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;border:1px solid var(--border);border-radius:8px;margin-bottom:6px;font-size:13px;"><span style="flex:1;text-transform:capitalize;">${sec}</span></div>`);
    if(idx>0){ const up=h(`<button class="iconbtn">↑</button>`); up.onclick=()=>{mutate(r=>{const a=r.design.sectionOrder;[a[idx-1],a[idx]]=[a[idx],a[idx-1]];}); renderPanel();}; row.appendChild(up); }
    if(idx<r.design.sectionOrder.length-1){ const dn=h(`<button class="iconbtn">↓</button>`); dn.onclick=()=>{mutate(r=>{const a=r.design.sectionOrder;[a[idx+1],a[idx]]=[a[idx],a[idx+1]];}); renderPanel();}; row.appendChild(dn); }
    order.appendChild(row);
  });
  p.appendChild(order);

  p.appendChild(h(`<div style="font-size:12.5px;font-weight:700;color:var(--ink-soft);margin:16px 0 10px;">VISIBILITY</div>`));
  const visWrap=h(`<div style="display:flex;flex-wrap:wrap;gap:12px;"></div>`);
  Object.keys(r.design.visibility).forEach(k=>{
    const c=h(`<label class="chk"><input type="checkbox" ${r.design.visibility[k]?'checked':''}> ${k}</label>`);
    c.querySelector('input').onchange=e=>mutate(r=>r.design.visibility[k]=e.target.checked);
    visWrap.appendChild(c);
  });
  p.appendChild(visWrap);
}
function sliderField(label,val,min,max,onInput,suffix){
  const f=h(`<div class="field"><label>${label}: <span class="valLbl">${Math.round(val)}${suffix||'px'}</span></label><input type="range" min="${min}" max="${max}" value="${val}"></div>`);
  f.querySelector('input').oninput=e=>{ f.querySelector('.valLbl').textContent=e.target.value+(suffix||'px'); onInput(Number(e.target.value)); };
  return f;
}

function panelATS(){
  const r=activeResume(); const p=document.getElementById('bPanel');
  panelHeader('ATS Checker');
  const {score, issues} = computeATS(r);
  const box=h(`<div class="scorebox"><div style="display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:12px;color:var(--ink-soft);">ATS Score</div><div class="big">${score}/100</div></div></div><div class="progress"><div style="width:${score}%;background:${score>=80?'var(--success)':score>=55?'var(--warn)':'var(--danger)'}"></div></div></div>`);
  p.appendChild(box);
  const complete = computeCompleteness(r);
  p.appendChild(h(`<div style="font-size:12.5px;font-weight:700;color:var(--ink-soft);margin:16px 0 8px;">RESUME STRENGTH — ${complete.overall}%</div>`));
  complete.parts.forEach(part=>{
    p.appendChild(h(`<div style="margin-bottom:10px;"><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:4px;"><span>${part.label}</span><span>${part.pct}%</span></div><div class="progress"><div style="width:${part.pct}%"></div></div></div>`));
  });
  p.appendChild(h(`<div style="font-size:12.5px;font-weight:700;color:var(--ink-soft);margin:18px 0 4px;">SUGGESTIONS</div>`));
  if(issues.length===0) p.appendChild(h(`<div class="suggestion">Looks solid — no major issues detected.</div>`));
  issues.forEach(i=> p.appendChild(h(`<div class="suggestion">${esc(i)}</div>`)) );
}
function computeATS(r){
  let score=100; const issues=[];
  if(!r.personal.email){ score-=10; issues.push('Add an email address so recruiters can reach you.'); }
  if(!r.personal.phone){ score-=6; issues.push('Add a phone number.'); }
  if(!r.summary || r.summary.split(/\s+/).length<15){ score-=12; issues.push('Your professional summary is too short — aim for 2-4 sentences.'); }
  if(r.experience.length===0){ score-=20; issues.push('Add at least one work experience entry.'); }
  else {
    const noMetrics = r.experience.every(e=>!/\d/.test(e.description||''));
    if(noMetrics){ score-=10; issues.push('Add measurable achievements to your experience (numbers, %, $).'); }
  }
  if(r.skills.length<5){ score-=8; issues.push('Consider adding more relevant skills (aim for 5+).'); }
  if(r.education.length===0){ score-=8; issues.push('Add at least one education entry.'); }
  if(r.photo){ issues.push('Photos are ignored by most ATS parsers — fine for creative roles, risky for corporate ATS screening.'); }
  const totalWords = (r.summary||'').split(/\s+/).length + r.experience.reduce((a,e)=>a+((e.description||'').split(/\s+/).length),0);
  if(totalWords>900){ score-=6; issues.push('Resume content is long — consider trimming to fit 1-2 pages.'); }
  score = Math.max(0, Math.min(100, score));
  return {score, issues};
}
function computeCompleteness(r){
  const parts = [
    {label:'Personal Information', pct: pct([r.personal.fullName, r.personal.title, r.personal.email, r.personal.phone])},
    {label:'Summary', pct: r.summary && r.summary.length>40 ? 100 : r.summary ? 40 : 0},
    {label:'Experience', pct: Math.min(100, r.experience.length*50)},
    {label:'Education', pct: Math.min(100, r.education.length*100)},
    {label:'Skills', pct: Math.min(100, r.skills.length*20)},
    {label:'Projects', pct: Math.min(100, r.projects.length*50)},
  ];
  const overall = Math.round(parts.reduce((a,p)=>a+p.pct,0)/parts.length);
  return {overall, parts};
}
function pct(arr){ const filled = arr.filter(x=>x && x.trim && x.trim().length>0).length; return Math.round(filled/arr.length*100); }

function panelSettings(){
  const r=activeResume(); const p=document.getElementById('bPanel');
  panelHeader('Settings');
  p.appendChild(h(`<div style="font-size:12.5px;font-weight:700;color:var(--ink-soft);margin:4px 0 10px;">APPEARANCE</div>`));
  const themeRow=h(`<div class="filterrow"></div>`);
  ['Light','Dark','System'].forEach(t=>{
    const chip=h(`<div class="chip ${((darkPref==='dark'&&t==='Dark')||(darkPref==='light'&&t==='Light')||(darkPref==='system'&&t==='System'))?'active':''}">${t}</div>`);
    chip.onclick=()=>{ setTheme(t.toLowerCase()); renderPanel(); };
    themeRow.appendChild(chip);
  });
  p.appendChild(themeRow);

  p.appendChild(h(`<div style="font-size:12.5px;font-weight:700;color:var(--ink-soft);margin:18px 0 10px;">DATA MANAGEMENT</div>`));
  const row=h(`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;"></div>`);
  const exp=h(`<button class="btn btn-sm">Export This Resume (JSON)</button>`); exp.onclick=()=>exportSingleJSON(r.id); row.appendChild(exp);
  const expAll=h(`<button class="btn btn-sm">Export All Resumes</button>`); expAll.onclick=exportAllJSON; row.appendChild(expAll);
  const imp=h(`<label class="btn btn-sm">Import JSON<input type="file" accept="application/json" style="display:none"></label>`);
  imp.querySelector('input').onchange=importJSON; row.appendChild(imp);
  p.appendChild(row);
  const resetBtn=h(`<button class="btn btn-sm btn-danger">Reset This Resume</button>`);
  resetBtn.onclick=()=>{ if(confirm('Clear all data in this resume?')){ mutate(r=>Object.assign(r, blankResume(r.name))); renderPanel(); } };
  p.appendChild(resetBtn);

  p.appendChild(h(`<div style="font-size:12.5px;font-weight:700;color:var(--ink-soft);margin:20px 0 8px;">ABOUT</div>`));
  p.appendChild(h(`<div style="font-size:13px;color:var(--ink-soft);line-height:1.6;">ResumeAI is a modern resume-building platform designed to make professional CV creation simple, beautiful and accessible.<br><br>Created by <strong>Muhammad Sulieman Khan</strong></div>`));
}

function setTheme(mode){
  darkPref = mode;
  localStorage.setItem('resumeai_theme', mode);
  const isDark = mode==='dark' || (mode==='system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.body.classList.toggle('dark', isDark);
}
function toggleDark(){ setTheme(document.body.classList.contains('dark') ? 'light':'dark'); if(activeSectionUI==='settings') renderPanel(); }

/* ---------------- preview & templates ---------------- */
function renderPreview(){
  const r = activeResume(); if(!r) return;
  document.getElementById('page').innerHTML = renderTemplate(r, r.template);
  document.getElementById('atsMini').textContent = 'ATS ' + computeATS(r).score + '/100';
}
function zoom(delta){ zoomLevel = Math.max(0.3, Math.min(1.4, zoomLevel+delta)); applyZoom(); }
function applyZoom(){ document.getElementById('page').style.transform = `scale(${zoomLevel})`; document.getElementById('zoomLabel').textContent = Math.round(zoomLevel*100)+'%'; }
function fitZoom(){ const avail = document.querySelector('.b-preview').clientWidth - 40; zoomLevel = Math.min(1, avail/794); applyZoom(); }
window.addEventListener('resize', ()=>{ if(document.getElementById('view-builder').style.display!=='none') fitZoom(); });

function esc(s){ return (s||'').toString().replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function fmtDate(s){ if(!s) return ''; const [y,m]=s.split('-'); const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return m ? `${months[Number(m)-1]} ${y}` : y; }
function dateRange(e){ return `${fmtDate(e.start)} — ${e.current?'Present':fmtDate(e.end)}`; }
function bullets(desc){ return (desc||'').split('\n').filter(l=>l.trim()).map(l=>`<li>${esc(l)}</li>`).join(''); }

const SECTION_TITLES = {summary:'Summary', experience:'Experience', education:'Education', skills:'Skills', projects:'Projects', certifications:'Certifications', languages:'Languages', achievements:'Achievements', references:'References', custom:'Additional'};

function skillMarkup(skills, style, color){
  const levelPct = {Beginner:35,Intermediate:60,Advanced:80,Expert:96};
  if(style==='bars') return skills.map(s=>`<div style="margin-bottom:7px;"><div style="display:flex;justify-content:space-between;font-size:10.5px;margin-bottom:2px;"><span>${esc(s.name)}</span></div><div class="skillbar-outer"><div class="skillbar-inner" style="width:${levelPct[s.level]}%;background:${color}"></div></div></div>`).join('');
  if(style==='dots') return skills.map(s=>{const n=Math.round(levelPct[s.level]/25);return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;font-size:10.5px;"><span>${esc(s.name)}</span><span>${[1,2,3,4].map(i=>`<span style="display:inline-block;width:6px;height:6px;border-radius:50%;margin-left:2px;background:${i<=n?color:'#ddd'}"></span>`).join('')}</span></div>`;}).join('');
  if(style==='tags') return `<div style="display:flex;flex-wrap:wrap;gap:5px;">${skills.map(s=>`<span style="border:1px solid ${color}66;color:${color};padding:3px 9px;border-radius:20px;font-size:10px;">${esc(s.name)}</span>`).join('')}</div>`;
  return `<div style="font-size:10.5px;line-height:1.9;">${skills.map(s=>esc(s.name)).join(' · ')}</div>`;
}

function buildSectionsHTML(r, opts){
  // opts: {skillStyle, color, headingStyle:fn(title)=>html, wrapEntry:fn}
  const v = r.design.visibility;
  const parts = {};
  parts.summary = r.summary ? `<p style="margin:0;line-height:${r.design.lineSpacing};">${esc(r.summary)}</p>` : '';
  parts.experience = r.experience.map(e=>`
    <div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;"><strong style="font-size:12.5px;">${esc(e.title)}</strong><span style="font-size:10px;color:#666;">${dateRange(e)}</span></div>
      <div style="font-size:11px;color:#555;margin-bottom:4px;">${esc(e.company)}${e.location?' · '+esc(e.location):''}</div>
      <ul style="margin:0;padding-left:16px;font-size:11px;line-height:${r.design.lineSpacing};">${bullets(e.description)}</ul>
    </div>`).join('');
  parts.education = r.education.map(e=>`
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;"><strong style="font-size:12.5px;">${esc(e.degree)}</strong><span style="font-size:10px;color:#666;">${dateRange(e)}</span></div>
      <div style="font-size:11px;color:#555;">${esc(e.institution)}${e.location?' · '+esc(e.location):''}${(v.gpa&&e.gpa)?' · GPA '+esc(e.gpa):''}</div>
      ${e.description?`<div style="font-size:11px;margin-top:3px;">${esc(e.description)}</div>`:''}
    </div>`).join('');
  parts.skills = r.skills.length ? skillMarkup(r.skills, opts.skillStyle, opts.color) : '';
  parts.projects = r.projects.map(p=>`
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;"><strong style="font-size:12.5px;">${esc(p.name)}</strong><span style="font-size:10px;color:#666;">${p.start?dateRange(p):''}</span></div>
      ${p.tech?`<div style="font-size:10.5px;color:#666;">${esc(p.tech)}</div>`:''}
      <div style="font-size:11px;margin-top:2px;">${esc(p.description)}</div>
      ${p.url?`<div style="font-size:10px;color:${opts.color};">${esc(p.url)}</div>`:''}
    </div>`).join('');
  parts.certifications = r.certifications.map(c=>`
    <div style="margin-bottom:8px;font-size:11px;"><strong>${esc(c.name)}</strong> — ${esc(c.org)} ${c.issueDate?'· '+fmtDate(c.issueDate):''}${c.credId?`<div style="font-size:10px;color:#666;">ID: ${esc(c.credId)}</div>`:''}</div>`).join('');
  parts.languages = r.languages.length ? `<div style="font-size:11px;line-height:1.9;">${r.languages.map(l=>`${esc(l.name)} — ${esc(l.level)}`).join('<br>')}</div>` : '';
  parts.achievements = r.achievements.map(a=>`<div style="margin-bottom:8px;font-size:11px;"><strong>${esc(a.title)}</strong>${a.org?' — '+esc(a.org):''} ${a.date?'· '+fmtDate(a.date):''}${a.description?`<div style="font-size:10.5px;color:#555;">${esc(a.description)}</div>`:''}</div>`).join('');
  if(v.references){
    parts.references = r.referencesOnRequest ? `<div style="font-size:11px;">References available upon request.</div>` :
      r.references.map(rf=>`<div style="margin-bottom:6px;font-size:11px;"><strong>${esc(rf.name)}</strong>${rf.position?', '+esc(rf.position):''}${rf.company?' — '+esc(rf.company):''}<div style="font-size:10px;color:#666;">${esc(rf.email)} ${rf.phone?'· '+esc(rf.phone):''}</div></div>`).join('');
  } else parts.references='';
  parts.custom = (r.custom||[]).map(sec=>`<div style="margin-bottom:8px;"><strong style="font-size:11.5px;">${esc(sec.title)}</strong>${sec.entries.map(en=>`<div style="font-size:11px;margin-top:3px;"><em>${esc(en.heading)}</em> ${en.detail?'— '+esc(en.detail):''}</div>`).join('')}</div>`).join('');
  return parts;
}

function renderTemplate(r, tid){
  const color = r.design.color;
  const fs = {small:'10.5px',medium:'11.5px',large:'12.5px'}[r.design.fontSize] || '11.5px';
  const margin = r.design.margin;
  const font = `'${r.design.font}',sans-serif`;
  const v = r.design.visibility;
  const contactBits = [];
  if(v.email && r.personal.email) contactBits.push(r.personal.email);
  if(v.phone && r.personal.phone) contactBits.push(r.personal.phone);
  if(r.personal.location) contactBits.push(r.personal.location);
  if(v.website && r.personal.website) contactBits.push(r.personal.website);
  if(v.linkedin && r.personal.linkedin) contactBits.push(r.personal.linkedin);
  if(v.github && r.personal.github) contactBits.push(r.personal.github);
  const photoHTML = (v.photo && r.photo) ? `<img src="${r.photo}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;flex-shrink:0;">` : '';

  const skillStyleByTpl = {classic:'text',minimal:'text',executive:'bars',sidebar:'bars',timeline:'tags',swiss:'dots',compact:'text',creative:'tags'};
  const sections = buildSectionsHTML(r, {skillStyle: skillStyleByTpl[tid]||'text', color});
  const order = r.design.sectionOrder.filter(s=>sections[s] && sections[s].trim());

  const sectionBlock = (key, headStyle)=>{
    const title = SECTION_TITLES[key];
    if(!sections[key] || !sections[key].trim()) return '';
    const head = headStyle==='rule'
      ? `<div style="font-size:11.5px;font-weight:700;letter-spacing:.06em;color:${color};border-bottom:1.5px solid ${color};padding-bottom:3px;margin-bottom:8px;">${title.toUpperCase()}</div>`
      : headStyle==='simple'
      ? `<div style="font-size:12.5px;font-weight:700;margin-bottom:8px;">${title}</div>`
      : headStyle==='side'
      ? `<div style="font-size:10.5px;font-weight:700;letter-spacing:.08em;color:${color};margin-bottom:8px;">${title.toUpperCase()}</div>`
      : `<div style="font-size:12px;font-weight:600;color:${color};margin-bottom:8px;">${title}</div>`;
    return `<div style="margin-bottom:${r.design.sectionSpacing}px;">${head}${sections[key]}</div>`;
  };

  const base = `font-family:${font};font-size:${fs};color:#1c1c1c;padding:${margin}mm;box-sizing:border-box;width:210mm;min-height:297mm;`;

  if(tid==='minimal'){
    return `<div style="${base}">
      <div style="margin-bottom:${r.design.sectionSpacing+6}px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:26px;font-weight:600;letter-spacing:-.01em;">${esc(r.personal.fullName)}</div>
          <div style="font-size:13px;color:${color};margin-top:2px;">${esc(r.personal.title)}</div>
          <div style="font-size:10px;color:#777;margin-top:8px;">${contactBits.join('   ·   ')}</div>
        </div>
        ${photoHTML?`<div>${photoHTML}</div>`:''}
      </div>
      ${order.map(k=>sectionBlock(k,'simple')).join('')}
    </div>`;
  }
  if(tid==='executive'){
    return `<div style="${base}padding:0;">
      <div style="background:${color};color:#fff;padding:${margin}mm ${margin}mm 20px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:26px;font-weight:700;">${esc(r.personal.fullName)}</div>
          <div style="font-size:13px;opacity:.9;margin-top:2px;">${esc(r.personal.title)}</div>
          <div style="font-size:10px;opacity:.85;margin-top:10px;">${contactBits.join('   ·   ')}</div>
        </div>
        ${photoHTML?`<div style="border:2px solid #fff;border-radius:50%;overflow:hidden;width:64px;height:64px;">${photoHTML.replace('style="','style="width:100%;height:100%;')}</div>`:''}
      </div>
      <div style="padding:20px ${margin}mm ${margin}mm;">
        ${order.map(k=>sectionBlock(k,'rule')).join('')}
      </div>
    </div>`;
  }
  if(tid==='sidebar'){
    const left = ['skills','languages','certifications'].filter(k=>order.includes(k));
    const right = order.filter(k=>!left.includes(k));
    return `<div style="${base}padding:0;display:flex;">
      <div style="width:34%;background:#1d2130;color:#eee;padding:${margin}mm 16px;">
        ${photoHTML?`<div style="margin-bottom:14px;">${photoHTML}</div>`:''}
        <div style="font-size:17px;font-weight:700;line-height:1.25;">${esc(r.personal.fullName)}</div>
        <div style="font-size:11px;color:${color};margin-top:3px;">${esc(r.personal.title)}</div>
        <div style="font-size:9.5px;color:#bbb;margin-top:14px;line-height:2;">${contactBits.join('<br>')}</div>
        ${left.map(k=>`<div style="margin-top:18px;"><div style="font-size:10px;font-weight:700;letter-spacing:.08em;color:${color};margin-bottom:8px;">${SECTION_TITLES[k].toUpperCase()}</div><div style="color:#eee;">${sections[k].replace(/color:#666/g,'color:#bbb').replace(/color:#555/g,'color:#ccc')}</div></div>`).join('')}
      </div>
      <div style="flex:1;padding:${margin}mm 20px;">
        ${right.map(k=>sectionBlock(k,'side')).join('')}
      </div>
    </div>`;
  }
  if(tid==='timeline'){
    const timelineEntries = (r.experience.concat(r.education.map(e=>({title:e.degree,company:e.institution,start:e.start,end:e.end,current:false,description:e.description})))).sort((a,b)=>(b.start||'').localeCompare(a.start||''));
    const tl = timelineEntries.map(e=>`<div style="position:relative;padding-left:20px;border-left:2px solid ${color}55;padding-bottom:16px;">
      <div style="position:absolute;left:-6px;top:2px;width:10px;height:10px;border-radius:50%;background:${color};"></div>
      <div style="font-size:10px;color:#777;">${dateRange(e)}</div>
      <div style="font-size:12.5px;font-weight:700;margin-top:1px;">${esc(e.title)}</div>
      <div style="font-size:11px;color:#555;margin-bottom:4px;">${esc(e.company)}</div>
      <ul style="margin:0;padding-left:14px;font-size:11px;">${bullets(e.description)}</ul>
    </div>`).join('');
    return `<div style="${base}">
      <div style="text-align:center;margin-bottom:${r.design.sectionSpacing+8}px;">
        ${photoHTML?`<div style="margin-bottom:12px;display:flex;justify-content:center;">${photoHTML}</div>`:''}
        <div style="font-size:25px;font-weight:700;">${esc(r.personal.fullName)}</div>
        <div style="font-size:13px;color:${color};">${esc(r.personal.title)}</div>
        <div style="font-size:10px;color:#777;margin-top:8px;">${contactBits.join('   ·   ')}</div>
      </div>
      ${sections.summary?`<div style="margin-bottom:${r.design.sectionSpacing}px;">${sections.summary}</div>`:''}
      <div style="font-size:11.5px;font-weight:700;letter-spacing:.06em;color:${color};margin-bottom:10px;">TIMELINE</div>
      ${tl}
      ${['skills','projects','certifications','languages','achievements','references','custom'].filter(k=>order.includes(k)).map(k=>sectionBlock(k,'simple')).join('')}
    </div>`;
  }
  if(tid==='swiss'){
    return `<div style="${base}">
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;border-bottom:3px solid #111;padding-bottom:14px;margin-bottom:${r.design.sectionSpacing}px;">
        <div style="display:flex;align-items:center;gap:15px;">
          ${photoHTML?`<div>${photoHTML}</div>`:''}
          <div><div style="font-size:30px;font-weight:600;letter-spacing:-.02em;line-height:1;">${esc(r.personal.fullName)}</div><div style="font-size:12px;color:${color};margin-top:6px;">${esc(r.personal.title)}</div></div>
        </div>
        <div style="font-size:9.5px;font-family:'JetBrains Mono',monospace;color:#555;line-height:1.9;text-align:right;">${contactBits.join('<br>')}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 2fr;gap:26px;">
        <div>${['skills','languages','certifications','achievements'].filter(k=>order.includes(k)).map(k=>`<div style="margin-bottom:${r.design.sectionSpacing}px;"><div style="font-size:9.5px;font-family:'JetBrains Mono',monospace;font-weight:700;letter-spacing:.05em;color:#111;margin-bottom:8px;">${SECTION_TITLES[k].toUpperCase()}</div>${sections[k]}</div>`).join('')}</div>
        <div>${['summary','experience','education','projects','references','custom'].filter(k=>order.includes(k)).map(k=>`<div style="margin-bottom:${r.design.sectionSpacing}px;"><div style="font-size:9.5px;font-family:'JetBrains Mono',monospace;font-weight:700;letter-spacing:.05em;color:#111;margin-bottom:8px;">${SECTION_TITLES[k].toUpperCase()}</div>${sections[k]}</div>`).join('')}</div>
      </div>
    </div>`;
  }
  if(tid==='compact'){
    return `<div style="${base}font-size:10px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid #ccc;padding-bottom:8px;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:10px;">
          ${photoHTML?`<div style="width:36px;height:36px;border-radius:50%;overflow:hidden;">${photoHTML.replace('width:64px;height:64px;','width:100%;height:100%;')}</div>`:''}
          <div><span style="font-size:17px;font-weight:700;">${esc(r.personal.fullName)}</span> <span style="font-size:11px;color:${color};">— ${esc(r.personal.title)}</span></div>
        </div>
        <div style="font-size:9px;color:#666;">${contactBits.join(' · ')}</div>
      </div>
      ${order.map(k=>`<div style="margin-bottom:10px;"><div style="font-size:10.5px;font-weight:700;color:${color};border-bottom:1px solid #ddd;padding-bottom:2px;margin-bottom:5px;">${SECTION_TITLES[k]}</div>${sections[k]}</div>`).join('')}
    </div>`;
  }
  if(tid==='creative'){
    return `<div style="${base}padding:0;">
      <div style="background:linear-gradient(120deg, ${color}, ${color}cc);color:#fff;padding:${margin}mm;display:flex;gap:16px;align-items:center;">
        ${photoHTML?`<div style="border:3px solid #fff;border-radius:50%;">${photoHTML}</div>`:''}
        <div><div style="font-size:25px;font-weight:700;">${esc(r.personal.fullName)}</div><div style="font-size:13px;opacity:.92;">${esc(r.personal.title)}</div><div style="font-size:9.5px;opacity:.85;margin-top:8px;">${contactBits.join('  ·  ')}</div></div>
      </div>
      <div style="padding:18px ${margin}mm ${margin}mm;">
        ${order.map(k=>`<div style="margin-bottom:${r.design.sectionSpacing}px;"><div style="display:inline-block;font-size:11px;font-weight:700;color:#fff;background:${color};padding:3px 12px;border-radius:20px;margin-bottom:8px;">${SECTION_TITLES[k]}</div>${sections[k]}</div>`).join('')}
      </div>
    </div>`;
  }
  // classic (default)
  return `<div style="${base}">
    <div style="text-align:center;border-bottom:2px solid #222;padding-bottom:12px;margin-bottom:${r.design.sectionSpacing}px;">
      ${photoHTML?`<div style="margin-bottom:10px;display:flex;justify-content:center;">${photoHTML}</div>`:''}
      <div style="font-family:'${r.design.font==='Inter'?'Playfair Display':r.design.font}',serif;font-size:24px;font-weight:700;letter-spacing:.02em;">${esc(r.personal.fullName)}</div>
      <div style="font-size:12.5px;color:${color};margin-top:3px;">${esc(r.personal.title)}</div>
      <div style="font-size:10px;color:#666;margin-top:8px;">${contactBits.join('   |   ')}</div>
    </div>
    ${order.map(k=>sectionBlock(k,'rule')).join('')}
  </div>`;
}

/* ---------------- template showcase (landing) ---------------- */
function buildLandingExtras(){
  const featGrid = document.getElementById('featGrid');
  const feats = [
    ['🗂️','20+ Templates','Distinct layouts, not just recolored copies.'],
    ['⚡','Real-Time Preview','See your resume update as you type.'],
    ['⬇️','PDF Export','A real, working, print-ready download.'],
    ['🧠','Smart Formatting','Automatic page flow and consistent spacing.'],
    ['🎛️','Easy Customization','Fonts, colors, spacing, section order.'],
    ['📱','Mobile Friendly','Build and review from any device.'],
    ['🗃️','Multiple Resumes','Tailor a version for every role.'],
    ['💾','Local Saving','Autosaves to your browser — no account needed.'],
  ];
  feats.forEach(([icon,title,desc])=>{
    featGrid.appendChild(h(`<div class="fcard"><div class="ficon">${icon}</div><h3>${title}</h3><p>${desc}</p></div>`));
  });
  const tplShow = document.getElementById('tplShowcase');
  const demo = sampleResume();
  TEMPLATES.forEach(t=>{
    const card = h(`<div class="tplmini"></div>`);
    card.innerHTML = `<div style="transform:scale(.24);transform-origin:top left;width:416%;">${renderTemplate(demo, t.id)}</div><div class="name">${t.name}</div>`;
    tplShow.appendChild(card);
  });
}

/* ---------------- export / import ---------------- */
function exportSingleJSON(id){
  const r = STATE.resumes.find(x=>x.id===id);
  downloadBlob(JSON.stringify(r, null, 2), (r.name||'resume').replace(/\s+/g,'_')+'.json', 'application/json');
  toast('Exported '+r.name);
}
function exportAllJSON(){
  downloadBlob(JSON.stringify(STATE, null, 2), 'resumeai_backup.json', 'application/json');
  toast('Exported all resumes');
}
function downloadBlob(content, filename, type){
  const blob = new Blob([content], {type});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
}
function importJSON(evt){
  const file = evt.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const data = JSON.parse(reader.result);
      if(data.resumes){ data.resumes.forEach(r=>{ r.id = uid(); STATE.resumes.push(r); }); toast('Imported '+data.resumes.length+' resume(s)'); }
      else if(data.personal){ data.id = uid(); STATE.resumes.push(data); toast('Imported resume'); }
      else { toast('That JSON file was not recognized as ResumeAI data.'); return; }
      persist(false);
      if(document.getElementById('view-dashboard').style.display!=='none') renderDashboard();
    }catch(e){ toast('Import failed — invalid JSON file.'); }
  };
  reader.readAsText(file);
  evt.target.value='';
}

/* ---------------- PDF / Print ---------------- */
function doPrint(){
  const root = document.getElementById('printRoot');
  root.innerHTML = `<div class="page" style="transform:none;">${document.getElementById('page').innerHTML}</div>`;
  window.print();
}
function downloadPDF(){
  const r = activeResume();
  const clone = document.getElementById('page').cloneNode(true);
  clone.style.transform='none'; clone.style.boxShadow='none'; clone.style.margin='0';
  const container = document.createElement('div');
  container.appendChild(clone);
  toast('Generating PDF…');
  html2pdf().set({
    margin:0, filename:(r.name||'resume').replace(/\s+/g,'_')+'.pdf',
    image:{type:'jpeg',quality:0.98},
    html2canvas:{scale:2, useCORS:true},
    jsPDF:{unit:'mm', format:'a4', orientation:'portrait'},
    pagebreak:{mode:['css','legacy']}
  }).from(container).save().then(()=>toast('PDF downloaded')).catch(()=>toast('PDF export failed — try Print instead.'));
}

/* ---------------- command palette ---------------- */
function openCommandPalette(){
  const commands = [
    {label:'New Resume', action:()=>{goDashboard(); createResume();}, kbd:''},
    {label:'Open Templates', action:()=>{activeSectionUI='design'; renderSidebar(); renderPanel();}, kbd:''},
    {label:'Design', action:()=>{activeSectionUI='design'; renderSidebar(); renderPanel();}, kbd:''},
    {label:'Export PDF', action:downloadPDF, kbd:'⌘⇧E'},
    {label:'Print', action:doPrint, kbd:'⌘P'},
    {label:'Settings', action:()=>{activeSectionUI='settings'; renderSidebar(); renderPanel();}, kbd:''},
    {label:'Toggle Dark Mode', action:toggleDark, kbd:''},
    {label:'Back to Dashboard', action:goDashboard, kbd:''},
    {label:'Undo', action:undo, kbd:'⌘Z'},
    {label:'Redo', action:redo, kbd:'⌘⇧Z'},
  ];
  const bg = h(`<div class="modal-bg"><div class="modal"><input class="cp-input" placeholder="Type a command…"><div class="cp-list"></div></div></div>`);
  document.body.appendChild(bg);
  const input = bg.querySelector('.cp-input'); const list = bg.querySelector('.cp-list');
  let sel=0;
  function renderList(filter){
    list.innerHTML='';
    const items = commands.filter(c=>c.label.toLowerCase().includes(filter.toLowerCase()));
    items.forEach((c,i)=>{
      const it = h(`<div class="cp-item ${i===sel?'sel':''}"><span>${c.label}</span><kbd>${c.kbd}</kbd></div>`);
      it.onclick=()=>{ c.action(); close(); };
      list.appendChild(it);
    });
    return items;
  }
  let items = renderList('');
  input.oninput=()=>{ sel=0; items=renderList(input.value); };
  function close(){ bg.remove(); document.removeEventListener('keydown', keyHandler); }
  function keyHandler(e){
    if(e.key==='Escape'){ close(); }
    if(e.key==='ArrowDown'){ e.preventDefault(); sel=Math.min(items.length-1, sel+1); items=renderList(input.value); }
    if(e.key==='ArrowUp'){ e.preventDefault(); sel=Math.max(0, sel-1); items=renderList(input.value); }
    if(e.key==='Enter'){ if(items[sel]){ items[sel].action(); close(); } }
  }
  document.addEventListener('keydown', keyHandler);
  bg.onclick=(e)=>{ if(e.target===bg) close(); };
  setTimeout(()=>input.focus(), 30);
}

document.addEventListener('keydown', (e)=>{
  const mod = e.ctrlKey || e.metaKey;
  if(mod && e.key.toLowerCase()==='k'){ e.preventDefault(); openCommandPalette(); }
  if(mod && e.key.toLowerCase()==='s'){ e.preventDefault(); persist(); toast('Saved'); }
  if(mod && e.key.toLowerCase()==='p' && document.getElementById('view-builder').style.display!=='none'){ e.preventDefault(); doPrint(); }
  if(mod && !e.shiftKey && e.key.toLowerCase()==='z'){ e.preventDefault(); undo(); }
  if(mod && e.shiftKey && e.key.toLowerCase()==='z'){ e.preventDefault(); redo(); }
});

/* ---------------- init ---------------- */
buildLandingExtras();
showView('landing'); 

/* ---------------- Mobile Responsive Layout ---------------- */
function setupMobileLayout() {
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      /* Hide elements based on mode */
      .mobile-hide-sidebar #bSidebar { display: none !important; }
      .mobile-hide-panel #bPanel { display: none !important; }
      .mobile-hide-preview .b-preview { display: none !important; }

      /* Hamburger Header */
      #mobHeader {
        display: flex; justify-content: flex-start; align-items: center; gap: 16px;
        padding: 12px 20px; background: var(--bg-panel, #ffffff); 
        border-bottom: 1px solid var(--border, #dddddd);
        position: sticky; top: 0; z-index: 9998;
      }
      .dark #mobHeader { background: #1a1a1a; border-bottom: 1px solid #333; }
      
      /* Fullscreen menu overlay */
      #mobMenuOverlay {
        display: none; position: fixed; top: 51px; left: 0; right: 0; bottom: 0;
        background: var(--bg-panel, #fff); z-index: 9999; flex-direction: column; padding: 20px;
      }
      .dark #mobMenuOverlay { background: #1a1a1a; }
      #mobMenuOverlay.active { display: flex; }
      .mob-menu-link {
        padding: 16px; font-size: 16px; font-weight: 600; border-bottom: 1px solid var(--border, #ddd);
        color: var(--ink, #111); text-decoration: none; cursor: pointer;
      }
      .dark .mob-menu-link { color: #eee; border-color: #333; }

      /* Floating Back to Editor button (only shows when preview is active) */
      #mobBackToEdit {
         display: none; position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
         background: var(--primary, #2454c7); color: #fff; padding: 12px 24px;
         border-radius: 30px; font-weight: 700; z-index: 9999; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
      #view-builder:not(.mobile-hide-preview) #mobBackToEdit { display: block; }
      
      /* Layout Adjustments */
      #view-builder { padding-bottom: 20px; display: flex; flex-direction: column; }
      #bPanel, #bSidebar { overflow-y: auto !important; height: calc(100vh - 55px) !important; width: 100% !important; flex: none; }
      .b-preview { width: 100% !important; padding: 10px; margin-bottom: 60px; overflow-x: auto; }
      .mobile-step-nav { display: block; padding-bottom: 20px; }
      .mobile-step-nav button { padding: 12px 16px; font-size: 13.5px; }
    }
    @media (min-width: 769px) { 
      #mobHeader, #mobMenuOverlay, #mobBackToEdit, .mobile-step-nav { display: none !important; } 
    }
  `;
  document.head.appendChild(style);

  // Inject Header & Hamburger
  const header = document.createElement('div');
  header.id = 'mobHeader';
  header.innerHTML = `
    <div id="mobHamburger" style="font-size:24px;cursor:pointer;line-height:1;color:var(--ink, #111);">☰</div>
    <div style="font-weight:800;font-size:18px;color:var(--primary, #2454c7);">ResumeAI</div>
  `;
  document.body.appendChild(header);

  // Inject Menu Overlay
  const overlay = document.createElement('div');
  overlay.id = 'mobMenuOverlay';
  overlay.innerHTML = `
    <div class="mob-menu-link" onclick="toggleMobMenu(); goLanding();">🏠 Home</div>
    <div class="mob-menu-link" onclick="toggleMobMenu(); goDashboard(); createResume();">📝 Create Resume</div>
    <div class="mob-menu-link" onclick="toggleMobMenu(); alert('FAQs coming soon!');">❓ FAQs</div>
    <div class="mob-menu-link" onclick="toggleMobMenu(); goLanding(); setTimeout(() => document.getElementById('tplShowcase').scrollIntoView({behavior:'smooth'}), 100);">🎨 Templates</div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('mobHamburger').onclick = toggleMobMenu;

  // Inject floating back to editor button for Preview mode
  const backBtn = document.createElement('button');
  backBtn.id = 'mobBackToEdit';
  backBtn.innerHTML = '✎ Back to Editor';
  backBtn.onclick = () => window.mobileNextStep(activeSectionUI, false);
  document.body.appendChild(backBtn);
}

window.toggleMobMenu = function() {
  document.getElementById('mobMenuOverlay').classList.toggle('active');
};

// Hook into existing goBuilder function to reset mobile view to the editor wizard
const originalGoBuilder = window.goBuilder;
window.goBuilder = function(id) {
  originalGoBuilder(id);
  if(window.innerWidth <= 768) {
     const vb = document.getElementById('view-builder');
     vb.classList.remove('mobile-hide-panel');
     vb.classList.add('mobile-hide-sidebar', 'mobile-hide-preview');
  }
};

// Initialize mobile modifications
setupMobileLayout();
