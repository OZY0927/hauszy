import {pageMetadata} from '../../lib/seo';
import {getProfile} from '../../lib/firestore-server';
import {safeUrl} from '../../lib/project';
import {whatsappNumber} from '../../lib/whatsapp';
import AboutJourney from '../../components/AboutJourney';
export const metadata=pageMetadata('Your Penang Property Contact','Get personal guidance for your Penang property search. Meet your Hauszy contact, view profile and agency details, and arrange an enquiry or viewing.','/about/');
export default async function About(){
 let data={},failed=false;try{data=await getProfile()||{}}catch{failed=true}
 const profile={name:data.name||'Your property partner',heading:data.heading||'Your Penang search. A little guidance helps.',bio:data.bio||'Explore property options across Penang Island and the mainland, with a personal approach to understanding your budget, preferred location and plans. Ask about project details, compare your options and arrange a viewing when you’re ready.',portrait:safeUrl(data.portrait)?data.portrait:null,ren:data.ren||'',agency:data.agency||'',whatsapp:whatsappNumber(data)};
 const photos=(data.gallery||[]).filter(p=>safeUrl(p.url));
 return <AboutJourney profile={profile} photos={photos} failed={failed}/>;
}
