import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import {renderVisualFigure,renderStage} from '../public/reading/programming-languages-a-section-1/visuals.mjs';
import {renderGraph} from '../public/reading/programming-languages-a-section-1/graphs.mjs';
const root=new URL('../public/reading/programming-languages-a-section-1/',import.meta.url);
async function spec(chapter,id){
 const html=await readFile(new URL(`${chapter}/index.html`,root),'utf8');
 const specs=[...html.matchAll(/<script type="application\/json" class="visual-data">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 const found=specs.find(s=>s.id===id);assert.ok(found,`Missing figure ${id}`);return found;
}
const rows=step=>(step.tables??[]).flatMap(t=>t.rows).map(r=>r.cells.map(String));
const has=(step,name,value)=>rows(step).some(r=>r[0]===name&&r.slice(1).some(c=>c===value||c.startsWith(value+' :')));

test('环境先计算右值，再加入新绑定，最后保留已有结果',async()=>{
 const env=await spec('01-expressions','env-bindings');
 const working=env.steps.find(s=>s.label.includes('左半边'));
 assert.ok(has(working,'x','34'));assert.ok(has(working,'y','17'));
 assert.equal(has(working,'z','70'),false);
 const end=env.steps.at(-1);assert.ok(has(end,'z','70'));assert.ok(has(end,'w','71'));
 const shadow=await spec('03-shadowing','shadowing');
 const latest=shadow.steps.at(-1);
 for(const [name,value] of [['a','6'],['b','20'],['c','20'],['d','5'],['f','12']])assert.ok(has(latest,name,value),`${name} must remain ${value}`);
});

test('函数先求实参，参数不泄漏，定义环境不被调用处遮蔽替换',async()=>{
 const call=await spec('04-functions','function-call');
 assert.match(call.steps.at(-1).result,/38/);
 const endRows=rows(call.steps.at(-1));
 assert.equal(endRows.some(r=>r[0]==='first'||r[0]==='second'),false);
 const def=await spec('04-functions','definition-environment');
 const before=def.steps.find(s=>s.label.includes('新的同名'));
 assert.ok(has(before,'daily_pages','20'));assert.ok(has(before,'daily_pages','12'));
 assert.match(def.steps.at(-1).result,/60/);
 const local=await spec('08-local-functions','local-scope');
 assert.match(local.steps.at(-1).result,/7/);
 assert.equal(rows(local.steps.at(-1)).some(r=>r[0]==='x'||r[0]==='y'),false);
});

test('可访问的完整过程与首步在静态HTML中存在，数据和文字安全转义',()=>{
 const fixture={id:'safe',title:'A < B',lead:'Chinese 中文',sources:[],steps:[{label:'开始',code:['val x = "</script>";'],activeLines:[0],note:'<img onerror=bad()>',result:'&'}]};
 const html=renderVisualFigure(fixture);
 assert.match(html,/visual-all-states/);assert.match(html,/aria-live="polite"/);
 assert.equal(html.includes('<img onerror'),false);
 assert.match(html,/\\u003c\/script>/);
 assert.match(renderStage(fixture,0),/&lt;img onerror=bad\(\)&gt;/);
});

test('SVG包含名称描述与独立箭头ID，拒绝失去目标的连线',()=>{
 const graph={width:500,height:200,nodes:[{id:'a',x:10,y:10,w:100,h:60,title:'<name>'},{id:'b',x:200,y:10,w:100,h:60,title:'value'}],edges:[{from:'a',to:'b'}]};
 const a=renderGraph(graph,'first'),b=renderGraph(graph,'second');
 assert.match(a,/role="img"/);assert.match(a,/<desc /);assert.match(a,/&lt;name&gt;/);
 assert.ok(!b.includes('rg-first-arrow'));
 assert.throws(()=>renderGraph({...graph,edges:[{from:'a',to:'missing'}]},'bad'),/Unknown graph edge/);
});

test('17段视频的图解出处指向实际页面，原图保持已核对文件',async()=>{
 const {createHash}=await import('node:crypto');
 const coverage=JSON.parse(await readFile(new URL('visual-coverage.json',root),'utf8'));
 assert.deepEqual(coverage.videos.map(v=>v.video),Array.from({length:17},(_,i)=>i+1));
 const figureIds=new Set();
 for(const video of coverage.videos){
  assert.ok(video.source_visual);assert.ok(video.evidence_level);
  for(const figure of video.figures){
   const [page,anchor]=figure.page.split('#');const html=await readFile(new URL(page,root),'utf8');
   assert.ok(html.includes(`id="${anchor}"`),`Missing visual for V${video.video}: ${figure.id}`);
   figureIds.add(figure.id);
  }
 }
 assert.equal(figureIds.size,coverage.figures);
 for(const asset of coverage.originals){
  assert.match(asset.source,/^https:\/\/courses\.cs\.washington\.edu\//);
  const bytes=await readFile(new URL(asset.file,root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.id);
 }
});
