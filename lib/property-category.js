// Broad browsing groups; the stored property type remains unchanged.
export const PROPERTY_CATEGORIES=['Apartment','Landed','Commercial'];
export function propertyCategory(project){
 const type=String(project.type||'');
 if(/commercial|industr|shop|retail|office|factor|warehouse|hotel|soho|sovo|sofo/i.test(type+' '+(project.mode||'')))return 'Commercial';
 if(/land|terrace|semi.?detach|bungalow|cluster|townhouse|detached|link.?house/i.test(type))return 'Landed';
 if(/condo|apart|residen|suite|flat|studio|penthouse/i.test(type))return 'Apartment';
 return 'Landed';
}
