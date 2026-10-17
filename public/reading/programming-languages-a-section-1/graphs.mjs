const tones = new Set(['', 'active', 'new', 'muted', 'shared']);
const labels = {active:'当前步骤',new:'新建节点',muted:'本步未选中',shared:'共享结构'};
const colors = {'':'#587477',active:'#187467',new:'#ab5928',muted:'#8a979b',shared:'#73568c'};
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n = value => { const number=Number(value); if(!Number.isFinite(number))throw new TypeError('Graph coordinates must be finite');return number; };
const tone = value => tones.has(value) ? value : '';
const anchor = (node,side) => ({left:[node.x,node.y+node.h/2],right:[node.x+node.w,node.y+node.h/2],top:[node.x+node.w/2,node.y],bottom:[node.x+node.w/2,node.y+node.h]})[side];
function route(a,b,fromSide,toSide){
 const horizontal=s=>s==='left'||s==='right';
 if(horizontal(fromSide)&&horizontal(toSide)){const mid=(a[0]+b[0])/2;return `M${a[0]} ${a[1]} H${mid} V${b[1]} H${b[0]}`;}
 if(!horizontal(fromSide)&&!horizontal(toSide)){const mid=(a[1]+b[1])/2;return `M${a[0]} ${a[1]} V${mid} H${b[0]} V${b[1]}`;}
 return horizontal(fromSide)?`M${a[0]} ${a[1]} H${b[0]} V${b[1]}`:`M${a[0]} ${a[1]} V${b[1]} H${b[0]}`;
}
/** Pure, dependency-free graph renderer. No DOM, timers, eval, or raw HTML. */
export function renderGraph(graph,uid='graph'){
 if(!graph||!Array.isArray(graph.nodes)||!Array.isArray(graph.edges))throw new TypeError('Expected graph nodes and edges');
 const width=n(graph.width??700),height=n(graph.height??330);
 if(width<300||height<160)throw new RangeError('Graph viewport is too small');
 const prefix='rg-'+String(uid).replace(/[^A-Za-z0-9_-]/g,c=>'_'+c.codePointAt(0).toString(16)+'_');
 const nodes=graph.nodes.map(item=>({...item,x:n(item.x),y:n(item.y),w:n(item.w),h:n(item.h),tone:tone(item.tone),lines:(item.lines??[]).map(String)}));
 const nodeMap=new Map(nodes.map(item=>[String(item.id),item]));
 if(nodeMap.size!==nodes.length)throw new Error('Duplicate graph node id');
 for(const node of nodes){if(node.w<35||node.h<35||node.x<0||node.y<0||node.x+node.w>width||node.y+node.h>height-35)throw new RangeError(`Graph node out of bounds: ${node.id}`);if(node.lines.length&&23+node.lines.length*22>node.h-6)throw new RangeError(`Graph node text too tall: ${node.id}`);}
 const groups=(graph.groups??[]).map(g=>({...g,x:n(g.x),y:n(g.y),w:n(g.w),h:n(g.h),tone:tone(g.tone)}));
 const used=[...new Set([...nodes,...groups,...graph.edges].map(item=>tone(item.tone)).filter(Boolean))];
 const description=graph.description??nodes.map(item=>`${item.title}：${item.lines.join('，')}${item.tone?'，'+labels[item.tone]:''}`).join('；');
 const defs=['', 'active','new','muted','shared'].map(t=>`<marker id="${prefix}-arrow-${t||'plain'}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9 Z" fill="${colors[t]}"/></marker>`).join('');
 const groupSvg=groups.map(g=>`<g class="rg-group rg-${g.tone||'plain'}"><rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="14"/><text x="${g.x+12}" y="${g.y+23}">${esc(g.label)}</text></g>`).join('');
 const edgeSvg=graph.edges.map(e=>{
  const from=nodeMap.get(String(e.from)),to=nodeMap.get(String(e.to));if(!from||!to)throw new Error(`Unknown graph edge: ${e.from} → ${e.to}`);
  const fs=e.fromSide??'right',ts=e.toSide??'left',a=anchor(from,fs),b=anchor(to,ts);if(!a||!b)throw new Error('Invalid graph edge side');
  const t=tone(e.tone),x=(a[0]+b[0])/2,y=(a[1]+b[1])/2;
  const label=e.label?`<text class="rg-edge-label" x="${x}" y="${y-8}">${esc(e.label)}</text>`:'';
  return `<g class="rg-edge rg-${t||'plain'}"><path d="${route(a,b,fs,ts)}" marker-end="url(#${prefix}-arrow-${t||'plain'})"/>${label}</g>`;
 }).join('');
 const nodeSvg=nodes.map(item=>{
  const titleY=item.y+(item.lines.length?23:item.h/2+6);
  return `<g class="rg-node rg-${item.tone||'plain'}" data-node="${esc(item.id)}" aria-label="${esc(item.title)}${item.tone?'，'+labels[item.tone]:''}"><rect x="${item.x}" y="${item.y}" width="${item.w}" height="${item.h}" rx="11"/><text class="rg-node-title" x="${item.x+item.w/2}" y="${titleY}">${esc(item.title)}</text>${item.lines.map((line,i)=>`<text class="rg-node-line" x="${item.x+item.w/2}" y="${item.y+45+i*22}">${esc(line)}</text>`).join('')}</g>`;
 }).join('');
 const legend=used.map((t,i)=>`<g class="rg-legend rg-${t}"><rect x="${18+i*158}" y="${height-23}" width="14" height="14" rx="3"/><text x="${40+i*158}" y="${height-11}">${labels[t]}</text></g>`).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" class="reading-graph" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${prefix}-title ${prefix}-desc"><title id="${prefix}-title">${esc(graph.title??'程序执行关系图')}</title><desc id="${prefix}-desc">${esc(description)}</desc><defs>${defs}</defs>${groupSvg}${edgeSvg}${nodeSvg}${legend}</svg>`;
}
