// Keep browser File/blob previews out of persisted layout records.
export async function uploadLayoutFloorPlans(units,selections,folder,upload){
 const result=units.map(unit=>({...unit}));
 for(let index=0;index<result.length;index++){
  const photo=selections[index]?.[0];
  if(photo?.file)result[index].floorPlanUrl=await upload(photo,folder);
 }
 return result;
}
