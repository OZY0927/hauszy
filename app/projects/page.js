import {pageMetadata} from '../../lib/seo';
import {GradientBackground} from '../../components/ui/oceanic-shimmer';
import ProjectBrowser from '../../components/ProjectBrowser';
import BackToTop from '../../components/BackToTop';
import {getPublishedProjects} from '../../lib/firestore-server';
import {cardProject} from '../../lib/project';
// Five-colour palette tints, top to bottom: cream, then cream mixed with 20%, 40% and 65% sand.
const LISTING_GRADIENT={base:'#F5EBDE',stops:['252, 248, 242','245, 235, 222','239, 223, 202','231, 207, 178']};
export const metadata=pageMetadata("Penang Property Listings & New Launches","Browse property projects across Penang Island and Seberang Perai. Compare locations, layouts, prices, facilities, tenure and completion details.","/projects/");
export default async function Projects(){let projects=[],error=false;try{projects=(await getPublishedProjects()).map(cardProject)}catch{error=true}return <main className="projects-page"><div className="listing-background" aria-hidden="true"><div className="listing-background-viewport"><GradientBackground colors={LISTING_GRADIENT}/></div></div><section className="all-projects-heading"><h1 id="project-listing-title" tabIndex={-1}><span className="listing-title-lead">YOUR NEXT MOVE</span><span className="listing-title-place">IN PENANG</span></h1></section><ProjectBrowser projects={projects} error={error}/><BackToTop/></main>}
