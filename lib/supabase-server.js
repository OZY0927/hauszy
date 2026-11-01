import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {supabaseOrigin} from './supabase-config';
import {RequestError} from './revalidation-security';
export function getSupabaseUploadServer(){
 const url=supabaseOrigin(),secret=process.env.SUPABASE_SECRET_KEY,bucket=process.env.SUPABASE_STORAGE_BUCKET||'website-images';
 if(!url||!secret||!(/^[a-z0-9][a-z0-9_-]{0,62}$/).test(bucket))throw new RequestError(503,'Image storage is not configured. Set the Supabase URL, secret key and bucket on your host.');
 const client=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(input,options)=>fetch(input,{...options,signal:AbortSignal.timeout(10000)})}});
 return {client,bucket};
}
