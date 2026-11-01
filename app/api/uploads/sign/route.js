import {verifyAdminIdToken} from '../../../../lib/verify-admin';
import {revalidationToken,readSmallJson,RequestError,createRevalidationLimiter} from '../../../../lib/revalidation-security';
import {getSupabaseUploadServer} from '../../../../lib/supabase-server';
import {authorizeImageUpload,validateUploadRequest} from '../../../../lib/storage-upload';
const limit=createRevalidationLimiter(60),headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export async function POST(request){
 try{
  const token=revalidationToken(request),body=validateUploadRequest(await readSmallJson(request));
  const uid=await verifyAdminIdToken(token);
  // A gallery may contain twelve images; signing consumes this separate per-instance quota.
  if(!limit(uid))return Response.json({error:'Too many uploads. Wait a minute and try again.'},{status:429,headers:{...headers,'Retry-After':'60'}});
  const result=await authorizeImageUpload(body,getSupabaseUploadServer());
  return Response.json(result,{headers});
 }catch(error){const status=error instanceof RequestError?error.status:500;return Response.json({error:status===500?'Image upload authorization failed. Please check the storage configuration.':error.message},{status,headers});}
}
