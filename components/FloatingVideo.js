'use client';
import {useEffect,useRef,useState} from 'react';
import {videoSource} from '../lib/video';
import Icon from './Icon';

const GAP=16,MIN_WIDTH=220,MAX_WIDTH=960,RATIO=9/16,CORNERS=['nw','ne','sw','se'];
const clampTo=(box,x,y)=>({x:Math.min(Math.max(GAP,x),window.innerWidth-box.width-GAP),y:Math.min(Math.max(GAP,y),window.innerHeight-box.height-GAP)});
const maxWidth=()=>Math.max(MIN_WIDTH,Math.min(MAX_WIDTH,window.innerWidth-GAP*2));
// Mute and unmute commands for the YouTube and Vimeo players (sent with postMessage).
const COMMANDS={youtube:on=>[{event:'listening'},{event:'command',func:on?'unMute':'mute',args:[]},...(on?[{event:'command',func:'setVolume',args:[100]}]:[])],vimeo:on=>[{method:'setMuted',value:!on},...(on?[{method:'setVolume',value:1}]:[])]};

// Floating picture-in-picture style player: starts at the bottom right and plays with sound on loop.
// Browsers block sound until the visitor has interacted with the site, so in that case it plays muted and turns the sound on at their first tap or key press.
// It can be dragged by its bar, resized from any corner, minimised or closed.
export default function FloatingVideo({url,name}){
  const source=videoSource(url),panel=useRef(null),video=useRef(null),frame=useRef(null),drag=useRef(null),resize=useRef(null),chosen=useRef(false);
  const [hidden,setHidden]=useState(false),[minimised,setMinimised]=useState(false),[width,setWidth]=useState(null),[muted,setMuted]=useState(false),[pos,setPos]=useState(null),[dragging,setDragging]=useState(false),[pipReady,setPipReady]=useState(false);
  useEffect(()=>{setPipReady(source?.kind==='file'&&!!document.pictureInPictureEnabled)},[source?.kind]);
  // Keep the panel on screen when it changes size or the window is resized.
  useEffect(()=>{
    const fit=()=>{setWidth(w=>w&&Math.min(w,maxWidth()));setPos(p=>{const box=panel.current?.getBoundingClientRect();return p&&box?clampTo(box,p.x,p.y):p})};
    fit();window.addEventListener('resize',fit);return ()=>window.removeEventListener('resize',fit);
  },[width,minimised]);
  function sound(on){
    const v=video.current;if(v){v.muted=!on;if(!v.paused||on)v.play().catch(()=>{v.muted=true;setMuted(true)})}
    const target=frame.current?.contentWindow;if(target&&source?.provider)for(const message of COMMANDS[source.provider](on))target.postMessage(JSON.stringify(message),source.origin);
    setMuted(!on);
  }
  // Start with sound. If the browser refuses, play muted and unmute at the first interaction outside the player (unless the visitor muted it themselves).
  useEffect(()=>{
    if(!source)return;
    const v=video.current;if(v){v.muted=false;v.play().catch(()=>{v.muted=true;setMuted(true);v.play().catch(()=>{})})}else setMuted(true);
    const first=e=>{if(chosen.current||panel.current?.contains(e.target))return;sound(true);stop()};
    const stop=()=>['pointerdown','keydown'].forEach(type=>document.removeEventListener(type,first,true));
    ['pointerdown','keydown'].forEach(type=>document.addEventListener(type,first,true));return stop;
  },[source?.src]);
  // Pause while minimised; an embedded player is unmounted instead and restarts when shown again.
  useEffect(()=>{const v=video.current;if(!v)return;if(minimised)v.pause();else v.play().catch(()=>{})},[minimised]);
  if(!source||hidden)return null;
  // Embedded players load muted (so autoplay is allowed); unmute them once loaded if the visitor has already interacted with the site.
  function loaded(){const active=navigator.userActivation?.hasBeenActive;if(!chosen.current&&active)setTimeout(()=>sound(true),400);else if(chosen.current)sound(!muted)}
  function toggleMute(){chosen.current=true;sound(muted)}
  function down(e){if(e.button>0||e.target.closest('button'))return;const box=panel.current.getBoundingClientRect();drag.current={dx:e.clientX-box.left,dy:e.clientY-box.top};e.currentTarget.setPointerCapture(e.pointerId);setDragging(true)}
  function move(e){if(!drag.current)return;setPos(clampTo(panel.current.getBoundingClientRect(),e.clientX-drag.current.dx,e.clientY-drag.current.dy))}
  function up(){drag.current=null;resize.current=null;setDragging(false)}
  function keys(e){const step=e.shiftKey?60:20,d={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[e.key];if(!d)return;e.preventDefault();const box=panel.current.getBoundingClientRect();setPos(clampTo(box,box.left+d[0],box.top+d[1]))}
  // Resizing keeps the video 16:9 and pins the opposite corner in place.
  function resizeDown(e,corner){if(e.button>0)return;e.preventDefault();e.stopPropagation();const box=panel.current.getBoundingClientRect();resize.current={corner,box,x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);setDragging(true)}
  function resizeMove(e){
    const r=resize.current;if(!r)return;const {box,corner}=r,east=corner.includes('e'),south=corner.includes('s');
    const dw=(e.clientX-r.x)*(east?1:-1),dh=(e.clientY-r.y)*(south?1:-1)/RATIO,w=Math.round(Math.min(maxWidth(),Math.max(MIN_WIDTH,box.width+(Math.abs(dw)>Math.abs(dh)?dw:dh)))),h=box.height+(w-box.width)*RATIO;
    setWidth(w);setPos({x:east?box.left:box.right-w,y:south?box.top:box.bottom-h});
  }
  function resizeKeys(e){const d={ArrowLeft:-20,ArrowDown:-20,ArrowRight:20,ArrowUp:20}[e.key];if(!d)return;e.preventDefault();setWidth(Math.min(maxWidth(),Math.max(MIN_WIDTH,panel.current.getBoundingClientRect().width+d)))}
  async function pip(){try{document.pictureInPictureElement?await document.exitPictureInPicture():await video.current?.requestPictureInPicture()}catch{}}
  const style={...(pos?{left:pos.x,top:pos.y,right:'auto',bottom:'auto'}:{}),...(width&&!minimised?{width}:{})};
  return <section ref={panel} className={`floating-video${minimised?' is-minimised':''}${dragging?' is-dragging':''}`} style={style} aria-label={`${name} video`}>
    <div className="floating-video-bar" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={keys} tabIndex={0} aria-label="Move video. Drag, or use the arrow keys.">
      <Icon name="grip"/><span>{minimised?'Project video':name}</span>
      <div className="floating-video-actions">
        {!minimised&&<button type="button" onClick={toggleMute} aria-label={muted?'Unmute video':'Mute video'} title={muted?'Unmute':'Mute'}><Icon name={muted?'volumeOff':'volume'}/></button>}
        {!minimised&&pipReady&&<button type="button" onClick={pip} aria-label="Open in picture-in-picture window" title="Picture in picture"><Icon name="pip"/></button>}
        <button type="button" onClick={()=>setMinimised(v=>!v)} aria-label={minimised?'Show video':'Minimise video'} title={minimised?'Show':'Minimise'}><Icon name={minimised?'arrowUp':'minus'}/></button>
        <button type="button" onClick={()=>setHidden(true)} aria-label="Close video" title="Close"><Icon name="x"/></button>
      </div>
    </div>
    <div className="floating-video-frame" hidden={minimised}>
      {source.kind==='file'
        ?<video ref={video} src={source.src} loop playsInline preload="auto" onError={()=>setHidden(true)} onClick={toggleMute}/>
        :!minimised&&<iframe ref={frame} src={source.src} title={`${name} video`} onLoad={loaded} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>}
      {muted&&<button type="button" className="floating-video-sound" onClick={toggleMute}><Icon name="volume"/> Tap for sound</button>}
    </div>
    {!minimised&&CORNERS.map(c=><span key={c} className={`floating-video-resize is-${c}`} role="slider" tabIndex={c==='nw'?0:-1} aria-hidden={c==='nw'?undefined:true} aria-label="Resize video. Use the arrow keys." aria-valuemin={MIN_WIDTH} aria-valuemax={MAX_WIDTH} aria-valuenow={Math.round(width||0)||undefined} onPointerDown={e=>resizeDown(e,c)} onPointerMove={resizeMove} onPointerUp={up} onPointerCancel={up} onKeyDown={resizeKeys}/>)}
  </section>;
}
