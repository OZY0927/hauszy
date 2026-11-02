import {getPublishedProjects} from '../lib/firestore-server';
import {absoluteUrl,publicPaths} from '../lib/seo';
export const revalidate=86400;
export default async function sitemap(){
 if(!absoluteUrl('/'))return [];
 // Let a transient database error fail and retry rather than caching an incomplete project sitemap.
 const projects=await getPublishedProjects();
 return [...publicPaths.map(path=>({url:absoluteUrl(path)})),...projects.map(p=>({url:absoluteUrl(`/projects/${encodeURIComponent(p.id)}/`),...(typeof p.updatedAt==='string'&&Number.isFinite(Date.parse(p.updatedAt))?{lastModified:p.updatedAt}: {})}))];
}
