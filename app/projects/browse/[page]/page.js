import {notFound} from 'next/navigation';
import ProjectCatalogue from '../../../../components/ProjectCatalogue';
import {getPublishedProjects} from '../../../../lib/firestore-server';
import {cardProject,projectPageCount,projectPagePath} from '../../../../lib/project';
import {pageMetadata} from '../../../../lib/seo';

export function generateStaticParams(){return []}

async function getCataloguePage(params){
 const {page:segment}=await params;
 const page=Number(segment);
 if(!/^[1-9]\d*$/.test(segment)||!Number.isSafeInteger(page)||page<2)notFound();
 const projects=await getPublishedProjects();
 if(page>projectPageCount(projects.length))notFound();
 return {page,projects};
}

export async function generateMetadata({params}){
 const {page}=await getCataloguePage(params);
 return pageMetadata(`Penang Property Listings – Page ${page}`,`Browse page ${page} of Hauszy’s Penang property listings. Compare locations, layouts, tenure and advertised prices.`,projectPagePath(page));
}

export default async function CataloguePage({params}){
 const {page,projects}=await getCataloguePage(params);
 return <ProjectCatalogue projects={projects.map(cardProject)} page={page}/>;
}
