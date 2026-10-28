import ProjectBrowser from '../../components/ProjectBrowser';
import {getPublishedProjects} from '../../lib/firestore-server';
export const dynamic='force-dynamic';
export const metadata={title:'All projects'};
export default async function Projects(){let projects=[],error=false;try{projects=await getPublishedProjects()}catch{error=true}return <main><section className="all-projects-heading"><div className="eyebrow">THE PROJECT COLLECTION</div><h1>Find your next <em>chapter.</em></h1><p>Explore new homes and developer projects, all in one place.</p></section><ProjectBrowser projects={projects} error={error}/></main>}
