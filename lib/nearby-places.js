// A fixed, bounded search around a published project's saved coordinates.
export const NEARBY_RADIUS=3000;
export const NEARBY_CATEGORIES=[
 {id:'food',label:'Food',icon:'utensils',filters:['[amenity~"^(restaurant|cafe|fast_food|food_court)$"]']},
 {id:'schools',label:'Schools',icon:'school',filters:['[amenity~"^(school|kindergarten|college|university)$"]']},
 {id:'shopping',label:'Shopping',icon:'shoppingBag',filters:['[shop~"^(mall|supermarket|convenience|department_store)$"]']},
 {id:'healthcare',label:'Healthcare',icon:'hospital',filters:['[amenity~"^(hospital|clinic|pharmacy|dentist)$"]']},
 {id:'transport',label:'Transport',icon:'train',filters:['[highway=bus_stop]','[railway~"^(station|halt|tram_stop)$"]']},
 {id:'leisure',label:'Leisure',icon:'leaf',filters:['[leisure~"^(park|sports_centre|playground|garden)$"]','[tourism~"^(attraction|museum)$"]']}
];
export function coordinates(latitude,longitude){
 if(latitude==null||longitude==null||String(latitude).trim()===''||String(longitude).trim()==='')return null;
 const lat=Number(latitude),lng=Number(longitude);
 return Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180?[lat,lng]:null;
}
export function nearbyQuery(lat,lng){
 const point=coordinates(lat,lng);if(!point)throw Error('Invalid project coordinates');
 return `[out:json][timeout:20][maxsize:16777216];(${NEARBY_CATEGORIES.flatMap(category=>category.filters.map(filter=>`nwr(around:${NEARBY_RADIUS},${point[0]},${point[1]})${filter}[name];`)).join('')});out center tags;`;
}
export function distanceMetres(a,b){
 const rad=Math.PI/180,dlat=(b[0]-a[0])*rad,dlng=(b[1]-a[1])*rad;
 const h=Math.sin(dlat/2)**2+Math.cos(a[0]*rad)*Math.cos(b[0]*rad)*Math.sin(dlng/2)**2;
 return Math.round(6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h))));
}
function categoryFor(tags){
 if(/^(restaurant|cafe|fast_food|food_court)$/.test(tags.amenity))return 'food';
 if(/^(school|kindergarten|college|university)$/.test(tags.amenity))return 'schools';
 if(/^(mall|supermarket|convenience|department_store)$/.test(tags.shop))return 'shopping';
 if(/^(hospital|clinic|pharmacy|dentist)$/.test(tags.amenity))return 'healthcare';
 if(tags.highway==='bus_stop'||/^(station|halt|tram_stop)$/.test(tags.railway))return 'transport';
 if(/^(park|sports_centre|playground|garden)$/.test(tags.leisure)||/^(attraction|museum)$/.test(tags.tourism))return 'leisure';
 return null;
}
export function nearbyPlaces(data,lat,lng){
 if(!Array.isArray(data?.elements)||data.remark)throw Error('Incomplete nearby search');
 const origin=coordinates(lat,lng);if(!origin)throw Error('Invalid project coordinates');
 const result=Object.fromEntries(NEARBY_CATEGORIES.map(c=>[c.id,[]]));
 const seen=new Set();
 const rows=data.elements.flatMap(element=>{
  const tags=element.tags||{},point=coordinates(element.lat??element.center?.lat,element.lon??element.center?.lon),category=categoryFor(tags);
  if(!point||!category||!['node','way','relation'].includes(element.type)||!Number.isSafeInteger(element.id)||element.id<1||typeof tags.name!=='string'||!tags.name.trim())return [];
  const distance=distanceMetres(origin,point);if(distance>NEARBY_RADIUS)return [];
  return [{id:`${element.type}/${element.id}`,name:tags.name.trim().slice(0,180),latitude:point[0],longitude:point[1],category,distance,kind:String(tags.amenity||tags.shop||tags.leisure||tags.railway||tags.tourism||'Bus stop').replaceAll('_',' ').slice(0,60)}];
 }).sort((a,b)=>a.distance-b.distance);
 for(const row of rows){
  // OSM may describe the same venue as both a building and a point.
  const duplicate=result[row.category].some(other=>other.name.toLowerCase()===row.name.toLowerCase()&&distanceMetres([row.latitude,row.longitude],[other.latitude,other.longitude])<60);
  if(seen.has(row.id)||duplicate)continue;
  seen.add(row.id);if(result[row.category].length<30)result[row.category].push(row);
 }
 return result;
}
