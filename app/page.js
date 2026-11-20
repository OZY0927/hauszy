import JsonLd from '../components/JsonLd';
import PenangHome from '../components/PenangHome';
import {getPublishedProjects} from '../lib/firestore-server';
import {getFeaturedProjectPool} from '../lib/featured-projects-server';
import {cardProject} from '../lib/project';
import {homeStructuredData,pageMetadata} from '../lib/seo';

const homeTitle='Hauszy | Penang Property Search & Buyer Tools';
const description='Explore properties across Penang Island and Seberang Perai. Compare project layouts and listed prices, estimate purchase costs and ask about viewings.';
export const metadata={
 ...pageMetadata(homeTitle,description,'/',['/penang/skyline.jpg']),
 title:{absolute:homeTitle},
};

export default async function Home(){
 let featured={projects:[],popular:false};
 try{
  const projects=(await getPublishedProjects()).map(cardProject);
  featured=await getFeaturedProjectPool(projects);
 }catch{}
 return <>
  <JsonLd data={homeStructuredData(homeTitle,description)}/>
  <PenangHome featuredProjects={featured.projects} popularProjects={featured.popular}/>
 </>;
}
