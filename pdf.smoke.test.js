// Prueba de humo: ejecuta cada generador de PDF con un jsPDF simulado para detectar errores de ejecución.
import test from "node:test";import assert from "node:assert/strict";
import {DEFAULTS,SIG_KEYS} from "../src/data.js";import {demo,okAll} from "../src/demo.js";
class Fake{constructor(o){globalThis.__last=this;this.o=o||{};this.calls=[];this.pages=1;this.fs=9;const m=this;
 ["setFont","setFontSize","setTextColor","setDrawColor","setFillColor","setLineWidth","setLineDashPattern","rect","line","circle","addImage","text"].forEach(n=>{this[n]=(...a)=>{if(n==="setFontSize")m.fs=a[0];m.calls.push([n,...a]);return m}})}
 addPage(){this.pages++;return this}
 splitTextToSize(t,w){const cw=this.fs*.2,max=Math.max(1,Math.floor(w/cw));return String(t).split("\n").flatMap(l=>{const out=[];let c="";for(const wd of l.split(" ")){if((c+" "+wd).trim().length>max){out.push(c);c=wd}else c=(c+" "+wd).trim()}out.push(c);return out})}
 getTextWidth(t){return String(t).length*this.fs*.2}
 getImageProperties(){return{width:400,height:150}}
 output(){return{size:this.calls.length,type:"blob"}}}
globalThis.window={jspdf:{jsPDF:Fake}};
const {builders}=await import("../src/pdf/index.js");
const PNG="data:image/png;base64,iVBORw0KGgo=";
const mk=fm=>{const v={...DEFAULTS,fm,insp:"Inspector Prueba"};demo[fm](v);if(fm==="c")okAll(v);return v};
const assets={logo:PNG,sig:Object.fromEntries(SIG_KEYS.map(k=>[k,PNG])),photos:[{d:"data:image/jpeg;base64,/9j/4AAQ",w:800,h:600,c:"Foto 1"},{d:"data:image/jpeg;base64,/9j/4AAQ",w:600,h:800,c:"Foto 2"},{d:"data:image/jpeg;base64,/9j/4AAQ",w:800,h:600,c:""}]};
for(const fm of ["c","p","g","e","f","a","h","i"])test("PDF "+fm+" se genera con datos de ejemplo y fotos",()=>{const b=builders[fm]({v:mk(fm),photos:assets.photos,assets});assert.ok(b.size>50,"sin llamadas de dibujo")});
for(const fm of ["c","p","g","e","f","a","h","i"])test("PDF "+fm+" tolera un formulario vacío",()=>{const b=builders[fm]({v:{...DEFAULTS,fm},photos:[],assets:{logo:null,sig:{},photos:[]}});assert.ok(b.size>20)});
test("PDF gases en horizontal",()=>{const v=mk("g");v.g_ori="h";assert.ok(builders.g({v,photos:[],assets:{...assets,photos:[]}}).size>50)});
test("PDF AST inserta las firmas en sus campos",()=>{builders.a({v:mk("a"),photos:[],assets:{...assets,photos:[]}});
 const n=globalThis.__last.calls.filter(c=>c[0]==="addImage"&&c[1]===PNG&&typeof c[2]==="number").length;assert.equal(n,4,"firmas insertadas: "+n)});
