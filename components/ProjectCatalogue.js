import {GradientBackground} from './ui/oceanic-shimmer';
import ProjectBrowser from './ProjectBrowser';
import BackToTop from './BackToTop';
import JsonLd from './JsonLd';
import {catalogueStructuredData} from '../lib/seo';
import {
 DEFAULT_PROJECT_ORDER,listingName,PROJECT_BATCH_SIZE,projectPageItems,projectPagePath,sortProjects,
} from '../lib/project';

const LISTING_GRADIENT={base:'#F5EBDE',stops:['252, 248, 242','245, 235, 222','239, 223, 202','231, 207, 178']};

export default function ProjectCatalogue({projects,page=1,error=false}){
 const batch=projectPageItems(sortProjects(projects,DEFAULT_PROJECT_ORDER),page)
  .map(project=>({id:project.id,publicSlug:project.publicSlug,name:listingName(project)}));

 return <main className="projects-page">
  <JsonLd data={catalogueStructuredData(projectPagePath(page),batch,(page-1)*PROJECT_BATCH_SIZE)}/>
  <div className="listing-background" aria-hidden="true"><div className="listing-background-viewport">
   <GradientBackground colors={LISTING_GRADIENT}/>
  </div></div>
  <section className="all-projects-heading">
   <h1 id="project-listing-title" tabIndex={-1}><span className="listing-title-lead">YOUR NEXT MOVE</span><span className="listing-title-place">IN PENANG</span></h1>
  </section>
  <ProjectBrowser key={page} projects={projects} error={error} initialPage={page}/>
  <BackToTop/>
 </main>
}
