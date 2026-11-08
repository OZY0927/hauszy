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
