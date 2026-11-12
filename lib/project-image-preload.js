import {previewUrl} from './media.js';

// Keep in-flight image objects alive across the loading boundary; reuse browser cache afterward.
export function createProjectImagePreloader(ImageClass){
 const images=new Map();
 return project=>{
  const sources=[...new Set((project.previewImages||project.images||[]).filter(Boolean))].slice(0,4);
  sources.forEach((source,index)=>{
   const preview=previewUrl(source);
   if(images.has(preview))return;
   const image=new ImageClass();
   images.set(preview,image);
   if(images.size>24)images.delete(images.keys().next().value);
   image.decoding='async';
   image.fetchPriority=index===0?'high':'low';
   image.onerror=()=>{
    image.onerror=null;
    // Older uploads have no preview file, matching PreviewImage's fallback.
    if(preview!==source)image.src=source;
   };
   image.src=preview;
  });
 };
}

let preload;
const prepared=new Map();
// Decode the small images before exposing the scroll scenes, including offscreen cards.
export function prepareProjectImages(sources){
 if(typeof window==='undefined')return Promise.resolve();
 return Promise.all([...new Set(sources.filter(Boolean))].map(source=>{
  if(prepared.has(source))return prepared.get(source);
  const task=new Promise(resolve=>{
   const image=new window.Image();
   const timer=setTimeout(finish,12000);
   function finish(){clearTimeout(timer);image.onload=null;image.onerror=null;resolve()}
   image.decoding='async';
   image.onload=()=>{if(image.decode)image.decode().catch(()=>{}).then(finish);else finish()};
   image.onerror=()=>{if(image.src!==source&&previewUrl(source)!==source){image.onerror=finish;image.src=source}else finish()};
   image.src=previewUrl(source);
  });
  prepared.set(source,task);
  if(prepared.size>150)prepared.delete(prepared.keys().next().value);
  return task;
 }));
}
export function preloadProjectImages(project){
 if(typeof window==='undefined')return;
 preload??=createProjectImagePreloader(window.Image);
 preload(project);
}
