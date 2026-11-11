'use client';
import {useEffect,useRef} from 'react';

// Keep the scroll treatment local to the project opening, including its gallery controls.
export default function ProjectHeroScroll({enabled,children}){
 const root=useRef(null);
 useEffect(()=>{
  const el=root.current;
  if(!enabled||!el)return;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,observer;
  const update=()=>{
   frame=0;
   const rect=el.getBoundingClientRect();
   const stage=el.firstElementChild;
   const distance=el.offsetHeight-stage.offsetHeight;
   const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,distance)));
   el.style.setProperty('--hero-scroll',progress.toFixed(4));
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  const configure=()=>{
   cancelAnimationFrame(frame);frame=0;
   el.classList.toggle('is-scroll-hero',!preference.matches);
   el.style.removeProperty('--hero-scroll');
   if(!preference.matches)update();
  };
  configure();
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  preference.addEventListener('change',configure);
  if('ResizeObserver' in window){observer=new ResizeObserver(schedule);observer.observe(el)}
  return()=>{
   cancelAnimationFrame(frame);observer?.disconnect();
   window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);
   preference.removeEventListener('change',configure);
   el.classList.remove('is-scroll-hero');el.style.removeProperty('--hero-scroll');
  };
 },[enabled]);
 return <div ref={root} className="project-hero-scroll">{children}</div>;
}
