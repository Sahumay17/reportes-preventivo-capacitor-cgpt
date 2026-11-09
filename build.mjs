// Construye: dist/Reportes Prev.html (un solo archivo) y dist/pwa/ (instalable y offline).
import {createRequire} from "node:module";import fs from "node:fs";import path from "node:path";import crypto from "node:crypto";
const require=createRequire(import.meta.url);
const esbuild=(()=>{for(const p of [process.env.ESBUILD,"esbuild","/opt/npm-tools/node_modules/esbuild","/home/claude/.npm-global/lib/node_modules/tsx/node_modules/esbuild"].filter(Boolean)){try{return require(p)}catch{}}throw new Error("No se encontró esbuild: npm i -D esbuild")})();
const CDN="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",VENDOR="vendor/jspdf.umd.min.js",NPM_VENDOR="node_modules/jspdf/dist/jspdf.umd.min.js";
const rd=p=>fs.readFileSync(p,"utf8"),dist="dist",pwa=path.join(dist,"pwa");
fs.rmSync(dist,{recursive:true,force:true});fs.mkdirSync(path.join(pwa,"icons"),{recursive:true});
const js=esbuild.buildSync({entryPoints:["src/main.js"],bundle:true,minify:true,format:"iife",target:["es2019"],write:false}).outputFiles[0].text;
const css=rd("src/app.css"),tpl=rd("src/index.html"),logo=fs.readFileSync("assets/logo.png"),hash=crypto.createHash("sha1").update(js+css).digest("hex").slice(0,8);
const vendorPath=fs.existsSync(VENDOR)?VENDOR:(fs.existsSync(NPM_VENDOR)?NPM_VENDOR:null),vendored=!!vendorPath,safe=s=>s.replace(/<\/script/gi,"<\\/script");
// 1) Un solo archivo
const jspdfTag=vendored?`<script>${safe(rd(vendorPath))}</script>`:`<script src="${CDN}"></script>`;
const single=tpl.replace("{{HEAD}}",()=>`<style>${css}</style>\n${jspdfTag}\n`).replace("{{TAIL}}",()=>`<script>window.__SINGLE__=true;window.__LOGO__="data:image/png;base64,${logo.toString("base64")}"</script><script>${safe(js)}</script>`);
fs.writeFileSync(path.join(dist,"Reportes Prev.html"),single);
// 2) PWA
const pdfSrc=vendored?"jspdf.min.js":CDN;
fs.writeFileSync(path.join(pwa,"index.html"),tpl.replace("{{HEAD}}",()=>`<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icons/icon-192.png"><link rel="apple-touch-icon" href="icons/icon-192.png"><link rel="stylesheet" href="app.css">\n<script src="${pdfSrc}"></script>\n`).replace("{{TAIL}}",()=>`<script src="app.js"></script>`));
fs.writeFileSync(path.join(pwa,"app.js"),js);fs.writeFileSync(path.join(pwa,"app.css"),css);fs.copyFileSync("assets/logo.png",path.join(pwa,"logo.png"));fs.copyFileSync("assets/manifest.webmanifest",path.join(pwa,"manifest.webmanifest"));
for(const f of fs.readdirSync("assets/icons"))fs.copyFileSync(path.join("assets/icons",f),path.join(pwa,"icons",f));
if(vendored)fs.copyFileSync(vendorPath,path.join(pwa,"jspdf.min.js"));
fs.writeFileSync(path.join(pwa,"sw.js"),rd("assets/sw.js").replace("__VERSION__",hash).replace("__PDFURL__",vendored?"":CDN).replace("__EXTRA__",vendored?',"jspdf.min.js"':""));
const kb=p=>(fs.statSync(p).size/1024).toFixed(0)+" KB";
console.log(`build ${hash}: Reportes Prev.html ${kb(path.join(dist,"Reportes Prev.html"))} · app.js ${kb(path.join(pwa,"app.js"))} · logo ${kb("assets/logo.png")} · jsPDF ${vendored?"incluido":"por CDN (copia vendor/jspdf.umd.min.js para uso 100 % offline)"}`);
