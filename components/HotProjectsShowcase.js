'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import Icon from './Icon';
import CardPhoto from './ProjectCardPhoto';
import {listingName} from '../lib/project';
import {HOT_PROJECT_LIMIT} from '../lib/featured-projects';
import styles from './HotProjectsShowcase.module.css';

const number=value=>String(value).padStart(2,'0');
const clamp=value=>Math.max(0,Math.min(1,value));

export default function HotProjectsShowcase({candidates=[],popular=false}){
 const projects=candidates.slice(0,HOT_PROJECT_LIMIT),track=useRef(null);
 const [active,setActive]=useState(0),[finished,setFinished]=useState(false),[reduced,setReduced]=useState(false);
 const project=projects[Math.min(active,projects.length-1)];
 useEffect(()=>{
  if(!projects.length)return;
  const section=track.current,media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const cards=[...section.querySelectorAll('[data-project-card]')],scene=section.querySelector('[data-project-scene]');
  const visibility=new IntersectionObserver(([entry])=>{section.dataset.inView=String(entry.isIntersecting)});
  visibility.observe(section);
  let frame=0,lastTime=0,renderedProgress;
  // A short, time-based follow keeps wheel steps fluid at both 60 Hz and 120 Hz.
  function update(time=performance.now()){
   frame=0;setReduced(media.matches);
   const box=section.getBoundingClientRect(),top=window.innerWidth<=800?80:100;
   const target=clamp((top-box.top)/Math.max(1,box.height-(window.innerHeight-top)));
   const elapsed=Math.min(64,Math.max(1,time-lastTime||16));lastTime=time;
   if(renderedProgress===undefined||media.matches||box.bottom<top||box.top>window.innerHeight)renderedProgress=target;
   else renderedProgress+=(target-renderedProgress)*(1-Math.exp(-elapsed/75));
   if(Math.abs(target-renderedProgress)<.00005)renderedProgress=target;
   const progress=renderedProgress;
   const mobile=window.innerWidth<=800,sceneBox=scene.getBoundingClientRect();
   // Quintic easing has zero velocity and acceleration at each stage boundary.
   const smooth=value=>value*value*value*(value*(value*6-15)+10);
   const spread=smooth(clamp(progress/.14)),cursor=smooth(clamp((progress-.14)/.60))*(projects.length-1),ending=clamp((progress-.76)/.20);
   setActive(Math.round(cursor));setFinished(ending>.65);
   const width=cards[0].offsetWidth,height=cards[0].offsetHeight;
   const columns=Math.min(mobile?4:3,projects.length),rows=Math.ceil(projects.length/columns);
   const scale=mobile?sceneBox.width*.96/columns/width:Math.max(sceneBox.width*.66/columns/width,sceneBox.height*1.12/rows/height);
   section.style.setProperty('--ending',String(smooth(ending)));
   section.style.setProperty('--intro',String(1-spread));
   section.style.setProperty('--progress',String(progress));
   for(let index=0;index<cards.length;index++){
    const offset=index-cursor,distance=Math.abs(offset),stack=index;
    const grid=smooth(clamp((progress-.76-index*.007)/.13));
    const galleryX=(1-spread)*((mobile?0:sceneBox.width*.20)+stack*3)+spread*offset*width*1.06;
    const galleryY=(1-spread)*((mobile?sceneBox.height*.15:0)-stack*3)+spread*distance*height*.05;
    // Stable pseudo-random offsets keep the collage repeatable when scrolling backward.
    const jitter=Math.sin(index*17.17+2),size=.94+Math.sin(index*7.31)*.15;
    const gridX=sceneBox.width*(mobile?0:-.21)+(index%columns-(columns-1)/2)*width*scale*.94+jitter*width*scale*.14;
    const gridY=sceneBox.height*(mobile?-.25:0)+(Math.floor(index/columns)-(rows-1)/2)*height*scale*.88+Math.cos(index*9.7)*height*scale*.20;
    cards[index].style.setProperty('--grid',String(grid));
    cards[index].style.transform='translate3d('+(galleryX*(1-grid)+gridX*grid)+'px,'+(galleryY*(1-grid)+gridY*grid)+'px,'+(-spread*distance*100*(1-grid))+'px) rotateY('+((-8-spread*offset*10)*(1-grid))+'deg) rotateZ('+(((1-spread)*stack*1.4-4+spread*offset*6)*(1-grid)+jitter*9*grid)+'deg) scale('+(1-grid+scale*size*grid)+')';
    cards[index].style.opacity=String(Math.max(0,1-spread*distance*.18)*(1-grid)+grid);
    cards[index].style.zIndex=String(30-Math.round(spread?distance:stack));
   }
   if(renderedProgress!==target)frame=requestAnimationFrame(update);
  }
  const request=()=>{if(!frame){lastTime=performance.now();frame=requestAnimationFrame(update)}};
  update();window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request);media.addEventListener('change',request);
  return ()=>{visibility.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',request);window.removeEventListener('resize',request);media.removeEventListener('change',request)};
 },[projects.length]);
 function tiltCard(event){
  if(event.pointerType!=='mouse'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  // Measure the scroll-positioned wrapper so tilting the link does not move its own input bounds.
  const card=event.currentTarget,box=card.parentElement.getBoundingClientRect();
  const x=clamp((event.clientX-box.left)/box.width),y=clamp((event.clientY-box.top)/box.height);
  card.style.setProperty('--pointer-x',String(x-.5));
  card.style.setProperty('--pointer-y',String(y-.5));
  card.style.setProperty('--shine-x',x*100+'%');
  card.style.setProperty('--shine-y',y*100+'%');
 }
 function resetTilt(event){
  const card=event.currentTarget;
  for(const property of ['--pointer-x','--pointer-y','--shine-x','--shine-y'])card.style.removeProperty(property);
 } return <section id="hot-projects" ref={track} className={styles.track} data-finale={finished} style={{'--steps':projects.length}} aria-labelledby="hot-projects-title">
  <div className={styles.section}>
   <h2 id="hot-projects-title" className={styles.srOnly}>Hot projects</h2>
   {project?<>
    <div className={styles.scene} data-project-scene>
     <div className={styles.intro}><span className={styles.eyebrow}>THE HAUSZY COLLECTION</span><h2>Hot projects.<br/><span>Your next chapter.</span></h2><p>Discover standout places across Penang. A new perspective, one project at a time.</p><span className={styles.scrollLabel}>SCROLL TO EXPLORE <Icon name="arrowDown"/></span></div>
     <div className={styles.orbit}>{projects.map((item,index)=><div key={item.id} data-project-card className={styles.cardSlot} aria-hidden={!reduced&&!finished&&index!==active} style={{zIndex:30-index}}>
      <div className={styles.cardDrift} style={{'--drift-x':`${Math.sin(index*3.7)*50}px`,'--drift-y':`${index%2?-110:110}px`,'--drift-angle':`${index%2?3:-3}deg`,'--drift-duration':`${16+index%5*2}s`,'--drift-delay':`${-index*2.3}s`}}>
      <Link href={'/projects/'+encodeURIComponent(item.id)} tabIndex={reduced||finished||index===active?0:-1} className={styles.card} onPointerMove={tiltCard} onPointerLeave={resetTilt} onPointerCancel={resetTilt} onBlur={resetTilt}>
       <div className={styles.cardImage}><CardPhoto src={item.images?.[0]} alt={listingName(item)}/></div><span className={styles.cardSheen}/>
       <span className={styles.cardCaption}>HAUSZY COLLECTION <span>PROJECT {number(index+1)} / PENANG</span></span>
       <span className={styles.cardTitle}>{listingName(item)}<small>{item.location}</small></span>
      </Link>
      </div>
     </div>)}</div>

     <div className={styles.finale} aria-hidden={!finished&&!reduced}><span className={styles.eyebrow}>YOUR NEXT CHAPTER STARTS HERE</span><p>Find a place<br/>that feels like you.</p><Link href="/projects" className={styles.bigExplore} tabIndex={finished||reduced?0:-1}>Explore more projects <span><Icon name="arrowUpRight"/></span></Link></div>
    </div>
    <div className={styles.bottom}><p className={styles.note}>{popular?'The most-viewed projects.':'A selection of places to discover.'}<span>{popular?'Based on the last 30 days.':'Across Penang island & mainland.'}</span></p><span className={styles.counter}>{number(active+1)} <small>/ {number(projects.length)}</small></span><span className={styles.scrollLabel}>{finished?'KEEP EXPLORING':'KEEP SCROLLING'} <Icon name="arrowDown"/></span></div>
    <div className={styles.scrollProgress} aria-hidden="true"><span/></div>
   </>:<div className={styles.empty}><span className={styles.eyebrow}>THE NEXT CHAPTER</span><h3>Great places.<br/>New possibilities.</h3><p>Our project collection is coming soon.</p><Link href="/projects" className={styles.bigExplore}>Explore more projects <Icon name="arrowUpRight"/></Link></div>}
  </div>
 </section>;
}
