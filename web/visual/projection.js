export const TILE_W=64,TILE_H=32;
export function dimensions(size){return {width:size*TILE_W+48,height:size*TILE_H+128};}
export function project(x,y,size){return {x:(x-y)*TILE_W/2+size*TILE_W/2+24,y:(x+y)*TILE_H/2+80};}
export function unproject(px,py,size){const dx=(px-size*TILE_W/2-24)/(TILE_W/2),dy=(py-80)/(TILE_H/2);const x=Math.round((dx+dy)/2),y=Math.round((dy-dx)/2);return x>=0&&y>=0&&x<size&&y<size?{x,y}:null;}
export function depthCompare(a,b){return (a.x+a.y)-(b.x+b.y)||(a.layer??0)-(b.layer??0)||a.x-b.x;}
