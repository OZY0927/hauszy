'use client';
import {useEffect,useRef,useState} from 'react';
import Icon from './Icon';

// Hold imperative reveal mutations until React has hydrated the project content.
export function ProjectStory({children}){
 const [ready,setReady]=useState(false);
 const story=useRef(null);
 useEffect(()=>setReady(true),[]);
 // Use the tightest column to size every highlight together.
 useEffect(()=>{
  if(!ready)return;
  const group=story.current?.querySelector('.project-story-highlights-inner');
  if(!group)return;
  let disposed=false,frame=0,lastWidth=-1;
  const fit=()=>{
   frame=0;if(disposed)return;
   group.style.removeProperty('--highlight-size');
   const numbers=[...group.querySelectorAll('.highlight-number')];
   let sharedSize=Infinity;
   for(const el of numbers){const available=el.clientWidth,content=el.firstElementChild?.getBoundingClientRect().width||0,size=parseFloat(getComputedStyle(el).fontSize);if(available>0&&content>0)sharedSize=Math.min(sharedSize,size*Math.min(1,available/content))}
   if(Number.isFinite(sharedSize))group.style.setProperty('--highlight-size',sharedSize+'px');
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(fit)};
  fit();
  const observer='ResizeObserver' in window?new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(width!==lastWidth){lastWidth=width;schedule()}}):null;
  observer?.observe(group);window.addEventListener('resize',schedule);
  document.fonts?.ready.then(()=>{if(!disposed)schedule()});
  return()=>{disposed=true;observer?.disconnect();cancelAnimationFrame(frame);window.removeEventListener('resize',schedule);group.style.removeProperty('--highlight-size')};
 },[ready]);
 useEffect(()=>{
  if(!ready||!story.current||!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const targets=story.current.querySelectorAll('.project-story-section-heading,.project-overview-panel,.project-story-at-a-glance>div,#details .property-facts>div,.project-editorial-gallery,.project-story-unit-copy,.project-story-unit .floorplan-open,.project-story-location-grid,.project-story-charges .property-facts>div,.project-story-showroom .showroom-grid>button');
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('project-motion-visible');observer.unobserve(entry.target)}}},{threshold:.08,rootMargin:'0px 0px -30px 0px'});
  for(const el of targets){if(el.getBoundingClientRect().top<innerHeight-30)continue;const siblings=[...el.parentElement.children];el.style.setProperty('--project-stagger',Math.min(siblings.indexOf(el),5)*60+'ms');el.classList.add('project-motion-item');observer.observe(el)}
  return()=>{observer.disconnect();for(const el of targets){el.classList.remove('project-motion-item','project-motion-visible');el.style.removeProperty('--project-stagger')}};
 },[ready]);
 return <main ref={story} className="project-story" data-motion-pending={ready?undefined:''}>{children}</main>;
}

export default function ProjectSectionNav({sections,enquiry}){
 const [active,setActive]=useState(sections[0]?.[0]||''),[visible,setVisible]=useState(false);
 const links=useRef(null);
 const navigation=useRef(null);
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
  <div className="project-section-links" ref={links}>{sections.map(([id,label])=><a key={id} href={'#'+id} aria-current={active===id?'location':undefined} onClick={()=>setActive(id)}>{label}</a>)}</div>
  {enquiry&&<a className="project-section-enquire" href="#enquiry" aria-current={active==='enquiry'?'location':undefined} onClick={()=>setActive('enquiry')}>Enquire <Icon name="arrowUpRight"/></a>}
 </nav>;
}
