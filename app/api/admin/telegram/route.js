import {getSupabaseUploadServer} from '../../../../lib/supabase-server';
import {verifyAdminIdToken} from '../../../../lib/verify-admin';
import {readSmallJson,revalidationToken,RequestError} from '../../../../lib/revalidation-security';
const headers={'Cache-Control':'no-store'};
async function handle(request,save=false){
 try{
  await verifyAdminIdToken(revalidationToken(request));
  const {client}=getSupabaseUploadServer();
  const {data,error}=await client.from('telegram_settings').select('*').eq('id',1).maybeSingle();
  if(error)throw new RequestError(503,'Run supabase/telegram-settings.sql in the Supabase SQL Editor first.');
  if(!save)return Response.json({configured:!!data?.bot_token,chatId:data?.chat_id||'',enabled:!!data?.enabled},{headers});
  const body=await readSmallJson(request);
  const token=typeof body.token==='string'&&body.token.trim()?body.token.trim():data?.bot_token||'';
  const chatId=typeof body.chatId==='string'?body.chatId.trim():'';
  if(!/^\d{5,20}:[A-Za-z0-9_-]{20,100}$/.test(token)||! /^-?\d{1,20}$/.test(chatId)||typeof body.enabled!=='boolean')throw new RequestError(400,'Enter a valid bot token and numeric chat ID.');
  const result=await client.from('telegram_settings').upsert({id:1,bot_token:token,chat_id:chatId,enabled:body.enabled});
  if(result.error)throw new RequestError(503,'Could not save Telegram settings.');
  return Response.json({ok:true},{headers});
 }catch(error){return Response.json({error:error instanceof RequestError?error.message:'Telegram settings unavailable.'},{status:error instanceof RequestError?error.status:500,headers})}
}
export const GET=request=>handle(request);
export const POST=request=>handle(request,true);
