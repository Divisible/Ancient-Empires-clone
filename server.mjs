import http from 'node:http';
import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {createGame,view,act,botActions,TYPES} from './engine.mjs';
const rooms=new Map();const data=process.env.DATA_DIR||'/tmp/knyaz-data';await mkdir(data,{recursive:true});try{for(const r of JSON.parse(await readFile(data+'/rooms.json','utf8')))rooms.set(r.code,r);}catch(e){if(e.code!=='ENOENT')throw e;}
let saving=Promise.resolve();function save(){const snapshot=JSON.stringify([...rooms.values()]);saving=saving.then(async()=>{await writeFile(data+'/rooms.tmp',snapshot);await rename(data+'/rooms.tmp',data+'/rooms.json');}).catch(console.error);}
const token=()=>randomBytes(24).toString('hex');
function publicRoom(r,seat){return {code:r.code,host:seat===0,you:seat,players:r.seats.map((p,i)=>({name:p.name,bot:p.bot,id:i})),count:r.count,game:r.game?view(r.game,seat):null,types:TYPES};}
const botJobs=new WeakMap();
function stepBots(r){
 if(!r.game||r.game.winner!==null||!r.game.players[r.game.turn].bot||botJobs.has(r))return;
 const job={iterator:botActions(r.game)};botJobs.set(r,job);
 function tick(){
  if(r.game.winner!==null){botJobs.delete(r);return;}
  try{const result=job.iterator.next();save();if(result.done){botJobs.delete(r);stepBots(r);}else job.timer=setTimeout(tick,1100);}
  catch(error){botJobs.delete(r);console.error('Bot action failed:',error.message);}
 }
 job.timer=setTimeout(tick,900);
}
for(const room of rooms.values())stepBots(room);
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(url.pathname==='/healthz'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({status:'ok'}));return;}if(url.pathname.startsWith('/api/')){res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');let body={};if(req.method==='POST'){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>10000)throw Error('Слишком большой запрос');}body=JSON.parse(raw||'{}');}
 let result;
 if(url.pathname==='/api/create'&&req.method==='POST'){if(rooms.size>=200)throw Error('Лимит комнат');const count=Number(body.count);if(![2,3,4].includes(count))throw Error('Нужно 2–4 игрока');const code=randomBytes(4).toString('hex').toUpperCase(),key=token();const r={code,count,seats:[{name:String(body.name||'Князь').slice(0,24),key,bot:false}],game:null};rooms.set(code,r);result={code,key};save();}
 else if(url.pathname==='/api/join'&&req.method==='POST'){const r=rooms.get(String(body.code).toUpperCase());if(!r||r.game||r.seats.length>=r.count)throw Error('Комната закрыта или не найдена');const key=token();r.seats.push({name:String(body.name||'Гость').slice(0,24),key,bot:false});result={code:r.code,key};save();}
 else {const code=url.searchParams.get('code')||body.code,r=rooms.get(code);const key=req.headers.authorization?.replace(/^Bearer /,'');const seat=r?.seats.findIndex(p=>p.key===key&&!p.bot);if(!r||seat<0||seat===undefined)throw Error('Нет доступа к комнате');
 if(url.pathname==='/api/state'&&req.method==='GET')result=publicRoom(r,seat);
 else if(url.pathname==='/api/start'&&req.method==='POST'){if(seat!==0||r.game)throw Error('Только создатель запускает матч');while(r.seats.length<r.count)r.seats.push({name:`Дружина ${r.seats.length+1}`,bot:true,key:token()});r.game=createGame(r.seats.map(p=>({name:p.name,bot:p.bot})));stepBots(r);save();result=publicRoom(r,seat);}
 else if(url.pathname==='/api/replace'&&req.method==='POST'){if(!r.game||r.game.winner!==null)throw Error('Матч не идёт');const target=Number(body.player);if(!Number.isInteger(target)||target<0||target>=r.count||(seat!==0&&seat!==target)||target===0&&seat!==0)throw Error('Нет права заменить игрока');r.seats[target].bot=true;r.game.players[target].bot=true;stepBots(r);save();result={ok:true};}
 else if(url.pathname==='/api/action'&&req.method==='POST'){if(!r.game)throw Error('Матч не начат');act(r.game,seat,body.action||{});stepBots(r);save();result=publicRoom(r,seat);}
 else throw Error('Неизвестный запрос');}
 res.end(JSON.stringify(result));return;}
 const files={'/':'index.html','/app.js':'app.js','/style.css':'style.css','/tactics.js':'tactics.js','/changelog.js':'changelog.js','/visual/renderer.js':'visual/renderer.js','/visual/projection.js':'visual/projection.js','/visual/sprites.js':'visual/sprites.js','/visual/terrain.js':'visual/terrain.js'};const file=files[url.pathname];if(!file){res.writeHead(404);res.end('Not found');return;}res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html; charset=utf-8');res.end(await readFile(new URL('./web/'+file,import.meta.url)));
 }catch(e){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:e.message}));}});
server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Княжьи земли: порт '+(process.env.PORT||3000)));
