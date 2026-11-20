import {pageMetadata} from '../../lib/seo';
import ProjectCatalogue from '../../components/ProjectCatalogue';
import {getPublishedProjects} from '../../lib/firestore-server';
import {cardProject} from '../../lib/project';
export const metadata=pageMetadata("Penang Property Listings & New Launches","Filter Penang Island and Seberang Perai property listings by area, budget and property type. Compare floor plans, tenure and listed prices.","/projects/");
export default async function Projects(){
 let projects=[],error=false;
 try{projects=(await getPublishedProjects()).map(cardProject)}catch{error=true}
 return <ProjectCatalogue projects={projects} error={error}/>;
}
