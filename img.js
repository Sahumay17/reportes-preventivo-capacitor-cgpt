import {PHOTO} from "./data.js";
// Reduce la foto a 800 px (lado mayor) y JPEG calidad 0.6.
export async function compress(file,{max=PHOTO.max,q=PHOTO.quality}={}){const bmp=await createImageBitmap(file),k=Math.min(1,max/Math.max(bmp.width,bmp.height)),c=document.createElement("canvas");
 c.width=Math.round(bmp.width*k);c.height=Math.round(bmp.height*k);const g=c.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,c.width,c.height);g.drawImage(bmp,0,0,c.width,c.height);
 const blob=await new Promise(r=>c.toBlob(r,"image/jpeg",q));return{blob,w:c.width,h:c.height}}
