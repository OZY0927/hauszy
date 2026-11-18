import {sinkingFundText,priceRange,pricePerSqft} from './project.js';
import {sectionVisibility,fieldVisibility} from './project-sections.js';
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
 const enabled=sectionVisibility(project.sectionVisibility);
 const units=(enabled.units?project.units||[]:[]).filter(unit=>['name','size','bedrooms','bathrooms','carParks','floorPlanUrls','floorPlanUrl','price'].some(key=>hasProjectInfo(unit[key])));
 const facilities=(enabled.facilities?project.facilities||[]:[]).filter(hasProjectInfo);
 const nearby=(enabled.location?project.nearbyAmenities||[]:[]).filter(row=>hasProjectInfo(row?.name)&&hasProjectInfo(row?.category));
 const hasCoordinates=enabled.location&&hasProjectInfo(project.latitude)&&hasProjectInfo(project.longitude)&&Number.isFinite(+project.latitude)&&Number.isFinite(+project.longitude)&&Math.abs(+project.latitude)<=90&&Math.abs(+project.longitude)<=180;
 const showroom=(enabled.showroom?project.showroomImages||[]:[]).filter(hasProjectInfo);
 return {...enabled,units,facilities,nearby,showroom,hasCoordinates,location:enabled.location&&(hasProjectInfo(project.location)||hasCoordinates||nearby.length>0),maintenance:enabled.maintenance&&(hasProjectInfo(project.maintenance)||hasProjectInfo(sinkingFundText(project)))};
}
// Returns a copy of a normalised project with every field the admin switched off treated as blank,
// so hidden information never reaches the public page, its structured data or client components.
export function applyFieldVisibility(project){
 const shown=fieldVisibility(project.fieldVisibility),p={...project};
 const blank=(...keys)=>{for(const key of keys)p[key]=null};
 // Price per sqft is derived from the starting price, so it needs both switches on.
 p.displayPricePerSqft=shown.pricePerSqft&&shown.price?pricePerSqft(project):null;
 const unitKeys=[['unitPrice','price'],['unitSize','size'],['unitBedrooms','bedrooms'],['unitBathrooms','bathrooms'],['unitCarParks','carParks']].filter(([key])=>!shown[key]).map(([,field])=>field);
 p.units=(project.units||[]).map(unit=>{const value={...unit};for(const key of unitKeys)value[key]=null;if(!shown.floorPlans){value.floorPlanUrls=[];delete value.floorPlanUrl}return value});
 if(!shown.unitPrice){
  // A starting price copied from layout prices would reveal them, so drop it unless it was set separately.
  const fromUnits=priceRange(null,null,project.units||[]);
  if(project.price===fromUnits.price&&(project.priceMax??null)===(fromUnits.priceMax??null))blank('price','priceMax');
 }
 if(!shown.unitSize)p.size='—';
 if(!shown.unitBedrooms)p.beds='—';
 if(!shown.unitBathrooms)p.baths='—';
 for(const key of ['location','title','type','mode','developer','titleType','totalUnits','towers','totalLifts','construction','vp','maintenance'])if(!shown[key])blank(key);
 if(!shown.price)blank('price','priceMax');
 if(!shown.tenure)blank('tenure','tag');
 if(!shown.floors)blank('floors','floorsMax');
 if(!shown.unitsPerFloor)blank('unitsPerFloor','unitsPerFloorMax');
 if(!shown.coordinates)blank('latitude','longitude');
 if(!shown.amenityDistance||!shown.amenityTravelTime)p.nearbyAmenities=(project.nearbyAmenities||[]).map(row=>({...row,...(!shown.amenityDistance&&{distance:null}),...(!shown.amenityTravelTime&&{travelTime:null})}));
 if(!shown.sinkingFund){blank('sinkingFund','sinkingFundAmount');p.sinkingFundStatus=null}
 return p;
}
