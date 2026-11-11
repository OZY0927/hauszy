'use client';
import {useEffect,useRef} from 'react';

// A native-scroll photo collage: the project stays readable without animation or JS.
export default function ProjectScrollIntroduction({photos=[],children}){
 const root=useRef(null),images=photos.filter(Boolean).slice(0,4);
 useEffect(()=>{
  const el=root.current,preference=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,observer;
  const update=()=>{
   frame=0;
   if(preference.matches)return;
   const rect=el.getBoundingClientRect();
   el.classList.toggle('is-journey-visible',rect.bottom>0&&rect.top<innerHeight);
   if(rect.bottom<0||rect.top>innerHeight)return;
   const progress=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight+rect.height)));
   el.style.setProperty('--journey-progress',progress.toFixed(4));
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  const configure=()=>{el.classList.toggle('journey-motion',!preference.matches);el.style.removeProperty('--journey-progress');schedule()};
  configure();
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
  preference.addEventListener('change',configure);
  if('ResizeObserver' in window){observer=new ResizeObserver(schedule);observer.observe(el)}
  return()=>{cancelAnimationFrame(frame);observer?.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);preference.removeEventListener('change',configure)};
 },[]);
 return <section ref={root} id="overview" className={'project-journey-intro project-story-intro project-story-section'+(images.length?' has-journey-photos':'')} aria-label="Project introduction">
  <div className="project-journey-content">{children}</div>
  {images.length>0&&<div className="project-journey-photos" aria-hidden="true">{images.map((src,index)=><figure key={index}><div className="project-journey-photo-float"><img src={src} alt="" loading="lazy" onError={event=>{event.currentTarget.onerror=null;if(!event.currentTarget.src.endsWith('/project-placeholder.svg'))event.currentTarget.src='/project-placeholder.svg'}}/></div></figure>)}</div>}
 </section>;
}
