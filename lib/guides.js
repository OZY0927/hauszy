import {isMediaPath} from './media.js';
import {isSafeHttpsUrl} from './secure-url.js';

export const GUIDE_CATEGORIES=['Buyer Guide','Condo Comparison','Project Update'];
export const GUIDE_TOOLS=[
 ['/tools/upfront-cash-calculator/','Upfront Cash Calculator'],
 ['/tools/loan-calculator/','Housing Loan Calculator'],
 ['/tools/loan-eligibility/','Loan Eligibility Calculator'],
 ['/tools/roi-calculator/','Rental Yield & ROI Calculator'],
];
export const guidePath=slug=>`/guides/${slug}/`;
export const validGuideSlug=slug=>typeof slug==='string'&&slug.length<=80&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
export const suggestGuideSlug=title=>title.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80).replace(/-$/,'');
export const guideDateLabel=date=>new Date(date).toLocaleDateString('en-MY',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kuala_Lumpur'});
export const guideCoverAllowed=url=>isMediaPath(url)||isSafeHttpsUrl(url)||(typeof url==='string'&&/^\/penang\/[a-z0-9-]+\.(?:jpg|webp|png)$/i.test(url));

// Markdown anchors can point to the Hauszy site or to a fully qualified HTTPS reference.
export function guideHref(value){
 if(isSafeHttpsUrl(value))return value;
 if(typeof value!=='string'||/[\u0000-\u0020\u007f\\]/.test(value))return '';
 if(/^\/(?!\/)/.test(value)||/^#[\w-]+$/.test(value))return value;
 return '';
}

function inputText(value,limit,label){
 if(value==null)return '';
 if(typeof value!=='string'||value.trim().length>limit)throw Error(`Keep ${label} under ${limit.toLocaleString('en-MY')} characters.`);
 return value.trim();
}

function normalizeSources(rows,publishing){
 if(!Array.isArray(rows)||rows.length>12)throw Error('Use up to 12 sources.');
 return rows.map(row=>{
  const label=inputText(row?.label,120,'each source label');
  const url=inputText(row?.url,4096,'each source URL');
  const checkedOn=inputText(row?.checkedOn,10,'each source date');
  if(url&&!isSafeHttpsUrl(url))throw Error('Source links must start with https://.');
  if(checkedOn&&(!/^\d{4}-\d{2}-\d{2}$/.test(checkedOn)||!Number.isFinite(Date.parse(checkedOn))||new Date(checkedOn).toISOString().slice(0,10)!==checkedOn))throw Error('Enter a valid source check date.');
  if(publishing&&(label||url||checkedOn)&&(!label||!url))throw Error('Give each source a label and a URL before publishing.');
  return {label,url,checkedOn};
 }).filter(source=>source.label||source.url||source.checkedOn);
}

export function guideContent(form,publishing){
 const title=inputText(form.title,120,'the title');
 const summary=inputText(form.summary,320,'the short answer');
 const body=inputText(form.body,40000,'the article');
 const author=inputText(form.author,100,'the author name');
 const seoTitle=inputText(form.seoTitle,80,'the search title');
 const seoDescription=inputText(form.seoDescription,180,'the search description');
 if(!title)throw Error('Enter a title.');
 if(publishing&&(!summary||!body||!author))throw Error('Add a short answer, article body and author before publishing.');
 if(!GUIDE_CATEGORIES.includes(form.category))throw Error('Choose an article category.');
 const coverUrl=inputText(form.coverUrl,4096,'the cover URL');
 const coverAlt=inputText(form.coverAlt,180,'the cover description');
 if(coverUrl&&!guideCoverAllowed(coverUrl))throw Error('Upload a cover or use a valid HTTPS image URL.');
 if(publishing&&coverUrl&&!coverAlt)throw Error('Describe the cover photo before publishing.');
 const projectId=inputText(form.projectId,128,'the project identifier');
 if(projectId&&!/^[A-Za-z0-9_-]+$/.test(projectId))throw Error('Choose a project from the list.');
 const tools=GUIDE_TOOLS.filter(([path])=>Array.isArray(form.tools)&&form.tools.includes(path)).map(([path])=>path);
 return {title,summary,body,author,seoTitle,seoDescription,category:form.category,coverUrl,coverAlt,projectId,tools,sources:normalizeSources(form.sources||[],publishing)};
}

export function guideRecords({slug,form,current,action,now}){
 if(!validGuideSlug(slug))throw Error('Use an article URL with lowercase letters, numbers and single hyphens.');
 const publishing=action==='publish';
 const content=guideContent(action==='withdraw'?current:form,publishing);
 const publishedAt=current?.publishedAt||(publishing?now:'');
 const hasDraftChanges=action==='draft'&&current?.isPublished===true;
 const draft={...content,isPublished:publishing||hasDraftChanges,hasDraftChanges,publishedAt,updatedAt:now,revision:(current?.revision||0)+1};
 const publication=publishing?{...content,status:'Published',publishedAt,updatedAt:now}:action==='withdraw'?{status:'Withdrawn'}:null;
 return {draft,publication};
}

export function publishedGuides(starters,overrides){
 const articles=new Map(starters.map(guide=>[guide.slug,guide]));
 for(const guide of overrides){
  if(!validGuideSlug(guide.slug))continue;
  if(guide.status==='Withdrawn'){articles.delete(guide.slug);continue}
  if(guide.status==='Published'&&guide.title&&guide.summary&&guide.body)articles.set(guide.slug,guide);
 }
 return [...articles.values()].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)||a.title.localeCompare(b.title));
}
