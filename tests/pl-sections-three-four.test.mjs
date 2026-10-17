import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';

const topics={
  3:['Introduction to First-Class Functions','Functions as Arguments','Polymorphic Types and Functions as Arguments','Anonymous Functions','Unnecessary Function Wrapping','Map and Filter','Generalizing Prior Topics','Lexical Scope','Lexical Scope and Higher-Order Functions','Why Lexical Scope','Closures and Recomputation','Fold and More Closures','Closure Idiom: Combining Functions','Closure Idiom: Currying','Partial Application','Currying Wrapup','Mutable References','Closure Idiom: Callbacks','Standard-Library Documentation','Optional: Abstract Data Types With Closures','Optional: Closure Idioms Without Closures','Optional: Java Without Closures','Optional: C Without Closures','Course-Motivation Introduction','Why Study General PL Concepts?','Are All PLs the Same?','Why Functional Languages?','Why ML, Racket, and Ruby?'],
  4:['Section Introduction','What is Type Inference','ML Type Inference','Type Inference Examples','Polymorphic Examples','Optional: The Value Restriction and Other Type-Inference Challenges','Mutual Recursion','Modules for Namespace Management','Signatures and Hiding Things','A Module Example','Signatures for Our Example','Signature Matching','An Equivalent Structure','Another Equivalent Structure','Different Modules Define Different Types','Equivalent Functions','Standard Equivalences','Equivalence Versus Performance','Part A Wrap-Up & Parts B&C Preview']
};

for(const section of [3,4]){
 const root=new URL(`../public/reading/programming-languages-a-section-${section}/`,import.meta.url);
 const read=file=>readFile(new URL(file,root),'utf8');
 test(`Section ${section} 保留全部官方主题与选学内容，每个视频都有讲解入口`,async()=>{
  const series=JSON.parse(await read('series.json'));
  assert.equal(series.partial,false);
  assert.equal(series.chapters.length,section===3?13:9);
  assert.deepEqual(series.videos.map(v=>v.title.replace(/\s+/g,' ')),topics[section]);
  assert.deepEqual(series.chapters.flatMap(c=>c.videoNumbers),topics[section].map((_,i)=>i+1));
  const index=await read('index.html');
  assert.equal([...index.matchAll(/class="chapter-card"/g)].length,series.chapters.length);
  assert.ok(index.includes('quick-route'));
  for(const chapter of series.chapters){
   const html=await read(chapter.slug+'/index.html');
   assert.ok(html.includes(`<h1>${chapter.title}</h1>`));
   assert.equal([...html.matchAll(/class="chapter-switcher"/g)].length,2);
   assert.ok(!/\[\[(?:visual|original):/.test(html));
   for(const n of chapter.videoNumbers)assert.ok(html.includes(series.videos[n-1].href));
  }
 });
 test(`Section ${section} 的过程图保留全部静态状态，代码高亮和图中关系有效`,async()=>{
  const series=JSON.parse(await read('series.json')),found=new Map();
  for(const chapter of series.chapters){
   const html=await read(chapter.slug+'/index.html');
   for(const match of html.matchAll(/<script type="application\/json" class="visual-data">([\s\S]*?)<\/script>/g)){
    const spec=JSON.parse(match[1]);assert.equal(spec.chapter,chapter.slug);assert.ok(!found.has(spec.id));found.set(spec.id,spec);
    assert.ok(spec.steps.length>=3);assert.ok(html.includes(`id="visual-${spec.id}"`));
    assert.ok(html.includes('visual-all-states'));
    assert.ok(html.includes('../../programming-languages-a-section-1/visuals.mjs'));
    for(const step of spec.steps){
     assert.ok(step.label&&step.note);
     for(const line of step.activeLines??[])assert.ok(line>=0&&line<step.code.length);
     if(step.graph){
      const ids=new Set(step.graph.nodes.map(n=>n.id));assert.equal(ids.size,step.graph.nodes.length);
      for(const edge of step.graph.edges??[]){assert.ok(ids.has(edge.from));assert.ok(ids.has(edge.to));}
     }
    }
   }
  }
  assert.deepEqual([...found.keys()].sort(),series.visuals.map(v=>v.id).sort());
  assert.ok(found.size>=6);
 });
 test(`Section ${section} 的来源覆盖完整，本地资源可读取，原图与出处一致`,async()=>{
  const series=JSON.parse(await read('series.json')),coverage=JSON.parse(await read('coverage.json'));
  assert.deepEqual(coverage.videos.map(v=>v.number),topics[section].map((_,i)=>i+1));
  for(const v of coverage.videos){assert.ok(v.key_points.length>=3);assert.match(v.source,/^https:\/\/www\.coursera\.org\/learn\/programming-languages\/lecture\//);}
  for(const asset of coverage.originals??[]){
   assert.match(asset.source,/^https:\/\/courses\.cs\.washington\.edu\//);assert.ok(asset.attribution&&asset.locator);
   assert.equal(createHash('sha256').update(await readFile(new URL(asset.file,root))).digest('hex'),asset.sha256);
  }
  for(const file of ['index.html',...series.chapters.map(c=>c.slug+'/index.html')]){
   const html=await read(file),base=fileURLToPath(new URL(file,root));
   for(const match of html.matchAll(/<(?:link|script|img)\b[^>]*(?:href|src)="([^"]+)"/g)){
    if(/^(?:https?:|data:|\/)/.test(match[1]))continue;
    await access(path.resolve(path.dirname(base),match[1].split('?')[0]));
   }
  }
 });
}

test('第二节可进入第三节，第三节完成后可继续第四节',async()=>{
 const read=file=>readFile(new URL('../public/reading/'+file,import.meta.url),'utf8');
 assert.ok((await read('programming-languages-a-section-2/index.html')).includes('../programming-languages-a-section-3/index.html'));
 const third=JSON.parse(await read('programming-languages-a-section-3/series.json'));
 assert.ok((await read(`programming-languages-a-section-3/${third.chapters.at(-1).slug}/index.html`)).includes('../../programming-languages-a-section-4/index.html'));
});
