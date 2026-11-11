'use client';
import {useEffect,useRef} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

// Keep the scroll treatment local to the project opening, including its gallery controls.
export default function ProjectHeroScroll({enabled,children}){
 const root=useRef(null);
 useEffect(()=>{
  const el=root.current;if(!enabled||!el)return;
  gsap.registerPlugin(ScrollTrigger);
  const media=gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)',()=>{
   el.classList.add('is-scroll-hero');
   gsap.fromTo(el,{'--hero-scroll':0},{'--hero-scroll':1,ease:'none',scrollTrigger:{trigger:el,start:'top top',end:'bottom bottom',scrub:.65,invalidateOnRefresh:true}});
   return()=>el.classList.remove('is-scroll-hero');
  },el);
  return()=>media.revert();
 },[enabled]);
 return <div ref={root} className="project-hero-scroll">{children}</div>;
}
