'use client';
import {initializeApp,getApps,getApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {uploadSupabasePhoto} from './supabase-upload-client';
import {isAdminToken} from './admin-access';
import {firebaseConfig} from './firebase-config';
import {supabaseOrigin} from './supabase-config';
import {PREVIEW_SIZE,photoName,previewUrl} from './media';
let services;
export function getFirebase(){if(!services){const app=getApps().length?getApp():initializeApp(firebaseConfig);services={auth:getAuth(app),db:getFirestore(app)}}return services}
export async function uploadPhoto(photo,folder){const user=getFirebase().auth.currentUser;if(!user||!isAdminToken(await user.getIdTokenResult()))throw Error('Administrator access required.');if(!photo.file){await backfillPreview(photo.url,user);return photo.url}if(!['image/jpeg','image/png','image/webp'].includes(photo.file.type)||photo.file.size>5*1024*1024||photo.file.size===0)throw Error('Choose JPG, PNG or WebP photos under 5 MB.');const image=await shrinkPhoto(photo.file),url=await uploadSupabasePhoto(image,folder,user);await uploadPreview(image,url,user);return url;}
// Re-encodes a photo as WebP at most size px on the long edge; null when the browser cannot.
async function resizePhoto(file,size,quality){if(typeof createImageBitmap!=='function')return null;try{const bitmap=await createImageBitmap(file),scale=Math.min(1,size/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',quality));return blob?.type==='image/webp'?blob:null}catch{return null}}
// Resizes large photos to 2400px on the long edge and re-encodes as WebP, keeping the original if that is smaller.
async function shrinkPhoto(file){const blob=await resizePhoto(file,2400,.85);return blob&&blob.size<file.size?blob:file}
// The storage folder of an uploaded photo's public URL, so its preview lands beside it.
function storageFolder(url){try{const prefix=`${supabaseOrigin()}/storage/v1/object/public/`;return typeof url==='string'&&url.startsWith(prefix)?url.slice(prefix.length).split('/').slice(1,-1).join('/'):null}catch{return null}}
// Uploads the small preview pages show before a photo is opened. Pages fall back to the full photo, so a failure never blocks the save.
async function uploadPreview(image,url,user){const name=photoName(url),folder=storageFolder(url);if(!name||!folder)return;try{const preview=await resizePhoto(image,PREVIEW_SIZE,.7);if(preview)await uploadSupabasePhoto(preview,folder,user,{previewOf:name})}catch{}}
// Photos uploaded before previews existed get one the next time their project or profile is saved.
async function backfillPreview(url,user){if(!photoName(url)||!storageFolder(url))return;try{if((await fetch(previewUrl(url),{method:'HEAD',cache:'no-store'})).ok)return;const response=await fetch(url);if(response.ok)await uploadPreview(await response.blob(),url,user)}catch{}}
// Clears the cached public pages after an admin save. Failure only delays the update until the cache expires.
export async function refreshSite(tags){try{const token=await getFirebase().auth.currentUser?.getIdToken();if(token)await fetch('/api/revalidate/',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({tags})})}catch{}}
