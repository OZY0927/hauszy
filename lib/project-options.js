import {groups} from './project-fields.js';
export const optionGroups=[...groups.flatMap(([,fields])=>fields.filter(([, ,type])=>type==='select').map(([key,label,,values])=>({key,label,defaults:values.filter(Boolean)}))),{key:'amenityCategory',label:'Nearby amenity category',defaults:['Schools','Hospitals','Shopping','Public transport','Highways','Workplaces']}];
export function projectOptions(saved,records=[],legacy={}){
 return Object.fromEntries(optionGroups.map(({key,defaults})=>{
 const existing=key==='amenityCategory'?records.flatMap(p=>(p.nearbyAmenities||[]).map(a=>a.category)):records.map(p=>p[key]);
 const values=Array.isArray(saved?.[key])?saved[key]:[...defaults,...existing,...(legacy[key]||[])];
 return [key,[...new Set(values.filter(v=>typeof v==='string'&&v.trim()).map(v=>v.trim()))]];
 }));
}
