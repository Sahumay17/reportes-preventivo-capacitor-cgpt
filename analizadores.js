// Formularios 441-2K1 y 461-2K1: inspección semanal (1S) + verificación mensual con gases patrón (1M).
import {ANZ,ANZ_INSTR,MGAS} from "../data.js";
import {anzSteps,anzMonthly,cemsCount} from "../calc.js";
import {esc,f2} from "../util.js";
import {fld,nin,tag,devBtn} from "./common.js";
const PS={bad:"Warning",warn:"Precaución",good:"Correcto"},RV={bad:"Revisar",warn:"Precaución",good:"Correcto"};
const chip=(k,v,t,extra="")=>`<button type="button" class="chip" data-k="${k}" data-v="${v}"${extra}>${t}</button>`;
export function makeForm(p){
 const step=(s,i)=>`<div class="row" id="${p}_r${i}"><div class="top"><b>${esc(s.t)}</b><span class="st"></span></div><div class="chips">${chip(`${p}_s${i}`,"ok","OK")}${chip(`${p}_s${i}`,"obs","Obs")}</div>${s.v?fld([`${p}_v${i}`,s.v.l,"d"]):""}<label class="fl">Observaciones<input data-k="${p}_o${i}"></label></div>`;
 const eCell=(g,k)=>`<div class="cv" id="${p}_er_${g}_${k}"></div>`;
 const gas=g=>{const k=x=>`${p}_g_${g.id}_${x}`;let h=`<div class="row" id="${p}_gc_${g.id}"><div class="top"><b>${g.n}</b><span class="st"></span></div>`;
  if(g.c)h+=fld([k("c"),g.c.replace(":",""),"d"]);
  h+=fld([k("t"),"Revisión presión total del cilindro (PSI)","d"]);
  if(g.kind!=="p")h+=fld([k("s"),"Revisión presión de salida del cilindro (2 BAR)","d"])+fld([k("e"),"Fecha de caducidad del gas","date"]);
  h+=`<p class="fs m"></p>`;
  const rd=(key,l)=>`<p class="m sub">${l}</p><div class="g2">${nin(k(key),g.n+" "+l)}${eCell(g.id,key)}</div>`;
  if(g.kind==="ie")h+=rd("ini","Inicial")+rd("fin","Final (Después de calibración)");
  if(g.kind==="zs")h+=rd("z","ZERO")+fld([k("sr"),"Referencia del SPAN","d"])+rd("sp","SPAN");
  return h+`</div>`};
 return{id:p,
  mount(el){el.innerHTML=`${devBtn("demo",`Cargar datos de ejemplo (archivo ${ANZ[p].eq})`)}<div class="row">${fld([p+"_eq","Equipo"])}<p class="m">${esc(ANZ_INSTR)}</p></div>
<h2>Inspección semanal</h2>${ANZ[p].steps.map(step).join("")}
<h2>Verificación con gases patrón (mensual)</h2><div class="row"><div class="chips">${chip(p+"_mreal","no","NO REALIZADO")}${chip(p+"_mreal","si","REALIZADO")}</div><p class="m">Toque REALIZADO cuando haga la verificación mensual.</p></div>
<div id="${p}_mon"><div class="row"><b>Realizar limpieza y sopleteo al cuarto de tanques</b><div class="chips">${chip(p+"_lt","ok","OK")}${chip(p+"_lt","obs","Obs")}</div></div>
<div class="row">${fld([p+"_tol","Error aceptable ± (%)","d"])}<p class="m">Se calcula entre el valor medido y la referencia: (medido − referencia) / referencia × 100. Fuera de ese porcentaje se marca ERROR.</p></div>
${MGAS.map(gas).join("")}</div>`},
  update(v,el){anzSteps(v,p).forEach(r=>{const e=el.querySelector(`#${p}_r${r.i}`);e.className="row "+r.st;e.querySelector(".st").textContent=RV[r.st]||""});
   const M=anzMonthly(v,p);el.querySelector(`#${p}_mon`).hidden=!M.real;
   const ec=(g,k,e,s)=>{const c=el.querySelector(`#${p}_er_${g}_${k}`);if(!c)return;c.className="cv"+(s?" t-"+s:"");c.textContent=e==null?"":f2(e,2)+" %"+(s==="bad"?" · ERROR":"")};
   MGAS.forEach(g=>{const o=M.g[g.id],e=el.querySelector(`#${p}_gc_${g.id}`),f=o.f;e.className="row "+(o.st||"");e.querySelector(".st").textContent=RV[o.st]||"";
    e.querySelector(".fs").innerHTML=[["Presión total",f.t],["Salida",f.s],["Caducidad",f.e]].filter(x=>x[1]).map(([l,s])=>`${l}: ${tag(s,PS[s])}`).join(" · ")+(f.why.length?`<br>${f.why.join(" · ")}`:"");
    if(g.kind==="ie"){ec(g.id,"ini",o.eI,o.sI);ec(g.id,"fin",o.eF,o.sF)}if(g.kind==="zs"){ec(g.id,"z",o.eZ,o.sZ);ec(g.id,"sp",o.eS,o.sS)}})},
  summary(v){const c=cemsCount(anzSteps(v,p)),M=anzMonthly(v,p);let h=`Inspección semanal: <b>${c.good}</b> correctos · <b>${c.bad}</b> a revisar · <b>${c.pending}</b> pendientes`;
   h+=`<br>Verificación mensual: <b>${M.real?"REALIZADA":"NO REALIZADA"}</b>`;
   if(M.real){const bad=MGAS.filter(g=>M.g[g.id].st==="bad"||M.g[g.id].st==="warn");h+=bad.length?`<ul>${bad.map(g=>`<li>${M.g[g.id].st==="bad"?"Revisar":"Precaución"}: ${esc(g.n)}</li>`).join("")}</ul>`:" · gases sin alertas"}
   return h}}}
export const h=makeForm("h"),i=makeForm("i");
