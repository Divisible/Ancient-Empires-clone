// Art Kit v1 is a reference, not a sprite sheet. null src means procedural fallback.
// Dimensions are renderer pixels BEFORE camera zoom; anchors are normalized (0..1).
export const ART_STANDARD={tile:[64,32],light:'upper-left',palette:{grass:'#788b40',water:'#287f98',stone:'#8d9680',wood:'#987344',shadow:'#233b30'},categories:['terrain','water','roads','bridges','vegetation','mountains','buildings','units','effects','ui']};
export const assets={};
function define(id,category,width,height,anchor=[.5,1],extra={}){assets[id]={id,category,src:null,anchor,visualSize:[width,height],tileOffset:[0,0],depthOffset:0,animations:{},ownership:null,...extra};}
export const terrainVariants={plain:['grass_01','grass_02','grass_03','grass_flowers','grass_rocks'],forest:['forest_ground'],mountain:['rock_ground'],road:['road_01','road_02'],water:['water_01','water_02']};
for(const [type,ids]of Object.entries(terrainVariants))for(const id of ids)define(id,type==='water'?'water':type==='road'?'roads':'terrain',64,32,[.5,.5]);
export const forestVariants=['tree_single','forest_small','forest_dense','forest_mixed','forest_edge'];
for(const id of forestVariants)define(id,'vegetation',id==='tree_single'?64:96,id==='tree_single'?96:120,[.5,.88]);
export const mountainVariants=['rock_small','rocks_medium','mountain','mountain_cluster'];
for(const [i,id]of mountainVariants.entries())define(id,'mountains',[64,80,96,128][i],[48,64,112,144][i],[.5,.85]);
for(let mask=1;mask<16;mask++)define(`cliff_${mask}`,'water',64,48,[.5,1/3],{neighborMask:mask});
for(let mask=1;mask<16;mask++)define(`coast_${mask}`,'water',64,48,[.5,1/3],{neighborMask:mask});
for(let mask=1;mask<16;mask++)define(`coast_inner_${mask}`,'water',64,48,[.5,1/3],{diagonalMask:mask});
for(const id of ['river_x','river_y'])define(id,'water',64,48,[.5,1/3]);
for(const id of ['bridge_x','bridge_y'])define(id,'bridges',80,64,[.5,.6]);
define('castle','buildings',128,144,[.5,.85],{ownership:{mode:'flag',offset:[16,-110],variants:{}}});
define('farm','buildings',80,80,[.5,.8],{ownership:{mode:'flag',offset:[18,-46],variants:{}}});
define('shrine','buildings',64,80,[.5,.85],{ownership:{mode:'flag',offset:[10,-48],variants:{}}});
for(const id of ['prince','warrior'])define(`unit_${id}`,'units',48,64,[.5,.88],{animations:Object.fromEntries(['idle','movement','attack','hit','death'].map(state=>[state,{src:null,frames:[],frameMs:140,loop:['idle','movement'].includes(state)}])),ownership:{mode:'base',variants:{}}});

export function selectVariant(ids,x,y,salt=0){if(!ids?.length)return null;let h=Math.imul(x+19,73856093)^Math.imul(y+43,19349663)^Math.imul(salt+1,83492791);return ids[(h>>>0)%ids.length];}
export function terrainAsset(tile){return selectVariant(terrainVariants[tile.terrain],tile.x,tile.y,1);}
export function objectAsset(tile){return tile.building|| (tile.terrain==='forest'?selectVariant(forestVariants,tile.x,tile.y,2):tile.terrain==='mountain'?selectVariant(mountainVariants,tile.x,tile.y,3):null);}
// Use only knowledge already available in the fog-filtered view.
export function waterAsset(g,t){if(t.terrain!=='water')return null;const at=(x,y)=>x>=0&&y>=0&&x<g.size&&y<g.size?g.tiles[y*g.size+x]:null;const land=q=>q&&q.terrain!=='unknown'&&q.terrain!=='water';const dirs=[[1,0],[0,1],[-1,0],[0,-1]],diags=[[1,1],[-1,1],[-1,-1],[1,-1]];let mask=0,diagonal=0;dirs.forEach(([x,y],i)=>{if(land(at(t.x+x,t.y+y)))mask|=1<<i;});diags.forEach(([x,y],i)=>{if(land(at(t.x+x,t.y+y)))diagonal|=1<<i;});if(mask===5)return 'river_y';if(mask===10)return 'river_x';if(mask)return `coast_${mask}`;if(diagonal)return `coast_inner_${diagonal}`;return terrainAsset(t);}

export function cliffAsset(g,t){let mask=0;[[1,0],[0,1],[-1,0],[0,-1]].forEach(([dx,dy],i)=>{const x=t.x+dx,y=t.y+dy;if(x>=0&&y>=0&&x<g.size&&y<g.size&&g.tiles[y*g.size+x].terrain==='water')mask|=1<<i;});return mask?'cliff_'+mask:null;}

// Uploaded terrain pack v1. Placement is visual only; logical grid stays 64x32.
terrainVariants.plain=['grass_01','grass_02','grass_03'];
terrainVariants.water=['water_01'];
for(const id of terrainVariants.plain)Object.assign(assets[id],{src:`/assets/terrain/${id}.png`,visualSize:[84,40],anchor:[.5,.47],tileOffset:[0,0],depthOffset:0});
Object.assign(assets.water_01,{src:'/assets/water/water_01.png',visualSize:[86,42],anchor:[.5,.5],tileOffset:[7/32,7/32],depthOffset:0});
for(const id of ['coast_1','coast_3','coast_7'])Object.assign(assets[id],{src:null,providedSource:`/assets/water/${id}.png`,disabledReason:'Painted coastline orientation does not match logical mask; redraw without rotation.',visualSize:[66,50],anchor:[.5,.6],tileOffset:[0,0],depthOffset:0});
for(const id of ['bridge_x','bridge_y'])Object.assign(assets[id],{src:null,providedSource:`/assets/bridges/${id}.png`,disabledReason:'Both decks use the same diagonal and include surrounding water/land; supply deck-only sprites with opposite axes.',visualSize:[80,64],anchor:[.5,.68],tileOffset:[0,0],depthOffset:0});
