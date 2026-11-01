import {pageMetadata} from '../../lib/seo';
import ProjectBrowser from '../../components/ProjectBrowser';
import {getPublishedProjects} from '../../lib/firestore-server';
import {cardProject} from '../../lib/project';
export const metadata=pageMetadata("New Launch Property Projects in Malaysia","Browse Malaysian property projects. Compare locations, layout prices, facilities, tenure and completion details.","/projects/");
export default async function Projects(){let projects=[],error=false;try{projects=(await getPublishedProjects()).map(cardProject)}catch{error=true}return <main><section className="all-projects-heading"><div className="eyebrow">THE PROJECT COLLECTION</div><h1>Find your next <em>chapter.</em></h1><p>Explore new homes and developer projects, all in one place.</p></section><ProjectBrowser projects={projects} error={error}/></main>}
