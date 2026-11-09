// Interfaz: pestañas, pintado, eventos, validación, fotos, firmas, borradores y generación del PDF.
import {$,$$,blobToDataURL,fileName} from "./util.js";
import {FORMATS,MAX_PHOTOS,DEFAULT_FOLDER} from "./data.js";
import * as S from "./store.js";
import {check} from "./validate.js";
import {compress} from "./img.js";
import {builders} from "./pdf/index.js";
import {FORMS} from "./forms/index.js";
import {demo,okAll} from "./demo.js";
const {V,PH}=S;
const DEV=new URLSearchParams(location.search).get("dev")==="1"||location.hash==="#dev";
const cycle=x=>x==="ok"?"obs":x==="obs"?"":"ok";
let logoP=null;const getLogo=()=>logoP||(logoP=window.__LOGO__?Promise.resolve(window.__LOGO__):fetch("logo.png").then(r=>r.blob()).then(blobToDataURL).catch(()=>null));

/* ---- Avisos ---- */
const warns=new Map();
export function warn(key,text){if(text)warns.set(key,text);else warns.delete(key);$("#warn").innerHTML=[...warns.values()].map(t=>`<p>${t}</p>`).join("")}

/* ---- Pintado ---- */
const ctx={V,paint:()=>paint()};
let saveT;const scheduleSave=()=>{clearTimeout(saveT);saveT=setTimeout(()=>{warn("quota",S.saveDraft()?null:"No se pudo guardar el borrador: el almacenamiento del navegador está lleno. Exporta un respaldo (.json) o genera el PDF ahora.")},500)};
const errFor=el=>{let s=el.nextElementSibling;if(!s||!s.classList.contains("err")){s=document.createElement("small");s.className="err";s.setAttribute("role","alert");el.after(s)}return s};
function validateAll(){let n=0;$$("[data-type]").forEach(el=>{if(el.closest("[hidden]"))return;const msg=check(el.dataset.k,V[el.dataset.k],el.dataset.type);errFor(el).textContent=msg;el.setAttribute("aria-invalid",msg?"true":"false");if(msg)n++});return n}
export function paint(){const m=V.fm||"c",F=FORMATS.find(f=>f.id===m);
 $$("[data-form]").forEach(d=>d.hidden=d.dataset.form!==m);$("#ttl").textContent=F.title;$("#sub").textContent=F.sub;$("#inspw").hidden=m==="a";
 $$("[data-f]").forEach(b=>{b.className="chip"+(b.dataset.f===m?" on":"");b.setAttribute("aria-selected",b.dataset.f===m)});
 $$("[data-k]").forEach(e=>{const k=e.dataset.k;if(e.matches("input,textarea,select")){const v=V[k]??"";if(typeof v==="string"&&e.value!==v)e.value=v}
  else if(e.dataset.c!==undefined){const x=V[k];e.className="chip "+(x||"");e.textContent=e.dataset.c+(x==="ok"?" OK":x==="obs"?" Obs":"")}
  else if(e.dataset.v!==undefined){const on=V[k]===e.dataset.v;e.className="chip"+(on?(e.dataset.v==="obs"?" obs":" on"):"")}});
 FORMS[m].update(V,$("#F_"+m));const n=validateAll();
 $("#sum").innerHTML=FORMS[m].summary(V)+`<br><b>${PH.length}</b> fotos`+(n?`<br><span class="t-bad">${n} campo(s) con error: revísalos antes de generar el PDF</span>`:"");
 $$(".sigp").forEach(img=>{const k=img.dataset.sk,u=S.sigUrl(k);img.hidden=!(V[k]&&u);if(u&&img.src!==u)img.src=u;img.previousElementSibling.textContent=V[k]?"Volver a firmar":"Firmar"});
 $("#ptitle").textContent=`${F.title} · ${V.fecha||""}${V.insp&&m!=="a"?" · "+V.insp:""}`;scheduleSave()}

/* ---- Fotos ---- */
function renderPhotos(){const p=$("#P");p.innerHTML="";PH.forEach((f,i)=>{const w=document.createElement("div");w.className="ph";w.innerHTML=`<img alt="Foto ${i+1}" src="${S.photoUrl(f.id)||""}"><input data-cap="${i}" placeholder="Descripción de la foto" aria-label="Descripción foto ${i+1}"><button type="button" class="chip" data-rp="${i}">Quitar</button>`;w.querySelector("input").value=f.c;p.append(w)});
 $("#fmsg").textContent=PH.length?`${PH.length}/${MAX_PHOTOS} fotos · ${(S.photoBytes()/1024).toFixed(0)} KB (se reducen a 800 px)`:""}
async function addPhotos(files){const msg=$("#fmsg");for(const f of files){if(PH.length>=MAX_PHOTOS){msg.textContent=`Máximo ${MAX_PHOTOS} fotos por reporte.`;break}try{const {blob,w,h}=await compress(f);await S.addPhoto(blob,w,h)}catch{msg.textContent="No se pudo procesar una imagen."}}
 renderPhotos();paint();const e=await S.estimate();warn("est",e&&e.ratio>.8?"El almacenamiento del dispositivo está casi lleno: libera espacio o genera el PDF ahora.":null)}

/* ---- Firma ---- */
function sign(k){const o=document.createElement("div");o.className="modal";
 o.innerHTML=`<div class="mbox"><p><b>Firma con el dedo o con el stylus</b></p><canvas aria-label="Área de firma"></canvas><div class="mrow"><button type="button" class="btn" data-a="x">Cancelar</button><button type="button" class="btn" data-a="c">Limpiar</button>${V[k]?`<button type="button" class="btn" data-a="d">Borrar firma</button>`:""}<button type="button" class="btn pri" data-a="s">Guardar</button></div></div>`;
 document.body.append(o);const cv=o.querySelector("canvas"),r=cv.getBoundingClientRect(),dp=window.devicePixelRatio||1;cv.width=r.width*dp;cv.height=r.height*dp;
 const g=cv.getContext("2d");g.scale(dp,dp);g.lineWidth=2.2;g.lineCap=g.lineJoin="round";g.strokeStyle="#000";let d=false,dr=false;
 const pt=e=>{const b=cv.getBoundingClientRect();return[e.clientX-b.left,e.clientY-b.top]};
 cv.onpointerdown=e=>{d=dr=true;cv.setPointerCapture(e.pointerId);const[x,y]=pt(e);g.beginPath();g.moveTo(x,y);g.lineTo(x+.1,y+.1);g.stroke()};
 cv.onpointermove=e=>{if(!d)return;const[x,y]=pt(e);g.lineTo(x,y);g.stroke()};cv.onpointerup=cv.onpointercancel=()=>{d=false};
 o.onclick=async e=>{const a=e.target.dataset.a;if(!a)return;if(a==="x")o.remove();else if(a==="c"){g.clearRect(0,0,cv.width,cv.height);dr=false}
  else if(a==="d"){await S.clearSig(k);o.remove();paint()}else if(dr){const b=await new Promise(res=>cv.toBlob(res,"image/png"));await S.setSig(k,b);o.remove();paint()}}}

/* ---- Guardar / compartir ---- */
async function saveFile(name,blob){
 if(window.claude&&window.claude.use){try{const dl=await window.claude.use("downloads");if(dl){await dl.save({filename:name,data:blob});return "Listo: "+name}}catch(e){if(e&&e.code==="declined")return "Guardado cancelado."}}
 const f=new File([blob],name,{type:blob.type});
 if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:name});return "Elige Google Drive y la carpeta destino en el menú de compartir."}catch(e){if(e&&e.name==="AbortError")return "Guardado cancelado."}}
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);return "Archivo descargado: "+name}
async function generate(){const m=$("#msg");m.textContent="";
 if(V.fm!=="a"&&!(V.insp||"").trim()){m.textContent="Escribe el nombre del inspector antes de generar el PDF.";$("#insp").focus();return}
 const n=validateAll();if(n){m.textContent=`Corrige ${n} campo(s) marcado(s) en rojo antes de generar el PDF.`;const bad=$("[aria-invalid=true]");bad&&bad.focus();return}
 if(!window.jspdf){m.textContent="No se pudo cargar la herramienta de PDF (necesita internet la primera vez). Puedes imprimir esta pantalla y guardarla como PDF.";$("#print").hidden=false;return}
 try{const as=await S.pdfAssets(await getLogo());m.textContent=await saveFile(fileName(V),builders[V.fm]({v:V,photos:as.photos,assets:as}))}catch(e){console.error(e);m.textContent="No se pudo generar el PDF."}}

/* ---- Arranque ---- */
export async function init(){
 document.body.classList.toggle("dev",DEV);
 $("#fsel").innerHTML=FORMATS.map(f=>`<button type="button" class="chip" role="tab" data-f="${f.id}">${f.tab}</button>`).join("");
 $("#forms").innerHTML=FORMATS.map(f=>`<div id="F_${f.id}" data-form="${f.id}" hidden></div>`).join("");
 FORMATS.forEach(f=>FORMS[f.id].mount($("#F_"+f.id)));
 try{await S.loadDraft()}catch(e){console.error(e);warn("draft","No se pudo leer el borrador anterior: "+e.message)}
 if(!S.status.idb)warn("idb","Este navegador no permite guardar fotos y firmas entre sesiones: se conservarán solo mientras la página esté abierta.");
 if(!window.jspdf)warn("pdf","La herramienta de PDF no cargó (¿sin internet?). Puedes seguir capturando; para guardar usa “Imprimir / guardar como PDF”.");
 if(!window.jspdf)$("#print").hidden=false;
 S.persist();S.estimate().then(e=>{if(e&&e.ratio>.8)warn("est","El almacenamiento del dispositivo está casi lleno.")});
 V.fm=V.fm||"c";renderPhotos();
 try{$("#fol").value=localStorage.getItem("rp.folder")||DEFAULT_FOLDER}catch{}
 getLogo().then(l=>{if(l)$("#plogo").src=l});
 document.addEventListener("input",e=>{const el=e.target;if(el.dataset.cap!==undefined){PH[el.dataset.cap].c=el.value;scheduleSave();return}
  if(el.id==="fol"){try{localStorage.setItem("rp.folder",el.value)}catch{}return}const k=el.dataset.k;if(k===undefined||!el.matches("input,textarea,select"))return;V[k]=el.value;paint()});
 document.addEventListener("change",e=>{FORMS[V.fm].change&&FORMS[V.fm].change(e,ctx)});
 let armed=0;
 document.addEventListener("click",async e=>{const t=e.target;let b;
  if((b=t.closest("[data-f]"))){V.fm=b.dataset.f;paint();return}
  if((b=t.closest("button[data-k]"))){const k=b.dataset.k;V[k]=b.dataset.c!==undefined?cycle(V[k]):b.dataset.t?(V[k]?"":b.dataset.v):b.dataset.v;paint();return}
  if((b=t.closest("[data-sig]"))){sign(b.dataset.sig);return}
  if((b=t.closest("[data-rp]"))){await S.removePhoto(+b.dataset.rp);renderPhotos();paint();return}
  if((b=t.closest("[data-act]"))){if(b.dataset.act==="demo")demo[V.fm](V);else okAll(V);paint();return}
  if(FORMS[V.fm].click&&FORMS[V.fm].click(e,ctx))return;
  switch(t.id){
   case"pdf":return generate();case"print":return window.print();
   case"export":{const o=await S.exportDraft();$("#msg").textContent=await saveFile(`Respaldo Reportes Prev ${V.fecha||""}.json`,new Blob([JSON.stringify(o)],{type:"application/json"}));return}
   case"import":return $("#impf").click();
   case"nuevo":if(!armed){armed=setTimeout(()=>{armed=0;t.textContent="Nuevo reporte (borrar borrador)"},5000);t.textContent="¿Seguro? Toca otra vez para borrar";return}
    clearTimeout(armed);armed=0;t.textContent="Nuevo reporte (borrar borrador)";await S.newReport();renderPhotos();paint();$("#msg").textContent="Reporte nuevo listo.";return}});
 $("#f").addEventListener("change",async e=>{await addPhotos([...e.target.files]);e.target.value=""});
 $("#impf").addEventListener("change",async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;try{await S.importDraft(JSON.parse(await f.text()));renderPhotos();paint();$("#msg").textContent="Respaldo importado."}catch(x){$("#msg").textContent="No se pudo importar: "+x.message}});
 paint()}
