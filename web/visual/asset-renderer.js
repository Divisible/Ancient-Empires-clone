import {assets} from './asset-registry.js';
import {loadImage} from './asset-loader.js';
import {project} from './projection.js';
export function assetBounds(entry,x,y,size){const p=project(x+(entry.tileOffset?.[0]||0),y+(entry.tileOffset?.[1]||0),size),[w,h]=entry.visualSize;return {x:p.x-w*entry.anchor[0],y:p.y-h*entry.anchor[1],width:w,height:h,anchor:p};}
export function frameAt(animation,time=0){const frames=animation?.frames;if(!frames?.length)return null;const i=Math.floor(Math.max(0,time)/Math.max(1,animation.frameMs||140));return frames[animation.loop?i%frames.length:Math.min(i,frames.length-1)];}
export function assetDepth(item){return item.x+item.y+(assets[item.assetId]?.depthOffset||0);}
export function compareAssetDepth(a,b){return assetDepth(a)-assetDepth(b)||(a.layer??0)-(b.layer??0)||a.x-b.x;}
export function drawAsset(c,id,x,y,size,{state='idle',time=0,owner=null,color='#c7b77d'}={}){
 const entry=assets[id];if(!entry||!entry.anchor?.every(v=>Number.isFinite(v)&&v>=0&&v<=1)||!entry.visualSize?.every(v=>Number.isFinite(v)&&v>0))return false;
 const animation=entry.animations?.[state];const owned=entry.ownership?.variants?.[owner];const src=owned?.[state]||animation?.src||owned?.idle||entry.src||entry.animations?.idle?.src;
 const image=loadImage(src);if(!image)return false;
 const bounds=assetBounds(entry,x,y,size),frame=frameAt(animation?.src||owned?.[state]?animation:entry.animations?.idle,time);
 const [sx,sy,sw,sh]=frame||[0,0,image.naturalWidth,image.naturalHeight];
 if(![sx,sy,sw,sh,bounds.width,bounds.height].every(Number.isFinite)||sx<0||sy<0||sw<=0||sh<=0||bounds.width<=0||bounds.height<=0||sx+sw>image.naturalWidth||sy+sh>image.naturalHeight)return false;
 c.save();c.imageSmoothingEnabled=false;c.drawImage(image,sx,sy,sw,sh,bounds.x,bounds.y,bounds.width,bounds.height);
 if(entry.ownership?.mode==='flag'){const [dx,dy]=entry.ownership.offset||[0,-40],px=bounds.anchor.x+dx,py=bounds.anchor.y+dy;c.fillStyle='#d6c89e';c.fillRect(px,py,1,17);c.fillStyle=color;c.fillRect(px+1,py,10,6);}c.restore();return true;
}
