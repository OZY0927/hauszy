'use client';
import {useEffect,useRef} from 'react';

// Native sticky scene: paper opening, painted color wipe, floating photos, then facts.
export default function ProjectScrollIntroduction({photos=[],children}){
 const root=useRef(null),images=photos.filter(Boolean).slice(0,6);
 useEffect(()=>{
  const el=root.current,preference=matchMedia('(min-width: 801px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)');
  const stage=el.querySelector('.project-journey-stage'),intro=el.querySelector('.project-story-intro-main'),facts=el.querySelector('.project-overview-panel');
  el.classList.toggle('has-journey-facts',!!facts);
  let frame=0,observer;
  const update=()=>{
   frame=0;
   if(!preference.matches)return;
   const rect=el.getBoundingClientRect();
   el.classList.toggle('is-journey-visible',rect.bottom>0&&rect.top<innerHeight);
   if(rect.bottom<0||rect.top>innerHeight)return;
   const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,el.offsetHeight-stage.offsetHeight)));
   el.style.setProperty('--journey-progress',progress.toFixed(4));
   const phase=(start,end)=>Math.max(0,Math.min(1,(progress-start)/(end-start)));
   el.style.setProperty('--journey-wipe',phase(.06,.5).toFixed(4));
   el.style.setProperty('--journey-exit',phase(.62,.78).toFixed(4));
   el.style.setProperty('--journey-facts',phase(.74,.9).toFixed(4));
   if(intro)intro.inert=!!facts&&progress>.73;
   if(facts)facts.inert=progress<.79;
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  const configure=()=>{el.classList.toggle('journey-motion',preference.matches);for(const key of ['progress','wipe','exit','facts'])el.style.removeProperty('--journey-'+key);if(intro)intro.inert=false;if(facts)facts.inert=preference.matches;schedule()};
  configure();
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
  preference.addEventListener('change',configure);
  if('ResizeObserver' in window){observer=new ResizeObserver(schedule);observer.observe(el)}
  return()=>{cancelAnimationFrame(frame);observer?.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);preference.removeEventListener('change',configure)};
 },[]);
 return <section ref={root} id="overview" className={'project-journey-intro project-story-intro project-story-section'+(images.length?' has-journey-photos':'')} aria-label="Project introduction">
  <div className="project-journey-stage">
  <div className="project-journey-paint" aria-hidden="true"/>
  <div className="project-journey-content">{children}</div>
  {images.length>0&&<div className="project-journey-photos" aria-hidden="true">{images.map((src,index)=><figure key={index}><div className="project-journey-photo-float"><img src={src} alt="" loading="lazy" onError={event=>{event.currentTarget.onerror=null;if(!event.currentTarget.src.endsWith('/project-placeholder.svg'))event.currentTarget.src='/project-placeholder.svg'}}/></div></figure>)}</div>}
  </div>
 </section>;
}
