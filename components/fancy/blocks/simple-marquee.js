// Adapted from Fancy Components Simple Marquee by Daniel Petho.
'use client';
import {useEffect,useRef,useState} from 'react';
import {motion,useAnimationFrame,useMotionValue,useSpring,useTransform,useReducedMotion,useScroll,useVelocity} from 'motion/react';

const wrap=(min,max,value)=>((((value-min)%(max-min))+(max-min))%(max-min))+min;

export default function SimpleMarquee({children,className='',direction='left',baseVelocity=2,slowdownOnHover=true,slowDownFactor=0,paused=false,repeat=3,useScrollVelocity=false,scrollAwareDirection=false,scrollContainer,scrollSpringConfig={damping:50,stiffness:400},slowDownSpringConfig={damping:60,stiffness:300}}){
 const root=useRef(null),hovered=useRef(false),focused=useRef(false),visible=useRef(false);
 const [pageVisible,setPageVisible]=useState(true);
 const [copies,setCopies]=useState(repeat);
 const reducedMotion=useReducedMotion();
 const position=useMotionValue(0),hoverFactor=useMotionValue(1);
 const smoothHover=useSpring(hoverFactor,slowDownSpringConfig);
 const {scrollY}=useScroll(scrollContainer?{container:scrollContainer}:{});
 const velocity=useVelocity(scrollY);
 const smoothVelocity=useSpring(velocity,scrollSpringConfig);
 const scrollDirection=useRef(1);
 const x=useTransform(position,value=>`${wrap(0,-100,value)}%`);
 useEffect(()=>{
  const observer=new IntersectionObserver(entries=>{visible.current=entries.some(entry=>entry.isIntersecting)},{rootMargin:'100px'});
  observer.observe(root.current);
  const measure=()=>{
   const group=root.current.firstElementChild;
   if(group?.offsetWidth)setCopies(repeat===1?1:Math.max(repeat,Math.ceil(root.current.clientWidth/group.offsetWidth)+1));
  };
  const resize=new ResizeObserver(measure);
  resize.observe(root.current);if(root.current.firstElementChild)resize.observe(root.current.firstElementChild);measure();
  const visibility=()=>setPageVisible(!document.hidden);
  visibility();document.addEventListener('visibilitychange',visibility);
  return()=>{observer.disconnect();resize.disconnect();document.removeEventListener('visibilitychange',visibility)};
 },[repeat]);
 useEffect(()=>{root.current.querySelectorAll('[data-marquee-copy] a,[data-marquee-copy] button').forEach(element=>{element.tabIndex=-1})},[copies,children]);
 useAnimationFrame((_,delta)=>{
  if(paused||reducedMotion||!pageVisible||!visible.current||focused.current)return;
  hoverFactor.set(hovered.current&&slowdownOnHover?slowDownFactor:1);
  const speed=smoothVelocity.get();
  if(scrollAwareDirection&&Math.abs(speed)>5)scrollDirection.current=speed<0?-1:1;
  const boost=useScrollVelocity?1+Math.min(Math.abs(speed)/200,5):1;
  position.set(position.get()+(direction==='left'?-1:1)*scrollDirection.current*baseVelocity*boost*(Math.min(delta,64)/1000)*smoothHover.get());
 });
 return <div ref={root} className={'fancy-simple-marquee '+className} onMouseEnter={()=>{hovered.current=true}} onMouseLeave={()=>{hovered.current=false}} onFocusCapture={()=>{focused.current=true}} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))focused.current=false}}>
  {Array.from({length:copies},(_,index)=><motion.div className="fancy-simple-marquee-group" key={index} style={{x:reducedMotion?0:x}} aria-hidden={index>0?true:undefined} data-marquee-copy={index>0?'':undefined}>{children}</motion.div>)}
 </div>;
}
