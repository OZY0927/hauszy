'use client';
import {useEffect,useId,useRef,useState} from 'react';
import Link from 'next/link';
import Icon from './Icon';
import {SHOWCASE_CONFIG,COMPACT_QUERY} from '../lib/card-showcase/config';
import {buildLayout,frame,textVisible} from '../lib/card-showcase/layout';
import {clamp} from '../lib/card-showcase/math';
import {createRenderer,loadImage} from '../lib/card-showcase/renderer';

// A pinned, scroll-driven scene: a 3D ring of photo cards unfolds into a tilted wall, which then
// slides to one side for the text. cards: [{id,src,sources?,alt,title?,category?,href?}].
// Without WebGL, with reduced motion, or before scripts run, it is a still wall beside the same text.
export default function CardShowcase({cards,label,heading,copy,cta,children,config=SHOWCASE_CONFIG}){
 const section=useRef(null),stage=useRef(null),canvas=useRef(null),panel=useRef(null),titleId=useId();
 const [compact,setCompact]=useState(null),[still,setStill]=useState(false),[live,setLive]=useState(false);

 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){setStill(true);return}
  const small=matchMedia(COMPACT_QUERY),sync=()=>setCompact(small.matches);
  sync();small.addEventListener('change',sync);
  return()=>small.removeEventListener('change',sync);
 },[]);

 useEffect(()=>{
  if(still||compact===null||!cards.length)return;
  const cfg=compact?config.compact:config.desktop,root=section.current,box=stage.current,el=canvas.current,text=panel.current;
  const renderer=createRenderer(el,{segments:cfg.segments});
  if(!renderer){setStill(true);return}
  const layout=buildLayout(cfg,cards.length);
  let raf=0,last=0,current=-1,drawn=-1,travel=1,width=1,height=1,active=false,ready=false,shown=false,disposed=false;
  setLive(true);

  const measure=()=>{
   const dpr=Math.min(window.devicePixelRatio||1,cfg.maxDpr);
   width=Math.max(1,Math.round(box.clientWidth*dpr));height=Math.max(1,Math.round(box.clientHeight*dpr));
   travel=Math.max(1,root.offsetHeight-box.offsetHeight);
   renderer.resize(width,height);drawn=-1;
  };
  // The one clock: scroll only wakes it. It reads progress once a frame, eases toward it without
  // overshoot, draws, and parks as soon as the scene has caught up.
  const tick=now=>{
   raf=0;
   const target=clamp(-root.getBoundingClientRect().top/travel),dt=last?Math.min(.1,(now-last)/1000):1/60;
   last=now;
   if(current<0)current=target;
   else{current+=(target-current)*(1-Math.exp(-dt/cfg.smoothing));if(Math.abs(target-current)<1e-4)current=target}
   const visible=textVisible(cfg,current,shown);
   if(visible!==shown){shown=visible;text.toggleAttribute('data-revealed',visible)}
   if(ready&&current!==drawn){renderer.render(frame(layout,cfg,current,width/height),{fov:cfg.fov,card:cfg.card,optics:cfg.optics});drawn=current}
   if(current!==target||(ready&&drawn!==current))raf=requestAnimationFrame(tick);else last=0;
  };
  const wake=()=>{if(!raf&&!disposed)raf=requestAnimationFrame(tick)};
  const scroll=()=>{if(active)wake()};
  const lost=()=>setStill(true);

  measure();
  const resize=new ResizeObserver(()=>{measure();wake()});resize.observe(box);resize.observe(root);
  const view=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;if(active)wake()},{rootMargin:'200px 0px'});view.observe(root);
  window.addEventListener('scroll',scroll,{passive:true});el.addEventListener('webglcontextlost',lost);
  // Show the ring only once its photos are on the cards; any that fail become plain sand cards.
  Promise.all(cards.map(card=>loadImage(card.sources||[card.src]))).then(images=>{
   if(disposed)return;
   renderer.setImages(images,cfg.textureSize,cfg.card.aspect);
   ready=true;drawn=-1;el.setAttribute('data-ready','');wake();
  });
  wake();

  return()=>{
   disposed=true;cancelAnimationFrame(raf);resize.disconnect();view.disconnect();
   window.removeEventListener('scroll',scroll);el.removeEventListener('webglcontextlost',lost);
   renderer.dispose();el.removeAttribute('data-ready');text.removeAttribute('data-revealed');setLive(false);
  };
 },[still,compact,cards,config]);

 const lines=Array.isArray(heading)?heading:[heading];
 return <section ref={section} className={'cs'+(still?' is-still':'')+(live?' is-live':'')} aria-labelledby={titleId} style={{'--cs-scroll':config.desktop.scroll,'--cs-scroll-compact':config.compact.scroll}}>
  <div ref={stage} className="cs-stage">
   {!live&&<div className="cs-wall" aria-hidden="true"><div className="cs-wall-plane">{cards.slice(0,12).map((card,i)=><img key={card.id+'-'+i} src={card.src} alt="" loading="lazy" decoding="async" onError={e=>{e.currentTarget.style.visibility='hidden'}}/>)}</div></div>}
   <canvas ref={canvas} className="cs-canvas" aria-hidden="true"/>
   <div ref={panel} className="cs-panel">
    {label&&<span className="cs-label" style={{'--d':0}}>{label}</span>}
    <h2 id={titleId} className="cs-title" style={{'--d':1}}>{lines.map((line,i)=><span className="cs-line" key={i}><span style={{'--l':i}}>{line}</span>{i<lines.length-1?' ':''}</span>)}</h2>
    {copy&&<p className="cs-copy" style={{'--d':3}}>{copy}</p>}
    {cta&&<Link className="cs-cta" href={cta.href} style={{'--d':4}}>{cta.label}<Icon name="arrowRight"/></Link>}
    {children&&<div className="cs-extra" style={{'--d':5}}>{children}</div>}
   </div>
  </div>
 </section>;
}
