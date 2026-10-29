import {revalidateTag} from 'next/cache';
import {firebaseConfig} from '../../../lib/firebase-config';
import {CACHE_TAGS} from '../../../lib/firestore-server';
// Called by the admin after a save so the public pages show the change on the next visit.
// Only signed-in email/password admins (the same users Firestore rules allow to write) can trigger it.
export async function POST(request){
  const token=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
  if(!token)return Response.json({ok:false},{status:401});
  const check=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:token}),cache:'no-store',signal:AbortSignal.timeout(8000)}).catch(()=>null);
  const user=check?.ok?(await check.json()).users?.[0]:null;
  if(!user||user.disabled||!user.providerUserInfo?.some(p=>p.providerId==='password'))return Response.json({ok:false},{status:401});
  let body={};try{body=await request.json()}catch{}
  const tags=(Array.isArray(body.tags)?body.tags:CACHE_TAGS).filter(tag=>CACHE_TAGS.includes(tag));
  for(const tag of tags)revalidateTag(tag,{expire:0});
  return Response.json({ok:true,revalidated:tags});
}
