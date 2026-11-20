import Link from 'next/link';
import {notFound} from 'next/navigation';
import GuideArticle from '../../../components/GuideArticle';
import JsonLd from '../../../components/JsonLd';
import Icon from '../../../components/Icon';
import {getPublishedGuide,getPublishedProject} from '../../../lib/firestore-server';
import {guideCoverAllowed,guidePath,validGuideSlug} from '../../../lib/guides';
import {absoluteUrl,pageMetadata} from '../../../lib/seo';

export function generateStaticParams(){return []}

export async function generateMetadata({params}){
 const {slug}=await params;
 const guide=validGuideSlug(slug)?await getPublishedGuide(slug):null;
 if(!guide)return {title:'Guide unavailable',robots:{index:false,follow:false}};
 const image=guideCoverAllowed(guide.coverUrl)?[guide.coverUrl]:[];
 const meta=pageMetadata(guide.seoTitle||guide.title,guide.seoDescription||guide.summary,guidePath(slug),image);
 return {...meta,openGraph:{...meta.openGraph,type:'article',publishedTime:guide.publishedAt,modifiedTime:guide.updatedAt}};
}

export default async function GuidePage({params}){
 const {slug}=await params;
 if(!validGuideSlug(slug))notFound();
 const guide=await getPublishedGuide(slug);
 if(!guide)notFound();
 const project=guide.projectId?await getPublishedProject(guide.projectId).catch(()=>null):null;
 const url=absoluteUrl(guidePath(slug)),home=absoluteUrl('/');
 const data=url&&{
  '@context':'https://schema.org','@type':'Article','@id':url+'#article',
  mainEntityOfPage:url,headline:guide.title,description:guide.summary,inLanguage:'en-MY',
  datePublished:guide.publishedAt,dateModified:guide.updatedAt,
  author:guide.author==='Hauszy'?{'@type':'Organization',name:'Hauszy',url:home}:{'@type':'Person',name:guide.author},
  publisher:{'@type':'Organization',name:'Hauszy',url:home},
  ...(guideCoverAllowed(guide.coverUrl)&&{image:[absoluteUrl(guide.coverUrl)]}),
 };
 return <main className="guides-shell guide-reading">
  <JsonLd data={data}/>
  <Link href="/guides/" className="guide-back"><Icon name="arrowLeft"/>Penang property guides</Link>
  <GuideArticle guide={guide} project={project?{id:project.id,name:project.name}:null}/>
 </main>;
}
