import {getPublishedGuides,getPublishedProjects} from '../lib/firestore-server';
import {absoluteUrl,publicPaths} from '../lib/seo';
import {guidePath} from '../lib/guides';
import {projectHref} from '../lib/project-links';
export const revalidate=86400;
export default async function sitemap(){
 if(!absoluteUrl('/'))return [];
 // Let a transient database error fail and retry rather than caching an incomplete project sitemap.
 const [projects,guides]=await Promise.all([getPublishedProjects(),getPublishedGuides()]);
 return [
  ...publicPaths.map(path=>({url:absoluteUrl(path)})),
  ...projects.map(p=>({url:absoluteUrl(projectHref(p)),...(typeof p.updatedAt==='string'&&Number.isFinite(Date.parse(p.updatedAt))?{lastModified:p.updatedAt}: {})})),
  ...guides.map(guide=>({url:absoluteUrl(guidePath(guide.slug)),lastModified:guide.updatedAt})),
 ];
}
