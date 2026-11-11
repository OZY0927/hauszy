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
export function preloadProjectImages(project){
 if(typeof window==='undefined')return;
 preload??=createProjectImagePreloader(window.Image);
 preload(project);
}
