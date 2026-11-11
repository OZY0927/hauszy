// Adapted from Project Deck, designed and built by Aakash Mehra.
'use client';
import {Children,useEffect,useRef,useState} from 'react';
import {motion,useScroll,useSpring,useTransform,useMotionValueEvent} from 'motion/react';
import styles from './scroll-stacking-cards.module.css';

const clamp=value=>Math.min(1,Math.max(0,value));
const arrived=(index,value,count)=>index===0?1:1-(1-clamp((value*Math.max(1,count-1)-(index-1))/.72))**3;

export function ProjectDeck({children}){
 const cards=Children.toArray(children),count=cards.length;
 const deck=useRef(null);
 const [enabled,setEnabled]=useState(false);
 const [fit,setFit]=useState(1);
 const [front,setFront]=useState(0);
 const {scrollYProgress}=useScroll({target:deck,offset:['start start','end end']});
 const progress=useSpring(scrollYProgress,{stiffness:380,damping:48,mass:.35});
 useMotionValueEvent(progress,'change',value=>{let next=0;for(let index=1;index<count;index++)if(arrived(index,value,count)>=.5)next=index;setFront(previous=>previous===next?previous:next)});
 useEffect(()=>{
  const media=matchMedia('(min-width:851px) and (min-height:500px) and (prefers-reduced-motion:no-preference)');
  const measure=()=>{
   const contents=[...deck.current.querySelectorAll('[data-deck-content]')];
   const tallest=Math.max(1,...contents.map(element=>element.offsetHeight));
   setFit(Math.min(1,(innerHeight-150)/tallest));
   setEnabled(count>1&&media.matches);
  };
  const observer=new ResizeObserver(measure);
  deck.current.querySelectorAll('[data-deck-content]').forEach(element=>observer.observe(element));
  media.addEventListener('change',measure);window.addEventListener('resize',measure);measure();
  return()=>{observer.disconnect();media.removeEventListener('change',measure);window.removeEventListener('resize',measure)};
 },[count]);
 return <div ref={deck} className={styles.deck} data-enabled={enabled} style={{height:enabled?`${count*100}svh`:undefined}}>
  <div className={styles.stage}>{cards.map((card,index)=><DeckCard key={card.key??index} index={index} count={count} progress={progress} enabled={enabled} fit={fit} active={front===index}>{card}</DeckCard>)}</div>
 </div>;
}

function DeckCard({children,index,count,progress,enabled,fit,active}){
 const pose=useTransform(progress,value=>{
  let above=0;
  for(let next=index+1;next<count&&above<3;next++)above+=arrived(next,value,count);
  return {entered:arrived(index,value,count),above:Math.min(3,above)};
 });
 const y=useTransform(pose,({entered,above})=>`${(1-entered)*108-above*5}svh`);
 const rotateX=useTransform(pose,({entered,above})=>-(1-entered)*30+above*5);
 const scale=useTransform(pose,({entered,above})=>(.9+.1*entered-above*.05)*fit);
 const filter=useTransform(pose,({entered,above})=>`blur(${((1-entered)**2*6+above*.5).toFixed(2)}px)`);
 const dim=useTransform(pose,({above})=>above*.15);
 return <motion.div className={styles.card} style={{zIndex:index+1,...(enabled?{y,rotateX,scale,filter}:{})}} inert={enabled&&!active?true:undefined} aria-hidden={enabled&&!active?true:undefined}>
  <div className={styles.content} data-deck-content>{children}<motion.div className={styles.shade} aria-hidden="true" style={{opacity:enabled?dim:0}}/></div>
 </motion.div>;
}
