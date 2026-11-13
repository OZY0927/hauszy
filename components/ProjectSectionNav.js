'use client';
import {useEffect,useRef,useState} from 'react';
import Icon from './Icon';
import useProjectScrollEffects from './useProjectScrollEffects';
import {prepareProjectImages} from '../lib/project-image-preload';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

// Hold imperative reveal mutations until React has hydrated the project content.
export function ProjectStory({children,previewImages=[]}){
 const [ready,setReady]=useState(false);
 const story=useRef(null);
 useEffect(()=>{
  let cancelled=false;
  // Lazy loading cannot predict images entering through transformed/pinned scenes.
  story.current.querySelectorAll('img').forEach(image=>{if(!image.closest('dialog,#keep-exploring'))image.loading='eager'});
  prepareProjectImages(previewImages).then(()=>{if(!cancelled&&story.current)story.current.dataset.imagesReady='true'});
  return()=>{cancelled=true};
 },[previewImages]);
 useEffect(()=>setReady(true),[]);
 useProjectScrollEffects(story,ready);
 return <main ref={story} className="project-story" data-motion-pending={ready?undefined:''}>{children}</main>;
}

export default function ProjectSectionNav({sections,enquiry}){
 const [active,setActive]=useState(sections[0]?.[0]||''),[visible,setVisible]=useState(false);
 const links=useRef(null);
 const navigation=useRef(null);
 const arrival=useRef(null);
 useEffect(()=>()=>arrival.current?.cancel(),[]);
 function jump(event,id){
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const target=document.getElementById(id);if(!target)return;
  event.preventDefault();arrival.current?.cancel();
  setActive(id);
  history.pushState(history.state,'','#'+id);
  // Jump over the intervening pinned scenes, then slide only the destination in.
  const margin=parseFloat(getComputedStyle(target).scrollMarginTop)||80;
  window.scrollTo({top:Math.max(0,window.scrollY+target.getBoundingClientRect().top-margin),behavior:'instant'});
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.update();
  for(const trigger of ScrollTrigger.getAll()){
   trigger.getTween()?.progress(1);
   if(!trigger.vars.scrub&&trigger.trigger&&target.contains(trigger.trigger)&&trigger.isActive)trigger.animation?.progress(1);
  }
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)arrival.current=target.animate([{opacity:.65,translate:'0 20px'},{opacity:1,translate:'0 0'}],{duration:360,easing:'cubic-bezier(.22,1,.36,1)'});
 }
 useEffect(()=>{
  let frame=0;
  const update=()=>{frame=0;const shell=document.querySelector('.project-story');if(!shell)return;const rect=shell.getBoundingClientRect(),hero=shell.querySelector('.project-hero-scroll');setVisible((hero?hero.getBoundingClientRect().bottom<innerHeight*.6:window.scrollY>120)&&rect.bottom>140);navigation.current?.style.setProperty('--project-progress',Math.max(0,Math.min(1,-rect.top/Math.max(1,shell.offsetHeight-innerHeight))).toFixed(4))};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  const observer=new IntersectionObserver(entries=>{const current=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(current)setActive(current.target.id)},{rootMargin:'-15% 0px -55% 0px',threshold:0});
  for(const [id] of sections){const target=document.getElementById(id);if(target)observer.observe(target)}
  if(enquiry){const target=document.getElementById('enquiry');if(target)observer.observe(target)}
  update();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
  return()=>{observer.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule)};
 },[sections,enquiry]);
 useEffect(()=>{
  const scroller=links.current,item=scroller?.querySelector('[aria-current="location"]');
  if(!scroller||!item)return;
  if(item.offsetLeft<scroller.scrollLeft||item.offsetLeft+item.offsetWidth>scroller.scrollLeft+scroller.clientWidth)scroller.scrollTo({left:item.offsetLeft-scroller.clientWidth/2+item.offsetWidth/2,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 },[active]);
 if(!sections.length&&!enquiry)return null;
 return <nav ref={navigation} className={'project-section-nav'+(visible?' is-visible':'')} aria-label="Project sections" inert={!visible}>
  <div className="project-section-links" ref={links}>{sections.map(([id,label])=><a key={id} href={'#'+id} aria-current={active===id?'location':undefined} onClick={event=>jump(event,id)}>{label}</a>)}</div>
  {enquiry&&<a className="project-section-enquire" href="#enquiry" aria-current={active==='enquiry'?'location':undefined} onClick={event=>jump(event,'enquiry')}>Enquire <Icon name="arrowUpRight"/></a>}
 </nav>;
}
