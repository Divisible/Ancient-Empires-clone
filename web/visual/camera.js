import {project} from './projection.js';
export function createCamera(viewport,canvas,mini){let zoom=1.9,room=null,size=15,drag=null,ignoreClickUntil=0;
 function resize(next){const cx=(viewport.scrollLeft+viewport.clientWidth/2)/zoom,cy=(viewport.scrollTop+viewport.clientHeight/2)/zoom;zoom=Math.max(1,Math.min(2.8,next));canvas.style.width=Math.round(canvas.width*zoom)+'px';canvas.style.height=Math.round(canvas.height*zoom)+'px';viewport.scrollLeft=cx*zoom-viewport.clientWidth/2;viewport.scrollTop=cy*zoom-viewport.clientHeight/2;}
 function focus(x,y){const p=project(x,y,size);viewport.scrollLeft=p.x*zoom-viewport.clientWidth/2;viewport.scrollTop=p.y*zoom-viewport.clientHeight/2;}
 mini.onclick=e=>{const r=mini.getBoundingClientRect();focus(Math.min(size-1,(e.clientX-r.left)/r.width*size),Math.min(size-1,(e.clientY-r.top)/r.height*size));};
 viewport.addEventListener('pointerdown',e=>{if(e.button===1||(e.button===0&&e.shiftKey)){e.preventDefault();drag={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture(e.pointerId);}});
 viewport.addEventListener('pointermove',e=>{if(drag){viewport.scrollLeft=drag.left+drag.x-e.clientX;viewport.scrollTop=drag.top+drag.y-e.clientY;}});
 viewport.addEventListener('pointerup',()=>{if(drag)ignoreClickUntil=performance.now()+300;drag=null;});viewport.addEventListener('pointercancel',()=>{drag=null;});
 return {zoomIn:()=>resize(zoom+.2),zoomOut:()=>resize(zoom-.2),ignoreClick:()=>performance.now()<ignoreClickUntil,
 update(g,code){size=g.size;if(room!==code){room=code;resize(1.9);const u=g.units.find(u=>u.owner===g.you);if(u)focus(u.x*.3+(size-1)/2*.7,u.y*.3+(size-1)/2*.7);}},
 home(g){const u=g.units.find(u=>u.owner===g.you&&u.type==='prince')||g.units.find(u=>u.owner===g.you);if(u)focus(u.x,u.y);}};
}
