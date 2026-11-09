import {DIA,DS,SEM,GAS} from "../data.js";
import {cemsRows,cemsCount} from "../calc.js";
import {esc} from "../util.js";
import {devBtn} from "./common.js";
const top=t=>`<div class="top"><b>${t}</b><span class="st"></span></div><p class="why m"></p>`;
const obs=(id,t)=>`<textarea data-k="${id}_o" placeholder="Observación" aria-label="Observación de ${esc(t)}" hidden></textarea>`;
const chipsOK=id=>`<div class="chips"><button type="button" class="chip" data-k="${id}" data-v="ok">OK</button><button type="button" class="chip" data-k="${id}" data-v="obs">Obs</button></div>`;
export default{id:"c",
 mount(el){const d=DIA.map((t,i)=>`<div class="row" id="r_d${i}">${top(t)}<div class="chips">${DS.map((x,j)=>`<button type="button" class="chip" data-k="d${i}_${j}" data-c="${x}">${x}</button>`).join("")}</div>${obs("d"+i,t)}</div>`).join("");
  const w=SEM.map(([id,t,ty])=>`<div class="row" id="r_${id}">${top(t)}${ty==="ok"?chipsOK(id):`<input data-k="${id}" inputmode="decimal" data-type="num" aria-label="${esc(t)}"><small class="err" role="alert"></small>`}${obs(id,t)}</div>`).join("");
  const g=GAS.map(([id,n,c,tg,hx])=>`<div class="row" id="r_${id}">${top(n+(c?" · "+c:""))}<div class="g3"><label>Presión total (PSI)<input data-k="${id}_t" inputmode="decimal" data-type="num"></label>${tg?`<label>Salida (bar)<input data-k="${id}_s" inputmode="decimal" data-type="num"></label>`:"<span></span>"}${hx?`<label>Caducidad<input type="date" data-k="${id}_e" data-type="date"></label>`:"<span></span>"}</div>${obs(id,n)}</div>`).join("");
  el.innerHTML=`${devBtn("demo","Cargar datos de ejemplo (archivo del 2026-10-22)")}${devBtn("allok","Marcar todos los checks como OK")}<h2>Revisión diaria</h2>${d}<h2>Revisión semanal</h2>${w}<h2>Gases</h2>${g}`},
 update(v,el){cemsRows(v).forEach(r=>{const e=el.querySelector("#r_"+r.id);e.className="row "+r.st;e.querySelector(".st").textContent={bad:r.sec==="Gases"?"Warning":"Revisar",warn:"Precaución",good:"Correcto"}[r.st]||"";
  e.querySelector(".why").textContent=r.why||"";e.querySelector("textarea").hidden=r.st!=="bad"&&r.st!=="warn"&&!v[r.id+"_o"]})},
 summary(v){const rows=cemsRows(v),c=cemsCount(rows),bad=rows.filter(r=>r.st==="bad"||r.st==="warn");
  return `<b>${c.good}</b> correctos · <b>${c.warn}</b> en precaución · <b>${c.bad}</b> en warning/revisar · <b>${c.pending}</b> pendientes`+(bad.length?`<ul>${bad.map(r=>`<li>${r.st==="bad"?(r.sec==="Gases"?"Warning":"Revisar"):"Precaución"}: ${esc(r.t)}</li>`).join("")}</ul>`:"")}};
