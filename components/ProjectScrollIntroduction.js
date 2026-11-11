'use client';
import {useEffect,useRef} from 'react';

// A native-scroll photo collage: the project stays readable without animation or JS.
export default function ProjectScrollIntroduction({name,location,photos=[]}){
 const root=useRef(null),images=photos.filter(Boolean).slice(0,4);
 useEffect(()=>{
  const el=root.current,preference=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,observer;
  const update=()=>{
   frame=0;
   if(preference.matches)return;
   const rect=el.getBoundingClientRect();
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
 if(!images.length)return null;
 return <section ref={root} className="project-journey-intro" aria-labelledby="project-journey-title">
  <div className="project-journey-copy"><span className="eyebrow">A CLOSER LOOK AT</span><h2 id="project-journey-title">{name}</h2>{location&&<p>{location}</p>}<span className="project-journey-footnote">THE SPACES. THE DETAILS. THE POSSIBILITIES.</span></div>
  <div className="project-journey-photos" aria-hidden="true">{images.map((src,index)=><figure key={index}><img src={src} alt="" loading="lazy" onError={event=>{event.currentTarget.src='/project-placeholder.svg'}}/><figcaption>{String(index+1).padStart(2,'0')} / {name}</figcaption></figure>)}</div>
 </section>;
}
