import JsonLd from '../components/JsonLd';
import PenangHome from '../components/PenangHome';
import {getPublishedProjects} from '../lib/firestore-server';
import {getFeaturedProjectPool} from '../lib/featured-projects-server';
import {cardProject} from '../lib/project';
import {pageMetadata,absoluteUrl} from '../lib/seo';
export const metadata=pageMetadata('Discover Penang. Find Your Place.','Get to know Penang, from heritage streets and coastal neighbourhoods to green hills and the mainland. Discover the place behind your next move with Hauszy.','/');
export default async function Home(){let featured={projects:[],priorityIds:[],popular:false};try{const projects=(await getPublishedProjects()).map(cardProject);featured=await getFeaturedProjectPool(projects)}catch{}return <><JsonLd data={absoluteUrl('/')?{'@context':'https://schema.org','@type':'WebSite',name:'Hauszy',url:absoluteUrl('/'),inLanguage:'en-MY'}:null}/><PenangHome featuredProjects={featured.projects} popularProjects={featured.popular}/></>}
