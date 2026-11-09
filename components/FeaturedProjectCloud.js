'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import CollectionCard from './CollectionCard';
import TiltCard from './TiltCard';
import Icon from './Icon';
import {sampleProjects} from '../lib/featured-projects';

const ANGLES=[-9,7,-6,9,8,-7,6,-9];
export default function FeaturedProjectCloud({candidates}){
 const section=useRef(null),stage=useRef(null);
 const [projects,setProjects]=useState(()=>candidates.slice(0,8));
 useEffect(()=>setProjects(sampleProjects(candidates)),[candidates]);
 useEffect(()=>{
  if(!projects.length)return;
  const root=section.current,scene=stage.current,reduced=matchMedia('(prefers-reduced-motion: reduce)'),small=matchMedia('(max-width: 800px)');
  let frame=0;
  const update=()=>{
   frame=0;
   const rect=root.getBoundingClientRect(),travel=root.offsetHeight-scene.offsetHeight;
   const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,travel)));
   scene.querySelectorAll('.project-cloud-item').forEach((card,index)=>{
    let t=reduced.matches?1:small.matches?Math.max(0,Math.min(1,(innerHeight-card.getBoundingClientRect().top)/(innerHeight*.45))):Math.max(0,Math.min(1,progress*1.9-index*.085));
    const ease=1-Math.pow(1-t,3),angle=ANGLES[index]||0;
    card.style.setProperty('--cloud-opacity',Math.min(1,t*2));
    card.style.setProperty('--cloud-transform',small.matches||reduced.matches?`translateY(${(1-ease)*24}px) scale(${.96+.04*ease})`:`translate3d(0,${(1-ease)*(130+index*12)}px,${-420*(1-ease)}px) rotateX(${12*(1-ease)}deg) rotateY(${(index%2?1:-1)*30*(1-ease)}deg) rotateZ(${angle*(1-.2*ease)}deg) scale(${.6+.4*ease})`);

   });
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  update();root.classList.add('cloud-motion');
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',schedule);small.addEventListener('change',schedule);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);reduced.removeEventListener('change',schedule);small.removeEventListener('change',schedule)};
 },[projects]);
 if(!projects.length)return null;
 return <section ref={section} className="project-cloud" aria-label="Project spotlight">
  <div ref={stage} className="project-cloud-stage">
   <div className="project-cloud-heading"><Link href="/projects">Explore all projects <Icon name="arrowUpRight"/></Link></div>
   <div className="project-cloud-cards">{projects.map((project,index)=><div className={'project-cloud-item cloud-place-'+index} key={project.id}><TiltCard><CollectionCard project={project} titleOnly/></TiltCard></div>)}</div>
  </div>
 </section>;
}
