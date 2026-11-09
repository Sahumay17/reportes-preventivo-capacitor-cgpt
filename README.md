# Reportes Preventivo (Reportes Prev)

Formatos de mantenimiento preventivo que se llenan en campo (celular o tablet) y se guardan como PDF:
Inspección CEM’s · Pesadoras · 421-2K1 Verificacion con Gases Patron · Pruebas Estaticas · Dosificadores Pfister · AST · 441-2K1 Inspección · 461-2K1 Inspección (analizadores del precalentador, semanal + verificación mensual con gases patrón).

## Estructura
```
src/
  data.js        definiciones (listas, criterios, valores por defecto, SCHEMA)
  calc.js        cálculos puros (sin DOM): errores, Kt, FA/IP, matriz de riesgo, criterios de color
  validate.js    validación de números y fechas (mensajes inline)
  chart.js       geometría de la gráfica (se dibuja en pantalla y en PDF)
  store.js       estado, borradores con versión de esquema + migración, exportar/importar .json
  idb.js         IndexedDB (fotos y firmas como Blob)
  img.js         reducción de fotos (800 px, JPEG 0.6)
  pdf/common.js  makePdf(): tx/bx/cell/tr/bar/note/img/photos/chart compartidos
  pdf/*.js       un generador por formulario (cems, pesadoras, gases, estatica, pfister, ast)
  forms/*.js     un formulario por formato (analizadores.js sirve a 441-2K1 y 461-2K1) (HTML + actualización + resumen)
  ui.js          pestañas, eventos, validación, fotos, firma, guardar/compartir, impresión
  demo.js        datos de ejemplo (solo con ?dev=1 o #dev)
assets/          logo.png (optimizado), iconos, manifest.webmanifest, sw.js
test/            calc.test.js · pdf.smoke.test.js (node) · e2e.py (Chromium)
build.mjs        genera dist/
```

## Comandos
```
npm test                    # cálculos + generadores de PDF (jsPDF simulado)
python3 test/e2e.py         # pruebas en Chromium real (requiere playwright)
npm run build               # dist/Reportes Prev.html  y  dist/pwa/
```
`build.mjs` usa esbuild; ajusta la ruta con la variable ESBUILD si hace falta.

## Salidas
- `dist/Reportes Prev.html`: un solo archivo (CSS, JS y logo incrustados). Funciona abriéndolo desde Descargas. Necesita internet la primera vez para jsPDF, salvo que copies `vendor/jspdf.umd.min.js` (ver `vendor/LEEME.txt`).
- `dist/pwa/`: app instalable con service worker. **Debe servirse por HTTPS** (GitHub Pages, Netlify, tu servidor…). En Chrome/Android: menú ⋮ → “Instalar app”. Después abre sin conexión. Si jsPDF va por CDN, el service worker lo guarda en caché durante la primera visita con internet.

## Datos y respaldo
- Borrador: `localStorage` (`rp.draft`, con `schema`). Las fotos y firmas viven en IndexedDB como Blob.
- Borradores anteriores (sin `schema`, fotos/firmas como dataURL) se migran solos al abrir.
- “Exportar respaldo (.json)” guarda todo (con fotos y firmas); “Importar respaldo” lo restaura.
- Si el navegador no puede guardar (almacenamiento lleno) la app avisa y sugiere exportar.

## Modo desarrollo
`?dev=1` (o `#dev`) muestra “Cargar datos de ejemplo” y “Marcar todos OK”. Sin eso, no aparecen.

## Si jsPDF no carga
La app avisa y ofrece “Imprimir / guardar como PDF” (CSS `@media print`).


## Aplicación Android con Capacitor

Este repositorio contiene la app web y el contenedor Android. El paquete `jspdf` se incluye como dependencia para que los PDF no dependan de un CDN y funcionen sin conexión. La PWA conserva su service worker; Android usa el WebView de Capacitor sin registrar service worker nativo.

### Requisitos

- Node.js 22 o superior y npm.
- Android Studio con Android SDK instalado para compilar/ejecutar en Android.

### Instalar y compilar

```sh
npm install
npm run build
npx cap sync android
npx cap open android
```

Para ejecutar desde un dispositivo/emulador conectado: `npm run android:run`. Para actualizar los archivos web después de cambios, usa `npm run cap:sync`.

El identificador Android inicial es `com.holcim.reportesprev`; cámbialo antes de una publicación si la organización define otro. Los artefactos de firma y credenciales no deben subirse al repositorio.

### GitHub y Google AI Studio

Sube el contenido de esta carpeta como raíz de un repositorio GitHub. En Google AI Studio, abre Build mode, usa **Add files (+) > Import from GitHub** para importar el repositorio y, si quieres sincronización, conecta el repositorio en **Settings > GitHub**. AI Studio se orienta a apps web y Android Kotlin/Jetpack Compose; el proyecto Capacitor debe seguir compilándose localmente en Android Studio. Revisa los cambios sugeridos por AI Studio antes de sincronizarlos para conservar `capacitor.config.ts`, `android/` y el proceso de build.
