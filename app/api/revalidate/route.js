import {revalidateTag} from 'next/cache';
import {CACHE_TAGS} from '../../../lib/firestore-server';
import {verifyAdminIdToken} from '../../../lib/verify-admin';
import {revalidationToken,revalidationTags,createRevalidationLimiter,RequestError} from '../../../lib/revalidation-security';
const limit=createRevalidationLimiter();
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export async function POST(request){
 try{
  const token=revalidationToken(request),tags=await revalidationTags(request,CACHE_TAGS);
  const uid=await verifyAdminIdToken(token);
  if(!limit(uid))return Response.json({ok:false,error:'Too many refreshes. Try again in a minute.'},{status:429,headers:{...headers,'Retry-After':'60'}});
  for(const tag of tags)revalidateTag(tag,{expire:0});
  return Response.json({ok:true,revalidated:tags},{headers});
 }catch(error){const status=error instanceof RequestError?error.status:500;return Response.json({ok:false,error:status===500?'Unable to refresh pages.':error.message},{status,headers});}
}
