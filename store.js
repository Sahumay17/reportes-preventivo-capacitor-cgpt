// Estado del reporte, borradores (localStorage con versión de esquema) y binarios (IndexedDB).
import {SCHEMA,DEFAULTS,SIG_KEYS} from "./data.js";
import {blobToDataURL,dataURLToBlob,today} from "./util.js";
import * as idb from "./idb.js";
export const V={};export const PH=[];
const KEY="rp.draft",OLD="bor",cache=new Map();
export const status={idb:true,quota:false};
export const hasBlob=k=>cache.has(k);
export const blobUrl=k=>cache.get(k)?.url;
const putBlob=async(k,b)=>{const o=cache.get(k);if(o)URL.revokeObjectURL(o.url);cache.set(k,{blob:b,url:URL.createObjectURL(b)});try{await idb.put(k,b)}catch{status.idb=false}};
const delBlob=async k=>{const o=cache.get(k);if(o){URL.revokeObjectURL(o.url);cache.delete(k)}try{await idb.del(k)}catch{}};
export const setSig=async(f,b)=>{await putBlob("sig:"+f,b);V[f]="1"};
export const clearSig=async f=>{await delBlob("sig:"+f);delete V[f]};
export const photoBytes=()=>PH.reduce((n,p)=>n+(cache.get("photo:"+p.id)?.blob.size||0),0);
export const sigUrl=f=>blobUrl("sig:"+f);
export const photoUrl=id=>blobUrl("photo:"+id);
export async function addPhoto(blob,w,h){const id=Date.now().toString(36)+Math.random().toString(36).slice(2,6);await putBlob("photo:"+id,blob);PH.push({id,c:"",w,h})}
export async function removePhoto(i){const [p]=PH.splice(i,1);if(p)await delBlob("photo:"+p.id)}
export function applyDefaults(){Object.entries(DEFAULTS).forEach(([k,d])=>{if(V[k]==null)V[k]=d});if(!V.fecha)V.fecha=today()}

/* Migración de borradores: sin "schema" = v1 (fotos y firmas como dataURL dentro del JSON) */
export function migrate(raw){
 if(raw.schema>SCHEMA)throw new Error("El borrador es de una versión más nueva de la app");
 if(!raw.schema){const v={...(raw.V||{})},sigs={};
  SIG_KEYS.forEach(k=>{if(typeof v[k]==="string"&&v[k].startsWith("data:")){sigs[k]=v[k];v[k]="1"}});
  if(v.p_tol==="0.5")v.p_tol="1";
  return{schema:SCHEMA,V:v,photos:(raw.FO||[]).filter(f=>f&&f.d).map((f,i)=>({id:"m"+i+Date.now().toString(36),c:f.c||"",w:f.w,h:f.h,dataURL:f.d})),sigs}}
 return{schema:SCHEMA,V:raw.V||{},photos:raw.photos||[],sigs:raw.sigs||{}}}
async function restore(m){
 Object.keys(V).forEach(k=>delete V[k]);Object.assign(V,m.V);PH.length=0;
 for(const [k,u] of Object.entries(m.sigs||{}))await putBlob("sig:"+k,dataURLToBlob(u));
 for(const k of SIG_KEYS)if(V[k]&&!cache.has("sig:"+k)){try{const b=await idb.get("sig:"+k);if(b)await putBlob("sig:"+k,b);else delete V[k]}catch{delete V[k]}}
 for(const p of m.photos||[]){let b=null;if(p.dataURL)b=dataURLToBlob(p.dataURL);else{try{b=await idb.get("photo:"+p.id)}catch{}}
  if(b){await putBlob("photo:"+p.id,b);PH.push({id:p.id,c:p.c||"",w:p.w,h:p.h})}}
 applyDefaults()}

export function saveDraft(){try{localStorage.setItem(KEY,JSON.stringify({schema:SCHEMA,V,photos:PH,ts:Date.now()}));status.quota=false;return true}catch{status.quota=true;return false}}
export async function loadDraft(){let raw=null;try{raw=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem(OLD)||"null")}catch{}
 status.idb=await idb.available();
 if(!raw){applyDefaults();return false}
 try{await restore(migrate(raw));try{localStorage.removeItem(OLD)}catch{}saveDraft();return true}catch(e){applyDefaults();throw e}}
export async function newReport(){const insp=V.insp,fm=V.fm;try{localStorage.removeItem(KEY);localStorage.removeItem(OLD)}catch{}
 for(const k of [...cache.keys()])await delBlob(k);try{await idb.clear()}catch{}
 Object.keys(V).forEach(k=>delete V[k]);PH.length=0;V.insp=insp;V.fm=fm;applyDefaults()}
export async function estimate(){try{const e=await navigator.storage.estimate();return{usage:e.usage||0,quota:e.quota||0,ratio:e.quota?(e.usage||0)/e.quota:0}}catch{return null}}
export const persist=()=>{try{return navigator.storage.persist()}catch{return Promise.resolve(false)}};

/* Respaldo .json (con fotos y firmas incrustadas) */
export async function exportDraft(){const photos=[];for(const p of PH){const o=cache.get("photo:"+p.id);photos.push({...p,dataURL:o?await blobToDataURL(o.blob):null})}
 const sigs={};for(const k of SIG_KEYS)if(V[k]&&cache.has("sig:"+k))sigs[k]=await blobToDataURL(cache.get("sig:"+k).blob);
 return{schema:SCHEMA,app:"Reportes Prev",exported:new Date().toISOString(),V,photos,sigs}}
export async function importDraft(obj){if(!obj||typeof obj!=="object"||!obj.V)throw new Error("El archivo no es un respaldo de Reportes Prev");await restore(migrate(obj));saveDraft()}
/* Binarios listos para el PDF */
export async function pdfAssets(logo){const sig={};for(const k of SIG_KEYS)if(V[k]&&cache.has("sig:"+k))sig[k]=await blobToDataURL(cache.get("sig:"+k).blob);
 const photos=[];for(const p of PH){const o=cache.get("photo:"+p.id);if(o)photos.push({...p,d:await blobToDataURL(o.blob)})}return{logo,sig,photos}}
