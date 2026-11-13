'use client';
import {useEffect,useRef} from 'react';
import {useMotionValueEvent} from 'motion/react';
import {PROJECT_LOADING_IMAGES} from '../lib/project-loading-icons';
import styles from './LayoutAtmosphere.module.css';

const ICONS=[
 {name:'bridge',position:'bridge'},
 {name:'komtar',position:'tower'},
 {name:'tree',position:'tree'},
 {name:'penangHill',position:'hill'},
 {name:'chineseTemple',position:'temple'},
 {name:'heritageHouse',position:'house',front:true},
 {name:'trishaw',position:'trishaw',front:true},
];

export default function LayoutAtmosphere({progress,foregroundZ}){
 const root=useRef(null);
 useMotionValueEvent(progress,'change',value=>root.current?.style.setProperty('--scene-progress',String(value-.5)));
 useEffect(()=>{
  const el=root.current,stage=el.closest('[data-layout-scene]');
  const desktop=matchMedia('(min-width:1101px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  let frame=0,x=0,y=0,targetX=0,targetY=0;
  const tick=()=>{
   x+=(targetX-x)*.09;y+=(targetY-y)*.09;
   el.style.setProperty('--pointer-x',x.toFixed(4));el.style.setProperty('--pointer-y',y.toFixed(4));
   frame=Math.abs(targetX-x)+Math.abs(targetY-y)>.001?requestAnimationFrame(tick):0;
  };
  const wake=()=>{if(!frame)frame=requestAnimationFrame(tick)};
  const move=event=>{if(!desktop.matches||event.pointerType!=='mouse')return;targetX=event.clientX/innerWidth*2-1;targetY=event.clientY/innerHeight*2-1;wake()};
  const reset=()=>{targetX=0;targetY=0;wake()};
  const observer=new IntersectionObserver(entries=>{
   const visible=entries.some(entry=>entry.isIntersecting);el.dataset.visible=String(visible);
   if(!visible){cancelAnimationFrame(frame);frame=0;x=y=targetX=targetY=0;el.style.setProperty('--pointer-x','0');el.style.setProperty('--pointer-y','0')}
  });
  observer.observe(stage);stage.addEventListener('pointermove',move,{passive:true});stage.addEventListener('pointerleave',reset);desktop.addEventListener('change',reset);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerleave',reset);desktop.removeEventListener('change',reset)};
 },[]);
 return <div ref={root} className={styles.scene} aria-hidden="true">
  {[false,true].map(front=><div key={String(front)} className={styles.layer} style={{zIndex:front?foregroundZ:0}}>
   {ICONS.filter(icon=>!!icon.front===front).map(icon=><span key={icon.name} className={`${styles.anchor} ${styles[icon.position]}`}>
    <span className={styles.parallax}><span className={styles.float}><img src={PROJECT_LOADING_IMAGES[icon.name]} width={160} height={160} alt="" loading="lazy" decoding="async" draggable={false}/></span></span>
   </span>)}
  </div>)}
 </div>;
}
