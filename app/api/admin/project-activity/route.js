import {getSupabaseUploadServer} from '../../../../lib/supabase-server';
import {verifyAdminIdToken} from '../../../../lib/verify-admin';
import {readSmallJson,revalidationToken,RequestError} from '../../../../lib/revalidation-security';
import {activitySince,summarizeActivity} from '../../../../lib/project-activity';
const headers={'Cache-Control':'no-store'};
export async function GET(request){
 try{
  await verifyAdminIdToken(revalidationToken(request));
  const days=Number(new URL(request.url).searchParams.get('days')||30);if(![7,30,90].includes(days))throw new RequestError(400,'Choose 7, 30 or 90 days.');
  const {client}=getSupabaseUploadServer(),rows=[],since=activitySince(days);
  for(let start=0;start<100000;start+=1000){
   const {data,error}=await client.from('project_activity_daily').select('day,project_id,event,count').gte('day',since).order('day').order('project_id').order('event').range(start,start+999);
   if(error)throw new RequestError(503,'Analytics storage is not ready. Run supabase/project-activity.sql in your Supabase SQL Editor.');
   rows.push(...data);if(data.length<1000)return Response.json({...summarizeActivity(rows),since,days},{headers});
  }
  throw new RequestError(503,'Too much activity for this period. Choose a shorter range.');
 }catch(error){return Response.json({error:error instanceof RequestError?error.message:'Could not load analytics.'},{status:error instanceof RequestError?error.status:500,headers})}
}

export async function POST(request){
 try{
  await verifyAdminIdToken(revalidationToken(request));
  const body=await readSmallJson(request);
  if(!body||body.action!=='reset'||Object.keys(body).length!==1)throw new RequestError(400,'Choose the reset action.');
  const {client}=getSupabaseUploadServer();
  // Reset in one statement, using the existing service-role update permission.
  const {error}=await client.from('project_activity_daily').update({count:0}).gte('count',0);
  if(error)throw new RequestError(503,'Could not reset analytics. Check that analytics storage is configured.');
  return Response.json({ok:true},{headers});
 }catch(error){return Response.json({error:error instanceof RequestError?error.message:'Could not reset analytics.'},{status:error instanceof RequestError?error.status:500,headers})}
}
