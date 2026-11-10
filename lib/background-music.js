// Original instrumental ambience: pentatonic plucked strings, bamboo-like tones,
// and resonant string/drone passages. Synthesized timbres, not traditional recordings.
const MELODIES=[
 [0,4,7,9,7,4,2,null,4,7,12,9,7,null,4,2],
 [0,null,2,7,4,null,2,0,7,9,7,null,4,2,0,null],
 [0,2,3,7,10,7,3,null,2,3,7,12,10,7,3,2],
];
export const MUSIC_VOLUME=.32;

export function createBackgroundMusic(context){
 const master=context.createGain(),compressor=context.createDynamicsCompressor();
 const delay=context.createDelay(1),feedback=context.createGain(),echo=context.createGain();
 master.gain.value=0;compressor.threshold.value=-20;compressor.ratio.value=3;
 delay.delayTime.value=.36;feedback.gain.value=.22;echo.gain.value=.16;
 master.connect(compressor);compressor.connect(context.destination);
 delay.connect(feedback);feedback.connect(delay);delay.connect(echo);echo.connect(master);
 let beat=0,next=context.currentTime+.08,volume=MUSIC_VOLUME,playing=false,closed=false,suspension;
 function note(frequency,at,duration,level,section){
  const envelope=context.createGain(),partials=section===0?[1,.32,.12]:section===1?[1,.12,.04]:[1,.4,.22,.08];
  envelope.gain.setValueAtTime(0,at);
  envelope.gain.linearRampToValueAtTime(level,at+(section===1?.12:.018));
  envelope.gain.exponentialRampToValueAtTime(.0001,at+duration);
  envelope.connect(master);envelope.connect(delay);
  let remaining=partials.length;
  partials.forEach((strength,i)=>{
   const oscillator=context.createOscillator(),gain=context.createGain();
   oscillator.type='sine';oscillator.frequency.value=frequency*(i+1);gain.gain.value=strength;
   if(section===2)oscillator.frequency.setTargetAtTime(frequency*(i+1)*1.002,at,.3);
   oscillator.connect(gain);gain.connect(envelope);oscillator.start(at);oscillator.stop(at+duration+.02);
   oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();if(!--remaining)envelope.disconnect()};
  });
 }
 function schedule(){
  if(closed||context.state!=='running'||!playing)return;
  next=Math.max(next,context.currentTime+.025);
  while(next<context.currentTime+.25){
   const section=Math.floor(beat/32)%3,pitch=MELODIES[section][beat%16];
   if(pitch!==null)note(220*2**(pitch/12),next,section===1?1.4:2.4,.1,section);
   if(beat%8===0){note(110,next,4.8,.035,2);note(165,next+.04,4.6,.018,2)}
   beat++;next+=.72;
  }
 }
 const timer=setInterval(schedule,100);
 return {
  setVolume(value){volume=Math.min(.6,Math.max(0,value));if(playing)master.gain.setTargetAtTime(volume,context.currentTime,.15)},
  setPlaying(value){
   if(closed||value===playing)return;playing=value;clearTimeout(suspension);
   if(value){
    context.resume().then(()=>{if(playing&&!closed){master.gain.setTargetAtTime(volume,context.currentTime,.25);schedule()}}).catch(()=>{});
   }else{
    master.gain.setTargetAtTime(0,context.currentTime,.035);
    suspension=setTimeout(()=>{if(!playing&&!closed)context.suspend().catch(()=>{})},160);
   }
  },
  retry(){if(playing&&context.state!=='running')context.resume().then(schedule).catch(()=>{})},
  dispose(){closed=true;clearInterval(timer);clearTimeout(suspension);context.close().catch(()=>{})},
 };
}
