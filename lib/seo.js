// Set the verified primary origin in production; never derive canonical URLs from request headers.
export function getSiteUrl(){
 const raw=process.env.NEXT_PUBLIC_SITE_URL;
 if(!raw)return null;
 const url=new URL(raw);
 if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw Error('NEXT_PUBLIC_SITE_URL must be a website origin, for example https://your-domain.com');
 return url.origin;
}
export function absoluteUrl(path='/'){const origin=getSiteUrl();return origin?new URL(path,origin).href:undefined}
export function pageMetadata(title,description,path,images=[]){
 const url=absoluteUrl(path);
 return {title,description,...(url?{alternates:{canonical:url}}:{}),openGraph:{title,description,type:'website',locale:'en_MY',siteName:'Hauszy',...(url?{url}:{}),...(images.length?{images}: {})},twitter:{card:images.length?'summary_large_image':'summary',title,description,...(images.length?{images}: {})}};
}
export const publicPaths=['/','/projects/','/about/','/tools/loan-calculator/','/tools/upfront-cash-calculator/','/tools/loan-eligibility/','/tools/roi-calculator/','/privacy/','/terms/'];
export function projectStructuredData(project){
 const url=absoluteUrl(`/projects/${encodeURIComponent(project.id)}/`);if(!url)return null;
 return {'@context':'https://schema.org','@graph':[
 {'@type':'WebPage','@id':url,name:project.name,url,description:`${project.name} in ${project.location}. Explore layouts, facilities and project details.`,inLanguage:'en-MY',mainEntity:{'@type':'Place',name:project.name,...(project.location?{address:project.location}:{}),...(Number.isFinite(project.latitude)&&Number.isFinite(project.longitude)&&Math.abs(project.latitude)<=90&&Math.abs(project.longitude)<=180?{geo:{'@type':'GeoCoordinates',latitude:project.latitude,longitude:project.longitude}}:{})}},
 {'@type':'BreadcrumbList',itemListElement:[['Home','/'],['Projects','/projects/'],[project.name,`/projects/${encodeURIComponent(project.id)}/`]].map(([name,path],i)=>({'@type':'ListItem',position:i+1,name,item:absoluteUrl(path)}))}
 ]};
}
export const serializeJsonLd=data=>JSON.stringify(data).replace(/</g,'\\u003c');
