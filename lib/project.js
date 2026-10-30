export function normaliseProject(data,id){
 const units=Array.isArray(data.units)?data.units.filter(v=>v&&typeof v==='object'):[],first=units[0]||{};
 return {...data,id:String(id),name:data.name||'Untitled project',title:data.title||data.name||'Discover this project',location:data.location||'Location to be confirmed',type:data.type||'Property',mode:data.mode||'Project',tag:data.tenure||data.tag||'To be confirmed',price:Number(data.price)||0,beds:unitRange(units,'bedrooms')??'—',baths:unitRange(units,'bathrooms')??'—',size:unitRange(units,'size')??'—',units,images:Array.isArray(data.images)?data.images.filter(safeUrl):[],facilities:Array.isArray(data.facilities)?data.facilities:typeof data.facilities==='string'?data.facilities.split(/[,\n]/).map(v=>v.trim()).filter(Boolean):[],nearbyAmenities:Array.isArray(data.nearbyAmenities)?data.nearbyAmenities:[]};
}
export function safeUrl(url){return typeof url==='string'&&url.startsWith('https://')}
export const money=value=>'RM '+Number(value).toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2});
export function withUnit(value,unit,fallback='To be confirmed'){const text=String(value??'').trim();return !text?fallback:/^\d+(?:\.\d+)?$/.test(text)?`${text} ${unit==='mins'&&Number(text)===1?'min':unit}`:text}
export function groupAmenities(items=[]){const groups=new Map();for(const row of items){if(!row?.name||!row.category)continue;const label=String(row.category).trim(),key=label.toLowerCase();if(!groups.has(key))groups.set(key,{label,rows:[]});groups.get(key).rows.push(row)}return [...groups.values()]}
export function filterProjects(projects,{location='',type='',minimum=0,maximum=null,savedOnly=false,saved=[]}){const term=location.trim().toLowerCase();return projects.filter(p=>(!term||p.location.toLowerCase().includes(term))&&(!type||p.type===type)&&(!savedOnly||saved.includes(p.id))&&((maximum===null&&minimum===0)||(p.price>0&&p.price>=minimum&&(maximum===null||p.price<=maximum))))}
const num=v=>{if(v==null||v==='')return null;const n=Number(String(v).replace(/,/g,''));return Number.isFinite(n)?n:null};
// Price per sqft: the admin's figure, else the starting price ÷ the smallest layout.
export function pricePerSqft(p){const set=num(p.pricePerSqft);if(set>0)return set;const sizes=(p.units||[]).map(u=>num(u.size)).filter(n=>n>0);return p.price>0&&sizes.length?Math.round(p.price/Math.min(...sizes)):null}
// Completion as a timestamp for sorting: the VP date, 0 for completed projects without one, null when unknown.
export function completionTime(p){const t=Date.parse(p.vp);return Number.isFinite(t)?t:p.construction==='Completed'?0:null}
// "38 – 45" from the numbers given (blanks ignored), "45" when they agree, or null when there are none.
export function formatRange(values,suffix=''){const nums=values.map(num).filter(n=>n!=null&&n>=0);if(!nums.length)return null;const low=Math.min(...nums),high=Math.max(...nums),f=n=>n.toLocaleString('en-MY');return f(low)+(high>low?' – '+f(high):'')+suffix}
// "850 – 1,200" across a project's layouts, or null when no layout has a number.
export const unitRange=(units=[],key,suffix='')=>formatRange(units.map(u=>u[key]),suffix);
// Smallest value across a project's layouts (for "starting from" figures on cards), or null.
export function unitMin(units=[],key){const values=units.map(u=>num(u[key])).filter(n=>n!=null&&n>=0);return values.length?Math.min(...values):null}
export const largestSize=p=>{const sizes=(p.units||[]).map(u=>num(u.size)).filter(n=>n>0);return sizes.length?Math.max(...sizes):null};
export const maintenanceFee=p=>{const n=num(p.maintenance);return n>0?n:null};
export const SORTS=[['newest','Newest'],['price-asc','Price: low to high'],['price-desc','Price: high to low'],['psf-asc','Price per sqft: low to high'],['completion','Completion: earliest first']];
const SORT_KEYS={newest:p=>{const t=Date.parse(p.listedAt||p.updatedAt);return Number.isFinite(t)?-t:null},'price-asc':p=>p.price||null,'price-desc':p=>p.price?-p.price:null,'psf-asc':pricePerSqft,completion:completionTime};
// Stable sort; projects missing the sorted figure go last in every order.
export function sortProjects(projects,order='newest'){const key=SORT_KEYS[order]||SORT_KEYS.newest;return projects.map((p,i)=>[key(p),i,p]).sort((a,b)=>(a[0]==null)-(b[0]==null)||(a[0]??0)-(b[0]??0)||a[1]-b[1]).map(r=>r[2])}
