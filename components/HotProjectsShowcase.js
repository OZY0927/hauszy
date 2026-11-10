'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import Icon from './Icon';
import CardPhoto from './ProjectCardPhoto';
import {listingName,startingPrice} from '../lib/project';
import {HOT_PROJECT_LIMIT} from '../lib/featured-projects';
import styles from './HotProjectsShowcase.module.css';

export default function HotProjectsShowcase({candidates=[],popular=false}){
 const projects=candidates.slice(0,HOT_PROJECT_LIMIT),root=useRef(null),rail=useRef(null);
 const [position,setPosition]=useState(0),[end,setEnd]=useState(false);
 useEffect(()=>{
  const section=root.current;
  if(!section||!window.IntersectionObserver)return;
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add(styles.visible);observer.unobserve(entry.target)}},{threshold:.12});
  section.querySelectorAll('[data-hot-reveal]').forEach(el=>observer.observe(el));
  return ()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  const track=rail.current;if(!track)return;
  const update=()=>{const max=track.scrollWidth-track.clientWidth;setPosition(max>0?track.scrollLeft/max:0);setEnd(track.scrollLeft>=max-4)};
  update();const observer=new ResizeObserver(update);observer.observe(track);
  track.addEventListener('scroll',update,{passive:true});return ()=>{observer.disconnect();track.removeEventListener('scroll',update)};
 },[candidates]);
 function move(direction){const track=rail.current;track?.scrollBy({left:direction*(track.firstElementChild?.getBoundingClientRect().width+24||track.clientWidth),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
 return <section id="hot-projects" ref={root} className={styles.section} aria-labelledby="hot-projects-title">
  <div className={styles.meta}><span><i/> THE HAUSZY EDIT</span><span>PENANG / ISLAND & MAINLAND</span></div>
  <div className={styles.heading} data-hot-reveal>
   <h2 id="hot-projects-title">Hot projects<span>Worth a closer look.</span></h2>
   <div className={styles.intro}><span className={styles.count}>{String(projects.length).padStart(2,'0')} <small>/ IN THE SPOTLIGHT</small></span><p>{popular?'The places catching everyone’s eye. Explore our most-viewed projects over the last 30 days.':'A fresh selection of Penang projects. Discover a place for your next chapter.'}</p></div>
  </div>
  {projects.length>0?<>
   <div className={styles.galleryTop}><span>{popular?'POPULAR RIGHT NOW':'PROJECTS TO DISCOVER'}</span><div className={styles.controls}><span>SCROLL TO EXPLORE</span><button type="button" onClick={()=>move(-1)} disabled={position<=.001} aria-label="Previous projects"><Icon name="arrowLeft"/></button><button type="button" onClick={()=>move(1)} disabled={end} aria-label="Next projects"><Icon name="arrowRight"/></button></div></div>
   <ol className={styles.rail} ref={rail} aria-label={popular?'Popular projects in order of views':'Featured projects'}>
    {projects.map((project,index)=>{const price=startingPrice(project);return <li key={project.id} className={styles.card} data-hot-reveal style={{'--delay':`${Math.min(index,3)*90}ms`}}>
     <Link href={'/projects/'+encodeURIComponent(project.id)} className={styles.link}>
      <div className={styles.photo}><CardPhoto src={project.images?.[0]} alt={listingName(project)}/><span className={styles.rank}>{String(index+1).padStart(2,'0')}</span><span className={styles.tag}>{project.type||'Property'}</span><span className={styles.open}><Icon name="arrowUpRight"/></span><span className={styles.photoNote}>DISCOVER THE PROJECT <Icon name="arrowUpRight"/></span></div>
      <div className={styles.details}><div><p>{project.location}</p><h3>{listingName(project)}</h3></div><span className={styles.price}>{price?<><small>{price[0]}</small>{price[1]}</>:'Discover more'}</span></div>
     </Link>
    </li>})}
   </ol>
   <div className={styles.progress} aria-hidden="true"><span style={{transform:`translateX(${position*300}%)`}}/></div>
  </>:<p className={styles.empty}>Your next discovery is on its way. Explore all available projects below.</p>}
  <div className={styles.footer}><p>A new address.<br/><span>A whole new perspective.</span></p><Link href="/projects" className={styles.explore}>Explore more projects <span><Icon name="arrowUpRight"/></span></Link></div>
 </section>;
}
