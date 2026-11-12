'use client';
import {useEffect,useRef,useState} from 'react';
import {motion,useReducedMotion,useScroll,useSpring,useTransform,useMotionValueEvent} from 'motion/react';
import Icon from './Icon';
import styles from './ui/split-detail-roll.module.css';

const wrap=(value,count)=>(value%count+count)%count;
export default function ProjectDetailsCards({facts}){
 const [position,setPosition]=useState(0);
 const scrollRef=useRef(null);
 const dialogRef=useRef(null);
 const [dialogOpen,setDialogOpen]=useState(false);
 useEffect(()=>{if(!dialogOpen)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}},[dialogOpen]);
 const reduced=useReducedMotion();
 const {scrollYProgress}=useScroll({target:scrollRef,offset:['start 80px','end end']});
 const target=useTransform(scrollYProgress,value=>Math.min(Math.max(0,facts.length-1),Math.max(0,value*facts.length)));
 // Small resting zones at each matching pair make both columns lock together.
 const magnetic=useTransform(target,value=>{
  const start=Math.floor(value),fraction=value-start;
  const t=Math.min(1,Math.max(0,(fraction-.28)/.44));
  return start+t*t*(3-2*t);
 });
 const smooth=useSpring(magnetic,{stiffness:280,damping:34,mass:.4});
 const progress=reduced?target:smooth;
 useMotionValueEvent(progress,'change',value=>{
  const next=Math.round(value);
  setPosition(previous=>previous===next?previous:next);
 });
 if(!facts.length)return null;
 const current=wrap(position,facts.length);
 const go=direction=>window.scrollBy({top:direction*360,behavior:reduced?'instant':'smooth'});
 const slots=Array.from({length:Math.min(5,facts.length)},(_,index)=>index-Math.floor(Math.min(5,facts.length)/2));
 return <><dl className={styles.mobileDetails} aria-label="Project specifications">{facts.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div ref={scrollRef} className={styles.journey} style={{height:`calc(100svh + ${facts.length*360}px)`}}><div className={styles.root}>
  <div className={styles.scrollViewport} role="region" aria-roledescription="carousel" aria-label="Project specifications" tabIndex={0} onKeyDown={event=>{if(event.key==='ArrowDown'||event.key==='ArrowRight'){event.preventDefault();go(1)}if(event.key==='ArrowUp'||event.key==='ArrowLeft'){event.preventDefault();go(-1)}}}>
   <div className={styles.stage}>
   <div className={styles.labelWheel}>
    <small className={styles.labelCounter}>PROJECT DETAIL {String(current+1).padStart(2,'0')} / {String(facts.length).padStart(2,'0')}</small>
    {slots.map(offset=>{const absolute=position+offset,index=wrap(absolute,facts.length);return <RollItem key={absolute} absolute={absolute} progress={progress} side="label" active={offset===0} reduced={reduced}><h3>{facts[index][0]}</h3>{offset!==0&&<small>{offset<0?'Previous detail':'Next detail'}</small>}</RollItem>})}
   </div>
   <div className={styles.wheel}>
    {slots.map(offset=>{const absolute=position+offset,index=wrap(absolute,facts.length);return <RollItem key={absolute} absolute={absolute} progress={progress} side="value" active={offset===0} reduced={reduced}><strong>{facts[index][1]}</strong></RollItem>})}
   </div>
   </div>
  </div>
  <p className={styles.scrollHint}><span aria-live="polite" aria-atomic="true">{current+1} / {facts.length}</span><span>Scroll to explore details <Icon name="arrowDown"/></span></p>
  <div className={styles.all}><button type="button" className={styles.viewAll} onClick={()=>{dialogRef.current.showModal();setDialogOpen(true)}}>View all</button></div>
  <dialog ref={dialogRef} className={styles.dialog+' project-dialog'} aria-labelledby="all-project-specifications-title" onClose={()=>setDialogOpen(false)} onClick={event=>{if(event.target===dialogRef.current)dialogRef.current.close()}}>
   <header><div><span className="eyebrow">THE FINER DETAILS</span><h3 id="all-project-specifications-title">All project specifications</h3></div><button type="button" className="project-dialog-close" aria-label="Close specifications" onClick={()=>dialogRef.current.close()}><Icon name="x"/></button></header>
   <div className={styles.dialogBody}><dl>{facts.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>
  </dialog>
 </div></div></>;
}

// Both sides derive their position from the same scroll clock, avoiding competing springs.
function RollItem({absolute,progress,side,active,reduced,children}){
 const distance=useTransform(progress,value=>absolute-(reduced?Math.round(value):value));
 const y=useTransform(distance,value=>`calc(${value*(side==='label'?-1:1)} * var(--roll-step))`);
 const x=useTransform(distance,value=>Math.abs(value)*(side==='label'?-20:36));
 const rotateX=useTransform(distance,value=>reduced?0:value*(side==='label'?12:-14));
 const scale=useTransform(distance,value=>{const away=Math.min(2,Math.abs(value));return 1-away*.26+(reduced?0:.025*Math.max(0,1-away/.18))});
 const opacity=useTransform(distance,value=>Math.max(0,1-Math.abs(value)*.82));
 return <motion.div className={side==='label'?styles.labelItem:styles.item} aria-hidden={!active} data-active={active} style={{y,x,rotateX,scale,opacity,zIndex:active?3:1}}>{children}</motion.div>;
}
