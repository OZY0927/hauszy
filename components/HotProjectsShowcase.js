'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import Icon from './Icon';
import CardPhoto from './ProjectCardPhoto';
import {listingName,startingPrice} from '../lib/project';
import {HOT_PROJECT_LIMIT} from '../lib/featured-projects';
import styles from './HotProjectsShowcase.module.css';

const number=value=>String(value).padStart(2,'0');
const clamp=value=>Math.max(0,Math.min(1,value));

export default function HotProjectsShowcase({candidates=[],popular=false}){
 const projects=candidates.slice(0,HOT_PROJECT_LIMIT),track=useRef(null);
 const [active,setActive]=useState(0),[finished,setFinished]=useState(false),[reduced,setReduced]=useState(false);
 const project=projects[Math.min(active,projects.length-1)],price=startingPrice(project);
 useEffect(()=>{
  if(!projects.length)return;
  const section=track.current,media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const cards=[...section.querySelectorAll('[data-project-card]')];
  let frame=0;
  function update(){
   frame=0;setReduced(media.matches);
   const box=section.getBoundingClientRect(),top=window.innerWidth<=800?80:100;
   const progress=clamp((top-box.top)/Math.max(1,box.height-(window.innerHeight-top)));
   const spread=clamp(progress/.13),cursor=clamp((progress-.13)/.70)*(projects.length-1),ending=clamp((progress-.84)/.10);
   setActive(Math.round(cursor));setFinished(ending>.45);
   section.style.setProperty('--ending',String(ending));
   section.style.setProperty('--progress',String(progress));
   for(let index=0;index<cards.length;index++){
    const offset=index-cursor,distance=Math.abs(offset),stack=index;
    const x=(1-spread)*stack*3+spread*offset*(window.innerWidth<=800?108:106);
    // Blend a shallow deck into the same tilted gallery, then let the last card recede.
    cards[index].style.transform='translateX('+x+'%) translateY('+((1-spread)*stack*-1.2+spread*distance*5-ending*8)+'%) translateZ('+(-spread*distance*100-ending*180)+'px) rotateY('+(-8-spread*offset*10)+'deg) rotateZ('+((1-spread)*stack*1.6-4+spread*offset*6)+'deg) scale('+(1-ending*.12)+')';
    cards[index].style.opacity=String(Math.max(0,1-spread*distance*.18)*(1-ending));
    cards[index].style.zIndex=String(30-Math.round(spread?distance:stack));
   }
  }
  const request=()=>{if(!frame)frame=requestAnimationFrame(update)};
  update();window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request);media.addEventListener('change',request);
  return ()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',request);window.removeEventListener('resize',request);media.removeEventListener('change',request)};
 },[projects.length]);
 return <section id="hot-projects" ref={track} className={styles.track} style={{'--steps':projects.length}} aria-labelledby="hot-projects-title">
  <div className={styles.section}>
   <header className={styles.header}><div className={styles.wordmark}>HAUSZY<span>THE PROJECT COLLECTION</span></div><h2 id="hot-projects-title">Hot projects<span> / {number(projects.length)}</span></h2><span className={styles.scrollLabel}>SCROLL TO DISCOVER <Icon name="arrowDown"/></span></header>
   {project?<>
    <div className={styles.scene}>
     <div className={styles.projectInfo} key={project.id}>
      <span className={styles.eyebrow}>{popular?'POPULAR RIGHT NOW':'IN THE SPOTLIGHT'} / {number(active+1)}</span>
      <h3>{listingName(project)}</h3>
      <dl><div><dt>LOCATION</dt><dd>{project.location||'Penang'}</dd></div><div><dt>PROPERTY</dt><dd>{project.type||'Property'}</dd></div><div><dt>{price?price[0].toUpperCase():'PRICE'}</dt><dd>{price?price[1]:'Enquire for details'}</dd></div></dl>
      <Link href={'/projects/'+encodeURIComponent(project.id)} className={styles.view} tabIndex={finished?-1:undefined}>View project <Icon name="arrowUpRight"/></Link>
     </div>
     <div className={styles.orbit}>{projects.map((item,index)=><div key={item.id} data-project-card className={styles.cardSlot} aria-hidden={!reduced&&(index!==active||finished)} style={{zIndex:30-index}}>
      <Link href={'/projects/'+encodeURIComponent(item.id)} tabIndex={reduced||index===active&&!finished?0:-1} className={styles.card}>
       <div className={styles.cardImage}><CardPhoto src={item.images?.[0]} alt={listingName(item)}/></div><span className={styles.cardSheen}/>
       <span className={styles.cardCaption}>HAUSZY COLLECTION <span>PROJECT {number(index+1)} / PENANG</span></span>
       <span className={styles.cardTitle}>{listingName(item)}<small>{item.location}</small></span>
      </Link>
     </div>)}</div>
     <span className={styles.watermark} aria-hidden="true">Places to<br/>call your own.</span>
     <div className={styles.finale} aria-hidden={!finished&&!reduced}><span className={styles.eyebrow}>YOUR NEXT CHAPTER STARTS HERE</span><p>Find a place<br/>that feels like you.</p><Link href="/projects" className={styles.bigExplore} tabIndex={finished||reduced?0:-1}>Explore more projects <span><Icon name="arrowUpRight"/></span></Link></div>
    </div>
    <div className={styles.bottom}><p className={styles.note}>{popular?'The most-viewed projects.':'A selection of places to discover.'}<span>{popular?'Based on the last 30 days.':'Across Penang island & mainland.'}</span></p><span className={styles.counter}>{number(active+1)} <small>/ {number(projects.length)}</small></span><span className={styles.scrollLabel}>{finished?'KEEP EXPLORING':'KEEP SCROLLING'} <Icon name="arrowDown"/></span></div>
    <div className={styles.scrollProgress} aria-hidden="true"><span/></div>
   </>:<div className={styles.empty}><span className={styles.eyebrow}>THE NEXT CHAPTER</span><h3>Great places.<br/>New possibilities.</h3><p>Our project collection is coming soon.</p><Link href="/projects" className={styles.bigExplore}>Explore more projects <Icon name="arrowUpRight"/></Link></div>}
  </div>
 </section>;
}
