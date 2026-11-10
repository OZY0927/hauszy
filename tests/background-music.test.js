import test from 'node:test';
import assert from 'node:assert/strict';
import {createBackgroundMusic,MUSIC_VOLUME,backgroundMusicUrl} from '../lib/background-music.js';

test('music URLs accept direct HTTPS and signed audio links, reject unsafe or oversized values',()=>{
 for(const url of ['https://cdn.example/music.mp3','https://cdn.example/audio?token=abc&download=1'])assert.equal(backgroundMusicUrl(' '+url+' '),url);
 for(const url of ['',null,{},'http://example.com/music.mp3','javascript:alert(1)','data:audio/mp3,hi','https://user:pass@example.com/song.mp3','https://example.com/a\nb','https://example.com/'+ 'a'.repeat(2048)])assert.equal(backgroundMusicUrl(url),'');
});

test('URL music fades softly, preserves position through videos, and cleans up',async t=>{
 t.mock.timers.enable({apis:['setInterval']});
 const audio={volume:1,paused:true,currentTime:42,error:null,async play(){this.paused=false},pause(){this.paused=true}};
 const music=createBackgroundMusic(audio);
 assert.equal(audio.volume,0);assert.equal(audio.loop,true);
 music.setPlaying(true);await Promise.resolve();t.mock.timers.tick(160);
 assert.equal(audio.volume,MUSIC_VOLUME);assert.equal(audio.paused,false);
 music.setVolume(1);t.mock.timers.tick(160);assert.equal(audio.volume,.6);
 music.setPlaying(false);t.mock.timers.tick(160);assert.equal(audio.volume,0);assert.equal(audio.paused,true);assert.equal(audio.currentTime,42);
 music.setPlaying(true);await Promise.resolve();t.mock.timers.tick(160);assert.equal(audio.paused,false);assert.equal(audio.currentTime,42);
 music.setPlaying(false);music.setPlaying(true);await Promise.resolve();t.mock.timers.tick(200);assert.equal(audio.paused,false);
 music.dispose();assert.equal(audio.paused,true);assert.equal(audio.volume,0);
});

test('autoplay rejection retries on interaction without overriding music off',async t=>{
 t.mock.timers.enable({apis:['setInterval']});
 let allowed=false,attempts=0;
 const audio={volume:0,paused:true,error:null,async play(){attempts++;if(!allowed)throw Error('NotAllowedError');this.paused=false},pause(){this.paused=true}};
 const music=createBackgroundMusic(audio);
 music.setPlaying(true);await Promise.resolve();await Promise.resolve();assert.equal(audio.paused,true);
 allowed=true;music.retry();await Promise.resolve();t.mock.timers.tick(160);assert.equal(audio.paused,false);
 music.setPlaying(false);t.mock.timers.tick(160);const before=attempts;music.retry();assert.equal(attempts,before);assert.equal(audio.paused,true);
 music.dispose();
});
