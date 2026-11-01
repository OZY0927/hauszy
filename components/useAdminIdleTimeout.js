'use client';
import {useEffect} from 'react';
import {signOut} from 'firebase/auth';
import {getFirebase} from '../lib/firebase-client';
const TIMEOUT=30*60*1000;
export function useAdminIdleTimeout(user,setStatus){
 useEffect(()=>{if(!user)return;let timer,last=Date.now();const expire=()=>{clearTimeout(timer);if(Date.now()-last>=TIMEOUT){signOut(getFirebase().auth).then(()=>setStatus('Signed out after 30 minutes of inactivity.')).catch(()=>setStatus('Unable to end the session. Please sign out manually.'));}else timer=setTimeout(expire,TIMEOUT-(Date.now()-last));};
 const activity=()=>{if(Date.now()-last>=TIMEOUT){expire();return}last=Date.now();clearTimeout(timer);timer=setTimeout(expire,TIMEOUT);};
 const visibility=()=>{if(document.visibilityState==='visible')expire()};timer=setTimeout(expire,TIMEOUT);
 for(const name of ['pointerdown','keydown','touchstart'])window.addEventListener(name,activity,{passive:true});document.addEventListener('visibilitychange',visibility);
 return()=>{clearTimeout(timer);for(const name of ['pointerdown','keydown','touchstart'])window.removeEventListener(name,activity);document.removeEventListener('visibilitychange',visibility)};
 },[user?.uid,setStatus]);
}
