export class RequestError extends Error{constructor(status,message){super(message);this.status=status}}
export function revalidationToken(request){
 if(request.headers.get('sec-fetch-site')==='cross-site')throw new RequestError(403,'Cross-site requests are not allowed.');
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)throw new RequestError(403,'Cross-site requests are not allowed.');
 const header=request.headers.get('authorization')||'';
 if(header.length>8192||!/^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(header))throw new RequestError(401,'Authentication required.');
 return header.slice(7);
}
export async function revalidationTags(request,allowed){
 if(request.headers.get('content-type')?.split(';')[0].trim()!=='application/json')throw new RequestError(415,'Use application/json.');
 if(Number(request.headers.get('content-length'))>4096)throw new RequestError(413,'Request is too large.');
 const reader=request.body?.getReader();if(!reader)throw new RequestError(400,'Request body required.');
 const chunks=[];let length=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>4096){await reader.cancel();throw new RequestError(413,'Request is too large.');}chunks.push(value)}}finally{reader.releaseLock()}
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 let body;try{body=JSON.parse(new TextDecoder().decode(bytes))}catch{throw new RequestError(400,'Invalid JSON.');}
 if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(key=>key!=='tags')||!Array.isArray(body.tags)||!body.tags.length||body.tags.length>allowed.length||body.tags.some(tag=>!allowed.includes(tag)))throw new RequestError(400,'Choose valid cache tags.');
 return [...new Set(body.tags)];
}
// Best-effort per-instance throttle. Deploy a shared WAF/rate limit for global abuse protection.
export function createRevalidationLimiter(){const attempts=new Map();return (uid,now=Date.now())=>{
 for(const [key,entry] of attempts)if(entry.until<=now)attempts.delete(key);
 const entry=attempts.get(uid)||{count:0,until:now+60000};
 if(entry.count>=10)return false;
 if(!attempts.has(uid)&&attempts.size>=1000)return false;
 entry.count++;attempts.set(uid,entry);return true;
}}
