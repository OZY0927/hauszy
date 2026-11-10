'use client';
import {useId,useRef,useState} from 'react';
import Link from 'next/link';
import Icon from './Icon';
import CardPhoto from './ProjectCardPhoto';
import {listingName,startingPrice} from '../lib/project';
import {HOT_PROJECT_LIMIT} from '../lib/featured-projects';
import styles from './HotProjectsShowcase.module.css';

const number=value=>String(value).padStart(2,'0');

export default function HotProjectsShowcase({candidates=[],popular=false}){
 const projects=candidates.slice(0,HOT_PROJECT_LIMIT);
 const [selected,setSelected]=useState(0),[indexOpen,setIndexOpen]=useState(false);
 const gesture=useRef(null),suppressClick=useRef(false),indexButton=useRef(null),indexId=useId();
 const active=Math.min(selected,Math.max(0,projects.length-1)),project=projects[active],price=startingPrice(project);
 function select(index){setSelected(Math.max(0,Math.min(projects.length-1,index)))}
 function keyDown(event){
  if(event.target.closest('a,button'))return;
  const actions={ArrowRight:active+1,ArrowLeft:active-1,Home:0,End:projects.length-1};
  if(event.key in actions){event.preventDefault();select(actions[event.key])}
 }
 function pointerDown(event){
  if(event.button!==0||event.target.closest('a'))return;
  suppressClick.current=false;gesture.current={x:event.clientX,y:event.clientY};
 }
 function pointerMove(event){
  if(event.pointerType!=='mouse'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const box=event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--pointer-x',String((event.clientX-box.left)/box.width-.5));
  event.currentTarget.style.setProperty('--pointer-y',String((event.clientY-box.top)/box.height-.5));
 }
 function resetPointer(event){
  gesture.current=null;
  event.currentTarget.style.setProperty('--pointer-x','0');
  event.currentTarget.style.setProperty('--pointer-y','0');
 }
 function pointerUp(event){
  if(!gesture.current)return;
  const dx=event.clientX-gesture.current.x,dy=event.clientY-gesture.current.y;gesture.current=null;
  if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){suppressClick.current=true;select(active+(dx<0?1:-1))}
 }
 return <section id="hot-projects" className={styles.section} aria-labelledby="hot-projects-title">
  <header className={styles.header}>
   <div className={styles.wordmark}>HAUSZY<span>THE PROJECT COLLECTION</span></div>
   <h2 id="hot-projects-title">Hot projects<span> / {number(projects.length)}</span></h2>
   <button ref={indexButton} className={styles.indexToggle} type="button" aria-expanded={indexOpen} aria-controls={indexId} onClick={()=>setIndexOpen(!indexOpen)}>Index <Icon name={indexOpen?'minus':'plus'}/></button>
  </header>
  {indexOpen&&<ol id={indexId} className={styles.index} onKeyDown={event=>{if(event.key==='Escape'){setIndexOpen(false);indexButton.current?.focus()}}}>
   {projects.map((item,index)=><li key={item.id}><button type="button" aria-current={index===active?'true':undefined} onClick={()=>{select(index);setIndexOpen(false);indexButton.current?.focus()}}><span>{number(index+1)}</span>{listingName(item)}<Icon name="arrowUpRight"/></button></li>)}
   {!projects.length&&<li className={styles.indexEmpty}>New projects are on their way.</li>}
  </ol>}
  {project?<>
   <div className={styles.scene} role="region" aria-roledescription="carousel" aria-label="Hot projects. Use left and right arrow keys to browse." tabIndex={0} onKeyDown={keyDown} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={()=>{gesture.current=null}} onPointerLeave={resetPointer}>
    <div className={styles.projectInfo} key={project.id}>
     <span className={styles.eyebrow}>{popular?'POPULAR RIGHT NOW':'IN THE SPOTLIGHT'} / {number(active+1)}</span>
     <h3>{listingName(project)}</h3>
     <dl><div><dt>LOCATION</dt><dd>{project.location||'Penang'}</dd></div><div><dt>PROPERTY</dt><dd>{project.type||'Property'}</dd></div><div><dt>{price?price[0].toUpperCase():'PRICE'}</dt><dd>{price?price[1]:'Enquire for details'}</dd></div></dl>
     <Link href={'/projects/'+encodeURIComponent(project.id)} className={styles.view}>View project <Icon name="arrowUpRight"/></Link>
    </div>
    <div className={styles.orbit}>
     {projects.map((item,index)=>{
      const offset=index-active,isActive=offset===0;
      return <div key={item.id} className={styles.cardSlot} aria-hidden={!isActive} style={{'--offset':offset,'--distance':Math.abs(offset),zIndex:20-Math.abs(offset),visibility:Math.abs(offset)>2?'hidden':'visible'}}>
       <button type="button" tabIndex={isActive?0:-1} className={styles.card} aria-label={isActive?'Advance gallery':'Select '+listingName(item)} disabled={isActive&&active===projects.length-1} onClick={()=>{if(suppressClick.current){suppressClick.current=false;return}select(isActive?active+1:index)}}>
        <div className={styles.cardImage}><CardPhoto src={item.images?.[0]} alt={listingName(item)}/></div>
        <span className={styles.cardSheen}/>
        <span className={styles.cardCaption}>HAUSZY COLLECTION <span>PROJECT {number(index+1)} / PENANG</span></span>
        <span className={styles.cardTitle}>{listingName(item)}<small>{item.location}</small></span>

       </button>
      </div>;
     })}
    </div>
    <span className={styles.watermark} aria-hidden="true">Places to<br/>call your own.</span>
   </div>
   <div className={styles.bottom}>
    <p className={styles.note}>{popular?'The most-viewed projects.':'A selection of places to discover.'}<span>{popular?'Based on the last 30 days.':'Across Penang island & mainland.'}</span></p>
    <div className={styles.navigation}>
     <div className={styles.arrows}><button type="button" disabled={active===0} aria-label="Previous project" onClick={()=>select(active-1)}><Icon name="arrowLeft"/></button><span aria-live="polite" aria-atomic="true">{number(active+1)} <small>/ {number(projects.length)}</small><span className={styles.srOnly}>: {listingName(project)}</span></span><button type="button" disabled={active===projects.length-1} aria-label="Next project" onClick={()=>select(active+1)}><Icon name="arrowRight"/></button></div>
     <div className={styles.ticks} aria-label="Choose a project">{projects.map((item,index)=><button type="button" key={item.id} aria-label={'Show project '+number(index+1)+': '+listingName(item)} aria-current={index===active?'true':undefined} onClick={()=>select(index)}><span/></button>)}</div>
     <span className={styles.hint}>SWIPE OR USE THE ARROWS</span>
    </div>
    <Link href="/projects" className={styles.explore}>Explore more projects <Icon name="arrowUpRight"/></Link>
   </div>
  </>:<div className={styles.empty}><span className={styles.eyebrow}>THE NEXT CHAPTER</span><h3>Great places.<br/>New possibilities.</h3><p>Our project collection is coming soon.</p><Link href="/projects" className={styles.explore}>Explore more projects <Icon name="arrowUpRight"/></Link></div>}
 </section>;
}
