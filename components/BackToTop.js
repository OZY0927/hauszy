'use client';
import {useEffect,useState} from 'react';
import Icon from './Icon';

export default function BackToTop(){
 const [visible,setVisible]=useState(false),[progress,setProgress]=useState(0);
 useEffect(()=>{
  let frame=0;const update=()=>{frame=0;setVisible(window.scrollY>600);const distance=document.documentElement.scrollHeight-window.innerHeight;setProgress(distance>0?Math.min(1,Math.max(0,window.scrollY/distance)):0)};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};update();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
  return ()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule)};
 },[]);
 function goToTop(){
  document.getElementById('project-listing-title')?.focus({preventScroll:true});
  window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
 return visible?<button type="button" className="listing-back-to-top" onClick={goToTop} aria-label="Back to top"><svg className="back-top-progress" viewBox="0 0 64 64" aria-hidden="true"><circle className="back-top-track" cx="32" cy="32" r="28"/><circle className="back-top-value" cx="32" cy="32" r="28" pathLength="100" style={{strokeDashoffset:100-progress*100}}/></svg><Icon name="arrowUp"/><span className="back-top-label" aria-hidden="true">Back to top</span></button>:null;
}
