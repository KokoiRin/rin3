import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {test} from 'node:test';
const root=new URL('../public/reading/programming-languages-a-section-2/',import.meta.url);
const titles=['Building Compound Types','Records','Tuples as Syntactic Sugar','Datatype Bindings','Case Expressions','Useful Datatypes','Pattern Matching So Far','Another Expression Example','Type Synonyms','Lists and Options are Datatypes','Polymorphic Datatypes','Each of Pattern Matching / Truth About Functions','A Little Type Inference','Polymorphic and Equality Types','Nested Patterns','More Nested Patterns','Nested Patterns Precisely','Optional: Function Patterns','Exceptions','Tail Recursion','Accumulators for Tail Recursion','Perspective on Tail Recursion'];
const read=file=>readFile(new URL(file,root),'utf8');

test('第二周保留22个官方主题与完整13篇，V8/V9按Coursera顺序',async()=>{
 const series=JSON.parse(await read('series.json'));
 assert.equal(series.partial,false);assert.equal(series.chapters.length,13);
 assert.deepEqual(series.videos.map(v=>v.title),titles);
 assert.deepEqual(series.chapters.flatMap(c=>c.videoNumbers),Array.from({length:22},(_,i)=>i+1));
 const html=await read('index.html');
 assert.equal([...html.matchAll(/class="chapter-card"/g)].length,13);
 for(const chapter of series.chapters){
  const html=await read(chapter.slug+'/index.html');
  assert.ok(html.includes(`<h1>${chapter.title}</h1>`));
  assert.ok(!/\[\[(?:visual|original):/.test(html));
  assert.equal([...html.matchAll(/class="chapter-switcher"/g)].length,2);
 }
});

test('每组分步图能在静态HTML展开，图解数据对应正文位置与有效高亮行',async()=>{
 const series=JSON.parse(await read('series.json'));const found=new Map();
 for(const c of series.chapters){
  const html=await read(c.slug+'/index.html');
  for(const match of html.matchAll(/<script type="application\/json" class="visual-data">([\s\S]*?)<\/script>/g)){
   const spec=JSON.parse(match[1]);assert.equal(spec.chapter,c.slug);assert.ok(!found.has(spec.id));found.set(spec.id,spec);
   assert.ok(spec.steps.length>=3);assert.ok(html.includes(`id="visual-${spec.id}"`));
   for(const step of spec.steps){assert.ok(step.label&&step.note);for(const line of step.activeLines??[])assert.ok(line>=0&&line<step.code.length);}
  }
  if([...found.values()].some(s=>s.chapter===c.slug)){
   assert.ok(html.includes('visual-all-states'));assert.ok(html.includes('../../programming-languages-a-section-1/visuals.mjs'));
  }
 }
 assert.deepEqual([...found.keys()].sort(),series.visuals.map(s=>s.id).sort());assert.ok(found.size>=8);
});

test('来源记录覆盖全部视频，三张原图保持核对后的内容与出处',async()=>{
 const coverage=JSON.parse(await read('coverage.json'));
 assert.deepEqual(coverage.videos.map(v=>v.number),Array.from({length:22},(_,i)=>i+1));
 for(const video of coverage.videos){assert.ok(video.key_points?.length>=3);assert.match(video.source,/^https:\/\/www\.coursera\.org\/learn\/programming-languages\/lecture\//);}
 assert.equal(coverage.originals.length,3);
 for(const asset of coverage.originals){
  assert.match(asset.source,/^https:\/\/courses\.cs\.washington\.edu\//);assert.ok(asset.locator&&asset.attribution);
  assert.equal(createHash('sha256').update(await readFile(new URL(asset.file,root))).digest('hex'),asset.sha256);
 }
});

test('各页面使用的本地样式、脚本与图片都存在，第一周可接着进入第二周',async()=>{
 const series=JSON.parse(await read('series.json'));
 for(const file of ['index.html',...series.chapters.map(c=>c.slug+'/index.html')]){
  const html=await read(file);const base=fileURLToPath(new URL(file,root));
  for(const match of html.matchAll(/<(?:link|script|img)\b[^>]*(?:href|src)="([^"]+)"/g)){
   if(/^(?:https?:|data:|\/)/.test(match[1]))continue;
   await access(path.resolve(path.dirname(base),match[1].split('?')[0]));
  }
 }
 const previous=await readFile(new URL('../programming-languages-a-section-1/index.html',root),'utf8');
 assert.ok(previous.includes('../programming-languages-a-section-2/index.html'));
 const last=await readFile(new URL('../programming-languages-a-section-1/13-language-map/index.html',root),'utf8');
 assert.ok(last.includes('../../programming-languages-a-section-2/index.html'));
});
