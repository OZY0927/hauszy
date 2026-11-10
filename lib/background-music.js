import {isSafeHttpsUrl} from './secure-url.js';
export const MUSIC_VOLUME=.32;
export function backgroundMusicUrl(value){
 const url=typeof value==='string'?value.trim():'';
 return url.length<=2048&&isSafeHttpsUrl(url)?url:'';
}

// Regular media playback supports direct audio URLs without Web Audio CORS requirements.
export function createBackgroundMusic(audio){
 let volume=MUSIC_VOLUME,playing=false,disposed=false,ramp;
 audio.loop=true;audio.volume=0;
 function fade(target){
  clearInterval(ramp);const start=audio.volume;let step=0;
  ramp=setInterval(()=>{
   audio.volume=Math.max(0,Math.min(.6,start+(target-start)*++step/8));
   if(step>=8){clearInterval(ramp);if(!playing)audio.pause()}
  },20);
 }
 function start(){
  if(disposed||!playing||audio.error)return;
  audio.play().then(()=>{if(disposed)return;if(!playing){audio.pause();return}fade(volume)}).catch(()=>{});
 }
 return {
  setVolume(value){volume=Math.min(.6,Math.max(0,value));if(playing&&!audio.paused)fade(volume)},
  setPlaying(value){if(disposed||value===playing)return;playing=value;if(value){clearInterval(ramp);start()}else fade(0)},
  retry(){if(playing&&audio.paused)start()},
  dispose(){disposed=true;clearInterval(ramp);audio.pause();audio.volume=0},
 };
}
