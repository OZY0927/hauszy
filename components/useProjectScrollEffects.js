'use client';
import {useLayoutEffect} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {sectionTransitions} from '../lib/section-transitions';

// One owner for page reveals; the hero, intro and facility scenes own their scrubs.
export default function useProjectScrollEffects(root,ready){
 useLayoutEffect(()=>{
  if(!ready||!root.current)return;
  gsap.registerPlugin(ScrollTrigger);
  const page=root.current,media=gsap.matchMedia();
  let disposed=false,refreshFrame=0,refreshTimer=0;
  media.add({motion:'(prefers-reduced-motion: no-preference)',desktop:'(min-width: 851px)'},context=>{
   if(!context.conditions.motion)return;
   const desktop=context.conditions.desktop;
   const cleanChapters=sectionTransitions(page,{titles:'.project-story-section-heading h2,.layout-studio-heading h2,.project-story-contact-copy h2',sections:'#project-photos,#details,#maintenance,#showroom,.project-story-contact',desktop});
   const reveal=(target,vars={})=>{
    // Never hide content already visible after hydration/history restoration.
    if(target.getBoundingClientRect().top<innerHeight*.94)return;
    gsap.from(target,{y:desktop?38:20,opacity:0,duration:.85,ease:'power3.out',...vars,
     scrollTrigger:{trigger:target,start:'top 92%',once:true},clearProps:'transform,opacity,clipPath'});
   };
   page.querySelectorAll('.project-story-section-heading .eyebrow,.project-story-section-note,.layout-studio-heading>p').forEach(el=>reveal(el,{y:18}));
   page.querySelectorAll('#details .property-facts,.project-story-charges .property-facts').forEach(list=>{
    if(list.getBoundingClientRect().top<innerHeight*.94)return;
    gsap.from(list.children,{y:24,opacity:0,stagger:.065,duration:.65,ease:'power2.out',clearProps:'transform,opacity',scrollTrigger:{trigger:list,start:'top 88%',once:true}});
   });
   const note=page.querySelector('.project-details-intro-note');
   if(note)reveal(note,{y:16,duration:.7});
   page.querySelectorAll('.project-story-highlights-inner>div').forEach((el,index)=>reveal(el,{y:35,scale:.92,delay:index*.07}));
   page.querySelectorAll('.project-story-contact-copy>p,.project-story-contact-copy>.eyebrow,.enquiry-card').forEach(el=>reveal(el));
   page.querySelectorAll('.location-atlas-heading,.location-atlas-address').forEach(el=>reveal(el,{x:desktop?-25:0,y:15}));
   const categories=page.querySelector('.location-atlas-categories');
   if(categories&&categories.getBoundingClientRect().top>=innerHeight*.94)gsap.from(categories.children,{x:-22,opacity:0,duration:.65,stagger:.07,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{trigger:categories,start:'top 90%',once:true}});
   page.querySelectorAll('.showroom-grid>button').forEach((el,index)=>reveal(el,{rotation:desktop?(index%2?2:-2):0,scale:.96,delay:Math.min(index,4)*.06}));
   return cleanChapters;
  },page);
  const refresh=()=>{
   if(disposed)return;
   clearTimeout(refreshTimer);
   refreshTimer=setTimeout(()=>{
    if(disposed)return;
    cancelAnimationFrame(refreshFrame);
    refreshFrame=requestAnimationFrame(()=>{if(!disposed)ScrollTrigger.refresh(true)});
   },180);
  };
  // Motion decks and responsive lists change page height after hydration.
  let lastHeight=page.offsetHeight;
  const resize=new ResizeObserver(()=>{const height=page.offsetHeight;if(height!==lastHeight){lastHeight=height;refresh()}});
  resize.observe(page);
  page.addEventListener('load',refresh,true);document.fonts?.ready.then(refresh);refresh();
  return()=>{disposed=true;clearTimeout(refreshTimer);cancelAnimationFrame(refreshFrame);resize.disconnect();page.removeEventListener('load',refresh,true);media.revert()};
 },[root,ready]);
}
