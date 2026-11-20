export const PROJECT_SECTIONS=[
 ['photos','Project photos'],['overview','Overview'],['details','Project details'],['units','Unit layouts & floor plans'],['facilities','Facilities'],['location','Location & nearby amenities'],['maintenance','Maintenance & sinking fund'],['showroom','Showroom'],['enquiry','Enquiry & booking panel'],['video','Project video'],['related','Related projects']
];
// Legacy and new projects show every section by default. Data availability still applies.
export function sectionVisibility(value){return Object.fromEntries(PROJECT_SECTIONS.map(([key])=>[key,value?.[key]!==false]))}
export function validateSectionVisibility(value){
 if(value==null)return sectionVisibility();
 if(typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(key=>!PROJECT_SECTIONS.some(([name])=>name===key)||typeof value[key]!=='boolean'))throw Error('sectionVisibility must contain known section names with true or false values.');
 return sectionVisibility(value);
}
// Individual pieces of information, grouped under the section they appear in.
export const PROJECT_FIELDS=[
 ['location','Project location','overview'],['title','Project headline','overview'],['type','Property type','overview'],['mode','Project category','overview'],['price','Starting price','overview'],['editorial','Public project summary and sources','overview'],
 ['developer','Developer','details'],['tenure','Tenure','details'],['titleType','Title','details'],['totalUnits','Total units','details'],['towers','Towers / blocks','details'],['floors','Total floors','details'],['unitsPerFloor','Units per floor','details'],['totalLifts','Total lifts','details'],['construction','Construction status','details'],['vp','Estimated vacant possession','details'],['pricePerSqft','Price per sqft','details'],
 ['unitPrice','Layout prices','units'],['unitSize','Built-up sizes','units'],['unitBedrooms','Bedrooms','units'],['unitBathrooms','Bathrooms','units'],['unitCarParks','Car parks','units'],['floorPlans','Floor plans','units'],
 ['coordinates','Map pin','location'],['amenityDistance','Amenity distances','location'],['amenityTravelTime','Amenity travel times','location'],
 ['maintenance','Maintenance fee','maintenance'],['sinkingFund','Sinking fund','maintenance']
];
export function fieldVisibility(value){return Object.fromEntries(PROJECT_FIELDS.map(([key])=>[key,value?.[key]!==false]))}
export function validateFieldVisibility(value){
 if(value==null)return fieldVisibility();
 if(typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(key=>!PROJECT_FIELDS.some(([name])=>name===key)||typeof value[key]!=='boolean'))throw Error('fieldVisibility must contain known field names with true or false values.');
 return fieldVisibility(value);
}
