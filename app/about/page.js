import {aboutStructuredData,pageMetadata} from '../../lib/seo';
import {getProfile} from '../../lib/firestore-server';
import {safeUrl} from '../../lib/project';
import {whatsappNumber} from '../../lib/whatsapp';
import AboutJourney from '../../components/AboutJourney';
import JsonLd from '../../components/JsonLd';

const publicText=value=>typeof value==='string'?value.trim():'';
export async function generateMetadata(){
 const data=await getProfile().catch(()=>null);
 const name=publicText(data?.name);
 const title=name?`${name} | Penang Property Contact`:'Penang Property Contact';
 const description=name
  ? `Meet ${name}, your Hauszy contact for Penang Island and Seberang Perai. Ask about project prices, available units and how to arrange a viewing.`
  : 'Meet your Hauszy property contact for Penang Island and Seberang Perai. Get help comparing listings, confirming prices and arranging viewings.';
 return pageMetadata(title,description,'/about/',safeUrl(data?.portrait)?[data.portrait]:[]);
}
export default async function About(){
 let data={},failed=false;try{data=await getProfile()||{}}catch{failed=true}
 const name=publicText(data.name);
 const profile={
  name:name||'Your property contact',
  heading:publicText(data.heading)||'Find a Penang property that fits',
  bio:publicText(data.bio)||'Start with your budget, preferred neighbourhood and the space you need. Browse projects across Penang Island and Seberang Perai, then ask Hauszy to confirm the latest price, unit availability and viewing options for your shortlist.',
  portrait:safeUrl(data.portrait)?data.portrait:null,
  ren:Number.isFinite(data.ren)?String(data.ren):publicText(data.ren),
  agency:publicText(data.agency),
  whatsapp:whatsappNumber(data),
 };
 const photos=Array.isArray(data.gallery)?data.gallery.filter(p=>safeUrl(p?.url)):[];
 return <>
  <JsonLd data={aboutStructuredData({...profile,name})}/>
  <AboutJourney profile={profile} photos={photos} failed={failed}/>
 </>;
}
