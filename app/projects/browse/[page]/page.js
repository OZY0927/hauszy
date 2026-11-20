import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getPublishedProjects} from '../../../../lib/firestore-server';
import {cardProject,listingName,PROJECT_BATCH_SIZE,sortProjects} from '../../../../lib/project';
import {pageMetadata} from '../../../../lib/seo';

const catalogue='/projects/';
const pageUrl=page=>page===1?catalogue:`${catalogue}browse/${page}/`;

export function generateStaticParams(){return []}

async function getCataloguePage(params){
 const {page:segment}=await params;
 const page=Number(segment);
 if(!/^[1-9]\d*$/.test(segment)||!Number.isSafeInteger(page)||page<2)notFound();
 const projects=(await getPublishedProjects()).map(cardProject);
 const lastPage=Math.ceil(projects.length/PROJECT_BATCH_SIZE);
 if(page>lastPage)notFound();
 const start=(page-1)*PROJECT_BATCH_SIZE;
 return {page,lastPage,projects:sortProjects(projects,'name-asc').slice(start,start+PROJECT_BATCH_SIZE)};
}

export async function generateMetadata({params}){
 const {page}=await getCataloguePage(params);
 return pageMetadata(`Penang Property Listings – Page ${page}`,`Browse page ${page} of Hauszy’s Penang property listings, sorted by project name.`,pageUrl(page));
}

export default async function CataloguePage({params}){
 const {page,lastPage,projects}=await getCataloguePage(params);
 return <main className="calculator-shell">
  <h1>Penang Property Listings</h1>
  <p>Page {page} of {lastPage} · Sorted by project name</p>
  <ul>
   {projects.map(project=><li key={project.id}>
    <Link href={`/projects/${encodeURIComponent(project.id)}/`} prefetch={false}>{listingName(project)}</Link>
    {project.location&&<> · {project.location}</>}
   </li>)}
  </ul>
  <nav className="catalogue-page-nav" aria-label="Project pages">
   <Link className="outline" href={pageUrl(page-1)} prefetch={false}>Previous page</Link>
   {page<lastPage&&<Link className="outline" href={pageUrl(page+1)} prefetch={false}>Next page</Link>}
  </nav>
 </main>
}
