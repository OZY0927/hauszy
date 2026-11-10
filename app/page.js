import JsonLd from '../components/JsonLd';
import PenangHome from '../components/PenangHome';
import {getPublishedProjects} from '../lib/firestore-server';
import {getFeaturedProjectPool} from '../lib/featured-projects-server';
import {cardProject} from '../lib/project';
import {pageMetadata,absoluteUrl} from '../lib/seo';
const homeTitle='Your Next Chapter Starts in Penang | Hauszy';
export const metadata={...pageMetadata(homeTitle,'A first home, room for a growing family, or a space for your next idea. Explore properties across Penang and find a place that feels right for you.','/'),title:{absolute:homeTitle}};
export default async function Home(){let featured={projects:[],priorityIds:[],popular:false};try{const projects=(await getPublishedProjects()).map(cardProject);featured=await getFeaturedProjectPool(projects)}catch{}return <><JsonLd data={absoluteUrl('/')?{'@context':'https://schema.org','@type':'WebSite',name:'Hauszy',url:absoluteUrl('/'),inLanguage:'en-MY'}:null}/><PenangHome featuredProjects={featured.projects} popularProjects={featured.popular}/></>}
