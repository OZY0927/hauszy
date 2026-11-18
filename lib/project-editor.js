import {groups} from './project-fields.js';
import {validateSectionVisibility,validateFieldVisibility} from './project-sections.js';
import {isSafeHttpsUrl} from './secure-url.js';
import {publicationHold} from './publication.js';
import {vpQuarter,sinkingFundText} from './project.js';
import {videoSource} from './video.js';
import {FLOOR_PLAN_LIMIT,floorPlanList} from './layout-floor-plans.js';
// Layout fields saved as text, so a layout can say "3+1" or "2 – 3".
export const UNIT_TEXT=['bedrooms','bathrooms','carParks'];
export function editableNumber(value){
 const text=String(value??'').trim();
 return /^-?(?:\d+|\d*\.\d+)(?:[eE][+-]?\d+)?$/.test(text)&&Number.isFinite(Number(text))?text:'';
}
export function editableProjectNumbers(form){
 const result={...form};
 for(const [,fields] of groups)for(const [key,,type] of fields){
  if(['number','range','maintenance'].includes(type))result[key]=editableNumber(form[key]);
  if(type==='range')result[key+'Max']=editableNumber(form[key+'Max']);
 }
 return result;
}
export function editableUnits(units=[]){return units.map(unit=>({...unit,price:editableNumber(unit.price),size:editableNumber(unit.size)}))}
// Number inputs hide legacy text. Clear it in state too, so visible blanks save as blanks.
export function editableAmenities(rows=[]){
 return rows.map(row=>({...row,...Object.fromEntries(['distance','travelTime'].map(key=>{
  const value=String(row[key]??'').trim();
  return [key,/^\d*\.?\d+$/.test(value)&&Number.isFinite(Number(value))?value:''];
 }))}));
}

export function buildProject(form,units,nearbyAmenities,id){
 const record={...form,sectionVisibility:validateSectionVisibility(form.sectionVisibility),fieldVisibility:validateFieldVisibility(form.fieldVisibility),id,units,nearbyAmenities:nearbyAmenities.filter(v=>Object.values(v).some(Boolean))};
 if(form.displayName!=null&&typeof form.displayName!=='string')throw Error('Display name must be text.');
 record.displayName=String(form.displayName||'').trim();if(record.displayName.length>500)throw Error('Keep display name under 500 characters.');
 // Retired fields are dropped on the next save.
 delete record.mapUrl;delete record.brochureUrl;delete record.pricePerSqft;
 if(!String(form.name||'').trim()||!String(form.location||'').trim())throw Error('Enter the project name and location.');
 for(const key of ['price','priceMax','maintenance','totalUnits','towers','floors','floorsMax','unitsPerFloor','unitsPerFloorMax','totalLifts']){const raw=form[key];if(raw==null||raw==='')record[key]=null;else{const value=Number(raw);if(!Number.isFinite(value)||value<0)throw Error('Enter valid positive numbers.');record[key]=value}}
 if(form.maintenanceBasis!=null&&form.maintenanceBasis!==''&&!['per_sqft','fixed','per_shared_unit'].includes(form.maintenanceBasis))throw Error('Choose a valid maintenance fee basis.');
 record.maintenanceBasis=form.maintenanceBasis||'per_sqft';
 if(form.sinkingFundStatus!=null&&form.sinkingFundStatus!==''&&!['included','excluded'].includes(form.sinkingFundStatus))throw Error('Choose a valid sinking fund option.');
 if(form.sinkingFund!=null&&typeof form.sinkingFund!=='string')throw Error('Sinking fund details must be text.');
 if(form.sinkingFundStatus==='excluded'){
  record.sinkingFund=String(form.sinkingFund??sinkingFundText(form)??'').trim();
  if(record.sinkingFund.length>500)throw Error('Keep sinking fund details under 500 characters.');
 }else if(form.sinkingFundStatus==='included'){record.sinkingFund=null}
 record.sinkingFundAmount=null;record.sinkingFundBasis=null;
 // Ranges: "to" alone becomes the single number (except price, where it means "up to"); equal ends collapse to one number.
 for(const [key,name] of [['price','the price range'],['floors','floors'],['unitsPerFloor','units per floor']]){const max=key+'Max';if(key!=='price'&&record[key]==null&&record[max]!=null){record[key]=record[max];record[max]=null}if(record[max]!=null&&record[max]<record[key])throw Error(`The "to" number for ${name} must be at least the "from" number.`);if(record[max]===record[key])record[max]=null}
 // Estimated VP is saved as "Q1 2027"; an older YYYY-MM-DD date is converted to its quarter.
 if(String(form.vp??'').trim()){record.vp=vpQuarter(form.vp);if(!record.vp)throw Error('Enter the estimated VP as a quarter, for example Q1 2027.')}
 if(form.mapCoordinates?.trim()){const pair=form.mapCoordinates.split(',').map(v=>v.trim());if(pair.length!==2||pair.some(v=>v===''||!Number.isFinite(+v))||Math.abs(+pair[0])>90||Math.abs(+pair[1])>180)throw Error('Enter valid latitude, longitude, for example 3.0685, 101.6775.');record.latitude=+pair[0];record.longitude=+pair[1]}else{record.latitude=null;record.longitude=null}delete record.mapCoordinates;
 for(const unit of units){if(!unit.name?.trim())throw Error('Give each layout a name, such as Type A.');for(const key of ['price','size'])if(unit[key]!=null&&unit[key]!==''&&(!Number.isFinite(+unit[key])||+unit[key]<0))throw Error('Enter valid unit specifications.');if(UNIT_TEXT.some(key=>String(unit[key]??'').trim().length>40))throw Error('Keep bedrooms, bathrooms and car parks under 40 characters.')}
 record.units=units.map(({configuration,...unit})=>({...unit,...Object.fromEntries(UNIT_TEXT.map(key=>[key,String(unit[key]??'').trim()||null])),price:unit.price==null||String(unit.price).trim()===''?null:Number(unit.price)}));
 if(record.nearbyAmenities.some(v=>!v.category?.trim()||!v.name?.trim()))throw Error('Enter a category and landmark name for each nearby amenity.');
 for(const row of record.nearbyAmenities)for(const key of ['distance','travelTime']){const value=row[key];if(value==null||value==='')continue;if(!['string','number'].includes(typeof value)||!/^\d*\.?\d+$/.test(String(value))||!Number.isFinite(Number(value)))throw Error('Distance and travel time must be zero or positive numbers, with optional decimals.');}
 if(units.some(v=>floorPlanList(v).length>FLOOR_PLAN_LIMIT))throw Error(`Use up to ${FLOOR_PLAN_LIMIT} floor plan images per layout.`);
 for(const url of units.flatMap(floorPlanList)){try{if(!isSafeHttpsUrl(url))throw Error()}catch{throw Error('Links must start with https://.')}}
 if(form.videoUrl&&!videoSource(form.videoUrl))throw Error('The project video must be a YouTube or Vimeo link, or a direct link to a video file such as .mp4.');
 if(record.status==='Published'&&publicationHold(record))throw Error(publicationHold(record));
 return record;
}
