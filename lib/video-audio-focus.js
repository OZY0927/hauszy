export function embeddedPlaybackState(provider,message){
 if(provider==='vimeo'){
  if(['play','playing','bufferstart'].includes(message?.event))return true;
  if(['pause','ended'].includes(message?.event))return false;
 }
 if(provider==='youtube'){
  const state=message?.event==='onStateChange'?message.info:message?.event==='infoDelivery'?message.info?.playerState:undefined;
  if([1,3].includes(state))return true;
  if([0,2,5].includes(state))return false;
 }
 return null;
}

// Embedded players reserve audio until they report paused/ended or are removed.
export function observeVideoAudioFocus(doc,notify){
 const win=doc.defaultView,players=new Map();let last;
 function publish(){
  const active=[...doc.querySelectorAll('video')].some(v=>!v.paused&&!v.ended&&!v.error)||[...players.values()].some(p=>p.active);
  if(active!==last){last=active;notify(active)}
 }
 function subscribe(frame,player){
  const send=value=>frame.contentWindow?.postMessage(JSON.stringify(value),player.origin);
  if(player.provider==='vimeo')for(const event of ['play','playing','pause','ended','bufferstart'])send({method:'addEventListener',value:event});
  else{send({event:'listening',id:'hauszy-music'});send({event:'command',func:'addEventListener',args:['onStateChange']})}
 }
 function scan(){
  const frames=new Set(doc.querySelectorAll('.floating-video iframe,.pg-film-player iframe'));
  for(const [frame,player]of players)if(!frames.has(frame)||frame.src!==player.src){frame.removeEventListener('load',player.load);players.delete(frame)}
  for(const frame of frames)if(!players.has(frame)){
   let origin;try{origin=new URL(frame.src).origin}catch{continue}
   const provider=origin==='https://player.vimeo.com'?'vimeo':origin==='https://www.youtube-nocookie.com'?'youtube':null;
   if(!provider)continue;
   const player={origin,provider,src:frame.src,active:true,load:()=>subscribe(frame,player)};
   players.set(frame,player);frame.addEventListener('load',player.load);subscribe(frame,player);
  }
  publish();
 }
 function message(event){
  for(const [frame,player]of players){
   if(event.source!==frame.contentWindow||event.origin!==player.origin)continue;
   let data=event.data;try{if(typeof data==='string')data=JSON.parse(data)}catch{continue}
   if(data?.event==='ready'||data?.event==='onReady')subscribe(frame,player);
   const active=embeddedPlaybackState(player.provider,data);
   if(active!==null){player.active=active;publish()}
  }
 }
 const events=['play','playing','pause','ended','emptied','error'];
 events.forEach(name=>doc.addEventListener(name,publish,true));win.addEventListener('message',message);
 const observer=new win.MutationObserver(scan);observer.observe(doc.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});scan();
 return()=>{observer.disconnect();events.forEach(name=>doc.removeEventListener(name,publish,true));win.removeEventListener('message',message);for(const [frame,p]of players)frame.removeEventListener('load',p.load)};
}
