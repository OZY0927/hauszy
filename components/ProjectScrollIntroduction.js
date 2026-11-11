'use client';
import {useEffect,useRef} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

// ScrollTrigger scrubs the native sticky scene and its painted color wipe.
export default function ProjectScrollIntroduction({photos=[],children}){
 const root=useRef(null),images=photos.filter(Boolean).slice(0,6);
 useEffect(()=>{
  gsap.registerPlugin(ScrollTrigger);
  const el=root.current,media=gsap.matchMedia();
  media.add('(min-width: 801px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)',()=>{
   el.classList.add('journey-motion');
   const timeline=gsap.timeline({scrollTrigger:{trigger:el,start:'top top',end:'bottom bottom',scrub:.7,invalidateOnRefresh:true,onToggle:self=>el.classList.toggle('is-journey-visible',self.isActive)}});
   timeline.fromTo(el,{'--journey-progress':0},{'--journey-progress':1,duration:1,ease:'none'},0);
   timeline.fromTo(el,{'--journey-wipe':0},{'--journey-wipe':1,duration:.44,ease:'none'},.06);
   return()=>el.classList.remove('journey-motion','is-journey-visible');
  },el);
  return()=>media.revert();
 },[]);
 return <section ref={root} id="overview" className={'project-journey-intro project-story-intro project-story-section'+(images.length?' has-journey-photos':'')} aria-label="Project introduction">
  <div className="project-journey-stage">
  <div className="project-journey-paint" aria-hidden="true"/>
  <div className="project-journey-content">{children}</div>
  {images.length>0&&<div className="project-journey-photos" aria-hidden="true">{images.map((src,index)=><figure key={index}><div className="project-journey-photo-float"><img src={src} alt="" loading="lazy" onError={event=>{event.currentTarget.onerror=null;if(!event.currentTarget.src.endsWith('/project-placeholder.svg'))event.currentTarget.src='/project-placeholder.svg'}}/></div></figure>)}</div>}
  </div>
 </section>;
}
