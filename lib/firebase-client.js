'use client';
import {initializeApp,getApps,getApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {getStorage,ref,uploadBytes,getDownloadURL} from 'firebase/storage';
import {firebaseConfig} from './firebase-config';
let services;
export function getFirebase(){if(!services){const app=getApps().length?getApp():initializeApp(firebaseConfig);services={auth:getAuth(app),db:getFirestore(app),storage:getStorage(app)}}return services}
export async function uploadPhoto(photo,folder){if(!photo.file)return photo.url;if(!['image/jpeg','image/png','image/webp'].includes(photo.file.type)||photo.file.size>5*1024*1024)throw Error('Choose JPG, PNG or WebP photos under 5 MB.');const target=ref(getFirebase().storage,`${folder}/${crypto.randomUUID()}`);await uploadBytes(target,photo.file,{contentType:photo.file.type});return getDownloadURL(target)}
