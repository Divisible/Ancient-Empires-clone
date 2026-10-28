import {realpath,readFile} from 'node:fs/promises';
import {resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {sourceAllowed} from './web/visual/asset-loader.js';
const root=fileURLToPath(new URL('./web/assets/',import.meta.url));
export async function serveAsset(path,res){if(!path.startsWith('/assets/'))return false;if(!sourceAllowed(path)){res.writeHead(404);res.end('Not found');return true;}try{const base=await realpath(root),target=await realpath(resolve(root,path.slice('/assets/'.length)));if(!target.startsWith(base+sep))throw Error('Outside assets');const bytes=await readFile(target);res.writeHead(200,{'Content-Type':path.endsWith('.webp')?'image/webp':'image/png','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});res.end(bytes);}catch{res.writeHead(404);res.end('Not found');}return true;}
