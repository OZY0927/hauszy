import test from 'node:test';
import assert from 'node:assert/strict';
import {createBackgroundMusic,MUSIC_VOLUME} from '../lib/background-music.js';

test('music starts softly, fades and suspends for video, resumes, and cleans up',async t=>{
 t.mock.timers.enable({apis:['setInterval','setTimeout']});
 const gains=[];let notes=0,closed=false;
 const parameter=()=>({value:0,setValueAtTime(value){this.value=value},linearRampToValueAtTime(value){this.value=value},exponentialRampToValueAtTime(value){this.value=value},setTargetAtTime(value){this.value=value}});
 const node=()=>({connect(){},disconnect(){}});
 const context={currentTime:0,state:'suspended',destination:node(),
  createGain(){const gain={...node(),gain:parameter()};gains.push(gain);return gain},
  createDynamicsCompressor:()=>({...node(),threshold:parameter(),ratio:parameter()}),
  createDelay:()=>({...node(),delayTime:parameter()}),
  createOscillator:()=>({...node(),frequency:parameter(),start(){notes++},stop(){}}),
  async resume(){this.state='running'},async suspend(){this.state='suspended'},async close(){closed=true;this.state='closed'},
 };
 const music=createBackgroundMusic(context);
 assert.equal(gains[0].gain.value,0);
 music.setPlaying(true);await Promise.resolve();
 assert.equal(gains[0].gain.value,MUSIC_VOLUME);assert.ok(notes>0);
 music.setVolume(1);assert.equal(gains[0].gain.value,.6);
 music.setPlaying(false);assert.equal(gains[0].gain.value,0);
 t.mock.timers.tick(160);assert.equal(context.state,'suspended');
 const pausedNotes=notes;t.mock.timers.tick(2000);assert.equal(notes,pausedNotes);
 music.setPlaying(true);await Promise.resolve();assert.equal(context.state,'running');assert.equal(gains[0].gain.value,.6);
 // A quick resume cancels a pending suspension instead of stopping the music afterward.
 music.setPlaying(false);music.setPlaying(true);await Promise.resolve();t.mock.timers.tick(200);assert.equal(context.state,'running');
 music.dispose();assert.equal(closed,true);
 const finalNotes=notes;t.mock.timers.tick(3000);assert.equal(notes,finalNotes);
});
