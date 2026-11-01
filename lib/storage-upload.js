import {storageFailureMessage} from './supabase-errors.js';
import {RequestError} from './revalidation-security.js';
export const IMAGE_TYPES={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
export const MAX_IMAGE_BYTES=5*1024*1024;
export function validateUploadRequest(body){
 if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(key=>!['folder','contentType','size'].includes(key)))throw new RequestError(400,'Invalid image upload request.');
 if(typeof body.folder!=='string'||!(/^(profile|projects\/[A-Za-z0-9_-]{1,128})$/).test(body.folder))throw new RequestError(400,'Choose a valid project or profile upload folder.');
 if(!Object.hasOwn(IMAGE_TYPES,body.contentType))throw new RequestError(400,'Use JPG, PNG or WebP images.');
 if(!Number.isInteger(body.size)||body.size<=0||body.size>MAX_IMAGE_BYTES)throw new RequestError(400,'Choose an image under 5 MB.');
 return body;
}
export async function authorizeImageUpload(body,{client,bucket,uuid=()=>crypto.randomUUID()}){
 validateUploadRequest(body);
 const path=`${body.folder}/${uuid()}.${IMAGE_TYPES[body.contentType]}`;
 const storage=client.storage.from(bucket);
 const {data,error}=await storage.createSignedUploadUrl(path,{upsert:false});
 if(error||!data?.token)throw new RequestError(502,storageFailureMessage(error,bucket));
 const {data:publicData}=storage.getPublicUrl(path);
 return {bucket,path,token:data.token,publicUrl:publicData.publicUrl};
}
