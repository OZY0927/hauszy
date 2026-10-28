const placeholders=new Set(['—','-','to be confirmed','location to be confirmed','tenure to confirm','not confirmed','n/a']);
export function hasProjectInfo(value){
 if(value==null)return false;
 if(typeof value==='number')return Number.isFinite(value);
 if(typeof value==='string')return value.trim()!==''&&!placeholders.has(value.trim().toLowerCase());
 if(Array.isArray(value))return value.some(hasProjectInfo);
 return false;
}
export function visibleFacts(rows){return rows.filter(([,value])=>hasProjectInfo(value))}
export function projectSections(project){
 const units=(project.units||[]).filter(unit=>['name','size','bedrooms','bathrooms','carParks','configuration','floorPlanUrl','price'].some(key=>hasProjectInfo(unit[key])));
 const facilities=(project.facilities||[]).filter(hasProjectInfo);
 const nearby=(project.nearbyAmenities||[]).filter(row=>hasProjectInfo(row?.name)&&hasProjectInfo(row?.category));
 const hasCoordinates=hasProjectInfo(project.latitude)&&hasProjectInfo(project.longitude)&&Number.isFinite(+project.latitude)&&Number.isFinite(+project.longitude)&&Math.abs(+project.latitude)<=90&&Math.abs(+project.longitude)<=180;
 return {units,facilities,nearby,hasCoordinates,location:hasProjectInfo(project.location)||hasCoordinates||nearby.length>0,maintenance:hasProjectInfo(project.maintenance)||hasProjectInfo(project.sinkingFund)};
}
