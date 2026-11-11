'use client';
import {useEffect,useRef} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import PreviewImage from './PreviewImage';

// ScrollTrigger scrubs the native sticky scene and its painted color wipe.
export default function ProjectScrollIntroduction({photos=[],children}){
 const root=useRef(null),images=photos.filter(Boolean).slice(0,6);
 useEffect(()=>{
  gsap.registerPlugin(ScrollTrigger);
  const el=root.current,media=gsap.matchMedia();
  media.add('(min-width: 801px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)',()=>{
   el.classList.add('journey-motion');
   const stage=el.querySelector('.project-journey-stage');
   // A second, inaccessible ink layer uses the exact same mask and coordinates
   // as the paint. Text changes only where the moving paint actually covers it.
   const colorLayer=document.createElement('div');
   colorLayer.className='project-journey-color-layer';colorLayer.setAttribute('aria-hidden','true');colorLayer.inert=true;
   const copy=el.querySelector('.project-journey-content').cloneNode(true);
   copy.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
   colorLayer.append(copy);stage.append(colorLayer);
   const measure=()=>{el.style.setProperty('--journey-stage-height',stage.clientHeight+'px');el.style.setProperty('--journey-stage-width',stage.clientWidth+'px')};
   measure();
   // Both masks share one phase so the moving wave and text stay pixel-aligned.
   const wave=gsap.fromTo(el,{'--journey-wave-phase':0},{'--journey-wave-phase':-2,duration:14,repeat:-1,ease:'none',paused:true});
   const timeline=gsap.timeline({scrollTrigger:{trigger:el,start:'top top',end:'bottom bottom',scrub:.7,invalidateOnRefresh:true,onRefresh:measure,onToggle:self=>{el.classList.toggle('is-journey-visible',self.isActive);wave.paused(!self.isActive)}}});
   wave.paused(!timeline.scrollTrigger.isActive);
   timeline.fromTo(el,{'--journey-progress':0},{'--journey-progress':1,duration:1,ease:'none'},0);
   timeline.fromTo(el,{'--journey-wipe':0},{'--journey-wipe':1,duration:.44,ease:'none'},.06);
   return()=>{colorLayer.remove();el.style.removeProperty('--journey-stage-height');el.style.removeProperty('--journey-stage-width');el.classList.remove('journey-motion','is-journey-visible')};
  },el);
  return()=>media.revert();
 },[]);
 return <section ref={root} id="overview" className={'project-journey-intro project-story-intro project-story-section'+(images.length?' has-journey-photos':'')} aria-label="Project introduction">
  <div className="project-journey-stage">
  <div className="project-journey-paint" aria-hidden="true"/>
  <div className="project-journey-content">{children}</div>
  {images.length>0&&<div className="project-journey-photos" aria-hidden="true">{images.map(src=><figure key={src}><div className="project-journey-photo-float"><PreviewImage src={src} alt="" loading="lazy" decoding="async" onError={event=>{const image=event?.currentTarget;if(image&&!image.src.endsWith('/project-placeholder.svg'))image.src='/project-placeholder.svg'}}/></div></figure>)}</div>}
  </div>
 </section>;
}
