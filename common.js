import {esc} from "../util.js";
export const fld=([k,l,t])=>`<label class="fl">${l}<input data-k="${k}" ${t==="date"?'type="date" data-type="date"':t==="d"?'inputmode="decimal" data-type="num"':""}><small class="err" role="alert"></small></label>`;
export const nin=(k,aria)=>`<input class="cin" data-k="${k}" inputmode="decimal" data-type="num" aria-label="${esc(aria)}">`;
export const tag=(c,x)=>`<span class="t-${c}">${x}</span>`;
export const sigBtn=k=>`<div class="ph sigrow"><button type="button" class="chip" data-sig="${k}">Firmar</button><img class="sigp" data-sk="${k}" alt="Firma" hidden></div>`;
export const devBtn=(act,t)=>`<button class="btn" type="button" data-dev data-act="${act}">${t}</button>`;
export const grid=(n,x)=>`<div class="g${n}">${x}</div>`;
export const FT={good:"Correcto",warn:"Fuera de tolerancia",bad:"ERROR"};
