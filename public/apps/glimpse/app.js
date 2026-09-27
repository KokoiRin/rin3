import { cards } from './cards.js';

// This page owns the feed/session. Only anonymous interaction events persist.
const main = document.querySelector('#main');
const dialog = document.querySelector('#about');
const KEY = 'rin-glimpse-events-v1';
const session = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
let events = [], storageAvailable = true;
try { const saved = JSON.parse(localStorage.getItem(KEY) ?? '[]'); events = Array.isArray(saved) ? saved.filter(e => e && typeof e.action === 'string').slice(-2000) : []; } catch { storageAvailable = false; }
let energy = 'any', seen = new Set(), current, view = 'feed', activeSince = performance.now(), elapsed = 0, touch;
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId = id => document.getElementById(id);
const on = (id, fn) => byId(id)?.addEventListener('click', fn);
function pauseClock() { if (activeSince !== null) elapsed += performance.now() - activeSince; activeSince = null; }
function resumeClock() { if (activeSince === null && !document.hidden && !dialog.open) activeSince = performance.now(); }
function record(action, extra = {}) {
  pauseClock();
  events.push({session, cardId:current?.id ?? null, type:current?.type ?? null, action, energy, at:new Date().toISOString(), activeMs:Math.round(elapsed), ...extra});
  events = events.slice(-2000);
  try { localStorage.setItem(KEY, JSON.stringify(events)); storageAvailable = true; } catch { storageAvailable = false; }
  elapsed = 0; resumeClock();
}
function focusHeading() { const heading = main.querySelector('h1,h2'); if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); } window.scrollTo(0,0); }
const starPositions = [[16,25],[43,16],[76,30],[31,55],[63,62],[85,80],[18,83]];
function art(card) {
 const common = '<svg viewBox="0 0 360 310" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
 const dots = starPositions.map(([x,y],i)=>`<circle cx="${x*3.6}" cy="${y*3.1}" r="${i%2?3:4}" fill="#ebdfa8"/>`).join('');
 let body;
 if(card.art==='stars') body=`<rect width="360" height="310" fill="#2c463f"/><circle cx="306" cy="58" r="86" fill="#354f45"/><path d="M58 78L155 50L274 93L227 192L112 170" fill="none" stroke="#abbda2" stroke-width="1" opacity=".6"/>${dots}<circle cx="112" cy="170" r="15" fill="none" stroke="#c7d1b3" opacity=".4"/>`;
 else if(['outside','palette','game'].includes(card.art)) body='<rect width="360" height="310" fill="#c9d8cc"/><circle cx="251" cy="84" r="36" fill="#f5dfa3"/><path d="M-50 272Q90 80 230 259L400 310H0" fill="#879f86"/><path d="M88 310Q230 153 399 212V320" fill="#4e7564"/><path d="M140 320Q192 247 240 251" fill="none" stroke="#ddd2a8" stroke-width="10"/>';
 else if(card.art==='rain') body='<rect width="360" height="310" fill="#b9c9c0"/><rect x="98" y="54" width="167" height="240" rx="75" fill="#657e72"/><path d="M181 70V294M109 168H256" stroke="#d6d9bf" stroke-width="6"/><rect x="132" y="194" width="86" height="65" rx="3" fill="#efead1"/><path d="M151 214H199M151 227H186" stroke="#7b8976" stroke-width="2"/><path d="M40 50l-9 34m46 38l-9 34m235-95l-9 34m14 99l-9 34m-252 7l-9 34" stroke="#edf0df" stroke-width="2"/>';
 else if(card.art==='coffee') body='<rect width="360" height="310" fill="#dddcc9"/><ellipse cx="179" cy="239" rx="98" ry="21" fill="#c2c5ae"/><path d="M115 133H240L223 229H137Z" fill="#faf4dc"/><ellipse cx="177" cy="134" rx="62" ry="20" fill="#526650"/><path d="M239 151Q294 153 267 194L229 202" fill="none" stroke="#faf4dc" stroke-width="14"/><path d="M160 101Q145 82 164 61M188 102Q173 82 192 56" fill="none" stroke="#a3b09b" stroke-width="3"/>';
 else if(card.art==='conversation') body='<rect width="360" height="310" fill="#dce1d0"/><rect x="53" y="70" width="188" height="84" rx="25" fill="#66866f"/><path d="M91 144l-8 27 40-24" fill="#66866f"/><rect x="151" y="173" width="155" height="64" rx="24" fill="#faf2d9"/><circle cx="104" cy="112" r="5" fill="#f5efd8"/><circle cx="143" cy="112" r="5" fill="#f5efd8"/><circle cx="182" cy="112" r="5" fill="#f5efd8"/>';
 else body='<rect width="360" height="310" fill="#d9e0d1"/><rect x="103" y="41" width="157" height="230" rx="23" fill="#466754"/><rect x="116" y="59" width="131" height="190" rx="13" fill="#f7f2dc"/><rect x="132" y="93" width="91" height="30" rx="9" fill="#bacbad"/><rect x="132" y="137" width="70" height="30" rx="9" fill="#e0cea1"/><rect x="132" y="181" width="91" height="30" rx="9" fill="#8ba88d"/><circle cx="181" cy="260" r="4" fill="#cdd7bb"/>';
 return `${common}${body}</svg><span class="art-label" style="${card.art==='stars'?'color:#c7d1b3':''}">A LITTLE ${card.energy==='high'?'CURIOSITY':'WONDER'}</span>`;
}
function nextCard() {
 const pool=cards.filter(c => !seen.has(c.id) && (energy==='any'||c.energy==='low'));
 if(!pool.length) { end(true); return; }
 const previous = [...events].reverse().find(e => e.action === 'impression')?.cardId;
 const fresh = pool.filter(c => c.id !== previous);
 const choices = fresh.length ? fresh : pool;
 current = !events.length && energy==='any' ? cards[0] : choices[Math.floor(Math.random()*choices.length)];
 seen.add(current.id); view='feed'; renderFeed(); record('impression');
}
function renderFeed() {
 const c=current;
 main.innerHTML=`<section class="intro"><div><p class="eyebrow">留一点空白，给偶然</p><h1>现在，碰一下这个。</h1></div><div class="energy" aria-label="内容强度"><button id="any" aria-pressed="${energy==='any'}">随便来</button><button id="low" aria-pressed="${energy==='low'}">轻松点</button></div></section><article class="card" aria-label="${escape(c.title.replace('\n',''))}"><div class="visual">${art(c)}</div><div class="card-content"><div class="meta"><span>${c.type}</span><span>${c.time}</span></div><h2>${escape(c.title)}</h2><p class="teaser">${escape(c.teaser)}</p><button class="primary" id="open">${escape(c.action)} <span aria-hidden="true">↗</span></button></div></article><div class="switch-row"><span class="hint">只看一眼也可以 · 左划换一个</span><button class="quiet skip" id="skip">换一个 <span aria-hidden="true">→</span></button></div>`;
 on('open',()=>{record('open');view='trial';history.pushState({trial:true},'','#try');renderTrial();focusHeading();});
 on('skip',()=>{record('skip');nextCard();focusHeading();});
 for(const mode of ['any','low']) on(mode,()=>{if(energy===(mode==='any'?'any':'low'))return;record('context_change',{to:mode});energy=mode;nextCard();});
 const surface=main.querySelector('.card');
 surface.addEventListener('touchstart',e=>{const t=e.changedTouches[0];touch={x:t.clientX,y:t.clientY};},{passive:true});
 surface.addEventListener('touchend',e=>{const t=e.changedTouches[0];if(touch&&touch.x-t.clientX>70&&Math.abs(touch.y-t.clientY)<45&&view==='feed'){record('skip',{gesture:true});nextCard();focusHeading();}touch=null;},{passive:true});
 surface.addEventListener('touchcancel',()=>{touch=null;},{passive:true});
}
function renderTrial() {
 const c=current;
 main.innerHTML=`<article class="trial"><button class="quiet back" id="back">← 回到卡片</button><p class="eyebrow">${c.type} / ${c.time}</p><h2>${escape(c.trialTitle)}</h2><p class="prose">${escape(c.trial)}</p>${c.widget?'<div class="widget" id="widget"></div>':''}<div class="trial-actions"><button class="primary" id="continue">${escape(c.moreTitle)} <span aria-hidden="true">↓</span></button><button class="quiet" id="quit">到这里就好 ↗</button></div><div id="more"></div><p class="source">${escape(c.source)}${c.link?`<br><a href="${c.link}" target="_blank" rel="noopener noreferrer" id="external">${c.linkLabel} ↗</a>`:''}</p></article>`;
 on('back',()=>history.back());on('quit',()=>end());
 on('continue',()=>{record('continue');byId('more').innerHTML=`<section class="more"><h3>${escape(c.moreTitle)}</h3><p>${escape(c.more)}</p></section>`;byId('continue').disabled=true;byId('continue').textContent='已经展开在下面';byId('more').scrollIntoView({block:'nearest',behavior:'auto'});});
 on('external',()=>record('external_open'));
 renderWidget(c.widget);
}
function renderWidget(kind) {
 const w=byId('widget');if(!w)return;
 if(kind==='stars'){
  let selected=[];
  w.innerHTML=`<div class="star-field"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline id="line" points="" fill="none" stroke="#e8dbac" stroke-width=".5"/></svg>${starPositions.map(([x,y],i)=>`<button class="star" style="left:${x}%;top:${y}%" aria-label="星星 ${i+1}" aria-pressed="false" id="star-${i}">✦</button>`).join('')}</div><button class="quiet" id="reset-stars">重新连</button><p class="widget-status" id="star-status" aria-live="polite">碰一颗星开始。</p>`;
  starPositions.forEach((p,i)=>on(`star-${i}`,()=>{if(selected.includes(i))return;selected.push(i);byId(`star-${i}`).setAttribute('aria-pressed','true');byId('line').setAttribute('points',selected.map(j=>starPositions[j].join(',')).join(' '));byId('star-status').textContent=selected.length>1?'这条线看起来像什么？也可以什么都不像。':'再碰一颗，就有一条线。';}));
  on('reset-stars',()=>{selected=[];byId('line').setAttribute('points','');w.querySelectorAll('.star').forEach(b=>b.setAttribute('aria-pressed','false'));byId('star-status').textContent='碰一颗星开始。';});
 }else if(kind==='palette'){
  const palettes=[['苔绿','#c8d9d2','#f2d995','#637b72'],['落日','#ebc0a6','#fff0bd','#a77568'],['夜蓝','#adbccf','#f7e5b3','#526782']];
  w.innerHTML=`<div class="landscape" id="landscape"><div class="sun"></div><div class="mountain"></div><div class="mountain second"></div></div><div class="swatches">${palettes.map((p,i)=>`<button class="swatch" id="palette-${i}" aria-label="${p[0]}" aria-pressed="${i===0}" style="--color:${p[3]}">${p[0]}</button>`).join('')}</div>`;
  palettes.forEach((p,i)=>on(`palette-${i}`,()=>{byId('landscape').style.cssText=`--sky:${p[1]};--sun:${p[2]};--hill:${p[3]}`;palettes.forEach((_,j)=>byId(`palette-${j}`).setAttribute('aria-pressed',String(i===j)));}));
 }else if(kind==='state'){
  w.innerHTML='<div class="choices"><button class="secondary" id="rotate">旋转屏幕</button><button class="secondary" id="process">系统回收进程</button></div><p class="widget-status" id="state-result" aria-live="polite">这是一个简化场景，点一下看区别。</p>';
  on('rotate',()=>{byId('state-result').textContent='Activity 重建，原 ViewModel 保留：内存里的草稿还在。';});on('process',()=>{byId('state-result').textContent='进程被回收，原 ViewModel 消失：恢复要依靠已保存的状态或持久存储。';});
 }else if(kind==='queue'){
  let n=0;
  w.innerHTML='<div class="queue"><span>① 当前的耗时工作</span><span>② 等待处理的点击</span><span>③ 随后的界面更新</span></div><button class="secondary" id="step">处理下一项</button><p class="widget-status" id="queue-status" aria-live="polite">先处理当前工作。</p>';
  on('step',()=>{if(n===3){n=0;w.querySelectorAll('.queue span').forEach(s=>s.classList.remove('done'));byId('step').textContent='处理下一项';byId('queue-status').textContent='先处理当前工作。';return;}w.querySelectorAll('.queue span')[n++].classList.add('done');byId('queue-status').textContent=['当前工作结束，才轮到点击。','点击已处理，接着更新界面。','这三项都处理过了。'][n-1];if(n===3)byId('step').textContent='再看一次';});
 }
}
function end(exhausted=false) {
 if(view!=='end')record(exhausted?'deck_end':'quit',{from:view});
 view='end'; history.replaceState(null,'',location.pathname);
 main.innerHTML=`<section class="end"><div class="symbol" aria-hidden="true">✳</div><p class="eyebrow">留白也是一种选择</p><h2>${exhausted?'这几张，先到这里。':'那就，先这样。'}</h2><p>${exhausted?'这轮没有更多卡片了。想再看看，随时重新来。':'可以把手机放下，也可以去做刚才想做的事。'}<br>现在可以直接关掉这一页。</p><button class="secondary" id="restart">${exhausted?'再随便看看':'再碰一下'} ↗</button></section>`;
 on('restart',()=>{seen=new Set();nextCard();focusHeading();});focusHeading();
}
window.addEventListener('popstate',()=>{if(view==='trial'){record('back');view='feed';renderFeed();focusHeading();}});
window.addEventListener('pagehide',()=>{if(view!=='end')record('page_leave',{from:view});pauseClock();});
window.addEventListener('pageshow',resumeClock);
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(view!=='end')record('background',{from:view});pauseClock();}else resumeClock();});
on('leave',()=>end());
on('data',()=>{pauseClock();dialog.showModal();byId('storage-status').textContent=storageAvailable?'记录只保存在这个浏览器，最多保留最近 2,000 条。':'浏览器暂时不能保存记录；当前体验仍然可用，可以导出本次记录。';});
dialog.addEventListener('close',resumeClock);
let exportUrl;
on('export',()=>{
 const serialized=JSON.stringify({version:1,exportedAt:new Date().toISOString(),events},null,2);
 if(exportUrl)URL.revokeObjectURL(exportUrl);
 exportUrl=URL.createObjectURL(new Blob([serialized],{type:'application/json'}));
 byId('export-preview').innerHTML='<label for="event-json">试用记录（可全选复制）</label><textarea id="event-json" readonly rows="7"></textarea><a class="secondary" id="download-json" download="碰一下-试用记录.json">下载 JSON 文件 ↗</a>';
 byId('event-json').value=serialized;byId('download-json').href=exportUrl;
});
on('clear',()=>{events=[];byId('export-preview').replaceChildren();if(exportUrl){URL.revokeObjectURL(exportUrl);exportUrl=null;}try{localStorage.removeItem(KEY);storageAvailable=true;byId('storage-status').textContent='已清除本机记录。之后的新操作会重新开始记录。';}catch{storageAvailable=false;byId('storage-status').textContent='已清除本次内存记录；浏览器存储不可访问，无法确认旧记录已删除。';}});
byId('sources').innerHTML=cards.map(c=>`<p><strong>${escape(c.title.replace('\n',''))}</strong><br>${escape(c.source)}</p>`).join('');
// A reload starts a fresh visit instead of resuming an abandoned activity.
history.replaceState(null,'',location.pathname);nextCard();
