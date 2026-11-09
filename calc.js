// Cálculos puros: reciben el objeto de valores `v` y devuelven resultados. Sin DOM.
import {DIA,DS,SEM,GAS,MR,ET,GR,GA,RM,RN,ANZ,MGAS} from "./data.js";
export const num=(v,k)=>{const x=parseFloat(String(v[k]??"").replace(",","."));return Number.isNaN(x)?null:x};
const rank={"":-1,good:0,warn:1,bad:2};
const worst=a=>a.reduce((m,s)=>rank[s]>rank[m]?s:m,"");

/* ---------- Criterios comunes de gases ---------- */
// Presión del cilindro (PSI): >=700 correcto, 500-700 precaución, <500 warning
export const pressureStatus=t=>t==null?"":t<500?"bad":t<700?"warn":"good";
// Vigencia (meses): >=8 correcto, 4-8 precaución, <4 o caducado warning
export function expiryStatus(e,ref){const m=(new Date(e)-new Date(ref))/864e5/30.44;return{m,st:m<4?"bad":m<8?"warn":"good",txt:m<0?"gas caducado":m<4?"vigencia menor a 4 meses":m<8?"vigencia entre 4 y 8 meses":""}}

/* ---------- Inspección CEM's ---------- */
export function gasFields(v,id,tg,hx){const t=num(v,id+"_t"),s=num(v,id+"_s"),e=v[id+"_e"],o={t:"",s:"",e:"",why:[]};
 if(t!=null){o.t=pressureStatus(t);if(o.t==="bad")o.why.push("presión menor a 500 PSI");else if(o.t==="warn")o.why.push("presión entre 500 y 700 PSI")}
 if(tg&&s!=null){o.s=Math.abs(s-tg)>.2?"bad":"good";if(o.s==="bad")o.why.push("presión de salida fuera de rango")}
 if(hx&&e&&v.fecha){const x=expiryStatus(e,v.fecha);o.e=x.st;if(x.txt)o.why.push(x.txt)}
 o.full=t!=null&&(!tg||s!=null)&&(!hx||!!e);return o}
export function gasState(v,id,tg,hx){const f=gasFields(v,id,tg,hx),w=worst([f.t,f.s,f.e]);return{st:w==="warn"||w==="bad"?w:f.full?"good":"",why:f.why.join(" · ")}}
export function cemsRows(v){const rows=[];
 DIA.forEach((t,i)=>{const a=DS.map((_,j)=>v[`d${i}_${j}`]);rows.push({id:"d"+i,sec:"Revisión diaria",t,days:a,st:a.includes("obs")?"bad":a.every(x=>x==="ok")?"good":""})});
 SEM.forEach(([id,t,ty,a,b])=>{let st="";if(ty==="ok")st=v[id]==="ok"?"good":v[id]==="obs"?"bad":"";else{const n=num(v,id);if(n!=null)st=(a!=null&&n<a)||(b!=null&&n>b)?"bad":"good"}rows.push({id,sec:"Revisión semanal",t,ty,st})});
 GAS.forEach(([id,n,c,tg,hx])=>{const g=gasState(v,id,tg,hx);rows.push({id,sec:"Gases",t:n+(c?" · "+c:""),st:g.st,why:g.why})});
 return rows}
export const cemsCount=rows=>rows.reduce((o,r)=>{o[r.st||"pending"]=(o[r.st||"pending"]||0)+1;return o},{good:0,warn:0,bad:0,pending:0});

/* ---------- Pesadoras ---------- */
export function pcalc(v,p,n){const avg=a=>{const f=a.filter(x=>x!=null);return f.length?f.reduce((s,x)=>s+x,0)/f.length:null};
 const cs=[...Array(n)].map((_,i)=>{const th=num(v,`p_${p}th_${i}`),ta=num(v,`p_${p}ta_${i}`),ne=num(v,`p_${p}ne_${i}`),rg=num(v,`p_${p}rg_${i}`);
  return{th,ta,ne,rg,cm:ta!=null&&ne!=null?ta+ne:null,er:rg!=null&&ne!=null?rg-ne:null,pe:rg!=null&&ne?(rg-ne)/ne*100:null}});
 const A={};MR.forEach(([r])=>A[r]=avg(cs.map(c=>c[r])));return{cs,A}}
export const addMonths=(iso,m)=>{const [y,mo,d]=iso.split("-").map(Number);return new Date(Date.UTC(y,mo-1+m,d)).toISOString().slice(0,10)};
export function pst(v){const a=pcalc(v,"a",3),b=pcalc(v,"b",1),K=num(v,"p_k"),tol=num(v,"p_tol"),pe=b.A.pe,pa=a.A.pe,vig=num(v,"p_pvig"),fc=v.p_fcal;
 const venc=fc&&vig!=null&&/^\d{4}-\d{2}-\d{2}$/.test(fc)?addMonths(fc,vig):null;
 return{a,b,pe,pa,tol,kf:a.A.ne!=null&&a.A.rg&&K!=null?a.A.ne/a.A.rg*K:null,ok:pe!=null&&tol!=null?Math.abs(pe)<=tol:null,oka:pa!=null&&tol!=null?Math.abs(pa)<=tol:null,venc,vencido:!!(venc&&v.fecha&&venc<v.fecha)}}

/* ---------- Gases patrón ---------- */
export const mgm=(v,g)=>{const c=num(v,"g_c_"+g),m=num(v,"g_m_"+g);return c!=null&&m!=null?m*c/22.4:null};
export const gpat=(v,id)=>({o2z:()=>num(v,"g_c_o2"),o2s:()=>num(v,"g_p_o2s"),tcz:()=>0,tcs:()=>num(v,"g_c_c3"),so2:()=>mgm(v,"so2"),co:()=>mgm(v,"co"),no:()=>mgm(v,"no"),co2:()=>num(v,"g_c_co2")}[id]());
export function gerr(v,id){const p=gpat(v,id),r=num(v,"g_r_"+id),t=num(v,"g_tol");if(p==null||r==null)return{p,r,e:null,d:null,st:""};if(p===0)return{p,r,e:null,d:r-p,st:""};const e=(r-p)/p*100;return{p,r,e,d:null,st:t==null?"":Math.abs(e)<=t?"good":"bad"}}
export const gpr=(v,a)=>pressureStatus(num(v,"g_ps_"+a));

/* ---------- Pruebas estáticas ---------- */
export const ekt=v=>{const t=num(v,"e_temp");return t==null?null:Math.pow(.5,(40-t)/10)};
export function est(v){const kt=ekt(v),r=ET.map((_,i)=>num(v,"e_r_"+i)),c=r.map(x=>x!=null&&kt!=null?x*kt:null),min=num(v,"e_min"),dd=num(v,"e_dd");
 const ir=c[1],da=r[1]!=null&&r[0]?r[1]/r[0]:null,ip=c[10]!=null&&c[1]?c[10]/c[1]:null;
 const dI=ir==null||min==null?null:ir*1000<min?["Resistencia baja","bad"]:["Bien","good"];
 const dA=da==null?null:da<1?["Peligroso","bad"]:da<1.4?["Cuestionable","warn"]:da<1.6?["Bueno","good"]:["Excelente","good"];
 const dP=ip==null?null:ip<1?["Peligroso","bad"]:ip<2?["Cuestionable","warn"]:ip<4?["Bueno","good"]:["Excelente","good"];
 const dD=dd==null?null:dd<2?["Bueno","good"]:dd<=4?["Crítico","warn"]:["Malo","bad"];
 return{kt,r,c,min,dd,ir,da,ip,d:[dI,dA,dP,dD],v:[ir,da,ip,dd]}}

/* ---------- Dosificadores Pfister ---------- */
export function fst(v){const nom=num(v,"f_nom"),si=num(v,"f_si"),sf=["f_s1","f_s2","f_s3"].map(k=>num(v,k)).filter(x=>x!=null),tol=num(v,"f_tol"),fp=num(v,"f_fp");
 const ei=nom&&si!=null?100-si*100/nom:null,ef=nom&&sf.length?100-(sf.reduce((a,b)=>a+b,0)/sf.length)*100/nom:null,ok=(e,bad)=>e==null||tol==null?"":Math.abs(e)<=tol?"good":bad;
 const rep=ks=>{const a=ks.map(k=>num(v,k)).filter(x=>x!=null);return a.length>1?Math.max(...a)-Math.min(...a):null};
 return{ei,ef,tol,sti:ok(ei,"warn"),stf:ok(ef,"bad"),stp:ok(fp,"bad"),repS:rep(["f_s1","f_s2","f_s3"]),repC:rep(["f_c1","f_c2","f_c3"])}}

/* ---------- AST ---------- */
export function rk(s,p){s=parseInt(s);p=parseInt(p);if(!(s>=1&&s<=5&&p>=1&&p<=5))return null;const c=RM[s][p-1];return{v:s*p,c,n:RN[c][0],k:RN[c][1]}}
export const astSteps=v=>Math.min(15,Math.max(1,parseInt(v.a_n)||5));
export const astExec=v=>Math.min(10,Math.max(1,parseInt(v.a_ne)||3));
export function astSummary(v){let mx=0,bad=0,steps=0;for(let i=0;i<astSteps(v);i++){if(v["a_pa"+i])steps++;[0,1].forEach(j=>{const r=rk(v[`a_s${i}_${j}`],v[`a_q${i}_${j}`]);if(r&&!j&&r.v>mx)mx=r.v;if(r&&r.v>=10)bad++})}return{mx,bad,steps}}
export const sameReviewer=v=>{const a=(v.a_rn||"").trim().toLowerCase();return !!a&&a===(v.a_an||"").trim().toLowerCase()};

/* ---------- Analizadores del precalentador (441-2K1 / 461-2K1) ---------- */
// Error % entre el valor medido y la referencia
export const errPct=(med,ref)=>med==null||ref==null||ref===0?null:(med-ref)/ref*100;
export function anzSteps(v,p){return ANZ[p].steps.map((s,i)=>{const c=v[`${p}_s${i}`],cs=c==="ok"?"good":c==="obs"?"bad":"",n=s.v?num(v,`${p}_v${i}`):null;
 const vs=s.v&&s.v.max!=null&&n!=null?((s.v.strict?n<s.v.max:n<=s.v.max)?"good":"bad"):"";return{i,t:s.t,v:s.v,cs,vs,st:cs===""?"":worst([cs,vs])}})}
export function anzMonthly(v,p){const tol=num(v,p+"_tol"),st=e=>e==null||tol==null?"":Math.abs(e)<=tol?"good":"bad",g={};
 for(const gx of MGAS){const id=`${p}_g_${gx.id}`,f=gasFields(v,id,gx.kind==="p"?0:2,gx.kind==="p"?0:1),o={f},conc=num(v,id+"_c");
  if(gx.kind==="ie"){o.eI=errPct(num(v,id+"_ini"),conc);o.eF=errPct(num(v,id+"_fin"),conc);o.sI=st(o.eI);o.sF=st(o.eF)}
  if(gx.kind==="zs"){o.eZ=errPct(num(v,id+"_z"),conc);o.eS=errPct(num(v,id+"_sp"),num(v,id+"_sr"));o.sZ=st(o.eZ);o.sS=st(o.eS)}
  o.st=worst([f.t,f.s,f.e,o.sI,o.sF,o.sZ,o.sS].filter(Boolean));g[gx.id]=o}
 return{tol,g,real:v[p+"_mreal"]==="si"}}
