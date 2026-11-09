import {propertyCategory} from './property-category.js';
import {isSafeHttpsUrl} from './secure-url.js';
import {isMediaPath} from './media.js';
import {FLOOR_PLAN_LIMIT,floorPlanList} from './layout-floor-plans.js';
// The project page shows up to this many showroom photos in its grid.
export const SHOWROOM_LIMIT=6;
// The project's own minimum and maximum price (entered in the editor), either of which may be blank.
// priceMax is kept only when it is above the minimum. When both are blank the layout prices give the range instead.
export function priceRange(minimum,maximum,units=[]){const amount=v=>{const n=num(v);return n>0?n:null},low=amount(minimum),high=amount(maximum);if(low!=null||high!=null)return {price:low,priceMax:high!=null&&(low==null||high>low)?high:null};const prices=units.map(u=>amount(u?.price)).filter(n=>n!=null),top=prices.length?Math.max(...prices):null,bottom=prices.length?Math.min(...prices):null;return {price:bottom,priceMax:top>bottom?top:null}}
// Lowest and highest known price, for filtering and sorting; an "up to" price counts as both.
export const priceLow=p=>p.price||p.priceMax||null,priceHigh=p=>p.priceMax||p.price||null;
export function normaliseProject(data,id){
 const units=Array.isArray(data.units)?data.units.filter(v=>v&&typeof v==='object').map(({floorPlanUrl,...unit})=>({...unit,floorPlanUrls:floorPlanList({floorPlanUrl,...unit}).filter(safeUrl).slice(0,FLOOR_PLAN_LIMIT)})):[],first=units[0]||{};
 return {...data,id:String(id),name:data.name||'Untitled project',title:data.title||data.name||'Discover this project',location:data.location||'Location to be confirmed',type:data.type||'Property',mode:data.mode||'Project',tag:data.tenure||data.tag||'To be confirmed',...priceRange(data.price,data.priceMax,units),beds:unitText(units,'bedrooms')??'—',baths:unitText(units,'bathrooms')??'—',size:unitRange(units,'size')??'—',units,images:Array.isArray(data.images)?data.images.filter(safeUrl):[],showroomImages:Array.isArray(data.showroomImages)?data.showroomImages.filter(safeUrl).slice(0,SHOWROOM_LIMIT):[],facilities:Array.isArray(data.facilities)?data.facilities:typeof data.facilities==='string'?data.facilities.split(/[,\n]/).map(v=>v.trim()).filter(Boolean):[],nearbyAmenities:Array.isArray(data.nearbyAmenities)?data.nearbyAmenities:[]};
}
export function safeUrl(url){return isMediaPath(url)||isSafeHttpsUrl(url)}
export const money=value=>'RM '+Number(value).toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2});
// Whole ringgit with no space or decimals: 3200000 → "RM3,200,000".
export const wholeMoney=value=>'RM'+Math.round(Number(value)).toLocaleString('en-MY');
// The headline price on cards and the project page: ['From', minimum], or ['Up to', maximum] when only a maximum is known.
export function startingPrice(p,format=wholeMoney){return p?.price>0?['From',format(p.price)]:p?.priceMax>0?['Up to',format(p.priceMax)]:null}
// Short prices: K is a whole number (255500 → "RM 256K"), MIL has up to two decimals (2500000 → "RM 2.5MIL").
export function compactMoney(value){const n=Number(value),short=x=>String(+x.toFixed(2));return !(n>0)?null:'RM '+(n>=999500?short(n/1e6)+'MIL':n>=1000?Math.round(n/1e3)+'K':short(n))}
// "RM 250K – RM 2.5MIL", "From RM 250K", "Up to RM 2.5MIL", or null when the project has no price.
export function priceText(p,format=money){const parts=priceParts(p,format);return parts&&parts.filter(Boolean).join(' ')}
// The same as [lead, amount] so a page can style "From" / "Up to" on its own; lead is '' for a range.
export function priceParts(p,format=money){return p?.price>0?p.priceMax>p.price?['',`${format(p.price)} – ${format(p.priceMax)}`]:['From',format(p.price)]:p?.priceMax>0?['Up to',format(p.priceMax)]:null}
export function withUnit(value,unit,fallback='To be confirmed'){const text=String(value??'').trim();return !text?fallback:/^\d+(?:\.\d+)?$/.test(text)?`${text} ${unit==='mins'&&Number(text)===1?'min':unit}`:text}
export function groupAmenities(items=[]){const groups=new Map();for(const row of items){if(!row?.name||!row.category)continue;const label=String(row.category).trim(),key=label.toLowerCase();if(!groups.has(key))groups.set(key,{label,rows:[]});groups.get(key).rows.push(row)}return [...groups.values()]}
export function filterProjects(projects,{location='',type='',minimum=0,maximum=null,savedOnly=false,saved=[]}){const term=location.trim().toLowerCase();return projects.filter(p=>(!term||p.location.toLowerCase().includes(term))&&(!type||(type.startsWith('group:')?propertyCategory(p)===type.slice(6):p.type===type))&&(!savedOnly||saved.includes(p.id))&&((maximum===null&&minimum===0)||(priceLow(p)>0&&priceHigh(p)>=minimum&&(maximum===null||priceLow(p)<=maximum))))}
const num=v=>{if(v==null||v==='')return null;const n=Number(String(v).replace(/,/g,''));return Number.isFinite(n)?n:null};
// Price per sqft is always calculated: the project's minimum price ÷ the smallest layout size.
export function pricePerSqft(p){const sizes=(p.units||[]).map(u=>num(u.size)).filter(n=>n>0);return p.price>0&&sizes.length?Math.round(p.price/Math.min(...sizes)):null}
// Estimated VP as a quarter, e.g. "Q1 2027", or null. Older records stored a YYYY-MM-DD date, shown as its quarter.
export function vpQuarter(value){const text=String(value??'').trim();let m=text.match(/^Q([1-4])\s*(\d{4})$/i);if(m)return `Q${m[1]} ${m[2]}`;m=text.match(/^(\d{4})-(\d{2})-\d{2}$/);return m&&+m[2]>=1&&+m[2]<=12?`Q${Math.ceil(m[2]/3)} ${m[1]}`:null}
// Completion as a timestamp for sorting: the start of the VP quarter, 0 for completed projects without one, null when unknown.
export function completionTime(p){const q=vpQuarter(p.vp);return q?Date.UTC(+q.slice(3),(q[1]-1)*3,1):p.construction==='Completed'?0:null}
// "38 – 45" from the numbers given (blanks ignored), "45" when they agree, or null when there are none.
export function formatRange(values,suffix=''){const nums=values.map(num).filter(n=>n!=null&&n>=0);if(!nums.length)return null;const low=Math.min(...nums),high=Math.max(...nums),f=n=>n.toLocaleString('en-MY');return f(low)+(high>low?' – '+f(high):'')+suffix}
// "850 – 1,200" across a project's layouts, or null when no layout has a number.
export const unitRange=(units=[],key,suffix='')=>formatRange(units.map(u=>u[key]),suffix);
// Text layout fields (bedrooms, bathrooms, car parks): a range when every value is a plain number, otherwise the distinct values, e.g. "2 / 3+1".
export function unitText(units=[],key){const values=[...new Set(units.map(u=>String(u?.[key]??'').trim()).filter(Boolean))];return !values.length?null:values.every(v=>num(v)!=null)?formatRange(values):values.join(' / ')}
// The text value with the smallest leading number, as entered (e.g. "2+1"), for card "starting from" figures; null when none is given.
export function unitLeast(units=[],key){const lead=v=>parseFloat(v.replace(/,/g,'')),values=units.map(u=>String(u?.[key]??'').trim()).filter(Boolean),ranked=values.filter(v=>!Number.isNaN(lead(v))).sort((a,b)=>lead(a)-lead(b));return ranked[0]??values[0]??null}
// Smallest value across a project's layouts (for "starting from" figures on cards), or null.
export function unitMin(units=[],key){const values=units.map(u=>num(u[key])).filter(n=>n!=null&&n>=0);return values.length?Math.min(...values):null}
export const largestSize=p=>{const sizes=(p.units||[]).map(u=>num(u.size)).filter(n=>n>0);return sizes.length?Math.max(...sizes):null};
export const maintenanceFee=p=>{const n=num(p.maintenance);return n>0?n:null};
// Only what cards, filters, sorting and the compare table use, so the listing page sends far less data.
export function cardProject(p){return {id:p.id,name:p.name,displayName:listingName(p),location:p.location,type:p.type,mode:p.mode,tag:p.tag,tenure:p.tenure??null,developer:p.developer??null,price:p.price,priceMax:p.priceMax??null,maintenance:p.maintenance??null,vp:p.vp??null,construction:p.construction??null,listedAt:p.listedAt??null,updatedAt:typeof p.updatedAt==='string'?p.updatedAt:null,images:p.images.slice(0,1),units:p.units.map(u=>({size:u.size??null,bedrooms:u.bedrooms??null,bathrooms:u.bathrooms??null}))}}
// Page numbers to show: first, last and around the current page; null marks a gap ("…").
export function pageList(current,total){const keep=[...new Set([1,total,current-1,current,current+1])].filter(n=>n>=1&&n<=total).sort((a,b)=>a-b),out=[];let last=0;for(const n of keep){if(n-last>2)out.push(null);else if(n-last===2)out.push(n-1);out.push(n);last=n}return out}
export const SORTS=[['name-asc','Name: A to Z'],['newest','Newest'],['price-asc','Price: low to high'],['price-desc','Price: high to low'],['psf-asc','Price per sqft: low to high'],['completion','Completion: earliest first'],['name-desc','Name: Z to A']];
export const listingName=p=>(typeof p.displayName==='string'?p.displayName.trim():'')||p.name||'';
const byName=p=>String(listingName(p)).trim()||null;
const SORT_KEYS={newest:p=>{const t=Date.parse(p.listedAt||p.updatedAt);return Number.isFinite(t)?-t:null},'price-asc':priceLow,'price-desc':p=>priceHigh(p)?-priceHigh(p):null,'psf-asc':pricePerSqft,completion:completionTime,'name-asc':byName,'name-desc':byName};
// Names compare alphabetically, ignoring case, with "Tower 2" before "Tower 10".
const compare=(x,y)=>typeof x==='string'?x.localeCompare(y,'en',{numeric:true,sensitivity:'base'}):x-y;
// Stable sort; projects missing the sorted figure go last in every order.
export function sortProjects(projects,order='newest'){const key=SORT_KEYS[order]||SORT_KEYS.newest,dir=order==='name-desc'?-1:1;return projects.map((p,i)=>[key(p),i,p]).sort((a,b)=>(a[0]==null)-(b[0]==null)||(a[0]!=null&&b[0]!=null&&dir*compare(a[0],b[0]))||a[1]-b[1]).map(r=>r[2])}
