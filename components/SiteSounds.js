'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {interactionSound,changeSound,navigationHoverTarget,playUISound} from '../lib/ui-sounds';
import {observeVideoAudioFocus} from '../lib/video-audio-focus';
import Icon from './Icon';

const KEY='hauszy-ui-sounds';
export default function SiteSounds({showControl=true}){
 const [enabled,setEnabled]=useState(true),[supported,setSupported]=useState(true);
 const enabledRef=useRef(true),audio=useRef(null),lastPlayed=useRef(-Infinity),videoActive=useRef(false),path=usePathname();
 function play(name){
  if(!enabledRef.current||videoActive.current||document.visibilityState==='hidden')return;
  try{
   const Audio=window.AudioContext||window.webkitAudioContext;
   if(!Audio)return;
   const context=audio.current||(audio.current=new Audio());
   const sound=()=>{if(enabledRef.current&&!videoActive.current&&document.visibilityState!=='hidden'&&context.state==='running')playUISound(context,name)};
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
  const stopVideoObserver=observeVideoAudioFocus(document,active=>{videoActive.current=active});
  const respond=(event,change=false)=>{
   if(!event.isTrusted||!enabledRef.current||!(event.target instanceof Element))return;
   const element=change?event.target:event.target.closest('button,a,summary,[role="tab"]');
   if(!element||element.matches(':disabled,[aria-disabled="true"]'))return;
   const name=change?changeSound(element):interactionSound(element),now=performance.now();
   if(!name||now-lastPlayed.current<90)return;
   lastPlayed.current=now;play(name);
  };
  const click=event=>respond(event),change=event=>respond(event,true);
  let lastHover=-Infinity;
  const hover=event=>{
   if(!event.isTrusted||event.pointerType!=='mouse'||!(event.target instanceof Element)||!enabledRef.current||videoActive.current||document.visibilityState==='hidden')return;
   // Hover cannot unlock browser audio. Never queue a tone for a later gesture.
   if(audio.current?.state!=='running'||!navigationHoverTarget(event.target,event.relatedTarget))return;
   const now=performance.now();
   if(now-lastHover<160)return;
   lastHover=now;play('hover');
  };
  document.addEventListener('click',click,true);
  document.addEventListener('change',change,true);
  document.addEventListener('pointerover',hover,true);
  return()=>{document.removeEventListener('click',click,true);document.removeEventListener('change',change,true);document.removeEventListener('pointerover',hover,true);stopVideoObserver();videoActive.current=false};
 },[path]);
 function toggle(){
  const next=!enabledRef.current;enabledRef.current=next;setEnabled(next);
  try{localStorage.setItem(KEY,next?'on':'off')}catch{}
  if(next)play('tick');else if(audio.current?.state==='running')audio.current.suspend().catch(()=>{});
 }
 if(!showControl||!supported||path.startsWith('/admin'))return null;
 return <button type="button" className="site-sound-toggle" aria-label="Interface sounds" aria-pressed={enabled} onClick={toggle} title={enabled?'Turn interface sounds off':'Turn interface sounds on'}><Icon name={enabled?'volume':'volumeOff'}/><span>Sound {enabled?'on':'off'}</span></button>;
}
