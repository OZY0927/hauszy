import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {assertStorageSecretKey} from './supabase-errors';
import {supabaseOrigin,DEFAULT_IMAGE_BUCKET} from './supabase-config';
import {RequestError} from './revalidation-security';
export function getSupabaseUploadServer(){
 const url=supabaseOrigin(),secret=process.env.SUPABASE_SECRET_KEY?.trim(),bucket=process.env.SUPABASE_STORAGE_BUCKET?.trim()||DEFAULT_IMAGE_BUCKET;
 if(!url||!secret||!(/^[a-z0-9][a-z0-9_-]{0,62}$/).test(bucket))throw new RequestError(503,'Image storage is not configured. Set the Supabase URL, secret key and bucket on your host.');
 try{assertStorageSecretKey(secret)}catch(error){throw new RequestError(503,error.message);}
 const client=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(input,options)=>fetch(input,{...options,signal:AbortSignal.timeout(10000)})}});
 return {client,bucket};
}
