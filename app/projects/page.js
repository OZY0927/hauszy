import {pageMetadata} from '../../lib/seo';
import ProjectCatalogue from '../../components/ProjectCatalogue';
import {getPublishedProjects} from '../../lib/firestore-server';
import {cardProject} from '../../lib/project';
export const metadata=pageMetadata("Penang Property Listings & New Launches","Browse property projects across Penang Island and Seberang Perai. Compare locations, layouts, prices, facilities, tenure and completion details.","/projects/");
export default async function Projects(){
 let projects=[],error=false;
 try{projects=(await getPublishedProjects()).map(cardProject)}catch{error=true}
 return <ProjectCatalogue projects={projects} error={error}/>;
}
