'use client';
import {initializeApp,getApps,getApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {getStorage,ref,uploadBytes,getDownloadURL} from 'firebase/storage';
import {firebaseConfig} from './firebase-config';
let services;
export function getFirebase(){if(!services){const app=getApps().length?getApp():initializeApp(firebaseConfig);services={auth:getAuth(app),db:getFirestore(app),storage:getStorage(app)}}return services}
export async function uploadPhoto(photo,folder){if(!photo.file)return photo.url;if(!['image/jpeg','image/png','image/webp'].includes(photo.file.type)||photo.file.size>5*1024*1024)throw Error('Choose JPG, PNG or WebP photos under 5 MB.');const target=ref(getFirebase().storage,`${folder}/${crypto.randomUUID()}`);const image=await shrinkPhoto(photo.file);await uploadBytes(target,image,{contentType:image.type,cacheControl:'public, max-age=31536000, immutable'});return getDownloadURL(target)}
// Resizes large photos to 2400px on the long edge and re-encodes as WebP, keeping the original if that is smaller.
async function shrinkPhoto(file){if(typeof createImageBitmap!=='function')return file;try{const bitmap=await createImageBitmap(file),scale=Math.min(1,2400/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.85));return blob&&blob.type==='image/webp'&&blob.size<file.size?blob:file}catch{return file}}
// Clears the cached public pages after an admin save. Failure only delays the update until the cache expires.
export async function refreshSite(tags){try{const token=await getFirebase().auth.currentUser?.getIdToken();if(token)await fetch('/api/revalidate/',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({tags})})}catch{}}
