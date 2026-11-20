import {projectHref} from './project-links.js';

// The verified public origin is the fallback on Vercel production builds.
export function getSiteUrl(){
 const raw=process.env.NEXT_PUBLIC_SITE_URL||(process.env.VERCEL_ENV==='production'?'https://www.hauszy.com':null);
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
export const publicPaths=['/','/projects/','/guides/','/about/','/tools/loan-calculator/','/tools/upfront-cash-calculator/','/tools/loan-eligibility/','/tools/roi-calculator/','/privacy/','/terms/'];
export function homeStructuredData(name,description){
 const url=absoluteUrl('/');
 if(!url)return null;
 return {
  '@context':'https://schema.org','@graph':[
   {'@type':'WebSite','@id':url+'#website',name:'Hauszy',url,inLanguage:'en-MY'},
   {'@type':'WebPage','@id':url,name,url,description,inLanguage:'en-MY',isPartOf:{'@id':url+'#website'}},
  ],
 };
}

export function aboutStructuredData({name,agency,ren,portrait}){
 const url=absoluteUrl('/about/'),site=absoluteUrl('/');
 if(!url||!name)return null;
 return {
  '@context':'https://schema.org','@type':'ProfilePage','@id':url,url,inLanguage:'en-MY',
  isPartOf:{'@id':site+'#website'},
  mainEntity:{
   '@type':'Person','@id':url+'#profile',name,url,
   ...(portrait&&{image:absoluteUrl(portrait)}),
   ...(agency&&{worksFor:{'@type':'Organization',name:agency}}),
   ...(ren&&{identifier:{'@type':'PropertyValue',propertyID:'REN',value:ren}}),
  },
 };
}

export function toolStructuredData({title:name,description,alternates}){
 const url=alternates?.canonical;
 if(!url)return null;
 return {
  '@context':'https://schema.org','@type':'WebPage','@id':url,url,name,description,inLanguage:'en-MY',
  isPartOf:{'@id':absoluteUrl('/')+'#website'},
  breadcrumb:{
   '@type':'BreadcrumbList',itemListElement:[
    {'@type':'ListItem',position:1,name:'Home',item:absoluteUrl('/')},
    {'@type':'ListItem',position:2,name,item:url},
   ],
  },
 };
}

export function catalogueStructuredData(path,items,offset){
 const url=absoluteUrl(path);
 if(!url||!items.length)return null;
 return {
  '@context':'https://schema.org','@type':'CollectionPage',url,
  name:'Penang Property Listings',inLanguage:'en-MY',isPartOf:{'@id':absoluteUrl('/')+'#website'},
  mainEntity:{
   '@type':'ItemList',itemListElement:items.map((project,index)=>({
    '@type':'ListItem',position:offset+index+1,name:project.name,url:absoluteUrl(projectHref(project)),
   })),
  },
 };
}
export function projectStructuredData(project,description=`${project.name}${project.location?` in ${project.location}`:""}. Explore layouts, facilities and project details.`){
 const path=projectHref(project),url=absoluteUrl(path);if(!url)return null;
 return {'@context':'https://schema.org','@graph':[
 {'@type':'WebPage','@id':url,name:project.name,url,description,inLanguage:'en-MY',isPartOf:{'@id':absoluteUrl('/')+'#website'},mainEntity:{'@type':'Place',name:project.name,...(project.location?{address:project.location}:{}),...(Number.isFinite(project.latitude)&&Number.isFinite(project.longitude)&&Math.abs(project.latitude)<=90&&Math.abs(project.longitude)<=180?{geo:{'@type':'GeoCoordinates',latitude:project.latitude,longitude:project.longitude}}:{})}},
 {'@type':'BreadcrumbList',itemListElement:[['Home','/'],['Projects','/projects/'],[project.name,path]].map(([name,path],i)=>({'@type':'ListItem',position:i+1,name,item:absoluteUrl(path)}))}
 ]};
}
export const serializeJsonLd=data=>JSON.stringify(data).replace(/</g,'\\u003c');
