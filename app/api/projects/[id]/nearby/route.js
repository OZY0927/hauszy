import {getPublishedProject} from '../../../../../lib/firestore-server';
import {coordinates} from '../../../../../lib/nearby-places';
import {createNearbyLoader} from '../../../../../lib/nearby-service';
import {projectSections} from '../../../../../lib/project-visibility';

const loadNearby=createNearbyLoader();
export async function GET(request,{params}){
 try{
  const {id}=await params;
  if(!id||id.length>150)return Response.json({error:'Project unavailable.'},{status:404});
  const project=await getPublishedProject(id);
  if(!project||!projectSections(project).location)return Response.json({error:'Project unavailable.'},{status:404});
  const point=coordinates(project.latitude,project.longitude);
  if(!point)return Response.json({error:'This project needs a saved map location before nearby places can be found.'},{status:422});
  const categories=await loadNearby(...point);
  return Response.json({categories,radius:3000},{headers:{'Cache-Control':'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'}});
 }catch{return Response.json({error:'Nearby places are temporarily unavailable. Please try again in a minute.'},{status:503,headers:{'Cache-Control':'no-store','Retry-After':'60'}})}
}
