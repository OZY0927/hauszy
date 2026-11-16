import {pageMetadata} from '../../lib/seo';
import ListingMeshBackground from '../../components/ListingMeshBackground';
import ProjectBrowser from '../../components/ProjectBrowser';
import BackToTop from '../../components/BackToTop';
import {getPublishedProjects} from '../../lib/firestore-server';
import {cardProject} from '../../lib/project';
export const metadata=pageMetadata("Penang Property Listings & New Launches","Browse property projects across Penang Island and Seberang Perai. Compare locations, layouts, prices, facilities, tenure and completion details.","/projects/");
export default async function Projects(){let projects=[],error=false;try{projects=(await getPublishedProjects()).map(cardProject)}catch{error=true}return <main className="projects-page"><ListingMeshBackground/><section className="all-projects-heading"><h1 id="project-listing-title" tabIndex={-1}><span className="listing-title-lead">YOUR NEXT MOVE</span><span className="listing-title-place">IN PENANG</span></h1></section><ProjectBrowser projects={projects} error={error}/><BackToTop/></main>}
