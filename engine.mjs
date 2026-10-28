import {randomUUID} from 'node:crypto';
export const TYPES={warrior:['Воин',150,40,15,3,1,1,'⚔'],spear:['Копейщик',200,35,20,3,1,1,'♜'],archer:['Лучник',250,35,10,3,1,2,'➶'],rider:['Всадник',400,50,20,5,1,1,'♞'],mage:['Волхв',400,35,10,3,1,2,'☽'],skeleton:['Костяной воин',0,25,5,3,1,1,'☠'],catapult:['Катапульта',600,60,5,2,2,3,'♧'],golem:['Каменный страж',600,60,50,2,1,1,'◆'],dragon:['Змей',1000,80,30,6,1,1,'♆'],prince:['Князь',1000,60,35,3,1,1,'♛']};
const id=()=>randomUUID();
export const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
export function makeMap(n){
 const size=n===2?15:17,c=(size-1)/2,tiles=[];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++)tiles.push({x,y,terrain:'plain',building:null,owner:null});
 const at=(x,y)=>tiles[y*size+x];
 let starts;
 if(n===3){ // Three isomorphic corridor branches. The empty fourth arm is impassable.
  for(const t of tiles)t.terrain='water';
  starts=[[c,1],[1,c],[size-2,c]];
  for(let k=1;k<size-1;k++){at(k,c).terrain='road';if(k<=c)at(c,k).terrain='road';}
  for(const [dx,dy] of [[0,-1],[-1,0],[1,0]]){
   for(let d=2;d<=6;d++)for(const side of [-1,1]){const x=c+dx*d+(dy?side:0),y=c+dy*d+(dx?side:0);at(x,y).terrain=d%2?'forest':'plain';}
   for(const d of [4,6])at(c+dx*d+(dy?1:0),c+dy*d+(dx?1:0)).building='farm';
  }
 }else{
  starts=n===2?[[1,c],[size-2,c]]:[[2,2],[size-3,2],[size-3,size-3],[2,size-3]];
  for(const t of tiles){const ax=Math.min(t.x,size-1-t.x),ay=Math.min(t.y,size-1-t.y);if(ax===4&&ay===4)t.terrain='mountain';else if((ax*3+ay*3)%7===0&&ax>0&&ay>0)t.terrain='forest';}
  if(n===2)for(let y=0;y<size;y++)at(c,y).terrain=[3,c,size-4].includes(y)?'road':'water';
  for(const [x,y]of starts){const sx=Math.sign(c-x),sy=Math.sign(c-y);for(const [fx,fy]of n===2?[[x+sx*2,y-2],[x+sx*2,y+2]]:[[x+sx*2,y],[x,y+sy*2]]){at(fx,fy).building='farm';at(fx,fy).terrain='plain';}}
 }
 for(const [p,[x,y]]of starts.entries()){Object.assign(at(x,y),{terrain:'road',building:'castle',owner:p});}
 if(n===4)for(const [dx,dy]of [[0,-2],[2,0],[0,2],[-2,0]])Object.assign(at(c+dx,c+dy),{terrain:'road',building:'shrine'});
 else Object.assign(at(c,c),{terrain:'road',building:'shrine'});
 return {size,tiles,starts};
}
export function createGame(players){const map=makeMap(players.length);const g={...map,players:players.map((p,i)=>({...p,id:i,gold:200,alive:true,seen:[],memory:{}})),units:[],graves:[],turn:Math.floor(Math.random()*players.length),round:1,turns:0,roundPending:players.map((_,i)=>i),log:['Поход начался.'],winner:null};for(const [i,[x,y]]of map.starts.entries())g.units.push(unit('prince',i,x,y));updateVision(g);return g;}
function unit(type,owner,x,y,fresh=false){return {id:id(),type,owner,x,y,hp:100,mp:fresh?0:TYPES[type][4],acted:fresh,moved:false};}
const tile=(g,x,y)=>g.tiles[y*g.size+x];
const occupant=(g,x,y)=>g.units.find(u=>u.x===x&&u.y===y);
function neighbors(g,u){return [[u.x+1,u.y],[u.x-1,u.y],[u.x,u.y+1],[u.x,u.y-1]].filter(([x,y])=>x>=0&&y>=0&&x<g.size&&y<g.size).map(([x,y])=>tile(g,x,y));}
function cost(u,t){if(u.type==='dragon')return 1;if(t.terrain==='water')return Infinity;if(t.terrain==='mountain')return ['rider','catapult','golem'].includes(u.type)?Infinity:3;return t.terrain==='forest'?2:1;}
export function visible(g,p){const v=new Set();const sources=[...g.units.filter(u=>u.owner===p).map(u=>({...u,r:['rider','dragon'].includes(u.type)?4:u.type==='catapult'?2:3})),...g.tiles.filter(t=>t.owner===p&&t.building).map(t=>({...t,r:t.building==='castle'?3:2})),...(g.players[p].scouts||[])];for(const t of g.tiles)if(sources.some(s=>distance(s,t)<=s.r))v.add(t.y*g.size+t.x);return v;}
export function updateVision(g){for(const p of g.players){const v=visible(g,p.id);p.seen=[...new Set([...p.seen,...v])];for(const k of v)p.memory[k]={...g.tiles[k]};}}
export function view(g,p){updateVision(g);const v=visible(g,p);return {size:g.size,tiles:g.tiles.map((t,k)=>v.has(k)?{...t,visible:true}:g.players[p].memory[k]?{...g.players[p].memory[k],visible:false}:{x:t.x,y:t.y,terrain:'unknown',visible:false}),units:g.units.filter(u=>u.owner===p||v.has(u.y*g.size+u.x)),graves:g.graves.filter(t=>v.has(t.y*g.size+t.x)),players:g.players.map(q=>({id:q.id,name:q.name,bot:q.bot,alive:q.alive,gold:q.id===p?q.gold:undefined})),turn:g.turn,round:g.round,winner:g.winner,log:g.log.slice(-8),you:p};}
export function damage(a,b,t){let atk=TYPES[a.type][2]*(a.type==='spear'&&b.type==='rider'?2:1);const bonus=a.type==='dragon'?1:t.terrain==='forest'?1.2:t.terrain==='mountain'?1.4:1;return Math.max(5,Math.round((atk-TYPES[b.type][3]*bonus)*a.hp/100));}
function kill(g,u){g.units=g.units.filter(q=>q.id!==u.id);if(u.type!=='skeleton')g.graves.push({x:u.x,y:u.y,expires:g.round+3});}
function victory(g){for(const p of g.players)if(p.alive&&!g.units.some(u=>u.owner===p.id&&u.type==='prince')&&!g.tiles.some(t=>t.owner===p.id&&t.building==='castle')){p.alive=false;g.units=g.units.filter(u=>u.owner!==p.id);for(const t of g.tiles)if(t.owner===p.id)t.owner=null;g.log.push(`${p.name} покидает поле.`);}const alive=g.players.filter(p=>p.alive);if(alive.length===1)g.winner=alive[0].id;}
function end(g){victory(g);if(g.winner!==null)return;g.turns++;g.roundPending=(g.roundPending||g.players.filter(p=>p.alive).map(p=>p.id)).filter(id=>id!==g.turn&&g.players[id].alive);if(!g.roundPending.length){g.round++;g.graves=g.graves.filter(t=>t.expires>g.round);g.roundPending=g.players.filter(p=>p.alive).map(p=>p.id);}let next=g.turn;do{next=(next+1)%g.players.length;}while(!g.players[next].alive);g.turn=next;const p=g.players[next];p.scouts=[];p.visits=(p.visits||0)+1; // Initial player already has its first turn.
 for(const t of g.tiles){if(t.owner===next){if((p.visits>1)||p.started)p.gold+=t.building==='castle'?150:t.building==='farm'?50:0;t.used=false;t.hired=false;}}
 p.started=true;
 for(const u of g.units.filter(u=>u.owner===next)){u.mp=TYPES[u.type][4];u.acted=false;u.moved=false;const t=tile(g,u.x,u.y);if(t.owner===next)u.hp=Math.min(100,u.hp+(t.building==='castle'?20:t.building==='farm'?10:0));}
}
export function act(g,p,a){if(g.winner!==null)throw Error('Матч завершён');if(p!==g.turn)throw Error('Сейчас ход другого игрока');if(!g.players[p].alive)throw Error('Игрок выбыл');g.players[p].started=true;
 if(a.kind==='end'){end(g);updateVision(g);return;}
 const t=Number.isInteger(a.x)&&Number.isInteger(a.y)&&a.x>=0&&a.y>=0&&a.x<g.size&&a.y<g.size?tile(g,a.x,a.y):null;
 if(a.kind==='hire'){if(!t||t.owner!==p||t.building!=='castle'||t.hired||occupant(g,t.x,t.y))throw Error('Нужен свободный замок, не нанимавший в этот ход');const type=a.type;if(!TYPES[type]||type==='skeleton')throw Error('Недоступный юнит');if(type==='prince'&&g.units.some(u=>u.owner===p&&u.type==='prince'))throw Error('Князь уже на поле');if(g.players[p].gold<TYPES[type][1])throw Error('Недостаточно золота');g.players[p].gold-=TYPES[type][1];g.units.push(unit(type,p,t.x,t.y,true));t.hired=true;updateVision(g);return;}
 if(a.kind==='bless'){const s=g.tiles.find(s=>s.x===a.sx&&s.y===a.sy);if(!s||s.owner!==p||s.building!=='shrine'||s.used)throw Error('Святилище недоступно');if(a.mode==='heal'){const u=g.units.find(u=>u.id===a.target&&u.owner===p);if(!u||distance(u,s)>2)throw Error('Союзник должен быть рядом');u.hp=Math.min(100,u.hp+15);}else if(a.mode==='scout'&&t&&distance(t,s)<=4){(g.players[p].scouts??=[]).push({x:t.x,y:t.y,r:2});}else throw Error('Недопустимое благословение');s.used=true;updateVision(g);return;}
 const u=g.units.find(u=>u.id===a.unit&&u.owner===p);if(!u||u.acted)throw Error('Выберите доступного бойца');
 if(a.kind==='move'){if(!t||!visible(g,p).has(t.y*g.size+t.x))throw Error('Выберите клетку в пределах обзора');const sight=visible(g,p);const dist=new Map([[u.y*g.size+u.x,0]]),prev=new Map(),queue=[tile(g,u.x,u.y)];while(queue.length){queue.sort((a,b)=>dist.get(a.y*g.size+a.x)-dist.get(b.y*g.size+b.x));const cur=queue.shift();for(const v of neighbors(g,cur)){const k=v.y*g.size+v.x,oc=occupant(g,v.x,v.y);if(oc&&oc.id!==u.id&&sight.has(k))continue;const d=dist.get(cur.y*g.size+cur.x)+cost(u,v);if(d<=u.mp&&d<(dist.get(k)??Infinity)){dist.set(k,d);prev.set(k,cur.y*g.size+cur.x);queue.push(v);}}}let k=t.y*g.size+t.x;if(!dist.has(k)||distance(u,t)===0)throw Error('Недостижимая клетка');const path=[];while(prev.has(k)){path.unshift(g.tiles[k]);k=prev.get(k);}for(const v of path){if(occupant(g,v.x,v.y))break;u.mp-=cost(u,v);u.x=v.x;u.y=v.y;u.moved=true;g.graves=g.graves.filter(q=>q.x!==u.x||q.y!==u.y);}}
 else if(a.kind==='attack'){const b=g.units.find(b=>b.id===a.target&&b.owner!==p);if(!b||!visible(g,p).has(b.y*g.size+b.x))throw Error('Цель не видна');const d=distance(u,b);if(d<TYPES[u.type][5]||d>TYPES[u.type][6]||(u.type==='catapult'&&u.moved))throw Error('Цель вне дальности или катапульта двигалась');b.hp-=damage(u,b,tile(g,b.x,b.y));if(b.hp<=0)kill(g,b);else if(d===1&&TYPES[b.type][5]===1){u.hp-=damage(b,u,tile(g,u.x,u.y));if(u.hp<=0)kill(g,u);}u.acted=true;u.mp=0;}
 else if(a.kind==='capture'){const s=tile(g,u.x,u.y);if(!s.building||s.owner===p)throw Error('Здесь нечего захватывать');s.owner=p;s.used=true;s.hired=true;u.acted=true;u.mp=0;}
 else if(a.kind==='heal'){const b=g.units.find(b=>b.id===a.target&&b.owner===p);if(u.type!=='mage'||!b||distance(u,b)>2||u.id===b.id)throw Error('Лечение недоступно');b.hp=Math.min(100,b.hp+20);u.acted=true;u.mp=0;}
 else if(a.kind==='raise'){if(u.type!=='mage'||!t||distance(u,t)>2||occupant(g,t.x,t.y)||!g.graves.some(q=>q.x===t.x&&q.y===t.y)||!Number.isFinite(cost({type:'skeleton'},t)))throw Error('Нужна свободная могила рядом');g.graves=g.graves.filter(q=>q.x!==t.x||q.y!==t.y);g.units.push(unit('skeleton',p,t.x,t.y,true));u.acted=true;u.mp=0;}
 else throw Error('Неизвестное действие');victory(g);updateVision(g);
}
export function botTurn(g){const p=g.turn;for(const u of [...g.units.filter(u=>u.owner===p)]){if(u.acted)continue;let v=view(g,p);const enemies=v.units.filter(b=>b.owner!==p);const b=enemies.find(b=>distance(u,b)>=TYPES[u.type][5]&&distance(u,b)<=TYPES[u.type][6]);try{if(b){act(g,p,{kind:'attack',unit:u.id,target:b.id});continue;}const here=tile(g,u.x,u.y);if(here.building&&here.owner!==p){act(g,p,{kind:'capture',unit:u.id});continue;}const targets=v.tiles.filter(t=>t.building&&t.owner!==p&&t.visible);let target=targets.sort((a,b)=>distance(u,a)-distance(u,b))[0]||enemies[0]||v.tiles.filter(t=>t.visible).sort((a,b)=>distance(a,{x:g.size/2,y:g.size/2})-distance(b,{x:g.size/2,y:g.size/2}))[0];if(target){const options=v.tiles.filter(t=>t.visible&&distance(u,t)>0&&distance(u,t)<=u.mp).sort((a,b)=>distance(a,target)-distance(b,target));for(const t of options){try{act(g,p,{kind:'move',unit:u.id,x:t.x,y:t.y});break;}catch{}}if(tile(g,u.x,u.y).building&&tile(g,u.x,u.y).owner!==p)act(g,p,{kind:'capture',unit:u.id});}}catch{}}
 for(const t of g.tiles.filter(t=>t.owner===p&&t.building==='castle'))try{act(g,p,{kind:'hire',x:t.x,y:t.y,type:!g.units.some(u=>u.owner===p&&u.type==='prince')&&g.players[p].gold>=1000?'prince':g.players[p].gold>=400?'rider':'warrior'});}catch{}if(g.winner===null)act(g,p,{kind:'end'});
}
