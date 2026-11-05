export const DEFAULT_IMAGE_BUCKET='hauszy-project';
export function supabaseOrigin(value=process.env.NEXT_PUBLIC_SUPABASE_URL){
 if(!value)return null;
 try{const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw Error();return url.origin}catch{throw Error('NEXT_PUBLIC_SUPABASE_URL must be your HTTPS Supabase project origin.');}
}
