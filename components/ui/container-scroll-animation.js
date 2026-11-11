'use client';
import {useEffect,useRef,useState} from 'react';
import {motion,useScroll,useTransform,useReducedMotion} from 'motion/react';
import styles from './container-scroll-animation.module.css';

// Adapted from the supplied ContainerScroll example for Hauszy's Motion setup.
export function ContainerScroll({titleComponent,children}){
 const containerRef=useRef(null);
 const [isMobile,setIsMobile]=useState(false);
 const reducedMotion=useReducedMotion();
 const {scrollYProgress}=useScroll({target:containerRef,offset:['start end','center center']});
 useEffect(()=>{
  const media=matchMedia('(max-width:850px)');
  const update=()=>setIsMobile(media.matches);
  update();media.addEventListener('change',update);
  return()=>media.removeEventListener('change',update);
 },[]);
 const still=reducedMotion||isMobile;
 const rotate=useTransform(scrollYProgress,[0,1],[20,0]);
 const scale=useTransform(scrollYProgress,[0,1],[1.05,1]);
 const translate=useTransform(scrollYProgress,[0,1],[35,0]);
 return <div ref={containerRef} className={styles.container}>
  <div className={styles.perspective}>
   <motion.div className={styles.header} style={{y:still?0:translate}}>{titleComponent}</motion.div>
   <motion.div className={styles.card} style={{rotateX:still?0:rotate,scale:still?1:scale}}>
    <div className={styles.content}>{children}</div>
   </motion.div>
  </div>
 </div>;
}
