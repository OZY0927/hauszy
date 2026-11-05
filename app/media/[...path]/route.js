import {supabaseOrigin,DEFAULT_IMAGE_BUCKET} from '../../../lib/supabase-config';
import {mediaSource} from '../../../lib/media';
const TYPES=['image/jpeg','image/png','image/webp'];
// Serves uploaded images from this site's domain so pages never link to the storage project directly.
// Uploads get a fresh random name, so a file never changes and can be cached for a year.
export async function GET(request,{params}){
 const {path}=await params,source=mediaSource(path,supabaseOrigin(),process.env.SUPABASE_STORAGE_BUCKET?.trim()||DEFAULT_IMAGE_BUCKET);
 const missing=()=>new Response('Not found',{status:404,headers:{'Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'}});
 if(!source)return missing();
 let upstream;try{upstream=await fetch(source,{signal:AbortSignal.timeout(15000)})}catch{return new Response('Image temporarily unavailable',{status:502,headers:{'Cache-Control':'no-store'}})}
 const type=upstream.headers.get('content-type')?.split(';')[0].trim();
 if(!upstream.ok||!TYPES.includes(type)){upstream.body?.cancel();return upstream.status===404||upstream.status===400?missing():new Response('Image temporarily unavailable',{status:502,headers:{'Cache-Control':'no-store'}})}
 return new Response(upstream.body,{headers:{'Content-Type':type,...(upstream.headers.get('content-length')?{'Content-Length':upstream.headers.get('content-length')}:{}),'Cache-Control':'public, max-age=31536000, immutable','Content-Disposition':'inline','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin'}});
}
