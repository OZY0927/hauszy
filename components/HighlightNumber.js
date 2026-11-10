'use client';
import {useEffect,useRef,useState} from 'react';

// Keep the final value readable to assistive technology; only the visual digits roll.
export default function HighlightNumber({value}){
 const element=useRef(null),[entered,setEntered]=useState(false);
 const text=String(value);
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setEntered(true);observer.disconnect()}},{threshold:.4});
  if(element.current)observer.observe(element.current);
  return()=>observer.disconnect();
 },[]);
 let digit=0;
 return <strong ref={element} className={'highlight-number'+(entered?' is-rolling':'')} aria-label={text}><span aria-hidden="true">{[...text].map((character,index)=>/\d/.test(character)?<span key={index} className="highlight-digit" style={{'--digit':Number(character),'--digit-delay':Math.min(digit++,6)*65+'ms'}}><span className="highlight-digit-track">{Array.from({length:20},(_,i)=><span key={i}>{i%10}</span>)}</span></span>:<span key={index}>{character}</span>)}</span></strong>;
}
