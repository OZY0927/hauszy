'use client';
import {useEffect} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {sectionTransitions} from '../lib/section-transitions';

// One owner for page reveals; the hero, intro and facility scenes own their scrubs.
export default function useProjectScrollEffects(root,ready){
 useEffect(()=>{
  if(!ready||!root.current)return;
  gsap.registerPlugin(ScrollTrigger);
  const page=root.current,media=gsap.matchMedia();
  let disposed=false,refreshFrame=0;
  media.add({motion:'(prefers-reduced-motion: no-preference)',desktop:'(min-width: 801px)'},context=>{
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
   page.querySelectorAll('#details .property-facts,.project-story-charges .property-facts,.layout-studio-facts').forEach(list=>{
    if(list.getBoundingClientRect().top<innerHeight*.94)return;
    gsap.from(list.children,{y:24,opacity:0,stagger:.065,duration:.65,ease:'power2.out',clearProps:'transform,opacity',scrollTrigger:{trigger:list,start:'top 88%',once:true}});
   });
   page.querySelectorAll('.project-editorial-photo').forEach(photo=>{
    reveal(photo,{clipPath:'inset(12% 5% 12% 5%)',y:0,duration:1.15});
    const image=photo.querySelector('img');
    if(desktop&&image)gsap.fromTo(image,{scale:1.16,yPercent:-3},{scale:1.02,yPercent:3,ease:'none',scrollTrigger:{trigger:photo,start:'top bottom',end:'bottom top',scrub:.8}});
   });
   page.querySelectorAll('.project-story-highlights-inner>div').forEach((el,index)=>reveal(el,{y:35,scale:.92,delay:index*.07}));
   page.querySelectorAll('.layout-studio-detail-heading,.layout-studio-price,.project-story-contact-copy>p,.project-story-contact-copy>.eyebrow,.enquiry-card').forEach(el=>reveal(el));
   page.querySelectorAll('.layout-studio-drawing').forEach(el=>reveal(el,{y:24,clipPath:'inset(8% 0 8% 0)',duration:1}));
   page.querySelectorAll('.location-atlas-heading,.location-atlas-address').forEach(el=>reveal(el,{x:desktop?-25:0,y:15}));
   const categories=page.querySelector('.location-atlas-categories');
   if(categories&&categories.getBoundingClientRect().top>=innerHeight*.94)gsap.from(categories.children,{x:-22,opacity:0,duration:.65,stagger:.07,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{trigger:categories,start:'top 90%',once:true}});
   page.querySelectorAll('.showroom-grid>button').forEach((el,index)=>reveal(el,{rotation:desktop?(index%2?2:-2):0,scale:.96,delay:Math.min(index,4)*.06}));
   return cleanChapters;
  },page);
  const refresh=()=>{if(disposed)return;cancelAnimationFrame(refreshFrame);refreshFrame=requestAnimationFrame(()=>{if(!disposed)ScrollTrigger.refresh()})};
  // Images and fonts change trigger measurements after hydration.
  page.addEventListener('load',refresh,true);document.fonts?.ready.then(refresh);refresh();
  return()=>{disposed=true;cancelAnimationFrame(refreshFrame);page.removeEventListener('load',refresh,true);media.revert()};
 },[root,ready]);
}
