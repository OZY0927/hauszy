'use client';
import {useEffect,useState} from 'react';
import Icon from './Icon';

export default function BackToTop(){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  const update=()=>setVisible(window.scrollY>600);
  update();window.addEventListener('scroll',update,{passive:true});
  return ()=>window.removeEventListener('scroll',update);
 },[]);
 function goToTop(){
  document.getElementById('project-listing-title')?.focus({preventScroll:true});
  window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
 return visible?<button type="button" className="listing-back-to-top" onClick={goToTop}><Icon name="arrowUp"/><span>Back to top</span></button>:null;
}
