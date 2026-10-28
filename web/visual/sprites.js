// Procedural pixel-art placeholders: pure drawing, no gameplay rules.
export function poly(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
export function diamond(c,x,y,fill,stroke){poly(c,[[x,y-16],[x+32,y],[x,y+16],[x-32,y]],fill,stroke);}
function tree(c,x,y,s=1,variant=0){c.save();c.translate(Math.round(x),Math.round(y));c.scale(s,s);
 poly(c,[[-10,2],[-3,-3],[20,2],[13,8]],'#172d2466');c.fillStyle='#4e3725';c.fillRect(-2,-11,5,16);c.fillStyle='#9b7843';c.fillRect(-2,-9,2,11);
 const colors=variant%2?['#254d2d','#38622c','#527e34','#83a341']:['#244f34','#326a36','#4d843b','#83a749'];
 for(let tier=0;tier<4;tier++){const w=15-tier*3,h=-8-tier*9;
 poly(c,[[-w,h+8],[-w+3,h+2],[-w+2,h],[ -w+7,h-6],[-w+6,h-9],[0,h-17],[w-6,h-7],[w-3,h-3],[w-4,h+1],[w,h+8],[w-7,h+7],[0,h+11]],colors[tier%3],'#243e2c');
 poly(c,[[0,h-16],[2,h-8],[7,h-5],[4,h-3],[9,h+4],[1,h+7],[-w+4,h+5],[-w+7,h],[-6,h-5]],colors[Math.min(3,tier+1)]);
 for(let j=0;j<6;j++){const px=-w+4+(j*7+variant*3)%Math.max(2,w+3),py=h-3+(j*5)%10;c.fillStyle=j%2?colors[3]:'#325b2e';c.fillRect(px,py,2+(j%2),1);}}
 c.restore();}
function mountain(c,variant){
 poly(c,[[-27,8],[-16,0],[9,-1],[31,10],[16,17],[-10,17]],'#233b3066');
 const peak=-43-variant*4;
 poly(c,[[-26,7],[-20,-8],[-14,-12],[-9,peak],[0,peak+11],[7,-19],[15,-32],[22,-14],[25,-2],[29,7],[6,16]],'#7e8475','#384d44');
 poly(c,[[-9,peak],[-5,peak+17],[-1,-8],[6,16],[29,7],[23,-4],[15,-32],[7,-19],[0,peak+11]],'#4a605b');
 poly(c,[[-9,peak],[-15,-20],[-10,-23],[-13,-9],[-5,-14],[-6,-3],[1,0],[-1,-23]],'#a9ac91');
 poly(c,[[15,-32],[11,-18],[15,-20],[13,-8],[21,-5]],'#8d9680');
 poly(c,[[-10,peak+3],[-14,peak+18],[-9,peak+14],[-7,peak+19],[-4,peak+13]],'#d0c9a7');
 for(let i=0;i<13;i++){const px=-20+(i*13+variant*5)%43,py=-8+(i*7)%18;c.fillStyle=['#667366','#a0a487','#465b4d'][i%3];poly(c,[[px,py],[px+2,py-4],[px+6,py-2],[px+5,py+2]],c.fillStyle);}
 c.strokeStyle='#344e46';c.lineWidth=1;c.beginPath();c.moveTo(-5,peak+20);c.lineTo(-1,-17);c.lineTo(-4,-7);c.stroke();
}
function flag(c,x,y,color){c.fillStyle='#b9a887';c.fillRect(x,y-24,2,25);poly(c,[[x+2,y-24],[x+14,y-21],[x+12,y-13],[x+2,y-15]],color,'#1a2624');}
function tower(c,x,y,color,h=40){c.save();c.translate(x,y);poly(c,[[-9,0],[-9,-h],[2,-h-5],[13,-h],[13,1],[2,7]],'#a0a287','#384c40');poly(c,[[2,-h-5],[13,-h],[13,1],[2,7]],'#6e7b6d');for(let z=-h+8;z<0;z+=8){c.fillStyle='#657568';c.fillRect(-8,z,10,1);}poly(c,[[-13,-h],[1,-h-22],[17,-h]],color,'#243c37');poly(c,[[1,-h-22],[17,-h],[3,-h+2]],'#243d56');c.fillStyle='#263d33';c.fillRect(-3,-h+10,4,9);c.fillRect(6,-h+12,3,7);c.restore();}
function castle(c,color){
 poly(c,[[-45,8],[-9,-15],[48,9],[12,32]],'#243f3266');
 tower(c,-23,-18,color,42);tower(c,22,-18,color,45);
 poly(c,[[-29,-8],[-29,-40],[0,-55],[31,-40],[31,7],[0,23]],'#929a80','#394e43');poly(c,[[0,-55],[31,-40],[31,7],[0,23]],'#667967');
 poly(c,[[-34,-40],[0,-76],[36,-40],[0,-24]],color,'#263d37');poly(c,[[0,-76],[36,-40],[0,-24]],'#304d65');
 for(let y=-25;y<7;y+=7){c.fillStyle='#5b705d';c.fillRect(-27,y,22,1);c.fillStyle='#aeb394';c.fillRect(4,y+3,23,1);}for(const x of [-19,-8,8,19]){c.fillStyle='#293f34';c.fillRect(x,-22,4,10);}
 poly(c,[[-38,9],[-38,-18],[0,-1],[39,-18],[39,10],[0,29]],'#9fa183','#374c40');poly(c,[[0,-1],[39,-18],[39,10],[0,29]],'#72836b');
 for(let x=-34;x<=30;x+=8){const y=-17+(x<0?(x+38)*.45:(39-x)*.45);c.fillStyle='#b8b696';c.fillRect(x,y-5,5,6);}
 c.fillStyle='#293d31';poly(c,[[-8,24],[-8,7],[-4,2],[3,0],[9,6],[9,24]],c.fillStyle);c.strokeStyle='#896e44';for(let x=-5;x<=6;x+=3){c.beginPath();c.moveTo(x,6);c.lineTo(x,24);c.stroke();}
 tower(c,-37,8,color,32);tower(c,31,8,color,35);flag(c,3,-76,color);
}
export function scenery(c,t,x,y,color){c.save();c.translate(Math.round(x),Math.round(y));if(t.terrain==='forest'){const v=(t.x*7+t.y*11)%5;tree(c,-16+v*2,-9,.85+v*.05,v);tree(c,15-v,-5,1.05-v*.05,v+1);tree(c,-7+v*3,9,1.1+v*.035,v+2);if(v%2)tree(c,-21,4,.65,v);}if(t.terrain==='mountain'){c.save();c.scale(1.35,1.45);mountain(c,(t.x+t.y)%3);c.restore();}
 if(t.building==='castle')castle(c,color);
 if(t.building==='farm'){c.scale(1.15,1.15);poly(c,[[8,9],[30,-3],[49,8],[26,23]],'#705635');for(let i=0;i<5;i++){poly(c,[[12+i*5,10+i*2],[30+i*4,-1+i*2],[32+i*4,1+i*2],[14+i*5,12+i*2]],i%2?'#b9a052':'#8d823b');}for(let i=0;i<5;i++){c.fillStyle='#674d2b';c.fillRect(13+i*7,18-i*3,2,8);}c.fillStyle='#c8ad59';c.fillRect(-30,2,9,9);poly(c,[[-20,4],[-20,-13],[2,-22],[22,-12],[22,9],[1,18]],'#bfa36a','#473e2a');poly(c,[[1,-22],[22,-12],[22,9],[1,18]],'#927043');poly(c,[[-25,-12],[-4,-34],[25,-12],[2,-3]],'#ad6934','#623f28');poly(c,[[-4,-34],[25,-12],[2,-3]],'#80512e');c.fillStyle='#443d28';c.fillRect(-11,-5,7,14);c.fillStyle=color;c.fillRect(10,-2,6,6);}
 if(t.building==='shrine'){poly(c,[[-14,8],[0,0],[15,8],[0,16]],'#64776e');c.fillStyle='#83978a';c.fillRect(-5,-23,10,30);poly(c,[[-8,-23],[0,-34],[8,-23]],'#c8ba77');c.fillStyle=color;c.fillRect(-2,-20,4,10);}
 c.restore();}
export function soldier(c,u,x,y,color,selected){c.save();c.translate(Math.round(x),Math.round(y));diamond(c,0,0,color+'33',selected?'#fff0a8':color);c.scale(1.2,1.2);c.fillStyle='#152b2599';c.fillRect(-11,-1,24,7);
 if(u.type==='catapult'){c.fillStyle='#7b512f';c.fillRect(-15,-15,30,13);c.fillStyle='#bf9456';c.fillRect(-2,-35,4,29);for(const a of [-15,10]){c.fillStyle='#3e3327';c.fillRect(a,-5,7,10);}poly(c,[[-12,-29],[4,-36],[10,-30],[-7,-23]],'#9c7443');}
 else if(u.type==='golem'){c.fillStyle='#818b76';c.fillRect(-10,-29,20,24);c.fillRect(-15,-24,6,21);c.fillRect(10,-24,6,21);c.fillStyle='#b2b99b';c.fillRect(-7,-39,14,13);c.fillStyle=color;c.fillRect(-4,-34,3,3);c.fillRect(2,-34,3,3);}
 else if(u.type==='dragon'){poly(c,[[-4,-17],[-28,-40],[-22,-11],[-6,-2],[5,-12],[28,-36],[25,-7],[6,5]],color,'#213d32');c.fillStyle='#8f9c51';c.fillRect(-5,-27,10,24);c.fillRect(-3,-33,12,9);}
 else{if(u.type==='rider'){c.fillStyle='#88603d';c.fillRect(-16,-14,29,13);c.fillRect(9,-23,8,16);c.fillStyle='#312d24';for(const a of [-13,8])c.fillRect(a,-2,4,10);}c.fillStyle='#293b38';c.fillRect(-8,-9,5,13);c.fillRect(3,-9,5,13);c.fillStyle=u.type==='skeleton'?'#dad4b1':color;poly(c,[[-8,-29],[8,-29],[11,-8],[-11,-8]],c.fillStyle,'#1b2d28');c.fillStyle=u.type==='mage'?'#566391':'#c4c6a4';c.fillRect(-6,-40,12,12);c.fillStyle='#324443';c.fillRect(-6,-34,12,3);if(u.type==='prince'){c.fillStyle='#e9c46c';c.fillRect(-7,-43,14,4);for(const a of [-7,-1,5])c.fillRect(a,-48,3,6);}if(u.type==='archer'){c.strokeStyle='#d9b273';c.lineWidth=2;poly(c,[[13,-36],[19,-23],[13,-9]],null,'#d9b273');}else{c.fillStyle=u.type==='mage'?'#a18152':'#d0d6b9';c.fillRect(13,-36,3,29);if(u.type==='spear')c.fillRect(13,-49,3,14);if(u.type==='mage'){c.fillStyle='#9ee0dc';c.fillRect(10,-40,9,7);}else{c.fillStyle='#8fa2ac';poly(c,[[-15,-26],[-7,-26],[-6,-12],[-12,-7],[-17,-13]],c.fillStyle,'#d1c69b');}}}
 c.fillStyle='#182b22';c.fillRect(-15,9,30,4);c.fillStyle=u.hp>40?'#a5d273':'#e38b6f';c.fillRect(-15,9,Math.round(30*u.hp/100),4);if(u.acted){c.fillStyle='#f1d78c';c.fillRect(16,7,3,3);}c.restore();}
