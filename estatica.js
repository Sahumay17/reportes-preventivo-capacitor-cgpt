import {ET,ETL,EF,ER} from "../data.js";
import {est} from "../calc.js";
import {chartPrims,toSvg} from "../chart.js";
import {f2} from "../util.js";
import {fld,nin,devBtn} from "./common.js";
const row3="display:grid;grid-template-columns:.8fr 1fr 1fr;gap:6px";
export default{id:"e",
 mount(el){el.innerHTML=`${devBtn("demo","Cargar datos de ejemplo (prueba del 2026-05-25)")}<h2>Datos del motor</h2><div class="row">${EF.map(fld).join("")}</div>
<h2>Condiciones de la prueba</h2><div class="row">${fld(["e_temp","Temperatura de prueba (°C)","d"])}${fld(["e_vtest","Voltaje de prueba (VCD)","d"])}<p id="ekt"></p></div>
<h2>Lecturas de resistencia de aislamiento</h2><div class="row"><div style="${row3};font-size:12px;color:var(--mu)"><span>Tiempo</span><span>Medida (GOhms)</span><span>Corregida (GOhms)</span></div>${ET.map((_,i)=>`<div style="${row3};align-items:center;margin-top:6px"><span>${ETL[i]}</span>${nin("e_r_"+i,"Resistencia "+ETL[i])}<div class="cv" id="e_c_${i}"></div></div>`).join("")}</div>
<h2>Gráfica</h2><div class="row" id="ech"></div>
<h2>Resultados</h2>${ER.map((t,i)=>`<div class="row"><div class="top"><b>${t}</b><span class="st" id="e_d${i}"></span></div>`+(i===3?fld(["e_dd","Valor de DD","d"]):`<p>Resultado: <b id="e_v${i}">—</b></p>`)+(i===0?fld(["e_min","Resistencia mínima (MOhms)","d"]):"")+`<label class="fl">Observaciones<input data-k="e_o${i}"></label></div>`).join("")}
<h2>Datos adicionales de la prueba</h2><div class="row">${[["e_l12","Resistencia L1-L2 (mOhms)","d"],["e_l13","Resistencia L1-L3 (mOhms)","d"],["e_l23","Resistencia L2-L3 (mOhms)","d"],["e_na","nA","d"],["e_nf","nF","d"]].map(fld).join("")}<label class="fl">Nota<textarea data-k="e_nota"></textarea></label></div>`},
 update(v,el){const S=est(v);ET.forEach((_,i)=>{el.querySelector("#e_c_"+i).textContent=f2(S.c[i],3)});el.querySelector("#ekt").innerHTML="Factor Kt (corrección a 40 °C): <b>"+(S.kt==null?"—":S.kt.toFixed(4))+"</b>";
  [0,1,2,3].forEach(i=>{const x=el.querySelector("#e_v"+i),d=S.d[i],e=el.querySelector("#e_d"+i);if(x)x.textContent=f2(S.v[i],2)||"—";e.textContent=d?d[0]:"";e.className="st"+(d?" t-"+d[1]:"")});el.querySelector("#ech").innerHTML=toSvg(chartPrims(S))},
 summary(v){const S=est(v),n=["Resistencia de aislamiento","Factor de absorción","Índice de polarización","Descarga dieléctrica"];
  return n.map((x,i)=>`${x}: <b>${f2(S.v[i],2)||"—"}</b> `+(S.d[i]?`<span class="t-${S.d[i][1]}">${S.d[i][0]}</span>`:"")).join("<br>")}};
