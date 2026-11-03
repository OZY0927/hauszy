import {isSafeHttpsUrl} from './secure-url.js';
import {publicationHold} from './publication.js';
import {layoutPriceRange,vpQuarter} from './project.js';
import {videoSource} from './video.js';
// Layout fields saved as text, so a layout can say "3+1" or "2 – 3".
export const UNIT_TEXT=['bedrooms','bathrooms','carParks'];
export function buildProject(form,units,nearbyAmenities,id){
 const record={...form,id,units,nearbyAmenities:nearbyAmenities.filter(v=>Object.values(v).some(Boolean))};
 // Retired fields are dropped on the next save.
 delete record.mapUrl;delete record.brochureUrl;delete record.pricePerSqft;
 if(!String(form.name||'').trim()||!String(form.location||'').trim())throw Error('Enter the project name and location.');
 for(const key of ['maintenance','totalUnits','towers','floors','floorsMax','unitsPerFloor','unitsPerFloorMax','totalLifts']){const raw=form[key];if(raw==null||raw==='')record[key]=null;else{const value=Number(raw);if(!Number.isFinite(value)||value<0)throw Error('Enter valid positive numbers.');record[key]=value}}
 // Ranges: "to" alone becomes the single number; equal ends collapse to one number.
 for(const [key,name] of [['floors','floors'],['unitsPerFloor','units per floor']]){const max=key+'Max';if(record[key]==null&&record[max]!=null){record[key]=record[max];record[max]=null}if(record[max]!=null&&record[max]<record[key])throw Error(`The "to" number for ${name} must be at least the "from" number.`);if(record[max]===record[key])record[max]=null}
 // Estimated VP is saved as "Q1 2027"; an older YYYY-MM-DD date is converted to its quarter.
 if(String(form.vp??'').trim()){record.vp=vpQuarter(form.vp);if(!record.vp)throw Error('Enter the estimated VP as a quarter, for example Q1 2027.')}
 if(form.mapCoordinates?.trim()){const pair=form.mapCoordinates.split(',').map(v=>v.trim());if(pair.length!==2||pair.some(v=>v===''||!Number.isFinite(+v))||Math.abs(+pair[0])>90||Math.abs(+pair[1])>180)throw Error('Enter valid latitude, longitude, for example 3.0685, 101.6775.');record.latitude=+pair[0];record.longitude=+pair[1]}else{record.latitude=null;record.longitude=null}delete record.mapCoordinates;
 for(const unit of units){if(!unit.name?.trim())throw Error('Give each layout a name, such as Type A.');for(const key of ['price','size'])if(unit[key]!=null&&unit[key]!==''&&(!Number.isFinite(+unit[key])||+unit[key]<0))throw Error('Enter valid unit specifications.');if(UNIT_TEXT.some(key=>String(unit[key]??'').trim().length>40))throw Error('Keep bedrooms, bathrooms and car parks under 40 characters.')}
 record.units=units.map(({configuration,...unit})=>({...unit,...Object.fromEntries(UNIT_TEXT.map(key=>[key,String(unit[key]??'').trim()||null])),price:unit.price==null||String(unit.price).trim()===''?null:Number(unit.price)}));
 Object.assign(record,layoutPriceRange(record.units));
 if(record.nearbyAmenities.some(v=>!v.category?.trim()||!v.name?.trim()))throw Error('Enter a category and landmark name for each nearby amenity.');
 for(const url of units.map(v=>v.floorPlanUrl).filter(Boolean)){try{if(!isSafeHttpsUrl(url))throw Error()}catch{throw Error('Links must start with https://.')}}
 if(form.videoUrl&&!videoSource(form.videoUrl))throw Error('The project video must be a YouTube or Vimeo link, or a direct link to a video file such as .mp4.');
 if(record.status==='Published'&&publicationHold(record))throw Error(publicationHold(record));
 return record;
}
