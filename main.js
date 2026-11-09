import {init} from "./ui.js";
init();
const runningNative = window.Capacitor?.isNativePlatform?.() === true;
if (!runningNative && "serviceWorker" in navigator && /^https?:$/.test(location.protocol) && !window.__SINGLE__) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
