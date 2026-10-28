const images=new Map();let revision=0;
export function assetRevision(){return revision;}
export function sourceAllowed(src){return typeof src==='string'&&/^\/assets\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-][a-zA-Z0-9_.-]*\.(png|webp)$/.test(src);}
export function loadImage(src){if(!sourceAllowed(src))return null;let record=images.get(src);if(!record){record={status:'loading',image:null};images.set(src,record);const image=new Image();image.onload=()=>{record.status=image.naturalWidth&&image.naturalHeight?'ready':'failed';record.image=image;revision++;window.dispatchEvent(new Event('knyaz-assets-ready'));};image.onerror=()=>{record.status='failed';revision++;window.dispatchEvent(new Event('knyaz-assets-ready'));};image.src=src;}return record.status==='ready'?record.image:null;}
