import {PROJECT_LOADING_IMAGES} from './project-loading-icons.js';

// Only warm the upcoming icon, never compete with the page by fetching the whole set.
export function createLoadingIconPreloader(ImageClass){
 const pending=new Map();
 return icon=>{
  const src=PROJECT_LOADING_IMAGES[icon];
  if(!src)return Promise.resolve(false);
  if(pending.has(src))return pending.get(src);
  const task=new Promise(resolve=>{
   const image=new ImageClass();
   image.decoding='async';image.fetchPriority='low';
   const finish=ready=>{image.onload=null;image.onerror=null;resolve(ready)};
   image.onload=()=>{if(image.decode)image.decode().then(()=>finish(true),()=>finish(false));else finish(true)};
   image.onerror=()=>finish(false);
   image.src=src;
  });
  pending.set(src,task);
  return task;
 };
}
