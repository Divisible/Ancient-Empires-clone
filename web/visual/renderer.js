import {renderTerrain,palette} from './terrain.js';
import {project,unproject,dimensions,depthCompare} from './projection.js';
import {diamond,scenery,soldier} from './sprites.js';
export function pickCell(canvas,event,size){const r=canvas.getBoundingClientRect();return unproject((event.clientX-r.left)*canvas.width/r.width,(event.clientY-r.top)*canvas.height/r.height,size);}
const terrainLayers=new WeakMap();
export function renderMap(canvas,g,{colors,selected,cell,hints,position,flash}){
 const d=dimensions(g.size);canvas.style.setProperty('--map-ratio',d.width/d.height);if(canvas.width!==d.width||canvas.height!==d.height){canvas.width=d.width;canvas.height=d.height;}const c=canvas.getContext('2d');c.clearRect(0,0,d.width,d.height);c.imageSmoothingEnabled=false;c.lineWidth=1;
 const terrainKey=g.size+'|'+g.tiles.map(t=>t.terrain+','+Number(t.visible)+','+(t.building||'')).join(';');
 let cached=terrainLayers.get(canvas);if(!cached||cached.key!==terrainKey){const layer=document.createElement('canvas');layer.width=d.width;layer.height=d.height;renderTerrain(layer.getContext('2d'),g);cached={key:terrainKey,layer};terrainLayers.set(canvas,cached);}c.drawImage(cached.layer,0,0);
 for(const t of hints.moves.values()){const p=project(t.x,t.y,g.size);diamond(c,p.x,p.y,'#66d6cb44','#a6eee0');c.fillStyle='#e9ffdc';c.font='9px monospace';c.textAlign='center';c.fillText(t.cost,p.x,p.y+12);}
 for(const k of hints.attacks){const t=g.tiles[k],p=project(t.x,t.y,g.size),enemy=g.units.some(u=>u.owner!==g.you&&u.x===t.x&&u.y===t.y);c.setLineDash(enemy?[]:[3,3]);diamond(c,p.x,p.y,enemy?'#f27e5b66':null,'#efac77');c.setLineDash([]);}
 if(cell){const p=project(cell.x,cell.y,g.size);c.lineWidth=2;diamond(c,p.x,p.y,null,'#ffe1a0');c.lineWidth=1;}
 const objects=g.tiles.filter(t=>t.terrain!=='unknown'&&(t.building||['forest','mountain'].includes(t.terrain))).map(t=>({x:t.x,y:t.y,layer:0,t}));for(const q of g.graves)objects.push({...q,layer:1,grave:true});for(const u of g.units)objects.push({...position(u),layer:2,u});
 for(const o of objects.sort(depthCompare)){const p=project(o.x,o.y,g.size);if(o.t){c.save();c.globalAlpha=o.t.visible?1:.35;const nearby=g.units.some(u=>u.x===o.x&&u.y===o.y);if(nearby)c.globalAlpha*=o.t.building==='castle'?.85:.55;scenery(c,o.t,p.x,p.y,o.t.owner===null?'#c7b77d':colors[o.t.owner]);c.restore();}else if(o.u)soldier(c,o.u,p.x,p.y,colors[o.u.owner],o.u.id===selected);else{c.fillStyle='#9ca68a';c.fillRect(p.x-3,p.y-12,6,15);c.fillRect(p.x-6,p.y-8,12,3);}}
 if(flash){const a=project(flash.a.x,flash.a.y,g.size),b=project(flash.b.x,flash.b.y,g.size);c.strokeStyle='#ffe1a0';c.lineWidth=4;c.beginPath();c.moveTo(a.x,a.y-12);c.lineTo(b.x,b.y-12);c.stroke();}
}
export function renderMini(canvas,g,colors){const s=5;canvas.width=canvas.height=g.size*s;const c=canvas.getContext('2d');for(const t of g.tiles){c.fillStyle=palette[t.terrain];c.fillRect(t.x*s,t.y*s,s,s);if(!t.visible){c.fillStyle='#07120ba8';c.fillRect(t.x*s,t.y*s,s,s);}if(t.building&&t.terrain!=='unknown'){c.fillStyle=t.owner===null?'#dcc690':colors[t.owner];c.fillRect(t.x*s+1,t.y*s+1,3,3);}}for(const u of g.units){c.fillStyle=colors[u.owner];c.fillRect(u.x*s+1,u.y*s+1,3,3);}}
