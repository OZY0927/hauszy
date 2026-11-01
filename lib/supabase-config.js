export const DEFAULT_IMAGE_BUCKET='hauszy-project';
export function supabaseOrigin(value=process.env.NEXT_PUBLIC_SUPABASE_URL){
 if(!value)return null;
 try{const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw Error();return url.origin}catch{throw Error('NEXT_PUBLIC_SUPABASE_URL must be your HTTPS Supabase project origin.');}
}
export function supabaseImagePattern(){const origin=supabaseOrigin();return origin?{protocol:'https',hostname:new URL(origin).hostname,port:new URL(origin).port,pathname:'/storage/v1/object/public/**'}:null}
export function isOptimizedProjectImage(src){
 if(typeof src!=='string')return false;
 const firebase='https://firebasestorage.googleapis.com/v0/b/hauszy.firebasestorage.app/o/';
 const origin=supabaseOrigin();return src.startsWith(firebase)||!!(origin&&src.startsWith(`${origin}/storage/v1/object/public/`));
}
