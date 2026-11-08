import {getSupabaseUploadServer} from '../../../lib/supabase-server';
import {getPublishedProject} from '../../../lib/firestore-server';
import {readSmallJson,RequestError,createRevalidationLimiter} from '../../../lib/revalidation-security';
import {validActivity} from '../../../lib/project-activity';
const limit=createRevalidationLimiter(60),headers={'Cache-Control':'no-store'};
export async function POST(request){
 try{
  if(request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')throw new RequestError(403,'Same-origin requests only.');
  const body=await readSmallJson(request);if(!validActivity(body))throw new RequestError(400,'Invalid activity.');
  // Best-effort instance throttle; no IP address is persisted to the analytics database.
  if(!limit(request.headers.get('cf-connecting-ip')||'unknown'))throw new RequestError(429,'Try again later.');
  if(!await getPublishedProject(body.projectId))throw new RequestError(404,'Project unavailable.');
  const {client}=getSupabaseUploadServer();const {error}=await client.rpc('record_project_activity',{p_project_id:body.projectId,p_event:body.event});
  if(error)throw new RequestError(503,'Activity storage unavailable.');
  return new Response(null,{status:204,headers});
 }catch(error){return Response.json({error:error instanceof RequestError?error.message:'Activity unavailable.'},{status:error instanceof RequestError?error.status:500,headers})}
}
