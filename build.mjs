// Construye: dist/Reportes Prev.html (un solo archivo) y dist/pwa/ (instalable y offline).
import {createRequire} from "node:module";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const require = createRequire(import.meta.url);
let esbuild = null;
for (const p of [process.env.ESBUILD, "esbuild", "/opt/npm-tools/node_modules/esbuild", "/home/claude/.npm-global/lib/node_modules/tsx/node_modules/esbuild"].filter(Boolean)) {
  try { esbuild = require(p); break; } catch {}
}

const CDN = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
const VENDOR = "vendor/jspdf.umd.min.js";
const NPM_VENDOR = "node_modules/jspdf/dist/jspdf.umd.min.js";
const rd = p => fs.readFileSync(p, "utf8");
const dist = "dist";
const pwa = path.join(dist, "pwa");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(pwa, "icons"), { recursive: true });

// Determine bundled JS
let js = "";
if (fs.existsSync("src/main.js") && esbuild) {
  try {
    js = esbuild.buildSync({
      entryPoints: ["src/main.js"],
      bundle: true,
      minify: true,
      format: "iife",
      target: ["es2019"],
      write: false
    }).outputFiles[0].text;
  } catch (e) {
    console.warn("esbuild bundle failed, using app.js fallback:", e.message);
    js = rd("app.js");
  }
} else if (fs.existsSync("app.js")) {
  js = rd("app.js");
}

const css = fs.existsSync("src/app.css") ? rd("src/app.css") : rd("app.css");
const tpl = fs.existsSync("src/index.html") ? rd("src/index.html") : rd("index.html");
const logoPath = fs.existsSync("assets/logo.png") ? "assets/logo.png" : (fs.existsSync("logo.png") ? "logo.png" : null);
const logo = logoPath ? fs.readFileSync(logoPath) : Buffer.from("");
const hash = crypto.createHash("sha1").update(js + css).digest("hex").slice(0, 8);

const vendorPath = fs.existsSync(VENDOR) ? VENDOR : (fs.existsSync(NPM_VENDOR) ? NPM_VENDOR : (fs.existsSync("jspdf.min.js") ? "jspdf.min.js" : null));
const vendored = Boolean(vendorPath);
const safe = s => s.replace(/<\/script/gi, "<\\/script");

// 1) Un solo archivo
const jspdfTag = vendored ? `<script>${safe(rd(vendorPath))}</script>` : `<script src="${CDN}"></script>`;
const single = tpl
  .replace("{{HEAD}}", () => `<style>${css}</style>\n${jspdfTag}\n`)
  .replace("{{TAIL}}", () => `<script>window.__SINGLE__=true;window.__LOGO__="data:image/png;base64,${logo.toString("base64")}"</script><script>${safe(js)}</script>`);
fs.writeFileSync(path.join(dist, "Reportes Prev.html"), single);

// 2) PWA
const pdfSrc = vendored ? "jspdf.min.js" : CDN;
fs.writeFileSync(
  path.join(pwa, "index.html"),
  tpl
    .replace("{{HEAD}}", () => `<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icons/icon-192.png"><link rel="apple-touch-icon" href="icons/icon-192.png"><link rel="stylesheet" href="app.css">\n<script src="${pdfSrc}"></script>\n`)
    .replace("{{TAIL}}", () => `<script src="app.js"></script>`)
);

fs.writeFileSync(path.join(pwa, "app.js"), js);
fs.writeFileSync(path.join(pwa, "app.css"), css);
if (logoPath) fs.copyFileSync(logoPath, path.join(pwa, "logo.png"));
const faviconPath = fs.existsSync("favicon.ico") ? "favicon.ico" : (fs.existsSync("public/favicon.ico") ? "public/favicon.ico" : null);
if (faviconPath) fs.copyFileSync(faviconPath, path.join(pwa, "favicon.ico"));

const manifestPath = fs.existsSync("assets/manifest.webmanifest") ? "assets/manifest.webmanifest" : (fs.existsSync("manifest.webmanifest") ? "manifest.webmanifest" : null);
if (manifestPath) fs.copyFileSync(manifestPath, path.join(pwa, "manifest.webmanifest"));

const iconsDir = fs.existsSync("assets/icons") ? "assets/icons" : null;
if (iconsDir) {
  for (const f of fs.readdirSync(iconsDir)) {
    fs.copyFileSync(path.join(iconsDir, f), path.join(pwa, "icons", f));
  }
} else {
  for (const icon of ["icon-192.png", "icon-512.png", "maskable-512.png"]) {
    if (fs.existsSync(icon)) {
      fs.copyFileSync(icon, path.join(pwa, "icons", icon));
    }
  }
}

if (vendored) fs.copyFileSync(vendorPath, path.join(pwa, "jspdf.min.js"));

const swPath = fs.existsSync("assets/sw.js") ? "assets/sw.js" : (fs.existsSync("sw.js") ? "sw.js" : null);
if (swPath) {
  fs.writeFileSync(
    path.join(pwa, "sw.js"),
    rd(swPath)
      .replace("__VERSION__", hash)
      .replace("__PDFURL__", vendored ? "" : CDN)
      .replace("__EXTRA__", vendored ? ',"jspdf.min.js"' : "")
  );
}

// Update public assets for Android Capacitor
const capPublic = path.join("app", "src", "main", "assets", "public");
if (fs.existsSync(capPublic)) {
  fs.cpSync(pwa, capPublic, { recursive: true });
}

console.log(`build ${hash}: Reportes Prev.html y dist/pwa/ listos`);
