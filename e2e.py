"""Prueba de extremo a extremo en Chromium real (jsPDF simulado para no depender de internet)."""
import json,os,sys,threading,http.server,socketserver,base64,io
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));DIST=os.path.join(ROOT,"dist")
SINGLE="file://"+os.path.join(DIST,"Reportes Prev.html")
STUB="""window.jspdf={jsPDF:class{constructor(o){this.o=o;this.n=0;this.fs=9}setFont(){return this}setFontSize(s){this.fs=s;return this}setTextColor(){return this}setDrawColor(){return this}setFillColor(){return this}setLineWidth(){return this}setLineDashPattern(){return this}
rect(){this.n++;return this}line(){this.n++;return this}circle(){return this}addImage(){this.n++;return this}text(){this.n++;return this}addPage(){return this}splitTextToSize(t,w){return String(t).split("\\n")}getTextWidth(t){return String(t).length*1.5}getImageProperties(){return{width:300,height:100}}output(){return new Blob(["%PDF-stub "+this.n],{type:"application/pdf"})}}};"""
ok=[];bad=[]
def check(name,cond,extra=""):
    (ok if cond else bad).append(name);print(("PASS " if cond else "FAIL ")+name+(" "+str(extra) if (extra and not cond) else ""))
def photo(path,w=3000,h=2000):
    im=Image.new("RGB",(w,h));px=im.load()
    for x in range(0,w,7):
        for y in range(0,h,7):px[x,y]=((x*255//w),(y*255//h),(x+y)%255)
    im.save(path,"JPEG",quality=92)
with sync_playwright() as p:
    b=p.chromium.launch()
    def newctx(stub=True,**kw):
        c=b.new_context(accept_downloads=True,viewport={"width":412,"height":900},**kw)
        errs=[];pg=c.new_page();pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("console",lambda m:errs.append(m.text) if m.type=="error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
        c.route("**/jspdf*",lambda r:r.fulfill(status=200,content_type="application/javascript",body=STUB) if stub else r.abort())
        return c,pg,errs
    # --- 1. Carga, pestañas, modo dev
    c,pg,errs=newctx();pg.goto(SINGLE)
    check("8 pestañas",pg.locator("#fsel .chip").count()==8)
    check("demo oculto sin ?dev=1",not pg.locator("[data-act=demo]:visible").count())
    pg.goto(SINGLE+"?dev=1");pg.wait_for_selector("#fsel .chip")
    check("demo visible con ?dev=1",pg.locator("[data-form]:not([hidden]) [data-act=demo]").first.is_visible())
    names=["c","p","g","e","f","a","h","i"]
    for f in names:
        pg.click(f"[data-f={f}]")
        if f!="a":
            pg.click("[data-form]:not([hidden]) [data-act=demo]")
        check(f"resumen no vacío en {f}",len(pg.inner_text("#sum").strip())>5)
    check("sin errores de consola/JS en recorrido",not errs,errs[:3])
    # --- 2. Validación inline
    pg.click("[data-f=e]");pg.fill("[data-k=e_temp]","abc")
    check("mensaje inline de número",pg.locator("[data-k=e_temp] + .err").inner_text().startswith("Escribe solo un número"))
    pg.fill("[data-k=e_temp]","900");check("mensaje de rango",pg.locator("[data-k=e_temp] + .err").inner_text().startswith("Fuera de rango"))
    pg.fill("[data-k=insp]","Inspector Prueba");pg.click("#pdf");check("PDF bloqueado con campos inválidos","Corrige 1 campo" in pg.inner_text("#msg"),pg.inner_text("#msg"))
    pg.fill("[data-k=e_temp]","32");pg.fill("[data-k=fecha]","2026-05-25")
    with pg.expect_download() as d:pg.click("#pdf")
    check("nombre PDF estática = HAC + fecha",d.value.suggested_filename=="TC.541MP2 2026-05-25.pdf",d.value.suggested_filename)
    # --- 3. Pesadoras y AST: nombres
    pg.click("[data-f=p]");pg.click("[data-form]:not([hidden]) [data-act=demo]")
    with pg.expect_download() as d:pg.click("#pdf")
    check("nombre PDF pesadoras",d.value.suggested_filename=="532-BP3 2026-10-24.pdf",d.value.suggested_filename)
    # --- 3b. Analizadores 441/461: error aceptable editable, verificación mensual y nombre de PDF
    pg.click("[data-f=h]");pg.click("[data-form]:not([hidden]) [data-act=demo]")
    check("441: verificación mensual visible al marcar REALIZADO",pg.locator("#h_mon").is_visible())
    check("441: error de CO inicial con ± 4 % marca ERROR","ERROR" in pg.inner_text("#h_er_co_ini"),pg.inner_text("#h_er_co_ini"))
    pg.fill("[data-k=h_tol]","10");check("441: con ± 10 % deja de marcar ERROR","ERROR" not in pg.inner_text("#h_er_co_ini"))
    pg.fill("[data-k=h_tol]","4");pg.click("[data-k=h_mreal][data-v=no]");check("441: NO REALIZADO oculta gases",not pg.locator("#h_mon").is_visible())
    pg.click("[data-k=h_mreal][data-v=si]")
    with pg.expect_download() as d:pg.click("#pdf")
    check("nombre PDF 441 = equipo + fecha",d.value.suggested_filename=="441-2K1 2026-11-07.pdf",d.value.suggested_filename)
    pg.click("[data-f=i]");pg.click("[data-form]:not([hidden]) [data-act=demo]")
    with pg.expect_download() as d:pg.click("#pdf")
    check("nombre PDF 461 = equipo + fecha",d.value.suggested_filename=="461-2K1 2026-11-07.pdf",d.value.suggested_filename)
    # --- 4. AST: peligros, firma, fotos
    pg.click("[data-f=a]");pg.fill("[data-k=fecha]","2026-11-04")
    pg.select_option("select[data-h='0']",index=1)
    pg.select_option("select[data-h='0']",value="3.25")  # Trabajo en alturas
    check("peligros agregados como chips",pg.locator("#ah_0 .chip").count()==2,pg.locator("#ah_0 .chip").count())
    pg.select_option("[data-k=a_s0_0]","4");pg.select_option("[data-k=a_q0_0]","3")
    check("riesgo 12 no tolerable y aviso ≥10","No tolerable" in pg.inner_text("#ar_0_0") and "No se puede iniciar" in pg.inner_text("#ar_0_0"),pg.inner_text("#ar_0_0"))
    pg.click("[data-sig=a_es0]");box=pg.locator(".modal canvas").bounding_box()
    pg.mouse.move(box["x"]+30,box["y"]+60);pg.mouse.down();pg.mouse.move(box["x"]+120,box["y"]+120,steps=8);pg.mouse.move(box["x"]+200,box["y"]+50,steps=8);pg.mouse.up()
    pg.click("[data-a=s]");pg.wait_for_selector("[data-sk=a_es0]:not([hidden])")
    check("firma guardada y visible",pg.locator("[data-sk=a_es0]").is_visible())
    photo("/tmp/e2e_big.jpg");pg.set_input_files("#f","/tmp/e2e_big.jpg");pg.wait_for_selector("#P img")
    dim=pg.evaluate("new Promise(r=>{const i=document.querySelector('#P img');const f=()=>r([i.naturalWidth,i.naturalHeight]);i.complete?f():i.onload=f})")
    check("foto reducida a ≤800 px",max(dim)<=800 and max(dim)>=700,dim)
    with pg.expect_download() as d:pg.click("#pdf")
    check("nombre PDF AST",d.value.suggested_filename=="AST 2026-11-04.pdf",d.value.suggested_filename)
    # --- 5. Persistencia: recarga conserva firma y foto (IndexedDB)
    pg.wait_for_timeout(800);pg.goto(SINGLE);pg.wait_for_selector("#fsel .chip");pg.wait_for_timeout(400)
    pg.click("[data-f=a]")
    check("tras recargar: firma restaurada",pg.locator("[data-sk=a_es0]").is_visible())
    check("tras recargar: foto restaurada",pg.locator("#P img").count()==1)
    ls=pg.evaluate("localStorage.getItem('rp.draft')");check("borrador guardado con schema 2",json.loads(ls)["schema"]==2)
    check("firma ya no va dentro de localStorage","data:image" not in ls)
    # --- 6. Exportar / importar
    with pg.expect_download() as d:pg.click("#export")
    path=d.value.path();data=json.load(open(path))
    check("exportación incluye foto y firma",len(data["photos"])==1 and "a_es0" in data["sigs"] and data["schema"]==2)
    pg.click("#nuevo");pg.click("#nuevo");pg.wait_for_timeout(300)
    check("nuevo reporte limpia foto",pg.locator("#P img").count()==0)
    pg.set_input_files("#impf",path);pg.wait_for_timeout(600)
    check("importar restaura foto y firma",pg.locator("#P img").count()==1 and pg.locator("[data-sk=a_es0]").is_visible())
    c.close()
    # --- 6b. Entorno del artefacto de claude.ai: usa la capacidad "downloads" y #dev
    c,pg,errs=newctx();c.add_init_script("window.claude={use:async n=>({save:async({filename,data})=>{window.__saved=[filename,data.size,data.type]}})}")
    pg.goto(SINGLE+"#dev");pg.wait_for_selector("#fsel .chip");pg.click("[data-f=f]")
    check("#dev también activa el modo desarrollo",pg.locator("[data-form]:not([hidden]) [data-act=demo]").first.is_visible())
    pg.click("[data-form]:not([hidden]) [data-act=demo]");pg.fill("[data-k=insp]","Inspector");pg.click("#pdf");pg.wait_for_timeout(500)
    sv=pg.evaluate("window.__saved");check("artefacto: guarda con claude.use('downloads')",sv and sv[0]=="531-DO1 2026-11-05.pdf" and sv[2]=="application/pdf",sv)
    c.close()
    # --- 7. Migración de borrador v1 (firma y fotos como dataURL en localStorage)
    c,pg,errs=newctx()
    im=Image.new("RGB",(80,40),(200,30,30));buf=io.BytesIO();im.save(buf,"JPEG");jp="data:image/jpeg;base64,"+base64.b64encode(buf.getvalue()).decode()
    im2=Image.new("RGBA",(80,30),(0,0,0,0));buf=io.BytesIO();im2.save(buf,"PNG");pn="data:image/png;base64,"+base64.b64encode(buf.getvalue()).decode()
    old={"V":{"fm":"a","fecha":"2026-11-01","a_rn":"Ana","a_es0":pn,"p_tol":"0.5"},"FO":[{"d":jp,"w":80,"h":40,"c":"foto vieja"}]}
    c.add_init_script("if(!localStorage.getItem('bor')&&!localStorage.getItem('rp.draft'))localStorage.setItem('bor',%s)"%json.dumps(json.dumps(old)))
    pg.goto(SINGLE);pg.wait_for_selector("#fsel .chip");pg.wait_for_timeout(600)
    check("migración v1: pestaña y datos",pg.input_value("[data-k=a_rn]")=="Ana" and pg.input_value("[data-k=fecha]")=="2026-11-01")
    check("migración v1: foto con descripción",pg.locator("#P img").count()==1 and pg.input_value("[data-cap='0']")=="foto vieja")
    check("migración v1: firma como blob",pg.locator("[data-sk=a_es0]").is_visible())
    ls=json.loads(pg.evaluate("localStorage.getItem('rp.draft')"));check("migración v1: tolerancia pesadoras 0.5→1",ls["V"]["p_tol"]=="1");check("migración v1: clave antigua eliminada",pg.evaluate("localStorage.getItem('bor')")is None)
    c.close()
    # --- 8. Sin jsPDF: aviso y respaldo para imprimir
    c,pg,errs=newctx(stub=False);pg.goto(SINGLE);pg.wait_for_selector("#fsel .chip")
    check("aviso de PDF no cargado y botón imprimir",pg.locator("#print").is_visible() and "herramienta de PDF" in pg.inner_text("#warn"))
    pg.fill("[data-k=insp]","X");pg.click("#pdf");check("mensaje con alternativa de imprimir","imprimir" in pg.inner_text("#msg").lower())
    pg.emulate_media(media="print");check("modo impresión oculta controles",not pg.locator("#pdf").is_visible() and pg.locator("#phead").is_visible())
    c.close()
    # --- 9. PWA por http: instalación del service worker y uso sin conexión
    class Q(http.server.SimpleHTTPRequestHandler):
        def __init__(s,*a,**k):super().__init__(*a,directory=os.path.join(DIST,"pwa"),**k)
        def log_message(s,*a):pass
    srv=socketserver.TCPServer(("127.0.0.1",0),Q);port=srv.server_address[1];threading.Thread(target=srv.serve_forever,daemon=True).start()
    c,pg,errs=newctx();pg.goto(f"http://127.0.0.1:{port}/index.html");pg.wait_for_selector("#fsel .chip")
    pg.evaluate("navigator.serviceWorker.ready.then(()=>1)");pg.wait_for_timeout(1500)
    check("service worker activo",pg.evaluate("navigator.serviceWorker.controller!==null || !!navigator.serviceWorker.ready")) 
    keys=pg.evaluate("caches.keys().then(k=>k.length)");check("caché creada",keys>=1)
    pg.reload();pg.wait_for_timeout(800);c.set_offline(True);pg.reload();pg.wait_for_selector("#fsel .chip",timeout=8000)
    check("app abre sin conexión",pg.locator("#fsel .chip").count()==8)
    check("logo por archivo en la PWA",pg.evaluate("fetch('logo.png').then(r=>r.ok)"))
    c.close();srv.shutdown();b.close()
print(f"\n{len(ok)} correctas, {len(bad)} fallidas");sys.exit(1 if bad else 0)
