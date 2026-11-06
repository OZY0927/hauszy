// Floor plan images allowed per layout.
export const FLOOR_PLAN_LIMIT=5;
// A layout's floor plan links: floorPlanUrls, or the single floorPlanUrl that older records saved.
export function floorPlanList(unit){const list=Array.isArray(unit?.floorPlanUrls)?unit.floorPlanUrls:[unit?.floorPlanUrl];return list.filter(v=>typeof v==='string'&&v.trim()!=='')}
// Keep browser File/blob previews out of persisted layout records.
// Each layout's plans become exactly what is selected for it, in order: new files are uploaded, kept links stay as they are.
export async function uploadLayoutFloorPlans(units,selections,folder,upload){
 const result=units.map(unit=>({...unit}));
 for(let index=0;index<result.length;index++){
  const urls=[];
  for(const photo of (selections[index]||[]).slice(0,FLOOR_PLAN_LIMIT))urls.push(photo.file?await upload(photo,folder):photo.url);
  delete result[index].floorPlanUrl;
  result[index].floorPlanUrls=urls.filter(Boolean);
 }
 return result;
}
