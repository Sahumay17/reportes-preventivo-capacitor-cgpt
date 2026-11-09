// Gráfica de resistencia vs tiempo: geometría pura (la comparten la pantalla SVG y el PDF).
import {ET} from "./data.js";
import {f2} from "./util.js";
export function chartPrims(S){const P=[],L=70,R=620,T=40,B=240,pts=ET.map((t,i)=>[t,S.r[i],S.c[i]]).filter(p=>p[1]!=null&&p[2]!=null);
 if(!pts.length){P.push({k:"t",x:345,y:150,s:18,t:"Captura las lecturas y la temperatura para ver la gráfica",c:"mu",a:"c"});return P}
 const mx=Math.max(...pts.map(p=>Math.max(p[1],p[2]))),raw=mx/5,pw=Math.pow(10,Math.floor(Math.log10(raw))),m=raw/pw,st=(m<=1?1:m<=2?2:m<=5?5:10)*pw,top=Math.ceil(mx*1.08/st)*st;
 const X=t=>L+t/10*(R-L),Y=v=>B-v/top*(B-T);
 for(let v=0;v<=top+st/1e3;v+=st)P.push({k:"l",x1:L,y1:Y(v),x2:R,y2:Y(v),c:"grid",w:1},{k:"t",x:L-8,y:Y(v)+5,s:16,t:f2(v,2),c:"mu",a:"r"});
 for(let t=0;t<=10;t++)P.push({k:"l",x1:X(t),y1:B,x2:X(t),y2:B+5,c:"axis",w:1},{k:"t",x:X(t),y:B+24,s:16,t:String(t),c:"mu",a:"c"});
 [1,10].forEach(t=>P.push({k:"l",x1:X(t),y1:T,x2:X(t),y2:B,c:"hl",w:1,d:"4 4"}));
 P.push({k:"l",x1:L,y1:T,x2:L,y2:B,c:"axis",w:1.5},{k:"l",x1:L,y1:B,x2:R,y2:B,c:"axis",w:1.5},{k:"t",x:(L+R)/2,y:B+52,s:17,t:"Tiempo (min)",c:"txt",a:"c"},{k:"t",x:6,y:T-14,s:17,t:"GOhms",c:"txt",a:"l"});
 [[1,"s1","6 5",3],[2,"s2",0,4.5]].forEach(([j,c,d,r])=>{for(let i=1;i<pts.length;i++)P.push({k:"l",x1:X(pts[i-1][0]),y1:Y(pts[i-1][j]),x2:X(pts[i][0]),y2:Y(pts[i][j]),c,w:j===2?3:2,d});pts.forEach(p=>P.push({k:"c",x:X(p[0]),y:Y(p[j]),r,c}))});
 pts.filter(p=>p[0]===1||p[0]===10).forEach(p=>P.push(p[0]===1?{k:"t",x:X(1)+10,y:Y(p[2])+26,s:17,t:p[2].toFixed(2),c:"s2",a:"l",b:1}:{k:"t",x:X(10)-8,y:Y(p[2])-12,s:17,t:p[2].toFixed(2),c:"s2",a:"r",b:1}));
 P.push({k:"t",x:L+30,y:20,s:17,t:`FA ${f2(S.da,2)||"-"}${S.d[1]?" ("+S.d[1][0]+")":""}  ·  IP ${f2(S.ip,2)||"-"}${S.d[2]?" ("+S.d[2][0]+")":""}`,c:"txt",a:"l",b:1},
  {k:"l",x1:R-285,y1:34,x2:R-260,y2:34,c:"s1",w:2,d:"6 5"},{k:"t",x:R-254,y:39,s:15,t:"Medida",c:"mu",a:"l"},{k:"l",x1:R-170,y1:34,x2:R-145,y2:34,c:"s2",w:3},{k:"t",x:R-139,y:39,s:15,t:"Corregida a 40 °C",c:"mu",a:"l"});
 return P}
export const CV={grid:"var(--ln)",axis:"var(--mu)",txt:"var(--tx)",mu:"var(--mu)",s1:"var(--mu)",s2:"var(--ac)",hl:"var(--bad)"};
export const CPDF={grid:[225,225,225],axis:[70,70,70],txt:[0,0,0],mu:[90,90,90],s1:[120,120,120],s2:[0,110,200],hl:[200,40,40]};
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
export const toSvg=P=>`<svg viewBox="0 0 640 300" role="img" aria-label="Gráfica de resistencia de aislamiento contra tiempo" style="width:100%;height:auto;display:block">`+P.map(p=>p.k==="l"?`<line x1="${p.x1}" y1="${p.y1}" x2="${p.x2}" y2="${p.y2}" stroke="${CV[p.c]}" stroke-width="${p.w||1}"${p.d?` stroke-dasharray="${p.d}"`:""}/>`:p.k==="c"?`<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${CV[p.c]}"/>`:`<text x="${p.x}" y="${p.y}" font-size="${p.s}" fill="${CV[p.c]}" text-anchor="${{l:"start",c:"middle",r:"end"}[p.a]}"${p.b?` font-weight="700"`:""} font-family="system-ui,sans-serif">${esc(p.t)}</text>`).join("")+`</svg>`;
