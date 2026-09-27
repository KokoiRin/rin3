import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const root = resolve(import.meta.dirname, '../public/apps/glimpse');
const cardCode = readFileSync(resolve(root, 'cards.js'), 'utf8').replace('export const cards', 'const cards');
const appCode = readFileSync(resolve(root, 'app.js'), 'utf8').replace("import { cards } from './cards.js';", '');

// Exercise the shipped controller with in-memory browser boundaries, not a copy of its rules.
function boot({blocked=false, saved, hidden=false}={}) {
 const nodes=new Map(), store=new Map(), handlers={}; let time=0;
 if(saved)store.set('rin-glimpse-events-v1',saved);
 const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',open:false,style:{},addEventListener(type,fn){this[type]=fn;},setAttribute(){},focus(){},scrollIntoView(){},replaceChildren(){this.innerHTML='';},querySelector(){return node('child');},querySelectorAll(){return [];}});return nodes.get(id);};
 const document={hidden,getElementById:node,querySelector:node,addEventListener(type,fn){handlers[type]=fn;}};
 const context={document,performance:{now:()=>time},localStorage:{getItem:k=>{if(blocked)throw Error('blocked');return store.get(k)??null;},setItem:(k,v)=>{if(blocked)throw Error('blocked');store.set(k,v);},removeItem:k=>store.delete(k)},window:{scrollTo(){},addEventListener(type,fn){handlers[type]=fn;}},history:{replaceState(){},pushState(){},back(){}},location:{pathname:'/'},URL,Blob,Date,Math,console};
 vm.runInNewContext(cardCode+'\n'+appCode,context);
 return {node,store,handlers,document,tick:n=>{time+=n;},events:()=>JSON.parse(store.get('rin-glimpse-events-v1')||'[]')};
}
test('one round displays all ten cards without duplicates then stops',()=>{
 const h=boot();for(let i=0;i<10;i++)h.node('skip').click();
 const shown=h.events().filter(e=>e.action==='impression');assert.equal(shown.length,10);assert.equal(new Set(shown.map(e=>e.cardId)).size,10);assert.equal(h.events().at(-1).action,'deck_end');
});
test('light mode excludes every high-energy invitation',()=>{
 const h=boot();h.node('low').click();for(let i=0;i<5;i++)h.node('skip').click();
 const shown=h.events().filter(e=>e.action==='impression'&&e.energy==='low');assert.equal(shown.length,5);assert(shown.every(e=>!['state','conversation','queue','project'].includes(e.cardId)));
});
test('a reload keeps records and avoids the immediately previous card',()=>{
 const h=boot();const previous=h.events().at(-1).cardId;const next=boot({saved:h.store.get('rin-glimpse-events-v1')});assert.equal(next.events().length,2);assert.notEqual(next.events().at(-1).cardId,previous);
});
test('blocked browser storage still allows opening and ending an experience',()=>{
 const h=boot({blocked:true});assert.doesNotThrow(()=>{h.node('open').click();h.node('quit').click();});assert.match(h.node('#main').innerHTML,/先这样/);
});
test('time in the background is not counted as active experience time',()=>{
 const h=boot();h.tick(2000);h.document.hidden=true;h.handlers.visibilitychange();h.tick(60000);h.document.hidden=false;h.handlers.visibilitychange();h.tick(1000);h.node('skip').click();assert.equal(h.events().find(e=>e.action==='background').activeMs,2000);assert.equal(h.events().find(e=>e.action==='skip').activeMs,1000);
});
test('clear removes saved records and the previously exported preview',()=>{
 const h=boot();h.node('export').click();assert(h.node('export-preview').innerHTML);h.node('clear').click();assert.equal(h.store.has('rin-glimpse-events-v1'),false);assert.equal(h.node('export-preview').innerHTML,'');
});
