import {renderGraph} from './graphs.mjs';

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const tones = new Set(['new','active','muted','shared']);
const toneClass = tone => tones.has(tone) ? ` visual-${tone}` : '';

function renderTable(table) {
 return `<section class="visual-table"><h4>${escapeHtml(table.title)}</h4><div class="visual-table-scroll" tabindex="0" role="region" aria-label="${escapeHtml(table.title)}"><table><thead><tr>${table.columns.map(c=>`<th scope="col">${escapeHtml(c)}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row=>`<tr class="${toneClass(row.tone).trim()}">${row.cells.map((cell,i)=>`<${i===0?'th scope="row"':'td'}>${escapeHtml(cell)}</${i===0?'th':'td'}>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
}

export function renderStage(spec, index, uid = spec.id) {
 const step = spec.steps[index];
 const active = new Set(step.activeLines ?? []);
 const code = step.code?.length ? `<div class="visual-code-scroll" tabindex="0" role="region" aria-label="本步代码，高亮行是当前观察的位置"><ol class="visual-code">${step.code.map((line,i)=>`<li${active.has(i)?' class="visual-current"':''}><code>${escapeHtml(line)||' '}</code></li>`).join('')}</ol></div>` : '';
 const graph = step.graph ? `<div class="visual-graph-tools"><span>关系图 · 可切换全图与大字阅读</span><button type="button" data-graph-zoom aria-pressed="false">放大图中文字</button></div><div class="visual-graph-scroll" tabindex="0" role="region" aria-label="${escapeHtml(step.label)}，小屏幕可左右滑动查看全图">${renderGraph(step.graph,`${uid}-${index}`)}</div>` : '';
 return `<p class="visual-step-title"><span>第 ${index+1} / ${spec.steps.length} 步</span>${escapeHtml(step.label)}</p>${code}${graph}${step.tables?.length?`<div class="visual-tables">${step.tables.map(renderTable).join('')}</div>`:''}<div class="visual-explanation"><p>${escapeHtml(step.note)}</p>${step.result?`<p class="visual-result"><span>此刻的结果</span>${escapeHtml(step.result)}</p>`:''}</div>`;
}

export function renderVisualFigure(spec) {
 const id = `visual-${spec.id}`;
 const data = JSON.stringify(spec).replace(/</g,'\\u003c');
 return `<figure class="lesson-visual" id="${id}" aria-labelledby="${id}-title"><figcaption><span class="visual-kicker">一步一步看过程</span><h3 id="${id}-title">${escapeHtml(spec.title)}</h3><p>${escapeHtml(spec.lead)}</p></figcaption><div class="visual-controls" hidden><button type="button" data-action="prev" aria-label="上一步" disabled>← 上一步</button><label><span class="visual-sr-only">选择步骤</span><select aria-label="${escapeHtml(spec.title)}：选择步骤">${spec.steps.map((s,i)=>`<option value="${i}">${i+1}. ${escapeHtml(s.label)}</option>`).join('')}</select></label><button type="button" data-action="next" aria-label="下一步">下一步 →</button><button type="button" data-action="reset" class="visual-reset" aria-label="回到第一步">重看</button></div><div class="visual-stage" aria-live="polite" aria-atomic="true">${renderStage(spec,0)}</div><details class="visual-all-states"><summary>一次看完整过程（也可用于打印）</summary>${spec.steps.map((s,i)=>`<section class="visual-static-step">${renderStage(spec,i,`${spec.id}-all`)}</section>`).join('')}</details><p class="visual-source">依据课程重绘${spec.sources?.length?` · ${spec.sources.map(s=>`<a href="${escapeHtml(s.url)}">${escapeHtml(s.label)}</a>`).join(' / ')}`:''}</p><script type="application/json" class="visual-data">${data}</script></figure>`;
}

export function mountVisuals(root = globalThis.document) {
 root.querySelectorAll('.lesson-visual').forEach(figure => {
  const data = figure.querySelector('.visual-data');
  if (!data || figure.dataset.ready) return;
  const spec = JSON.parse(data.textContent);
  const stage = figure.querySelector('.visual-stage');
  const controls = figure.querySelector('.visual-controls');
  const select = controls.querySelector('select');
  const previous = controls.querySelector('[data-action="prev"]');
  const next = controls.querySelector('[data-action="next"]');
  let index = 0;
  const update = nextIndex => {
   index = Math.max(0, Math.min(spec.steps.length - 1, nextIndex));
   stage.innerHTML = renderStage(spec,index);
   select.value = String(index);
   previous.disabled = index === 0;
   next.disabled = index === spec.steps.length - 1;
   figure.dataset.step = String(index);
  };
  figure.addEventListener('click', event => {
   const zoom = event.target.closest('button[data-graph-zoom]');
   if (!zoom) return;
   const graph = zoom.parentElement.nextElementSibling;
   const expanded = graph.classList.toggle('is-zoomed');
   zoom.setAttribute('aria-pressed', String(expanded));
   zoom.textContent = expanded ? '查看完整关系图' : '放大图中文字';
  });
  controls.addEventListener('click', event => {
   const button = event.target.closest('button[data-action]');
   if (!button) return;
   const action = button.dataset.action;
   update(action === 'next' ? index + 1 : action === 'prev' ? index - 1 : 0);
  });
  select.addEventListener('change', () => update(Number(select.value)));
  controls.hidden = false;
  figure.dataset.ready = 'true';
  figure.dataset.step = '0';
 });
}

if (typeof globalThis.document !== 'undefined') mountVisuals();
