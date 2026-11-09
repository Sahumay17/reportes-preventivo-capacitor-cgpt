import {RANGES} from "./data.js";
const NUM=/^[-+]?\d+(?:[.,]\d+)?$/;
export function isValidDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+"T00:00:00Z");return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s&&+s.slice(0,4)>=2000&&+s.slice(0,4)<=2100}
// Devuelve "" si es válido (o está vacío) o el mensaje que se muestra junto al campo.
export function check(key,value,type){const s=String(value??"").trim();if(!s)return"";
 if(type==="date")return isValidDate(s)?"":"Fecha no válida (usa el calendario)";
 if(type==="num"){if(!NUM.test(s))return"Escribe solo un número (ej. 12.5)";const n=parseFloat(s.replace(",","."));for(const [re,min,max,u] of RANGES)if(re.test(key)&&(n<min||n>max))return `Fuera de rango (${min} a ${max}${u?" "+u:""})`}
 return""}
