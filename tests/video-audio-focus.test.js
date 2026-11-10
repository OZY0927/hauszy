import test from 'node:test';
import assert from 'node:assert/strict';
import {embeddedPlaybackState,observeVideoAudioFocus} from '../lib/video-audio-focus.js';

test('embedded video state pauses music during playback and buffering, releases on pause/end',()=>{
 for(const event of ['play','playing','bufferstart'])assert.equal(embeddedPlaybackState('vimeo',{event}),true);
 for(const event of ['pause','ended'])assert.equal(embeddedPlaybackState('vimeo',{event}),false);
 for(const state of [1,3])assert.equal(embeddedPlaybackState('youtube',{event:'onStateChange',info:state}),true);
 for(const state of [0,2,5])assert.equal(embeddedPlaybackState('youtube',{event:'infoDelivery',info:{playerState:state}}),false);
 for(const data of [null,{},'invalid',{event:'timeupdate'}])assert.equal(embeddedPlaybackState('vimeo',data),null);
});

test('video focus handles multiple players, trusted origins, closing embeds and native pause',()=>{
 const events=new Map(),windowEvents=new Map();let scan,videos=[],frames=[];
 const win={addEventListener:(n,f)=>windowEvents.set(n,f),removeEventListener:n=>windowEvents.delete(n),MutationObserver:class{constructor(f){scan=f}observe(){}disconnect(){}}};
 const doc={defaultView:win,body:{},querySelectorAll:s=>s==='video'?videos:frames,addEventListener:(n,f)=>events.set(n,f),removeEventListener:n=>events.delete(n)};
 const changes=[],cleanup=observeVideoAudioFocus(doc,v=>changes.push(v));
 const frame={src:'https://player.vimeo.com/video/123',contentWindow:{postMessage(){}},addEventListener(){},removeEventListener(){}};
 frames=[frame];scan();assert.equal(changes.at(-1),true);
 const send=(origin,data,source=frame.contentWindow)=>windowEvents.get('message')({source,origin,data});
 send('https://untrusted.example',{event:'pause'});assert.equal(changes.at(-1),true);
 send('https://player.vimeo.com',{event:'pause'},{});assert.equal(changes.at(-1),true);
 send('https://player.vimeo.com','{invalid');assert.equal(changes.at(-1),true);
 send('https://player.vimeo.com',JSON.stringify({event:'pause'}));assert.equal(changes.at(-1),false);
 videos=[{paused:false,ended:false}];events.get('play')();assert.equal(changes.at(-1),true);
 send('https://player.vimeo.com',{event:'ended'});assert.equal(changes.at(-1),true);
 videos[0].paused=true;events.get('pause')();assert.equal(changes.at(-1),false);
 send('https://player.vimeo.com',{event:'playing'});assert.equal(changes.at(-1),true);
 frame.src='https://www.youtube-nocookie.com/embed/example';scan();
 send('https://player.vimeo.com',{event:'pause'});assert.equal(changes.at(-1),true);
 send('https://www.youtube-nocookie.com',{event:'onStateChange',info:2});assert.equal(changes.at(-1),false);
 send('https://www.youtube-nocookie.com',{event:'onStateChange',info:1});assert.equal(changes.at(-1),true);
 frames=[];scan();assert.equal(changes.at(-1),false);
 cleanup();assert.equal(events.size,0);assert.equal(windowEvents.size,0);
});
