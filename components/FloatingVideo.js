'use client';
import {useEffect,useRef,useState} from 'react';
import {videoSource} from '../lib/video';
import Icon from './Icon';

const GAP=16;
const clampTo=(box,x,y)=>({x:Math.min(Math.max(GAP,x),window.innerWidth-box.width-GAP),y:Math.min(Math.max(GAP,y),window.innerHeight-box.height-GAP)});

// Floating picture-in-picture style player: starts at the bottom right, plays muted on loop, and can be dragged, resized, minimised or closed.
export default function FloatingVideo({url,name}){
  const source=videoSource(url),panel=useRef(null),video=useRef(null),drag=useRef(null);
  const [hidden,setHidden]=useState(false),[minimised,setMinimised]=useState(false),[large,setLarge]=useState(false),[muted,setMuted]=useState(true),[pos,setPos]=useState(null),[dragging,setDragging]=useState(false),[pipReady,setPipReady]=useState(false);
  useEffect(()=>{setPipReady(source?.kind==='file'&&!!document.pictureInPictureEnabled)},[source?.kind]);
  // Keep the panel on screen when it changes size or the window is resized.
  useEffect(()=>{
    const fit=()=>setPos(p=>{const box=panel.current?.getBoundingClientRect();return p&&box?clampTo(box,p.x,p.y):p});
    fit();window.addEventListener('resize',fit);return ()=>window.removeEventListener('resize',fit);
  },[large,minimised]);
  // Pause while minimised; an embedded player is unmounted instead and restarts when shown again.
  useEffect(()=>{const v=video.current;if(!v)return;if(minimised)v.pause();else v.play().catch(()=>{})},[minimised]);
  if(!source||hidden)return null;
  function down(e){if(e.button>0||e.target.closest('button'))return;const box=panel.current.getBoundingClientRect();drag.current={dx:e.clientX-box.left,dy:e.clientY-box.top};e.currentTarget.setPointerCapture(e.pointerId);setDragging(true)}
  function move(e){if(!drag.current)return;setPos(clampTo(panel.current.getBoundingClientRect(),e.clientX-drag.current.dx,e.clientY-drag.current.dy))}
  function up(){drag.current=null;setDragging(false)}
  function keys(e){const step=e.shiftKey?60:20,d={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[e.key];if(!d)return;e.preventDefault();const box=panel.current.getBoundingClientRect();setPos(clampTo(box,box.left+d[0],box.top+d[1]))}
  function toggleMute(){const v=video.current;if(!v)return;v.muted=!v.muted;setMuted(v.muted);if(!v.muted)v.play().catch(()=>{})}
  async function pip(){try{document.pictureInPictureElement?await document.exitPictureInPicture():await video.current?.requestPictureInPicture()}catch{}}
  const place=pos?{left:pos.x,top:pos.y,right:'auto',bottom:'auto'}:undefined;
  const bar=<div className="floating-video-bar" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={keys} tabIndex={0} aria-label="Move video. Drag, or use the arrow keys.">
    <Icon name="grip"/><span>{minimised?'Project video':name}</span>
    <div className="floating-video-actions">
      {!minimised&&source.kind==='file'&&<button type="button" onClick={toggleMute} aria-label={muted?'Unmute video':'Mute video'} title={muted?'Unmute':'Mute'}><Icon name={muted?'volumeOff':'volume'}/></button>}
      {!minimised&&pipReady&&<button type="button" onClick={pip} aria-label="Open in picture-in-picture window" title="Picture in picture"><Icon name="pip"/></button>}
      {!minimised&&<button type="button" onClick={()=>setLarge(v=>!v)} aria-label={large?'Make video smaller':'Make video larger'} title={large?'Smaller':'Larger'}><Icon name="maximize"/></button>}
      <button type="button" onClick={()=>setMinimised(v=>!v)} aria-label={minimised?'Show video':'Minimise video'} title={minimised?'Show':'Minimise'}><Icon name={minimised?'arrowUp':'minus'}/></button>
      <button type="button" onClick={()=>setHidden(true)} aria-label="Close video" title="Close"><Icon name="x"/></button>
    </div>
  </div>;
  return <section ref={panel} className={`floating-video${large?' is-large':''}${minimised?' is-minimised':''}${dragging?' is-dragging':''}`} style={place} aria-label={`${name} video`}>
    {bar}
    <div className="floating-video-frame" hidden={minimised}>
      {source.kind==='file'
        ?<video ref={video} src={source.src} autoPlay muted loop playsInline preload="metadata" onError={()=>setHidden(true)} onClick={toggleMute}/>
        :!minimised&&<iframe src={source.src} title={`${name} video`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>}
    </div>
  </section>;
}
