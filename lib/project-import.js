import {isSafeHttpsUrl} from './secure-url.js';
import {groups} from './project-fields.js';
import {buildProject} from './project-editor.js';

const numericFields=['maintenance','totalUnits','towers','floors','floorsMax','unitsPerFloor','unitsPerFloorMax','totalLifts','latitude','longitude'];
const unitNumbers=['price','size','bedrooms','bathrooms','carParks'];
const isObject=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
function pick(source,keys,numbers=[]){
 const result={};
 for(const key of keys){const value=source[key];if(value==null)continue;if(numbers.includes(key)){if(typeof value!=='number'||!Number.isFinite(value))throw Error(`${key} must be a number or null.`)}else if(typeof value!=='string')throw Error(`${key} must be text.`);else if(value.length>20000)throw Error(`${key} is too long.`);result[key]=value}
 return result;
}
export function parseProjectJson(text){
 if(typeof text!=='string'||text.length>200000)throw Error('Project JSON must be under 200,000 characters.');
 let data;try{data=JSON.parse(text)}catch{throw Error('Invalid JSON. Check quotes, commas and brackets.');}
 if(!isObject(data))throw Error('Paste one project as a JSON object.');
 const fields=[...groups.flatMap(([,fields])=>fields.map(([key])=>key)), 'floorsMax','unitsPerFloorMax','latitude','longitude','status'];
 const form=pick(data,fields,numericFields);
 form.status=form.status||'Archived';
 if(!['Archived','Published'].includes(form.status))throw Error('Status must be Archived or Published.');
 if(form.vp&&(!/^\d{4}-\d{2}-\d{2}$/.test(form.vp)||!Number.isFinite(Date.parse(form.vp))||new Date(form.vp).toISOString().slice(0,10)!==form.vp))throw Error('Estimated VP date must be a valid YYYY-MM-DD date.');
 if(form.latitude!=null||form.longitude!=null){if(form.latitude==null||form.longitude==null)throw Error('Provide both latitude and longitude.');form.mapCoordinates=`${form.latitude}, ${form.longitude}`;}
 const arrays={};
 for(const key of ['units','nearbyAmenities','images']){if(data[key]!=null&&!Array.isArray(data[key]))throw Error(`${key} must be an array.`);arrays[key]=data[key]||[];}
 if(arrays.units.length>100||arrays.nearbyAmenities.length>200)throw Error('Use up to 100 layouts and 200 nearby amenities.');
 const units=arrays.units.map(row=>{if(!isObject(row))throw Error('Each unit must be an object.');return pick(row,['name',...unitNumbers,'floorPlanUrl'],unitNumbers)});
 const nearbyAmenities=arrays.nearbyAmenities.map(row=>{if(!isObject(row))throw Error('Each nearby amenity must be an object.');const value=pick(row,['category','name']);for(const key of ['distance','travelTime']){if(row[key]!=null){if(!['string','number'].includes(typeof row[key])||(typeof row[key]==='number'&&row[key]<0))throw Error(`${key} must be text or a positive number.`);value[key]=String(row[key]);}}return value;});
 if(arrays.images.length>10)throw Error('Use up to 10 project photos.');
 for(const url of arrays.images){try{if(!isSafeHttpsUrl(url))throw Error()}catch{throw Error('Photo links must start with https://.');}}
 const record=buildProject(form,units,nearbyAmenities,'');
 return {form:{...record,mapCoordinates:form.mapCoordinates||''},units:record.units,nearbyAmenities:record.nearbyAmenities,photos:arrays.images.map(url=>({url}))};
}
