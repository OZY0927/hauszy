'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {createBackgroundMusic,MUSIC_VOLUME,backgroundMusicUrl} from '../lib/background-music';
import {observeVideoAudioFocus} from '../lib/video-audio-focus';
import Icon from './Icon';

const KEY='hauszy-background-music',VOLUME_KEY='hauszy-music-volume';
export default function BackgroundMusic({url=''}){
 const path=usePathname(),admin=path.startsWith('/admin'),src=backgroundMusicUrl(url);
 const [enabled,setEnabled]=useState(true),[volume,setVolume]=useState(MUSIC_VOLUME),[failed,setFailed]=useState(false),[playing,setPlaying]=useState(false),[videoActive,setVideoActive]=useState(false);
 const controls=useRef(null),audioRef=useRef(null);
 useEffect(()=>{
  if(admin||!src||!audioRef.current)return;
  const audio=audioRef.current,engine=createBackgroundMusic(audio);
  setFailed(false);
  let desired=true,loudness=MUSIC_VOLUME,video=false;
  try{desired=localStorage.getItem(KEY)!=='off';const saved=localStorage.getItem(VOLUME_KEY);if(saved!==null&&Number.isFinite(Number(saved)))loudness=Math.min(.6,Math.max(0,Number(saved)))}catch{}
  setEnabled(desired);setVolume(loudness);
  const state=()=>setPlaying(!audio.paused&&desired&&!video&&document.visibilityState!=='hidden');
  function sync(){
   const active=desired&&!video&&document.visibilityState!=='hidden';
   engine.setVolume(loudness);
   engine?.setPlaying(active);state();
  }
  controls.current={toggle(){desired=!desired;setEnabled(desired);try{localStorage.setItem(KEY,desired?'on':'off')}catch{}sync();engine?.retry()},volume(value){loudness=value;setVolume(value);engine?.setVolume(value);try{localStorage.setItem(VOLUME_KEY,String(value))}catch{}}};
  const interact=()=>{sync();engine?.retry()};
  const storage=e=>{if(e.key===KEY){desired=e.newValue!=='off';setEnabled(desired);sync()}if(e.key===VOLUME_KEY){const value=Number(e.newValue);if(Number.isFinite(value)){loudness=Math.min(.6,Math.max(0,value));setVolume(loudness);engine?.setVolume(loudness)}}};
  const mediaEvents=['playing','pause','ended'];
  mediaEvents.forEach(name=>audio.addEventListener(name,state));
  const stopObserving=observeVideoAudioFocus(document,active=>{video=active;setVideoActive(active);sync()});
  document.addEventListener('pointerdown',interact,true);document.addEventListener('keydown',interact,true);
  document.addEventListener('visibilitychange',sync);window.addEventListener('storage',storage);sync();
  return()=>{controls.current=null;stopObserving();document.removeEventListener('pointerdown',interact,true);document.removeEventListener('keydown',interact,true);document.removeEventListener('visibilitychange',sync);window.removeEventListener('storage',storage);mediaEvents.forEach(name=>audio.removeEventListener(name,state));engine.dispose()};
 },[admin,src]);
 if(admin||!src)return null;
 const label=!enabled?'Music off':videoActive?'Music paused':playing?'Music on':'Music ready';
 return <><audio ref={audioRef} src={src} loop preload="none" onError={()=>{setFailed(true);setPlaying(false)}} aria-hidden="true"/>{!failed&&<div className="background-music" role="group" aria-label="Background music controls">
  <button type="button" aria-label={enabled?'Turn background music off':'Turn background music on'} aria-pressed={enabled} onClick={()=>controls.current?.toggle()} title="Background music"><Icon name={enabled?'volume':'volumeOff'}/><span>{label}</span></button>
  <input type="range" min="0" max="0.6" step="0.02" value={volume} aria-label="Background music volume" aria-valuetext={`${Math.round(volume*100)} percent`} onChange={e=>controls.current?.volume(Number(e.target.value))}/>
 </div>}</>;
}
