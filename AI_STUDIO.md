# Google AI Studio y este repositorio

## Importar el proyecto

1. Sube el contenido de este proyecto a un repositorio de GitHub. La raíz del repositorio debe contener `package.json`, `capacitor.config.ts`, `src/`, `assets/` y `android/`.
2. Abre Google AI Studio en Build mode y elige **Add files (+) > Import from GitHub**.
3. Selecciona el repositorio. Para sincronizar cambios después, conecta el mismo repositorio desde **Settings > GitHub** y revisa el diff antes de cada push o pull.

## Contexto para trabajar con el código

Este es un proyecto web existente de inspecciones industriales, empaquetado para Android con Capacitor. La interfaz y lógica de formularios están en `src/`; `build.mjs` genera `dist/pwa`; Capacitor copia esos archivos a `android/`. jsPDF está instalado localmente y el PDF debe seguir funcionando sin conexión.

Antes de cambiar código, conserva los formularios, cálculos, validaciones, nombres de campos, guardado/restauración JSON, fotos, firmas y salidas PDF existentes. No sustituyas el proyecto por una app React o Kotlin nueva. No cambies umbrales ni fórmulas técnicas sin una especificación aprobada. Mantén compatibilidad con la estructura Capacitor y actualiza el README si cambian los pasos de compilación.

## Después de editar

Desde la raíz del proyecto, ejecuta:

```sh
npm install
npm run build
npx cap sync android
```

Revisa los cambios de archivos nativos generados y confirma que `android/` mantiene el mismo `applicationId`. Para compilar el APK, abre `android/` en Android Studio y compila con el SDK instalado. AI Studio no sustituye la compilación y firma Android local.
