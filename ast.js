import {HZ,AST_FIELDS} from "../data.js";
import {rk,astSteps,astExec,astSummary,sameReviewer} from "../calc.js";
import {esc} from "../util.js";
import {fld,sigBtn} from "./common.js";
const HZO='<option value="">Agregar peligro…</option>'+HZ.map(([t,l],g)=>`<optgroup label="${t}">${l.map((x,n)=>`<option value="${g}.${n}">${esc(x)}</option>`).join("")}</optgroup>`).join("");
const opt=(ph,arr)=>`<option value="">${ph}</option>`+arr.map((x,i)=>`<option value="${i+1}">${x}</option>`).join("");
const SO=opt("Severidad (S)",["1 Insignificante","2 Menor","3 Moderado","4 Mayor","5 Catastrófico"]),PO=opt("Probabilidad (P)",["1 Raro","2 Improbable","3 Probable","4 Probable","5 Casi seguro"]);
const ev=(i,j,t)=>`<p class="m sub strong">${t}</p><div class="g2"><select data-k="a_s${i}_${j}" aria-label="Severidad ${t}">${SO}</select><select data-k="a_q${i}_${j}" aria-label="Probabilidad ${t}">${PO}</select></div><p id="ar_${i}_${j}"></p>`;
const step=i=>`<div class="row" id="as_${i}"><b class="h3">Paso ${i+1}</b><label class="fl">Paso de la actividad<textarea data-k="a_pa${i}"></textarea></label><p class="m sub">Peligros</p><div id="ah_${i}" class="chips"></div><select data-h="${i}" aria-label="Agregar peligro paso ${i+1}">${HZO}</select><label class="fl">Controles implementados (NO SOLO EPP)<textarea data-k="a_co${i}"></textarea></label>${ev(i,0,"Evaluación de riesgo (controles implementados)")}<label class="fl">Controles adicionales<textarea data-k="a_ad${i}"></textarea></label>${ev(i,1,"Evaluación con controles adicionales")}</div>`;
const ejec=i=>`<div class="row" id="ae_${i}"><label class="fl">Ejecutante ${i+1}: nombre<input data-k="a_en${i}"></label>${sigBtn("a_es"+i)}</div>`;
export default{id:"a",
 mount(el){el.innerHTML=`<h2>Datos generales</h2><div class="row">${AST_FIELDS.map(fld).join("")}<label class="fl">Descripción de la actividad a realizar<textarea data-k="a_des"></textarea></label></div>
<h2>Pasos de la actividad</h2><p class="m">Si el nivel de riesgo es 10 o mayor no se puede iniciar la actividad y se deben aplicar controles adicionales.</p>${[...Array(15)].map((_,i)=>step(i)).join("")}<button class="btn" id="aadd" type="button">+ Agregar paso</button>
<h2>Personal involucrado en el AST</h2><b>Ejecutantes</b>${[...Array(10)].map((_,i)=>ejec(i)).join("")}<button class="btn" id="aadde" type="button">+ Agregar ejecutante</button>
<div class="row"><b>Revisado por</b><label class="fl">Nombre<input data-k="a_rn"></label><label class="fl">Puesto<input data-k="a_rp"></label>${sigBtn("a_rs")}</div>
<div class="row"><b>Autorizado por</b><label class="fl">Nombre<input data-k="a_an"></label><label class="fl">Puesto<input data-k="a_ap"></label>${sigBtn("a_as")}<p id="ardup" class="t-bad"></p></div>`},
 update(v,el){const n=astSteps(v),ne=astExec(v);
  for(let i=0;i<15;i++){el.querySelector("#as_"+i).hidden=i>=n;el.querySelector("#ah_"+i).innerHTML=(v["a_h"+i]||[]).map((t,j)=>`<button type="button" class="chip" data-rh="${i}|${j}" aria-label="Quitar ${esc(t)}">✕ ${esc(t)}</button>`).join("");
   [0,1].forEach(j=>{const r=rk(v[`a_s${i}_${j}`],v[`a_q${i}_${j}`]);el.querySelector(`#ar_${i}_${j}`).innerHTML=r?`Riesgo S×P = <b>${r.v}</b> <span class="t-${r.k}">${r.n}</span>`+(r.v>=10?` <span class="t-bad">· ${j?"No se puede iniciar la actividad":"No se puede iniciar: aplica controles adicionales"}</span>`:""):""})}
  for(let i=0;i<10;i++)el.querySelector("#ae_"+i).hidden=i>=ne;el.querySelector("#ardup").textContent=sameReviewer(v)?"El revisor y el autorizador deben ser personas distintas.":""},
 summary(v){const s=astSummary(v),sg=["a_rs","a_as",...[...Array(10)].map((_,i)=>"a_es"+i)].filter(k=>v[k]).length;
  return `Pasos con descripción: <b>${s.steps}</b><br>Riesgo máximo (evaluación inicial): <b>${s.mx||"—"}</b>`+(s.bad?`<br><span class="t-bad">${s.bad} evaluación(es) con riesgo 10 o mayor: no se puede iniciar sin controles adicionales</span>`:"")+`<br>Firmas capturadas: <b>${sg}</b>`},
 // Eventos propios del AST
 click(e,{V,paint}){const r=e.target.closest("[data-rh]");if(r){const [i,j]=r.dataset.rh.split("|").map(Number),h=V["a_h"+i]||[];h.splice(j,1);V["a_h"+i]=h;paint();return true}
  if(e.target.id==="aadd"){V.a_n=Math.min(15,astSteps(V)+1);paint();return true}if(e.target.id==="aadde"){V.a_ne=Math.min(10,astExec(V)+1);paint();return true}},
 change(e,{V,paint}){const i=e.target.dataset&&e.target.dataset.h;if(i!==undefined&&e.target.value){const [g,n]=e.target.value.split(".").map(Number),h=V["a_h"+i]||[],t=HZ[g][1][n];if(!h.includes(t))h.push(t);V["a_h"+i]=h;e.target.value="";paint();return true}}};
