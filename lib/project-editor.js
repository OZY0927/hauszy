export function buildProject(form,units,nearbyAmenities,id){
 const record={...form,id,units,nearbyAmenities:nearbyAmenities.filter(v=>Object.values(v).some(Boolean))};
 if(!String(form.name||'').trim()||!String(form.location||'').trim())throw Error('Enter the project name and location.');
 for(const key of ['price','priceMax','pricePerSqft','maintenance','totalUnits','towers','floors','floorsMax','unitsPerFloor','unitsPerFloorMax','totalLifts']){const raw=form[key];if(raw==null||raw==='')record[key]=null;else{const value=Number(raw);if(!Number.isFinite(value)||value<0)throw Error('Enter valid positive numbers.');record[key]=value}}
 if(record.priceMax!=null&&record.price!=null&&record.priceMax<record.price)throw Error('Maximum price must be at least the starting price.');
 // Ranges: "to" alone becomes the single number; equal ends collapse to one number.
 for(const [key,name] of [['floors','floors'],['unitsPerFloor','units per floor']]){const max=key+'Max';if(record[key]==null&&record[max]!=null){record[key]=record[max];record[max]=null}if(record[max]!=null&&record[max]<record[key])throw Error(`The "to" number for ${name} must be at least the "from" number.`);if(record[max]===record[key])record[max]=null}
 if(form.mapCoordinates?.trim()){const pair=form.mapCoordinates.split(',').map(v=>v.trim());if(pair.length!==2||pair.some(v=>v===''||!Number.isFinite(+v))||Math.abs(+pair[0])>90||Math.abs(+pair[1])>180)throw Error('Enter valid latitude, longitude, for example 3.0685, 101.6775.');record.latitude=+pair[0];record.longitude=+pair[1]}else{record.latitude=null;record.longitude=null}delete record.mapCoordinates;
 for(const unit of units){if(!unit.name?.trim())throw Error('Give each layout a name, such as Type A.');for(const key of ['size','bedrooms','bathrooms','carParks'])if(unit[key]!=null&&unit[key]!==''&&(!Number.isFinite(+unit[key])||+unit[key]<0))throw Error('Enter valid unit specifications.')}
 if(record.nearbyAmenities.some(v=>!v.category?.trim()||!v.name?.trim()))throw Error('Enter a category and landmark name for each nearby amenity.');
 for(const url of [form.mapUrl,form.brochureUrl,...units.map(v=>v.floorPlanUrl)].filter(Boolean)){try{if(new URL(url).protocol!=='https:')throw Error()}catch{throw Error('Links must start with https://.')}}
 return record;
}
