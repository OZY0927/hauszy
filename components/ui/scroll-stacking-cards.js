// Adapted from Project Deck, designed and built by Aakash Mehra.
'use client';
import {Children,useEffect,useRef,useState} from 'react';
import {motion,useScroll,useTransform,useMotionValueEvent} from 'motion/react';
import styles from './scroll-stacking-cards.module.css';
import {layoutFront,layoutPose} from '../../lib/layout-deck';

export function ProjectDeck({children}){
 const cards=Children.toArray(children),count=cards.length;
 const deck=useRef(null);
 const [enabled,setEnabled]=useState(false);
 const [fit,setFit]=useState(1);
 const [cardHeight,setCardHeight]=useState(0);
 const [front,setFront]=useState(0);
 const {scrollYProgress}=useScroll({target:deck,offset:['start start','end end']});
 // Direct scroll progress keeps reversal, fast scrolling and unpinning in sync.
 const progress=scrollYProgress;
 useMotionValueEvent(progress,'change',value=>{const next=layoutFront(value,count);setFront(previous=>previous===next?previous:next)});
 useEffect(()=>{
  const media=matchMedia('(min-width:851px) and (min-height:500px) and (prefers-reduced-motion:no-preference)');
  let frame=0;
  const measure=()=>{
   frame=0;
   const contents=[...deck.current.querySelectorAll('[data-deck-content] > article')];
   const tallest=Math.max(1,...contents.map(element=>element.offsetHeight));
   setCardHeight(tallest);
   setFit(Math.min(1,(innerHeight-136)/tallest));
   setEnabled(count>1&&media.matches);
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(measure)};
  const observer=new ResizeObserver(schedule);
  deck.current.querySelectorAll('[data-deck-content] > article').forEach(element=>observer.observe(element));
  media.addEventListener('change',schedule);window.addEventListener('resize',schedule);measure();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();media.removeEventListener('change',schedule);window.removeEventListener('resize',schedule)};
 },[count]);
 return <div ref={deck} className={styles.deck} data-enabled={enabled} style={{height:enabled?`${count*100}svh`:undefined,'--deck-card-height':`${cardHeight}px`}}>
  <div className={styles.stage}>{cards.map((card,index)=><DeckCard key={card.key??index} index={index} count={count} progress={progress} enabled={enabled} fit={fit} active={front===index}>{card}</DeckCard>)}</div>
 </div>;
}

function DeckCard({children,index,count,progress,enabled,fit,active}){
 const pose=useTransform(progress,value=>layoutPose(index,value,count));
 const y=useTransform(pose,({entered,above})=>`calc(${(1-entered)*108}svh - ${above*18}px)`);
 const rotateX=useTransform(pose,({entered})=>-(1-entered)*22);
 const scale=useTransform(pose,({entered,above})=>(.9+.1*entered-above*.05)*fit);
 const filter=useTransform(pose,({entered,above})=>`blur(${((1-entered)**2*3+above*.3).toFixed(2)}px)`);
 const opacity=useTransform(pose,({entered})=>index===0?1:Math.min(1,entered*5));
 const dim=useTransform(pose,({above})=>above*.15);
 return <motion.div className={styles.card} style={{zIndex:index+1,...(enabled?{y,rotateX,scale,filter,opacity}:{y:0,rotateX:0,scale:1,opacity:1,filter:'none'})}} inert={enabled&&!active?true:undefined} aria-hidden={enabled&&!active?true:undefined}>
  <div className={styles.content} data-deck-content>{children}<motion.div className={styles.shade} aria-hidden="true" style={{opacity:enabled?dim:0}}/></div>
 </motion.div>;
}
