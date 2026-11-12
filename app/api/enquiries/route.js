import {getSupabaseUploadServer} from '../../../lib/supabase-server';
import {getPublishedProject} from '../../../lib/firestore-server';
import {readSmallJson,RequestError,createRevalidationLimiter} from '../../../lib/revalidation-security';
import {enquiryPayload,telegramMessage,sendTelegram} from '../../../lib/telegram';
const limit=createRevalidationLimiter(3),headers={'Cache-Control':'no-store'};
export async function POST(request){
 try{
  if(request.headers.get('origin')!==new URL(request.url).origin)throw new RequestError(403,'Same-origin requests only.');
  if(!limit(request.headers.get('cf-connecting-ip')||request.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown'))throw new RequestError(429,'Please wait a minute before trying again.');
  const body=enquiryPayload(await readSmallJson(request));
  const project=await getPublishedProject(body.projectId);if(!project)throw new RequestError(404,'This project is unavailable.');
  const {client}=getSupabaseUploadServer();
  const {data,error}=await client.from('telegram_settings').select('bot_token,chat_id,enabled').eq('id',1).maybeSingle();
  if(error||!data?.enabled||!data.bot_token||!data.chat_id)throw new RequestError(503,'Enquiries are temporarily unavailable. Please contact us on WhatsApp.');
  await sendTelegram(data,telegramMessage(body,project));
  return Response.json({ok:true},{headers});
 }catch(error){return Response.json({error:error instanceof RequestError?error.message:'Could not send your request. Please try again.'},{status:error instanceof RequestError?error.status:500,headers})}
}
