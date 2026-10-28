// Shared by server validation and UI; only visible terrain participates.
export function reachable(g,u){
 const result=new Map(),start=u.y*g.size+u.x,queue=[{x:u.x,y:u.y,cost:0,path:[]}];
 if(u.acted)return result;
 const best=new Map([[start,0]]),occupied=new Set(g.units.filter(v=>v.id!==u.id).map(v=>v.y*g.size+v.x));
 while(queue.length){queue.sort((a,b)=>a.cost-b.cost);const cur=queue.shift();
  for(const [x,y] of [[cur.x+1,cur.y],[cur.x-1,cur.y],[cur.x,cur.y+1],[cur.x,cur.y-1]]){
   if(x<0||y<0||x>=g.size||y>=g.size)continue;const k=y*g.size+x,t=g.tiles[k];
   if(!t.visible||occupied.has(k))continue;
   let cost=u.type==='dragon'?1:t.terrain==='water'?Infinity:t.terrain==='mountain'?(['golem','rider','catapult'].includes(u.type)?Infinity:3):t.terrain==='forest'?2:1;
   cost+=cur.cost;if(cost>u.mp||cost>=(best.get(k)??Infinity))continue;
   const item={x,y,cost,path:[...cur.path,{x,y}]};best.set(k,cost);result.set(k,item);queue.push(item);
  }
 }
 return result;
}
export function highlights(g,u,types){
 if(!u||u.owner!==g.you||u.acted||g.turn!==g.you||g.winner!==null)return {moves:new Map(),attacks:new Set()};
 const attacks=new Set();if(!(u.type==='catapult'&&u.moved))for(const t of g.tiles){const d=Math.abs(t.x-u.x)+Math.abs(t.y-u.y);if(t.visible&&d>=types[u.type][5]&&d<=types[u.type][6])attacks.add(t.y*g.size+t.x);}
 return {moves:reachable(g,u),attacks};
}
