import {FLOOR_PLAN_LIMIT,uploadLayoutFloorPlans} from './layout-floor-plans.js';

// One bounded queue shared by project, showroom and floor-plan photos.
// Retain successful uploads so a failed save can retry without uploading them again.
export async function uploadProjectMedia({units,floorPlans,photos,showroom},folder,upload,{cache=new Map(),onProgress=()=>{},concurrency=3}={}){
 const selections=floorPlans.map(items=>items.slice(0,FLOOR_PLAN_LIMIT));
 const files=new Map();
 for(const photo of [...photos,...showroom,...selections.flat()]){
  if(photo.file&&!cache.has(photo.file))files.set(photo.file,photo);
 }
 const pending=[...files.values()];let cursor=0,completed=0,failure;
 onProgress(0,pending.length);
 async function worker(){
  while(!failure&&cursor<pending.length){
   const photo=pending[cursor++];
   try{cache.set(photo.file,await upload(photo,folder));onProgress(++completed,pending.length)}catch(error){failure=error}
  }
 }
 await Promise.all(Array.from({length:Math.min(Math.max(1,concurrency),pending.length)},worker));
 if(failure)throw failure;
 const resolve=photo=>photo.file?cache.get(photo.file):photo.url;
 return {
  units:await uploadLayoutFloorPlans(units,selections,folder,async photo=>resolve(photo)),
  images:photos.map(resolve),
  showroomImages:showroom.map(resolve),
 };
}
