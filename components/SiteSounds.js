'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {interactionSound,playUISound} from '../lib/ui-sounds';
import Icon from './Icon';

const KEY='hauszy-ui-sounds';
export default function SiteSounds(){
 const [enabled,setEnabled]=useState(true),[supported,setSupported]=useState(true);
 const enabledRef=useRef(true),audio=useRef(null),lastPlayed=useRef(0),path=usePathname();
 function play(name){
  if(!enabledRef.current||document.visibilityState==='hidden')return;
  try{
   const Audio=window.AudioContext||window.webkitAudioContext;
   if(!Audio)return;
   const context=audio.current||(audio.current=new Audio());
   const sound=()=>{if(enabledRef.current&&context.state==='running')playUISound(context,name)};
   if(context.state==='suspended')context.resume().then(sound).catch(()=>{});else sound();
  }catch{/* Unsupported or blocked audio never interferes with the interaction. */}
 }
 useEffect(()=>{
  setSupported(!!(window.AudioContext||window.webkitAudioContext));
  try{enabledRef.current=localStorage.getItem(KEY)!=='off';setEnabled(enabledRef.current)}catch{}
  const storage=e=>{if(e.key===KEY){enabledRef.current=e.newValue!=='off';setEnabled(enabledRef.current)}};
  const visibility=()=>{if(document.visibilityState==='hidden')audio.current?.suspend().catch(()=>{})};
  window.addEventListener('storage',storage);document.addEventListener('visibilitychange',visibility);
  return()=>{window.removeEventListener('storage',storage);document.removeEventListener('visibilitychange',visibility);audio.current?.close().catch(()=>{});audio.current=null};
 },[]);
 useEffect(()=>{
  if(path.startsWith('/admin'))return;
  const click=event=>{
   if(!event.isTrusted||!enabledRef.current||!(event.target instanceof Element))return;
   const element=event.target.closest('button,a,summary,[role="tab"]');
   if(!element||element.matches(':disabled,[aria-disabled="true"]'))return;
   // Let films and project videos keep their own audio space.
   if(document.querySelector('.pg-film-player')||[...document.querySelectorAll('video')].some(v=>!v.paused&&!v.muted))return;
   const name=interactionSound(element),now=performance.now();
   if(!name||now-lastPlayed.current<90)return;
   lastPlayed.current=now;play(name);
  };
  document.addEventListener('click',click,true);
  return()=>document.removeEventListener('click',click,true);
 },[path]);
 function toggle(){
  const next=!enabledRef.current;enabledRef.current=next;setEnabled(next);
  try{localStorage.setItem(KEY,next?'on':'off')}catch{}
  if(next)play('tick');else if(audio.current?.state==='running')audio.current.suspend().catch(()=>{});
 }
 if(!supported||path.startsWith('/admin'))return null;
 return <button type="button" className="site-sound-toggle" aria-label="Interface sounds" aria-pressed={enabled} onClick={toggle} title={enabled?'Turn interface sounds off':'Turn interface sounds on'}><Icon name={enabled?'volume':'volumeOff'}/><span>Sound {enabled?'on':'off'}</span></button>;
}
