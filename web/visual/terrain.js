import {diamond,poly} from './sprites.js';
import {project,depthCompare} from './projection.js';
export const palette={plain:'#71873c',road:'#877b48',forest:'#526c32',mountain:'#707557',water:'#267e99',unknown:'#162624'};
// Stable visual variation: never consumes gameplay randomness or modifies tiles.
export function noise(x,y,s=0){let n=Math.imul(x+917,374761393)^Math.imul(y+311,668265263)^Math.imul(s+1,1274126177);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
const edges=[{dx:1,dy:0,a:[32,0],b:[0,16]},{dx:0,dy:1,a:[0,16],b:[-32,0]},{dx:-1,dy:0,a:[-32,0],b:[0,-16]},{dx:0,dy:-1,a:[0,-16],b:[32,0]}];
export function adjacent(g,t){return edges.map(e=>{const x=t.x+e.dx,y=t.y+e.dy;const neighbor=x>=0&&y>=0&&x<g.size&&y<g.size?g.tiles[y*g.size+x]:null;return {...e,neighbor:neighbor?.terrain==='unknown'?null:neighbor};});}
export function bridgeAxis(g,t){if(t.terrain!=='road'||t.building)return null;const n=adjacent(g,t).map(e=>e.neighbor?.terrain);return n[1]==='water'&&n[3]==='water'?'x':n[0]==='water'&&n[2]==='water'?'y':null;}
function stroke(c,points,color,width=1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();c.lineWidth=1;}
function clip(c,x,y){diamond(c,x,y);c.clip();}
function uv(x,y,u,v){return [Math.round(x+(u-v)*32),Math.round(y+(u+v)*16)];}
function ground(c,g,t,x,y){const water=t.terrain==='water';const base=water?'#287f98':'#788b40';diamond(c,x,y,base,base);
 c.save();clip(c,x,y);for(let i=0;i<(water?16:13);i++){const u=noise(t.x,t.y,i*3+1)-.5,v=noise(t.x,t.y,i*3+2)-.5,[px,py]=uv(x,y,u,v),k=noise(t.x,t.y,i*3+3);c.fillStyle=water?['#48a3b6','#6ab9c3','#1c6e8a'][i%3]:['#a5b05a44','#526d3033','#8f9b4644','#c1b56922'][i%4];c.fillRect(px,py,water?3+Math.floor(k*8):2+Math.floor(k*5),water?1:2);if(!water&&k>.8){c.fillStyle='#a5b24f';c.fillRect(px,py-2,1,3);}}
 if(t.terrain==='road'&&!bridgeAxis(g,t)){poly(c,[[-17,-3],[-4,-10],[16,-3],[18,5],[0,11],[-17,4]].map(([a,b])=>[a+x,b+y]),'#a18c57');for(const e of adjacent(g,t))if(e.neighbor?.terrain==='road'){const m=[(e.a[0]+e.b[0])/2,(e.a[1]+e.b[1])/2];stroke(c,[[x,y],[x+m[0]*1.2,y+m[1]*1.2]],'#6e683f',17);stroke(c,[[x,y],[x+m[0]*1.2,y+m[1]*1.2]],'#ad9861',12);}for(let i=0;i<8;i++){const [px,py]=uv(x,y,(noise(t.x,t.y,i+401)-.5)*.6,(noise(t.x,t.y,i+501)-.5)*.6);c.fillStyle=i%2?'#c5ae75':'#817247';c.fillRect(px,py,4,2);}}
 for(const e of adjacent(g,t)){const n=e.neighbor;if(!n)continue;const a=[x+e.a[0],y+e.a[1]],b=[x+e.b[0],y+e.b[1]];if(water&&n.terrain!=='water'&&!bridgeAxis(g,n)){const coast=Array.from({length:9},(_,i)=>{const q=i/8,inset=i===0||i===8?0:noise(t.x+e.dx,t.y+e.dy,i+711)*.1;return [Math.round((a[0]+(b[0]-a[0])*q)*(1-inset)+x*inset),Math.round((a[1]+(b[1]-a[1])*q)*(1-inset)+y*inset)];});stroke(c,coast,'#336976',8);stroke(c,coast,'#74b5b2',3);for(let i=1;i<8;i++){const q=i/8,px=Math.round(a[0]+(b[0]-a[0])*q),py=Math.round(a[1]+(b[1]-a[1])*q);c.fillStyle=i%3?'#b3c8ae':'#568f91';c.fillRect(px,py,3,1);}}else if(!water&&n.terrain==='water'&&!bridgeAxis(g,t)){stroke(c,[a,b],'#aa985f',6);stroke(c,[a,b],'#686443',2);for(let i=1;i<6;i++){const q=i/6,px=Math.round(a[0]+(b[0]-a[0])*q)*.96+x*.04,py=Math.round(a[1]+(b[1]-a[1])*q)*.96+y*.04;c.fillStyle=i%2?'#b8b07d':'#787f61';c.fillRect(Math.round(px),Math.round(py),4,2);}}else if(!water&&n.terrain!==t.terrain&&['forest','mountain'].includes(n.terrain)){stroke(c,[a,b],n.terrain==='forest'?'#46622a44':'#797c5766',8);}}
 // Sparse details leave the centre free for pieces and tactical overlays.
 if(!water&&!t.building&&t.terrain==='plain'){const k=noise(t.x,t.y,900);if(k>.77){const [px,py]=uv(x,y,.25,-.23);c.fillStyle='#515e39';c.fillRect(px,py,7,3);c.fillStyle='#9ca174';c.fillRect(px+1,py-2,4,3);}else if(k<.22){const [px,py]=uv(x,y,-.25,.25);c.fillStyle='#40652c';c.fillRect(px-3,py-2,8,4);c.fillStyle='#81993c';c.fillRect(px-2,py-4,5,3);if(k<.08){c.fillStyle='#e0c76a';c.fillRect(px,py-4,2,1);c.fillRect(px+4,py-1,1,1);}}}
 c.restore();

}
function bridge(c,x,y,axis){const p=(u,v)=>uv(x,y,axis==='x'?u:v,axis==='x'?v:u);poly(c,[p(-.5,-.24),p(.5,-.24),p(.5,.24),p(-.5,.24)],'#503d26');for(let i=0;i<9;i++){const a=-.5+i/9,b=a+.095;poly(c,[p(a,-.23),p(b,-.23),p(b,.23),p(a,.23)],i%3?'#a37a42':'#bd9355','#5d452d');}for(const v of [-.25,.25]){const a=p(-.5,v),b=p(.5,v);stroke(c,[[a[0],a[1]-6],[b[0],b[1]-6]],'#c5a16a',2);for(const u of [-.45,0,.45]){const q=p(u,v);c.fillStyle='#5c472e';c.fillRect(q[0],q[1]-8,2,10);}}}
export function renderTerrain(c,g){const tiles=[...g.tiles].sort(depthCompare);
 for(const t of tiles){const {x,y}=project(t.x,t.y,g.size);if(t.terrain==='unknown'){diamond(c,x,y,palette.unknown);continue;}
 const water=t.terrain==='water';for(const e of adjacent(g,t).slice(0,2))if(!e.neighbor){poly(c,[[x+e.a[0],y+e.a[1]],[x+e.b[0],y+e.b[1]],[x+e.b[0],y+e.b[1]+22],[x+e.a[0],y+e.a[1]+22]],water?'#204c5b':'#514d34');}
 ground(c,g,t,x,y+(water?7:0));
 }
 // Shore faces connect the raised land plane to the lower water plane.
 for(const t of tiles){if(t.terrain==='unknown'||t.terrain==='water')continue;const {x,y}=project(t.x,t.y,g.size);const axis=bridgeAxis(g,t);
 if(!axis)for(const e of adjacent(g,t)){if(e.neighbor?.terrain!=='water')continue;const a=[x+e.a[0],y+e.a[1]],b=[x+e.b[0],y+e.b[1]];poly(c,[a,b,[b[0],b[1]+7],[a[0],a[1]+7]],'#716d4c','#4b604c');stroke(c,[a,b],'#b5aa69',2);for(let i=1;i<6;i++){const q=i/6,px=Math.round(a[0]+(b[0]-a[0])*q),py=Math.round(a[1]+(b[1]-a[1])*q);c.fillStyle=i%2?'#8d9172':'#444f42';c.fillRect(px,py+2,3,4);}}
 if(axis){diamond(c,x,y+7,'#287f98');bridge(c,x,y,axis);}
 }
 for(const t of tiles)if(!t.visible&&t.terrain!=='unknown'){const p=project(t.x,t.y,g.size);diamond(c,p.x,p.y,'#07120ba8');}
}
