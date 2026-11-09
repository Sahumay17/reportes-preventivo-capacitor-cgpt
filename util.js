export const $=(s,r=document)=>r.querySelector(s);
export const $$=(s,r=document)=>[...r.querySelectorAll(s)];
export const f2=(x,d=2)=>x==null||Number.isNaN(x)?"":String(Number(x.toFixed(d)));
export const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
export const today=()=>{const t=new Date(),p=n=>String(n).padStart(2,"0");return `${t.getFullYear()}-${p(t.getMonth()+1)}-${p(t.getDate())}`};
export const safeName=s=>String(s||"").trim().replace(/[\\/:*?"<>|]/g,"-");
export const blobToDataURL=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsDataURL(b)});
export const dataURLToBlob=u=>{const [h,d]=u.split(","),m=/data:([^;]+)/.exec(h)[1],bin=atob(d),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return new Blob([a],{type:m})};
// Nombre del PDF según el formato (reglas acordadas con el cliente)
export function fileName(v){const d=v.fecha||"sin fecha",hn=h=>`${safeName(h)||"sin HAC"} ${d}.pdf`;
 switch(v.fm){case"a":return `AST ${d}.pdf`;case"e":return hn(v.e_hac);case"p":return hn(v.p_hac);case"f":return hn(v.f_hac);case"h":case"i":return hn(v[v.fm+"_eq"]);
  case"g":return `TC421-2K1 Verificación con gases patrón ${d}.pdf`;default:return `TC.421-2K1 Inspección Semanal ${d}.pdf`}}
