'use client';
import {useEffect,useState} from 'react';
import {doc,getDocFromServer,setDoc,serverTimestamp} from 'firebase/firestore';
import {getFirebase} from '../lib/firebase-client';
import {backgroundMusicUrl} from '../lib/background-music';
import {authErrorMessage} from '../lib/auth-errors';
import Icon from './Icon';

export default function AdminMusicSettings({user}){
 const [url,setUrl]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[ready,setReady]=useState(false),[attempt,setAttempt]=useState(0),[status,setStatus]=useState(''),[previewError,setPreviewError]=useState(false);
 useEffect(()=>{
  let active=true;setLoading(true);setReady(false);setStatus('');
  getDocFromServer(doc(getFirebase().db,'siteContent','about')).then(snapshot=>{
   if(active){setUrl(snapshot.data()?.backgroundMusicUrl||'');setReady(true)}
  }).catch(error=>{if(active)setStatus(authErrorMessage(error))}).finally(()=>{if(active)setLoading(false)});
  return()=>{active=false};
 },[user.uid,attempt]);
 const valid=backgroundMusicUrl(url);
 async function save(event){
  event.preventDefault();if(!ready||busy)return;
  if(url.trim()&&!valid){setStatus('Enter a direct audio URL starting with https://.');return}
  setBusy(true);setStatus('Saving music settings…');
  let saved=false;
  try{
   await setDoc(doc(getFirebase().db,'siteContent','about'),{backgroundMusicUrl:valid,updatedAt:serverTimestamp()},{merge:true});
   saved=true;setUrl(valid);
   const token=await user.getIdToken();
   const response=await fetch('/api/revalidate/',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({tags:['profile']})});
   if(!response.ok)throw Error('refresh-failed');
   setStatus(valid?'Saved. New visitors will hear this track when playback is allowed.':'Saved. Background music is disabled.');
  }catch(error){setStatus(saved?'Music was saved, but the website refresh failed. Select Save music settings to retry.':error.code?authErrorMessage(error):'Could not save music settings. Please try again.')}finally{setBusy(false)}
 }
 return <form method="post" className="st-card" onSubmit={save}>
  <div className="st-card-head"><div><h3><Icon name="volume"/>Background music</h3><p>Choose the music visitors hear while browsing your website.</p></div></div>
  <div className="st-card-body">
   <label className="st-field">Music URL<input name="backgroundMusicUrl" type="url" inputMode="url" maxLength={2048} placeholder="https://example.com/music.mp3" value={url} disabled={loading||busy||!ready} onChange={event=>{setUrl(event.target.value);setStatus('');setPreviewError(false)}} aria-describedby="music-url-help"/></label>
   <p className="st-note" id="music-url-help">Use a public HTTPS link directly to an audio file, such as MP3, M4A or OGG. Leave blank to turn background music off. Browsers may require a first tap before playing sound.</p>
   {valid&&ready&&<div><audio key={valid} controls preload="none" src={valid} aria-label="Preview background music" onError={()=>setPreviewError(true)} style={{maxWidth:'100%',width:'100%'}}/>{previewError&&<p className="st-status bad" role="status">This link could not play. Check that it opens an audio file directly and is publicly accessible.</p>}</div>}
   <button className="st-btn primary" disabled={loading||busy||!ready}><Icon name="save"/>{busy?'Saving…':'Save music settings'}</button>
   {!loading&&!ready&&<button type="button" className="st-btn" onClick={()=>setAttempt(value=>value+1)}>Try again</button>}
   <p className="st-status" role="status">{loading?'Loading music settings…':status}</p>
  </div>
 </form>;
}
