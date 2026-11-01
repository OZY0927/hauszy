'use client';
import {storageFailureMessage} from './supabase-errors.js';
import {createClient} from '@supabase/supabase-js';
import {supabaseOrigin} from './supabase-config.js';
let client;
function getSupabaseClient(){const url=supabaseOrigin(),key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)throw Error('Image storage is not configured. Set the public Supabase URL and publishable key, then rebuild the website.');return client||(client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}));}
export async function uploadSupabasePhoto(image,folder,user,{client=getSupabaseClient(),request=fetch}={}){
 const supabase=client;
 const response=await request('/api/uploads/sign/',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${await user.getIdToken()}`},body:JSON.stringify({folder,contentType:image.type,size:image.size}),signal:AbortSignal.timeout(20000)});
 const result=await response.json().catch(()=>({}));
 if(!response.ok)throw Error(result.error||'Could not authorize the image upload.');
 const {error}=await supabase.storage.from(result.bucket).uploadToSignedUrl(result.path,result.token,image,{contentType:image.type,cacheControl:'31536000'});
 if(error)throw Error(storageFailureMessage(error,result.bucket,'upload'));
 return result.publicUrl;
}
