import {legacyProjectSlugs} from './legacy-project-slugs.js';
import {fieldVisibility} from './project-sections.js';

const reservedSlugs=new Set(Object.values(legacyProjectSlugs));
const maxSlugLength=120;
export const isProjectUuid=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export const legacyProjectSlug=id=>Object.hasOwn(legacyProjectSlugs,id)?legacyProjectSlugs[id]:null;
export const isAvailableProjectSlug=slug=>!reservedSlugs.has(slug);
export const isProjectSlug=slug=>typeof slug==='string'&&slug.length<=maxSlugLength&&slug!=='browse'&&!isProjectUuid(slug)&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
const slugify=value=>String(value??'').normalize('NFKD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

export function projectSlugCandidate(project,number=1){
 const name=slugify(project.displayName)||slugify(project.name);
 const location=fieldVisibility(project.fieldVisibility).location?slugify(project.location):'';
 const base=location&&!('-'+name+'-').includes('-'+location+'-')?[name,location].filter(Boolean).join('-'):name;
 const readable=base&&base!=='browse'&&!isProjectUuid(base)?base:`project${base?'-'+base:''}`;
 const suffix=number===1?'':'-'+number;
 return readable.slice(0,maxSlugLength-suffix.length).replace(/-$/,'')+suffix;
}

export function projectUrlSegment(project){
 return legacyProjectSlug(project.id)||(isProjectSlug(project.publicSlug)&&isAvailableProjectSlug(project.publicSlug)?project.publicSlug:project.id);
}

export const projectHref=project=>`/projects/${encodeURIComponent(projectUrlSegment(project))}/`;

// Older article bodies can contain an ID link even after the editor switches to readable URLs.
export function canonicalGuideProjectHref(href){
 if(!href)return href;
 const match=/^(https:\/\/(?:www\.)?hauszy\.com)?\/projects\/([A-Za-z0-9_-]+)\/?([?#].*)?$/.exec(href);
 const slug=match&&legacyProjectSlug(match[2]);
 return slug?`${match[1]||''}/projects/${slug}/${match[3]||''}`:href;
}
