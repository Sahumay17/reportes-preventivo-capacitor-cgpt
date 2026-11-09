// Envoltura mínima de IndexedDB para guardar fotos y firmas como Blob.
const DB="rp-store",ST="blobs";let dbp;
const open=()=>dbp||(dbp=new Promise((res,rej)=>{if(typeof indexedDB==="undefined")return rej(new Error("IndexedDB no disponible"));const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(ST);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}));
const run=(mode,f)=>open().then(db=>new Promise((res,rej)=>{const t=db.transaction(ST,mode),r=f(t.objectStore(ST));t.oncomplete=()=>res(r.result);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)}));
export const available=()=>open().then(()=>true,()=>false);
export const put=(k,b)=>run("readwrite",s=>s.put(b,k));
export const get=k=>run("readonly",s=>s.get(k));
export const del=k=>run("readwrite",s=>s.delete(k));
export const clear=()=>run("readwrite",s=>s.clear());
